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
        className="flex items-center justify-center gap-2.5 rounded-xl border px-6 py-4 text-sm font-medium"
        style={{
          animation: 'fade-up 0.5s ease-out both',
          borderColor: 'var(--success-border)',
          background: 'var(--success-soft)',
          color: 'var(--success)',
        }}
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
        className="email-input h-12 flex-1 rounded-xl px-4 text-sm outline-none transition"
      />
      <button
        type="submit"
        disabled={loading}
        className="notify-btn on-primary relative h-12 overflow-hidden rounded-xl px-6 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
      >
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
