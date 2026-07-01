import React from 'react'
import { HABITAT_STYLES, STATUS_STYLES } from './styles'

export default function AnimalCard({ animal, onClick }) {
  const habitat = HABITAT_STYLES[animal.habitat] || HABITAT_STYLES['Forest']
  const status  = STATUS_STYLES[animal.status]   || { color: '#888' }

  return (
    <article
      onClick={() => onClick(animal)}
      className="group relative flex flex-col rounded-[1rem] overflow-hidden cursor-pointer bg-[#161616] shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-[350ms] ease-[cubic-bezier(.22,.68,0,1.2)] hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(0,0,0,0.7)]"
    >
      {/* Image */}
      <div className="h-[320px] overflow-hidden relative">
        <img
          src={animal.image}
          alt={animal.name}
          className="w-full h-full object-cover transition-transform duration-[550ms] ease-[cubic-bezier(.22,.68,0,1.2)] group-hover:scale-[1.07]"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.85)] via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-4 right-4 flex items-center gap-[0.4rem] bg-black/55 backdrop-blur-md rounded-full px-[0.65rem] py-[0.25rem]">
          <span
            className="w-[7px] h-[7px] rounded-full inline-block"
            style={{ background: status.color, boxShadow: `0 0 6px ${status.color}` }}
          />
          <span className="font-heading text-[0.65rem] text-[#ccc] font-medium tracking-wide">
            {animal.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 gap-2 px-5 pt-5 pb-6">

        {/* Habitat tag */}
        <span
          className="self-start text-[0.65rem] font-heading font-semibold tracking-[0.12em] uppercase px-[0.65rem] py-[0.2rem] rounded-full"
          style={{
            background: habitat.bg,
            border: `1px solid ${habitat.border}`,
            color: habitat.text,
          }}
        >
          {animal.habitat}
        </span>

        {/* Name */}
        <h3 className="font-heading font-bold text-[clamp(1.1rem,2vw,1.35rem)] text-[#F0EEE8] leading-tight mt-[0.15rem]">
          {animal.name}
        </h3>

        {/* Description */}
        <p className="font-body text-[0.8rem] text-[#888] leading-relaxed flex-1">
          {animal.description}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-3">
          <span className="font-heading text-[0.72rem] text-[#555] tracking-[0.08em]">
            {animal.category}
          </span>
          <span className="font-heading text-[0.72rem] text-[#7AAACE] font-semibold tracking-[0.05em] flex items-center gap-1">
            View →
          </span>
        </div>
      </div>
    </article>
  )
}