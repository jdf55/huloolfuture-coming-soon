'use client'

import { useEffect, useState } from 'react'

type ThemeMode = 'system' | 'light' | 'dark'

function applyTheme(mode: ThemeMode): void {
  const body = document.body
  body.classList.remove('light-theme', 'dark-theme')
  if (mode === 'dark') {
    body.classList.add('dark-theme')
  } else if (mode === 'light') {
    body.classList.add('light-theme')
  } else {
    // 'system' — mirror OS preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      body.classList.add('dark-theme')
    }
  }
}

/* ── Icons — Feather-style, 24×24 viewBox, rendered at 15×15 ── */

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

function MonitorIcon() {
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
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path d="M8 21h8M12 17v4" />
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

/* ── Options config ── */

const OPTIONS = [
  { mode: 'light'  as const, label: 'Light',  Icon: SunIcon    },
  { mode: 'system' as const, label: 'System', Icon: MonitorIcon },
  { mode: 'dark'   as const, label: 'Dark',   Icon: MoonIcon   },
]

/* ── Component ── */

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('system')

  // Sync active indicator from persisted preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') as ThemeMode | null
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      setMode(saved)
    }
  }, [])

  // While mode = system, re-apply when OS preference changes
  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

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
