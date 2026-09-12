# TV-Maxx

Magazin online de televizoare, construit pe stiva MERN. Catalog cu filtrare și
căutare pe server, coș cu cantități, comenzi persistate, recenzii cu notă
agregată, trei limbi și temă deschisă/închisă.

> Mărcile și denumirile de produs sunt fictive. Fotografiile provin de pe
> [Pexels](https://www.pexels.com/license/), care permite folosirea gratuită.

## Stiva

**Frontend** — React 19, Vite 7, Tailwind CSS 4, React Router 7, i18next, axios
**Backend** — Node 20+, Express 5, MongoDB cu Mongoose 8, JWT, Zod, Helmet

## Pornire locală

Ai nevoie de Node 20 sau mai nou și de o bază de date MongoDB (locală sau Atlas)

```bash
git clone https://github.com/vitalielozan/E-Commerce.git
cd E-Commerce

# Backend
cd backend
npm install
npm run dev               # http://localhost:5000

# Frontend, într-un al doilea terminal
cd frontend
npm install
npm run dev               # http://localhost:5173
```

`JWT_SECRET` se generează cu `openssl rand -base64 48`.

### Popularea catalogului

Baza de date pornește goală. Cele 44 de produse sunt în
`backend/src/seed/products.json` și se încarcă astfel:

```bash
cd backend
npm run seed              # dry-run: arată ce s-ar scrie, fără să modifice
npm run seed:apply        # scrie în baza de date
```

Produsele sunt identificate prin `slug`, deci scriptul poate fi rulat de câte
ori e nevoie fără să creeze duplicate. Recenziile și notele existente nu sunt
atinse.

Opțiuni suplimentare:

```bash
node src/seed/seed.js --apply --refresh-images   # galerii noi de pe Pexels
node src/seed/seed.js --apply --prune            # șterge produsele care nu mai
                                                 # sunt în products.json
```

`--refresh-images` are nevoie de `PEXELS_API_KEY` în `.env` (cheie gratuită de
la [pexels.com/api](https://www.pexels.com/api/)). Fără ea, galeriile rămân
cele din fișier.

## Comenzi

| Comandă          | Unde               | Ce face                                                 |
| ---------------- | ------------------ | ------------------------------------------------------- |
| `npm run dev`    | backend / frontend | Pornește cu reîncărcare la modificare                   |
| `npm run build`  | rădăcină           | Instalează ambele pachete și compilează frontendul      |
| `npm start`      | rădăcină           | Pornește serverul, care servește și frontendul compilat |
| `npm test`       | backend            | Rulează testele de validare                             |
| `npm run lint`   | frontend           | ESLint                                                  |
| `npm run format` | frontend           | Prettier                                                |

## API

Toate rutele sunt sub `/api`. Cele marcate cu 🔒 cer antetul
`Authorization: Bearer <token>`.

### Autentificare

| Metodă | Rută                      | Descriere                                  |
| ------ | ------------------------- | ------------------------------------------ |
| POST   | `/auth/register`          | Cont nou; întoarce token                   |
| POST   | `/auth/login`             | Autentificare; întoarce token              |
| GET    | `/auth/me` 🔒             | Utilizatorul curent                        |
| PATCH  | `/auth/checkout-prefs` 🔒 | Salvează adresele pentru comanda următoare |

### Produse

| Metodă | Rută                    | Descriere                                        |
| ------ | ----------------------- | ------------------------------------------------ |
| GET    | `/products`             | Listare cu filtre, sortare și paginare           |
| GET    | `/products/facets`      | Mărci, diagonale și interval de preț disponibile |
| GET    | `/products/:id`         | Un produs, după id sau slug                      |
| GET    | `/products/:id/related` | Produse asemănătoare                             |

Parametri acceptați de `/products`: `q`, `brand` (mai multe, separate prin
virgulă), `category`, `minPrice`, `maxPrice`, `minSize`, `maxSize`,
`sort` (`newest` \| `priceAsc` \| `priceDesc` \| `rating` \| `relevance`),
`page`, `limit` (maximum 48).

### Coș, favorite, recenzii, comenzi

| Metodă         | Rută                    | Descriere                         |
| -------------- | ----------------------- | --------------------------------- |
| GET / POST     | `/cart` 🔒              | Citește coșul / adaugă un produs  |
| PATCH / DELETE | `/cart/:id` 🔒          | Schimbă cantitatea / scoate linia |
| GET / POST     | `/favorites` 🔒         | Listă / adăugare                  |
| POST           | `/favorites/to-cart` 🔒 | Mută un favorit în coș            |
| GET            | `/reviews/:productId`   | Recenziile unui produs            |
| POST / DELETE  | `/reviews` 🔒           | Adaugă / șterge propria recenzie  |
| POST / GET     | `/orders` 🔒            | Plasează o comandă / istoricul    |
| GET            | `/orders/:id` 🔒        | O comandă                         |

## Structură

```
backend/src
  configs/       conexiunea la bază
  models/        schemele Mongoose
  controllers/   logica rutelor + schemele Zod de intrare
  middleware/    autentificare, validare, tratarea erorilor
  routes/        definițiile rutelor
  seed/          migrarea catalogului
  utils/         ApiError, asyncHandler

frontend/src
  components/    componente reutilizabile
  pages/         câte un ecran per rută
  context/       Auth, Cart/Favorite, temă
  hooks/         acces la context, meta-datele paginii
  services/      client HTTP, căi API, imagini, formatare
  locales/       traduceri en / ro / de
```

## Decizii de implementare

**Coșul și favoritele sunt colecții separate**, legate prin `{user, product}`,
cu index unic pe pereche. Cantitatea stă pe linia de coș.

**Prețurile se recalculează pe server** la plasarea comenzii, din catalog.
Totalul trimis de client nu e folosit niciodată.

**Numărul cardului nu ajunge la server.** E validat în browser cu algoritmul
Luhn; către API pleacă doar ultimele patru cifre.

**Comenzile copiază titlul și prețul** din momentul cumpărării, ca o comandă
veche să rămână corectă după ce produsul se schimbă sau dispare.

**Imaginile sunt redimensionate prin CDN.** Fotografiile Pexels sunt cerute cu
lățimea potrivită contextului (`srcset` + `sizes`), în loc de originalul de
~1,8 MB.

## Licență

ISC.
