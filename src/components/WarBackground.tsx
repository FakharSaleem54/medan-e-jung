"use client";

import { useEffect, useRef } from "react";

// Particle represents flying debris / sparks
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  decay: number;
  color: string;
};

export default function WarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const COLORS = ["#ff6600", "#ffaa00", "#ff3300", "#cc4400", "#888866", "#aaaaaa"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn sparks randomly
    const spawnParticle = () => {
      const fromEdge = Math.random() < 0.3;
      particles.push({
        x: fromEdge ? (Math.random() < 0.5 ? 0 : canvas.width) : Math.random() * canvas.width,
        y: fromEdge ? Math.random() * canvas.height : canvas.height + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 2 + 0.5),
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        decay: Math.random() * 0.008 + 0.003,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };

    let frameCount = 0;
    const draw = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn particles
      if (frameCount % 3 === 0) spawnParticle();

      // Draw + update
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gravity pulls sparks back down
        p.opacity -= p.decay;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Subtle scanline overlay every 4px
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = "#000";
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 1);
      }
      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
