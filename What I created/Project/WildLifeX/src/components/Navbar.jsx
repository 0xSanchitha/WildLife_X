import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import Button from './Button'
import logo from '../assets/icons/WildLifeX.ico'

const NAV_LINKS = [
  { label: 'Home',      to: '/' },
  { label: 'Animal',    to: '/animal' },
  { label: 'EcoSystem', to: '/ecosystem' },
  { label: 'About',     to: '/about' },
  { label: 'Contact',   to: '/contact' },
]

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [location])

  const handleLinkClick = () => setMenuOpen(false)

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="fixed top-4 left-4 right-4 md:left-10 md:right-10 z-50">
      <div
        className={`relative flex items-center justify-between px-5 md:px-8 py-3 rounded-full border border-white/10 backdrop-blur-md transition-all duration-300
          ${scrolled ? 'bg-neutral-900/65 shadow-lg' : 'bg-neutral-900/35'}`}
      >

        <div className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="WildLifeX" className="h-8 w-8 object-contain" />
          <span className="font-heading text-lg font-bold tracking-widest text-[#F7F8F0] ml-2 whitespace-nowrap">
            WildLifeX
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              {({ isActive }) => (
                <div className="group flex flex-col items-center gap-[5px]">
                  <span className="font-heading text-sm font-medium tracking-wide text-[#F7F8F0]">
                    {link.label}
                  </span>
                  <span
                    className={`block h-[3px] rounded-full bg-[#7AAACE] transition-all duration-300
                      ${isActive
                        ? 'w-6 opacity-100'
                        : 'w-0 opacity-0 group-hover:w-[10px] group-hover:opacity-100'
                      }`}
                  />
                </div>
              )}
            </NavLink>
          ))}
        </div>

          {/* signin signup */}
        <div className="flex items-center gap-2 shrink-0">

          
          <div className="hidden lg:flex items-center">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/signin')}
              style={{ position: 'relative', zIndex: 10, paddingRight: '1.75rem' }}
            >
              Sign In
            </Button>
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center justify-center -ml-7 pl-9 pr-5 py-[6px] rounded-full border-[1.5px] border-[#7AAACE] bg-white text-[#7AAACE] text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-[#7AAACE] hover:text-white hover:scale-[1.04]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Sign Up
            </button>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px] cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-[2px] bg-[#F7F8F0] rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-5 h-[2px] bg-[#F7F8F0] rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[2px] bg-[#F7F8F0] rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>

        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      <div
        className={`lg:hidden mt-2 mx-2 rounded-2xl border border-white/10 backdrop-blur-md bg-neutral-900/80 overflow-hidden transition-all duration-300
          ${menuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="flex flex-col px-6 py-4 gap-1">

          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={handleLinkClick}
            >
              {({ isActive }) => (
                <div className={`px-3 py-2 rounded-xl font-heading text-sm font-medium tracking-wide transition-colors duration-200
                  ${isActive ? 'text-[#7AAACE] bg-white/10' : 'text-[#F7F8F0] hover:bg-white/5 hover:text-[#7AAACE]'}`}>
                  {link.label}
                </div>
              )}
            </NavLink>
          ))}

          <div className="my-2 border-t border-white/10" />

          <button
            onClick={() => { navigate('/signin'); handleLinkClick() }}
            className="w-full py-2 rounded-xl font-heading text-sm font-medium text-[#F7F8F0] bg-[#355872] hover:bg-[#7AAACE] transition-colors duration-200 cursor-pointer border-none"
          >
            Sign In
          </button>
          <button
            onClick={() => { navigate('/signup'); handleLinkClick() }}
            className="w-full py-2 rounded-xl font-heading text-sm font-medium text-[#7AAACE] border border-[#7AAACE] hover:bg-[#7AAACE] hover:text-white transition-colors duration-200 cursor-pointer mt-1"
          >
            Sign Up
          </button>

        </div>
      </div>
    </nav>
  )
}

export default Navbar