import React from 'react'
import { useNavigate } from 'react-router-dom'
import whale from '../../assets/decorative/whale.png'
import tentacles from '../../assets/decorative/tenticles.png'
import img1 from '../../assets/decorative/img1.jpg'
import img2 from '../../assets/decorative/img2.png'
import img3 from '../../assets/decorative/img3.jpg'
import Button from '../Button'
import useInView from '../../hooks/useInView'

export default function AboutUs() {
  const navigate = useNavigate()
  const [sectionRef, inView] = useInView({ threshold: 0.2 })

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-white overflow-hidden flex flex-col items-center px-6 sm:px-10 lg:px-20 py-16 lg:py-24"
    >

      {/* ── WHALE — big, bottom-left ── */}
      <img
        src={whale}
        alt=""
        aria-hidden="true"
        className={`absolute bottom-0 left-0 w-[280px] sm:w-[340px] lg:w-[420px] xl:w-[500px] object-contain pointer-events-none select-none opacity-90
                   transition-all duration-[1100ms] ease-out motion-reduce:transition-none
                   ${inView ? 'translate-y-0 opacity-90' : 'translate-y-12 opacity-0'}`}
        style={{ transform: inView ? 'translate(50%, 4%)' : 'translate(50%, 14%)', transitionDelay: '150ms' }}
      />

      {/* ── TENTACLES — flush to very bottom-right ── */}
      <img
        src={tentacles}
        alt=""
        aria-hidden="true"
        className={`absolute bottom-0 right-0 w-[240px] sm:w-[320px] lg:w-[420px] xl:w-[500px] object-contain pointer-events-none select-none
                   transition-all duration-[1100ms] ease-out motion-reduce:transition-none
                   ${inView ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: inView ? 'translate(8%, 0%)' : 'translate(8%, 10%)', transitionDelay: '250ms' }}
      />

      {/* ── SECTION TITLE ── */}
      <h2
        className={`relative z-10 font-heading font-extrabold uppercase tracking-[0.25em] text-[#355872]
                     text-[clamp(2rem,6vw,4rem)] text-center leading-none mb-12 lg:mb-16
                     transition-all duration-700 ease-out motion-reduce:transition-none
                     ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}
      >
        About Us
      </h2>

      {/* ── MAIN ROW ── */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">

        {/* ── LEFT: description + button ── */}
        <div
          className={`flex flex-col gap-6 lg:gap-8 w-full lg:flex-[1.3] lg:pt-4
                     transition-all duration-700 ease-out motion-reduce:transition-none
                     ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
          style={{ transitionDelay: '150ms' }}
        >
          <p className="font-heading font-semibold text-[#1A2E3B]
                text-[1rem] sm:text-[1.1rem] lg:text-[1.2rem]
                leading-[2.1] tracking-[0.08em] w-full
                text-center lg:text-left">
            WildLifeX is an interactive platform designed to<br className="hidden lg:block" />
            help users explore wildlife and understand how<br className="hidden lg:block" />
            ecosystems connect across land and ocean.<br className="hidden lg:block" />
            Through engaging visuals and intelligent<br className="hidden lg:block" />
            systems, we make learning about nature simple,<br className="hidden lg:block" />
            immersive, and meaningful
          </p>

          <div className="flex justify-center lg:justify-start mt-2">
            <Button
              variant="outline"
              theme="ocean"
              shade="dark"
              size="md"
              onClick={() => navigate('/about')}
              iconEnd={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              }
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* ── RIGHT: fanned image trio ── */}
        <div
          className={`relative flex-shrink-0 w-full max-w-[420px] lg:w-[440px] xl:w-[500px] h-[320px] sm:h-[360px] lg:h-[420px]
                     transition-all duration-700 ease-out motion-reduce:transition-none
                     ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
          style={{ transitionDelay: '250ms' }}
        >

          {/* img1 — left, tilted back */}
          <div
            className={`absolute left-0 top-6 w-[38%] rounded-[1rem] overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.18)]
                       transition-all duration-700 ease-out motion-reduce:transition-none
                       ${inView ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transform: inView ? 'rotate(-4deg) translateY(0)' : 'rotate(-4deg) translateY(24px)',
              zIndex: 1,
              transitionDelay: '350ms',
            }}
          >
            <img src={img1} alt="Wildlife 1"
              className="w-full h-[200px] sm:h-[240px] lg:h-[280px] object-cover block" />
          </div>

          {/* img2 — center, tallest, on top */}
          <div
            className={`absolute left-1/2 top-0 w-[38%] rounded-[1rem] overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.24)]
                       transition-all duration-700 ease-out motion-reduce:transition-none
                       ${inView ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transform: inView ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(24px)',
              zIndex: 3,
              transitionDelay: '450ms',
            }}
          >
            <img src={img2} alt="Wildlife 2"
              className="w-full h-[240px] sm:h-[280px] lg:h-[320px] object-cover block" />
          </div>

          {/* img3 — right, tilted */}
          <div
            className={`absolute right-0 top-6 w-[38%] rounded-[1rem] overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.18)]
                       transition-all duration-700 ease-out motion-reduce:transition-none
                       ${inView ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transform: inView ? 'rotate(4deg) translateY(0)' : 'rotate(4deg) translateY(24px)',
              zIndex: 2,
              transitionDelay: '550ms',
            }}
          >
            <img src={img3} alt="Wildlife 3"
              className="w-full h-[200px] sm:h-[240px] lg:h-[280px] object-cover block" />
          </div>

        </div>
      </div>

    </section>
  )
}