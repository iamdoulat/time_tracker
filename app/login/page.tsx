
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/utils/firebase/config'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await signInWithEmailAndPassword(auth, email, password)
            router.push('/')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleSignup(e: React.MouseEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await createUserWithEmailAndPassword(auth, email, password)
            router.push('/')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md glass-card p-8 rounded-3xl relative z-10">
                <h1 className="text-4xl font-bold text-center mb-2 tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Time Tracker
                </h1>
                <p className="text-center text-muted-foreground mb-8">Sign in to manage your time.</p>

                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                        <input
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-white/20"
                            name="email"
                            placeholder="you@example.com"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
                        <input
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-white/20"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-semibold rounded-xl py-3 hover:bg-white/90 transition-opacity active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Sign In'}
                        </button>
                        <button
                            onClick={handleSignup}
                            disabled={loading}
                            className="w-full bg-white/5 text-white font-medium rounded-xl py-3 border border-white/10 hover:bg-white/10 transition-colors active:scale-[0.98] disabled:opacity-50"
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-400 text-center text-sm mt-4 bg-red-400/10 py-2 rounded-lg">
                            {error}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
