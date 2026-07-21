import React, { useState, useEffect, useRef } from 'react'
import AnimalCard  from '../components/animals/AnimalCard'
import AnimalModal from '../components/animals/AnimalModal'
import FilterBar   from '../components/animals/FilterBar'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export const FILTERS = ['All', 'Mammals', 'Birds', 'Reptiles', 'Fish', 'Amphibians']

export default function AnimalListing() {
  const [animals, setAnimals]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [query, setQuery]               = useState('')
  const [selected, setSelected]         = useState(null)

  // ── Fetch from MongoDB via Flask ──────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/animals/`)
      .then(async (r) => {
        console.log("Status:", r.status)

        const text = await r.text()
        console.log("Response:", text)

        return JSON.parse(text)
      })
      .then(data => { setAnimals(data); setLoading(false) })
      .catch(err  => { setError(err.message); setLoading(false) })
  }, [])

  // ── Filter / search ───────────────────────────────────────────────────────
  const filtered = animals.filter(a => {
    const matchesFilter = activeFilter === 'All' || a.category === activeFilter
    const matchesQuery  =
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      (a.habitat ?? '').toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  // ── Render states ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="font-heading text-[#555] tracking-widest text-sm animate-pulse">
        Loading species…
      </p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="font-heading text-[#E04040] text-sm">
        Failed to load animals: {error}
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EEE8]">
      <style>{`
        @keyframes cardIn { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
        input::placeholder { color: #444; }
      `}</style>

      {/* ── Header ── */}
      <header className="max-w-[80rem] mx-auto px-6 pt-16 pb-12 flex flex-col gap-3">
        <p className="font-heading font-medium text-[0.72rem] tracking-[0.25em] uppercase text-[#7AAACE]">
          Wildlife Catalogue
        </p>
        <h1 className="font-heading font-bold text-[clamp(2rem,6vw,4rem)] leading-none text-[#F0EEE8]">
          The Animals
        </h1>
        <p className="font-body text-[0.9rem] text-[#555] max-w-[480px] leading-[1.7]">
          {filtered.length} species listed · Explore, filter, and learn.
        </p>
      </header>

      {/* ── Filter Bar ── */}
      <FilterBar
        active={activeFilter}
        onChange={v => setActiveFilter(v)}
        query={query}
        onQueryChange={v => setQuery(v)}
      />

      {/* ── Grid ── */}
      <main className="max-w-[80rem] mx-auto px-6 pt-12 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20 font-heading text-[#444] text-base">
            No animals found. Try a different search.
          </div>
        ) : (
          <div
            className="grid gap-7"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}
          >
            {filtered.map((animal, i) => (
              <div
                key={animal._id}
                // ── CSS animation instead of IntersectionObserver ──
                // This avoids the blank-card bug when filter/search changes
                style={{
                  animation: `cardIn 0.5s ease both`,
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <AnimalCard animal={animal} onClick={setSelected} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ── */}
      {selected && <AnimalModal animal={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}