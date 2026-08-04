import React, { useRef, useEffect, useState } from "react";

import {
  FLOWER_VARIANTS, BUSH_VARIANTS, TREES_VARIANTS, ROCK_VARIANTS,
  CORAL_VARIANTS, REEF_ROCK_VARIANTS,
  CAVE_IMG, GRASS_IMG, MOUNTAIN_IMG, POND_IMG, KELP_IMG, SEAWEED_IMG,
  TERRAIN_SIZE
} from './terrainAssets';
import { SimplexNoise } from './SimulationEngine';

export default function SimulationCanvas({
  sim,
  selectedAnimal,
  setSelectedAnimal,
  selectedTool,
  onPlaceObject,
  trackedAnimal,
  setTrackedAnimal,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const hasDraggedRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const imageCache = useRef({});

  // Handle visibility catch-up for offline/AFK simulation
  useEffect(() => {
    let lastTime = Date.now();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const elapsed = (Date.now() - lastTime) / 1000;
        if (elapsed > 3 && sim && !sim.isPaused) {
          sim.catchUp(elapsed);
        }
        lastTime = Date.now();
      } else {
        lastTime = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        lastTime = Date.now();
      }
    }, 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [sim]);

  // Procedural Terrain Generator Cache
  const bgCanvasRef = useRef(null);
  
  useEffect(() => {
    if (!sim || sim.ecosystemType !== "forest") return;
    
    // Generate organic noise map for grass/soil once per simulation instance
    if (!bgCanvasRef.current || bgCanvasRef.current.width !== sim.width) {
      const off = document.createElement("canvas");
      // Use half resolution for generation speed, it's organic so stretching it looks fine
      const scale = 0.5;
      off.width = sim.width * scale;
      off.height = sim.height * scale;
      const offCtx = off.getContext("2d");
      
      const simplex = new SimplexNoise();
      const imgData = offCtx.createImageData(off.width, off.height);
      const data = imgData.data;

      // Grass palette: #4F9A3B, #5FAE47, #6CBF4A, #79C95A, #83D16A
      const grassColors = [
        [79, 154, 59],
        [95, 174, 71],
        [108, 191, 74],
        [121, 201, 90],
        [131, 209, 106]
      ];
      // Soil palette
      const soilColors = [
        [60, 45, 30],  // dark brown
        [90, 77, 59],  // medium brown
        [105, 75, 55], // reddish brown
        [120, 105, 80], // tan
        [80, 80, 75]   // greyish
      ];

      // Define river distance function
      const getDistToRiver = (x, y) => {
        if (!sim.worldMap.riverPoints) return Infinity;
        let minDist = Infinity;
        for (let pt of sim.worldMap.riverPoints) {
          const d = Math.hypot(pt.x - x, pt.y - y);
          if (d < minDist) minDist = d;
        }
        return minDist;
      };
      
      for (let y = 0; y < off.height; y++) {
        for (let x = 0; x < off.width; x++) {
          const wx = x / scale;
          const wy = y / scale;
          
          // Layered grass noise
          const n1 = simplex.noise2D(wx * 0.003, wy * 0.003) * 0.5 + 0.5;
          const n2 = simplex.noise2D(wx * 0.015, wy * 0.015) * 0.5 + 0.5;
          const grassVal = n1 * 0.7 + n2 * 0.3;
          
          let colorIdx = Math.floor(grassVal * grassColors.length);
          if (colorIdx >= grassColors.length) colorIdx = grassColors.length - 1;
          if (colorIdx < 0) colorIdx = 0;
          
          let r = grassColors[colorIdx][0];
          let g = grassColors[colorIdx][1];
          let b = grassColors[colorIdx][2];

          // River mud and reeds
          const distToRiver = getDistToRiver(wx, wy);
          if (distToRiver < 80) {
            const mudBlend = Math.max(0, 1 - (distToRiver / 80));
            // Dark damp mud
            r = r * (1 - mudBlend) + 60 * mudBlend;
            g = g * (1 - mudBlend) + 74 * mudBlend;
            b = b * (1 - mudBlend) + 42 * mudBlend;
            
            // Reeds scatter
            if (distToRiver > 30 && simplex.noise2D(wx * 0.1, wy * 0.1) > 0.8) {
               r = 100; g = 140; b = 60;
            }
          }

          // Layered soil patches noise
          const s1 = simplex.noise2D(wx * 0.002 + 1000, wy * 0.002 + 1000);
          if (s1 > 0.35) {
            const blend = Math.min((s1 - 0.35) * 8, 1.0); // smooth blending
            
            // Soil color variation
            const soilNoise = simplex.noise2D(wx * 0.008 + 500, wy * 0.008 + 500) * 0.5 + 0.5;
            let sIdx = Math.floor(soilNoise * soilColors.length);
            if (sIdx >= soilColors.length) sIdx = soilColors.length - 1;
            let sr = soilColors[sIdx][0];
            let sg = soilColors[sIdx][1];
            let sb = soilColors[sIdx][2];

            // Shading
            const shadeNoise = simplex.noise2D(wx * 0.008 + 501, wy * 0.008 + 501);
            const shade = 1.0 + shadeNoise * 0.15;
            sr *= shade; sg *= shade; sb *= shade;

            // Details: pebbles, twigs
            const detailNoise = simplex.noise2D(wx * 0.1, wy * 0.1);
            if (detailNoise > 0.85) {
               sr = 120; sg = 120; sb = 120; // Pebble
            } else if (detailNoise < -0.85) {
               sr = 40; sg = 30; sb = 20; // Twig
            } else if (detailNoise > 0.75 && detailNoise <= 0.85) {
               sr = 160; sg = 140; sb = 90; // Dry leaf
            }

            r = r * (1 - blend) + sr * blend;
            g = g * (1 - blend) + sg * blend;
            b = b * (1 - blend) + sb * blend;
          }

          const idx = (y * off.width + x) * 4;
          data[idx] = r;
          data[idx+1] = g;
          data[idx+2] = b;
          data[idx+3] = 255;
        }
      }
      offCtx.putImageData(imgData, 0, 0);
      bgCanvasRef.current = off;
    }
  }, [sim]);

  // Handle auto-focus tracking when trackedAnimal changes or moves
  useEffect(() => {
    if (trackedAnimal && canvasRef.current) {
      const canvas = canvasRef.current;
      // Center the camera on the tracked animal
      setPan({
        x: canvas.width / 2 - trackedAnimal.x * zoom,
        y: canvas.height / 2 - trackedAnimal.y * zoom,
      });
    }
  }, [trackedAnimal, zoom]);

  // Main Canvas Render Loop
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawAsset = (ctx, imgSrc, x, y, width, height, doFade = false) => {
      if (!imgSrc) return false;
      
      const cacheKey = doFade ? `${imgSrc}_${Math.round(width)}_${Math.round(height)}_faded` : imgSrc;
      let img = imageCache.current[cacheKey];
      
      if (!img) {
        if (doFade) {
          const baseImg = imageCache.current[imgSrc] || new Image();
          if (!baseImg.src) {
            baseImg.src = imgSrc;
            imageCache.current[imgSrc] = baseImg;
          }
          if (baseImg.complete && baseImg.naturalWidth > 0) {
            const off = document.createElement("canvas");
            off.width = width; off.height = height;
            const octx = off.getContext("2d");
            octx.drawImage(baseImg, 0, 0, width, height);
            octx.globalCompositeOperation = "destination-out";
            const grad = octx.createLinearGradient(0, height * 0.75, 0, height);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, "rgba(0,0,0,1)");
            octx.fillStyle = grad;
            octx.fillRect(0, height * 0.75, width, height);
            imageCache.current[cacheKey] = off;
            img = off;
          }
        } else {
          img = new Image();
          img.src = imgSrc;
          imageCache.current[imgSrc] = img;
        }
      }

      if (img && (img.complete || img instanceof HTMLCanvasElement)) {
        ctx.drawImage(img, x - width/2, y - height/2, width, height);
        return true;
      }
      return false;
    };

    const render = () => {
      // If tracking, continuously update pan position
      if (trackedAnimal) {
        setPan((prevPan) => ({
          x: canvas.width / 2 - trackedAnimal.x * zoom,
          y: canvas.height / 2 - trackedAnimal.y * zoom,
        }));
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply Camera transformations
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // ─── 1. DRAW PROCEDURAL BACKGROUND ───
      if (sim.ecosystemType === "forest") {
        if (bgCanvasRef.current) {
          ctx.drawImage(bgCanvasRef.current, 0, 0, sim.width, sim.height);
        } else {
          ctx.fillStyle = "#6E9146";
          ctx.fillRect(0, 0, sim.width, sim.height);
        }

        // Draw Ponds with rotation
        for (let wb of sim.worldMap.waterBodies) {
          if (!wb.isRiver) {
            const sizeMult = wb.sizeVariation || 1;
            const w = TERRAIN_SIZE.pond.w * sizeMult;
            const h = TERRAIN_SIZE.pond.h * sizeMult;
            
            ctx.save();
            ctx.translate(wb.x, wb.y);
            ctx.rotate(wb.rotation || 0);
            drawAsset(ctx, POND_IMG, 0, 0, w, h, true);
            ctx.restore();
          }
        }
      } else { // Ocean
        const splitX = sim.worldMap.reefSplitX || 0;
        const grad = ctx.createLinearGradient(0, 0, splitX + 80, 0);
        grad.addColorStop(0, "#C7B183");
        grad.addColorStop(0.7, "#81AB95");
        grad.addColorStop(1.0, "#22567A");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, splitX + 120, sim.height);
        
        ctx.fillStyle = "#22567A";
        ctx.fillRect(splitX + 120, 0, sim.width - (splitX + 120), sim.height);
      }

      // Draw Grid overlay
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      const gSize = 100;
      for (let x = 0; x < sim.width; x += gSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, sim.height); ctx.stroke();
      }
      for (let y = 0; y < sim.height; y += gSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(sim.width, y); ctx.stroke();
      }

      // ─── 2. Z-SORTED RENDERABLES (Plants, Obstacles, Shelters, Mountains) ───
      const renderables = [];

      if (sim.ecosystemType === "forest") {
        if (sim.worldMap.mountains) {
          for (let m of sim.worldMap.mountains) renderables.push({ type: "mountain", item: m });
        }
        for (let obs of sim.worldMap.obstacles) renderables.push({ type: "obstacle", item: obs });
        for (let sh of sim.worldMap.shelters) renderables.push({ type: "shelter", item: sh });
      } else {
        for (let obs of sim.worldMap.obstacles) renderables.push({ type: "reefRock", item: obs });
      }

      for (let p of sim.plants) {
        if (!p.isDead) renderables.push({ type: "plant", item: p });
      }

      // Sort by Y for correct depth (painters algorithm)
      renderables.sort((a, b) => a.item.y - b.item.y);

      for (let renderObj of renderables) {
        const { type, item } = renderObj;

        if (type === "mountain") {
          const w = TERRAIN_SIZE.mountain.w * (item.sizeVariation || 1);
          const h = TERRAIN_SIZE.mountain.h * (item.sizeVariation || 1);
          drawAsset(ctx, MOUNTAIN_IMG, item.x, item.y, w, h, true);
        }
        else if (type === "obstacle") {
          const varIndex = (item.variantIndex || 0) % ROCK_VARIANTS.length;
          const imgSrc = ROCK_VARIANTS[varIndex];
          const w = TERRAIN_SIZE.rock.w * (item.sizeVariation || 1);
          const h = TERRAIN_SIZE.rock.h * (item.sizeVariation || 1);
          
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rotation || 0);
          drawAsset(ctx, imgSrc, 0, 0, w, h, true);
          ctx.restore();
        } 
        else if (type === "shelter") {
          const w = TERRAIN_SIZE.cave.w * (item.sizeVariation || 1);
          const h = TERRAIN_SIZE.cave.h * (item.sizeVariation || 1);
          
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rotation || 0);
          drawAsset(ctx, CAVE_IMG, 0, 0, w, h, true);
          ctx.restore();
        }
        else if (type === "reefRock") {
          const varIndex = (item.variantIndex || 0) % REEF_ROCK_VARIANTS.length;
          const imgSrc = REEF_ROCK_VARIANTS[varIndex];
          const w = TERRAIN_SIZE.reefRock.w * (item.sizeVariation || 1);
          const h = TERRAIN_SIZE.reefRock.h * (item.sizeVariation || 1);
          drawAsset(ctx, imgSrc, item.x, item.y, w, h, true);
        }
        else if (type === "plant") {
          const p = item;
          ctx.save();
          ctx.translate(p.x, p.y);
          
          const rot = ((p.id * 100) % 10) / 10 * 0.4 - 0.2;
          ctx.rotate(rot);

          let imgSrc = null;
          let baseW = 20, baseH = 20;
          let doFade = false;
          
          if (sim.ecosystemType === "forest") {
            if (p.type === "trees" || p.type === "tree") {
              imgSrc = TREES_VARIANTS[(p.variantIndex || 0) % TREES_VARIANTS.length];
              baseW = TERRAIN_SIZE.trees.w; baseH = TERRAIN_SIZE.trees.h;
              doFade = true;
            } else if (p.type === "bush") {
              imgSrc = BUSH_VARIANTS[(p.variantIndex || 0) % BUSH_VARIANTS.length];
              baseW = TERRAIN_SIZE.bush.w; baseH = TERRAIN_SIZE.bush.h;
            } else if (p.type === "flower") {
              imgSrc = FLOWER_VARIANTS[(p.variantIndex || 0) % FLOWER_VARIANTS.length];
              baseW = TERRAIN_SIZE.flower.w; baseH = TERRAIN_SIZE.flower.h;
            } else if (p.type === "grass") {
              imgSrc = BUSH_VARIANTS[(p.variantIndex || 0) % BUSH_VARIANTS.length];
              baseW = 20; baseH = 20;
            }
          } else {
            if (p.type === "kelp") {
              imgSrc = KELP_IMG;
              baseW = TERRAIN_SIZE.kelp.w; baseH = TERRAIN_SIZE.kelp.h;
              doFade = true;
            } else if (p.type === "coral") {
              imgSrc = CORAL_VARIANTS[(p.variantIndex || 0) % CORAL_VARIANTS.length];
              baseW = TERRAIN_SIZE.coral.w; baseH = TERRAIN_SIZE.coral.h;
              doFade = true;
            } else {
              imgSrc = SEAWEED_IMG;
              baseW = TERRAIN_SIZE.seaweed.w; baseH = TERRAIN_SIZE.seaweed.h;
            }
          }
          
          const sizeMod = (p.sizeVariation || 1) * Math.max(0.2, p.growth);
          const w = baseW * sizeMod;
          const h = baseH * sizeMod;

          ctx.shadowColor = "rgba(0,0,0,0.3)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 4;
          
          const success = drawAsset(ctx, imgSrc, 0, 0, w, h, doFade);
          ctx.shadowColor = "transparent";

          if (!success) {
            let emoji = "🌱";
            if (sim.ecosystemType === "forest") {
              if (p.type === "trees" || p.type === "tree") emoji = "🌳";
              else if (p.type === "bush") emoji = "🌿";
              else if (p.type === "flower") emoji = "🌸";
            } else {
              if (p.type === "kelp" || p.type === "coral") emoji = "🪸";
            }
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            ctx.font = `${w}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(emoji, 2, 2);
            ctx.fillText(emoji, 0, 0);
          }
          ctx.restore();
        }
      }

      // ─── 2b. CHASE LINES (predator → prey) ───
      ctx.setLineDash([]);
      for (let a of sim.animals) {
        if (a.isDead) continue;
        if (a.activity === "Hunt" && a.chaseTarget && !a.chaseTarget.isDead) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.chaseTarget.x, a.chaseTarget.y);
          ctx.strokeStyle = "rgba(240, 90, 50, 0.55)";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (a.activity === "Flee" && a.beingHuntedBy && !a.beingHuntedBy.isDead) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.beingHuntedBy.x, a.beingHuntedBy.y);
          ctx.strokeStyle = "rgba(230, 60, 60, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Herbivore walking to plant
        if ((a.activity === "SeekFood" || a.activity === "Eat" || a.eatTimer > 0) && a.targetEntity?.type) {
          const plantTypes = ["tree", "bush", "flower", "grass", "kelp", "seagrass", "coral"];
          if (plantTypes.includes(a.targetEntity.type) && !a.targetEntity.isDead) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(a.targetEntity.x, a.targetEntity.y);
            ctx.strokeStyle = "rgba(121, 174, 111, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      // Highlight plants being eaten
      for (let a of sim.animals) {
        if (!a.isDead && (a.activity === "Eat" || a.eatTimer > 0) && a.targetEntity?.type) {
          const p = a.targetEntity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(121, 174, 111, 0.7)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // ─── 3. DRAW ANIMALS / CARCASSES ───
      for (let a of sim.animals) {
        ctx.save();
        ctx.translate(a.x, a.y);

        // Highlight selection halo
        if (selectedAnimal && selectedAnimal.id === a.id) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.stroke();
          
          // Dash pattern animation
          ctx.strokeStyle = "rgba(122, 170, 206, 0.4)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Activity indicators — hunt / flee / eat / hungry
        if (!a.isDead) {
          if (a.activity === "Flee" || a.beingHuntedBy) {
            ctx.strokeStyle = "rgba(230, 60, 60, 0.85)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#E65050";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("!", 0, -22);
          } else if (a.activity === "Hunt") {
            ctx.strokeStyle = "rgba(240, 120, 30, 0.85)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#F08020";
            ctx.font = "9px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("HUNT", 0, -22);
          } else if (a.activity === "Eat" || a.eatTimer > 0) {
            ctx.strokeStyle = "rgba(121, 174, 111, 0.85)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#79AE6F";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(a.diet === "herbivore" ? "🌿" : "🍖", 0, -22);
          } else if (a.activity === "SeekFood" && a.hunger < 55) {
            ctx.strokeStyle = "rgba(240, 180, 50, 0.5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 17, 0, Math.PI * 2);
            ctx.stroke();
          } else if (a.pregnant) {
            ctx.strokeStyle = "rgba(230, 100, 200, 0.5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        const speciesDef = sim.animalDefinitions ? sim.animalDefinitions[a.speciesId] : null;
        let baseRadius = 14;
        if (speciesDef && speciesDef.ecosystemPoints) {
            // Scale dynamically from points: e.g. 5 pts -> ~11.6px radius, 50 pts -> 26px radius
            baseRadius = 10 + (speciesDef.ecosystemPoints / 50) * 16;
        }

        // Border and shadow color based on diet
        let borderColor = "rgba(255, 255, 255, 0.12)";
        let shadowColor = "rgba(0, 0, 0, 0.3)";
        if (!a.isDead) {
          if (a.diet === "carnivore") { borderColor = "rgba(230, 80, 80, 0.75)"; shadowColor = "rgba(230, 80, 80, 0.35)"; }
          else if (a.diet === "herbivore") { borderColor = "rgba(121, 174, 111, 0.75)"; shadowColor = "rgba(121, 174, 111, 0.35)"; }
          else { borderColor = "rgba(122, 170, 206, 0.75)"; shadowColor = "rgba(122, 170, 206, 0.35)"; }
        }

        // Drop shadow for the ring
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Draw glowing colored backdrop ring
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius + 2, 0, Math.PI * 2);
        ctx.fillStyle = a.isDead ? "rgba(35, 10, 10, 0.65)" : "rgba(20, 20, 20, 0.85)";
        ctx.fill();
        
        ctx.shadowColor = "transparent"; // reset shadow
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        let imgLoaded = false;
        if (speciesDef) {
            const imageUrl = speciesDef.image || (speciesDef.images && speciesDef.images[0]);
            if (imageUrl) {
              let cachedImg = imageCache.current[imageUrl];
              if (!cachedImg) {
                cachedImg = new Image();
                cachedImg.src = imageUrl;
                cachedImg.onload = () => {};
                imageCache.current[imageUrl] = cachedImg;
              }
              if (cachedImg.complete && cachedImg.naturalWidth > 0) {
                imgLoaded = true;
                
                // Direction orientation
                const angle = Math.atan2(a.vy, a.vx);
                const facingLeft = angle > Math.PI / 2 || angle < -Math.PI / 2;
                
                ctx.save();
                if (facingLeft && !a.isDead) ctx.scale(-1, 1);
                
                // Circular clip for image
                ctx.beginPath();
                ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
                ctx.clip();

                if (a.isDead) ctx.globalAlpha = 0.5; // faint image if dead
                
                // Draw image
                ctx.drawImage(cachedImg, -baseRadius, -baseRadius, baseRadius * 2, baseRadius * 2);
                ctx.restore();
              }
            }
        }

        if (!imgLoaded) {
           // Draw fallback circle with first letter
           ctx.font = `bold ${Math.max(10, baseRadius * 0.9)}px sans-serif`;
           ctx.textAlign = "center";
           ctx.textBaseline = "middle";
           ctx.fillStyle = "#FFF";
           const letter = speciesDef && speciesDef.name ? speciesDef.name.charAt(0).toUpperCase() : "?";
           ctx.fillText(a.isDead ? "☠" : letter, 0, 1);
        }

        // Gender marker indicator (small dot in top right of card)
        if (!a.isDead) {
          ctx.fillStyle = a.gender === "Male" ? "#5EA3E3" : "#E35EB8";
          ctx.beginPath();
          ctx.arc(baseRadius * 0.7, -baseRadius * 0.7, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(20, 20, 20, 0.8)";
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        // Sleep indicator text Zzz
        if (a.activity === "Sleep" && !a.isDead) {
          ctx.fillStyle = "#AEE";
          ctx.font = "8px 'Outfit', sans-serif";
          ctx.fillText("Zzz", baseRadius * 0.7, -baseRadius - 2);
        }

        // Hunger bar (visible when getting hungry)
        if (!a.isDead && a.hunger < 60) {
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.fillRect(-14, -baseRadius - 8, 28, 3);
          const hungerPct = Math.max(0, a.hunger / 100);
          ctx.fillStyle = hungerPct > 0.35 ? "#F0A032" : "#E65050";
          ctx.fillRect(-14, -baseRadius - 8, 28 * hungerPct, 3);
        }

        // Modern health bar at bottom of card
        if (!a.isDead && a.health < 100) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(-14, baseRadius + 4, 28, 3.5);
          
          const healthPct = Math.max(0, a.health / 100);
          ctx.fillStyle = healthPct > 0.5 ? "#79AE6F" : healthPct > 0.25 ? "#F0A032" : "#E65050";
          ctx.fillRect(-14, baseRadius + 4, 28 * healthPct, 3.5);
        }

        // Pregnancy progress bar at top of card
        if (!a.isDead && a.pregnant) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(-14, -baseRadius - 12, 28, 3.5);
          
          const pregPct = Math.max(0, a.gestationTimer / a.gestationPeriod);
          ctx.fillStyle = "#E35EB8"; // Hot pink
          ctx.fillRect(-14, -baseRadius - 12, 28 * pregPct, 3.5);
        }

        ctx.restore();
      }

      // ─── 4. TIME OF DAY LIGHTING & EVENT OVERLAYS ───
      const alpha = sim.timeSystem.getLightingAlpha();
      if (alpha > 0) {
        ctx.fillStyle = sim.timeSystem.getLightingColor();
        ctx.globalAlpha = alpha;
        ctx.fillRect(0, 0, sim.width, sim.height);
        ctx.globalAlpha = 1.0; // reset
      }

      // Draw random event environmental screen filters
      if (sim.currentEvent) {
        ctx.save();
        if (sim.currentEvent === "forest_fire") {
          ctx.fillStyle = "rgba(255, 60, 0, 0.12)";
          ctx.fillRect(0, 0, sim.width, sim.height);
        } else if (sim.currentEvent === "drought") {
          ctx.fillStyle = "rgba(255, 200, 0, 0.07)";
          ctx.fillRect(0, 0, sim.width, sim.height);
        } else if (sim.currentEvent === "oil_spill") {
          ctx.fillStyle = "rgba(50, 25, 10, 0.22)";
          ctx.fillRect(0, 0, sim.width, sim.height);
        } else if (sim.currentEvent === "plastic_pollution") {
          ctx.fillStyle = "rgba(100, 110, 120, 0.08)";
          ctx.fillRect(0, 0, sim.width, sim.height);
        } else if (sim.currentEvent === "heavy_rain" || sim.currentEvent === "storm_surge") {
          ctx.fillStyle = "rgba(0, 30, 80, 0.07)";
          ctx.fillRect(0, 0, sim.width, sim.height);
          
          // Draw simple rain streaks
          ctx.strokeStyle = "rgba(174, 219, 255, 0.35)";
          ctx.lineWidth = 1.0;
          for (let i = 0; i < 25; i++) {
            const rx = Math.random() * sim.width;
            const ry = Math.random() * sim.height;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 2.5, ry + 12);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      ctx.restore(); // Restore camera transformation

      // ─── 5. DRAW HUD CAMERA BOX ON SCREEN ───
      // (Optional HUD overlay drawing done here directly on screen space)

      // ─── 6. DRAW FLOATING MINI-MAP ───
      drawMinimap(ctx, canvas);

      animationFrameId = requestAnimationFrame(render);
    };

    const drawMinimap = (cCtx, c) => {
      // Draw in bottom right corner
      const mSize = 130;
      const mx = c.width - mSize - 20;
      const my = c.height - mSize - 20;

      cCtx.fillStyle = "rgba(10, 10, 10, 0.75)";
      cCtx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      cCtx.lineWidth = 1.5;
      cCtx.beginPath();
      cCtx.roundRect(mx, my, mSize, mSize, 12);
      cCtx.fill();
      cCtx.stroke();

      const scaleX = mSize / sim.width;
      const scaleY = mSize / sim.height;

      // Draw rivers/water bodies
      cCtx.fillStyle = "#365E8F";
      for (let wb of sim.worldMap.waterBodies) {
        cCtx.beginPath();
        cCtx.arc(mx + wb.x * scaleX, my + wb.y * scaleY, Math.max(1.5, wb.radius * scaleX), 0, Math.PI * 2);
        cCtx.fill();
      }

      // Draw plants (green dots)
      cCtx.fillStyle = "#5E9E56";
      for (let p of sim.plants) {
        cCtx.fillRect(mx + p.x * scaleX, my + p.y * scaleY, 1.5, 1.5);
      }

      // Draw animals
      for (let a of sim.animals) {
        if (a.isDead) continue;
        cCtx.fillStyle = a.diet === "carnivore" ? "#E35B5B" : "#EBC75A"; // Carnivore = red, Herbivore = yellow
        cCtx.beginPath();
        cCtx.arc(mx + a.x * scaleX, my + a.y * scaleY, 2, 0, Math.PI * 2);
        cCtx.fill();
      }

      // Draw camera viewport box
      const viewW = c.width / zoom;
      const viewH = c.height / zoom;
      const viewX = -pan.x / zoom;
      const viewY = -pan.y / zoom;

      cCtx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      cCtx.lineWidth = 1.0;
      cCtx.strokeRect(
        mx + Math.max(0, viewX * scaleX),
        my + Math.max(0, viewY * scaleY),
        Math.min(mSize, viewW * scaleX),
        Math.min(mSize, viewH * scaleY)
      );
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [sim, pan, zoom, selectedAnimal, trackedAnimal]);

  // Click & Selection Handlers
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      hasDraggedRef.current = false;
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && !trackedAnimal) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      if (Math.hypot(dx, dy) > 4) {
        hasDraggedRef.current = true;
      }
      
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;
      
      // Clamp panning bounds so the map doesn't get completely lost
      const canvas = canvasRef.current;
      if (canvas && sim) {
        // Allow panning until 80% of the canvas is empty, but keep 20% of the map visible
        const maxPanX = canvas.width * 0.8;
        const minPanX = -sim.width * zoom + canvas.width * 0.2;
        const maxPanY = canvas.height * 0.8;
        const minPanY = -sim.height * zoom + canvas.height * 0.2;
        
        newX = Math.max(minPanX, Math.min(newX, maxPanX));
        newY = Math.max(minPanY, Math.min(newY, maxPanY));
        
        // Adjust dragStart so it doesn't rubber-band if the user dragged way past the clamp
        if (newX !== e.clientX - dragStart.x || newY !== e.clientY - dragStart.y) {
          setDragStart({ x: e.clientX - newX, y: e.clientY - newY });
        }
      }

      setPan({
        x: newX,
        y: newY,
      });
    }
  };

  const handleMouseUp = (e) => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) {
      return; // Require Ctrl/Cmd to zoom, allowing normal scrolling to pass through
    }
    e.preventDefault();
    const zoomFactor = 1.1;
    let newZoom = zoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(3.0, zoom * zoomFactor);
    } else {
      newZoom = Math.max(0.5, zoom / zoomFactor);
    }

    // Zoom centered on mouse pointer coordinates
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    setZoom(newZoom);
    if (!trackedAnimal) {
      setPan({
        x: mouseX - worldX * newZoom,
        y: mouseY - worldY * newZoom,
      });
    }
  };

  const handleClick = (e) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert screen click coordinates to world coordinates
    const worldX = (clickX - pan.x) / zoom;
    const worldY = (clickY - pan.y) / zoom;

    if (selectedTool) {
      // Place animal or terrain
      if (onPlaceObject) {
        onPlaceObject(selectedTool, worldX, worldY);
      }
      return;
    }

    // Attempt animal selection click check
    let clickedAnimal = null;
    let minDist = 18; // selection tolerance radius in world coordinates
    for (let a of sim.animals) {
      const dx = a.x - worldX;
      const dy = a.y - worldY;
      const d = Math.hypot(dx, dy);
      if (d < minDist) {
        minDist = d;
        clickedAnimal = a;
      }
    }

    if (clickedAnimal) {
      setSelectedAnimal(clickedAnimal);
      setTrackedAnimal(clickedAnimal); // Lock-on track animal automatically on selection
    } else {
      setSelectedAnimal(null);
      setTrackedAnimal(null); // Release focus
    }
  };

  const generateSmoothPath = (points) => {
    if (!points || points.length === 0) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i !== points.length - 2 ? points[i + 2] : p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden bg-[#0c0c0c]"
    >
      {/* Animated River / Ocean SVG Background */}
      {sim && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            transformOrigin: "0 0"
          }}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {sim.ecosystemType === "forest" && sim.worldMap?.riverPoints && (
              <>
                <style>
                  {`
                    @keyframes riverFlow {
                      from { stroke-dashoffset: 60; }
                      to { stroke-dashoffset: 0; }
                    }
                    .river-wave {
                      animation: riverFlow 2s linear infinite;
                    }
                    @keyframes rippleAnim {
                      0% { r: 6px; opacity: 1; stroke-width: 2px; }
                      100% { r: 24px; opacity: 0; stroke-width: 1px; }
                    }
                    .ripple-anim {
                      animation: rippleAnim 2.5s ease-out infinite;
                    }
                  `}
                </style>
                <defs>
                  <filter id="riverTurbulence" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <filter id="shorelineBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.7" />
                    </feComponentTransfer>
                  </filter>
                  <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2D6392" />
                    <stop offset="100%" stopColor="#4BB6D1" />
                  </linearGradient>
                  <linearGradient id="riverDeep" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1B466B" />
                    <stop offset="100%" stopColor="#267891" />
                  </linearGradient>
                </defs>
                <g filter="url(#riverTurbulence)">
                  {/* Shoreline blend */}
                  <path
                    d={generateSmoothPath(sim.worldMap.riverPoints)}
                    fill="none"
                    stroke="#163852"
                    strokeWidth="60"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#shorelineBlur)"
                  />
                  {/* Base shallow river */}
                  <path
                    d={generateSmoothPath(sim.worldMap.riverPoints)}
                    fill="none"
                    stroke="url(#riverGrad)"
                    strokeWidth="48"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Deep center channel */}
                  <path
                    d={generateSmoothPath(sim.worldMap.riverPoints)}
                    fill="none"
                    stroke="url(#riverDeep)"
                    strokeWidth="28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* River wave animation */}
                  <path
                    d={generateSmoothPath(sim.worldMap.riverPoints)}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="20 60"
                    className="river-wave"
                  />
                </g>
                
                {/* Submerged Rocks and Circular Ripples */}
                {sim.worldMap.riverPoints.map((p, i) => {
                  if (i % 5 === 0 && i !== 0 && i !== sim.worldMap.riverPoints.length - 1) {
                    // pseudo-random deterministic rock placement
                    const isRock = (Math.sin(p.x * 12.34) * 1000) % 10 > 5;
                    if (isRock) {
                      return (
                        <g key={`rock-${i}`} transform={`translate(${p.x}, ${p.y})`}>
                          <circle r="7" fill="#3B484D" opacity="0.8" />
                          <circle r="5" fill="#52636B" opacity="0.9" cx="-1" cy="-1" />
                          <circle r="6" fill="none" stroke="rgba(255,255,255,0.6)" className="ripple-anim" />
                        </g>
                      );
                    }
                  }
                  return null;
                })}
              </>
            )}
            {sim.ecosystemType === "ocean" && (
              <>
                <style>
                  {`
                    @keyframes oceanWave {
                      0% { transform: translateX(0px) translateY(0px); }
                      50% { transform: translateX(20px) translateY(10px); }
                      100% { transform: translateX(0px) translateY(0px); }
                    }
                    .ocean-wave {
                      animation: oceanWave 6s ease-in-out infinite;
                    }
                  `}
                </style>
                <rect x="0" y="0" width={sim.width} height={sim.height} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeDasharray="50 150" className="ocean-wave" />
                <rect x="0" y="0" width={sim.width} height={sim.height} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" strokeDasharray="30 100" className="ocean-wave" style={{animationDelay: "-3s", animationDuration: "8s"}} />
              </>
            )}
          </g>
        </svg>
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        className="w-full h-full block touch-none cursor-grab active:cursor-grabbing"
      />

      {/* Floating Canvas Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto">
        <div className="flex bg-neutral-900/80 backdrop-blur border border-white/10 rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setZoom(z => Math.min(3.0, z + 0.2))}
            className="w-8 h-8 flex items-center justify-center text-[#EEEBE4] hover:bg-white/10 rounded-lg cursor-pointer font-bold"
            title="Zoom In"
          >
            ＋
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
            className="w-8 h-8 flex items-center justify-center text-[#EEEBE4] hover:bg-white/10 rounded-lg cursor-pointer font-bold"
            title="Zoom Out"
          >
            －
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              setTrackedAnimal(null);
              if (canvasRef.current) {
                setPan({
                  x: (canvasRef.current.width - sim.width) / 2,
                  y: (canvasRef.current.height - sim.height) / 2
                });
              }
            }}
            className="px-2.5 h-8 flex items-center justify-center text-[#EEEBE4] hover:bg-white/10 rounded-lg cursor-pointer text-xs font-semibold font-heading"
            title="Reset Viewport"
          >
            Reset
          </button>
        </div>

        {trackedAnimal && (
          <div className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur border border-pink-500/30 rounded-xl px-3 py-1.5 shadow-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-[#EEEBE4]/80 font-medium">Tracking: <strong className="text-pink-400 capitalize">{trackedAnimal.name}</strong></span>
            <button
              onClick={() => setTrackedAnimal(null)}
              className="text-[#EEEBE4]/50 hover:text-white ml-1 cursor-pointer font-semibold"
              title="Unlock Camera"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {selectedTool && (
        <div className="absolute top-4 right-4 bg-green-500/10 backdrop-blur border border-green-500/30 rounded-xl px-4 py-2 shadow-lg pointer-events-none text-xs flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
          <span className="text-[#EEEBE4]">
            Placement Active: <strong className="text-green-400 capitalize">{selectedTool}</strong>
          </span>
          <span className="text-[#EEEBE4]/50 text-[10px]">Click map to place</span>
        </div>
      )}
    </div>
  );
}
