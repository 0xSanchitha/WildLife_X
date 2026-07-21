import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Button from './Button'
import logo from '../assets/icons/WildLifeX.ico'

import { BACKEND_URL } from '../constants/api'

const API_URL = `${BACKEND_URL}/auth`

const NAV_LINKS = [
  { label: 'Home',      to: '/' },
  { label: 'Animal',    to: '/animal' },
  { label: 'EcoSystem', to: '/ecosystem' },
  { label: 'About',     to: '/about' },
  { label: 'Contact',   to: '/contact' },
]

const UserIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
  </svg>
)

const Navbar = () => {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [username,    setUsername]    = useState(null)
  const navigate = useNavigate()
  const profileRef = useRef(null)

  // ── Scroll listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Close the profile dropdown when clicking outside it ───────────────────
  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // ── Auth state ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Full /me fetch — used on mount and after logout
    const fetchUser = () => {
      const token = localStorage.getItem('token')
      if (!token) { setUsername(null); return }
      fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => setUsername(data.username))
        .catch(() => {
          localStorage.removeItem('token')
          setUsername(null)
        })
    }

    // 'auth-user' is dispatched by SignInUp right after login,
    // carrying the username in event.detail so we don't need another fetch.
    const onAuthUser = (e) => {
      if (e.detail?.username) {
        setUsername(e.detail.username)
      } else {
        fetchUser()
      }
    }

    // 'auth-change' is dispatched on logout to clear the state
    const onAuthChange = () => fetchUser()

    fetchUser()                                              // run on mount
    window.addEventListener('auth-user',   onAuthUser)      // instant login update
    window.addEventListener('auth-change', onAuthChange)    // logout clears it
    return () => {
      window.removeEventListener('auth-user',   onAuthUser)
      window.removeEventListener('auth-change', onAuthChange)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUsername(null)
    setProfileOpen(false)
    window.dispatchEvent(new Event('auth-change'))
    navigate('/')
  }

  const handleLinkClick = () => setMenuOpen(false)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <nav className="fixed top-4 left-4 right-4 md:left-10 md:right-10 z-50">
      <div
        className={`relative flex items-center justify-between px-5 md:px-8 py-3 rounded-full border border-white/10 backdrop-blur-md transition-all duration-300
          ${scrolled ? 'bg-neutral-900/65 shadow-lg' : 'bg-neutral-900/35'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="WildLifeX" className="h-8 w-8 object-contain" />
          <span className="font-heading text-lg font-bold tracking-widest text-[#F7F8F0] ml-2 whitespace-nowrap">
            WildLifeX
          </span>
        </div>

        {/* Nav links — desktop */}
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
                      ${isActive ? 'w-6 opacity-100' : 'w-0 opacity-0 group-hover:w-[10px] group-hover:opacity-100'}`}
                  />
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Auth area — desktop */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-3">
            {username ? (
              // ── Logged-in state ──
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 pl-2 pr-3 py-[5px] rounded-full border-[1.5px] border-[#7AAACE]/60 bg-transparent text-[#F7F8F0] cursor-pointer transition-all duration-200 hover:border-[#7AAACE] hover:bg-white/5"
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#7AAACE]/20 text-[#7AAACE]">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <span className="font-heading text-sm font-medium capitalize whitespace-nowrap">
                    {username}
                  </span>
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-40 rounded-2xl border border-white/10 backdrop-blur-md bg-neutral-900/90 shadow-lg overflow-hidden transition-all duration-200 origin-top-right
                    ${profileOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                >
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/profile') }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left font-heading text-sm text-[#F7F8F0] hover:bg-white/10 transition-colors duration-150 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#7AAACE]" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left font-heading text-sm text-[#F7F8F0] hover:bg-white/10 transition-colors duration-150 cursor-pointer border-t border-white/10"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              // ── Logged-out state ──
              <>
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
              </>
            )}
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
          ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="flex flex-col px-6 py-4 gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={handleLinkClick}>
              {({ isActive }) => (
                <div className={`px-3 py-2 rounded-xl font-heading text-sm font-medium tracking-wide transition-colors duration-200
                  ${isActive ? 'text-[#7AAACE] bg-white/10' : 'text-[#F7F8F0] hover:bg-white/5 hover:text-[#7AAACE]'}`}>
                  {link.label}
                </div>
              )}
            </NavLink>
          ))}

          <div className="my-2 border-t border-white/10" />

          {username ? (
            <>
              <button
                onClick={() => { navigate('/profile'); handleLinkClick() }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-heading text-sm font-medium text-[#F7F8F0] hover:bg-white/5 hover:text-[#7AAACE] transition-colors duration-200 cursor-pointer"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#7AAACE]/20 text-[#7AAACE]">
                  <UserIcon className="w-4 h-4" />
                </span>
                <span className="capitalize">{username}</span>
              </button>
              <button
                onClick={() => { handleLogout(); handleLinkClick() }}
                className="w-full py-2 rounded-xl font-heading text-sm font-medium text-[#7AAACE] border border-[#7AAACE] hover:bg-[#7AAACE] hover:text-white transition-colors duration-200 cursor-pointer mt-1"
              >
                Logout
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar