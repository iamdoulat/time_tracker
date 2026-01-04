'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Lock, Save } from 'lucide-react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { updateProfile, updatePassword, User as FirebaseUser } from 'firebase/auth'

const MySwal = withReactContent(Swal)

type ProfileModalProps = {
    isOpen: boolean
    onClose: () => void
    user: FirebaseUser | null
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
    const [name, setName] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setName(user.displayName || '')
        }
        setNewPassword('')
    }, [user, isOpen])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            // Update Display Name
            if (name !== user.displayName) {
                await updateProfile(user, { displayName: name })
            }

            // Update Password
            if (newPassword) {
                await updatePassword(user, newPassword)
            }

            await MySwal.fire({
                title: 'Success!',
                text: 'Profile updated successfully',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#18181b',
                color: '#ffffff',
                iconColor: '#7c3aed'
            })
            onClose()
        } catch (error: any) {
            console.error('Update Error:', error)
            await MySwal.fire({
                title: 'Error!',
                text: error.message || 'Failed to update profile. You may need to re-login.',
                icon: 'error',
                background: '#18181b',
                color: '#ffffff',
                confirmButtonColor: '#7c3aed'
            })
        }
        setLoading(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-[#121214] border border-white/10 w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="flex flex-col items-center mb-2">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white mb-2 shadow-lg">
                                    {(name || user?.email || '?')[0].toUpperCase()}
                                </div>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Display Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/50 text-white placeholder:text-white/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">New Password (Optional)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/50 text-white placeholder:text-white/20"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="mt-2 w-full bg-primary text-white font-semibold rounded-xl py-3 hover:bg-primary/90 transition-opacity active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
