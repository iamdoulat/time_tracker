
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { RegisterSW } from '../components/register-sw'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Credit Tracker',
  description: 'Premium PWA Credit Tracker',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={outfit.className}>
        {children}
        <RegisterSW />
      </body>
    </html>
  )
}
