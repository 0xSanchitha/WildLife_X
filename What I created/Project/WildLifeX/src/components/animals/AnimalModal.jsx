import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'   // ← NEW
import { HABITAT_STYLES, STATUS_STYLES } from './styles'

export default function AnimalModal({ animal, onClose }) {
  const navigate = useNavigate()   // ← NEW

  // Close on Escape key
  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  if (!animal) return null

  const habitat = HABITAT_STYLES[animal.habitat] || HABITAT_STYLES['Forest']
  const status  = STATUS_STYLES[animal.status]   || { color: '#888' }

  // ── Navigate to detail page and close the modal ───────────────────────────
  //    animal.id must be a URL-safe string like "snow-leopard"
  //    If your data uses numeric ids, change to: `/animal/${animal.id}`
  function handleLearnMore() {
    onClose()                                 // close modal first
    navigate(`/animal/${animal.id}`)          // go to detail page
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-[8px]
                 flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[#161616] rounded-[1.25rem] overflow-hidden w-full max-w-[680px]
                   flex flex-col shadow-[0_40px_120px_rgba(0,0,0,0.9)]"
        style={{ animation: 'slideUp 0.3s cubic-bezier(.22,.68,0,1.2)' }}
      >
        {/* Image */}
        <div className="h-[340px] overflow-hidden relative">
          <img
            src={animal.image}
            alt={animal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.9)] via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60
                       backdrop-blur-md border border-white/[0.12] text-[#aaa] text-lg
                       flex items-center justify-center cursor-pointer
                       hover:text-white transition-colors duration-200"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-[0.85rem] px-8 py-7">

          {/* Tags */}
          <div className="flex items-center gap-[0.6rem] flex-wrap">
            <span
              className="text-[0.65rem] font-heading font-semibold tracking-[0.12em]
                         uppercase px-[0.65rem] py-[0.2rem] rounded-full"
              style={{
                background: habitat.bg,
                border: `1px solid ${habitat.border}`,
                color: habitat.text,
              }}
            >
              {animal.habitat}
            </span>
            <span
              className="text-[0.65rem] font-heading font-medium
                         flex items-center gap-[0.3rem]"
              style={{ color: status.color }}
            >
              <span
                className="w-[6px] h-[6px] rounded-full inline-block"
                style={{ background: status.color }}
              />
              {animal.status}
            </span>
          </div>

          {/* Name */}
          <h2 className="font-heading font-bold text-[clamp(1.6rem,4vw,2.2rem)]
                          text-[#F0EEE8] leading-none">
            {animal.name}
          </h2>

          {/* Description */}
          <p className="font-body text-[#999] text-[0.875rem] leading-[1.75]">
            {animal.description} This animal belongs to the{' '}
            <em className="text-[#bbb]">{animal.category}</em> group and inhabits{' '}
            <em className="text-[#bbb]">{animal.habitat.toLowerCase()}</em> ecosystems
            around the world. Conservation efforts are ongoing to protect this species.
          </p>

          {/* Buttons */}
          <div className="flex gap-3 mt-2 flex-wrap">

            {/* ── Learn More → navigates to /animal/:id ── */}
            <button
              onClick={handleLearnMore}
              className="flex-1 min-w-[120px] py-[0.7rem] px-6 rounded-full
                         bg-[#355872] hover:bg-[#7AAACE] text-[#F0EEE8]
                         font-heading font-semibold text-[0.82rem]
                         border-none cursor-pointer transition-colors duration-200"
            >
              Learn More →
            </button>

            <button
              onClick={onClose}
              className="flex-1 min-w-[120px] py-[0.7rem] px-6 rounded-full
                         bg-transparent border border-white/[0.12] text-[#888]
                         hover:text-white font-heading font-medium text-[0.82rem]
                         cursor-pointer transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}