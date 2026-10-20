'use client';

import { useEffect, useRef } from 'react';

/**
 * Sinematik Ambiyans Katmanı — BDSN Club + Dropbox Brand + Eszter Bial esinlenmesi
 * 
 * Katmanlar:
 * 1. Derin uzay nebula gradient haritası (animasyonlu renk geçişleri)
 * 2. Yıldız alanı (150+ mikro-yıldız, titreşimli parlaklık)
 * 3. Büyük orbital ışık küresi (mouse-follow, lerp spring)
 * 4. Takımyıldızı ağ hatları (yakın parçacıklar arası)
 * 5. Meteor / Kayan yıldız rastgele çizgileri
 * 6. Mouse çevresinde neon hale / ring
 */
export default function BDSNAmbientCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    let animId = null;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // HiDPI
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    let mouse = { x: W / 2, y: H / 2 };
    let target = { x: W / 2, y: H / 2 };
    let time = 0;

    // ── 1. Nebula orbs (büyük renkli küre katmanları) ──
    const nebulaOrbs = [
      { x: 0.2, y: 0.3, r: 0.35, hue: 200, sat: 70, speed: 0.0003 },
      { x: 0.7, y: 0.6, r: 0.3,  hue: 270, sat: 60, speed: 0.0004 },
      { x: 0.5, y: 0.8, r: 0.25, hue: 330, sat: 50, speed: 0.0005 },
      { x: 0.8, y: 0.2, r: 0.2,  hue: 180, sat: 65, speed: 0.0006 },
    ];

    // ── 2. Star field ──
    const STAR_COUNT = Math.min(180, Math.floor((W * H) / 8000));
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.8 + 0.3,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinkleOffset: Math.random() * Math.PI * 2,
      brightness: Math.random() * 0.5 + 0.3,
    }));

    // ── 3. Interactive particles (constellation nodes) ──
    const PARTICLE_COUNT = Math.min(55, Math.floor(W / 28));
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      hue: [188, 260, 320, 210][Math.floor(Math.random() * 4)],
      alpha: Math.random() * 0.5 + 0.3,
      pulse: Math.random() * Math.PI * 2,
    }));

    // ── 4. Meteor / shooting stars ──
    const meteors = [];
    function spawnMeteor() {
      if (meteors.length >= 3) return;
      meteors.push({
        x: Math.random() * W,
        y: -10,
        length: 60 + Math.random() * 100,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
        speed: 4 + Math.random() * 6,
        alpha: 0.7 + Math.random() * 0.3,
        life: 1,
        width: 1 + Math.random() * 1.5,
      });
    }

    function handleResize() {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function handleMouse(e) {
      target.x = e.clientX;
      target.y = e.clientY;
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);

    function render() {
      time++;

      // Smooth spring lerp
      mouse.x += (target.x - mouse.x) * 0.06;
      mouse.y += (target.y - mouse.y) * 0.06;

      // ── Clear ──
      ctx.clearRect(0, 0, W, H);

      // ── 1. Nebula orbs (deep space ambient color) ──
      for (const orb of nebulaOrbs) {
        const ox = orb.x * W + Math.sin(time * orb.speed) * W * 0.08;
        const oy = orb.y * H + Math.cos(time * orb.speed * 1.3) * H * 0.06;
        const radius = orb.r * Math.min(W, H);

        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
        const alpha = 0.06 + Math.sin(time * 0.008 + orb.hue) * 0.02;
        grad.addColorStop(0, `hsla(${orb.hue}, ${orb.sat}%, 50%, ${alpha})`);
        grad.addColorStop(0.5, `hsla(${orb.hue}, ${orb.sat}%, 40%, ${alpha * 0.4})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // ── 2. Star field twinkle ──
      for (const s of stars) {
        const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
        const alpha = s.brightness + twinkle * 0.25;
        if (alpha <= 0) continue;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${Math.min(0.85, alpha)})`;
        ctx.fill();

        // Bright stars get a soft bloom
        if (s.size > 1.2 && alpha > 0.45) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 210, 255, ${alpha * 0.08})`;
          ctx.fill();
        }
      }

      // ── 3. Mouse-follow radial aurora ──
      const auroraR = Math.max(W, H) * 0.4;
      const aGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, auroraR);
      const hueShift = Math.sin(time * 0.005) * 30;
      aGrad.addColorStop(0, `hsla(${188 + hueShift}, 85%, 55%, 0.14)`);
      aGrad.addColorStop(0.35, `hsla(${260 + hueShift}, 70%, 50%, 0.06)`);
      aGrad.addColorStop(0.7, `hsla(${320 + hueShift}, 60%, 45%, 0.02)`);
      aGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = aGrad;
      ctx.fillRect(0, 0, W, H);

      // ── 4. Constellation particles + lines ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        // Wrap
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        // Mouse repulsion
        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 180) {
          const force = (180 - md) / 180;
          p.x -= (mdx / md) * force * 2;
          p.y -= (mdy / md) * force * 2;
        }

        // Constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `hsla(${p.hue}, 80%, 65%, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Draw particle with glow
        const pAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + Math.sin(p.pulse) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 70%, ${pAlpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 85%, 70%, 0.7)`;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 5. Meteors / shooting stars ──
      if (Math.random() < 0.004) spawnMeteor();
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.life -= 0.012;

        if (m.life <= 0 || m.x > W + 50 || m.y > H + 50) {
          meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - Math.cos(m.angle) * m.length * m.life;
        const tailY = m.y - Math.sin(m.angle) * m.length * m.life;

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.7, `rgba(200, 230, 255, ${m.alpha * m.life * 0.4})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha * m.life})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha * m.life * 0.8})`;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── 6. Interactive neon halo ring around cursor ──
      const ringPulse = Math.sin(time * 0.04) * 4;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 22 + ringPulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.25 + Math.sin(time * 0.03) * 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner ring
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 8 + ringPulse * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${0.06 + Math.sin(time * 0.05) * 0.03})`;
      ctx.fill();

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
