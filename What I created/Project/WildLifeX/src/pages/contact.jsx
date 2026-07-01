import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bushImg       from "../assets/decorative/bush.png";
import treeBranchImg from "../assets/decorative/treebranch.png";
import bamboBushImg  from "../assets/decorative/bambobush.png";
import forestImg  from "../assets/backgrounds/contact-green.jpg";
import oceanImg  from "../assets/backgrounds/contact-ocean.jpg";

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

function Label({ children, accent = "forest" }) {
  const styles = {
    forest: "border-[#79AE6F]/35 text-[#79AE6F] bg-[#79AE6F]/08",
    ocean:  "border-[#7AAACE]/45 text-[#A8D4F5] bg-[#7AAACE]/15",
  };
  return (
    <span className={`font-heading inline-block px-3 py-1 rounded-full text-[0.65rem] font-semibold tracking-[0.18em] uppercase border ${styles[accent]}`}>
      {children}
    </span>
  );
}

// ─── GLASS INPUT ─────────────────────────────────────────────────────────────
function GlassInput({ label, type = "text", name, value, onChange, placeholder, rows }) {
  const base = `w-full bg-white/[0.06] border border-white/[0.14] rounded-xl px-4
                font-body text-[#F7F8F0] text-sm placeholder:text-[#F7F8F0]/30
                focus:outline-none focus:border-[#79AE6F]/60 focus:bg-white/[0.10]
                transition-all duration-200 backdrop-blur-sm`;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-heading text-[0.65rem] font-semibold tracking-[0.16em] uppercase text-[#F7F8F0]/40">
        {label}
      </label>
      {rows ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${base} py-3 resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${base} h-11`}
        />
      )}
    </div>
  );
}

// ─── CONTACT INFO CARD ────────────────────────────────────────────────────────
function InfoCard({ icon, label, value, accent }) {
  const accents = {
    forest: { border: "#79AE6F", text: "#79AE6F" },
    ocean:  { border: "#7AAACE", text: "#7AAACE" },
    sand:   { border: "#C4956A", text: "#C4956A" },
  };
  const a = accents[accent] ?? accents.forest;
  return (
    <div
      className="rounded-2xl p-5 backdrop-blur-md bg-white/[0.06] border border-white/[0.12]
                 hover:-translate-y-1 transition-transform duration-300"
      style={{ borderTop: `2px solid ${a.border}55` }}
    >
      <span className="text-xl mb-3 block" style={{ color: a.text }}>{icon}</span>
      <p className="font-heading text-[0.6rem] font-bold tracking-[0.18em] uppercase mb-1"
         style={{ color: a.text }}>
        {label}
      </p>
      <p className="font-body text-[#F7F8F0]/60 text-sm leading-relaxed">{value}</p>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Contact() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]   = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Replace with your actual form submission logic (e.g. EmailJS / Formspree)
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  };

  // FAQ data
  const faqs = [
    { q: "Can I contribute to WildlifeX?",  a: "Yes — future community contributions may be supported. Watch the GitHub repo for updates." },
    { q: "Is WildlifeX open source?",        a: "Parts of the project are open source and available on GitHub for learning and collaboration." },
    { q: "Who built WildlifeX?",             a: "WildlifeX was designed and developed solo by Sanchitha Maduranga, also known as Chilly." },
  ];
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen bg-[#0a0f0b] flex flex-col justify-center overflow-hidden pt-24">

        {/* Glows */}
        <div className="absolute -left-[15%] top-[25%] w-96 h-72 rounded-full bg-[#346739]/18 blur-[90px] pointer-events-none" />
        <div className="absolute right-[5%] top-[40%]  w-64 h-48 rounded-full bg-[#355872]/20 blur-[80px] pointer-events-none" />

        {/* Decorative — tree branch top-right */}
        <div className="absolute right-0 top-20 w-[clamp(320px,15vw,220px)] pointer-events-none z-[2] opacity-50"
             style={{ animation: "floatY 10s ease-in-out infinite" }}>
          <img src={treeBranchImg} alt="" className="w-full block" />
        </div>

        {/* Decorative — bamboo bottom-left */}
        <div className="absolute right-0 bottom-0 w-[clamp(180px,10vw,240px)] pointer-events-none z-[2] opacity-55"
             style={{ animation: "floatY 7s ease-in-out 0.5s infinite" }}>
          <img src={bamboBushImg} alt="" className="w-full block" />
        </div>

        {/* Decorative — bush bottom-right */}
        <div className="absolute left-0 bottom-0 w-[clamp(190px,11vw,160px)] pointer-events-none z-[2] opacity-45"
             style={{ animation: "floatY 9s ease-in-out 1.5s infinite" }}>
          <img src={bushImg} alt="" className="w-full block" />
        </div>

        <div className="absolute left-0 top-0 w-[clamp(220px,11vw,160px)] pointer-events-none z-[2] opacity-45 rotate-90"
             style={{ animation: "floatY 9s ease-in-out 1.5s infinite" }}>
          <img src={bushImg} alt="" className="w-full block" />
        </div>

        <style>{`
          @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>

        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-16 py-20 text-center">
          <Reveal>
            <Label accent="ocean">Contact</Label>
          </Reveal>

          <Reveal delay={0.1} className="mt-6">
            <h1 className="font-heading font-bold text-[#F7F8F0] leading-[1.08]
                           text-[clamp(2.8rem,7vw,5.5rem)]">
              Get in{" "}
              <span className="text-[#7AAACE]">Touch</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2} className="mt-5 max-w-md mx-auto">
            <p className="font-body text-[#F7F8F0]/50 text-[0.95rem] leading-[1.85]">
              Have questions, feedback, or ideas for WildlifeX?
              <br />We'd love to hear from you.
            </p>
          </Reveal>

          <Reveal delay={0.3} className="mt-8 flex justify-center">
            <div className="h-px w-48 bg-gradient-to-r from-transparent via-[#7AAACE]/50 to-transparent" />
          </Reveal>

          {/* Scroll cue */}
          <Reveal delay={0.5} className="mt-12">
            <div className="flex flex-col items-center gap-2 opacity-30">
              <span className="font-heading text-[0.6rem] tracking-[0.2em] uppercase text-[#F7F8F0]">Scroll</span>
              <div className="w-px h-8 bg-[#F7F8F0]/40" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FORM + INFO — ocean bg ══════════ */}
      <section className="relative py-28 px-6 md:px-16 overflow-hidden">

        {/* Ocean bg image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${oceanImg})` }}
        />
        <div className="absolute inset-0 bg-[#03111a]/82 backdrop-blur-[3px]" />

        {/* Bamboo — far left */}
        <div className="absolute left-0 bottom-0 w-[clamp(60px,7vw,100px)] pointer-events-none opacity-30 z-[1]"
             style={{ animation: "floatY 8s ease-in-out 1s infinite" }}>
          <img src={bamboBushImg} alt="" className="w-full block" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto grid lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* ── LEFT: FORM ── */}
          <Reveal>
            <div className="rounded-2xl p-8 md:p-10
                            backdrop-blur-md bg-white/[0.07]
                            border border-white/[0.13]
                            shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
                 style={{ borderTop: "2px solid rgba(122,170,206,0.35)" }}>

              <p className="font-heading text-[0.6rem] font-bold tracking-[0.2em] uppercase text-[#7AAACE] mb-1">
                Send a Message
              </p>
              <h2 className="font-heading font-bold text-[#F7F8F0] text-2xl mb-8">
                Let's start a conversation
              </h2>

              {sent ? (
                <div className="flex flex-col items-center text-center gap-4 py-10">
                  <div className="w-14 h-14 rounded-full bg-[#79AE6F]/15 border border-[#79AE6F]/40
                                  flex items-center justify-center text-2xl">
                    ✓
                  </div>
                  <p className="font-heading font-semibold text-[#F7F8F0] text-lg">Message sent!</p>
                  <p className="font-body text-[#F7F8F0]/45 text-sm leading-relaxed max-w-xs">
                    Thanks for reaching out. I'll get back to you within 24–48 hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name:"", email:"", subject:"", message:"" }); }}
                    className="mt-2 font-heading text-[0.7rem] tracking-[0.14em] uppercase text-[#7AAACE] hover:text-[#A8D4F5] transition-colors"
                  >
                    Send another →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <GlassInput label="Name"    name="name"    value={form.name}    onChange={handleChange} placeholder="Your name"  />
                    <GlassInput label="Email"   name="email"   type="email" value={form.email}   onChange={handleChange} placeholder="you@example.com" />
                  </div>
                  <GlassInput label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" />
                  <GlassInput label="Message" name="message" value={form.message} onChange={handleChange} placeholder="Tell me more…" rows={5} />

                  <button
                    type="submit"
                    disabled={sending}
                    className="mt-2 self-start flex items-center gap-2 px-6 py-3 rounded-full
                               bg-[#7AAACE] hover:bg-[#355872] disabled:opacity-50
                               font-heading font-medium text-sm text-[#F7F8F0]
                               transition-all duration-300 hover:scale-[1.03]"
                  >
                    {sending ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-[#F7F8F0]/30 border-t-[#F7F8F0] animate-spin" />
                        Sending…
                      </>
                    ) : "Send Message →"}
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* ── RIGHT: INFO + SOCIAL ── */}
          <div className="flex flex-col gap-4">
            <Reveal delay={0.1}>
              <InfoCard icon="✉️" label="Email"         accent="ocean"  value="wildlifex.contact@gmail.com" />
            </Reveal>
            <Reveal delay={0.2}>
              <InfoCard icon="📍" label="Location"      accent="forest" value="Sri Lanka" />
            </Reveal>
            <Reveal delay={0.3}>
              <InfoCard icon="⏱" label="Response Time" accent="sand"   value="Usually within 24–48 hours" />
            </Reveal>

            {/* Social links */}
            <Reveal delay={0.4}>
              <div className="rounded-2xl p-5 backdrop-blur-md bg-white/[0.06] border border-white/[0.12]"
                   style={{ borderTop: "2px solid rgba(121,174,111,0.4)" }}>
                <p className="font-heading text-[0.6rem] font-bold tracking-[0.18em] uppercase text-[#79AE6F] mb-4">
                  Find Me Online
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "GitHub", href: "https://github.com/0xSanchitha/", color: "#F7F8F0" },
                    { label: "LinkedIn", href: "https://linkedin.com/", color: "#7AAACE" },
                    { label: "Facebook", href: "https://facebook.com/", color: "#7AAACE" },
                    { label: "Instagram", href: "https://instagram.com/", color: "#C4956A" },
                  ].map(({ label, href, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between group
                                px-3 py-2 rounded-xl bg-white/[0.04]
                                hover:bg-white/[0.10]
                                border border-white/[0.08]
                                transition-all duration-200"
                    >
                      <span className="font-heading text-sm font-medium text-[#F7F8F0]/70 group-hover:text-[#F7F8F0] transition-colors">
                        {label}
                      </span>

                      <span
                        className="text-[0.65rem] font-heading tracking-widest transition-colors"
                        style={{ color }}
                      >
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ FAQ — forest bg ══════════ */}
      <section className="relative py-24 px-6 md:px-16 overflow-hidden">

        {/* Forest bg */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${forestImg})` }}
        />
        <div className="absolute inset-0 bg-[#031508]/80 backdrop-blur-[2px]" />

        {/* Branch decoration */}
        <div className="absolute right-0 top-0 w-[clamp(100px,12vw,180px)] pointer-events-none opacity-40 z-[1]"
             style={{ animation: "floatY 11s ease-in-out 2s infinite" }}>
          <img src={treeBranchImg} alt="" className="w-full block" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <Reveal className="text-center mb-12">
            <Label accent="forest">FAQ</Label>
            <h2 className="font-heading font-bold text-[#F7F8F0] text-[clamp(1.8rem,4vw,2.6rem)] mt-4 leading-[1.2]">
              Common questions
            </h2>
          </Reveal>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className="rounded-2xl overflow-hidden backdrop-blur-md bg-white/[0.07]
                             border border-white/[0.12] transition-all duration-300"
                  style={{ borderTop: "2px solid rgba(121,174,111,0.35)" }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left group"
                  >
                    <span className="font-heading font-semibold text-[#F7F8F0]/85 text-sm group-hover:text-[#F7F8F0] transition-colors">
                      {faq.q}
                    </span>
                    <span className={`text-[#79AE6F] text-lg transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}>
                      +
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40" : "max-h-0"}`}>
                    <p className="font-body text-[#F7F8F0]/50 text-sm leading-[1.85] px-6 pb-5">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ QUOTE ══════════ */}
      <section className="bg-[#071510] py-20 px-6 md:px-16 flex items-center justify-center">
        <div className="max-w-xl text-center">
          <Reveal>
            <p className="font-heading font-semibold text-[#F7F8F0]/55 text-xl md:text-2xl leading-[1.7] italic">
              "The Earth is what we all<br className="hidden md:block" />have in common."
            </p>
            <p className="font-heading text-[#F7F8F0]/22 text-[0.65rem] tracking-[0.22em] uppercase mt-5">
              — Wendell Berry
            </p>
          </Reveal>
        </div>
      </section>

    </div>
  );
}