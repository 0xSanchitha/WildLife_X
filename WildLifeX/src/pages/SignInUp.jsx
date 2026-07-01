import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import forestBg from '../assets/backgrounds/auth-forest.jpg'
import oceanBg from '../assets/backgrounds/auth-ocean.jpg'

const API_URL = 'http://127.0.0.1:5000/api/auth'

const SOCIALS = [
  {
    label: 'Facebook',
    icon: React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('path', { d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' })
    ),
  },
  {
    label: 'Twitter',
    icon: React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('path', { d: 'M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 16 2a4.48 4.48 0 0 0-4.47 4.89A12.74 12.74 0 0 1 3 3.8a4.48 4.48 0 0 0 1.39 5.97 4.4 4.4 0 0 1-1.8-.49v.06a4.48 4.48 0 0 0 3.59 4.39 4.52 4.52 0 0 1-2 .08 4.48 4.48 0 0 0 4.18 3.11A9 9 0 0 1 2 19.54 12.74 12.74 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53A8.36 8.36 0 0 0 22 6.92' })
    ),
  },
  {
    label: 'Google',
    icon: React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor' },
      React.createElement('path', { d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z', fill: '#4285F4' }),
      React.createElement('path', { d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z', fill: '#34A853' }),
      React.createElement('path', { d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z', fill: '#FBBC05' }),
      React.createElement('path', { d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z', fill: '#EA4335' })
    ),
  },
]

// ────────────────────────────────────────────────────────────────────────────
// IMPORTANT: these sub-components live OUTSIDE SignInUp.
//
// Before, they were defined inside the SignInUp function body. That meant
// every time SignInUp re-rendered (e.g. on every keystroke, because typing
// calls setUsername/setEmail/setPassword), JavaScript created brand-new
// function objects for Fields/SocialRow/etc. React treats a new function
// reference as a *different component type*, so it unmounted the old
// <input> DOM nodes and mounted new ones from scratch on every keystroke.
// A freshly-mounted input never has focus, which is exactly the
// "type one letter, click back in" bug you saw.
//
// Defining them here means the function reference is stable across
// re-renders, so React just updates props on the existing <input> DOM
// nodes instead of remounting them — focus is preserved.
// ────────────────────────────────────────────────────────────────────────────

const Fields = ({ isLogin, username, setUsername, email, setEmail, password, setPassword }) => (
  <div className="flex flex-col gap-5">
    {!isLogin && (
      <div className="border-b border-white/20 pb-1">
        <input
          type="text"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-transparent font-body text-white placeholder-white/40 text-[0.85rem] outline-none py-1 autofill-fix"
        />
      </div>
    )}
    <div className="border-b border-white/20 pb-1">
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-transparent font-body text-white placeholder-white/40 text-[0.85rem] outline-none py-1 autofill-fix"
      />
    </div>
    <div className="border-b border-white/20 pb-1">
      <input
        type="password"
        placeholder={isLogin ? 'Password' : 'Create Password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-transparent font-body text-white placeholder-white/40 text-[0.85rem] outline-none py-1 autofill-fix"
      />
    </div>
  </div>
)

const SocialRow = () => (
  <div className="flex flex-col items-center gap-3 pt-4 border-t border-white/10">
    <span className="font-body text-white/40 text-[0.7rem] tracking-[0.2em] uppercase">or continue with</span>
    <div className="flex items-center gap-3">
      {SOCIALS.map((s) => (
        <button
          key={s.label}
          aria-label={s.label}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200 cursor-pointer border-none"
        >
          {s.icon}
        </button>
      ))}
    </div>
  </div>
)

const SubmitBtn = ({ isLogin, loading, onClick, extraClass = '' }) => {
  const btnClass = isLogin ? 'bg-[#355872] hover:bg-[#7AAACE]' : 'bg-[#346739] hover:bg-[#79AE6F]'
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full py-3 rounded-full text-[#F2EDC2] font-heading font-semibold text-[0.88rem] tracking-wide transition-all duration-300 cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed ${btnClass} ${extraClass}`}
    >
      {loading ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Sign in' : 'Sign up')}
    </button>
  )
}

const SwitchLink = ({ isLogin, switchToLogin, switchToRegister }) => {
  const linkClass = isLogin ? 'text-[#7AAACE]' : 'text-[#79AE6F]'
  return (
    <p className="text-center font-body text-white/50 text-[0.78rem]">
      {isLogin ? (
        <>New here?{' '}
          <button onClick={switchToRegister} className={`font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 ${linkClass}`}>
            Register here
          </button>
        </>
      ) : (
        <>Already a Member?{' '}
          <button onClick={switchToLogin} className={`font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 ${linkClass}`}>
            Sign in here
          </button>
        </>
      )}
    </p>
  )
}

const ErrorMsg = ({ error }) =>
  error ? (
    <p className="text-red-400 text-[0.78rem] text-center font-body">{error}</p>
  ) : null

export default function SignInUp({ initialMode = 'register' }) {
  const [mode, setMode]         = useState(initialMode)
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const navigate  = useNavigate()
  const isLogin   = mode === 'login'

  const switchToLogin = () => {
    setMode('login')
    setError('')
    navigate('/signin', { replace: true })
  }

  const switchToRegister = () => {
    setMode('register')
    setError('')
    navigate('/signup', { replace: true })
  }

  // ── API handlers ────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    setError('')
    if (!username || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    try {
      setLoading(true)
      const res  = await fetch(`${API_URL}/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message); return }
      // Auto-redirect to sign in after successful registration
      switchToLogin()
    } catch {
      setError('Could not reach the server. Is Flask running?')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    try {
      setLoading(true)
      const res  = await fetch(`${API_URL}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message); return }
      localStorage.setItem('token', data.token)
      // Dispatch 'auth-user' with the username from the login response.
      // The Navbar reads it directly — no extra /me fetch, no race condition.
      window.dispatchEvent(new CustomEvent('auth-user', { detail: { username: data.username } }))
      navigate('/')
    } catch {
      setError('Could not reach the server. Is Flask running?')
    } finally {
      setLoading(false)
    }
  }

  const desktopFormBg = isLogin ? 'bg-[#0a141e]/90' : 'bg-[#0d1a10]/90'

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center">

      {/* Autofill override: browsers force their own white/yellow background
          and dark text on autofilled inputs via the -webkit-autofill pseudo
          state, which ignores normal bg-transparent/text-white classes.
          This forces it back to match the design. */}
      <style>{`
        .autofill-fix:-webkit-autofill,
        .autofill-fix:-webkit-autofill:hover,
        .autofill-fix:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: #ffffff;
        }
      `}</style>

      {/* Backgrounds */}
      <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{ backgroundImage: `url(${forestBg})`, opacity: isLogin ? 0 : 1 }} />
      <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{ backgroundImage: `url(${oceanBg})`, opacity: isLogin ? 1 : 0 }} />
      <div className="absolute inset-0 bg-black/50" />

      {/* ── MOBILE ── */}
      <div className="relative z-10 flex md:hidden w-full max-w-sm mx-4">
        <div className="w-full rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.6)] px-7 py-9 flex flex-col gap-5">
          <h3 className="font-heading font-bold text-white text-[1.4rem]">
            {isLogin ? 'Sign in' : 'Sign up'}
          </h3>
          <Fields
            isLogin={isLogin}
            username={username} setUsername={setUsername}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
          />
          <ErrorMsg error={error} />
          <SubmitBtn isLogin={isLogin} loading={loading} onClick={isLogin ? handleLogin : handleRegister} />
          <SwitchLink isLogin={isLogin} switchToLogin={switchToLogin} switchToRegister={switchToRegister} />
          <SocialRow />
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="relative z-10 hidden md:block w-full max-w-4xl mx-4 rounded-[1.75rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] border border-white/10 min-h-[580px]">

        {/* Text panel */}
        <div
          className="absolute inset-y-0 flex flex-col justify-end p-10 transition-all duration-700 ease-in-out z-10"
          style={{ left: isLogin ? '50%' : '0%', width: '50%' }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="relative z-10">
            <h2 className="font-heading font-extrabold text-white text-[2rem] lg:text-[2.4rem] leading-tight mb-3">
              {isLogin ? 'Welcome Back' : "Let's Get Started"}
            </h2>
            <p className="font-body text-white/70 text-[0.82rem] leading-relaxed max-w-[260px]">
              {isLogin
                ? 'Sign in to continue exploring wildlife and ecosystems across the world.'
                : 'Discover wildlife across diverse ecosystems. Explore species, simulate nature, and learn what connects us all.'}
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div
          className={`absolute inset-y-0 flex flex-col justify-between px-10 py-10 backdrop-blur-xl transition-all duration-700 ease-in-out overflow-y-auto ${desktopFormBg}`}
          style={{ left: isLogin ? '0%' : '50%', width: '50%' }}
        >
          <div className="flex flex-col">
            <h3 className="font-heading font-bold text-white text-[1.5rem] mb-6">
              {isLogin ? 'Sign in' : 'Sign up'}
            </h3>
            <Fields
              isLogin={isLogin}
              username={username} setUsername={setUsername}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
            />
            <ErrorMsg error={error} />
            <SubmitBtn isLogin={isLogin} loading={loading} onClick={isLogin ? handleLogin : handleRegister} extraClass="mt-7 hover:scale-[1.02]" />
            <div className="mt-4">
              <SwitchLink isLogin={isLogin} switchToLogin={switchToLogin} switchToRegister={switchToRegister} />
            </div>
          </div>
          <SocialRow />
        </div>
      </div>
    </div>
  )
}