
'use client'

import { useState, useMemo, useEffect } from 'react'
import { TrackerCard } from './tracker-card'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

type Tracker = {
    id: string
    title: string
    description?: string
    target_timestamp: string
    status: string
    created_at: string
}

const TABS = ['all', 'progress', 'available'] as const
const ITEMS_PER_PAGE = 10

export function TrackerList({ initialTrackers, onEdit, onCopy, searchQuery = '' }: { initialTrackers: any[]; onEdit: (tracker: any) => void; onCopy: (tracker: any) => void; searchQuery?: string }) {
    const [filter, setFilter] = useState<typeof TABS[number]>('all')
    const [currentTime, setCurrentTime] = useState(new Date())
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

    useEffect(() => {
        // Refresh every second to update availability status for filtering
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        // Reset pagination when filter changes
        setVisibleCount(ITEMS_PER_PAGE)
    }, [filter, searchQuery])

    const filteredTrackers = useMemo(() => {
        return initialTrackers.filter(t => {
            const target = new Date(t.target_timestamp)
            const isAvailable = currentTime >= target
            const computedStatus = isAvailable ? 'available' : 'progress'

            // Filter by search query
            if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false
            }

            if (filter === 'all') return true
            return computedStatus === filter
        })
    }, [initialTrackers, filter, currentTime, searchQuery])

    const sortedTrackers = useMemo(() => {
        return [...filteredTrackers].sort((a, b) => new Date(a.target_timestamp).getTime() - new Date(b.target_timestamp).getTime())
    }, [filteredTrackers])

    const displayedTrackers = useMemo(() => {
        return sortedTrackers.slice(0, visibleCount)
    }, [sortedTrackers, visibleCount])

    const handleSwipe = (event: Event, info: PanInfo) => {
        const threshold = 50
        const currentIndex = TABS.indexOf(filter)

        if (info.offset.x < -threshold) {
            // Swipe Left -> Next Tab
            if (currentIndex < TABS.length - 1) {
                setFilter(TABS[currentIndex + 1])
            }
        } else if (info.offset.x > threshold) {
            // Swipe Right -> Prev Tab
            if (currentIndex > 0) {
                setFilter(TABS[currentIndex - 1])
            }
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 sticky top-0 z-40 backdrop-blur-md">
                {TABS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize relative z-10",
                            filter === f ? "text-black" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        {filter === f && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white rounded-lg -z-10 shadow-sm"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {f}
                    </button>
                ))}
            </div>

            <motion.div
                className="flex flex-col gap-4 pb-24 min-h-[50vh]"
                onPanEnd={handleSwipe}
                style={{ touchAction: 'pan-y' }} // Allow vertical scroll, handle horizontal swipe
            >
                <AnimatePresence mode="popLayout">
                    {displayedTrackers.map((tracker) => (
                        <motion.div
                            key={tracker.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <TrackerCard tracker={tracker} onEdit={onEdit} onCopy={onCopy} />
                        </motion.div>
                    ))}
                    {sortedTrackers.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-muted-foreground"
                        >
                            <p>No trackers found</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Load More Button */}
                {visibleCount < sortedTrackers.length && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                        className="mx-auto mt-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        Load More <ChevronDown size={14} />
                    </motion.button>
                )}
            </motion.div>
        </div>
    )
}
