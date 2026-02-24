export function SkeletonLoader() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-12 w-48 bg-slate-800 rounded-lg mx-auto md:mx-0"></div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Table) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 rounded-xl h-[600px] w-full"></div>
        </div>

        {/* Right Column (Matches) */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl h-64 w-full"></div>
          <div className="bg-slate-800 rounded-xl h-64 w-full"></div>
        </div>
      </div>
    </div>
  )
}
