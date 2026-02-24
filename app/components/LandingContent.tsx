'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type Lang = 'en' | 'ar'

/* ─── Translations ─────────────────────────────────────────────── */

const t = {
  en: {
    badge: 'Launching Soon',
    headlineLine1: 'Turn your schedule',
    headlineLine2: 'into a smart study plan',
    accentLine: 'حوّل جدولك إلى خطة دراسة ذكية',
    sub: 'in Arabic or English · in under 60 seconds',
    desc: 'AILine reads your university class schedule and upcoming exam dates, then uses AI to generate a personalized weekly study plan — prioritized by what\'s due soonest. Built specifically for Saudi university students.',
    emailPlaceholder: 'your@email.com',
    notifyBtn: 'Notify Me',
    notifySaving: 'Saving…',
    thankYou: "You're on the list! We'll let you know the moment we launch.",
    badges: ['✓ Free to start', '✓ Arabic RTL', '✓ Exam-Driven', '✓ AI-Powered', '✓ No credit card'],
    featuresLabel: 'Everything you need to study smarter',
    features: [
      { title: 'Smart Schedule Import', desc: "Paste your class schedule in Arabic or English. Our parser handles Arabic day names, Eastern numerals, and 12h/24h formats — automatically." },
      { title: 'AI-Generated Study Plans', desc: "Gemini builds a personalized weekly plan around your timetable — exam-driven when you have deadlines, or balanced weekly optimization when you don't." },
      { title: 'Exam Countdown Dashboard', desc: 'Add your exam dates and get a real-time countdown. Your plan automatically front-loads study sessions for the nearest deadline.' },
      { title: 'Fully Bilingual — AR / EN', desc: 'Complete Arabic RTL and English LTR support. Your study plan is generated in your language. Switch at any time from the nav bar.' },
    ],
    pricingLabel: 'Simple pricing',
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
      features: ['5 AI plan regenerations/week', 'Exam-driven prioritization', 'Everything in Free', 'Priority support'],
    },
    builtFor: 'Built for Saudi university students',
    ctaTitle: 'Stop guessing. Start planning.',
    ctaQuote: '"I have 6 courses and no idea how to split my time" — never again.',
    ctaQuoteAccent: '"لديّ 6 مقررات ولا أعرف كيف أوزّع وقتي" — لم يعد هذا مشكلة.',
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
    accentLine: 'Turn your schedule into a smart study plan',
    sub: 'بالعربية أو الإنجليزية · في أقل من 60 ثانية',
    desc: 'يقرأ AILine جدولك الجامعي ومواعيد اختباراتك القادمة، ثم يستخدم الذكاء الاصطناعي لإنشاء خطة دراسية أسبوعية مخصصة — مُرتّبة حسب أقرب موعد امتحان. مصمّم خصيصاً لطلاب الجامعات السعودية.',
    emailPlaceholder: 'بريدك@الإلكتروني.com',
    notifyBtn: 'أخبرني عند الإطلاق',
    notifySaving: 'جارٍ الحفظ…',
    thankYou: 'أنت على القائمة! سنُعلمك فور الإطلاق.',
    badges: ['✓ مجاني للبدء', '✓ واجهة عربية', '✓ مدفوع بالامتحانات', '✓ ذكاء اصطناعي', '✓ بدون بطاقة ائتمان'],
    featuresLabel: 'كل ما تحتاجه للدراسة بذكاء',
    features: [
      { title: 'استيراد ذكي للجدول الدراسي', desc: 'الصق جدولك بالعربية أو الإنجليزية. يدعم المحلل أسماء الأيام العربية، والأرقام الشرقية، وتنسيقات ١٢ و٢٤ ساعة — تلقائياً.' },
      { title: 'خطط دراسية بالذكاء الاصطناعي', desc: 'يبني Gemini خطة أسبوعية مخصصة حول جدولك — موجّهة بالامتحانات عند توفر المواعيد، أو تحسين أسبوعي متوازن.' },
      { title: 'عداد تنازلي للامتحانات', desc: 'أضف مواعيد اختباراتك واحصل على عداد تنازلي لحظي. تُقدّم خطتك تلقائياً الجلسات للمادة الأقرب موعداً.' },
      { title: 'ثنائي اللغة — عربي / إنجليزي', desc: 'دعم كامل للعربية RTL والإنجليزية LTR. خطتك الدراسية تُولَّد بلغتك. بدّل في أي وقت من شريط التنقل.' },
    ],
    pricingLabel: 'أسعار بسيطة',
    free: {
      name: 'مجاني',
      price: 'SAR 0',
      period: '/ للأبد',
      features: ['خطتا دراسة AI مدى الحياة', 'إدارة كاملة للجدول الدراسي', 'لوحة عد تنازلي للامتحانات', 'دعم عربي + إنجليزي'],
    },
    pro: {
      name: 'احترافي',
      price: 'SAR 39',
      period: '/ شهر',
      annual: 'أو SAR 299/سنة — وفّر 36%',
      badge: 'الأكثر شعبية',
      features: ['5 تجديدات للخطة أسبوعياً', 'تحديد أولويات حسب الامتحانات', 'كل ما في المجاني', 'دعم متميز'],
    },
    builtFor: 'مصمّم لطلاب الجامعات السعودية',
    ctaTitle: 'لا مزيد من التخمين. ابدأ التخطيط.',
    ctaQuote: '"لديّ 6 مقررات ولا أعرف كيف أوزّع وقتي" — لم يعد هذا مشكلة.',
    ctaQuoteAccent: '"I have 6 courses and no idea how to split my time" — never again.',
    questions: 'استفسارات؟',
    switchLang: 'English',
    byCompany: 'من HuloolFuture',
    copyright: `© ${new Date().getFullYear()} HuloolFuture. جميع الحقوق محفوظة.`,
    footerBrand: 'AILine · HuloolFuture',
  },
} as const

/* ─── Feature visual config (language-independent) ─────────────── */

const featureMeta = [
  {
    gradient: 'from-indigo-500/20 to-indigo-600/10',
    iconColor: 'text-indigo-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v2M15 3v2M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
      </svg>
    ),
  },
  {
    gradient: 'from-violet-500/20 to-violet-600/10',
    iconColor: 'text-violet-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    gradient: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a10.874 10.874 0 00-3 9 10.874 10.874 0 003 9M3 12h18M12 3c2 3 3 6 3 9s-1 6-3 9" />
      </svg>
    ),
  },
]

/* ─── Logo style (same for both languages) ──────────────────────── */

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

  // On mount: restore the saved language, then reveal the page.
  // Both state updates are batched, so the page becomes visible only after
  // the correct language is applied — preventing any flash of the wrong language.
  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved === 'ar' || saved === 'en') setLang(saved)
    setReady(true)
  }, [])

  // On lang change: persist to localStorage + sync <html> dir/lang.
  // The `ready` guard prevents this effect from writing to localStorage on the
  // initial render (before the mount effect has had a chance to read the saved value).
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

  return (
    <main className={`relative min-h-screen overflow-hidden bg-[#020617] text-white transition-opacity duration-150 ${ready ? 'opacity-100' : 'opacity-0'}`}>

      {/* ── Background blobs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-32 h-[700px] w-[700px] rounded-full bg-indigo-600/[0.12] blur-[100px]"
          style={{ animation: 'float-blob 18s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-48 -right-48 h-[800px] w-[800px] rounded-full bg-violet-600/[0.10] blur-[120px]"
          style={{ animation: 'float-blob-2 22s ease-in-out infinite' }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-600/[0.07] blur-[80px]"
          style={{ animation: 'float-blob-3 14s ease-in-out infinite' }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Arabic watermark — always present as a bilingual accent */}
        <div
          className="absolute right-[-2rem] top-1/2 -translate-y-1/2 select-none text-[20vw] font-black leading-none tracking-tight text-white/[0.018]"
          aria-hidden="true"
        >
          قريباً
        </div>
      </div>

      {/* ── Nav ── */}
      <nav
        className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10"
        style={{ animation: 'fade-in 0.6s ease-out both' }}
      >
        {/* Logo + product name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-xl shadow-lg shadow-black/40 ring-1 ring-white/10">
            <Image
              src="/logo.png"
              alt="HuloolFuture"
              height={1000}
              width={1000}
              className="h-10 w-10"
              style={logoStyle}
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white">AILine</span>
            <span className="text-[10px] text-zinc-500">{c.byCompany}</span>
          </div>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLang(l => (l === 'en' ? 'ar' : 'en'))}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <svg className="h-3 w-3 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 1.5a8.5 8.5 0 010 13M8 1.5a8.5 8.5 0 000 13M1.5 8h13" strokeLinecap="round" />
          </svg>
          {c.switchLang}
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 px-6 pb-24 pt-12 sm:px-10 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">

          {/* Badge */}
          <div
            className="relative mb-8 inline-flex items-center gap-2 overflow-hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-300"
            style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '0.1s' }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                animation: 'shimmer-sweep 3s ease-in-out infinite',
                animationDelay: '1s',
              }}
            />
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400" style={{ animation: 'ping-ring 1.4s ease-out infinite' }} />
              <span className="relative h-2 w-2 rounded-full bg-indigo-400" />
            </span>
            <span>{c.badge}</span>
          </div>

          {/* Headline */}
          <h1
            className="mb-3 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: '0.2s' }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 40%, #c084fc 70%, #818cf8 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-flow 5s ease infinite',
              }}
            >
              {c.headlineLine1}
            </span>
            <br />
            <span className="text-white">{c.headlineLine2}</span>
          </h1>

          {/* Accent line — always shows the OTHER language, highlighting bilingual nature */}
          <p
            className="mb-4 text-lg font-light text-zinc-500 sm:text-xl"
            style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: '0.28s' }}
          >
            {c.accentLine}
          </p>

          {/* Sub */}
          <p
            className="mb-6 text-sm font-medium uppercase tracking-widest text-zinc-500"
            style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: '0.34s' }}
          >
            {c.sub}
          </p>

          {/* Description */}
          <p
            className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
            style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: '0.4s' }}
          >
            {c.desc}
          </p>

          {/* Email form */}
          <div
            className="mb-8 flex justify-center"
            style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: '0.5s' }}
          >
            {submitted ? (
              <div
                className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-400"
                style={{ animation: 'fade-up 0.5s ease-out both' }}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13.5 4.5L6 12 2.5 8.5" />
                </svg>
                {c.thankYou}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={c.emailPlaceholder}
                  dir="ltr"
                  className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/[0.08]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="relative h-12 overflow-hidden rounded-xl px-6 text-sm font-medium text-white transition-transform active:scale-95 disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-flow 3s ease infinite',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
                      animation: 'shimmer-sweep 3s ease-in-out infinite',
                    }}
                  />
                  <span className="relative">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        {c.notifySaving}
                      </span>
                    ) : c.notifyBtn}
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: '0.6s' }}
          >
            {c.badges.map(b => (
              <span key={b} className="text-xs text-zinc-500">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ── Features ── */}
      <section className="relative z-10 px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p
            className="mb-10 text-center text-xs font-medium uppercase tracking-[0.3em] text-zinc-600"
            style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: '0.65s' }}
          >
            {c.featuresLabel}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {c.features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06]"
                style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: `${0.7 + i * 0.08}s` }}
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${featureMeta[i].gradient} ${featureMeta[i].iconColor} transition-transform duration-300 group-hover:scale-110`}>
                  <div className="h-5 w-5">{featureMeta[i].icon}</div>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-zinc-100">{f.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ── Pricing ── */}
      <section
        className="relative z-10 px-6 py-16 sm:px-10"
        style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: '1.1s' }}
      >
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.3em] text-zinc-600">
            {c.pricingLabel}
          </p>
          <div className="mx-auto grid max-w-lg gap-4 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">{c.free.name}</p>
              <p className="mb-4 text-3xl font-bold text-white">
                {c.free.price}
                <span className="text-sm font-normal text-zinc-500"> {c.free.period}</span>
              </p>
              <ul className="space-y-2 text-sm text-zinc-500">
                {c.free.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-indigo-400">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-violet-600/10 p-6">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                  animation: 'shimmer-sweep 6s ease-in-out infinite',
                  animationDelay: '2s',
                }}
              />
              <div className="mb-1 flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">{c.pro.name}</p>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">{c.pro.badge}</span>
              </div>
              <p className="mb-1 text-3xl font-bold text-white">
                {c.pro.price}
                <span className="text-sm font-normal text-zinc-400"> {c.pro.period}</span>
              </p>
              <p className="mb-4 text-xs text-zinc-500">{c.pro.annual}</p>
              <ul className="space-y-2 text-sm text-zinc-400">
                {c.pro.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-indigo-400">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 px-6 pb-20 sm:px-10">
        <div
          className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-indigo-900/30 via-violet-900/20 to-slate-900/30 p-10 text-center"
          style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: '1.2s' }}
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-indigo-400">
            {c.builtFor}
          </p>
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">{c.ctaTitle}</h2>
          <p className="mb-1 text-base text-zinc-400">{c.ctaQuote}</p>
          <p className="mb-8 text-sm text-zinc-600">{c.ctaQuoteAccent}</p>

          {/* Second notify form */}
          <div className="flex justify-center">
            {submitted ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-sm text-emerald-400">
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13.5 4.5L6 12 2.5 8.5" />
                </svg>
                {c.thankYou}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={c.emailPlaceholder}
                  dir="ltr"
                  className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-indigo-500/60 focus:bg-white/[0.08]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="relative h-12 overflow-hidden rounded-xl px-6 text-sm font-medium text-white active:scale-95 disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-flow 3s ease infinite',
                  }}
                >
                  <span className="relative">{loading ? c.notifySaving : c.notifyBtn}</span>
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-xs text-zinc-600">
            {c.questions}{' '}
            <a href="mailto:admin@huloolfuture.sa" className="text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-300">
              admin@huloolfuture.sa
            </a>
          </p>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-lg shadow-md shadow-black/30 ring-1 ring-white/10">
              <Image
                src="/logo.png"
                alt="HuloolFuture"
                height={1000}
                width={1000}
                className="h-8 w-8"
                style={logoStyle}
              />
            </div>
            <span className="text-xs text-zinc-600">{c.footerBrand}</span>
          </div>
          <p className="text-xs text-zinc-700">{c.copyright}</p>
          <a href="mailto:admin@huloolfuture.sa" className="text-xs text-zinc-700 transition-colors hover:text-zinc-400">
            admin@huloolfuture.sa
          </a>
        </div>
      </footer>

    </main>
  )
}
