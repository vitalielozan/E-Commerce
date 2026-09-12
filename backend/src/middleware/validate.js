import ApiError from '../utils/ApiError.js';

// Validează req[source] cu o schemă Zod și înlocuiește valoarea cu cea parsată
// (coerciție de tipuri inclusă), astfel încât controllerele să primească
// întotdeauna date curate.
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        ApiError.badRequest(
          'Validation failed',
          result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          }))
        )
      );
    }
    // req.query este doar-citire în Express 5.
    if (source === 'query') req.validatedQuery = result.data;
    else req[source] = result.data;
    next();
  };
