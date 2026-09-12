/**
 * Populează catalogul de produse din `products.json`.
 *
 *   npm run seed          → dry-run, arată ce s-ar schimba
 *   npm run seed:apply    → scrie în baza de date
 *
 * Opțiuni:
 *   --refresh-images      aduce fotografii noi de galerie de la Pexels
 *                         (necesită PEXELS_API_KEY)
 *   --prune               șterge produsele care nu mai sunt în products.json
 *
 * Rularea e idempotentă: produsele sunt identificate prin `slug`, deci o a
 * doua rulare actualizează aceleași documente în loc să creeze duplicate.
 * Recenziile și notele agregate nu sunt atinse.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { connectDB } from '../configs/db.js';
import Product from '../models/Product.js';
import { buildGalleryPool } from './pexels.js';

dotenv.config({ quiet: true });

const APPLY = process.argv.includes('--apply');
const REFRESH_IMAGES = process.argv.includes('--refresh-images');
const PRUNE = process.argv.includes('--prune');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hash stabil: aceeași intrare dă mereu aceeași galerie, deci rulările
// repetate nu produc un catalog diferit.
const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

async function main() {
  const products = JSON.parse(
    await fs.readFile(path.join(__dirname, 'products.json'), 'utf8')
  );

  await connectDB();

  const existing = await Product.find({}, 'slug').lean();
  const existingSlugs = new Set(existing.map((p) => p.slug));

  const toCreate = products.filter((p) => !existingSlugs.has(p.slug));
  const toUpdate = products.filter((p) => existingSlugs.has(p.slug));
  const seedSlugs = new Set(products.map((p) => p.slug));
  const orphans = existing.filter((p) => !seedSlugs.has(p.slug));

  console.log(`Fișier sursă: ${products.length} produse`);
  console.log(`  de creat:     ${toCreate.length}`);
  console.log(`  de actualizat: ${toUpdate.length}`);
  if (orphans.length) {
    console.log(
      `  în bază dar nu în fișier: ${orphans.length}${PRUNE ? ' (vor fi șterse)' : ' (păstrate; --prune le șterge)'}`
    );
  }

  let pool = null;
  if (REFRESH_IMAGES) {
    console.log('\nSe aduc imagini de galerie...');
    pool = await buildGalleryPool(products.map((p) => p.image));
    console.log(`Pool: ${pool.length} imagini distincte.`);
  }

  const ops = products.map((product) => {
    const doc = { ...product };

    if (pool?.length) {
      const seed = hash(product.slug);
      const gallery = [product.image];
      for (let i = 0; gallery.length < 4 && i < pool.length; i++) {
        const candidate = pool[(seed + i * 7) % pool.length];
        if (!gallery.includes(candidate)) gallery.push(candidate);
      }
      doc.images = gallery;
    }

    return {
      updateOne: {
        filter: { slug: product.slug },
        // $setOnInsert pe rating: un produs deja existent își păstrează
        // recenziile, iar unul nou pornește de la zero.
        update: {
          $set: doc,
          $setOnInsert: { ratingAverage: 0, ratingCount: 0 },
        },
        upsert: true,
      },
    };
  });

  if (!APPLY) {
    console.log('\nExemplu:');
    products.slice(0, 3).forEach((p) => {
      console.log(`  ${p.brand.padEnd(8)} ${p.title}  —  ${p.price} EUR`);
    });
    console.log('\nDRY RUN — nimic nu a fost scris.');
    console.log('Rulează cu --apply pentru a aplica.');
    await mongoose.disconnect();
    return;
  }

  const result = await Product.bulkWrite(ops);
  console.log(
    `\nCreate: ${result.upsertedCount}  Actualizate: ${result.modifiedCount}`
  );

  if (PRUNE && orphans.length) {
    const removed = await Product.deleteMany({
      slug: { $in: orphans.map((p) => p.slug) },
    });
    console.log(`Șterse: ${removed.deletedCount}`);
  }

  // Indexurile (text, slug unic, compuse) se creează la prima sincronizare.
  await Product.syncIndexes();
  console.log('Indexuri sincronizate.');

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Popularea a eșuat:', error.message);
  process.exit(1);
});
