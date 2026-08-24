export default function Loading() {
  return (
    <main className="flex-1 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Action Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-3 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="w-24 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-3 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="w-36 h-4 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-18 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>

      {/* Two-Column Executive Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT MAIN COLUMN: Hero & Tabbed Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Hero Title Card (Compact Hero) */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-24 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-40 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>

              {/* Title */}
              <div className="w-64 sm:w-80 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />

              {/* Metadata Row */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="shrink-0 pt-0.5">
              <div className="w-36 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>

          {/* Segmented Workspace Tabs Bar Skeleton */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl">
            <div className="flex-1 h-9 rounded-xl bg-white dark:bg-zinc-900 shadow-xs animate-pulse" />
            <div className="flex-1 h-9 rounded-xl bg-transparent animate-pulse" />
          </div>

          {/* AI Job Match Panel Content Skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 animate-pulse" />
                <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>

            {/* Score Ribbon with Radial Gauge */}
            <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-full border-4 border-zinc-200 dark:border-zinc-700 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="w-36 h-3 rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                </div>
              </div>
              <div className="w-24 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="w-8 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Summary Lines */}
            <div className="space-y-2 pt-1">
              <div className="w-full h-3.5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="w-11/12 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="w-4/5 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Links Card Skeleton */}
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

          {/* Application Checklist & Prep Card Skeleton (Persistent) */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/90 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="w-36 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-12 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            {/* Checklist Items */}
            <div className="space-y-2 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
                  <div className="flex-1 h-3 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps Skeleton */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/90 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-24 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <div className="w-20 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="w-24 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
