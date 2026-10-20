export default function Loading() {
  return (
    <main className="flex-1 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Executive Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-3.5 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="w-24 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-3.5 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="w-36 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <div className="w-32 h-8.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-8.5 h-8.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-8.5 h-8.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>

      {/* Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Unified Job Context Box (Sticky Skeleton) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-[5.25rem] lg:self-start z-10">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex flex-col lg:max-h-[calc(100vh-6.75rem)] overflow-hidden">
            {/* Header: Company, Date, Title, Badges (Pinned in card) */}
            <div className="p-5 sm:p-6 pb-5 space-y-3.5 shrink-0">
              {/* Top Row: Company & Date Applied */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
                  <div className="w-28 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                </div>
                <div className="w-20 h-3.5 rounded bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse shrink-0" />
              </div>

              {/* Title */}
              <div className="w-3/4 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />

              {/* Metadata */}
              <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                <div className="w-16 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-14 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-20 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>

            {/* Description Body Skeleton */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
              <div className="w-28 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="space-y-2.5 pt-1">
                <div className="w-full h-3 rounded bg-zinc-100 dark:bg-zinc-800/70 animate-pulse" />
                <div className="w-11/12 h-3 rounded bg-zinc-100 dark:bg-zinc-800/70 animate-pulse" />
                <div className="w-4/5 h-3 rounded bg-zinc-100 dark:bg-zinc-800/70 animate-pulse" />
                <div className="w-full h-3 rounded bg-zinc-100 dark:bg-zinc-800/70 animate-pulse" />
                <div className="w-3/4 h-3 rounded bg-zinc-100 dark:bg-zinc-800/70 animate-pulse" />
                <div className="w-5/6 h-3 rounded bg-zinc-100 dark:bg-zinc-800/70 animate-pulse" />
                <div className="w-2/3 h-3 rounded bg-zinc-100 dark:bg-zinc-800/70 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Copilot & Materials Workspace */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Segmented Workspace Tabs Bar (2 Tabs) */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl">
            <div className="flex-1 h-9 rounded-xl bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-center gap-2 animate-pulse">
              <div className="w-3.5 h-3.5 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="w-28 h-3.5 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
            <div className="flex-1 h-9 rounded-xl bg-transparent flex items-center justify-center gap-2 animate-pulse">
              <div className="w-3.5 h-3.5 rounded bg-zinc-200/60 dark:bg-zinc-700/60" />
              <div className="w-24 h-3.5 rounded bg-zinc-200/60 dark:bg-zinc-700/60" />
            </div>
          </div>

          {/* AI Match Panel Content Skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-32 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="w-24 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>

            {/* Panel Body */}
            <div className="p-6 space-y-5">
              {/* Score Banner Skeleton */}
              <div className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/80">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full border-4 border-zinc-200 dark:border-zinc-700 animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="w-36 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="w-44 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800/70 animate-pulse" />
                    <div className="w-36 h-6 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse" />
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-zinc-200/50 dark:border-zinc-700/50 space-y-2">
                  <div className="w-full h-3 rounded bg-zinc-100 dark:bg-zinc-800/70 animate-pulse" />
                  <div className="w-4/5 h-3 rounded bg-zinc-100 dark:bg-zinc-800/70 animate-pulse" />
                </div>
              </div>

              {/* Skills Card Skeleton */}
              <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                    <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                  </div>
                  <div className="w-8 h-3 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="w-36 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="flex flex-wrap gap-2">
                    <div className="w-20 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                    <div className="w-24 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                    <div className="w-16 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                    <div className="w-28 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                    <div className="w-20 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
