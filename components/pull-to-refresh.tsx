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
    const MAX_PULL = 450 // Increased max pull distance
    const REFRESH_THRESHOLD = 300 // Approx 4 inches on mobile (assuming ~75-80px per inch)

    // Map drag distance to rotation
    const rotate = useTransform(y, [0, REFRESH_THRESHOLD], [0, 360])
    const opacity = useTransform(y, [0, 50], [0, 1]) // Fade in earlier
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
            // Apply rubber-banding resistance
            // Logarithmic resistance for a natural feel
            const resistanceValue = Math.min(
                (currentY * 0.5) * (1 - currentY / (MAX_PULL * 2)), 
                MAX_PULL
            )
            y.set(Math.max(0, resistanceValue))
            setPullDistance(Math.max(0, resistanceValue))
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
                className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-50 overflow-hidden"
                style={{ height: MAX_PULL }} 
            >
                <motion.div
                    style={{
                        y: isRefreshing ? REFRESH_THRESHOLD / 2 : y,
                        rotate: isRefreshing ? 0 : rotate,
                        opacity,
                        scale,
                        display: pullDistance > 0 || isRefreshing ? 'flex' : 'none'
                    }}
                    className="mt-8 bg-card border border-border rounded-full p-3 shadow-lg flex items-center justify-center relative z-50"
                >
                    <motion.div
                        animate={isRefreshing ? { rotate: 360 } : {}}
                        transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0.2 }}
                    >
                        <RefreshCw className="w-6 h-6 text-primary" />
                    </motion.div>
                </motion.div>
            </div>

            <motion.div
                drag="y"
                dragListener={!isRefreshing}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2} // Increased elasticity for better feel
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={{ y: isRefreshing ? REFRESH_THRESHOLD : 0 }}
                style={{ y }}
                className="will-change-transform touch-pan-y" // Ensure vertical pan is handled by browser for scrolling
            >
                {children}
            </motion.div>
        </div>
    )
}
