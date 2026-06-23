'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, Calendar, PenTool, Instagram, LayoutGrid, Sparkles,
  ArrowRight, Star, Check, Menu, X, ChevronDown, Quote,
  Wand2, Clock, TrendingUp, Heart,
} from 'lucide-react'

// ── HD images (Unsplash) ───────────────────────────────────────
const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const IMG = {
  hero: 'photo-1560066984-138dadb4c035',
  salon: 'photo-1595476108010-b4d1f102b1b1',
  why: 'photo-1562322140-8baeececf3df',
  s_marca: 'photo-1487412947147-5cebf100ffc2',
  s_plan: 'photo-1551836022-d5d88e9218df',
  s_crear: 'photo-1610992015732-2449b76344bc',
  s_stories: 'photo-1556760544-74068565f05c',
  s_ganchos: 'photo-1573496359142-b8d87734a5a2',
  s_calendar: 'photo-1492106087820-71f1a00d2b11',
  t1: 'photo-1487412947147-5cebf100ffc2',
  t2: 'photo-1573496359142-b8d87734a5a2',
  t3: 'photo-1521590832167-7bcbfaa6381f',
}

// ── Section reveal wrapper ──────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`brave-eyebrow ${light ? '!text-[#C8DEC9]' : ''}`}>{children}</span>
}

const NAV_LINKS = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#como', label: 'Cómo funciona' },
  { href: '#opiniones', label: 'Opiniones' },
  { href: '#faq', label: 'FAQ' },
]

const STATS = [
  { value: '+500', label: 'Salones activos' },
  { value: '+25k', label: 'Publicaciones creadas' },
  { value: '4.9', label: 'Valoración media', star: true },
  { value: '+3M', label: 'Visualizaciones generadas' },
]

const STEPS = [
  { n: '01', icon: <Crown className="w-6 h-6" strokeWidth={1.5} />, title: 'Define tu marca', desc: 'Cuéntanos sobre ti y tu salón. La IA aprende tu tono, tus servicios y tu clienta ideal.' },
  { n: '02', icon: <Wand2 className="w-6 h-6" strokeWidth={1.5} />, title: 'Genera contenido', desc: 'Reels, carruseles, stories y ganchos virales listos en segundos, con tu estilo.' },
  { n: '03', icon: <Calendar className="w-6 h-6" strokeWidth={1.5} />, title: 'Planifica el mes', desc: 'Organiza todo tu calendario de publicaciones sin estrés ni huecos en blanco.' },
  { n: '04', icon: <TrendingUp className="w-6 h-6" strokeWidth={1.5} />, title: 'Crece y convierte', desc: 'Publica con constancia y convierte seguidores en clientas reales para tu salón.' },
]

const SERVICES = [
  { key: 'marca', img: IMG.s_marca, icon: <Crown className="w-5 h-5" strokeWidth={1.5} />, title: 'Mi Marca', desc: 'Define tu identidad y perfil profesional con una ficha de marca inteligente.' },
  { key: 'plan', img: IMG.s_plan, icon: <Calendar className="w-5 h-5" strokeWidth={1.5} />, title: 'Planificar', desc: 'Crea tu plan de contenido semanal o mensual en minutos.' },
  { key: 'crear', img: IMG.s_crear, icon: <PenTool className="w-5 h-5" strokeWidth={1.5} />, title: 'Crear', desc: 'Genera reels, carruseles y contenido completo con un clic.' },
  { key: 'stories', img: IMG.s_stories, icon: <Instagram className="w-5 h-5" strokeWidth={1.5} />, title: 'Stories', desc: 'Convierte tu trabajo diario en stories que venden.' },
  { key: 'ganchos', img: IMG.s_ganchos, icon: <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />, title: 'Banco de Ganchos', desc: 'Ganchos virales generados por IA para tus reels.' },
  { key: 'calendar', img: IMG.s_calendar, icon: <Sparkles className="w-5 h-5" strokeWidth={1.5} />, title: 'Calendario', desc: 'Visualiza y organiza tu agenda de publicaciones.' },
]

const FEATURES = [
  'Contenido adaptado a tu salón y tu tono de voz',
  'Ganchos virales basados en tendencias reales',
  'Biblioteca con todo tu contenido organizado',
  'Asistente experto en marketing capilar 24/7',
  'Calendario editorial completo y editable',
  'Sin diseñadores, sin agencias, sin complicaciones',
]

const TESTIMONIALS = [
  { img: IMG.t1, name: 'Lucía Fernández', role: 'Salón Lumière · Madrid', text: 'Pasé de no saber qué publicar a tener todo el mes planificado. Mis reservas subieron un 40% en dos meses.' },
  { img: IMG.t2, name: 'Andrea Gómez', role: 'Studio AG · Barcelona', text: 'Los ganchos son oro puro. Un reel llegó a 120k visualizaciones y se me llenó la agenda esa semana.' },
  { img: IMG.t3, name: 'Marta Ruiz', role: 'Marta Hair · Valencia', text: 'Es como tener un equipo de marketing dentro del móvil. Ahorro horas cada semana y luce profesional.' },
]

const FAQS = [
  { q: '¿Necesito saber de marketing o diseño?', a: 'Para nada. Bräve Studio hace el trabajo pesado por ti: solo respondes unas preguntas sobre tu salón y la IA genera el contenido listo para publicar.' },
  { q: '¿El contenido suena genérico o robótico?', a: 'No. La IA aprende tu tono, tus servicios y tu clienta ideal, así que todo lo que crea suena a ti y a tu marca.' },
  { q: '¿Puedo editar lo que genera?', a: 'Sí. Todo es 100% editable. Úsalo como base, ajústalo a tu gusto y publícalo cuando quieras.' },
  { q: '¿Sirve para Instagram y TikTok?', a: 'Sí. Reels, carruseles, stories y ganchos funcionan perfecto en Instagram, TikTok y otras redes.' },
  { q: '¿Cuánto tardo en tener mi primer contenido?', a: 'Menos de 5 minutos. Configuras tu marca una vez y empiezas a generar contenido al instante.' },
]

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  return (
    <div className="bg-[#FAF7F2] text-[#2A2A28] overflow-x-hidden">
      {/* ════════ NAV ════════ */}
      <header className="fixed top-0 inset-x-0 z-50 brave-glass-nav border-b border-[rgba(42,42,40,0.06)]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-light tracking-tight">
            Bräve<span className="italic text-[#8BAF8D]"> Studio</span>
          </Link>
          <nav className="hidden md:flex items-center gap-9">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="text-[13px] text-[#5C5C58] hover:text-[#2A2A28] transition-colors font-medium">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2A2A28] text-[#FAF7F2] text-[0.74rem] font-medium tracking-[0.06em] uppercase hover:bg-[#8BAF8D] hover:-translate-y-0.5 transition-all duration-300"
            >
              Entrar
            </Link>
            <button className="md:hidden p-2 -mr-2" onClick={() => setMenuOpen(v => !v)} aria-label="Menú">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#FAF7F2] border-t border-[rgba(42,42,40,0.06)] px-5 py-4 space-y-1">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block py-2.5 text-[#5C5C58] font-medium">
                {l.label}
              </a>
            ))}
            <Link href="/studio" className="block mt-2 text-center px-6 py-3 rounded-full bg-[#2A2A28] text-[#FAF7F2] text-[0.78rem] font-medium tracking-[0.06em] uppercase">
              Entrar
            </Link>
          </div>
        )}
      </header>

      {/* ════════ HERO ════════ */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-5 md:px-8">
        <div className="absolute top-24 -left-32 w-96 h-96 rounded-full bg-[#EEF4EE] -z-0" />
        <div className="absolute -top-10 right-0 w-72 h-72 rounded-full bg-[#C8DEC9]/30 -z-0" />
        <div className="relative max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Eyebrow>Marketing para estilistas y salones</Eyebrow>
            <h1 className="font-serif text-[2.7rem] sm:text-6xl lg:text-[4.4rem] font-light leading-[1.04] tracking-tight mt-5">
              Tu contenido,{' '}
              <span className="italic text-[#8BAF8D]">sin pensar.</span>
            </h1>
            <p className="text-[#5C5C58] text-base md:text-lg font-light leading-relaxed mt-6 max-w-xl">
              Bräve Studio es tu asistente de contenido con inteligencia artificial.
              Planifica, crea y publica reels, stories y carruseles que convierten
              seguidores en clientas reales — todo desde el móvil, en minutos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/studio"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#8BAF8D] text-white text-[0.8rem] font-medium tracking-[0.06em] uppercase hover:bg-[#759E77] hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-[#8BAF8D]/25"
              >
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#como"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-transparent text-[#2A2A28] text-[0.8rem] font-medium tracking-[0.06em] uppercase border border-[#2A2A28]/20 hover:bg-[#2A2A28] hover:text-[#FAF7F2] transition-all duration-300"
              >
                Cómo funciona
              </a>
            </div>
            <div className="mt-9 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[IMG.t1, IMG.t3, IMG.t2].map((p, i) => (
                  <img key={i} src={img(p, 80)} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#FAF7F2]" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-[#C9A96E]">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="text-[12px] text-[#5C5C58] mt-0.5">+500 estilistas confían en Bräve</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[28px] overflow-hidden shadow-2xl aspect-[4/5] max-w-md mx-auto lg:max-w-none">
              <img src={img(IMG.hero, 1000)} alt="Estilista trabajando en el salón" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A2A28]/30 to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="absolute -left-3 sm:-left-6 top-10 bg-white rounded-2xl shadow-xl p-4 brave-float"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEF4EE] text-[#8BAF8D] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-serif text-2xl font-light leading-none text-[#2A2A28]">+40%</p>
                  <p className="text-[11px] text-[#9A9A94]">más reservas</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="absolute -right-2 sm:-right-5 bottom-12 bg-white rounded-2xl shadow-xl px-4 py-3"
            >
              <div className="flex items-center gap-2 text-[#C9A96E] mb-1">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
              </div>
              <p className="text-[11px] text-[#5C5C58] max-w-[140px] leading-snug">“120k visualizaciones en un reel”</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ TRUST BAR (dark) ════════ */}
      <section className="bg-[#2A2A28] text-[#FAF7F2] py-12 md:py-16 px-5 md:px-8">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <Reveal key={i} delay={i * 0.08} className="text-center">
              <p className="font-serif text-4xl md:text-5xl font-light flex items-center justify-center gap-1">
                {s.value}{s.star && <Star className="w-6 h-6 fill-[#C9A96E] text-[#C9A96E]" />}
              </p>
              <p className="text-[12px] md:text-[13px] text-[#FAF7F2]/55 mt-2 tracking-wide">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section id="como" className="py-20 md:py-28 px-5 md:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <div className="flex justify-center"><Eyebrow>Cómo funciona</Eyebrow></div>
            <h2 className="font-serif text-3xl md:text-5xl font-light mt-4 leading-tight">
              De cero a publicar en <span className="italic text-[#8BAF8D]">cuatro pasos</span>
            </h2>
            <p className="text-[#5C5C58] font-light mt-4">Sin agencias, sin diseñadores, sin perder horas frente a la pantalla.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="relative h-full p-7 rounded-[24px] bg-[#FAF7F2] border border-[rgba(42,42,40,0.06)] brave-card-hover">
                  <span className="font-serif text-5xl font-light text-[#C8DEC9] leading-none">{s.n}</span>
                  <div className="w-12 h-12 rounded-xl bg-[#EEF4EE] text-[#8BAF8D] flex items-center justify-center mt-5 mb-4">
                    {s.icon}
                  </div>
                  <h3 className="font-serif text-xl font-medium">{s.title}</h3>
                  <p className="text-[14px] text-[#9A9A94] font-light leading-relaxed mt-2">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SERVICES ════════ */}
      <section id="servicios" className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="max-w-2xl mb-14">
            <Eyebrow>Todo lo que necesitas</Eyebrow>
            <h2 className="font-serif text-3xl md:text-5xl font-light mt-4 leading-tight">
              Un estudio de contenido <span className="italic text-[#8BAF8D]">completo</span>
            </h2>
            <p className="text-[#5C5C58] font-light mt-4">
              Herramientas pensadas para el día a día de un salón. Desde tu identidad de marca
              hasta el calendario de publicaciones — todo en un solo lugar.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <Reveal key={s.key} delay={(i % 3) * 0.08}>
                <Link href="/studio" className="group block rounded-[24px] overflow-hidden bg-white border border-[rgba(42,42,40,0.06)] brave-card-hover h-full">
                  <div className="relative h-44 overflow-hidden">
                    <img src={img(s.img, 700)} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A2A28]/55 to-transparent" />
                    <div className="absolute bottom-3 left-3 w-11 h-11 rounded-xl bg-white/90 backdrop-blur text-[#8BAF8D] flex items-center justify-center shadow">
                      {s.icon}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-medium">{s.title}</h3>
                      <ArrowRight className="w-4 h-4 text-[#C8DEC9] group-hover:text-[#8BAF8D] group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-[14px] text-[#9A9A94] font-light leading-relaxed mt-2">{s.desc}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ WHY BRÄVE (2-col) ════════ */}
      <section className="py-20 md:py-28 px-5 md:px-8 bg-[#F2ECE3]">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal>
            <div className="relative">
              <div className="rounded-[28px] overflow-hidden shadow-2xl aspect-[4/3]">
                <img src={img(IMG.why, 900)} alt="Salón de peluquería" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-2 sm:right-6 bg-[#8BAF8D] text-white rounded-2xl p-5 shadow-xl max-w-[200px]">
                <Heart className="w-6 h-6 mb-2" strokeWidth={1.5} />
                <p className="font-serif text-lg font-light leading-tight">Hecho por y para profesionales del cabello</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Eyebrow>Por qué Bräve</Eyebrow>
            <h2 className="font-serif text-3xl md:text-5xl font-light mt-4 leading-tight">
              Menos pantalla,<br /><span className="italic text-[#8BAF8D]">más tijeras.</span>
            </h2>
            <p className="text-[#5C5C58] font-light mt-4 leading-relaxed">
              Sabemos que tu tiempo está detrás del sillón, no editando vídeos. Por eso Bräve hace
              el contenido por ti, con tu estilo, para que tú te dediques a lo que amas.
            </p>
            <ul className="mt-8 space-y-3.5">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#8BAF8D] text-white flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-[15px] text-[#2A2A28] font-light">{f}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ════════ TESTIMONIALS (dark) ════════ */}
      <section id="opiniones" className="py-20 md:py-28 px-5 md:px-8 bg-[#2A2A28] text-[#FAF7F2]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex justify-center"><Eyebrow light>Opiniones</Eyebrow></div>
            <h2 className="font-serif text-3xl md:text-5xl font-light mt-4 leading-tight">
              Salones que ya crecen con <span className="italic text-[#8BAF8D]">Bräve</span>
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="h-full rounded-[24px] bg-white/[0.04] border border-white/10 p-7">
                  <Quote className="w-8 h-8 text-[#8BAF8D] mb-4" />
                  <div className="flex items-center gap-0.5 text-[#C9A96E] mb-4">
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                  <p className="text-[15px] text-[#FAF7F2]/85 font-light leading-relaxed">“{t.text}”</p>
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/10">
                    <img src={img(t.img, 80)} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-[12px] text-[#FAF7F2]/50">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA BANNER (sage) ════════ */}
      <section className="px-5 md:px-8 py-16 md:py-20">
        <Reveal className="max-w-[1100px] mx-auto">
          <div className="relative overflow-hidden rounded-[32px] bg-[#8BAF8D] text-white px-7 md:px-16 py-14 md:py-20 text-center">
            <div className="absolute -top-16 -left-10 w-64 h-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-white/10" />
            <div className="relative">
              <Clock className="w-10 h-10 mx-auto mb-5" strokeWidth={1.25} />
              <h2 className="font-serif text-3xl md:text-5xl font-light leading-tight max-w-2xl mx-auto">
                Empieza hoy. Tu próximo reel viral está a un clic.
              </h2>
              <p className="text-white/80 font-light mt-4 max-w-lg mx-auto">
                Configura tu marca en menos de 5 minutos y deja que Bräve cree tu contenido del mes.
              </p>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 mt-8 px-9 py-4 rounded-full bg-white text-[#2A2A28] text-[0.8rem] font-medium tracking-[0.06em] uppercase hover:bg-[#FAF7F2] hover:-translate-y-0.5 transition-all duration-300 shadow-lg"
              >
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════ FAQ ════════ */}
      <section id="faq" className="py-16 md:py-24 px-5 md:px-8">
        <div className="max-w-[820px] mx-auto">
          <Reveal className="text-center mb-12">
            <div className="flex justify-center"><Eyebrow>Preguntas frecuentes</Eyebrow></div>
            <h2 className="font-serif text-3xl md:text-5xl font-light mt-4">Todo lo que quieres saber</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const open = faqOpen === i
              return (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="rounded-2xl bg-white border border-[rgba(42,42,40,0.08)] overflow-hidden">
                    <button
                      onClick={() => setFaqOpen(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="font-medium text-[15px] md:text-base">{f.q}</span>
                      <ChevronDown className={`w-5 h-5 text-[#8BAF8D] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 text-[14px] md:text-[15px] text-[#5C5C58] font-light leading-relaxed">{f.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════ FOOTER (dark) ════════ */}
      <footer className="bg-[#2A2A28] text-[#FAF7F2] pt-16 pb-8 px-5 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div>
              <p className="font-serif text-2xl font-light">Bräve<span className="italic text-[#8BAF8D]"> Studio</span></p>
              <p className="text-[13px] text-[#FAF7F2]/50 font-light leading-relaxed mt-4 max-w-xs">
                El asistente de contenido con IA para estilistas y dueñas de salón.
                Tu contenido, sin pensar.
              </p>
              <div className="flex items-center gap-1 text-[#C9A96E] mt-5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                <span className="text-[12px] text-[#FAF7F2]/50 ml-2">4.9 · +500 salones</span>
              </div>
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-[0.12em] text-[#8BAF8D] mb-4">Producto</p>
              <ul className="space-y-2.5 text-[14px] text-[#FAF7F2]/60 font-light">
                <li><a href="#servicios" className="hover:text-[#FAF7F2] transition-colors">Servicios</a></li>
                <li><a href="#como" className="hover:text-[#FAF7F2] transition-colors">Cómo funciona</a></li>
                <li><a href="#opiniones" className="hover:text-[#FAF7F2] transition-colors">Opiniones</a></li>
                <li><Link href="/studio" className="hover:text-[#FAF7F2] transition-colors">Entrar al estudio</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-[0.12em] text-[#8BAF8D] mb-4">Recursos</p>
              <ul className="space-y-2.5 text-[14px] text-[#FAF7F2]/60 font-light">
                <li><a href="#faq" className="hover:text-[#FAF7F2] transition-colors">Preguntas frecuentes</a></li>
                <li><Link href="/studio" className="hover:text-[#FAF7F2] transition-colors">Banco de ganchos</Link></li>
                <li><Link href="/studio" className="hover:text-[#FAF7F2] transition-colors">Asistente IA</Link></li>
                <li><Link href="/studio" className="hover:text-[#FAF7F2] transition-colors">Biblioteca</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-[0.12em] text-[#8BAF8D] mb-4">Empieza ahora</p>
              <p className="text-[14px] text-[#FAF7F2]/60 font-light leading-relaxed mb-4">
                Crea tu primer contenido en menos de 5 minutos.
              </p>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#8BAF8D] text-white text-[0.74rem] font-medium tracking-[0.06em] uppercase hover:bg-[#759E77] transition-colors"
              >
                Empezar gratis <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#FAF7F2]/40">
            <p>© 2026 Bräve Studio. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[#FAF7F2] transition-colors">Privacidad</a>
              <a href="#" className="hover:text-[#FAF7F2] transition-colors">Términos</a>
              <a href="#" className="hover:text-[#FAF7F2] transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
