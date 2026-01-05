'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Tracker = {
    id: string
    title: string
    target_timestamp: string
    status: string
}

export function StatisticsChart({ trackers }: { trackers: Tracker[] }) {
    const stats = useMemo(() => {
        const now = new Date()
        const today = new Date(now.setHours(0, 0, 0, 0))
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)

        const distribution = {
            overdue: 0,
            today: 0,
            tomorrow: 0,
            week: 0,
            later: 0
        }

        trackers.forEach(t => {
            const date = new Date(t.target_timestamp)
            // Reset time for date comparison
            const checkDate = new Date(date).setHours(0, 0, 0, 0)

            if (checkDate < today.getTime()) {
                distribution.overdue++
            } else if (checkDate === today.getTime()) {
                distribution.today++
            } else if (checkDate === tomorrow.getTime()) {
                distribution.tomorrow++
            } else if (checkDate <= nextWeek.getTime()) {
                distribution.week++
            } else {
                distribution.later++
            }
        })

        const max = Math.max(...Object.values(distribution), 1) // Avoid division by zero

        return { data: distribution, max }
    }, [trackers])

    const bars = [
        { label: 'Overdue', value: stats.data.overdue, color: 'bg-red-500', labelShort: 'Late' },
        { label: 'Today', value: stats.data.today, color: 'bg-green-500', labelShort: 'Tdy' },
        { label: 'Tmrrw', value: stats.data.tomorrow, color: 'bg-blue-500', labelShort: 'Tmw' },
        { label: 'Week', value: stats.data.week, color: 'bg-yellow-500', labelShort: 'Wk' },
        { label: 'Later', value: stats.data.later, color: 'bg-purple-500', labelShort: 'Ltr' },
    ]

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 flex justify-between items-center">
                <span>Overview</span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white">{trackers.length} Total</span>
            </h2>

            <div className="flex items-end justify-between gap-2 h-32">
                {bars.map((bar, index) => (
                    <div key={bar.label} className="flex flex-col items-center gap-2 flex-1 group relative">

                        {/* Tooltip */}
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                            {bar.label}: {bar.value}
                        </div>

                        {/* Bar */}
                        <div className="w-full bg-white/5 rounded-t-lg h-full relative overflow-hidden flex items-end">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(bar.value / stats.max) * 100}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
                                className={cn(
                                    "w-full rounded-t-lg transition-colors opacity-80 group-hover:opacity-100",
                                    bar.value === 0 ? "min-h-[2px] bg-white/10" : bar.color
                                )}
                            />
                        </div>

                        {/* Label */}
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{bar.labelShort}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
