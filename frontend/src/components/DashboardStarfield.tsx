import React, { useEffect, useRef } from 'react';

export const DashboardStarfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Very small, subtle white stars. Sparse star distribution. Dim and elegant.
    const starCount = Math.floor((width * height) / 9000); // very sparse
    const stars: { x: number; y: number; size: number; alpha: number; speed: number; phase: number }[] = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 0.7 + 0.3, // sub-pixel small
        alpha: Math.random() * 0.35 + 0.1, // dim (0.1 to 0.45)
        speed: Math.random() * 0.008 + 0.002,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.speed;
        const currentAlpha = s.alpha + Math.sin(s.phase) * (s.alpha * 0.3);

        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = Math.max(0.05, Math.min(0.6, currentAlpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full opacity-60"
    />
  );
};
