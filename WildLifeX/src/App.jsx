import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar      from './components/Navbar'
import Footer      from './components/footer'
import Home        from './pages/home'
import Animal      from './pages/animal'
import AnimalDetail from './pages/animaldetails'
import EcoSystem   from './pages/ecosystem'
import About       from './pages/about'
import Contact     from './pages/contact'
import SignInUp    from './pages/SignInUp'
import EcosystemBuilder from './pages/EcosystemBuilder'
import Profile from './pages/Profile'

// ── Scrolls to top on every page change ──────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

// ── Wraps pages that need Navbar + Footer ─────────────────────────────────────
function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

// ── Router ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>

        {/* Auth — no navbar/footer */}
        <Route path="/signin" element={<SignInUp initialMode="login"    />} />
        <Route path="/signup" element={<SignInUp initialMode="register" />} />

        {/* Main pages — with navbar/footer */}
        <Route path="/"          element={<Layout><Home />      </Layout>} />
        <Route path="/animal"    element={<Layout><Animal />    </Layout>} />
        <Route path="/ecosystem" element={<Layout><EcoSystem /> </Layout>} />
        <Route
          path="/ecosystem/:type"
          element={<EcosystemBuilder />}
        />
        <Route path="/about"     element={<Layout><About />     </Layout>} />
        <Route path="/contact"   element={<Layout><Contact />   </Layout>} />
        <Route path="/profile"   element={<Layout><Profile />   </Layout>} />

        {/*
          ── Animal Detail page ──────────────────────────────────────────────
          :id  matches whatever comes after /animal/
          e.g. /animal/snow-leopard   → shows Snow Leopard detail
               /animal/manta-ray     → shows Manta Ray detail

          useParams() inside AnimalDetail.jsx reads this :id value.
        */}
        <Route path="/animal/:id" element={<Layout><AnimalDetail /></Layout>} />

      </Routes>
    </>
  )
}