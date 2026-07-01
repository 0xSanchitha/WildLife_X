import React from 'react'
import { Link } from 'react-router-dom'
import footerBg from '../assets/backgrounds/footer.jpg'

const FOOTER_LINKS = [
  { label: 'Home',      to: '/' },
  { label: 'Animals',   to: '/animal' },
  { label: 'EcoSystem', to: '/ecosystem' },
  { label: 'About',     to: '/about' },
  { label: 'Contact',   to: '/contact' },
]

const SOCIALS = [
  {
    label: 'Facebook',
    href: '#',
    icon: React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('path', { d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' })
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('rect', { x: 2, y: 2, width: 20, height: 20, rx: 5, ry: 5 }),
      React.createElement('circle', { cx: 12, cy: 12, r: 4 }),
      React.createElement('circle', { cx: 17.5, cy: 6.5, r: 1, fill: 'currentColor', stroke: 'none' })
    ),
  },
  {
    label: 'Twitter',
    href: '#',
    icon: React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('path', { d: 'M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 16 2a4.48 4.48 0 0 0-4.47 4.89A12.74 12.74 0 0 1 3 3.8a4.48 4.48 0 0 0 1.39 5.97A4.4 4.4 0 0 1 2 9.13v.06a4.48 4.48 0 0 0 3.59 4.39 4.52 4.52 0 0 1-2 .08 4.48 4.48 0 0 0 4.18 3.11A9 9 0 0 1 2 19.54 12.74 12.74 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53A8.36 8.36 0 0 0 22 6.92' })
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('path', { d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' }),
      React.createElement('rect', { x: 2, y: 9, width: 4, height: 12 }),
      React.createElement('circle', { cx: 4, cy: 4, r: 2 })
    ),
  },
]

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden">

      <div className="relative bg-[#0d0f0f] flex flex-col items-center text-center px-6 sm:px-10 lg:px-20 pt-14 pb-10 gap-5">
        <h2 className="font-heading font-extrabold uppercase text-white tracking-[0.18em] text-[2rem] sm:text-[2.8rem] lg:text-[3.2rem] leading-none m-0">
          WILDLIFE X
        </h2>
        <p className="font-heading text-white/60 text-[0.8rem] sm:text-[0.95rem] lg:text-[1.05rem] tracking-[0.22em] leading-relaxed max-w-2xl">
          Exploring ecosystems across ocean and land through interactive learning.
        </p>
        <div className="w-full max-w-5xl h-px bg-white/20 mt-2" />
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(' + footerBg + ')' }} />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-10 lg:px-20 pt-10 pb-10 gap-8 sm:gap-10">

          <nav className="flex flex-wrap justify-center gap-x-8 sm:gap-x-14 lg:gap-x-20 gap-y-3">
            {FOOTER_LINKS.map(function(link) {
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={function() { window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="font-heading font-semibold text-white/80 text-[0.82rem] sm:text-[0.9rem] tracking-[0.12em] hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            {SOCIALS.map(function(s) {
              return (
                <a key={s.label} href={s.href} aria-label={s.label} className="w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-[0.75rem] flex items-center justify-center text-white backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:bg-white/20 hover:scale-105 transition-all duration-200">
                  {s.icon}
                </a>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
            <span className="font-body text-white/70 text-[0.8rem] sm:text-[0.85rem] tracking-wide">+94 71 22 44 125</span>
            <span className="hidden sm:block text-white/30 mx-4">|</span>
            <span className="font-body text-white/70 text-[0.8rem] sm:text-[0.85rem] tracking-wide">wildlifex@gmail.com</span>
          </div>

          <p className="font-heading font-semibold text-white/60 text-[0.75rem] sm:text-[0.8rem] tracking-wide">
            2026 WildLifeX. All rights reserved.
          </p>

        </div>
      </div>

    </footer>
  )
}