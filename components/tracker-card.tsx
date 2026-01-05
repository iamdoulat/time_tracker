'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { Clock, CheckCircle2, Timer, Pencil, Copy, Pause, Play, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/utils/firebase/config'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

type Tracker = {
    id: string
    title: string
    description?: string
    target_timestamp: string
    status: string
    created_at: string
    paused?: boolean
    paused_at?: string
    accumulated_time?: number
}

export function TrackerCard({ tracker, onEdit, onCopy }: { tracker: Tracker; onEdit?: (tracker: Tracker) => void; onCopy?: (tracker: Tracker) => void }) {
    const target = useMemo(() => new Date(tracker.target_timestamp), [tracker.target_timestamp])
    const start = useMemo(() => new Date(tracker.created_at), [tracker.created_at])

    const [timeLeft, setTimeLeft] = useState('')
    const [isAvailable, setIsAvailable] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isPaused, setIsPaused] = useState(tracker.paused || false)

    useEffect(() => {
        setIsPaused(tracker.paused || false)
    }, [tracker.paused])

    const togglePause = async () => {
        try {
            const newPausedState = !isPaused
            const now = new Date()

            if (newPausedState) {
                // Pausing: store current time and accumulated time
                const elapsed = now.getTime() - start.getTime()
                await updateDoc(doc(db, 'trackers', tracker.id), {
                    paused: true,
                    paused_at: now.toISOString(),
                    accumulated_time: tracker.accumulated_time || elapsed
                })
            } else {
                // Resuming: calculate new target timestamp
                const pausedAt = new Date(tracker.paused_at || now)
                const pauseDuration = now.getTime() - pausedAt.getTime()
                const newTarget = new Date(target.getTime() + pauseDuration)

                await updateDoc(doc(db, 'trackers', tracker.id), {
                    paused: false,
                    target_timestamp: newTarget.toISOString(),
                    paused_at: null
                })
            }
        } catch (error) {
            console.error('Error toggling pause:', error)
        }
    }

    const handleDelete = async () => {
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: 'This tracker will be permanently deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            background: '#18181b',
            color: '#ffffff',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3f3f46',
            iconColor: '#ef4444'
        })

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, 'trackers', tracker.id))
                MySwal.fire({
                    title: 'Deleted!',
                    text: 'Tracker has been deleted.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#18181b',
                    color: '#ffffff',
                    iconColor: '#22c55e'
                })
            } catch (error) {
                console.error('Error deleting tracker:', error)
                MySwal.fire({
                    title: 'Error!',
                    text: 'Failed to delete tracker.',
                    icon: 'error',
                    background: '#18181b',
                    color: '#ffffff'
                })
            }
        }
    }

    useEffect(() => {
        const update = () => {
            if (isPaused) {
                // When paused, show frozen time
                const pausedAt = tracker.paused_at ? new Date(tracker.paused_at) : new Date()
                const totalDuration = target.getTime() - start.getTime()
                const elapsed = pausedAt.getTime() - start.getTime()
                const remaining = target.getTime() - pausedAt.getTime()

                if (tracker.status === 'Available' || remaining <= 0) {
                    setIsAvailable(true)
                    setTimeLeft('Completed')
                    setProgress(100)
                } else if (tracker.status === 'Not Started') {
                    setIsAvailable(false)
                    setTimeLeft('Not Started')
                    setProgress(0)
                } else {
                    setIsAvailable(false)
                    const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
                    setProgress(percent)

                    const d = Math.floor(remaining / (1000 * 60 * 60 * 24))
                    const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
                    const s = Math.floor((remaining % (1000 * 60)) / 1000)

                    const parts = []
                    if (d > 0) parts.push(`${d}d`)
                    parts.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
                    setTimeLeft(parts.join(' '))
                }
                return
            }

            const now = new Date()
            const totalDuration = target.getTime() - start.getTime()
            const elapsed = now.getTime() - start.getTime()
            const remaining = target.getTime() - now.getTime()

            if (tracker.status === 'Available' || remaining <= 0) {
                setIsAvailable(true)
                setTimeLeft('Completed')
                setProgress(100)
            } else if (tracker.status === 'Not Started') {
                setIsAvailable(false)
                setTimeLeft('Not Started')
                setProgress(0)
            } else {
                setIsAvailable(false)

                // Progress percentage for the bar
                const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
                setProgress(percent)

                // Count down string
                const d = Math.floor(remaining / (1000 * 60 * 60 * 24))
                const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
                const s = Math.floor((remaining % (1000 * 60)) / 1000)

                const parts = []
                if (d > 0) parts.push(`${d}d`)
                parts.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)

                setTimeLeft(parts.join(' '))
            }
        }

        update() // run immediately
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [target, start, isPaused, tracker.paused_at])

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl p-6 border transition-all duration-500 group select-none",
            isAvailable
                ? "bg-primary/5 border-primary/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]"
                : "bg-card border-border hover:border-primary/30"
        )}>
            {/* Background Pipeline Progress Bar */}
            {!isAvailable && (
                <div className="absolute inset-0 bg-primary/5 pointer-events-none origin-left transition-transform duration-1000 linear" style={{ transform: `scaleX(${progress / 100})` }} />
            )}

            {/* Bottom glowing progress line */}
            {!isAvailable && (
                <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary/50 to-primary w-full origin-left transition-transform duration-1000 linear" style={{ transform: `scaleX(${progress / 100})` }} />
            )}

            <div className="flex justify-between items-start mb-6 relative z-10 gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors truncate">{tracker.title}</h3>
                    {tracker.description && (
                        <div className="inline-block px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium mb-2">
                            {tracker.description}
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {format(target, 'MMM d, h:mm a')}
                    </p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border backdrop-blur-md",
                        isAvailable
                            ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_-4px_rgba(74,222,128,0.5)]"
                            : (tracker.status === 'Not Started'
                                ? "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20")
                    )}>
                        {isAvailable ? 'Available' : (tracker.status === 'Not Started' ? 'Not Started' : 'Progress')}
                    </div>
                    <div className="flex items-center gap-2">
                        {!isAvailable && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePause();
                                }}
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    isPaused
                                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20"
                                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
                                )}
                            >
                                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                            </button>
                        )}
                        {onCopy && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCopy(tracker);
                                }}
                                className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded-full transition-colors"
                            >
                                <Copy size={14} />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(tracker);
                                }}
                                className="p-2 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 rounded-full transition-colors"
                            >
                                <Pencil size={14} />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-full transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
                {isAvailable ? (
                    <div className="flex items-center gap-2 text-green-400 w-full p-2 bg-green-500/5 rounded-xl border border-green-500/10">
                        <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 size={16} />
                        </div>
                        <span className="font-semibold text-sm">Ready to Claim</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 w-full">
                        <div className={cn(
                            "h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center relative",
                            isPaused ? "text-yellow-400" : "text-primary"
                        )}>
                            {!isPaused && <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />}
                            <Timer size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Time Left</p>
                                <p className="text-[10px] text-primary/80 font-mono">{Math.floor(progress)}%</p>
                            </div>
                            <p className="text-2xl font-mono text-foreground tracking-widest leading-none font-bold tabular-nums">
                                {timeLeft}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
