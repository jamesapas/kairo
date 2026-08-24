export default function Loading() {
  return (
    <main className="flex-1 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-24 h-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-3 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="w-20 h-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-3 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="w-32 h-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-7 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-16 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-7 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>

      {/* Pipeline stepper skeleton */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-zinc-200/90 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="w-10 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-20 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero card skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/90 dark:border-zinc-800 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-20 h-5 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-36 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="w-72 h-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
              <div className="w-20 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>

          {/* Description skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/90 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-44 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="w-full h-3.5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="w-11/12 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="w-4/5 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="w-full h-3.5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="w-3/4 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>

          {/* Checklist skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/90 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-48 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="w-64 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Properties card skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/90 dark:border-zinc-800 space-y-5">
            <div className="w-36 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse pb-2 border-b border-zinc-100 dark:border-zinc-800" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="w-20 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-28 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Links card skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/90 dark:border-zinc-800 space-y-4">
            <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse pb-2 border-b border-zinc-100 dark:border-zinc-800" />
            <div className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
              <div className="w-24 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-32 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="flex-1 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Timestamps skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/90 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-20 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <div className="w-20 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
