import React, { useState } from 'react'
import heroBg from '../../assets/backgrounds/Herobg.jpg'
import article1 from '../../assets/articles/article1.jpg'
import article2 from '../../assets/articles/article2.jpg'
import article3 from '../../assets/articles/article3.jpg'

const ARTICLES = [
  {
    id: 1,
    image: article1,
    title: "The surprising hidden glow of one of Earth's largest birds",
    description: 'Scientists were surprised to discover cassowaries glow under ultraviolet light. It may help the birds distinguish between different species.',
    author: 'Taylor Mitchell Brown',
    date: 'April 14, 2026',
  },
  {
    id: 2,
    image: article2,
    title: 'Deep ocean creatures found thriving near volcanic vents',
    description: 'A new expedition reveals extraordinary life forms adapted to extreme heat and pressure on the ocean floor.',
    author: 'Sarah Lennox',
    date: 'April 10, 2026',
  },
  {
    id: 3,
    image: article3,
    title: 'Rainforest canopy holds 50% of all known species',
    description: 'Researchers mapping the Amazon canopy layer have uncovered thousands of previously undocumented plant and insect species.',
    author: 'Marco Reyes',
    date: 'April 6, 2026',
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const article = ARTICLES[current]
  const prev = () => setCurrent((c) => (c === 0 ? ARTICLES.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === ARTICLES.length - 1 ? 0 : c + 1))

  // ── SMOOTH SCROLL WITH CUSTOM EASING ──
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    if (!featuresSection) return

    const startY = window.scrollY
    const targetY = featuresSection.getBoundingClientRect().top + window.scrollY
    const distance = targetY - startY
    const duration = 1200 // ms — tune this for faster/slower

    // Cubic ease-in-out: slow start, fast middle, slow end
    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    let startTime = null

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = easeInOutCubic(progress)

      window.scrollTo(0, startY + distance * ease)

      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  // ── SCROLL WHEEL: snap to features on first downward scroll ──
  const handleWheel = (e) => {
    if (e.deltaY > 30) {
      scrollToFeatures()
    }
  }

  return (
    <section
      className="relative w-screen min-h-screen h-auto lg:h-screen lg:overflow-hidden overflow-visible"
      onWheel={handleWheel}
    >

      {/* ── BACKGROUND IMAGE ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* ── DARK OVERLAY ── */}
      <div className="absolute inset-0 bg-black/55" />

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row items-center justify-start lg:justify-between px-6 sm:px-10 lg:px-38 gap-10 lg:gap-12 pt-28 sm:pt-32 md:pt-36 lg:pt-10 pb-10 lg:pb-0">

        {/* ── LEFT: title + subtitle + button ── */}
        <div className="flex flex-col gap-4 lg:gap-5 items-center lg:items-start text-center lg:text-left">

          <h1 className="leading-none m-0">
            <span className="block font-heading font-extrabold uppercase text-[#F2EDC2] text-[clamp(3.5rem,12vw,8.5rem)]">
              WILD
            </span>
            <span className="block font-heading font-extrabold uppercase text-[#F2EDC2] text-[clamp(3.5rem,12vw,8.5rem)]">
              LIFE <span className="font-display font-normal">X</span>
            </span>
          </h1>

          <p className="font-heading text-[0.85rem] sm:text-[1rem] tracking-[6px] text-[#F7F8F0] opacity-85 leading-loose m-0">
            Discover Wildlife<br />Across Ocean and Land
          </p>

          {/* ── EXPLORE BUTTON → scrolls to features ── */}
          <button
            onClick={scrollToFeatures}
            className="inline-flex items-center gap-2 w-fit px-8 sm:px-10 py-[0.7rem] rounded-full border-2 border-[#F2EDC2] bg-transparent text-[#F2EDC2] font-heading font-semibold text-base cursor-pointer transition-all duration-300 hover:bg-[#F2EDC2]/15"
          >
            Explore
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

        </div>

        {/* ── RIGHT: arrows + glass card ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* LEFT ARROW */}
          <button
            onClick={prev}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-xl bg-white/15 border border-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 cursor-pointer shrink-0"
          >
            ‹
          </button>

          {/* GLASS CARD */}
          <div className="w-[280px] sm:w-[320px] lg:w-[340px] rounded-[1.25rem] overflow-hidden backdrop-blur-md bg-white/12 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col">

            <div className="px-3 pt-3">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-[160px] sm:h-[180px] lg:h-[190px] object-cover block rounded-[0.75rem]"
              />
            </div>

            <div className="p-[1rem] flex flex-col gap-[0.6rem]">

              <h3 className="font-heading font-bold text-[0.9rem] sm:text-[1rem] text-[#F7F8F0] leading-snug m-0">
                {article.title}
              </h3>

              <p className="font-body text-[0.75rem] sm:text-[0.78rem] text-[#F7F8F0]/75 leading-relaxed m-0">
                {article.description}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[0.68rem] text-[#F7F8F0]/60 m-0">
                    By <strong className="text-[#F7F8F0]">{article.author}</strong>
                  </p>
                  <p className="font-body text-[0.68rem] text-[#F7F8F0]/50 m-0">
                    Published {article.date}
                  </p>
                </div>
                <button className="inline-flex items-center gap-1 bg-[#346739] hover:bg-[#79AE6F] border-none rounded-full px-[12px] py-[5px] text-[#F2EDC2] font-heading text-[0.7rem] font-semibold cursor-pointer transition-colors duration-200">
                  Read More ›
                </button>
              </div>

              <div className="flex justify-center gap-[6px] mt-1">
                {ARTICLES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="h-2 rounded-full border-none cursor-pointer transition-all duration-300 p-0"
                    style={{
                      width: i === current ? '20px' : '8px',
                      backgroundColor: i === current ? '#F2EDC2' : 'rgba(247,248,240,0.35)',
                    }}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={next}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-xl bg-white/15 border border-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 cursor-pointer shrink-0"
          >
            ›
          </button>

        </div>

      </div>
    </section>
  )
}