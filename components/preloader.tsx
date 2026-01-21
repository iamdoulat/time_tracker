'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface PreloaderProps {
    onComplete?: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // Auto-hide preloader after minimum display time
        const timer = setTimeout(() => {
            setIsVisible(false)
            if (onComplete) {
                // Allow fade-out animation to complete before calling onComplete
                setTimeout(onComplete, 300)
            }
        }, 1500)

        return () => clearTimeout(timer)
    }, [onComplete])

    if (!isVisible) {
        return null
    }

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
            style={{
                background: 'var(--color-background)',
            }}
        >
            <div className="flex flex-col items-center gap-6">
                {/* Spinning Logo */}
                <div className="relative">
                    <div className="absolute inset-0 blur-2xl opacity-50 animate-pulse">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500" />
                    </div>
                    <div className="relative animate-spin-slow">
                        <Image
                            src="/icons/icon-192x192.png"
                            alt="AI Credit Tracker"
                            width={96}
                            height={96}
                            className="drop-shadow-2xl"
                            priority
                        />
                    </div>
                </div>

                {/* App Name */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
                        AI Credit Tracker
                    </h1>
                    <div className="flex items-center gap-2 justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
