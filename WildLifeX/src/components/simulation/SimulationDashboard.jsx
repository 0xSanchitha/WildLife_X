import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// Reusable Custom SVG Line/Area Chart Component
function SVGChart({ data, keys, colors, labels, title }) {
  if (!data || data.length < 2) {
    return (
      <div className="h-36 flex items-center justify-center text-xs text-[#EEEBE4]/30 border border-white/5 bg-white/2 rounded-xl">
        Awaiting simulation data points...
      </div>
    );
  }

  const width = 320;
  const height = 110;
  const padding = { top: 10, right: 10, bottom: 20, left: 25 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Find max value in keys across all data points to scale the Y-axis
  let maxVal = 10;
  data.forEach((d) => {
    keys.forEach((key) => {
      if (d[key] > maxVal) maxVal = d[key];
    });
  });
  // round maxVal to multiple of 5
  maxVal = Math.ceil(maxVal / 5) * 5;

  const pointsCount = data.length;

  return (
    <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 shadow-inner">
      <div className="flex items-center justify-between">
        <h4 className="font-heading text-xs font-semibold text-[#EEEBE4]/85 tracking-wider uppercase">
          {title}
        </h4>
        <div className="flex gap-2">
          {keys.map((key, idx) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx] }} />
              <span className="text-[#EEEBE4]/60 capitalize">{labels[idx]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block overflow-visible">
          {/* Y Axis Gridlines */}
          {[0, 0.5, 1.0].map((ratio, idx) => {
            const y = padding.top + chartH * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="2, 4"
                />
                <text
                  x={padding.left - 5}
                  y={y + 3}
                  fill="rgba(255,255,255,0.3)"
                  fontSize="8"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X Axis label for Day bounds */}
          <text
            x={padding.left}
            y={height - 2}
            fill="rgba(255,255,255,0.3)"
            fontSize="8"
            textAnchor="start"
          >
            Day {data[0].day}
          </text>
          <text
            x={width - padding.right}
            y={height - 2}
            fill="rgba(255,255,255,0.3)"
            fontSize="8"
            textAnchor="end"
          >
            Day {data[pointsCount - 1].day}
          </text>

          {/* Render Area & Line Paths for each key */}
          {keys.map((key, kIdx) => {
            const color = colors[kIdx];
            let pathD = "";
            let areaD = "";

            data.forEach((d, idx) => {
              const x = padding.left + (idx / (pointsCount - 1)) * chartW;
              const ratio = d[key] / maxVal;
              const y = padding.top + chartH - ratio * chartH;

              if (idx === 0) {
                pathD = `M ${x} ${y}`;
                areaD = `M ${x} ${padding.top + chartH} L ${x} ${y}`;
              } else {
                pathD += ` L ${x} ${y}`;
                areaD += ` L ${x} ${y}`;
              }

              if (idx === pointsCount - 1) {
                areaD += ` L ${x} ${padding.top + chartH} Z`;
              }
            });

            return (
              <g key={key}>
                {/* Area under the line */}
                <path
                  d={areaD}
                  fill={`url(#grad-${key})`}
                  style={{ mixBlendMode: "screen" }}
                />
                {/* Stroke line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Linear Gradients Definitions */}
                <defs>
                  <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function SimulationDashboard({ sim, activeTab, setActiveTab }) {
  const [logsFilter, setLogsFilter] = useState("all");

  const filterLogs = () => {
    const allLogs = sim.educationalLogger.logs;
    if (logsFilter === "all") return allLogs;
    return allLogs.filter((log) => log.category === logsFilter);
  };

  const getStats = () => {
    let herbivores = 0;
    let carnivores = 0;
    let omnivores = 0;
    let totalAge = 0;
    let totalHealth = 0;
    let aliveCount = 0;

    for (let a of sim.animals) {
      if (a.isDead) continue;
      aliveCount++;
      totalAge += a.ageYears;
      totalHealth += a.health;
      if (a.diet === "herbivore") herbivores++;
      else if (a.diet === "carnivore") carnivores++;
      else omnivores++;
    }

    return {
      herbivores,
      carnivores,
      omnivores,
      aliveCount,
      averageAge: aliveCount > 0 ? (totalAge / aliveCount).toFixed(1) : 0,
      averageHealth: aliveCount > 0 ? Math.round(totalHealth / aliveCount) : 0,
      plantsCount: sim.plants.filter(p => !p.isDead).length,
      births: sim.populationStats?.births || 0,
      deaths: sim.populationStats?.deaths || 0,
      males: sim.populationStats?.males || 0,
      females: sim.populationStats?.females || 0,
      juveniles: sim.populationStats?.juveniles || 0,
      adults: sim.populationStats?.adults || 0,
      extinctCount: sim.extinctSpecies?.length || 0,
      period: sim.timeSystem.getPeriodOfDay(),
    };
  };

  const stats = getStats();

  return (
    <div className="flex flex-col h-full bg-white text-[#EEEBE4] select-none" style={{ background: "#141414" }}>
      {/* ─── TABS HEADER ─── */}
      <div className="flex border-b border-white/5 shrink-0 bg-neutral-950/40">
        {["stats", "charts", "logs", "edu"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 font-heading text-xs font-semibold tracking-wider uppercase border-b-2 transition cursor-pointer
              ${activeTab === tab 
                ? "text-[#79AE6F] border-[#79AE6F] bg-white/2" 
                : "text-[#EEEBE4]/40 border-transparent hover:text-[#EEEBE4]/80"
              }`}
          >
            {tab === "edu" ? "💡 Edu Mode" : tab}
          </button>
        ))}
      </div>

      {/* ─── TAB CONTENT PANELS ─── */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Ecosystem & Biodiversity Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/3 border border-white/5 rounded-2xl p-3 flex flex-col relative overflow-hidden">
                  <span className="text-[10px] text-[#EEEBE4]/40 tracking-wider uppercase font-heading">
                    Ecosystem Health
                  </span>
                  {(() => {
                    const eco = sim.getEcosystemScore();
                    const scoreColor = eco.score >= 85 ? "text-green-400" : eco.score >= 60 ? "text-[#79AE6F]" : eco.score >= 30 ? "text-orange-400" : "text-red-500";
                    return (
                      <>
                        <span className={`text-lg font-bold ${scoreColor} mt-1 font-heading`}>
                          {eco.status}
                        </span>
                        <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className={`h-full rounded-full ${eco.score >= 85 ? "bg-green-400" : eco.score >= 60 ? "bg-[#79AE6F]" : eco.score >= 30 ? "bg-orange-400" : "bg-red-500"}`} style={{ width: `${eco.score}%` }} />
                        </div>
                        <span className="text-[9px] text-[#EEEBE4]/30 mt-1 font-body">Score: {eco.score}%</span>
                      </>
                    );
                  })()}
                </div>

                <div className="bg-white/3 border border-white/5 rounded-2xl p-3 flex flex-col">
                  <span className="text-[10px] text-[#EEEBE4]/40 tracking-wider uppercase font-heading">
                    Biodiversity
                  </span>
                  {(() => {
                    const bio = sim.getBiodiversityScore();
                    return (
                      <>
                        <span className="text-lg font-bold text-sky-400 mt-1 font-heading">
                          {bio.pct}%
                        </span>
                        <span className="text-[9px] text-[#EEEBE4]/30 mt-2 font-body">
                          {bio.count} active species
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/3 border border-white/5 rounded-2xl p-3 flex flex-col">
                  <span className="text-[10px] text-[#EEEBE4]/40 tracking-wider uppercase font-heading">
                    Living Animals
                  </span>
                  <span className="text-xl font-bold text-[#EEEBE4] mt-1 font-heading">
                    {stats.aliveCount}
                  </span>
                  <span className="text-[9px] text-[#EEEBE4]/30 mt-1 font-body">
                    Cap limit: {sim.maxAnimals}
                  </span>
                </div>

                <div className="bg-white/3 border border-white/5 rounded-2xl p-3 flex flex-col">
                  <span className="text-[10px] text-[#EEEBE4]/40 tracking-wider uppercase font-heading">
                    Food Plants
                  </span>
                  <span className="text-xl font-bold text-[#79AE6F] mt-1 font-heading">
                    {stats.plantsCount}
                  </span>
                  <span className="text-[9px] text-[#EEEBE4]/30 mt-1 font-body">
                    Organically multiplying
                  </span>
                </div>
              </div>

              {/* Trophic Breakdown */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                <h3 className="font-heading text-xs font-semibold text-[#EEEBE4]/80 tracking-wider uppercase">
                  Trophic Pyramids
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#E55]">🐆 Carnivores</span>
                      <span className="font-semibold">{stats.carnivores}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (stats.carnivores / (stats.aliveCount || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#ED5]">🦌 Herbivores</span>
                      <span className="font-semibold">{stats.herbivores}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${Math.min(100, (stats.herbivores / (stats.aliveCount || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#5DE]">🦊 Omnivores</span>
                      <span className="font-semibold">{stats.omnivores}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min(100, (stats.omnivores / (stats.aliveCount || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Population Demographics */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                <h3 className="font-heading text-xs font-semibold text-[#EEEBE4]/80 tracking-wider uppercase">
                  Population Tracking
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span className="text-[#EEEBE4]/50">Births</span><span className="text-green-400 font-bold">{stats.births}</span></div>
                  <div className="flex justify-between"><span className="text-[#EEEBE4]/50">Deaths</span><span className="text-red-400 font-bold">{stats.deaths}</span></div>
                  <div className="flex justify-between"><span className="text-[#EEEBE4]/50">♂ Males</span><span className="font-bold">{stats.males}</span></div>
                  <div className="flex justify-between"><span className="text-[#EEEBE4]/50">♀ Females</span><span className="font-bold">{stats.females}</span></div>
                  <div className="flex justify-between"><span className="text-[#EEEBE4]/50">Juveniles</span><span className="font-bold">{stats.juveniles}</span></div>
                  <div className="flex justify-between"><span className="text-[#EEEBE4]/50">Adults</span><span className="font-bold">{stats.adults}</span></div>
                </div>
                {stats.extinctCount > 0 && (
                  <div className="text-[10px] text-red-400/80 border-t border-white/5 pt-2">
                    ⚠ Extinct species: {sim.extinctSpecies.join(", ")}
                  </div>
                )}
                <div className="text-[10px] text-[#EEEBE4]/40 border-t border-white/5 pt-2">
                  Period: <strong className="text-[#EEEBE4]/70">{stats.period}</strong> • 
                  Carrying cap: {sim.carryingCapacity?.herbivores} herbivores, {sim.carryingCapacity?.predators} predators
                </div>
              </div>

              {/* Health and Lifespan stats */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#EEEBE4]/40 font-heading tracking-wider uppercase">
                    Average Health
                  </span>
                  <span className="text-lg font-bold text-[#EEEBE4] mt-1 font-heading">
                    {stats.averageHealth}%
                  </span>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stats.averageHealth > 70 ? "bg-green-500" : stats.averageHealth > 40 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${stats.averageHealth}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-[#EEEBE4]/40 font-heading tracking-wider uppercase">
                    Average Age
                  </span>
                  <span className="text-lg font-bold text-[#EEEBE4] mt-1 font-heading">
                    {stats.averageAge} yrs
                  </span>
                  <span className="text-[9px] text-[#EEEBE4]/30 mt-2 font-body">
                    Relative to max lifespan
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "charts" && (
            <motion.div
              key="charts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Populations Chart */}
              <SVGChart
                data={sim.statsHistory}
                keys={["herbivores", "carnivores"]}
                colors={["#EBC75A", "#E35B5B"]}
                labels={["Herbivores", "Carnivores"]}
                title="Animal Populations"
              />

              {/* Food Chain Chart */}
              <SVGChart
                data={sim.statsHistory}
                keys={["plantsCount", "herbivores"]}
                colors={["#5E9E56", "#EBC75A"]}
                labels={["Plants", "Herbivores"]}
                title="Plant vs Herbivore Food Balance"
              />

              {/* Climate and weather log chart */}
              <SVGChart
                data={sim.statsHistory}
                keys={["temperature"]}
                colors={["#D96E43"]}
                labels={["Temp (°C)"]}
                title="Temperature Trend"
              />
            </motion.div>
          )}

          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3 h-full flex flex-col"
            >
              {/* Filters */}
              <div className="flex gap-1.5 shrink-0 bg-neutral-900 border border-white/5 rounded-full p-1 self-start">
                {["all", "predation", "reproduction", "extinction", "weather"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setLogsFilter(f)}
                    className={`text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold cursor-pointer
                      ${logsFilter === f 
                        ? "bg-[#79AE6F]/20 text-[#79AE6F] border border-[#79AE6F]/30" 
                        : "text-[#EEEBE4]/40 border border-transparent hover:text-[#EEEBE4]/85"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Event Logs list */}
              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {filterLogs().length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#EEEBE4]/30">
                    No logged events match the filter yet.
                  </div>
                ) : (
                  filterLogs().map((log, idx) => (
                    <div
                      key={idx}
                      className="bg-white/2 border border-white/5 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-[#EEEBE4]/75 leading-relaxed"
                    >
                      <span className="font-heading text-[10px] font-bold text-[#79AE6F]/80 shrink-0 select-none">
                        [{log.timeString}]
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "edu" && (
            <motion.div
              key="edu"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex flex-col gap-1.5">
                <h4 className="font-heading text-xs font-bold text-green-400 tracking-wider uppercase">
                  Educational Mode Active
                </h4>
                <p className="text-xs text-[#EEEBE4]/70 leading-relaxed font-body">
                  Students can observe real-time ecological balance adjustments. When ecosystems experience stresses (e.g. overgrazing, population crashes, extreme weather), descriptive explanations will appear below.
                </p>
              </div>

              <div className="space-y-3 mt-4">
                <h3 className="font-heading text-xs font-semibold text-[#EEEBE4]/50 uppercase tracking-wider px-1">
                  Active Ecological Dynamics
                </h3>

                {sim.educationalLogger.explanations.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#EEEBE4]/30 bg-white/2 border border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 gap-2">
                    <span>🌿 Stable Balance</span>
                    <span className="text-[10px] max-w-[200px] leading-relaxed">
                      Ecosystem resources are currently stable. Place more animals to generate food web pressures!
                    </span>
                  </div>
                ) : (
                  sim.educationalLogger.explanations.map((exp) => (
                    <div
                      key={exp.id}
                      className={`border rounded-2xl p-4 space-y-2 flex flex-col relative overflow-hidden
                        ${exp.priority === "high" 
                          ? "bg-red-500/5 border-red-500/15" 
                          : "bg-amber-500/5 border-amber-500/15"
                        }`}
                    >
                      {/* Priority tag */}
                      <span
                        className={`text-[8px] font-heading font-semibold uppercase tracking-wider px-2 py-0.5 rounded border self-start
                          ${exp.priority === "high" 
                            ? "text-red-400 border-red-500/20 bg-red-500/10" 
                            : "text-amber-400 border-amber-500/20 bg-amber-500/10"
                          }`}
                      >
                        {exp.priority} risk
                      </span>

                      <h4 className="font-heading text-sm font-bold text-[#EEEBE4]/95">
                        {exp.title}
                      </h4>
                      <p className="text-xs text-[#EEEBE4]/65 leading-relaxed font-body">
                        {exp.desc}
                      </p>
                      
                      <button
                        onClick={() => sim.educationalLogger.dismissExplanation(exp.id)}
                        className="absolute top-2 right-2 text-white/30 hover:text-white/70 text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-lg cursor-pointer transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
