'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrackerList } from '../components/tracker-list'
import { TrackerModal } from '../components/tracker-form'
import { ProfileModal } from '../components/profile-modal'
import { LogOut, Plus } from 'lucide-react'
import { auth, db } from '@/utils/firebase/config'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [trackers, setTrackers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTracker, setEditingTracker] = useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  if (!user) return null

  return (
    <main className="min-h-screen pb-20 p-4 max-w-md mx-auto relative">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
            AI Credit Tracker
          </h1>
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 mt-1 cursor-pointer group"
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-md group-hover:scale-110 transition-transform">
              {(user.displayName || user.email || '?')[0].toUpperCase()}
            </div>
            <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
              {user.displayName || user.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 rounded-full transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Tracker List */}
      <TrackerList initialTrackers={trackers} onEdit={handleEdit} onCopy={handleCopy} />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleCreate}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={24} />
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
  )
}
