// src/components/about/AboutCTA.jsx
import bushImg      from "../../assets/decorative/bush.png";
import tentaclesImg from "../../assets/decorative/tenticles.png";

export default function AboutCTA() {
  return (
    <section className="relative overflow-hidden bg-[#070f09] pt-24 text-center">

      {/* Forest glow */}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2
                       w-[520px] h-[320px] rounded-full
                       bg-forest-dark/20 blur-[100px] pointer-events-none" />

      {/* ── Tentacles top-right peek ── */}
      <div className="absolute right-[2%] top-[5%] w-[clamp(100px,14vw,200px)]
                       pointer-events-none opacity-40 z-[1]
                       animate-[float_7s_ease-in-out_infinite] rotate-[10deg]">
        <img src={tentaclesImg} alt="" className="w-full block" />
      </div>

      <div className="relative z-10 section-container mb-20">

        {/* Eyebrow */}
        <p className="font-heading text-forest-mid text-xs font-semibold
                       tracking-[0.3em] uppercase mb-5">
          Ready to Explore?
        </p>

        {/* Hero title — Protest Guerrilla, same as home */}
        <h2 className="hero-title text-ocean-light leading-[0.95] mb-7">
          BUILD YOUR<br />
          <span className="text-stroke">WILD WORLD</span>
        </h2>

        <p className="font-body text-ocean-light/45 text-base max-w-md mx-auto
                       leading-[1.85] mb-10">
          Dive into the simulator, explore hundreds of species,
          or step through an educational scenario — all for free.
        </p>

        {/* CTAs — btn-primary + btn-outline from index.css */}
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/ecosystem" className="btn-primary">Build Ecosystem →</a>
          <a href="/animals"   className="btn-outline">Explore Animals</a>
        </div>
      </div>

      {/* ── Bush panorama — exact same layered look as home footer ── */}
      <div className="relative h-[clamp(200px,28vw,400px)]">

        {/* Fade from section bg */}
        <div className="absolute inset-0 z-10 pointer-events-none
                         bg-gradient-to-b from-[#070f09] via-[#070f09]/30 to-transparent" />

        {/* Large center bush */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6%]
                         w-[clamp(440px,82vw,1100px)] z-[1] opacity-92
                         animate-[float_10s_ease-in-out_infinite]
                         drop-shadow-[0_-20px_48px_rgba(52,103,57,0.32)]">
          <img src={bushImg} alt="" className="w-full block" />
        </div>

        {/* Right small bush */}
        <div className="absolute -right-[2%] bottom-[-4%]
                         w-[clamp(130px,20vw,270px)] z-[1] opacity-55
                         animate-[float_8s_ease-in-out_1s_infinite]">
          <img src={bushImg} alt="" className="w-full block" />
        </div>

        {/* Left small bush (mirrored) */}
        <div className="absolute -left-[2%] bottom-[-4%]
                         w-[clamp(120px,18vw,250px)] z-[1] opacity-55 scale-x-[-1]
                         animate-[float_7s_ease-in-out_0.5s_infinite]">
          <img src={bushImg} alt="" className="w-full block" />
        </div>
      </div>

      {/* ── Footer bar — matching home page footer ── */}
      <div className="border-t border-white/[0.06] bg-dark/80
                       px-6 md:px-16 py-5
                       flex items-center justify-between flex-wrap gap-2">
        <span className="font-display text-forest-mid text-xl font-black tracking-wider">
          WILDLIFE X
        </span>
        <span className="font-body text-ocean-light/20 text-xs tracking-[0.1em]">
          Exploring ecosystems across ocean and land · 2025
        </span>
      </div>
    </section>
  );
}
