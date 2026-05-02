export default function Loading() {
  return (
    <div className="min-h-screen p-6">
      {/* Banner skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-12 w-96 bg-dst-brown rounded mx-auto mb-4" />
        <div className="h-6 w-64 bg-dst-brown rounded mx-auto mb-6" />
        <div className="flex gap-4 justify-center flex-wrap">
          <div className="h-10 w-56 bg-dst-brown rounded" />
          <div className="h-10 w-44 bg-dst-brown rounded" />
          <div className="h-10 w-36 bg-dst-brown rounded" />
        </div>
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg bg-dst-brown/60 border border-dst-gold/20 p-4"
          >
            <div className="w-20 h-20 bg-dst-dark rounded mx-auto mb-3" />
            <div className="h-5 bg-dst-dark rounded w-3/4 mx-auto mb-3" />
            <div className="flex gap-2 justify-center mb-3">
              <div className="h-5 w-12 bg-dst-dark rounded-full" />
              <div className="h-5 w-12 bg-dst-dark rounded-full" />
              <div className="h-5 w-12 bg-dst-dark rounded-full" />
            </div>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="w-8 h-8 bg-dst-dark rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
