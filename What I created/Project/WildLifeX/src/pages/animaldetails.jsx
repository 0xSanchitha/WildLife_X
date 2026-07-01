import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
    <div ref={ref} className={`transition-all duration-700 ease-out ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

// ─── HABITAT / STATUS CONFIG ──────────────────────────────────────────────────
const HABITAT_STYLES = {
  Ocean:     { bg:"rgba(53,88,114,0.35)",  border:"#7AAACE", text:"#A8D4F5" },
  Forest:    { bg:"rgba(52,103,57,0.35)",  border:"#79AE6F", text:"#A8D4A0" },
  Mountain:  { bg:"rgba(90,70,60,0.35)",   border:"#C4956A", text:"#E8C49A" },
  Tundra:    { bg:"rgba(80,100,120,0.35)", border:"#9AB5CC", text:"#C8DDE8" },
  Arctic:    { bg:"rgba(80,100,120,0.35)", border:"#9AB5CC", text:"#C8DDE8" },
  Grassland: { bg:"rgba(100,90,40,0.35)",  border:"#C8B860", text:"#E8D890" },
  Desert:    { bg:"rgba(120,90,40,0.35)",  border:"#D4A84B", text:"#F0D080" },
  Rainforest:{ bg:"rgba(30,90,50,0.35)",   border:"#4ade80", text:"#86efac" },
  Wetland:   { bg:"rgba(30,90,70,0.35)",   border:"#52A388", text:"#86f0ac" },
};

const STATUS_CONFIG = {
  "Least Concern":         { color:"#79AE6F", glow:"rgba(121,174,111,0.3)",  label:"Least Concern"         },
  "Near Threatened":       { color:"#a3e635", glow:"rgba(163,230,53,0.3)",   label:"Near Threatened"       },
  "Vulnerable":            { color:"#C4956A", glow:"rgba(196,149,106,0.3)",  label:"Vulnerable"            },
  "Endangered":            { color:"#E07050", glow:"rgba(224,112,80,0.3)",   label:"Endangered"            },
  "Critically Endangered": { color:"#E04040", glow:"rgba(224,64,64,0.35)",   label:"Critically Endangered" },
  "Extinct":               { color:"#888",    glow:"rgba(136,136,136,0.2)",  label:"Extinct"               },
};

// ─── MOCK DATABASE FALLBACK ──────────────────────────────────────────────────
const ANIMAL_DB = {
  "snow-leopard": {
    id: "snow-leopard",
    name: "Snow Leopard",
    scientific: "Panthera uncia",
    category: "Mammals",
    habitat: "Mountain",
    status: "Vulnerable",
    description: "A ghost of the high peaks — rarely seen, impossible to forget. The snow leopard is one of the world's most elusive big cats, perfectly adapted for the cold, harsh environments of Central Asia's mountain ranges.",
    longDescription: "Snow leopards inhabit alpine and subalpine zones at elevations of 3,000–4,500 meters. Their thick, spotted coats provide insulation and camouflage, while their wide, fur-covered paws act as natural snowshoes. Unlike other big cats, snow leopards cannot roar — instead they make a range of other sounds including chuffing, yowling, and a unique 'poo-wah' call used during mating season.",
    diet: "Carnivore",
    dietDetail: "Blue sheep (bharal), ibex, argali, smaller mammals",
    lifespan: "10–12 years wild / 20 years captive",
    weight: "22–55 kg",
    length: "75–150 cm body",
    speed: "64 km/h",
    predators: ["Humans (poaching)"],
    prey: ["Blue Sheep", "Ibex", "Argali", "Marmot", "Hare"],
    population: "4,000–6,500",
    popTrend: "decreasing",
    range: "Central Asia — 12 countries including China, India, Nepal, Mongolia",
    funFacts: [
      "Their tails are nearly as long as their bodies — used for balance and warmth.",
      "They can leap up to 9 meters horizontally and 3 meters vertically.",
      "A snow leopard's territory can span 1,000 km².",
      "They are the only big cat that cannot roar.",
    ],
    images: [
      "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=800&q=80",
      "https://images.unsplash.com/photo-1615824996195-f780bba7cfb9?w=600&q=80",
      "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&q=80",
    ],
    threats: [
      { label: "Habitat Loss",    pct: 75 },
      { label: "Poaching",        pct: 60 },
      { label: "Climate Change",  pct: 50 },
      { label: "Human Conflict",  pct: 40 },
    ],
    relatedIds: ["arctic-fox", "wolf", "eagle"],
  },
  "manta-ray": {
    id: "manta-ray",
    name: "Manta Ray",
    scientific: "Mobula birostris",
    category: "Fish",
    habitat: "Ocean",
    status: "Endangered",
    description: "Glides through open water with the silence of a living shadow. The giant manta ray is the world's largest ray, with wingspans reaching 7 meters.",
    longDescription: "Manta rays are found in tropical and subtropical ocean waters worldwide. They are filter feeders, swimming with their mouths open to collect plankton and small fish. Despite their size, manta rays are graceful and acrobatic — they regularly leap clear out of the water in behavior scientists are still working to explain.",
    diet: "Filter Feeder",
    dietDetail: "Zooplankton, krill, small fish, crab larvae",
    lifespan: "40+ years",
    weight: "Up to 2,000 kg",
    length: "Up to 7 m wingspan",
    speed: "24 km/h",
    predators: ["Sharks"],
    prey: ["Zooplankton", "Krill", "Small Fish"],
    population: "~3,000 (oceanic)",
    popTrend: "decreasing",
    range: "Tropical & subtropical oceans worldwide",
    funFacts: [
      "Manta rays have the largest brain-to-body ratio of any cold-blooded fish.",
      "They visit cleaning stations where small fish remove parasites.",
      "Individual rays can be identified by the unique spot patterns on their bellies.",
      "A manta ray's 'horns' are actually cephalic fins that funnel food into their mouths.",
    ],
    images: [
      "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80",
      "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=600&q=80",
      "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=600&q=80",
    ],
    threats: [
      { label: "Bycatch",          pct: 70 },
      { label: "Targeted Fishing", pct: 65 },
      { label: "Ocean Pollution",  pct: 55 },
      { label: "Climate Change",   pct: 45 },
    ],
    relatedIds: ["shark", "dolphin", "turtle"],
  },
};

const API_BASE = "http://localhost:5000";

// Schema Translator Mapper
const mapApiAnimalToDetails = (a) => {
  return {
    id: a.id,
    name: a.name,
    scientific: a.scientificName || a.scientific || "Species name",
    category: a.category,
    habitat: a.habitat,
    status: a.conservationStatus || a.status || "Least Concern",
    description: a.description,
    longDescription: a.longDescription || a.description,
    diet: a.diet,
    dietDetail: a.dietDetail || (a.prey && a.prey.length > 0 ? `Consumes ${a.prey.join(', ')}` : "Feeds on local vegetation and foliage"),
    lifespan: a.lifespan || "N/A",
    weight: a.weight || "N/A",
    length: a.length || "N/A",
    speed: a.speed || "N/A",
    predators: a.predators || [],
    prey: a.prey || [],
    population: a.population || "Unknown",
    popTrend: a.popTrend || "stable",
    range: a.range || `${a.habitat} zones worldwide`,
    funFacts: a.funFacts || [
      `${a.name} plays a vital ecological role inside its ${a.habitat} environment.`,
      `In simulations, its physical strength rating is set to ${a.simulationStats?.strength || 50}/100.`,
      `Requires metabolic energy levels above 70% to begin reproduction cycles.`
    ],
    images: a.images && a.images.length > 0 ? a.images : ["https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=800&q=80"],
    threats: a.threats || [
      { label: "Habitat Loss", pct: 70 },
      { label: "Climate Disturbances", pct: 50 },
      { label: "Human Coexistence", pct: 35 }
    ],
    relatedIds: a.relatedIds || (a.diet === "Carnivore" ? ["wolf", "lion"] : ["deer", "zebra"])
  };
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AnimalDetail() {
  const { id } = useParams();           // e.g. /animal/wolf
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch animal detail on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/animals/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Animal not found");
        return res.json();
      })
      .then(data => {
        setAnimal(mapApiAnimalToDetails(data));
        setLoading(false);
      })
      .catch(err => {
        console.warn("Flask server offline or animal not in DB. Querying local ANIMAL_DB.", err);
        // Fallback to static records
        const fallback = ANIMAL_DB[id] || ANIMAL_DB["snow-leopard"];
        setAnimal(fallback);
        setLoading(false);
      });
  }, [id]);

  // scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#F0EEE8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#79AE6F]/20 border-t-[#79AE6F] rounded-full animate-spin" />
      </div>
    );
  }

  if (!animal) return null;

  const habitat = HABITAT_STYLES[animal.habitat] || HABITAT_STYLES["Forest"];
  const statusCfg = STATUS_CONFIG[animal.status] || STATUS_CONFIG["Least Concern"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#F0EEE8] overflow-x-hidden pt-12">
      <style>{STYLES}</style>

      {/* ══════════════════════════════════════════════════
          HERO — full bleed image with overlaid headline
      ══════════════════════════════════════════════════ */}
      <section className="relative h-[70vh] min-h-[480px] max-h-[760px] overflow-hidden">

        {/* Hero image */}
        <img
          src={animal.images[0]}
          alt={animal.name}
          className="absolute inset-0 w-full h-full object-cover detail-hero-img"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/70 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full
                     bg-black/50 backdrop-blur-md border border-white/[0.12]
                     font-heading text-[0.72rem] font-medium tracking-wide text-[#F0EEE8]/80
                     hover:text-[#F0EEE8] hover:bg-black/70 transition-all duration-200 cursor-pointer"
        >
          ← Back
        </button>

        {/* Hero text */}
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
            <p className="font-body italic text-[#F0EEE8]/40 text-sm md:text-base tracking-wide">
              {animal.scientific}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BODY
      ══════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-6 py-12 md:py-16">

        <div className="grid lg:grid-cols-[1fr_340px] gap-10 lg:gap-14 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="detail-content">

            {/* Description */}
            <Reveal>
              <p className="font-body text-[#F0EEE8]/70 text-base md:text-lg leading-[1.85] mb-3 font-medium">
                {animal.description}
              </p>
              <p className="font-body text-[#F0EEE8]/50 text-sm leading-[1.9]">
                {animal.longDescription}
              </p>
            </Reveal>

            {/* ── Quick stats grid ── */}
            <Reveal delay={0.1} className="mt-10">
              <p className="font-heading text-[0.65rem] font-semibold tracking-[0.22em] uppercase
                             text-[#F0EEE8]/30 mb-5">
                Quick Facts
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard icon="🍖" label="Diet"     value={animal.diet}     accent="#C4956A" />
                <StatCard icon="🌍" label="Habitat"  value={animal.habitat}  accent={habitat.border} />
                <StatCard icon="⏳" label="Lifespan" value={animal.lifespan} accent="#9AB5CC" />
                <StatCard icon="⚖️" label="Weight"   value={animal.weight}   accent="#79AE6F" />
                <StatCard icon="📏" label="Length"   value={animal.length}   accent="#79AE6F" />
                <StatCard icon="⚡" label="Speed"    value={animal.speed}    accent="#7AAACE" />
              </div>
            </Reveal>

            {/* ── Diet detail ── */}
            <Reveal delay={0.15} className="mt-10">
              <div className="rounded-2xl p-6"
                style={{ background:"rgba(196,149,106,0.07)", border:"1px solid rgba(196,149,106,0.2)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🍖</span>
                  <h3 className="font-heading font-semibold text-[#F0EEE8] text-sm tracking-wide">
                    Diet & Feeding
                  </h3>
                </div>
                <p className="font-heading text-[0.68rem] font-semibold tracking-[0.12em] uppercase
                               text-[#C4956A] mb-2">
                  {animal.diet}
                </p>
                <p className="font-body text-[#F0EEE8]/55 text-sm leading-relaxed">
                  {animal.dietDetail}
                </p>
              </div>
            </Reveal>

            {/* ── Predator / Prey ── */}
            <Reveal delay={0.2} className="mt-6">
              <div className="grid sm:grid-cols-2 gap-4">

                {/* Predators */}
                <div className="rounded-2xl p-5"
                  style={{ background:"rgba(224,64,64,0.06)", border:"1px solid rgba(224,64,64,0.18)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">⚔️</span>
                    <h3 className="font-heading font-semibold text-[#F0EEE8] text-sm">Predators</h3>
                  </div>
                  {animal.predators.length === 0 ? (
                    <p className="font-body text-[#F0EEE8]/35 text-xs italic">No natural predators</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {animal.predators.map(p => (
                        <span key={p}
                          className="font-heading text-[0.62rem] font-semibold tracking-[0.1em] uppercase
                                     px-2.5 py-1 rounded-full bg-[#E04040]/12 border border-[#E04040]/25
                                     text-[#E07070] capitalize">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Prey */}
                <div className="rounded-2xl p-5"
                  style={{ background:"rgba(121,174,111,0.06)", border:"1px solid rgba(121,174,111,0.18)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🐾</span>
                    <h3 className="font-heading font-semibold text-[#F0EEE8] text-sm">Prey / Food</h3>
                  </div>
                  {animal.prey.length === 0 ? (
                    <p className="font-body text-[#F0EEE8]/35 text-xs italic">Feeds on plants/corals</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {animal.prey.map(p => (
                        <span key={p}
                          className="font-heading text-[0.62rem] font-semibold tracking-[0.1em] uppercase
                                     px-2.5 py-1 rounded-full bg-[#79AE6F]/12 border border-[#79AE6F]/25
                                     text-[#A8D4A0] capitalize">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>

            {/* ── Threats ── */}
            <Reveal delay={0.25} className="mt-8">
              <div className="rounded-2xl p-6"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-lg">⚠️</span>
                  <h3 className="font-heading font-semibold text-[#F0EEE8] text-sm tracking-wide">
                    Conservation Threats
                  </h3>
                </div>
                {animal.threats.map(t => (
                  <ThreatBar key={t.label} label={t.label} pct={t.pct} />
                ))}
              </div>
            </Reveal>

            {/* ── Fun Facts ── */}
            <Reveal delay={0.3} className="mt-8">
              <h3 className="font-heading font-semibold text-[#F0EEE8] text-sm tracking-wide mb-5
                              flex items-center gap-2">
                <span>💡</span> Did You Know?
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {animal.funFacts.map((fact, i) => (
                  <div key={i} className="rounded-xl p-4 flex gap-3 items-start"
                    style={{ background:"rgba(122,170,206,0.06)", border:"1px solid rgba(122,170,206,0.15)" }}>
                    <span className="font-heading font-bold text-[#7AAACE]/50 text-xs mt-0.5 shrink-0">
                      {String(i+1).padStart(2,"0")}
                    </span>
                    <p className="font-body text-[#F0EEE8]/60 text-xs leading-relaxed">{fact}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* ── Photo Gallery ── */}
            <Reveal delay={0.35} className="mt-10">
              <h3 className="font-heading font-semibold text-[#F0EEE8] text-sm tracking-wide mb-5
                              flex items-center gap-2">
                <span>📸</span> Gallery
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <GalleryImage src={animal.images[0]} alt={animal.name} className="col-span-2 h-52" />
                <div className="flex flex-col gap-3">
                  <GalleryImage src={animal.images[1] || animal.images[0]} alt={animal.name} className="h-[calc(50%-6px)]" />
                  <GalleryImage src={animal.images[2] || animal.images[0]} alt={animal.name} className="h-[calc(50%-6px)]" />
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="detail-sidebar lg:sticky lg:top-8 flex flex-col gap-4">

            {/* Population card */}
            <Reveal>
              <div className="rounded-2xl p-6"
                style={{ background:`${statusCfg.color}0d`, border:`1px solid ${statusCfg.color}30` }}>
                <p className="font-heading text-[0.6rem] font-semibold tracking-[0.18em] uppercase mb-1"
                  style={{ color: statusCfg.color }}>
                  Wild Population
                </p>
                <p className="font-heading font-bold text-[#F0EEE8] text-2xl mb-2 font-mono">
                  {animal.population}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{animal.popTrend === "decreasing" ? "📉" : "📈"}</span>
                  <p className="font-body text-[#F0EEE8]/45 text-xs capitalize">{animal.popTrend}</p>
                </div>
              </div>
            </Reveal>

            {/* Range card */}
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

            {/* Classification card */}
            <Reveal delay={0.15}>
              <div className="rounded-2xl p-6"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <p className="font-heading text-[0.6rem] font-semibold tracking-[0.18em] uppercase
                               text-[#F0EEE8]/35 mb-4">
                  Classification
                </p>
                {[
                  ["Category",    animal.category],
                  ["Habitat",     animal.habitat],
                  ["Diet",        animal.diet],
                  ["Status",      animal.status],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2.5
                                          border-b border-white/[0.05] last:border-0">
                    <span className="font-heading text-[0.65rem] font-semibold tracking-wide text-[#F0EEE8]/35 uppercase">
                      {k}
                    </span>
                    <span className="font-heading font-semibold text-[#F0EEE8] text-xs">{v}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Add to ecosystem CTA */}
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
                <button
                  onClick={() => navigate("/ecosystem")}
                  className="w-full py-2.5 rounded-full font-heading font-semibold text-xs tracking-wide
                             bg-[#346739] text-[#F0EEE8] hover:bg-[#4a9150]
                             transition-all duration-200 hover:scale-[1.02]
                             shadow-[0_0_20px_rgba(52,103,57,0.35)] cursor-pointer"
                >
                  Build Ecosystem →
                </button>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </div>
  );
}