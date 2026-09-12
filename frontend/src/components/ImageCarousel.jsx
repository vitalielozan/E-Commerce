import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProductImage from './ProductImage.jsx';
import { imageUrl, SIZES } from '../services/images.js';

/**
 * Galeria produsului.
 *
 * Miniaturile de dedesubt înlocuiesc punctele anonime: la un televizor
 * fotografiile arată lucruri diferite (ecran, profil, montaj pe perete), deci
 * trebuie să poți alege direct, nu să treci prin toate.
 */
function ImageCarousel({ images = [], alt }) {
  const { t } = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selected, setSelected] = useState(0);

  const scrollTo = useCallback((index) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();

    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  if (images.length === 0) return null;

  const navButton =
    'absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full backdrop-blur-sm transition-opacity hover:opacity-100';

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="overflow-hidden rounded-xl" ref={emblaRef}>
          <div className="flex">
            {images.map((src, index) => (
              <div className="min-w-0 flex-[0_0_100%]" key={src}>
                <ProductImage
                  src={src}
                  alt={t('product.imageAlt', { title: alt, index: index + 1 })}
                  sizes={SIZES.gallery}
                  eager={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              className={`${navButton} left-3 opacity-80`}
              style={{
                backgroundColor: 'color-mix(in srgb, var(--surface-panel) 85%, transparent)',
              }}
              aria-label={t('product.previousImage')}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              className={`${navButton} right-3 opacity-80`}
              style={{
                backgroundColor: 'color-mix(in srgb, var(--surface-panel) 85%, transparent)',
              }}
              aria-label={t('product.nextImage')}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <ul className="flex gap-2" role="list">
          {images.map((src, index) => (
            <li key={src} className="flex-1">
              <button
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={t('product.goToImage', { index: index + 1 })}
                aria-current={index === selected}
                className="block w-full overflow-hidden rounded-lg transition-opacity"
                style={{
                  outline:
                    index === selected
                      ? '2px solid var(--color-ember-400)'
                      : '1px solid var(--border-hairline)',
                  outlineOffset: index === selected ? '1px' : '0',
                  opacity: index === selected ? 1 : 0.6,
                }}
              >
                <img
                  src={imageUrl(src, 160)}
                  alt=""
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ImageCarousel;
