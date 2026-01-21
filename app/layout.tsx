
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { RegisterSW } from '../components/register-sw'
import { Preloader } from '../components/preloader'
import { ThemeProvider } from '../components/theme-provider'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Credit Tracker',
  description: 'Premium PWA Credit Tracker',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Credit Tracker',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#18181b' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <ThemeProvider>
          <Preloader />
          {children}
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  )
}
