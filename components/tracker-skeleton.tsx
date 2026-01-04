export function TrackerSkeleton() {
    return (
        <div className="flex flex-col gap-4 w-full animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-3xl border border-white/5 bg-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="h-6 w-48 bg-white/10 rounded-md"></div>
                            <div className="h-4 w-24 bg-white/10 rounded-md"></div>
                        </div>
                        <div className="h-8 w-20 bg-white/10 rounded-full"></div>
                    </div>

                    <div className="flex gap-2">
                        <div className="h-8 w-24 bg-white/10 rounded-full"></div>
                        <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                        <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-3 w-32 bg-white/10 rounded-md"></div>
                        <div className="h-8 w-40 bg-white/10 rounded-md"></div>
                    </div>
                </div>
            ))}
        </div>
    )
}
