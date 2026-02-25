'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'

type Lang = 'en' | 'ar'

/* ─── Translations ─────────────────────────────────────────────── */

const t = {
  en: {
    badge: 'Launching Soon',
    headlineLine1: 'Turn your schedule',
    headlineLine2: 'into a smart study plan',
    sub: 'Arabic · English · Under 60 seconds',
    desc: 'AILine reads your university schedule and upcoming exams, then builds a personalized weekly study plan with AI — automatically prioritized by your nearest deadline. Made for Saudi university students.',
    emailPlaceholder: 'your@email.com',
    notifyBtn: 'Notify Me',
    notifySaving: 'Saving…',
    thankYou: "You're on the list. We'll reach out the moment we launch.",
    badges: ['Free to start', 'Arabic & English', 'Exam-driven', 'No card needed'],
    featuresLabel: 'Built around how students actually study',
    features: [
      {
        title: 'Smart Schedule Import',
        desc: 'Paste your timetable in Arabic or English. The parser handles Arabic day names, Eastern numerals, and 12h/24h formats — no reformatting needed.',
      },
      {
        title: 'AI-Generated Study Plans',
        desc: 'Gemini builds a weekly plan around your calendar. Exam-driven when deadlines are near; balanced weekly rhythm when they\'re not.',
      },
      {
        title: 'Exam Countdown Dashboard',
        desc: 'Add exam dates and get a live countdown. Your plan automatically front-loads sessions for whatever is due soonest.',
      },
      {
        title: 'Fully Bilingual — AR / EN',
        desc: 'Native Arabic RTL and English LTR support throughout. Your study plan is generated in whichever language you prefer.',
      },
    ],
    pricingLabel: 'Straightforward pricing',
    free: {
      name: 'Free',
      price: 'SAR 0',
      period: '/ forever',
      features: ['2 lifetime AI study plans', 'Full schedule management', 'Exam countdown dashboard', 'Arabic + English support'],
    },
    pro: {
      name: 'Pro',
      price: 'SAR 39',
      period: '/ month',
      annual: 'or SAR 299/year — save 36%',
      badge: 'Most popular',
      features: ['Everything in Free', '5 AI plan regenerations/week', 'Exam-driven prioritization', 'Priority support'],
    },
    builtFor: 'Built for Saudi university students',
    ctaTitle: 'Stop guessing. Start planning.',
    ctaQuote: '"Six courses, one week, and too many priorities." AILine turns that into a clear plan.',
    questions: 'Questions?',
    switchLang: 'عربي',
    byCompany: 'by HuloolFuture',
    copyright: `© ${new Date().getFullYear()} HuloolFuture. All rights reserved.`,
    footerBrand: 'AILine · HuloolFuture',
  },
  ar: {
    badge: 'قريباً',
    headlineLine1: 'حوّل جدولك إلى',
    headlineLine2: 'خطة دراسة ذكية',
    sub: 'عربي · إنجليزي · في أقل من 60 ثانية',
    desc: 'يقرأ AILine جدولك الجامعي ومواعيد اختباراتك، ثم يبني خطة دراسية أسبوعية مخصصة بالذكاء الاصطناعي — مرتّبة تلقائياً حسب أقرب موعد. مصمّم لطلاب الجامعات السعودية.',
    emailPlaceholder: 'بريدك@الإلكتروني.com',
    notifyBtn: 'أخبرني عند الإطلاق',
    notifySaving: 'جارٍ الحفظ…',
    thankYou: 'أنت على القائمة. سنتواصل معك فور الإطلاق.',
    badges: ['مجاني للبدء', 'عربي وإنجليزي', 'مدفوع بالامتحانات', 'بدون بطاقة'],
    featuresLabel: 'مبني على الطريقة التي يذاكر بها الطلاب فعلاً',
    features: [
      {
        title: 'استيراد ذكي للجدول الدراسي',
        desc: 'الصق جدولك بالعربية أو الإنجليزية. يتعامل النظام مع أسماء الأيام العربية والأرقام الشرقية وتنسيقات ١٢/٢٤ ساعة — بدون أي تعديل يدوي.',
      },
      {
        title: 'خطط دراسية بالذكاء الاصطناعي',
        desc: 'يبني Gemini خطة أسبوعية حول تقويمك الدراسي. موجّهة بالامتحانات حين تقترب المواعيد، ومتوازنة حين تبتعد.',
      },
      {
        title: 'عداد تنازلي للامتحانات',
        desc: 'أضف مواعيد اختباراتك واحصل على عداد لحظي. تُقدّم خطتك تلقائياً الجلسات لما يقترب موعده.',
      },
      {
        title: 'ثنائي اللغة — عربي / إنجليزي',
        desc: 'دعم كامل للعربية RTL والإنجليزية LTR في كل مكان. خطتك الدراسية تُولَّد بلغتك التي تختارها.',
      },
    ],
    pricingLabel: 'أسعار واضحة',
    free: {
      name: 'مجاني',
      price: 'SAR 0',
      period: '/ للأبد',
      features: ['خطتا دراسة AI مدى الحياة', 'إدارة كاملة للجدول الدراسي', 'لوحة عداد الامتحانات', 'دعم عربي وإنجليزي'],
    },
    pro: {
      name: 'احترافي',
      price: 'SAR 39',
      period: '/ شهر',
      annual: 'أو SAR 299/سنة — وفّر 36%',
      badge: 'الأكثر شعبية',
      features: ['كل ما في المجاني', '5 تجديدات للخطة أسبوعياً', 'تحديد الأولويات بالامتحانات', 'دعم متميز'],
    },
    builtFor: 'مصمّم لطلاب الجامعات السعودية',
    ctaTitle: 'لا مزيد من التخمين. ابدأ التخطيط.',
    ctaQuote: '"بين المحاضرات والاختبارات، تتراكم الأولويات بسرعة." AILine يحوّلها إلى خطة واضحة خطوة بخطوة.',
    questions: 'استفسارات؟',
    switchLang: 'English',
    byCompany: 'by HuloolFuture',
    copyright: `© ${new Date().getFullYear()} HuloolFuture. جميع الحقوق محفوظة.`,
    footerBrand: 'AILine · HuloolFuture',
  },
} as const

/* ─── Feature icon + color config ──────────────────────────────── */

const featureMeta = [
  {
    toneClass: 'feat-icon-0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v2M15 3v2M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
      </svg>
    ),
  },
  {
    toneClass: 'feat-icon-1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    toneClass: 'feat-icon-2',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    toneClass: 'feat-icon-3',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a10.874 10.874 0 00-3 9 10.874 10.874 0 003 9M3 12h18M12 3c2 3 3 6 3 9s-1 6-3 9" />
      </svg>
    ),
  },
]

/* ─── Logo style ─────────────────────────────────────────────────── */

const logoStyle: React.CSSProperties = {
  objectFit: 'contain',
  transform: 'scale(1.55)',
  transformOrigin: '50% 50%',
}

/* ─── Component ─────────────────────────────────────────────────── */

export function LandingContent() {
  const [lang, setLang] = useState<Lang>('en')
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const c = t[lang]
  const isRtl = lang === 'ar'

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved === 'ar' || saved === 'en') setLang(saved)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }, [lang, isRtl, ready])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 800)
  }

  /* ── Shared: email form ── */
  const emailForm = (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={c.emailPlaceholder}
        dir="ltr"
        className="email-input h-12 flex-1 rounded-xl px-4 text-sm outline-none transition"
      />
      <button
        type="submit"
        disabled={loading}
        className="notify-btn on-primary h-12 w-full rounded-xl px-7 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {c.notifySaving}
          </span>
        ) : c.notifyBtn}
      </button>
    </form>
  )

  /* ── Shared: success state ── */
  const successState = (
    <div
      className="flex w-full max-w-md items-start gap-2.5 rounded-xl px-5 py-4 text-start text-sm font-medium sm:items-center sm:px-6 sm:text-center"
      style={{
        animation: 'fade-up 0.45s ease-out both',
        border: '1px solid var(--success-border)',
        background: 'var(--success-soft)',
        color: 'var(--success)',
      }}
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 4.5L6 12 2.5 8.5" />
      </svg>
      {c.thankYou}
    </div>
  )

  return (
    <main
      className={`theme-root relative min-h-screen overflow-hidden transition-opacity duration-200 ${ready ? 'opacity-100' : 'opacity-0'}`}
    >

      {/* ── Ambient background ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary glow — top-left */}
        <div
          className="absolute -left-24 -top-24 hidden h-[420px] w-[420px] rounded-full blur-[96px] sm:block lg:-left-36 lg:-top-36 lg:h-[560px] lg:w-[560px] lg:blur-[110px]"
          style={{
            background: 'var(--orb-1)',
          }}
        />
        {/* Secondary glow — bottom-right */}
        <div
          className="absolute -bottom-28 -right-24 hidden h-[440px] w-[440px] rounded-full blur-[100px] sm:block lg:-bottom-44 lg:-right-44 lg:h-[600px] lg:w-[600px] lg:blur-[115px]"
          style={{
            background: 'var(--orb-2)',
          }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid" />
        {/* Arabic watermark */}
        <div
          className="watermark-text absolute right-[-1rem] top-1/2 hidden -translate-y-1/2 select-none text-[22vw] font-black leading-none tracking-tight sm:block"
          aria-hidden="true"
        >
          قريباً
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          NAV — always LTR, regardless of page language
      ════════════════════════════════════════════════ */}
      <nav
        dir="ltr"
        className="glass-chrome sticky top-0 z-20 flex items-center justify-between border-b px-4 py-3 sm:px-10 sm:py-4"
        style={{ animation: 'fade-in 0.5s ease-out both' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 overflow-hidden rounded-xl ring-1"
            style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-toggle)' }}
          >
            <Image
              src="/logo.png"
              alt="HuloolFuture"
              height={1000}
              width={1000}
              className="h-9 w-9"
              style={logoStyle}
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text-strong)' }}>AILine</span>
            <span className="text-[10px] muted-copy">{c.byCompany}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setLang(l => (l === 'en' ? 'ar' : 'en'))}
            className="surface-soft flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-150 hover:translate-y-[-1px] sm:px-5 sm:text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="h-4 w-4 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 1.5a8.5 8.5 0 010 13M8 1.5a8.5 8.5 0 000 13M1.5 8h13" strokeLinecap="round" />
            </svg>
            {c.switchLang}
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 pb-20 pt-12 sm:px-10 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">

          {/* Launch badge */}
          <div
            className="mb-9 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{
              animation: 'fade-up 0.55s ease-out both',
              animationDelay: '0.05s',
              border: '1px solid rgba(var(--accent-rgb), 0.35)',
              background: 'var(--accent-soft)',
              color: 'var(--accent-strong)',
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full" style={{ animation: 'ping-ring 1.6s ease-out infinite', background: 'var(--accent)' }} />
              <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            </span>
            {c.badge}
          </div>

          {/* Headline */}
          <h1
            className="mb-5 text-[2.2rem] font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-6xl lg:text-[4.5rem]"
            style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '0.12s' }}
          >
            <span className="headline-gradient">{c.headlineLine1}</span>
            <br />
            <span>{c.headlineLine2}</span>
          </h1>

          {/* Overline */}
          <p
            className="soft-copy mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px] sm:tracking-[0.22em]"
            style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '0.2s' }}
          >
            {c.sub}
          </p>

          {/* Description */}
          <p
            className="muted-copy mx-auto mb-10 max-w-[520px] text-[1rem] leading-[1.75] sm:text-[1.0625rem]"
            style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '0.28s' }}
          >
            {c.desc}
          </p>

          {/* Email capture */}
          <div
            className="mb-7 flex justify-center"
            style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '0.36s' }}
          >
            {submitted ? successState : emailForm}
          </div>

          {/* Trust signals — dot-separated, no checklist feel */}
          <div
            className="mx-auto flex max-w-[330px] flex-wrap items-center justify-center gap-y-1 sm:max-w-none"
            style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '0.44s' }}
          >
            {c.badges.map((b, i) => (
              <span key={b} className="flex items-center">
                {i > 0 && (
                  <span className="mx-2.5 soft-copy" aria-hidden="true">·</span>
                )}
                <span className="soft-copy text-[12px]">{b}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rule ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-10">
        <div className="rule-line" />
      </div>

      {/* ════════════════════════════════════════════════
          FEATURES — static cards, no hover affordance
      ════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 py-14 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p
            className="soft-copy mb-11 text-center text-[11px] font-semibold uppercase tracking-[0.28em]"
            style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '0.5s' }}
          >
            {c.featuresLabel}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {c.features.map((f, i) => (
              <div
                key={f.title}
                className="surface-card rounded-2xl px-5 py-5 sm:px-6 sm:py-6"
                style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: `${0.55 + i * 0.07}s` }}
              >
                <div className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl ${featureMeta[i].toneClass}`}>
                  <div className="h-[18px] w-[18px]">{featureMeta[i].icon}</div>
                </div>
                <h3 className="mb-1.5 text-[13px] font-semibold" style={{ color: 'var(--text-strong)' }}>{f.title}</h3>
                <p className="muted-copy text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rule ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-10">
        <div className="rule-line" />
      </div>

      {/* ════════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════════ */}
      <section
        className="relative z-10 px-5 py-14 sm:px-10 sm:py-20"
        style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '0.9s' }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="soft-copy mb-9 text-center text-[11px] font-semibold uppercase tracking-[0.28em]">
            {c.pricingLabel}
          </p>

          <div className="mx-auto grid max-w-[520px] gap-3 sm:grid-cols-2">

            {/* Free tier */}
            <div className="surface-card flex flex-col rounded-2xl p-5 sm:p-6">
              <p className="soft-copy mb-1 text-[10px] font-bold uppercase tracking-widest">{c.free.name}</p>
              <p className="mb-5 text-[2rem] font-bold tracking-tight" style={{ color: 'var(--text-strong)' }}>
                {c.free.price}
                <span className="soft-copy text-sm font-normal"> {c.free.period}</span>
              </p>
              <ul className="flex-1 space-y-2.5">
                {c.free.features.map(f => (
                  <li key={f} className="muted-copy flex items-start gap-2.5 text-[13px]">
                    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-copy" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11.5 3.5L5.5 9.5 2.5 6.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro tier */}
            <div className="pro-surface flex flex-col rounded-2xl p-5 sm:p-6">
              <div className="mb-1 flex items-center gap-2">
                <p className="accent-copy text-[10px] font-bold uppercase tracking-widest">{c.pro.name}</p>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: 'var(--premium-soft)',
                    color: 'var(--premium)',
                  }}
                >
                  {c.pro.badge}
                </span>
              </div>
              <p className="mb-1 text-[2rem] font-bold tracking-tight" style={{ color: 'var(--text-strong)' }}>
                {c.pro.price}
                <span className="soft-copy text-sm font-normal"> {c.pro.period}</span>
              </p>
              <p className="soft-copy mb-5 text-[11px]">{c.pro.annual}</p>
              <ul className="flex-1 space-y-2.5">
                {c.pro.features.map(f => (
                  <li key={f} className="muted-copy flex items-start gap-2.5 text-[13px]">
                    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-copy" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11.5 3.5L5.5 9.5 2.5 6.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          BOTTOM CTA
      ════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 pb-16 sm:px-10 sm:pb-24">
        <div
          className="cta-surface mx-auto max-w-5xl rounded-2xl px-5 py-10 text-center sm:px-16 sm:py-14"
          style={{
            animation: 'fade-up 0.6s ease-out both',
            animationDelay: '1.0s',
          }}
        >
          <p className="accent-copy mb-3 text-[10px] font-bold uppercase tracking-[0.25em]">
            {c.builtFor}
          </p>
          <h2 className="mb-4 text-[1.5rem] font-bold tracking-tight sm:text-3xl" style={{ color: 'var(--text-strong)' }}>
            {c.ctaTitle}
          </h2>
          <p className="muted-copy mx-auto mb-9 max-w-lg text-[1rem] leading-[1.65]">
            {c.ctaQuote}
          </p>

          <div className="flex justify-center">
            {submitted ? successState : emailForm}
          </div>

          {/* Contact — prominent but not distracting */}
          <p className="soft-copy mt-9 text-[15px]">
            {c.questions}{' '}
            <a
              href="mailto:admin@huloolfuture.sa"
              className="accent-link font-semibold underline underline-offset-2 transition-colors"
            >
              admin@huloolfuture.sa
            </a>
          </p>
        </div>
      </section>

      {/* ── Rule ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-10">
        <div className="rule-line" />
      </div>

      {/* ════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════ */}
      <footer className="glass-chrome relative z-10 border-t px-5 py-6 sm:px-10">
        <div
          className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row"
          dir="ltr"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 overflow-hidden rounded-lg ring-1" style={{ borderColor: 'var(--border)' }}>
              <Image
                src="/logo.png"
                alt="HuloolFuture"
                height={1000}
                width={1000}
                className="h-7 w-7"
                style={logoStyle}
              />
            </div>
            <span className="muted-copy text-[12px] font-medium">{c.footerBrand}</span>
          </div>

          <p className="soft-copy text-[11px]">{c.copyright}</p>

          <a
            href="mailto:admin@huloolfuture.sa"
            className="soft-copy text-[12px] transition-colors hover:opacity-100"
            style={{ opacity: 0.85 }}
          >
            admin@huloolfuture.sa
          </a>
        </div>
      </footer>

    </main>
  )
}
