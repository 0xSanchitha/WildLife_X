// src/components/about/AboutMission.jsx
import tentaclesImg from "../../assets/decorative/tenticles.png";
import bushImg      from "../../assets/decorative/bush.png";

// Replace with real animal images from your assets or API
const ANIMAL_IMGS = [
  "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=300&q=80", // arctic fox
  "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=300&q=80", // bear
  "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=300&q=80", // sea turtle
];

export default function AboutMission() {
  return (
    <section
      id="about-mission"
      className="relative bg-ocean-light overflow-hidden py-24 md:py-32"
    >
      {/* ── tiny tentacles – bottom right decorative (like home page) ── */}
      <div className="absolute -right-4 bottom-[-6%] w-[clamp(100px,16vw,220px)]
                       pointer-events-none opacity-55 z-[2]
                       animate-[float_7s_ease-in-out_infinite]">
        <img src={tentaclesImg} alt="" className="w-full block" />
      </div>

      {/* ── small bush – bottom left peek ── */}
      <div className="absolute -left-6 bottom-[-8%] w-[clamp(140px,20vw,280px)]
                       pointer-events-none opacity-40 z-[1]
                       animate-[float_9s_ease-in-out_0.5s_infinite]">
        <img src={bushImg} alt="" className="w-full block" />
      </div>

      <div className="section-container relative z-10">

        {/* Section heading — matches "ABOUT US" style from home */}
        <h2 className="section-title mb-14">About Us</h2>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: paragraph + CTA ── */}
          <div>
            <p className="font-body text-dark/80 text-base leading-[1.95] mb-8 max-w-lg">
              WildlifeX is an interactive platform designed to help users
              explore wildlife and understand how ecosystems connect across
              ocean and land. Through engaging visuals and intelligent systems,
              we make learning about nature{" "}
              <strong className="text-forest-dark font-semibold">simple, immersive,</strong>{" "}
              and meaningful.
            </p>
            <a href="/ecosystem" className="btn-primary">
              Learn More →
            </a>
          </div>

          {/* ── Right: staggered animal photo cards ── */}
          <div className="flex items-end justify-center lg:justify-end gap-3 relative">
            {ANIMAL_IMGS.map((src, i) => (
              <div
                key={i}
                className="feature-card overflow-hidden flex-shrink-0 rounded-xl shadow-card"
                style={{
                  width:  i === 1 ? "148px" : "118px",
                  height: i === 1 ? "192px" : "152px",
                  marginBottom: i === 0 ? "28px" : i === 2 ? "48px" : "0",
                }}
              >
                <img
                  src={src}
                  alt={`animal-${i}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
