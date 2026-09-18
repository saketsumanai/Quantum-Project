"use client"

import React, { useEffect, useRef } from 'react';

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  initialLife: number;
  initialSize: number;
  color: string;

  constructor(x: number, y: number, isAmbient = false) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * (isAmbient ? 6 : 8) + 3;
    this.speedX = Math.random() * 1.6 - 0.8;
    this.speedY = -Math.random() * 2.2 - 0.6;
    this.life = isAmbient ? Math.random() * 60 + 40 : 100;
    this.initialLife = this.life;
    this.initialSize = this.size;
    const brightness = Math.floor(Math.random() * 80 + 175);
    this.color = `${brightness}, ${brightness}, ${brightness}`;
  }

  update() {
    this.x += this.speedX + (Math.random() * 0.4 - 0.2);
    this.y += this.speedY;
    this.life -= 1.2;
    this.size = Math.max(0, this.initialSize * (1 + (1 - this.life / this.initialLife) * 1.5));
  }
}

interface SmokeCardProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SmokeCard = ({ children, className = "", style = {} }: SmokeCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0, isHovered: false });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const animate = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update particles
      particlesRef.current = particlesRef.current
        .filter(particle => particle.life > 0 && particle.size > 0)
        .map(particle => {
          particle.update();
          
          if (particle.size > 0 && particle.life > 0) {
            const opacity = (particle.life / particle.initialLife) * 0.45;
            ctx.fillStyle = `rgba(${particle.color}, ${opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }
          
          return particle;
        });

      // Add mouse smoke particles when hovering
      if (mousePosRef.current.isHovered) {
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push(
            new Particle(
              mousePosRef.current.x + (Math.random() * 16 - 8),
              mousePosRef.current.y + (Math.random() * 16 - 8),
              false
            )
          );
        }
      } else if (tick % 6 === 0) {
        // Ambient continuous smoke at bottom of card
        const ambientX = Math.random() * canvas.width;
        const ambientY = canvas.height - 10;
        particlesRef.current.push(new Particle(ambientX, ambientY, true));
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(() => updateCanvasSize());
    resizeObserver.observe(container);
    
    animate();

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current.isHovered = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`smoke-card-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#050505',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
        minHeight: '140px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none', width: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export { SmokeCard };
