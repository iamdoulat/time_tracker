
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Calendar, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/utils/firebase/config'
import { format } from 'date-fns'

const MySwal = withReactContent(Swal)

type TrackerModalProps = {
    isOpen: boolean
    onClose: () => void
    initialData?: any
}

export function TrackerModal({ isOpen, onClose, initialData }: TrackerModalProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Form states to handle initial data
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [status, setStatus] = useState('Progress')

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title)
            setDescription(initialData.description || '')
            const target = new Date(initialData.target_timestamp)
            setDate(format(target, 'yyyy-MM-dd'))
            setTime(format(target, 'HH:mm'))
            setStatus(initialData.status || 'Progress')
        } else {
            setTitle('')
            setDescription('')
            setDate('')
            setTime('')
            setStatus('Progress')
        }
    }, [initialData, isOpen])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const user = auth.currentUser

        if (!user) {
            setLoading(false)
            MySwal.fire({ title: 'Error!', text: 'You must be logged in.', icon: 'error', background: '#18181b', color: '#ffffff', confirmButtonColor: '#7c3aed' })
            return
        }

        const targetTimestamp = new Date(`${date}T${time}`)

        try {
            if (initialData?.id) {
                // Update existing
                await updateDoc(doc(db, "trackers", initialData.id), {
                    title,
                    description: description || null,
                    target_timestamp: targetTimestamp.toISOString(),
                    status,
                })
                MySwal.fire({ title: 'Updated!', text: 'Tracker updated successfully', icon: 'success', timer: 1500, showConfirmButton: false, background: '#18181b', color: '#ffffff', iconColor: '#7c3aed' })
            } else {
                // Create new
                await addDoc(collection(db, "trackers"), {
                    title,
                    description: description || null,
                    target_timestamp: targetTimestamp.toISOString(),
                    status,
                    user_id: user.uid,
                    created_at: new Date().toISOString()
                })
                MySwal.fire({ title: 'Success!', text: 'Tracker created successfully', icon: 'success', timer: 1500, showConfirmButton: false, background: '#18181b', color: '#ffffff', iconColor: '#7c3aed' })
            }

            onClose()
            router.refresh()
        } catch (error: any) {
            console.error('Firebase Error:', error)
            MySwal.fire({ title: 'Error!', text: error.message || 'An error occurred', icon: 'error', background: '#18181b', color: '#ffffff', confirmButtonColor: '#7c3aed' })
        }
        setLoading(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-[#121214] border-t border-white/10 w-full sm:w-[400px] sm:rounded-3xl rounded-t-3xl p-6 relative z-10 sm:border-x sm:border-b"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {initialData?.id ? 'Edit Tracker' : (initialData ? 'Copy Tracker' : 'New Tracker')}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="Project Deadline"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-white placeholder:text-white/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-white appearance-none cursor-pointer"
                                >
                                    <option value="Not Started" className="bg-[#121214]">Not Started</option>
                                    <option value="Progress" className="bg-[#121214]">In Progress</option>
                                    <option value="Available" className="bg-[#121214]">Available</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Add details..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-white placeholder:text-white/20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/50 text-white [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/50 text-white [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="mt-4 w-full bg-primary text-white font-semibold rounded-xl py-3 hover:bg-primary/90 transition-opacity active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (initialData?.id ? 'Update Tracker' : 'Start Tracking')}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence >
    )
}
