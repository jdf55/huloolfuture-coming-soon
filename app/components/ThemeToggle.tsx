'use client'

import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

function applyTheme(mode: ThemeMode): void {
  const body = document.body
  body.classList.remove('light-theme', 'dark-theme')
  body.classList.add(mode === 'dark' ? 'dark-theme' : 'light-theme')
}

/* ── Icons ── */

function SunIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

const OPTIONS = [
  { mode: 'light' as const, label: 'Light', Icon: SunIcon  },
  { mode: 'dark'  as const, label: 'Dark',  Icon: MoonIcon },
]

/* ── Component ── */

export function ThemeToggle() {
  // Default to null until we resolve from localStorage or system preference
  const [mode, setMode] = useState<ThemeMode | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') {
      setMode(saved)
    } else {
      // No saved preference — detect from system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const detected: ThemeMode = prefersDark ? 'dark' : 'light'
      setMode(detected)
      // Don't save to localStorage yet — let user explicitly choose
    }
  }, [])

  function select(next: ThemeMode) {
    setMode(next)
    localStorage.setItem('theme', next)
    applyTheme(next)
  }

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="surface-soft flex items-center gap-0.5 rounded-full p-0.5"
    >
      {OPTIONS.map(({ mode: m, label, Icon }) => {
        const isActive = mode === m
        return (
          <button
            key={m}
            type="button"
            onClick={() => select(m)}
            aria-pressed={isActive}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            className={`theme-toggle-btn relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150${isActive ? ' is-active' : ' opacity-50 hover:opacity-80'}`}
          >
            <Icon />
          </button>
        )
      })}
    </div>
  )
}
