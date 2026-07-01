import React, { useRef, useEffect, useState } from "react";

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
        // Base grass floor
        ctx.fillStyle = "#6E9146"; // Summer/Spring grass
        const season = sim.timeSystem.getSeason();
        if (season === "Autumn") ctx.fillStyle = "#8E8146"; // Brownish
        else if (season === "Winter") ctx.fillStyle = "#D6E3E6"; // Snowy
        else if (season === "Spring") ctx.fillStyle = "#79A74E"; // Vibrant
        
        ctx.fillRect(0, 0, sim.width, sim.height);

        // Draw River winding path
        if (sim.worldMap.riverPoints && sim.worldMap.riverPoints.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = "#4D7CB8";
          ctx.lineWidth = 45;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          const pts = sim.worldMap.riverPoints;
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.stroke();
        }

        // Draw Ponds
        ctx.fillStyle = "#5787C4";
        for (let wb of sim.worldMap.waterBodies) {
          if (!wb.isRiver) {
            ctx.beginPath();
            ctx.arc(wb.x, wb.y, wb.radius, 0, Math.PI * 2);
            ctx.fill();
            // Pond border
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        }

        // Draw Obstacles (Rocks/Cliffs)
        for (let obs of sim.worldMap.obstacles) {
          // Shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
          ctx.beginPath();
          ctx.arc(obs.x + 3, obs.y + 4, obs.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Rock body
          ctx.fillStyle = "#7B7D82";
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
          ctx.fill();

          // Cracks/detail
          ctx.strokeStyle = "#5A5B5E";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(obs.x - obs.radius * 0.4, obs.y - obs.radius * 0.2);
          ctx.lineTo(obs.x + obs.radius * 0.2, obs.y + obs.radius * 0.3);
          ctx.stroke();
        }

        // Draw Shelters (caves)
        for (let sh of sim.worldMap.shelters) {
          ctx.fillStyle = "#2D1D16";
          ctx.beginPath();
          ctx.arc(sh.x, sh.y, sh.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#4D362B";
          ctx.lineWidth = 4;
          ctx.stroke();
        }

      } else { // Ocean
        // Shallow reef floor vs deep ocean floor
        ctx.fillStyle = "#22567A"; // deep blue base
        ctx.fillRect(0, 0, sim.width, sim.height);

        // Shallow zone sand floor
        const splitX = sim.worldMap.reefSplitX;
        const grad = ctx.createLinearGradient(0, 0, splitX + 80, 0);
        grad.addColorStop(0, "#C7B183"); // Sandy shelf
        grad.addColorStop(0.7, "#81AB95"); // Reef slope
        grad.addColorStop(1.0, "#22567A"); // Drop-off to deep blue
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, splitX + 120, sim.height);

        // Draw Coral Reef structures
        for (let obs of sim.worldMap.obstacles) {
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.beginPath();
          ctx.arc(obs.x + 2, obs.y + 3, obs.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#C97079"; // Pinkish coral rock
          if (obs.x % 3 === 0) ctx.fillStyle = "#8BA85C"; // Greenish
          else if (obs.x % 2 === 0) ctx.fillStyle = "#CFA04C"; // Yellowish
          
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Coral details
          ctx.strokeStyle = "rgba(255,255,255,0.2)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, obs.radius * 0.6, 0, Math.PI, true);
          ctx.stroke();
        }
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

      // ─── 2. DRAW PLANTS ───
      for (let p of sim.plants) {
        if (p.isDead) continue;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        
        // Determine dynamic max size based on plant type
        let maxSize = 26;
        if (sim.ecosystemType === "forest") {
          if (p.type === "tree") maxSize = 52;
          else if (p.type === "bush") maxSize = 34;
          else if (p.type === "flower") maxSize = 24;
          else if (p.type === "grass") maxSize = 18;
        } else {
          if (p.type === "kelp") maxSize = 42;
          else if (p.type === "seagrass") maxSize = 28;
          else if (p.type === "coral") maxSize = 36;
        }

        // Add a slight procedural rotation so plants look organically aligned
        const rot = ((p.id * 100) % 10) / 10 * 0.4 - 0.2; // -0.2 to +0.2 rads
        ctx.rotate(rot);

        // Scale with plant growth size
        const size = p.growth * maxSize;
        ctx.font = `${size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let emoji = "🌱";
        if (sim.ecosystemType === "forest") {
          if (p.type === "tree") emoji = "🌳";
          else if (p.type === "bush") emoji = "🌿";
          else if (p.type === "flower") emoji = "🌸";
          else if (p.type === "grass") emoji = "🌱";
        } else {
          if (p.type === "kelp") emoji = "🪸";
          else if (p.type === "coral") emoji = "🪸";
          else emoji = "🌱";
        }

        // Draw shadow
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillText(emoji, 2, 2);
        
        // Draw emoji
        ctx.fillText(emoji, 0, 0);
        ctx.restore();
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

        // Draw rounded rectangle card background
        ctx.beginPath();
        ctx.roundRect(-17, -17, 34, 34, 9);
        ctx.fillStyle = a.isDead ? "rgba(35, 10, 10, 0.45)" : "rgba(20, 20, 20, 0.65)";
        ctx.fill();

        // Border color based on diet
        let borderColor = "rgba(255, 255, 255, 0.12)";
        if (!a.isDead) {
          if (a.diet === "carnivore") borderColor = "rgba(230, 80, 80, 0.55)";
          else if (a.diet === "herbivore") borderColor = "rgba(121, 174, 111, 0.55)";
          else borderColor = "rgba(122, 170, 206, 0.55)";
        }
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Render emoji based on species
        ctx.font = a.isDead ? "16px sans-serif" : "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        let emoji = "🐾";
        if (a.isDead) {
          emoji = "🍖"; // Carcass
        } else {
          // Emoji lookup mapping
          const EMOJIS = {
            "snow-leopard": "🐆",
            "african-elephant": "🐘",
            "amur-leopard": "🐆",
            "arctic-fox": "🦊",
            "giant-panda": "🐼",
            "bald-eagle": "🦅",
            "emperor-penguin": "🐧",
            "barn-owl": "🦉",
            "scarlet-macaw": "🦜",
            "komodo-dragon": "🦎",
            "saltwater-crocodile": "🐊",
            "green-sea-turtle": "🐢",
            "king-cobra": "🐍",
            "galapagos-tortoise": "🐢",
            "great-white-shark": "🦈",
            "clownfish": "🐠",
            "manta-ray": "🐋",
            "atlantic-bluefin-tuna": "🐟",
            "poison-dart-frog": "🐸",
            "axolotl": "🦎",
            "fire-salamander": "🦎",
            "american-bullfrog": "🐸",
            "deer": "🦌",
            "rabbit": "🐇",
            "mouse": "🐭",
            "small-fish": "🐟",
            "squirrel": "🐿️",
            "boar": "🐗",
            "woodpecker": "🪶",
            "plankton": "🔬",
            "krill": "🦐",
            "sea-urchin": "🦔",
            "squid": "🦑",
            "seal": "🦭",
            "arctic-fox": "🦊",
          };
          emoji = EMOJIS[a.speciesId] || "🐾";
        }

        // Direction orientation (flip emoji based on heading direction)
        const angle = Math.atan2(a.vy, a.vx);
        const facingLeft = angle > Math.PI / 2 || angle < -Math.PI / 2;

        ctx.save();
        if (facingLeft && !a.isDead) {
          ctx.scale(-1, 1);
        }
        
        // Draw emoji
        ctx.fillText(emoji, 0, 1);
        ctx.restore();

        // Gender marker indicator (small dot in top right of card)
        if (!a.isDead) {
          ctx.fillStyle = a.gender === "Male" ? "#5EA3E3" : "#E35EB8";
          ctx.beginPath();
          ctx.arc(12, -12, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(20, 20, 20, 0.8)";
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        // Sleep indicator text Zzz
        if (a.activity === "Sleep" && !a.isDead) {
          ctx.fillStyle = "#AEE";
          ctx.font = "8px 'Outfit', sans-serif";
          ctx.fillText("Zzz", 10, -10);
        }

        // Hunger bar (visible when getting hungry)
        if (!a.isDead && a.hunger < 60) {
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.fillRect(-14, -20, 28, 3);
          const hungerPct = a.hunger / 100;
          ctx.fillStyle = hungerPct > 0.35 ? "#F0A032" : "#E65050";
          ctx.fillRect(-14, -20, 28 * hungerPct, 3);
        }

        // Modern health bar at bottom of card
        if (!a.isDead && a.health < 100) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(-14, 11, 28, 3.5);
          
          const healthPct = a.health / 100;
          ctx.fillStyle = healthPct > 0.5 ? "#79AE6F" : healthPct > 0.25 ? "#F0A032" : "#E65050";
          ctx.fillRect(-14, 11, 28 * healthPct, 3.5);
        }

        // Pregnancy progress bar at top of card
        if (!a.isDead && a.pregnant) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(-14, -15, 28, 3.5);
          
          const pregPct = a.gestationTimer / a.gestationPeriod;
          ctx.fillStyle = "#E35EB8"; // Hot pink
          ctx.fillRect(-14, -15, 28 * pregPct, 3.5);
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
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = (e) => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
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

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
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
