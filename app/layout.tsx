
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { RegisterSW } from '../components/register-sw'

import { ThemeProvider } from '../components/theme-provider'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Credit Tracker',
  description: 'Premium PWA Credit Tracker',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
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
          {children}
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  )
}
