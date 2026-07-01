import React, { useState, useEffect, useRef } from 'react'
import { ANIMALS } from '../components/animals/data'
import AnimalCard  from '../components/animals/AnimalCard'
import AnimalModal from '../components/animals/AnimalModal'
import FilterBar   from '../components/animals/FilterBar'

const API_BASE = "http://localhost:5000";

export default function AnimalListing() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [query, setQuery]               = useState('')
  const [selected, setSelected]         = useState(null)
  const [animalsList, setAnimalsList]   = useState([])
  const [visible, setVisible]           = useState([])
  const cardRefs = useRef([])

  // Fetch live animals from database on mount
  useEffect(() => {
    fetch(`${API_BASE}/animals`)
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(data => {
        // Map database schema to card properties
        const mapped = data.map(a => ({
          ...a,
          image: a.images && a.images.length > 0 ? a.images[0] : a.image,
          status: a.conservationStatus || a.status || "Least Concern"
        }));
        setAnimalsList(mapped);
      })
      .catch(err => {
        console.warn("Flask server offline. Falling back to static catalog list.", err);
        // Fallback to local catalog
        setAnimalsList(ANIMALS);
      });
  }, []);

  const filtered = animalsList.filter(a => {
    const matchesFilter = activeFilter === 'All' || a.category === activeFilter
    const matchesQuery  =
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.habitat.toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  useEffect(() => {
    setVisible([])
    cardRefs.current = []
  }, [activeFilter, query, animalsList])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index)
            setVisible(prev => [...new Set([...prev, idx])])
          }
        })
      },
      { threshold: 0.1 }
    )
    cardRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [filtered.length])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EEE8]">
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
        @keyframes cardIn  { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
        input::placeholder { color: #444; }
      `}</style>

      {/* ── Header ── */}
      <header className="max-w-[80rem] mx-auto pt-28 px-6 pb-12 flex flex-col gap-3">
        <p className="font-heading font-medium text-[0.72rem] tracking-[0.25em] uppercase text-[#7AAACE]">
          Wildlife Catalogue
        </p>
        <h1 className="font-heading font-bold text-[clamp(2rem,6vw,4rem)] leading-none text-[#F0EEE8]">
          The Animals
        </h1>
        <p className="font-body text-[0.9rem] text-[#666] max-w-[480px] leading-[1.7]">
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
          <div className="grid gap-7"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}
          >
            {filtered.map((animal, i) => (
              <div
                key={animal.id}
                data-index={i}
                ref={el => { cardRefs.current[i] = el }}
                style={{
                  opacity: 1,
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