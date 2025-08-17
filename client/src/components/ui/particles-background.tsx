import { useEffect, useRef } from 'react';
import { particlesConfig } from '@/lib/particles-config';

declare global {
  interface Window {
    particlesJS: any;
  }
}

export default function ParticlesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    const loadParticlesJS = async () => {
      if (scriptLoadedRef.current || typeof window.particlesJS !== 'undefined') {
        // Already loaded, initialize particles
        if (containerRef.current) {
          window.particlesJS('particles-js', particlesConfig);
        }
        return;
      }

      try {
        // Load particles.js library
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
        script.async = true;
        
        script.onload = () => {
          scriptLoadedRef.current = true;
          if (containerRef.current && window.particlesJS) {
            window.particlesJS('particles-js', particlesConfig);
          }
        };

        script.onerror = () => {
          console.warn('Failed to load particles.js library');
        };

        document.head.appendChild(script);
      } catch (error) {
        console.warn('Error loading particles.js:', error);
      }
    };

    loadParticlesJS();

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[src*="particles.min.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div 
      id="particles-js" 
      ref={containerRef}
      className="particles-container"
      data-testid="particles-background"
    />
  );
}
