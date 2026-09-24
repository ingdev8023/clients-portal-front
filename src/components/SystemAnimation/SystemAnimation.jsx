import { useEffect, useRef } from 'react';
import { createSystemAnimation } from './animationEngine';

function readThemePalette() {
  const styles = getComputedStyle(document.documentElement);
  return {
    particle: styles.getPropertyValue('--text-muted').trim(),
    primary: styles.getPropertyValue('--primary').trim(),
    accent: styles.getPropertyValue('--success').trim(),
    connection: styles.getPropertyValue('--border-strong').trim(),
  };
}

export default function SystemAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const engine = createSystemAnimation(canvas, {
      reducedMotion: motionQuery.matches,
      palette: readThemePalette(),
    });

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      engine.resize(bounds.width, bounds.height);
    };

    // ResizeObserver follows both viewport changes and login content height changes.
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    engine.start();

    const handleMotionPreference = (event) => engine.setReducedMotion(event.matches);
    motionQuery.addEventListener('change', handleMotionPreference);

    // Theme changes only replace drawing colors; simulation positions continue uninterrupted.
    const themeObserver = new MutationObserver(() => engine.setPalette(readThemePalette()));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      engine.destroy();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      motionQuery.removeEventListener('change', handleMotionPreference);
    };
  }, []);

  return <canvas ref={canvasRef} className="system-animation" aria-hidden="true" />;
}
