import React from 'react'
import { useNavigate } from 'react-router-dom'
import featureBg from '../../assets/backgrounds/feature.jpg'
import featureAnimal from '../../assets/articles/feature1.jpg'
import featureEco from '../../assets/articles/feature2.jpg'

const FEATURES = [
  {
    id: 1,
    image: featureAnimal,
    category: 'Animal',
    title: 'Explorer',
    description: `Discover wildlife across diverse ecosystems with rich visuals and essential information. Learn about each species' habitat, diet, and role in nature.`,
    path: '/animal',
  },
  {
    id: 2,
    image: featureEco,
    category: 'Ecosystem',
    title: 'Simulator',
    description:
      'Build and observe dynamic ecosystems where animals interact through real-world relationships like predation, reproduction, and survival.',
    path: '/ecosystem',
  },
]

export default function Features() {
  const navigate = useNavigate()

  return (
    <section id="features" className="relative w-full min-h-screen lg:h-screen overflow-hidden">

      {/* ── BACKGROUND IMAGE ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${featureBg})` }}
      />

      {/* ── DARK OVERLAY ── */}
      <div className="absolute inset-0 bg-black/65" />

      {/* ── CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center px-6 sm:px-10 lg:px-20
                      py-20 lg:py-0
                      lg:h-full lg:justify-center
                      pt-20 lg:pt-[var(--navbar-height,80px)]
                      gap-10 lg:gap-8">

        {/* ── SECTION TITLE ── */}
        <h2 className="font-heading font-extrabold uppercase tracking-[0.25em] text-[#F2EDC2]
                       text-[clamp(1.75rem,4vw,3rem)]
                       text-center leading-none m-0">
          Our Features
        </h2>

        {/* ── CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full max-w-4xl">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              className="flex flex-col rounded-[1.25rem] overflow-hidden
                         backdrop-blur-md bg-white/10 border border-white/15
                         shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                         transition-transform duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="px-4 pt-4">
                <img
                  src={f.image}
                  alt={f.title}
                  className="w-full h-[160px] lg:h-[170px] object-cover rounded-[0.75rem] block"
                />
              </div>

              {/* Card body */}
              <div className="flex flex-col items-center text-center gap-2 px-6 py-4 lg:py-4">

                {/* Category label */}
                <p className="font-heading text-[0.72rem] font-medium tracking-[0.2em] uppercase text-[#F2EDC2]/70 m-0">
                  {f.category}
                </p>

                {/* Big title */}
                <h3 className="font-heading font-bold text-[1.4rem] lg:text-[1.5rem] text-[#F7F8F0] leading-none m-0">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="font-body text-[0.8rem] text-[#F7F8F0]/70 leading-relaxed m-0 max-w-[300px]">
                  {f.description}
                </p>

                {/* Explore button */}
                <button
                  onClick={() => navigate(f.path)}
                  className="mt-1 inline-flex items-center gap-2 px-7 py-[0.5rem]
                             rounded-full border-2 border-[#F2EDC2] bg-transparent
                             text-[#F2EDC2] font-heading font-semibold text-[0.78rem]
                             cursor-pointer transition-all duration-300
                             hover:bg-[#F2EDC2]/15">
                  Explore
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}