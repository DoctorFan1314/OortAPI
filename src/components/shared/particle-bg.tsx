"use client";

import { useEffect, useRef } from "react";

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let paused = false;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const isMobile = window.innerWidth < 768;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const count = isMobile ? 15 : 30;
    const connectionDist = 150;
    const connectionDistSq = connectionDist * connectionDist;

    // Cache the primary color — re-read only when theme changes
    let cachedPrimary: [number, number, number] | null = null;
    function readPrimaryRGB(): [number, number, number] {
      const style = getComputedStyle(document.documentElement);
      const hex = style.getPropertyValue("--primary").trim();
      if (!hex || !hex.startsWith("#")) return [0, 212, 255];
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    }
    function getCachedPrimary(): [number, number, number] {
      if (!cachedPrimary) cachedPrimary = readPrimaryRGB();
      return cachedPrimary;
    }
    // Invalidate cache when theme class changes on <html>
    const themeObserver = new MutationObserver(() => { cachedPrimary = null; });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function init() {
      if (!canvas) return;
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.3 + 0.05,
        });
      }
    }

    function animate() {
      if (paused) return;
      if (!canvas || !ctx) return;
      const [r, g, b] = getCachedPrimary();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < connectionDistSq) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.03 * (1 - dist / connectionDist)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    }

    function onVisibilityChange() {
      if (document.hidden) {
        paused = true;
        cancelAnimationFrame(animationId);
      } else {
        paused = false;
        animate();
      }
    }

    resize();
    init();
    animate();
    const onResize = () => { resize(); init(); };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.6 }} />;
}
