import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
  depth: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

export const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse parallax tracking with smooth interpolation
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.03;
      targetMouseY = (e.clientY - height / 2) * 0.03;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Star colors: deep space natural variations
    const starColors = [
      '#FFFFFF',
      '#F0F6FF',
      '#E0EFFF',
      '#C8E6FF',
      '#FFF8EE',
      '#BCE0FD',
    ];

    // Generate stars
    const starCount = Math.floor((width * height) / 3200);
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const depth = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
      const isRareBright = Math.random() < 0.04;
      const size = isRareBright ? Math.random() * 1.2 + 1.2 : Math.random() * 0.9 + 0.3;
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      const baseAlpha = Math.random() * 0.6 + 0.25;

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        baseAlpha,
        alpha: baseAlpha,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        color,
        depth,
      });
    }

    // Rare subtle shooting star
    let shootingStar: ShootingStar | null = null;
    let nextShootingStarTime = Date.now() + Math.random() * 8000 + 4000;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Pure deep space background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw faint deep space nebula haze on the left
      const grad = ctx.createRadialGradient(
        width * 0.25,
        height * 0.45,
        50,
        width * 0.25,
        height * 0.45,
        width * 0.6
      );
      grad.addColorStop(0, 'rgba(0, 80, 160, 0.035)');
      grad.addColorStop(0.5, 'rgba(0, 20, 60, 0.015)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      const now = Date.now();
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.phase += star.twinkleSpeed;
        const currentAlpha =
          star.baseAlpha + Math.sin(star.phase) * (star.baseAlpha * 0.45);

        // Parallax position
        const px = star.x + mouseX * star.depth;
        const py = star.y + mouseY * star.depth;

        // Wrap around borders
        const renderX = (px + width) % width;
        const renderY = (py + height) % height;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.08, Math.min(1, currentAlpha));

        ctx.beginPath();
        ctx.arc(renderX, renderY, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow for bright stars
        if (star.size > 1.8) {
          ctx.beginPath();
          ctx.fillStyle = star.color;
          ctx.globalAlpha = currentAlpha * 0.25;
          ctx.arc(renderX, renderY, star.size * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Check shooting star
      if (!shootingStar && now > nextShootingStarTime) {
        shootingStar = {
          x: Math.random() * width * 0.7,
          y: Math.random() * height * 0.4,
          length: Math.random() * 80 + 70,
          speed: Math.random() * 12 + 10,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 deg
          opacity: 1,
          active: true,
        };
        nextShootingStarTime = now + Math.random() * 14000 + 10000;
      }

      if (shootingStar && shootingStar.active) {
        const endX =
          shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
        const endY =
          shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

        const meteorGrad = ctx.createLinearGradient(
          shootingStar.x,
          shootingStar.y,
          endX,
          endY
        );
        meteorGrad.addColorStop(
          0,
          `rgba(255, 255, 255, ${shootingStar.opacity})`
        );
        meteorGrad.addColorStop(
          0.3,
          `rgba(0, 180, 255, ${shootingStar.opacity * 0.6})`
        );
        meteorGrad.addColorStop(1, 'rgba(0, 100, 255, 0)');

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.opacity -= 0.022;

        if (
          shootingStar.opacity <= 0 ||
          shootingStar.x > width ||
          shootingStar.y > height
        ) {
          shootingStar = null;
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};
