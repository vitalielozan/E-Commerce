/**
 * Construiește pool-ul de imagini folosit pentru galeriile de produs.
 *
 * Catalogul vechi avea 176 de sloturi de galerie umplute cu doar 5 fotografii
 * distincte — aceleași cinci pe toate produsele. Cu o cheie Pexels (gratuită,
 * de la pexels.com/api) aducem fotografii noi; fără ea refolosim imaginile
 * principale existente, care sunt deja 35 distincte.
 *
 * Toate fotografiile Pexels pot fi folosite gratuit, inclusiv comercial, fără
 * atribuire obligatorie: https://www.pexels.com/license/
 */

const QUERIES = [
  'television living room',
  'oled tv',
  'flat screen tv wall',
  'home cinema screen',
  'smart tv interior',
  'tv media console',
];

const PER_PAGE = 20;

export async function buildGalleryPool(fallbackImages = []) {
  const key = process.env.PEXELS_API_KEY;

  if (!key) {
    console.log(
      'PEXELS_API_KEY absentă — galeriile se construiesc din imaginile existente.'
    );
    return fallbackImages;
  }

  const collected = new Set();

  for (const query of QUERIES) {
    try {
      const url = new URL('https://api.pexels.com/v1/search');
      url.searchParams.set('query', query);
      url.searchParams.set('per_page', String(PER_PAGE));
      url.searchParams.set('orientation', 'landscape');

      const res = await fetch(url, { headers: { Authorization: key } });

      if (!res.ok) {
        console.warn(`  Pexels "${query}": HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      for (const photo of data.photos ?? []) {
        // Salvăm URL-ul de bază, fără parametri: dimensiunea se alege în
        // frontend, per context de afișare.
        collected.add(photo.src.original.split('?')[0]);
      }
      console.log(`  Pexels "${query}": ${data.photos?.length ?? 0} rezultate`);
    } catch (err) {
      console.warn(`  Pexels "${query}" a eșuat: ${err.message}`);
    }
  }

  const pool = [...collected];
  return pool.length >= 12 ? pool : [...new Set([...pool, ...fallbackImages])];
}
