"use client";

import { useEffect, useRef, useState } from "react";

export default function IntroScene({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"spam" | "reveal" | "fadeout">("spam");
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const texts = [
      "MEDAN E JUNG", "میدانِ جنگ", "DURRANI", "ELIMINATE",
      "☪", "🇵🇰",
      "PRINCE DURRANI", "BLACKSTORM", "REDSKULL", "PLASMA FOX", "MOAZAM BEY",
      "KILLHOUSE", "CRASH", "SNIPER", "ICR",
    ];

    const sizes = [10, 14, 18, 24, 32, 48, 64, 72, 96];
    const colors = [
      "#ff6600", "#ffaa00", "#ffffff", "#01411C",
      "#d4aa3c", "#888866", "#cc2200", "#aaaaaa",
    ];

    let animId: number;
    let frame = 0;
    const SPAM_FRAMES = 120; // ~2 seconds at 60fps

    const draw = () => {
      frame++;

      // Each frame: flash black or draw new text spam
      if (frame % 4 === 0) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Scanline flicker
      if (frame % 3 === 0) {
        const scanY = Math.random() * canvas.height;
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.fillRect(0, scanY, canvas.width, 2);
      }

      // Random static noise blocks
      if (frame % 5 === 0) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 200 + 20,
          Math.random() * 4 + 1
        );
      }

      // Spam text items every frame
      const count = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < count; i++) {
        const text = texts[Math.floor(Math.random() * texts.length)];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * (canvas.width + 200) - 100;
        const y = Math.random() * canvas.height;
        const alpha = Math.random() * 0.9 + 0.1;
        const rotate = (Math.random() - 0.5) * 0.3;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = size > 40 ? 20 : 6;
        ctx.font = `900 ${size}px 'Orbitron', 'Impact', sans-serif`;
        ctx.translate(x, y);
        ctx.rotate(rotate);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }

      // Occasional full-screen flash cut to black
      if (frame % 25 === 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Occasional orange flare
      if (frame % 18 === 0) {
        const grd = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.6
        );
        grd.addColorStop(0, "rgba(255,80,0,0.12)");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (frame < SPAM_FRAMES) {
        animId = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Phase transitions
  useEffect(() => {
    // After spam ends (2s), switch to big reveal
    const t1 = setTimeout(() => setPhase("reveal"), 2000);
    // After reveal (2.5s), start fadeout
    const t2 = setTimeout(() => setPhase("fadeout"), 4000);
    // Fadeout over 600ms, then call onDone
    const t3 = setTimeout(() => {
      setOpacity(0);
    }, 4100);
    const t4 = setTimeout(() => onDone(), 4800);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black overflow-hidden"
      style={{
        transition: phase === "fadeout" ? "opacity 0.7s ease-in-out" : "none",
        opacity,
      }}
    >
      {/* Canvas spam layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 4px)",
          zIndex: 1,
        }}
      />

      {/* Big REVEAL phase */}
      {phase !== "spam" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 text-center"
          style={{
            animation: "codReveal 0.4s ease-out both",
            background: "radial-gradient(ellipse at center, rgba(255,80,0,0.12) 0%, rgba(0,0,0,0.95) 70%)",
          }}
        >
          {/* Top crescent bar */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 w-full max-w-xs sm:max-w-md mx-auto">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, #01411C)" }} />
            <span style={{ color: "#d4aa3c", fontSize: "1.2rem" }}>☪</span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #01411C, transparent)" }} />
          </div>

          {/* DURRANI */}
          <p
            className="tracking-[0.3em] sm:tracking-[0.5em] text-xs sm:text-sm mb-2 sm:mb-3"
            style={{ color: "#d4aa3c", fontFamily: "Orbitron, sans-serif", animation: "codFadeUp 0.4s 0.1s ease-out both" }}
          >
            DURRANI FAMILY
          </p>

          {/* Main title */}
          <h1
            className="w-full"
            style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "clamp(2rem, 8vw, 6rem)",
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: "#ff6600",
              textShadow: "0 0 40px rgba(255,100,0,0.9), 0 0 80px rgba(255,60,0,0.5), 0 0 120px rgba(255,30,0,0.2)",
              animation: "codFadeUp 0.5s 0.15s ease-out both",
              lineHeight: 1.1,
            }}
          >
            MEDAN E JUNG
          </h1>

          {/* Urdu */}
          <div
            className="mt-2"
            style={{
              fontFamily: "'Noto Nastaliq Urdu', serif",
              fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
              color: "#d4aa3c",
              direction: "rtl",
              textShadow: "0 0 20px rgba(212,170,60,0.6)",
              animation: "codFadeUp 0.5s 0.25s ease-out both",
              lineHeight: 2,
            }}
          >
            میدانِ جنگ
          </div>

          {/* Bottom line */}
          <div
            className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-4 w-full max-w-xs sm:max-w-md mx-auto"
            style={{ animation: "codFadeUp 0.4s 0.35s ease-out both" }}
          >
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, #ff6600)" }} />
            <span className="text-[0.6rem] sm:text-xs tracking-[0.2em] sm:tracking-[0.5em] text-military-khaki uppercase whitespace-nowrap">COD Mobile · Pakistan 🇵🇰</span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #ff6600, transparent)" }} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes codReveal {
          from { opacity: 0; transform: scale(1.05); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes codFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
