// src/components/about/AboutHero.jsx
import bushImg      from "../../assets/decorative/bush.png";
import tentaclesImg from "../../assets/decorative/tenticles.png";

export default function AboutHero() {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden bg-[#0a1a0c]">

      {/* ── Gradient BG ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060f07] via-[#0a1a0d] to-[#0e2212]" />

      {/* ── Ambient glow ── */}
      <div className="absolute left-[-8%] top-[25%] w-[420px] h-[340px] rounded-full
                       bg-forest-dark/25 blur-[100px] pointer-events-none" />
      <div className="absolute right-[5%] top-[15%] w-[300px] h-[260px] rounded-full
                       bg-ocean-dark/15 blur-[80px] pointer-events-none" />

      {/* ── TENTACLES – top right corner, partially cropped ── */}
      <div className="absolute -right-[3%] top-[8%] w-[clamp(140px,20vw,300px)]
                       pointer-events-none z-[2] opacity-60
                       animate-[float_6s_ease-in-out_infinite]
                       drop-shadow-[0_16px_40px_rgba(121,174,111,0.3)]
                       rotate-[15deg]">
        <img src={tentaclesImg} alt="" className="w-full block" />
      </div>

      {/* ── BUSH – bottom left ── */}
      <div className="absolute -left-[3%] bottom-[-5%] w-[clamp(220px,36vw,500px)]
                       pointer-events-none z-[3] opacity-90
                       animate-[float_8s_ease-in-out_1s_infinite]
                       drop-shadow-[0_20px_48px_rgba(52,103,57,0.4)]">
        <img src={bushImg} alt="" className="w-full block" />
      </div>

      {/* ── TENTACLES – bottom right ── */}
      <div className="absolute -right-[2%] -bottom-[2%] w-[clamp(120px,18vw,260px)]
                       pointer-events-none z-[3] opacity-65
                       animate-[float_7s_ease-in-out_0.5s_infinite]
                       drop-shadow-[0_12px_32px_rgba(53,88,114,0.3)]">
        <img src={tentaclesImg} alt="" className="w-full block" />
      </div>

      {/* ── Hero copy ── */}
      <div className="relative z-10 section-container pb-36 md:pb-44">

        {/* Eyebrow label */}
        <p className="font-heading text-forest-mid text-xs font-semibold
                       tracking-[0.3em] uppercase mb-5
                       opacity-0 animate-[fade-up_0.7s_ease_0.1s_forwards]">
          About WildlifeX
        </p>

        {/* Big Protest Guerrilla title — same as home */}
        <h1 className="hero-title text-ocean-light leading-[0.95] mb-7
                        opacity-0 animate-[fade-up_0.7s_ease_0.2s_forwards]">
          DISCOVER<br />
          <span className="text-stroke">THE WILD</span>
        </h1>

        {/* Sub-copy */}
        <p className="font-body text-ocean-light/60 text-base md:text-lg
                       max-w-[440px] leading-[1.85]
                       opacity-0 animate-[fade-up_0.7s_ease_0.35s_forwards]">
          WildlifeX is an interactive platform designed to help users explore
          wildlife and understand how ecosystems connect across ocean and land.
          Learning about nature — simple, immersive, and meaningful.
        </p>

        {/* CTA */}
        <div className="mt-9 opacity-0 animate-[fade-up_0.7s_ease_0.45s_forwards]">
          <a href="#about-mission" className="btn-primary">
            Learn More →
          </a>
        </div>
      </div>
    </section>
  );
}
