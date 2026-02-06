import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Home, WifiOff } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.title = "SmartHome — Developed by RT";
  }, []);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Disconnecting / glitch visual effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      decay: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnParticles = () => {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.6 + 0.2,
          decay: Math.random() * 0.005 + 0.002,
        });
      }
    };

    const drawGlitchLines = () => {
      if (Math.random() > 0.92) {
        const y = Math.random() * canvas.height;
        const h = Math.random() * 3 + 1;
        ctx.fillStyle = `hsla(0, 70%, 50%, ${Math.random() * 0.15})`;
        ctx.fillRect(0, y, canvas.width, h);
      }
      if (Math.random() > 0.95) {
        const y = Math.random() * canvas.height;
        const h = Math.random() * 2 + 1;
        ctx.fillStyle = `hsla(200, 70%, 50%, ${Math.random() * 0.1})`;
        ctx.fillRect(0, y, canvas.width, h);
      }
    };

    const drawScanlines = () => {
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.03)";
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 1);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Floating disconnected particles
      spawnParticles();
      particles = particles.filter((p) => p.opacity > 0.01);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= p.decay;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(210, 60%, 60%, ${p.opacity})`;
        ctx.fill();
      });

      // Keep particles manageable
      if (particles.length > 200) {
        particles = particles.slice(-150);
      }

      drawGlitchLines();
      drawScanlines();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Canvas background effect */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Radial vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background))_80%)] z-[1]" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 px-6 max-w-md">
        {/* Animated icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-destructive/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-destructive/20 animate-pulse" />
          <WifiOff className="w-10 h-10 text-destructive/80 animate-pulse" />
        </div>

        {/* Error code */}
        <div>
          <h1 className="text-7xl font-black tracking-tighter text-foreground/90 font-mono">
            404
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-medium">
            Connection Lost
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          The route <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono text-foreground/70">{location.pathname}</code> could not be found. The device appears to be disconnected.
        </p>

        {/* Action */}
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="gap-2 border-border/50 hover:bg-muted/50"
        >
          <Home className="w-4 h-4" />
          Return to Base
        </Button>

        {/* Footer branding */}
        <p className="text-[10px] text-muted-foreground/40 pt-4">
          SmartHome — Developed by RT
        </p>
      </div>
    </div>
  );
};

export default NotFound;
