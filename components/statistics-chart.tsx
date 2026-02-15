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
            const checkDate = new Date(date).setHours(0, 0, 0, 0)

            if (checkDate < today.getTime()) {
                distribution.overdue++
            } else if (checkDate === today.getTime()) {
                distribution.today++
            } else if (checkDate === tomorrow.getTime()) {
                distribution.tomorrow++
            } else if (checkDate > tomorrow.getTime() && checkDate <= nextWeek.getTime()) {
                distribution.week++
            } else {
                distribution.later++
            }
        })

        const max = Math.max(...Object.values(distribution), 1)
        return { data: distribution, max }
    }, [trackers])

    const dataPoints = [
        { label: 'Late', value: stats.data.overdue, color: '#f43f5e' },
        { label: 'Tdy', value: stats.data.today, color: '#f43f5e' },
        { label: 'Tmw', value: stats.data.tomorrow, color: '#f43f5e' },
        { label: 'Wk', value: stats.data.week, color: '#f43f5e' },
        { label: 'Ltr', value: stats.data.later, color: '#f43f5e' },
    ]

    return (
        <div className="bg-card dark:bg-[#121214] border-2 border-black dark:border-white/5 rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden transition-colors">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-sm font-bold text-black dark:text-muted-foreground/60 uppercase tracking-widest">Overview</h2>
                <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-black dark:text-white uppercase tracking-wider">
                    {trackers.length} Total
                </div>
            </div>

            <div className="flex items-end justify-between relative h-32 px-2">
                {/* Baseline */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-white/5" />

                {dataPoints.map((point, index) => {
                    const heightPercent = (point.value / stats.max) * 100
                    const peakHeight = Math.max(5, (heightPercent / 100) * 80)

                    return (
                        <div key={point.label} className="flex flex-col items-center gap-4 flex-1 group">
                            <div className="relative w-full h-24 flex items-end justify-center">
                                {point.value > 0 && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -top-6 text-[11px] font-black text-rose-600 dark:text-rose-500 font-mono"
                                    >
                                        {point.value}
                                    </motion.span>
                                )}

                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <motion.path
                                        initial={{ d: "M 0 100 Q 50 100 100 100" }}
                                        animate={{
                                            d: `M 0 100 Q 50 ${100 - peakHeight} 100 100`
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 80,
                                            damping: 15,
                                            delay: index * 0.1
                                        }}
                                        fill="none"
                                        stroke={point.color}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        className="opacity-90 dark:opacity-80 group-hover:opacity-100 transition-opacity"
                                    />

                                    <motion.path
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            d: `M 0 100 Q 50 ${100 - peakHeight} 100 100 L 100 100 L 0 100 Z`,
                                            opacity: 0.1
                                        }}
                                        fill={point.color}
                                        className="pointer-events-none"
                                    />
                                </svg>
                            </div>

                            <span className="text-[10px] text-black font-black uppercase tracking-[0.2em] pt-2 dark:text-muted-foreground/40">
                                {point.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
