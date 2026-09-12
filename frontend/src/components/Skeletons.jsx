/**
 * Substituenți de încărcare care copiază forma conținutului real.
 *
 * Înainte, paginile afișau un rând de text („Se încarcă…") și apoi săreau la
 * grila completă. Un schelet de aceeași formă păstrează înălțimea paginii și
 * face așteptarea mai scurtă decât pare.
 */

export function ProductCardSkeleton() {
  return (
    <div className="surface-panel overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-[16/9] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-6 w-28 rounded" />
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2" aria-hidden="true">
      <div className="skeleton aspect-[16/9] w-full rounded-xl" />
      <div className="space-y-4">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-9 w-3/4 rounded" />
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-10 w-40 rounded" />
        <div className="skeleton h-20 w-full rounded" />
        <div className="skeleton h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function RowSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="surface-panel flex gap-4 p-4">
          <div className="skeleton h-20 w-32 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-5 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
