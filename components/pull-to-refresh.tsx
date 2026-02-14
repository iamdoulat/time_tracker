'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
    onRefresh: () => Promise<void>
    children: React.ReactNode
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const y = useMotionValue(0)
    const MAX_PULL = 80
    const REFRESH_THRESHOLD = 60

    // Map drag distance to rotation
    const rotate = useTransform(y, [0, REFRESH_THRESHOLD], [0, 360])
    const opacity = useTransform(y, [0, 20], [0, 1])
    const scale = useTransform(y, [0, REFRESH_THRESHOLD], [0.5, 1])

    const handleDrag = (_: any, info: any) => {
        if (isRefreshing) return

        // Only allow pulling down when at the top of the scroll
        const scrollY = window.scrollY
        if (scrollY > 0) {
            y.set(0)
            return
        }

        const currentY = info.offset.y
        if (currentY > 0) {
            // Apply some resistance
            const resistanceValue = Math.min(currentY * 0.4, MAX_PULL)
            y.set(resistanceValue)
            setPullDistance(resistanceValue)
        } else {
            y.set(0)
            setPullDistance(0)
        }
    }

    const handleDragEnd = async () => {
        if (isRefreshing) return

        if (pullDistance >= REFRESH_THRESHOLD) {
            setIsRefreshing(true)
            // Lock position at threshold while refreshing
            y.set(REFRESH_THRESHOLD)

            try {
                await onRefresh()
            } finally {
                // Reset after refresh
                setIsRefreshing(false)
                y.set(0)
                setPullDistance(0)
            }
        } else {
            y.set(0)
            setPullDistance(0)
        }
    }

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Pull indicator */}
            <div
                className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-50"
                style={{ height: REFRESH_THRESHOLD }}
            >
                <motion.div
                    style={{
                        y: isRefreshing ? REFRESH_THRESHOLD / 2 : y,
                        rotate: isRefreshing ? 0 : rotate,
                        opacity,
                        scale
                    }}
                    className="mt-4 bg-card border border-border rounded-full p-2.5 shadow-lg flex items-center justify-center"
                >
                    <motion.div
                        animate={isRefreshing ? { rotate: 360 } : {}}
                        transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0.2 }}
                    >
                        <RefreshCw className="w-5 h-5 text-primary" />
                    </motion.div>
                </motion.div>
            </div>

            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={{ y: isRefreshing ? REFRESH_THRESHOLD : 0 }}
                style={{ y }}
                className="will-change-transform"
            >
                {children}
            </motion.div>
        </div>
    )
}
