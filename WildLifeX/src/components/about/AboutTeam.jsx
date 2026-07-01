// src/components/about/AboutTeam.jsx
import { useState } from "react";

const TEAM = [
  {
    emoji: "🦁",
    name: "Alex Rivera",
    role: "Ecosystem Architect",
    roleColor: "text-forest-mid",
    bio: "Designed the simulation engine and predator-prey balance algorithms. Obsessed with Lotka-Volterra equations.",
  },
  {
    emoji: "🐬",
    name: "Priya Nair",
    role: "AI & ML Lead",
    roleColor: "text-ocean-mid",
    bio: "Builds the recommendation system that keeps ecosystems stable. Also a certified scuba diver.",
  },
  {
    emoji: "🌿",
    name: "Sam Okonkwo",
    role: "Frontend Engineer",
    roleColor: "text-forest-mid",
    bio: "Crafted every animation and color token. Believes design should feel alive — just like nature.",
  },
  {
    emoji: "🔬",
    name: "Dr. Lin Wei",
    role: "Wildlife Consultant",
    roleColor: "text-ocean-mid",
    bio: "Ecologist ensuring our simulations reflect real population dynamics, not just math.",
  },
];

function TeamCard({ emoji, name, role, roleColor, bio }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        feature-card p-6 cursor-default
        transition-all duration-300
        ${hovered ? "-translate-y-2 shadow-[var(--shadow-glow-forest)]" : "shadow-card"}
      `}
    >
      {/* Emoji avatar circle */}
      <div className={`
        w-14 h-14 rounded-full mb-4 flex items-center justify-center text-2xl
        bg-forest-dark/35 border border-forest-mid/20
        transition-shadow duration-300
        ${hovered ? "shadow-[var(--shadow-glow-forest)]" : ""}
      `}>
        {emoji}
      </div>

      <h3 className="font-heading font-semibold text-ocean-light text-base leading-tight">
        {name}
      </h3>
      <p className={`font-body text-xs font-semibold uppercase tracking-widest mt-1 mb-3 ${roleColor}`}>
        {role}
      </p>
      <p className="font-body text-ocean-light/45 text-xs leading-relaxed">{bio}</p>
    </div>
  );
}

export default function AboutTeam() {
  return (
    <section className="bg-dark py-24">
      <div className="section-container">
        <h2 className="section-title text-ocean-light mb-14">Meet The Team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map((t) => (
            <TeamCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
