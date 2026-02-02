import { useEffect, useRef } from 'react';

export function FloatingCubes() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create floating cubes
    const cubes: HTMLDivElement[] = [];
    for (let i = 0; i < 15; i++) {
      const cube = document.createElement('div');
      cube.className = 'floating-cube';
      cube.style.cssText = `
        position: absolute;
        width: ${20 + Math.random() * 60}px;
        height: ${20 + Math.random() * 60}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        transform-style: preserve-3d;
        animation: float-cube ${8 + Math.random() * 12}s ease-in-out infinite;
        animation-delay: ${-Math.random() * 10}s;
        opacity: ${0.03 + Math.random() * 0.08};
      `;
      
      // Create cube faces
      const faces = ['front', 'back', 'left', 'right', 'top', 'bottom'];
      const size = cube.style.width;
      const sizeNum = parseInt(size);
      
      faces.forEach((face, index) => {
        const faceEl = document.createElement('div');
        faceEl.style.cssText = `
          position: absolute;
          width: ${sizeNum}px;
          height: ${sizeNum}px;
          border: 1px solid currentColor;
          background: transparent;
        `;
        
        switch(face) {
          case 'front':
            faceEl.style.transform = `translateZ(${sizeNum/2}px)`;
            break;
          case 'back':
            faceEl.style.transform = `translateZ(-${sizeNum/2}px) rotateY(180deg)`;
            break;
          case 'left':
            faceEl.style.transform = `translateX(-${sizeNum/2}px) rotateY(-90deg)`;
            break;
          case 'right':
            faceEl.style.transform = `translateX(${sizeNum/2}px) rotateY(90deg)`;
            break;
          case 'top':
            faceEl.style.transform = `translateY(-${sizeNum/2}px) rotateX(90deg)`;
            break;
          case 'bottom':
            faceEl.style.transform = `translateY(${sizeNum/2}px) rotateX(-90deg)`;
            break;
        }
        
        cube.appendChild(faceEl);
      });
      
      container.appendChild(cube);
      cubes.push(cube);
    }

    return () => {
      cubes.forEach(cube => cube.remove());
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none text-foreground"
      style={{ perspective: '1000px' }}
    />
  );
}
