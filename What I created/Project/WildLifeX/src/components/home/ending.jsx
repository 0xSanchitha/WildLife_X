import React from 'react'
import bush from '../../assets/decorative/bush.png'

const STATS = [
  { label: 'Users',   value: '274' },
  { label: 'Animals', value: '120' },
  { label: 'Reviews', value: '102' },
]

const REVIEWS = [
  {
    id: 1,
    text: 'WildLifeX completely changed how I learn about animals. The ecosystem simulator is unlike anything I have seen before.',
    name: 'Jamie Thornton',
    avatar: null,
  },
  {
    id: 2,
    text: 'An immersive experience that blends education and exploration beautifully. Highly recommended for nature lovers.',
    name: 'Priya Menon',
    avatar: null,
  },
]

export default function Ending() {
  return (
    <section className="relative w-full bg-white overflow-hidden pb-0">

      {/* ── BUSH — bottom-left ── */}
      <img
        src={bush}
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-[200px] sm:w-[280px] lg:w-[360px] object-contain pointer-events-none select-none z-0"
        style={{ transform: 'translate(-4%, 0%)' }}
      />

      {/* ── BUSH — bottom-right (flipped) ── */}
      <img
        src={bush}
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 right-0 w-[180px] sm:w-[240px] lg:w-[300px] object-contain pointer-events-none select-none z-10"
        style={{ transform: 'translate(4%, 0%) scaleX(-1)' }}
      />

      {/* ── BUSH — mid-right (between stat & review cards) ── */}
      <img
        src={bush}
        alt=""
        aria-hidden="true"
        className="absolute right-0 w-[140px] sm:w-[200px] lg:w-[260px] object-contain pointer-events-none select-none z-10"
        style={{ top: '12%', transform: 'translate(16%, -50%) scaleX(-1)' }}
      />

      {/* ── CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center px-5 sm:px-10 lg:px-16 xl:px-24 pt-14 pb-32 sm:pb-40 lg:pb-48 gap-10 lg:gap-12 max-w-5xl mx-auto">

        {/* ── QUOTE ── */}
        <div className="w-full flex flex-col items-center text-center gap-3 px-2 sm:px-8 lg:px-12">
          <p className="font-display text-[#1A2E3B] text-[1.3rem] sm:text-[1.6rem] lg:text-[2rem] xl:text-[2.2rem] leading-snug italic">
            "Look deep into nature, and then you will understand everything better."
          </p>
          <p className="font-heading font-semibold text-[0.75rem] sm:text-[0.85rem] text-[#355872] tracking-widest self-end pr-2">
            - Albert Einstein
          </p>
        </div>

        {/* ── DIVIDER ── */}
        <div className="w-full max-w-3xl h-[2px] rounded-full bg-[#346739]/40" />

        {/* ── STATS CARD ── */}
        <div className="w-full rounded-[1.25rem] bg-[#346739] px-6 sm:px-10 py-8 sm:py-10 grid grid-cols-3 gap-4 shadow-[0_8px_32px_rgba(52,103,57,0.25)]">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2 sm:gap-3">
              <p className="font-heading font-bold text-[#79AE6F] text-[0.8rem] sm:text-[1rem] lg:text-[1.1rem] uppercase tracking-widest">
                {s.label}
              </p>
              <p className="font-heading font-extrabold text-[#F2EDC2] text-[2rem] sm:text-[3rem] lg:text-[3.5rem] leading-none">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── REVIEWS ── */}
        <div className="w-full flex flex-col gap-5">
          {REVIEWS.map((r) => (
            <div
              key={r.id}
              className="w-full rounded-[1.25rem] bg-[#79AE6F] px-5 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-[0_4px_20px_rgba(52,103,57,0.2)]"
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] lg:w-[120px] lg:h-[120px] rounded-[0.75rem] bg-[#c8c8c8]/60 overflow-hidden flex items-end justify-center">
                {r.avatar ? (
                  <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  /* Generic user silhouette */
                  <svg viewBox="0 0 100 110" className="w-[80%] opacity-60" fill="#888">
                    <circle cx="50" cy="35" r="24" />
                    <ellipse cx="50" cy="95" rx="38" ry="28" />
                  </svg>
                )}
              </div>

              {/* Quote */}
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <p className="font-body text-[#F2EDC2] text-[1rem] sm:text-[1.15rem] lg:text-[1.25rem] italic leading-relaxed">
                  "{r.text}"
                </p>
                <p className="font-heading font-semibold text-[#F2EDC2]/80 text-[0.75rem] sm:text-[0.8rem] tracking-widest self-center sm:self-end">
                  - {r.name}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}