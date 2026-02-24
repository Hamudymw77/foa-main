export function SkeletonLoader() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-12 w-48 bg-white/10 rounded-lg mx-auto md:mx-0"></div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Table) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 rounded-xl h-[600px] w-full border border-white/5"></div>
        </div>

        {/* Right Column (Matches) */}
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl h-64 w-full border border-white/5"></div>
          <div className="bg-white/5 rounded-xl h-64 w-full border border-white/5"></div>
        </div>
      </div>
    </div>
  )
}
