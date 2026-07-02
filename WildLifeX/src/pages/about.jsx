import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import bushImg      from "../assets/decorative/bush.png";
import tentaclesImg from "../assets/decorative/tenticles.png";
import whaleImg     from "../assets/decorative/whale.png";
import brainImg     from "../assets/decorative/brain.png";
import frontendImg  from "../assets/decorative/frontend.png";
import backendImg   from "../assets/decorative/backend.png";
import ecosystemImg from "../assets/decorative/ecosystem.png";
import developerImg from "../assets/decorative/developer.jpg";

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Counter({ end, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const [ref, vis]   = useReveal(0.4);
  useEffect(() => {
    if (!vis) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [vis, end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, vis] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <span className="font-heading inline-block px-3 py-1 rounded-full text-[0.65rem] font-semibold tracking-[0.18em] uppercase border border-[#79AE6F]/35 text-[#79AE6F] bg-[#79AE6F]/08">
      {children}
    </span>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function About() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 274, animals: 120, ecosystems: 45, reviews: 102 });

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/stats/")
      .then(res => res.json())
      .then(data => {
        setStats({
          users: data.users ?? 274,
          animals: data.animals ?? 120,
          ecosystems: data.ecosystems ?? 45,
          reviews: data.reviews ?? 102
        });
      })
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ══════════ HERO — dark ══════════ */}
      <section className="relative min-h-screen bg-[#0a0f0b] flex flex-col justify-center overflow-hidden pt-24">

        <div className="absolute -left-[10%] top-[30%] w-80 h-64 rounded-full bg-[#346739]/20 blur-[80px] pointer-events-none" />

        <div className="absolute left-0 bottom-0 w-[clamp(100px,12vw,160px)] pointer-events-none z-[2] opacity-70"
             style={{ animation: "floatY 8s ease-in-out infinite" }}>
          <img src={bushImg} alt="" className="w-full block" />
        </div>

        <div className="absolute right-0 bottom-0 w-[clamp(70px,9vw,120px)] pointer-events-none z-[2] opacity-40"
             style={{ animation: "floatY 6s ease-in-out 1s infinite" }}>
          <img src={tentaclesImg} alt="" className="w-full block" />
        </div>

        <style>{`
          @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>

        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-16 py-20">
          <Reveal>
            <Label>About WildlifeX</Label>
          </Reveal>

          <Reveal delay={0.1} className="mt-6">
            <h1 className="font-heading font-bold text-[#F7F8F0] leading-[1.08]
                           text-[clamp(2.8rem,7vw,5.5rem)]">
              Where science<br />
              <span className="text-[#79AE6F]">meets the wild.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2} className="mt-6 max-w-lg">
            <p className="font-body text-[#F7F8F0]/55 text-[0.95rem] leading-[1.85]">
              WildlifeX is an interactive ecosystem learning platform built for
              curious minds. Understanding nature is the first step to protecting it.
            </p>
          </Reveal>

          <Reveal delay={0.3} className="mt-10">
            <div className="h-px w-64 bg-gradient-to-r from-[#79AE6F]/50 to-transparent" />
          </Reveal>
        </div>
      </section>

      {/* ══════════ STATS — light cream ══════════ */}
      <section className="bg-[#F2EDC2] py-16 px-6 md:px-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { n: stats.animals, s: "+", label: "Animal Species"   },
            { n: stats.ecosystems,  s: "+", label: "Ecosystems Created"  },
            { n: stats.users,   s: "+",  label: "Active Users" },
            { n: stats.reviews, s: "+", label: "Reviews & Feedback"      },
          ].map(({ n, s, label }) => (
            <div key={label}>
              <div className="font-heading font-bold text-[2.8rem] md:text-[3.4rem] text-[#346739] leading-none">
                <Counter end={n} suffix={s} />
              </div>
              <p className="font-heading text-[#1A1A1A]/50 text-[0.65rem] font-semibold tracking-[0.15em] uppercase mt-2">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ MISSION — dark ══════════ */}
      <section className="bg-[#0d1a10] py-24 px-6 md:px-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          <div>
            <Reveal><Label>Our Mission</Label></Reveal>
            <Reveal delay={0.1} className="mt-5">
              <h2 className="font-heading font-bold text-[#F7F8F0] text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.2]">
                Education through<br />living simulation.
              </h2>
            </Reveal>
            <Reveal delay={0.2} className="mt-5">
              <p className="font-body text-[#F7F8F0]/50 text-sm leading-[1.9]">
                WildlifeX was born from a simple belief — people learn best when
                they <span className="text-[#79AE6F] font-medium">experience</span> something
                rather than just read about it. Our engine models real ecological
                interactions: predator-prey dynamics, population collapse, and recovery.
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-4">
              <p className="font-body text-[#F7F8F0]/50 text-sm leading-[1.9]">
                Whether you're a student exploring food webs or just someone who loves
                wildlife — WildlifeX lets you ask{" "}
                <span className="text-[#7AAACE] font-medium">"what happens if…"</span> and
                watch the answer unfold in real time.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-3">
              {[
                "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&q=80",
                "https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=400&q=80",
                "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=400&q=80",
                "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=400&q=80",
              ].map((src, i) => (
                <div key={i} className={`rounded-xl overflow-hidden ${i === 1 ? "mt-5" : ""} ${i === 3 ? "-mt-5" : ""}`}>
                  <img src={src} alt="" className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ WHAT WE BUILD — ocean bg + glass cards ══════════ */}
      <section className="relative py-24 px-6 md:px-16 overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544552866-49ce864ff896?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
        />
        <div className="absolute inset-0 bg-[#03111a]/75 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Reveal>
            <span className="font-heading inline-block px-3 py-1 rounded-full text-[0.65rem] font-semibold tracking-[0.18em] uppercase border border-[#7AAACE]/45 text-[#A8D4F5] bg-[#7AAACE]/15">
              What We Build
            </span>
          </Reveal>
          <Reveal delay={0.1} className="mt-4 mb-12">
            <h2 className="font-heading font-bold text-[#F7F8F0] text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.2]">
              Two things you can<br />do right now.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {[
              { img: ecosystemImg,  imgAlt: "Ecosystem Explorer", title: "Ecosystem Explorer", accent: "#79AE6F",
                body: "Build and observe dynamic ecosystems across ocean, forest, tundra and more — watch species interact in a living simulation." },
              { img: whaleImg,  imgAlt: "Animal Directory",   title: "Animal Directory",   accent: "#7AAACE",
                body: "Browse hundreds of species with rich visuals, habitat info, conservation status, and ecological role in the food web." },
            ].map(({ img, imgAlt, title, body, accent }, i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-6 h-full
                             backdrop-blur-md
                             bg-white/[0.08]
                             border border-white/[0.15]
                             shadow-[0_8px_32px_rgba(0,0,0,0.35)]
                             hover:-translate-y-1 transition-transform duration-300"
                  style={{ borderTop: `2px solid ${accent}55` }}
                >
                  <div className="w-12 h-12 mb-4 rounded-xl overflow-hidden bg-white/[0.06] flex items-center justify-center p-1.5">
                    <img src={img} alt={imgAlt} className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-heading font-semibold text-[#F7F8F0] text-sm mb-2">{title}</h3>
                  <p className="font-body text-[#F7F8F0]/55 text-sm leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ QUOTE — dark accent ══════════ */}
      <section className="bg-[#071510] py-20 px-6 md:px-16 flex items-center justify-center">
        <div className="max-w-2xl text-center">
          <Reveal>
            <p className="font-heading font-semibold text-[#F7F8F0]/60 text-xl md:text-2xl leading-[1.7] italic">
              "In every walk with nature, one receives<br className="hidden md:block" />
              far more than he seeks."
            </p>
            <p className="font-heading text-[#F7F8F0]/25 text-[0.65rem] tracking-[0.22em] uppercase mt-5">
              — John Muir
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ MAKER — forest bg + single glass card ══════════ */}
      <section className="relative py-24 px-6 md:px-16 overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-[#031508]/72 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Reveal>
            <span className="font-heading inline-block px-3 py-1 rounded-full text-[0.65rem] font-semibold tracking-[0.18em] uppercase border border-[#79AE6F]/45 text-[#A8D4A0] bg-[#79AE6F]/15">
              The Maker
            </span>
          </Reveal>
          <Reveal delay={0.1} className="mt-4 mb-12">
            <h2 className="font-heading font-bold text-[#F7F8F0] text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.2]">
              Designed, built, and<br />shipped solo.
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-2xl p-8 md:p-10
                            backdrop-blur-md bg-white/[0.08]
                            border border-white/[0.15]
                            shadow-[0_8px_40px_rgba(0,0,0,0.4)]
                            flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">

              {/* Avatar — real photo */}
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#79AE6F]/50
                                shadow-[0_0_24px_rgba(121,174,111,0.25)]">
                  <img
                    src={developerImg}
                    alt="Sanchitha Maduranga"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-heading font-bold text-[#F7F8F0] text-xl leading-tight">
                  Sanchitha Maduranga
                </h3>
                <p className="font-heading text-[#79AE6F] text-[0.7rem] font-semibold uppercase tracking-[0.18em] mt-1 mb-4">
                  Chilly · Undergraduate Diploma Student
                </p>
                <p className="font-body text-[#F7F8F0]/55 text-sm leading-[1.85] max-w-lg">
                  Every pixel, every component, every algorithm, built by one person with a
                  curiosity for both wildlife and code. WildlifeX is where that curiosity lives.
                </p>

                <div className="flex flex-wrap gap-2 mt-5">
                  {[
                    { label: "Python",    color: "#79AE6F" },
                    { label: "React",     color: "#7AAACE" },
                    { label: "Tailwind",  color: "#9AB5CC" },
                    { label: "Web Dev",   color: "#C4956A" },
                    { label: "Game Dev",  color: "#C4956A" },
                    { label: "Artist",    color: "#79AE6F" },
                  ].map(({ label, color }) => (
                    <span
                      key={label}
                      className="font-heading text-[0.62rem] font-semibold tracking-[0.12em] uppercase
                                 px-3 py-1 rounded-full border backdrop-blur-sm bg-white/[0.06]"
                      style={{ color, borderColor: `${color}44` }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ TECH STACK — dark ══════════ */}
      <section className="bg-[#0d1a10] py-24 px-6 md:px-16">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <span className="font-heading inline-block px-3 py-1 rounded-full text-[0.65rem] font-semibold tracking-[0.18em] uppercase border border-[#9AB5CC]/35 text-[#9AB5CC] bg-[#9AB5CC]/10">
              Tech Stack
            </span>
          </Reveal>
          <Reveal delay={0.1} className="mt-4 mb-12">
            <h2 className="font-heading font-bold text-[#F7F8F0] text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.2]">
              Built with purpose,<br />not hype.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { img: frontendImg,  imgAlt: "Frontend",     layer: "Frontend",     accent: "#7AAACE", stack: ["React.js", "Tailwind CSS", "Recharts / Chart.js"] },
              { img: backendImg,   imgAlt: "Backend",      layer: "Backend",      accent: "#C4956A", stack: ["Flask (Python)", "REST API", "MongoDB"] },
              { img: brainImg, imgAlt: "Intelligence", layer: "Intelligence", accent: "#79AE6F", stack: ["Scikit-learn", "Ecosystem Algorithms", "Prediction Models"] },
            ].map(({ img, imgAlt, layer, accent, stack }, i) => (
              <Reveal key={layer} delay={i * 0.1}>
                <div className="rounded-2xl p-6 h-full bg-white/[0.03] border border-white/[0.07]">
                  <div className="w-10 h-10 mb-3 rounded-lg overflow-hidden bg-white/[0.05] flex items-center justify-center p-1.5">
                    <img src={img} alt={imgAlt} className="w-full h-full object-contain" />
                  </div>
                  <p className="font-heading text-[0.62rem] font-bold tracking-[0.18em] uppercase mb-4" style={{ color: accent }}>{layer}</p>
                  <ul className="space-y-2">
                    {stack.map(s => (
                      <li key={s} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
                        <span className="font-body text-[#F7F8F0]/45 text-sm">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA — dark with small bush ══════════ */}
      <section className="relative bg-[#0a0f0b] overflow-hidden text-center py-24 px-6 md:px-16">
        <div className="absolute bottom-20 left-0 w-[clamp(220px,30vw,380px)] pointer-events-none opacity-75"
             style={{ animation: "floatY 9s ease-in-out infinite" }}>
          <img src={bushImg} alt="" className="w-full block" />
        </div>

        <div className="absolute bottom-20 right-0 w-[clamp(120px,30vw,380px)] pointer-events-none opacity-75 rotate-180"
             style={{ animation: "floatY 9s ease-in-out infinite" }}>
          <img src={bushImg} alt="" className="w-full block" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-96 h-48 rounded-full bg-[#346739]/15 blur-[70px] pointer-events-none" />

        

        <div className="relative z-10 pb-20">
          <Reveal>
            <Label>Ready to explore?</Label>
          </Reveal>
          <Reveal delay={0.1} className="mt-6">
            <h2 className="font-heading font-bold text-[#F7F8F0] leading-[1.08]
                           text-[clamp(2rem,5vw,3.8rem)]">
              Build your world.<br />
              <span className="text-[#79AE6F]">Watch it breathe.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2} className="mt-4 mb-10">
            <p className="font-body text-[#F7F8F0]/40 text-sm max-w-xs mx-auto leading-[1.85]">
              Dive into the simulator, explore hundreds of species,
              and see your ecosystem come alive.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/ecosystem')} className="btn-primary">
              Build Ecosystem →
            </button>
            <button onClick={() => navigate('/animal')} className="btn-outline">
              Explore Animals
            </button>
          </Reveal>
        </div>
      </section>

    </div>
  );
}