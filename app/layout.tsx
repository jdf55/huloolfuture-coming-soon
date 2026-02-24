import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AILine — AI Study Planner for Saudi University Students',
  description:
    'Turn your class schedule into a personalized AI-generated study plan in Arabic or English — in under 60 seconds. Launching soon by HuloolFuture.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'AILine — AI Study Planner · Launching Soon',
    description:
      'Turn your class schedule into a personalized AI-generated study plan in Arabic or English — in under 60 seconds.',
    type: 'website',
    locale: 'en_US',
    siteName: 'AILine by HuloolFuture',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AILine — AI Study Planner · Launching Soon',
    description:
      'Turn your class schedule into a personalized AI study plan in under 60 seconds. Built for Saudi university students.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
