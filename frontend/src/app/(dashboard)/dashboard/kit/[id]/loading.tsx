import { Skeleton } from "@/components/ui/skeleton";

export default function KitLoading() {
  return (
    <div className="flex flex-col gap-6 w-full text-white">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-white/10 rounded-lg" />
          <Skeleton className="h-4 w-80 sm:w-96 bg-white/5 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 bg-white/10 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/3 border border-white/10 p-5 flex flex-col justify-between"
          >
            <Skeleton className="h-8 w-16 bg-white/10 rounded-md" />
            <Skeleton className="h-4 w-28 bg-white/5 rounded-md" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white/3 border border-white/10 p-6 flex flex-col gap-5">
        <Skeleton className="h-5 w-48 bg-white/10 rounded-md" />

        <div className="space-y-5 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-xl bg-white/10 shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24 bg-white/10 rounded-md" />
                  <Skeleton className="h-3 w-20 bg-white/5 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-4 flex-1 max-w-sm sm:max-w-md">
                <Skeleton className="h-2 w-full bg-white/10 rounded-full" />
                <Skeleton className="h-4 w-8 bg-white/10 rounded-md shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

