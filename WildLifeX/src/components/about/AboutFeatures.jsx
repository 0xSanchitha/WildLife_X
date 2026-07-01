// src/components/about/AboutFeatures.jsx

const FEATURES = [
  {
    img: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=500&q=80",
    tag:   "Animal Explorer",
    title: "Discover Wildlife",
    desc:  "Discover wildlife across diverse ecosystems with rich visuals and essential information. Learn about each species' habitat, diet, and role in nature.",
  },
  {
    img: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=500&q=80",
    tag:   "Ecosystem Simulator",
    title: "Build & Observe",
    desc:  "Build and observe dynamic ecosystems where animals interact through real-world relationships like predation, reproduction, and survival.",
  },
  {
    img: "https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=500&q=80",
    tag:   "Scenario System",
    title: "Learn by Doing",
    desc:  "Build and observe dynamic ecosystems where animals interact through real-world relationships like predation, reproduction, and survival.",
  },
];

function FeatureCard({ img, tag, title, desc }) {
  return (
    <div className="feature-card group cursor-pointer">
      {/* Image area */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/30 to-transparent" />

        {/* Tag + title pinned to image bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-heading text-[0.58rem] font-semibold tracking-[0.2em]
                          uppercase text-forest-mid mb-0.5">
            {tag}
          </p>
          <h3 className="font-heading font-semibold text-ocean-light text-sm leading-tight">
            {title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 pb-5">
        <p className="font-body text-ocean-light/50 text-xs leading-relaxed mb-4">
          {desc}
        </p>
        <button className="btn-outline text-xs py-1.5 px-4">
          Explore ∨
        </button>
      </div>
    </div>
  );
}

export default function AboutFeatures() {
  return (
    <section className="relative bg-dark py-24 overflow-hidden">

      {/* Subtle bg texture using a leaf image — very faint */}
      <div
        className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&q=20")`,
        }}
      />

      <div className="relative section-container">
        {/* Section heading — same style as "OUR FEATURES" on home */}
        <h2 className="section-title text-ocean-light mb-14">Our Features</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <FeatureCard key={f.tag} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
