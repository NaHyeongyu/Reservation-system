function shimmer(widthClass: string) {
  return `animate-pulse rounded-full bg-[#15212c] ${widthClass}`;
}

export function AdminLoadingScreen() {
  return (
    <main className="min-h-screen bg-[#04080d] text-[#f4f7fb] lg:grid lg:min-h-screen lg:grid-cols-[232px_minmax(0,1fr)] lg:overflow-hidden lg:border lg:border-[#1b2733] lg:bg-[linear-gradient(180deg,rgba(8,13,19,0.98),rgba(5,9,14,0.98))]">
      <aside className="border-b border-[#17212b] bg-[#081018] p-4 lg:border-b-0 lg:border-r lg:border-[#17212b] lg:p-5">
        <div className="flex items-center justify-between lg:block">
          <div className="space-y-3">
            <div className={shimmer("h-6 w-24")} />
            <div className={shimmer("h-3 w-16")} />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-[14px] border border-[#1f2b36] bg-[#101923] lg:hidden" />
        </div>

        <div className="mt-5 hidden space-y-2 lg:block">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-[18px] border border-[#1f2b36] bg-[#101923]"
            />
          ))}
        </div>

        <div className="mt-6 hidden space-y-2 lg:block">
          <div className="h-11 animate-pulse rounded-[16px] border border-[#1f2b36] bg-[#101923]" />
          <div className="h-11 animate-pulse rounded-[16px] border border-[#1f2b36] bg-[#101923]" />
        </div>
      </aside>

      <section className="min-w-0 space-y-4 bg-[#0f1822] px-3 py-3 sm:px-4 sm:py-4 lg:space-y-6 lg:px-6 lg:py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.2)]"
            >
              <div className={shimmer("h-3 w-16")} />
              <div className={shimmer("mt-4 h-10 w-20")} />
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[30px] border border-[#1c2733] bg-[#0b141d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="border-b border-[#17212b] px-6 py-5">
            <div className={shimmer("h-3 w-20")} />
            <div className={shimmer("mt-3 h-6 w-28")} />
          </div>

          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[22px] border border-[#18222d] bg-[#0f1822] px-4 py-4"
              >
                <div className={shimmer("h-4 w-32")} />
                <div className={shimmer("mt-3 h-3 w-48")} />
                <div className={shimmer("mt-2 h-3 w-36")} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
