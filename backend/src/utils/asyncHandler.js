// Elimină try/catch-ul repetat din fiecare controller: orice promisiune
// respinsă ajunge automat în middleware-ul de erori.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
