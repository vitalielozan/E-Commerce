import { useState } from 'react';
import { responsiveImage } from '../services/images.js';

/**
 * Imagine de produs în raportul ecranului.
 *
 * Rezervă spațiul înainte ca fotografia să ajungă, ca restul paginii să nu
 * sară la încărcare, și livrează prin srcset varianta potrivită lățimii reale
 * în locul originalului de 1,8 MB.
 */
function ProductImage({
  src,
  alt,
  sizes,
  eager = false,
  className = '',
  ratio = 'aspect-[16/9]',
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${ratio} ${className}`}
      style={{ backgroundColor: 'var(--surface-sunken)' }}
    >
      {!loaded && !failed && (
        <div className="skeleton absolute inset-0" aria-hidden="true" />
      )}

      {failed ? (
        <div
          className="text-muted absolute inset-0 grid place-items-center text-xs"
          role="img"
          aria-label={alt}
        >
          {alt}
        </div>
      ) : (
        <img
          {...responsiveImage(src, { sizes, alt, eager })}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}

export default ProductImage;
