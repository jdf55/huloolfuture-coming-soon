'use client'

import { useState } from 'react'

export function NotifyForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    // Simulate a brief delay for UX feel — no actual API call
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  if (submitted) {
    return (
      <div
        className="flex items-center justify-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-400"
        style={{ animation: 'fade-up 0.5s ease-out both' }}
      >
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13.5 4.5L6 12 2.5 8.5" />
        </svg>
        You&apos;re on the list! We&apos;ll let you know the moment we launch.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/8 focus:ring-0"
      />
      <button
        type="submit"
        disabled={loading}
        className="relative h-12 overflow-hidden rounded-xl px-6 text-sm font-medium text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          background:
            'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-flow 3s ease infinite',
        }}
      >
        {/* Shimmer sweep */}
        <span
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
            animation: 'shimmer-sweep 3s ease-in-out infinite',
          }}
        />
        <span className="relative">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Saving…
            </span>
          ) : (
            'Notify Me'
          )}
        </span>
      </button>
    </form>
  )
}
