import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// ─── KEYFRAMES ───────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes floatY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes barFill { from{width:0%} to{width:var(--bar-w)} }
  @keyframes dotPulse{ 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.35);opacity:.6} }

  .detail-hero-img   { animation: fadeIn  0.9s ease both; }
  .detail-content    { animation: slideUp 0.75s 0.2s ease both; }
  .detail-sidebar    { animation: slideUp 0.75s 0.35s ease both; }
`;

// ─── REVEAL HOOK ─────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref}
      className={`transition-all duration-700 ease-out ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

// ─── HABITAT / STATUS CONFIG ──────────────────────────────────────────────────
const HABITAT_STYLES = {
  Ocean:      { bg:"rgba(53,88,114,0.35)",  border:"#7AAACE", text:"#A8D4F5" },
  Forest:     { bg:"rgba(52,103,57,0.35)",  border:"#79AE6F", text:"#A8D4A0" },
  Mountain:   { bg:"rgba(90,70,60,0.35)",   border:"#C4956A", text:"#E8C49A" },
  Tundra:     { bg:"rgba(80,100,120,0.35)", border:"#9AB5CC", text:"#C8DDE8" },
  Grassland:  { bg:"rgba(100,90,40,0.35)",  border:"#C8B860", text:"#E8D890" },
  Desert:     { bg:"rgba(120,90,40,0.35)",  border:"#D4A84B", text:"#F0D080" },
  Rainforest: { bg:"rgba(30,90,50,0.35)",   border:"#4ade80", text:"#86efac" },
  Arctic:     { bg:"rgba(80,100,120,0.35)", border:"#9AB5CC", text:"#C8DDE8" },
  Savanna:    { bg:"rgba(100,90,40,0.35)",  border:"#C8B860", text:"#E8D890" },
  Jungle:     { bg:"rgba(30,90,50,0.35)",   border:"#4ade80", text:"#86efac" },
};

const STATUS_CONFIG = {
  "Least Concern":         { color:"#79AE6F", glow:"rgba(121,174,111,0.3)",  label:"Least Concern"         },
  "Near Threatened":       { color:"#a3e635", glow:"rgba(163,230,53,0.3)",   label:"Near Threatened"       },
  "Vulnerable":            { color:"#C4956A", glow:"rgba(196,149,106,0.3)",  label:"Vulnerable"            },
  "Endangered":            { color:"#E07050", glow:"rgba(224,112,80,0.3)",   label:"Endangered"            },
  "Critically Endangered": { color:"#E04040", glow:"rgba(224,64,64,0.35)",   label:"Critically Endangered" },
  "Extinct":               { color:"#888",    glow:"rgba(136,136,136,0.2)",  label:"Extinct"               },
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function HabitatPill({ habitat }) {
  const h = HABITAT_STYLES[habitat] || HABITAT_STYLES["Forest"];
  return (
    <span className="inline-block text-[0.65rem] font-heading font-semibold tracking-[0.14em] uppercase
                     px-3 py-1 rounded-full"
      style={{ background: h.bg, border: `1px solid ${h.border}`, color: h.text }}>
      {habitat}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG["Least Concern"];
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-heading font-semibold
                     tracking-[0.12em] uppercase px-3 py-1 rounded-full"
      style={{ background: `${s.color}18`, border: `1px solid ${s.color}44`, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: s.color, boxShadow: `0 0 6px ${s.color}`, animation:"dotPulse 2s ease-in-out infinite" }} />
      {s.label}
    </span>
  );
}

function StatCard({ icon, label, value, accent = "#79AE6F" }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-2"
      style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${accent}22`, borderTop:`2px solid ${accent}55` }}>
      <span className="text-2xl">{icon}</span>
      <p className="font-heading text-[0.6rem] font-semibold tracking-[0.18em] uppercase"
        style={{ color: accent }}>{label}</p>
      <p className="font-heading font-semibold text-[#F0EEE8] text-sm leading-snug">{value}</p>
    </div>
  );
}

function ThreatBar({ label, pct }) {
  const color = pct > 65 ? "#E04040" : pct > 45 ? "#E07050" : "#C4956A";
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-body text-[#F0EEE8]/60 text-xs">{label}</span>
        <span className="font-heading font-semibold text-xs" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${color}88, ${color})` }} />
      </div>
    </div>
  );
}

function GalleryImage({ src, alt, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`overflow-hidden rounded-2xl bg-white/[0.04] ${className}`}>
      <img src={src} alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 hover:scale-105
                    ${loaded ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="font-heading text-[#555] tracking-widest text-sm animate-pulse">
        Loading species data…
      </p>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [animal, setAnimal]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Fetch animal detail from Flask API ─────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/animals/${id}`)
      .then(r => {
        if (!r.ok) throw new Error(`Animal not found (${r.status})`);
        return r.json();
      })
      .then(data => { setAnimal(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-4">
      <p className="font-heading text-[#E04040] text-sm">{error}</p>
      <button onClick={() => navigate(-1)}
        className="font-heading text-[0.75rem] text-[#7AAACE] underline">
        ← Go back
      </button>
    </div>
  );

  // ── normalise fields (handles both image and images[] from DB) ─────────────
  const images = animal.images?.length
    ? animal.images
    : animal.image
      ? [animal.image]
      : ["https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80"];

  const threats    = animal.threats    ?? [];
  const funFacts   = animal.funFacts   ?? [];
  const prey       = animal.prey       ?? [];
  const predators  = animal.predators  ?? [];
  const relatedIds = animal.relatedIds ?? [];

  const habitat   = HABITAT_STYLES[animal.habitat]  || HABITAT_STYLES["Forest"];
  const statusCfg = STATUS_CONFIG[animal.status]    || STATUS_CONFIG["Least Concern"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EEE8] overflow-x-hidden">
      <style>{STYLES}</style>

      {/* ══ HERO ══ */}
      <section className="relative h-[70vh] min-h-[480px] max-h-[760px] overflow-hidden">
        <img src={images[0]} alt={animal.name}
          className="absolute inset-0 w-full h-full object-cover detail-hero-img" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/70 via-transparent to-transparent" />

        <button onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full
                     bg-black/50 backdrop-blur-md border border-white/[0.12]
                     font-heading text-[0.72rem] font-medium tracking-wide text-[#F0EEE8]/80
                     hover:text-[#F0EEE8] hover:bg-black/70 transition-all duration-200">
          ← Back
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 detail-content">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <HabitatPill habitat={animal.habitat} />
              <StatusBadge status={animal.status} />
              <span className="font-heading text-[0.62rem] tracking-[0.18em] uppercase
                               text-[#F0EEE8]/35">{animal.category}</span>
            </div>
            <h1 className="font-heading font-bold text-[#F0EEE8] leading-[1.05]
                           text-[clamp(2.5rem,7vw,5rem)] mb-2">
              {animal.name}
            </h1>
            {animal.scientific && (
              <p className="font-body italic text-[#F0EEE8]/40 text-sm md:text-base tracking-wide">
                {animal.scientific}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ══ BODY ══ */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_340px] gap-10 lg:gap-14 items-start">

          {/* ── LEFT ── */}
          <div className="detail-content">

            {/* Description */}
            <Reveal>
              <p className="font-body text-[#F0EEE8]/70 text-base md:text-lg leading-[1.85] mb-3">
                {animal.description}
              </p>
              {animal.longDescription && (
                <p className="font-body text-[#F0EEE8]/50 text-sm leading-[1.9]">
                  {animal.longDescription}
                </p>
              )}
            </Reveal>

            {/* Quick stats */}
            {(animal.weight || animal.lifespan || animal.speed || animal.diet) && (
              <Reveal delay={0.1} className="mt-10">
                <h2 className="font-heading font-semibold text-[#F0EEE8]/40 text-[0.6rem]
                               tracking-[0.2em] uppercase mb-5">Quick Stats</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {animal.weight    && <StatCard icon="⚖️" label="Weight"   value={animal.weight}   accent="#C4956A" />}
                  {animal.lifespan  && <StatCard icon="⏳" label="Lifespan" value={animal.lifespan} accent="#7AAACE" />}
                  {animal.speed     && <StatCard icon="⚡" label="Speed"    value={animal.speed}    accent="#a3e635" />}
                  {animal.diet      && <StatCard icon="🍖" label="Diet"     value={animal.diet}     accent="#79AE6F" />}
                </div>
              </Reveal>
            )}

            {/* Gallery */}
            {images.length > 1 && (
              <Reveal delay={0.15} className="mt-10">
                <h2 className="font-heading font-semibold text-[#F0EEE8]/40 text-[0.6rem]
                               tracking-[0.2em] uppercase mb-5">Gallery</h2>
                <div className="grid grid-cols-2 gap-3">
                  {images.slice(1).map((src, i) => (
                    <GalleryImage key={i} src={src} alt={`${animal.name} ${i + 2}`}
                      className="h-48" />
                  ))}
                </div>
              </Reveal>
            )}

            {/* Threats */}
            {threats.length > 0 && (
              <Reveal delay={0.2} className="mt-10">
                <h2 className="font-heading font-semibold text-[#F0EEE8]/40 text-[0.6rem]
                               tracking-[0.2em] uppercase mb-5">Threat Assessment</h2>
                {threats.map(t => <ThreatBar key={t.label} label={t.label} pct={t.pct} />)}
              </Reveal>
            )}

            {/* Fun facts */}
            {funFacts.length > 0 && (
              <Reveal delay={0.25} className="mt-10">
                <h2 className="font-heading font-semibold text-[#F0EEE8]/40 text-[0.6rem]
                               tracking-[0.2em] uppercase mb-5">Did You Know?</h2>
                <div className="flex flex-col gap-3">
                  {funFacts.map((f, i) => (
                    <div key={i} className="flex gap-3 rounded-xl px-4 py-3"
                      style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                      <span className="text-[#7AAACE] font-heading font-bold text-sm shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="font-body text-[#F0EEE8]/60 text-sm leading-relaxed">{f}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Food web */}
            {(prey.length > 0 || predators.length > 0) && (
              <Reveal delay={0.3} className="mt-10">
                <h2 className="font-heading font-semibold text-[#F0EEE8]/40 text-[0.6rem]
                               tracking-[0.2em] uppercase mb-5">Food Web</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {prey.length > 0 && (
                    <div className="rounded-xl p-4"
                      style={{ background:"rgba(121,174,111,0.06)", border:"1px solid rgba(121,174,111,0.2)" }}>
                      <p className="font-heading text-[0.6rem] font-semibold tracking-[0.16em]
                                     uppercase text-[#79AE6F] mb-3">Preys On</p>
                      <div className="flex flex-wrap gap-2">
                        {prey.map(p => (
                          <span key={p} className="font-heading text-[0.65rem] text-[#F0EEE8]/60
                                                    px-2.5 py-1 rounded-full bg-white/[0.04]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {predators.length > 0 && (
                    <div className="rounded-xl p-4"
                      style={{ background:"rgba(224,112,80,0.06)", border:"1px solid rgba(224,112,80,0.2)" }}>
                      <p className="font-heading text-[0.6rem] font-semibold tracking-[0.16em]
                                     uppercase text-[#E07050] mb-3">Predators</p>
                      <div className="flex flex-wrap gap-2">
                        {predators.map(p => (
                          <span key={p} className="font-heading text-[0.65rem] text-[#F0EEE8]/60
                                                    px-2.5 py-1 rounded-full bg-white/[0.04]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="detail-sidebar flex flex-col gap-5 lg:sticky lg:top-8">

            {/* Population */}
            {animal.population && (
              <Reveal>
                <div className="rounded-2xl p-6"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                  <p className="font-heading text-[0.6rem] font-semibold tracking-[0.18em]
                                 uppercase text-[#F0EEE8]/35 mb-3">
                    Wild Population
                  </p>
                  <p className="font-heading font-bold text-[2rem] leading-none"
                    style={{ color: statusCfg.color, textShadow: `0 0 30px ${statusCfg.glow}` }}>
                    {animal.population}
                  </p>
                  {animal.popTrend && (
                    <p className="font-body text-[#F0EEE8]/45 text-xs capitalize mt-1">
                      {animal.popTrend}
                    </p>
                  )}
                </div>
              </Reveal>
            )}

            {/* Range */}
            {animal.range && (
              <Reveal delay={0.1}>
                <div className="rounded-2xl p-6"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span>🗺️</span>
                    <p className="font-heading text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-[#F0EEE8]/35">
                      Geographic Range
                    </p>
                  </div>
                  <p className="font-body text-[#F0EEE8]/65 text-sm leading-relaxed">{animal.range}</p>
                </div>
              </Reveal>
            )}

            {/* Classification */}
            <Reveal delay={0.15}>
              <div className="rounded-2xl p-6"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <p className="font-heading text-[0.6rem] font-semibold tracking-[0.18em] uppercase
                               text-[#F0EEE8]/35 mb-4">
                  Classification
                </p>
                {[
                  ["Category", animal.category],
                  ["Habitat",  animal.habitat],
                  ["Diet",     animal.diet],
                  ["Status",   animal.status],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2.5
                                          border-b border-white/[0.05] last:border-0">
                    <span className="font-heading text-[0.65rem] font-semibold tracking-wide
                                     text-[#F0EEE8]/35 uppercase">{k}</span>
                    <span className="font-heading font-semibold text-[#F0EEE8] text-xs">{v}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Ecosystem CTA */}
            <Reveal delay={0.2}>
              <div className="rounded-2xl p-6 text-center"
                style={{ background:"rgba(52,103,57,0.12)", border:"1px solid rgba(52,103,57,0.3)" }}>
                <span className="text-3xl block mb-3">🌿</span>
                <h3 className="font-heading font-semibold text-[#F0EEE8] text-sm mb-2">
                  Add to Your Ecosystem
                </h3>
                <p className="font-body text-[#F0EEE8]/45 text-xs leading-relaxed mb-5">
                  Simulate how this species interacts within a living food web.
                </p>
                <button onClick={() => navigate("/ecosystem")}
                  className="w-full py-2.5 rounded-full font-heading font-semibold text-xs tracking-wide
                             bg-[#346739] text-[#F0EEE8] hover:bg-[#4a9150]
                             transition-all duration-200 hover:scale-[1.02]
                             shadow-[0_0_20px_rgba(52,103,57,0.35)]">
                  Build Ecosystem →
                </button>
              </div>
            </Reveal>

            {/* AI insight */}
            <Reveal delay={0.25}>
              <div className="rounded-2xl p-5"
                style={{ background:"rgba(122,170,206,0.06)", border:"1px solid rgba(122,170,206,0.2)" }}>
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">🤖</span>
                  <div>
                    <p className="font-heading text-[0.6rem] font-bold tracking-[0.16em] uppercase
                                   text-[#7AAACE] mb-1.5">AI Insight</p>
                    <p className="font-body text-[#F0EEE8]/55 text-xs leading-relaxed">
                      In a balanced ecosystem, pair the{" "}
                      <strong className="text-[#F0EEE8]/80">{animal.name}</strong> with
                      abundant prey species to maintain ecological stability.
                      Avoid over-populating predators.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>

        {/* ── Related Animals ── */}
        {relatedIds.length > 0 && (
          <Reveal className="mt-16 pt-10 border-t border-white/[0.06]">
            <h3 className="font-heading font-semibold text-[#F0EEE8] text-sm tracking-wide mb-6
                            flex items-center gap-2">
              <span>🔗</span> Related Animals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {relatedIds.slice(0, 3).map(rid => (
                <button key={rid} onClick={() => navigate(`/animal/${rid}`)}
                  className="text-left overflow-hidden rounded-2xl bg-[#161616]
                             hover:-translate-y-1 transition-transform duration-300">
                  <div className="h-32 overflow-hidden relative flex items-center justify-center bg-white/[0.04]">
                    <p className="font-heading text-[#F0EEE8]/30 text-xs">{rid}</p>
                  </div>
                  <div className="p-3">
                    <p className="font-heading font-semibold text-[#F0EEE8] text-xs">{rid}</p>
                  </div>
                </button>
              ))}
            </div>
          </Reveal>
        )}

        {/* ── Bottom CTA ── */}
        <Reveal className="mt-14 rounded-2xl p-8 md:p-10 text-center overflow-hidden relative"
          style={{ background:"linear-gradient(135deg, rgba(52,103,57,0.15), rgba(53,88,114,0.15))",
                   border:"1px solid rgba(255,255,255,0.08)" }}>
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage:`url(${images[0]})`, backgroundSize:"cover", backgroundPosition:"center" }} />
          <div className="relative z-10">
            <h3 className="font-heading font-bold text-[#F0EEE8] text-xl md:text-2xl mb-3">
              Help protect the{" "}
              <span style={{ color: statusCfg.color }}>{animal.name}</span>
            </h3>
            <p className="font-body text-[#F0EEE8]/45 text-sm max-w-md mx-auto leading-relaxed mb-7">
              Explore the ecosystem simulator to understand the role this species plays
              in its habitat — and what happens when it disappears.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => navigate("/ecosystem")}
                className="px-6 py-2.5 rounded-full bg-[#346739] text-[#F0EEE8]
                           font-heading font-semibold text-sm hover:bg-[#4a9150] transition-colors">
                Run Simulation →
              </button>
              <button onClick={() => navigate("/animals")}
                className="px-6 py-2.5 rounded-full border border-white/[0.15] text-[#F0EEE8]/70
                           font-heading font-medium text-sm hover:text-white transition-colors">
                More Animals
              </button>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}