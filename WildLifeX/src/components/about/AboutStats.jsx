// src/components/about/AboutStats.jsx
import { useEffect, useRef, useState } from "react";

function useCountUp(target, duration = 1800) {
  const [count, setCount]   = useState(0);
  const [ready, setReady]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setReady(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(pct * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [ready, target, duration]);

  return [ref, count];
}

function StatItem({ label, target }) {
  const [ref, count] = useCountUp(target);
  return (
    <div ref={ref} className="text-center px-4">
      <p className="font-heading text-forest-mid text-xs font-semibold
                     tracking-[0.2em] uppercase mb-3">
        {label}
      </p>
      {/* stat-number uses the class from index.css */}
      <p className="stat-number">{count}</p>
    </div>
  );
}

export default function AboutStats() {
  return (
    <section className="bg-ocean-light py-12 px-6">
      <div className="section-container">
        {/* Rounded green card — matching home page stats block */}
        <div className="bg-forest-dark rounded-2xl py-12 px-6 shadow-[var(--shadow-glow-forest)]">
          <div className="grid grid-cols-3 divide-x divide-white/15 max-w-xl mx-auto">
            <StatItem label="Users"   target={274} />
            <StatItem label="Animals" target={120} />
            <StatItem label="Reviews" target={102} />
          </div>
        </div>
      </div>
    </section>
  );
}
