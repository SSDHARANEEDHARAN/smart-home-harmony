import { useEffect, useRef } from 'react';

export function HexagonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let connections: Connection[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      type: 'node' | 'data';
    }

    interface Connection {
      from: number;
      to: number;
      progress: number;
      speed: number;
      active: boolean;
    }

    // Create nodes (circuit board style)
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.3 + 0.1,
        type: 'node',
      });
    }

    // Create data particles
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 2,
        opacity: Math.random() * 0.5 + 0.3,
        type: 'data',
      });
    }

    // Create connections between nearby nodes
    const updateConnections = () => {
      connections = [];
      const nodes = particles.filter(p => p.type === 'node');
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && connections.length < 60) {
            connections.push({
              from: i,
              to: j,
              progress: Math.random(),
              speed: Math.random() * 0.02 + 0.005,
              active: Math.random() > 0.5,
            });
          }
        }
      }
    };
    updateConnections();

    const isDark = () => {
      return document.documentElement.classList.contains('dark') || 
             !document.documentElement.classList.contains('light');
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const colorBase = isDark() ? '255, 255, 255' : '0, 0, 0';

      // Draw connections (circuit traces)
      const nodes = particles.filter(p => p.type === 'node');
      connections.forEach(conn => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];
        if (!from || !to) return;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = `rgba(${colorBase}, 0.05)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Animated data flow on active connections
        if (conn.active) {
          conn.progress += conn.speed;
          if (conn.progress > 1) conn.progress = 0;

          const px = from.x + (to.x - from.x) * conn.progress;
          const py = from.y + (to.y - from.y) * conn.progress;

          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorBase}, 0.4)`;
          ctx.fill();
        }
      });

      // Draw and update particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        if (p.type === 'node') {
          // Draw node as hexagon
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = p.x + Math.cos(angle) * p.size;
            const y = p.y + Math.sin(angle) * p.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(${colorBase}, ${p.opacity})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${colorBase}, ${p.opacity * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Draw data particle as glowing dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorBase}, ${p.opacity})`;
          ctx.fill();

          // Glow effect
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          gradient.addColorStop(0, `rgba(${colorBase}, ${p.opacity * 0.3})`);
          gradient.addColorStop(1, `rgba(${colorBase}, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      // Periodically update connections
      if (Math.random() > 0.995) {
        updateConnections();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
