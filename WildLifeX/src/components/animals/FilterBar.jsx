import React from 'react'
import { FILTERS } from './data'

export default function FilterBar({ active, onChange, query, onQueryChange }) {
  return (
    <div className="sticky top-0 z-50 bg-[rgba(10,10,10,0.85)] backdrop-blur-[14px] border-b border-white/[0.06] px-6 py-4">
      <div className="max-w-[80rem] mx-auto flex items-center justify-between gap-4 flex-wrap">

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => onChange(f)}
              className="px-4 py-[0.35rem] rounded-full font-heading font-medium text-[0.78rem] tracking-[0.04em] cursor-pointer transition-all duration-200"
              style={{
                border: active === f ? '1px solid #7AAACE' : '1px solid rgba(255,255,255,0.12)',
                background: active === f ? 'rgba(122,170,206,0.18)' : 'transparent',
                color: active === f ? '#A8D4F5' : '#666',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-[0_1_260px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] text-[0.85rem]">⌕</span>
          <input
            type="text"
            placeholder="Search animals…"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-8 pr-4 py-[0.4rem] text-[#ccc] font-body text-[0.8rem] outline-none transition-colors duration-200 placeholder-[#444] focus:border-[#7AAACE]"
          />
        </div>
      </div>
    </div>
  )
}