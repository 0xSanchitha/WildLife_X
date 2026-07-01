// src/components/about/AboutTestimonial.jsx
import { useState } from "react";
import bushImg from "../../assets/decorative/bush.png";

const REVIEWS = [
  {
    name: "Sarah M.",
    avatar: "👩",
    text: "WildlifeX completely changed how I teach ecology. My students are absolutely hooked on the ecosystem simulator.",
    stars: 5,
  },
  {
    name: "James K.",
    avatar: "🧑",
    text: "The predator-prey simulation is incredibly realistic. I use it every week for my conservation research projects.",
    stars: 5,
  },
  {
    name: "Priya T.",
    avatar: "👩‍🔬",
    text: "Best wildlife education platform I've ever used. The AI insights are genuinely impressive and super actionable.",
    stars: 5,
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-0.5 mt-4">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-forest-mid text-lg">★</span>
      ))}
    </div>
  );
}

function ReviewCard({ avatar, name, text, stars }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        bg-forest-dark/80 border border-forest-mid/15 rounded-2xl p-6
        transition-all duration-300 cursor-default
        ${hovered ? "-translate-y-1.5 shadow-[var(--shadow-glow-forest)]" : ""}
      `}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-dark/40 border border-forest-mid/25
                         flex items-center justify-center text-2xl flex-shrink-0">
          {avatar}
        </div>
        <div>
          <p className="font-heading font-semibold text-ocean-light text-sm">{name}</p>
          <p className="font-body text-ocean-light/35 text-xs">Verified User</p>
        </div>
      </div>

      {/* Quote */}
      <p className="font-body text-ocean-light/65 text-sm leading-relaxed italic">
        "{text}"
      </p>
      <Stars count={stars} />
    </div>
  );
}

export default function AboutTestimonial() {
  return (
    <section className="relative bg-charcoal py-24 overflow-hidden">

      {/* ── Bush bottom corners – same as home footer area ── */}
      <div className="absolute -left-4 bottom-0 w-[clamp(160px,22vw,320px)]
                       pointer-events-none opacity-30 z-0
                       animate-[float_8s_ease-in-out_infinite]
                       scale-x-[-1]">
        <img src={bushImg} alt="" className="w-full block" />
      </div>
      <div className="absolute -right-4 bottom-0 w-[clamp(140px,18vw,280px)]
                       pointer-events-none opacity-25 z-0
                       animate-[float_9s_ease-in-out_0.7s_infinite]">
        <img src={bushImg} alt="" className="w-full block" />
      </div>

      <div className="relative z-10 section-container">
        <h2 className="section-title text-ocean-light mb-14">What People Say</h2>

        <div className="grid md:grid-cols-3 gap-5">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.name} {...r} />
          ))}
        </div>
      </div>
    </section>
  );
}
