
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextType = {
    theme: Theme
    toggleTheme: () => void
    isAppLoaded: boolean
    setIsAppLoaded: (loaded: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark')
    const [mounted, setMounted] = useState(false)
    const [isAppLoaded, setIsAppLoaded] = useState(false)

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null
        if (savedTheme) {
            setTheme(savedTheme)
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('theme', theme)

        // Update theme-color meta tag for mobile status bar
        const themeColor = theme === 'dark' ? '#000000' : '#ffffff'
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', themeColor)
        } else {
            const meta = document.createElement('meta')
            meta.name = 'theme-color'
            meta.content = themeColor
            document.head.appendChild(meta)
        }

        // Specifically for iOS status bar
        const metaStatusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
        if (metaStatusBarStyle) {
            metaStatusBarStyle.setAttribute('content', theme === 'dark' ? 'black' : 'default')
        } else {
            const meta = document.createElement('meta')
            meta.name = 'apple-mobile-web-app-status-bar-style'
            meta.content = theme === 'dark' ? 'black' : 'default'
            document.head.appendChild(meta)
        }
    }, [theme, mounted])

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    }


    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isAppLoaded, setIsAppLoaded }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
