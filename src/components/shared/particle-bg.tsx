"use client";

import { useEffect, useRef } from "react";

/**
 * Ultra-minimalist starfield particle system.
 * Slow, faint particles like distant stars — no connection lines.
 */
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let paused = false;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const isMobile = window.innerWidth < 768;
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const count = isMobile ? 8 : 20;

    function readTheme(): "dark" | "light" {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }

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
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          size: Math.random() * 0.8 + 0.3,
        });
      }
    }

    function animate() {
      if (paused || !canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const theme = readTheme();
      const baseOpacity = theme === "dark" ? 0.2 : 0.08;
      const color = theme === "dark" ? "180, 200, 255" : "59, 130, 246";

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${baseOpacity})`;
        ctx.fill();
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

    // Re-animate on theme toggle
    const themeObserver = new MutationObserver(() => {
      if (!paused) { cancelAnimationFrame(animationId); animate(); }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}
