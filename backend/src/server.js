import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'node:fs';

import { connectDB } from './configs/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/authRouter.js';
import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import favoriteRouter from './routes/favoriteRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import orderRouter from './routes/orderRouter.js';

dotenv.config({ quiet: true });

for (const key of ['MONGO_URI', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../../frontend/dist');

// Render rulează în spatele unui proxy: fără asta, rate limiting-ul vede
// aceeași adresă IP pentru toți vizitatorii.
app.set('trust proxy', 1);

app.use(
  helmet({
    // Imaginile de produs vin de pe CDN-ul Pexels.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Fiecare directivă listează exact originile pe care pagina le folosește.
    // Implicitul Helmet permite orice sursă `https:` pentru stiluri și
    // fonturi, ceea ce face politica mult mai permisivă decât e nevoie.
    contentSecurityPolicy: isProd
      ? {
          directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            'img-src': ["'self'", 'data:', 'https://images.pexels.com'],
            'script-src': ["'self'"],
            // API-ul e servit de același proces, deci nu există cereri
            // către alte origini.
            'connect-src': ["'self'"],
            // 'unsafe-inline' e necesar pentru stilurile pe care React le
            // aplică pe elemente; sursa externă e doar Google Fonts.
            'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
            'frame-ancestors': ["'none'"],
          },
        }
      : false,
  })
);

if (!isProd) {
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
}

// Limita pe corp: fără ea, un singur POST poate ocupa memoria procesului.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', uptime: process.uptime() })
);

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/orders', orderRouter);

if (isProd) {
  const indexFile = path.join(distPath, 'index.html');

  if (fs.existsSync(indexFile)) {
    // Fișierele cu hash în nume pot fi memorate agresiv; index.html niciodată,
    // altfel utilizatorii rămân blocați pe o versiune veche după deploy.
    app.use(
      express.static(distPath, {
        maxAge: '1y',
        index: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('/{*splat}', (req, res) => res.sendFile(indexFile));
  } else {
    console.error('frontend/dist/index.html not found — run the frontend build');
  }
}

app.use('/api', notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
});
