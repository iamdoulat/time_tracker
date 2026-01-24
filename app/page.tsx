'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrackerList } from '../components/tracker-list'
import { TrackerModal } from '../components/tracker-form'
import { ProfileModal } from '../components/profile-modal'
import { StatisticsChart } from '../components/statistics-chart'
import { SplashScreen } from '../components/splash-screen'
import { LogOut, Plus, Search, X, Sun, Moon } from 'lucide-react'
import { auth, db } from '@/utils/firebase/config'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { useTheme } from '../components/theme-provider'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [trackers, setTrackers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTracker, setEditingTracker] = useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    // Minimum splash screen time of 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Delay redirect slightly to show splash if needed, but usually we want to redirect
        // However, with custom splash, we might want to wait for splash logic.
        // For now, let's keep the user null until redirect to avoid flash.
        router.push('/login')
      } else {
        setUser(currentUser)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (!user) {
      setTrackers([])
      return
    }

    const q = query(
      collection(db, "trackers"),
      where("user_id", "==", user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trackersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Manual sort to avoid index requirement for now
      trackersData.sort((a: any, b: any) => new Date(a.target_timestamp).getTime() - new Date(b.target_timestamp).getTime())
      setTrackers(trackersData)
    })

    return () => unsubscribe()
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const handleEdit = (tracker: any) => {
    setEditingTracker(tracker)
    setIsModalOpen(true)
  }

  const handleCopy = (tracker: any) => {
    // Create a copy without the ID to trigger "Create" mode in modal
    // but with pre-filled data
    const { id, ...trackerData } = tracker
    setEditingTracker(trackerData)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingTracker(null)
    setIsModalOpen(true)
  }


  return (
    <AnimatePresence mode="wait">
      {loading || showSplash ? (
        <SplashScreen key="splash" />
      ) : (
        user && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <main className="min-h-screen pb-20 px-3 sm:px-4 max-w-md mx-auto relative mobile-px-safe">
              {/* Header */}
              <header className="flex justify-between items-center mb-4 sm:mb-6 pt-3 sm:pt-4 relative gap-2">
                {!isSearchOpen ? (
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient truncate">
                      AI Credit Tracker
                    </h1>
                    <div
                      onClick={() => setIsProfileOpen(true)}
                      className="flex items-center gap-2 mt-1 cursor-pointer group w-fit max-w-full"
                    >
                      <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-md group-hover:scale-110 transition-transform">
                        {(user.displayName || user.email || '?')[0].toUpperCase()}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-primary transition-colors truncate">
                        {user.displayName || user.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 relative animate-in fade-in slide-in-from-right-4 duration-200">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search trackers..."
                      className="w-full h-10 bg-card border border-border rounded-full pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => {
                      if (isSearchOpen) {
                        setSearchQuery('')
                        setIsSearchOpen(false)
                      } else {
                        setIsSearchOpen(true)
                      }
                    }}
                    className={cn(
                      "p-2 sm:p-2.5 rounded-full transition-all flex-shrink-0 flex items-center justify-center",
                      isSearchOpen
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                    )}
                    aria-label={isSearchOpen ? "Close search" : "Open search"}
                  >
                    {isSearchOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Search size={18} className="sm:w-5 sm:h-5" />}
                  </button>

                  {!isSearchOpen && (
                    <button
                      onClick={toggleTheme}
                      className="p-2 sm:p-2.5 bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-full transition-all flex-shrink-0 flex items-center justify-center"
                      aria-label="Toggle theme"
                    >
                      {theme === 'dark' ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
                    </button>
                  )}

                  {!isSearchOpen && (
                    <button
                      onClick={handleLogout}
                      className="p-2 sm:p-2.5 bg-card text-muted-foreground border border-border hover:bg-muted rounded-full transition-all flex-shrink-0 flex items-center justify-center"
                      aria-label="Logout"
                    >
                      <LogOut size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </header>

              {/* Statistics Chart */}
              {!searchQuery && <StatisticsChart trackers={trackers} />}

              {/* Tracker List */}
              <TrackerList initialTrackers={trackers} onEdit={handleEdit} onCopy={handleCopy} searchQuery={searchQuery} />

              {/* Floating Action Button */}
              <div className="fixed bottom-6 right-4 sm:right-6 z-40">
                <button
                  onClick={handleCreate}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  aria-label="Add new tracker"
                >
                  <Plus size={22} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              <TrackerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingTracker}
              />

              <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
              />
            </main>
          </motion.div>
        )
      )}
    </AnimatePresence>
  )
}
