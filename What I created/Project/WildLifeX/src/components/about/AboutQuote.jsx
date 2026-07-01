// src/components/about/AboutQuote.jsx
// Matches the home page quote strip — light bg, italic, divider line

export default function AboutQuote() {
  return (
    <section className="relative bg-ocean-light py-20 overflow-hidden">
      <div className="section-container max-w-3xl mx-auto text-center">

        {/* Large decorative opening quote */}
        <div className="font-display text-[7rem] leading-none text-dark/[0.07]
                         select-none pointer-events-none -mb-8 font-black">
          "
        </div>

        <blockquote>
          <p className="font-heading text-dark text-2xl md:text-3xl lg:text-[2.1rem]
                          font-semibold italic leading-[1.45] mb-6">
            Look deep into nature, and then you will understand everything better.
          </p>
          <footer className="font-body text-xs text-dark/45 tracking-[0.2em] uppercase">
            — Albert Einstein
          </footer>
        </blockquote>

        {/* Decorative line — exactly like home */}
        <div className="mt-10 h-0.5 max-w-xs mx-auto
                         bg-gradient-to-r from-transparent via-forest-mid/55 to-transparent" />
      </div>
    </section>
  );
}
