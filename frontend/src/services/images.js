/**
 * Imaginile de produs sunt găzduite pe CDN-ul Pexels, care acceptă parametri
 * de redimensionare în URL. Fără ei, fiecare fotografie ajunge la client în
 * rezoluție integrală: 1,82 MB pentru un card afișat la 300 px lățime.
 *
 * Cu `?auto=compress&cs=tinysrgb&w=400` aceeași imagine coboară la ~20 KB.
 */

const PEXELS_HOST = 'images.pexels.com';

// Lățimile pentru care generăm candidați în srcset. Browserul alege singur
// în funcție de lățimea reală de afișare și de densitatea ecranului.
const WIDTHS = [320, 480, 640, 960, 1280, 1600];

const isPexels = (url) => {
  try {
    return new URL(url).hostname.endsWith(PEXELS_HOST);
  } catch {
    return false;
  }
};

/** URL-ul imaginii la o lățime dată. Necunoscutele sunt returnate neatinse. */
export function imageUrl(src, width) {
  if (!src || !isPexels(src)) return src;

  const url = new URL(src);
  url.searchParams.set('auto', 'compress');
  url.searchParams.set('cs', 'tinysrgb');
  url.searchParams.set('w', String(width));
  return url.toString();
}

/** Atribut srcset cu toate lățimile disponibile. */
export function imageSrcSet(src) {
  if (!src || !isPexels(src)) return undefined;
  return WIDTHS.map((w) => `${imageUrl(src, w)} ${w}w`).join(', ');
}

/**
 * Proprietățile complete pentru un <img> responsiv.
 *
 * `sizes` descrie cât de lat va fi afișat elementul la fiecare breakpoint —
 * browserul are nevoie de asta ca să aleagă din srcset înainte să fi aplicat
 * CSS-ul.
 */
export function responsiveImage(src, { sizes, alt = '', eager = false } = {}) {
  return {
    src: imageUrl(src, 640),
    srcSet: imageSrcSet(src),
    sizes,
    alt,
    loading: eager ? 'eager' : 'lazy',
    // Prima imagine de pe pagină merită decodare sincronă: e cea care
    // definește Largest Contentful Paint.
    decoding: eager ? 'sync' : 'async',
    fetchPriority: eager ? 'high' : 'auto',
  };
}

/** Lățimi uzuale de afișare, ca `sizes` să nu fie rescris în fiecare pagină. */
export const SIZES = {
  card: '(min-width: 1280px) 300px, (min-width: 768px) 33vw, 90vw',
  hero: '(min-width: 1024px) 640px, 100vw',
  gallery: '(min-width: 1024px) 560px, 100vw',
  thumb: '96px',
  row: '(min-width: 768px) 160px, 40vw',
};
