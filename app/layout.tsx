import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://huloolfuture.sa'),
  title: 'AILine — AI Study Planner for Saudi University Students',
  description:
    'Turn your class schedule into a personalized AI-generated study plan in Arabic or English — in under 60 seconds. Launching soon by HuloolFuture.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
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
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'AILine by HuloolFuture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AILine — AI Study Planner · Launching Soon',
    description:
      'Turn your class schedule into a personalized AI study plan in under 60 seconds. Built for Saudi university students.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Sync body.dark-theme with system preference before first paint.
          Prevents flash of wrong theme. A future toggle will override this. */}
      <body
        suppressHydrationWarning
        className={`${inter.variable} antialiased`}
      >
        {/*
          Reads theme preference from localStorage before first paint.
          Modes: 'dark' → dark-theme class, 'light' → light-theme class,
          'system' (default) → mirrors OS preference via prefers-color-scheme.
          Runs synchronously so there is no flash of wrong theme.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('theme')||'system';if(m==='dark'){document.body.classList.add('dark-theme');}else if(m==='light'){document.body.classList.add('light-theme');}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.body.classList.add('dark-theme');}}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
