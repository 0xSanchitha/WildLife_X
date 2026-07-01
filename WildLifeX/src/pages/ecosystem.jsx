import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── ASSETS (swap with your real paths) ──────────────────────────────────────
// import forestImg from "../assets/ecosystems/forest.jpg";
// import oceanImg  from "../assets/ecosystems/ocean.jpg";
// Using Unsplash placeholders until you wire up real assets:
const FOREST_IMG = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=85";
const OCEAN_IMG  = "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1200&q=85";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes shimmer-line {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes float-badge {
    0%,100% { transform: translateY(0);    }
    50%     { transform: translateY(-5px); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.7); opacity: 0;   }
  }

  .eco-card-img {
    transition: transform 0.8s cubic-bezier(.22,.68,0,1.2);
  }
  .eco-card:hover .eco-card-img {
    transform: scale(1.06);
  }

  .shimmer-line {
    animation: shimmer-line 1s 0.6s cubic-bezier(.22,.68,0,1) both;
    transform-origin: left;
  }
  .float-badge {
    animation: float-badge 4s ease-in-out infinite;
  }
`;

// ─── DATA ────────────────────────────────────────────────────────────────────
const ECOSYSTEMS = [
  {
    id: "forest",
    label: "Forest",
    tagline: "Where wolves hunt and rivers run deep",
    description:
      "Dense woodland layered with predator-prey dynamics. Wolves, deer, bears and foxes compete for survival across rivers, mountains and ancient trees.",
    image: FOREST_IMG,
    accent: "#79AE6F",
    accentDim: "rgba(121,174,111,0.15)",
    accentGlow: "rgba(121,174,111,0.35)",
    animals: ["🐺 Wolf", "🦌 Deer", "🐻 Bear", "🦊 Fox", "🐗 Boar"],
    terrains: ["🌲 Forest", "⛰️ Mountain", "🏞️ River", "🌿 Meadow"],
    difficulty: "Moderate",
    diffColor: "#C4956A",
  },
  {
    id: "ocean",
    label: "Ocean",
    tagline: "Vast, silent, and ruthlessly balanced",
    description:
      "An open-water system where sharks, fish, whales and jellyfish form a living web. One imbalance and the whole chain collapses.",
    image: OCEAN_IMG,
    accent: "#7AAACE",
    accentDim: "rgba(122,170,206,0.15)",
    accentGlow: "rgba(122,170,206,0.35)",
    animals: ["🦈 Shark", "🐟 Fish", "🐋 Whale", "🐙 Octopus", "🪼 Jellyfish"],
    terrains: ["🌊 Open Water", "🪸 Coral Reef", "🏖️ Shoreline", "🌑 Deep Zone"],
    difficulty: "Hard",
    diffColor: "#E07050",
  },
];

// ─── SMALL ATOMS ─────────────────────────────────────────────────────────────
function Tag({ children, color }) {
  return (
    <span
      className="inline-block font-heading text-[0.58rem] font-semibold
                 tracking-[0.14em] uppercase px-2.5 py-1 rounded-full"
      style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}
    >
      {children}
    </span>
  );
}

function PulsingDot({ color }) {
  return (
    <span className="relative inline-flex w-2 h-2">
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: color,
          animation: "pulse-ring 1.8s ease-out infinite",
        }}
      />
      <span className="relative rounded-full w-2 h-2" style={{ background: color }} />
    </span>
  );
}

// ─── ECOSYSTEM CARD ───────────────────────────────────────────────────────────
function EcoCard({ eco, selected, onSelect, onStart }) {
  const isSelected = selected === eco.id;

  return (
    <div
      className="eco-card relative flex flex-col overflow-hidden rounded-[1.5rem] cursor-pointer
                 transition-all duration-500"
      style={{
        outline: isSelected ? `2px solid ${eco.accent}` : "2px solid transparent",
        boxShadow: isSelected
          ? `0 0 0 1px ${eco.accent}33, 0 32px 80px rgba(0,0,0,0.6)`
          : "0 8px 40px rgba(0,0,0,0.4)",
        transform: isSelected ? "translateY(-4px)" : "translateY(0)",
      }}
      onClick={() => onSelect(eco.id)}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden" style={{ height: "clamp(200px,28vw,340px)" }}>
        <img
          src={eco.image}
          alt={eco.label}
          className="eco-card-img w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/30 to-transparent" />

        {/* Selected checkmark */}
        {isSelected && (
          <div
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: eco.accent, boxShadow: `0 0 16px ${eco.accentGlow}` }}
          >
            <span className="text-[#0c0c0c] font-bold text-sm">✓</span>
          </div>
        )}

        {/* Difficulty badge — floats */}
        <div className="float-badge absolute top-4 left-4">
          <span
            className="font-heading text-[0.58rem] font-bold tracking-[0.16em] uppercase
                       px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{
              color: eco.diffColor,
              background: `${eco.diffColor}18`,
              border: `1px solid ${eco.diffColor}40`,
            }}
          >
            {eco.difficulty}
          </span>
        </div>

        {/* Bottom-of-image label */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2.5 mb-1">
            <PulsingDot color={eco.accent} />
            <p
              className="font-heading text-[0.6rem] font-semibold tracking-[0.22em] uppercase"
              style={{ color: eco.accent }}
            >
              {eco.label} Ecosystem
            </p>
          </div>
          <h2
            className="font-heading font-bold text-[#EEEBE4] leading-[1.1]"
            style={{ fontSize: "clamp(1.4rem,2.8vw,2rem)" }}
          >
            {eco.label}
          </h2>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-6 gap-5" style={{ background: "#141414" }}>

        {/* Tagline */}
        <p className="font-body italic text-[#EEEBE4]/40 text-xs leading-relaxed">
          {eco.tagline}
        </p>

        {/* Description */}
        <p className="font-body text-[#EEEBE4]/60 text-sm leading-[1.8]">
          {eco.description}
        </p>

        {/* Divider */}
        <div className="h-px" style={{ background: `${eco.accent}20` }} />

        {/* Animals */}
        <div>
          <p
            className="font-heading text-[0.57rem] font-semibold tracking-[0.2em] uppercase mb-2.5"
            style={{ color: eco.accent + "99" }}
          >
            Available species
          </p>
          <div className="flex flex-wrap gap-1.5">
            {eco.animals.map((a) => (
              <Tag key={a} color={eco.accent}>{a}</Tag>
            ))}
          </div>
        </div>

        {/* Terrains */}
        <div>
          <p
            className="font-heading text-[0.57rem] font-semibold tracking-[0.2em] uppercase mb-2.5"
            style={{ color: eco.accent + "99" }}
          >
            Terrain types
          </p>
          <div className="flex flex-wrap gap-1.5">
            {eco.terrains.map((t) => (
              <span
                key={t}
                className="font-body text-[#EEEBE4]/50 text-[0.7rem] px-2.5 py-0.5 rounded-full"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* CTA button */}
        <button
          onClick={(e) => { e.stopPropagation(); onStart(eco.id); }}
          className="mt-auto w-full py-3.5 rounded-full font-heading font-semibold
                     text-sm tracking-wide transition-all duration-300
                     hover:scale-[1.02] hover:opacity-95 active:scale-[0.98]"
          style={{
            background: isSelected ? eco.accent : "rgba(255,255,255,0.07)",
            color: isSelected ? "#0c0c0c" : eco.accent,
            border: `1px solid ${eco.accent}${isSelected ? "ff" : "40"}`,
            boxShadow: isSelected ? `0 0 24px ${eco.accentGlow}` : "none",
          }}
        >
          {isSelected ? "Start Building →" : "Select " + eco.label}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
// Props:
//   onStart(ecosystemId) — called when user clicks "Start Building"
//   Pass this in from your router/parent to navigate to Phase 2
export default function EcosystemSelect({ onStart }) {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  function handleStart(id) {
    if (onStart) {
      onStart(id);
    } else {
      navigate(`/ecosystem/${id}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#EEEBE4] overflow-x-hidden">
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <header
        className="px-6 md:px-12 lg:px-20 pt-16 pb-12 max-w-6xl mx-auto"
        style={{ animation: "fade-up 0.7s ease both" }}
      >
        {/* Eyebrow */}
        <p className="font-heading text-[0.62rem] font-semibold tracking-[0.28em] uppercase
                       text-[#79AE6F] mb-5">
          Ecosystem Builder
        </p>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1
              className="font-heading font-bold text-[#EEEBE4] leading-[1.0] mb-3"
              style={{ fontSize: "clamp(2.2rem,6vw,4.5rem)" }}
            >
              Choose Your<br />
              <span style={{ color: "#79AE6F" }}>World</span>
            </h1>
            <p className="font-body text-[#EEEBE4]/45 text-sm md:text-base leading-[1.8] max-w-md">
              Pick an environment to simulate. Every choice you make will ripple
              through the food web — balance it or watch it collapse.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 shrink-0 mb-1">
            {["Choose World", "Place Terrain", "Add Animals", "Simulate"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full text-[0.6rem] font-heading font-bold"
                  style={{
                    background: i === 0 ? "#79AE6F" : "rgba(255,255,255,0.07)",
                    color: i === 0 ? "#0c0c0c" : "rgba(255,255,255,0.25)",
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="hidden lg:block font-heading text-[0.58rem] tracking-[0.14em] uppercase"
                  style={{ color: i === 0 ? "#79AE6F" : "rgba(255,255,255,0.2)" }}
                >
                  {step}
                </span>
                {i < 3 && (
                  <div
                    className="hidden lg:block w-6 h-px"
                    style={{ background: i === 0 ? "rgba(121,174,111,0.4)" : "rgba(255,255,255,0.08)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Accent divider */}
        <div
          className="shimmer-line mt-8 h-px"
          style={{ background: "linear-gradient(to right, rgba(121,174,111,0.5), transparent)" }}
        />
      </header>

      {/* ── Cards ── */}
      <main className="px-6 md:px-12 lg:px-20 pb-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5 lg:gap-7">
          {ECOSYSTEMS.map((eco, i) => (
            <div
              key={eco.id}
              style={{ animation: `fade-up 0.7s ${0.1 + i * 0.12}s ease both` }}
            >
              <EcoCard
                eco={eco}
                selected={selected}
                onSelect={setSelected}
                onStart={handleStart}
              />
            </div>
          ))}
        </div>

        {/* Helper text */}
        <p
          className="text-center font-body text-[#EEEBE4]/20 text-xs mt-10 tracking-wide"
          style={{ animation: "fade-up 0.7s 0.4s ease both" }}
        >
          More ecosystems coming — Tundra, Desert, Rainforest
        </p>
      </main>
    </div>
  );
}