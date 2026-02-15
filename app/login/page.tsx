
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/utils/firebase/config'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleForgotPassword() {
        if (!email) {
            MySwal.fire({
                title: 'Email Required',
                text: 'Please enter your email address first to reset your password.',
                icon: 'info',
                background: '#18181b',
                color: '#ffffff',
                confirmButtonColor: '#7c3aed'
            })
            return
        }

        setLoading(true)
        try {
            await sendPasswordResetEmail(auth, email)
            MySwal.fire({
                title: 'Email Sent!',
                text: 'Check your inbox for password reset instructions.',
                icon: 'success',
                background: '#18181b',
                color: '#ffffff',
                confirmButtonColor: '#7c3aed'
            })
        } catch (err: any) {
            MySwal.fire({
                title: 'Error',
                text: err.message,
                icon: 'error',
                background: '#18181b',
                color: '#ffffff',
                confirmButtonColor: '#7c3aed'
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleGoogleLogin() {
        setError(null)
        setLoading(true)
        const provider = new GoogleAuthProvider()
        try {
            await signInWithPopup(auth, provider)
            router.push('/')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

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

                <div className="flex flex-col gap-4 mb-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50 text-white font-medium"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#121214] px-2 text-muted-foreground">Or continue with email</span>
                        </div>
                    </div>
                </div>

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
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-medium text-muted-foreground">Password</label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
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
