import { AnimationState, CONNECTIONS, NODE_LAYOUT, PHASES, STABILIZED_TIME, particleCountForWidth } from './config';
import { clamp, easeInOutCubic, lerp, normalize, randomRange, smoothstep } from './math';

const TAU = Math.PI * 2;
const DEFAULT_PALETTE = {
  particle: '#aab8b1',
  primary: '#35b6a8',
  accent: '#57c589',
  connection: '#496056',
};

export function getAnimationState(elapsed, reducedMotion = false) {
  if (reducedMotion) return AnimationState.STABILIZED;
  return PHASES.find((phase) => elapsed >= phase.start && elapsed < phase.end)?.state || AnimationState.STABILIZED;
}

export function getPhaseProgress(elapsed, state) {
  const phase = PHASES.find((item) => item.state === state);
  if (!phase || !Number.isFinite(phase.end)) return 1;
  return smoothstep((elapsed - phase.start) / (phase.end - phase.start));
}

export function createSystemAnimation(canvas, options = {}) {
  const context = canvas.getContext('2d');
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let particles = [];
  let nodes = [];
  let frameId = 0;
  let startTime = 0;
  let previousTime = 0;
  let reducedMotion = Boolean(options.reducedMotion);
  let palette = { ...DEFAULT_PALETTE, ...options.palette };

  const buildNodes = () => {
    const baseRadius = clamp(Math.min(width, height) * 0.052, 20, 46);
    nodes = NODE_LAYOUT.map((node) => ({
      ...node,
      x: node.x * width,
      y: node.y * height,
      radius: baseRadius * node.scale,
    }));
  };

  const targetFor = (particle, elapsed, settled) => {
    const node = nodes[particle.nodeIndex];
    const orbitSpeed = node.primary ? 0.12 : 0.055;
    const rotation = settled ? elapsed * orbitSpeed : 0;
    const breathing = settled ? Math.sin(elapsed * 0.7 + particle.seed) * 1.8 : 0;
    const radius = node.radius * particle.radialFactor + breathing;
    return {
      x: node.x + Math.cos(particle.targetAngle + rotation) * radius,
      y: node.y + Math.sin(particle.targetAngle + rotation) * radius,
    };
  };

  const createParticles = () => {
    const count = particleCountForWidth(width);
    particles = Array.from({ length: count }, (_, index) => {
      const nodeIndex = index % nodes.length;
      const particle = {
        x: randomRange(0, width),
        y: randomRange(0, height),
        vx: randomRange(-20, 20),
        vy: randomRange(-20, 20),
        nodeIndex,
        targetAngle: randomRange(0, TAU),
        radialFactor: randomRange(0.28, 0.92),
        radius: randomRange(1.4, 2.6),
        seed: randomRange(0, TAU),
      };

      if (reducedMotion) {
        const target = targetFor(particle, STABILIZED_TIME, true);
        particle.x = target.x;
        particle.y = target.y;
        particle.vx = 0;
        particle.vy = 0;
      }
      return particle;
    });
  };

  const resize = (nextWidth, nextHeight) => {
    const safeWidth = Math.max(1, Math.round(nextWidth));
    const safeHeight = Math.max(1, Math.round(nextHeight));
    const oldWidth = width;
    const oldHeight = height;
    width = safeWidth;
    height = safeHeight;
    pixelRatio = Math.min(globalThis.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    buildNodes();

    const desiredCount = particleCountForWidth(width);
    if (!particles.length || particles.length !== desiredCount) {
      createParticles();
    } else {
      const scaleX = width / oldWidth;
      const scaleY = height / oldHeight;
      particles.forEach((particle) => {
        particle.x *= scaleX;
        particle.y *= scaleY;
      });
    }

    if (reducedMotion) render(STABILIZED_TIME);
  };

  const applyForceTowardTarget = (particle, target, delta, strength, damping) => {
    const dx = target.x - particle.x;
    const dy = target.y - particle.y;
    const distance = Math.hypot(dx, dy);
    const direction = normalize(dx, dy);
    const acceleration = Math.min(190, strength + distance * 0.11);

    particle.vx += direction.x * acceleration * delta;
    particle.vy += direction.y * acceleration * delta;

    // Damping removes energy so particles settle around nodes instead of oscillating forever.
    const frameDamping = damping ** (delta * 60);
    particle.vx *= frameDamping;
    particle.vy *= frameDamping;
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
  };

  const updateChaos = (particle, elapsed, delta) => {
    const waveX = Math.sin(elapsed * 0.8 + particle.seed) + Math.cos(particle.y * 0.009 + particle.seed);
    const waveY = Math.cos(elapsed * 0.65 + particle.seed) - Math.sin(particle.x * 0.008 + particle.seed);
    particle.vx = (particle.vx + waveX * 8 * delta) * (0.996 ** (delta * 60));
    particle.vy = (particle.vy + waveY * 8 * delta) * (0.996 ** (delta * 60));
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;

    const margin = 8;
    if (particle.x < margin || particle.x > width - margin) particle.vx *= -1;
    if (particle.y < margin || particle.y > height - margin) particle.vy *= -1;
    particle.x = clamp(particle.x, margin, width - margin);
    particle.y = clamp(particle.y, margin, height - margin);
  };

  const updateParticles = (elapsed, delta, state) => {
    const progress = getPhaseProgress(elapsed, state);
    particles.forEach((particle) => {
      if (state === AnimationState.CHAOS) {
        updateChaos(particle, elapsed, delta);
        return;
      }

      const settled = state === AnimationState.STABILIZED || state === AnimationState.DATA_FLOW;
      const target = targetFor(particle, elapsed, settled);
      if (state === AnimationState.ATTRACT) {
        applyForceTowardTarget(particle, target, delta, lerp(8, 45, progress), 0.982);
      } else if (state === AnimationState.FORM_NODES) {
        applyForceTowardTarget(particle, target, delta, lerp(45, 95, progress), 0.95);
      } else {
        applyForceTowardTarget(particle, target, delta, 68, 0.92);
      }
    });
  };

  const drawConnections = (elapsed, state) => {
    if ([AnimationState.CHAOS, AnimationState.ATTRACT, AnimationState.FORM_NODES].includes(state)) return;
    const phaseProgress = state === AnimationState.CONNECT ? getPhaseProgress(elapsed, state) : 1;
    context.strokeStyle = palette.connection;
    context.lineWidth = 1.75;

    CONNECTIONS.forEach(([fromIndex, toIndex], index) => {
      const edgeProgress = clamp(phaseProgress * CONNECTIONS.length - index, 0, 1);
      if (edgeProgress <= 0) return;
      const from = nodes[fromIndex];
      const to = nodes[toIndex];
      context.globalAlpha = 0.16 + edgeProgress * 0.24;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(lerp(from.x, to.x, easeInOutCubic(edgeProgress)), lerp(from.y, to.y, easeInOutCubic(edgeProgress)));
      context.stroke();
    });
  };

  const drawNodeGeometry = (elapsed, state) => {
    if ([AnimationState.CHAOS, AnimationState.ATTRACT].includes(state)) return;
    const visibility = state === AnimationState.FORM_NODES ? getPhaseProgress(elapsed, state) : 1;
    nodes.forEach((node) => {
      const pulse = node.primary ? Math.sin(elapsed * 1.1) * 1.2 : Math.sin(elapsed * 0.55 + node.x) * 0.55;
      context.globalAlpha = 0.12 * visibility;
      context.strokeStyle = node.data ? palette.accent : palette.primary;
      context.lineWidth = node.primary ? 2.5 : 1.8;
      context.beginPath();
      context.arc(node.x, node.y, node.radius + 8 + pulse, 0, TAU);
      context.stroke();

      if (node.primary) {
        context.globalAlpha = 0.08 * visibility;
        context.beginPath();
        context.arc(node.x, node.y, node.radius + 18 - pulse, 0, TAU);
        context.stroke();
      }
    });
  };

  const drawParticles = (state) => {
    const organized = state !== AnimationState.CHAOS && state !== AnimationState.ATTRACT;
    particles.forEach((particle) => {
      const node = nodes[particle.nodeIndex];
      context.globalAlpha = organized ? 0.62 : 0.34;
      context.fillStyle = node?.primary ? palette.primary : node?.data ? palette.accent : palette.particle;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, TAU);
      context.fill();
    });
  };

  const drawPackets = (elapsed, state) => {
    if (![AnimationState.DATA_FLOW, AnimationState.STABILIZED].includes(state)) return;
    const visibility = state === AnimationState.DATA_FLOW ? getPhaseProgress(elapsed, state) : 1;
    CONNECTIONS.forEach(([fromIndex, toIndex], index) => {
      const from = nodes[fromIndex];
      const to = nodes[toIndex];
      const travel = (elapsed * (0.075 + (index % 3) * 0.012) + index * 0.19) % 1;
      const easedTravel = smoothstep(travel);
      context.globalAlpha = visibility * (0.55 + Math.sin(travel * Math.PI) * 0.25);
      context.fillStyle = index % 3 === 0 ? palette.accent : palette.primary;
      context.beginPath();
      context.arc(lerp(from.x, to.x, easedTravel), lerp(from.y, to.y, easedTravel), 3, 0, TAU);
      context.fill();
    });
  };

  const drawApiOrbit = (elapsed, state) => {
    if ([AnimationState.CHAOS, AnimationState.ATTRACT, AnimationState.FORM_NODES].includes(state)) return;
    const api = nodes[1];
    for (let index = 0; index < 3; index += 1) {
      const angle = elapsed * 0.28 + index * (TAU / 3);
      context.globalAlpha = 0.65;
      context.fillStyle = palette.primary;
      context.beginPath();
      context.arc(api.x + Math.cos(angle) * (api.radius + 18), api.y + Math.sin(angle) * (api.radius + 18), 2.7, 0, TAU);
      context.fill();
    }
  };

  function render(elapsed) {
    const state = getAnimationState(elapsed, reducedMotion);
    context.clearRect(0, 0, width, height);
    drawConnections(elapsed, state);
    drawNodeGeometry(elapsed, state);
    drawParticles(state);
    drawPackets(elapsed, state);
    drawApiOrbit(elapsed, state);
    context.globalAlpha = 1;
  }

  const tick = (timestamp) => {
    if (!startTime) {
      startTime = timestamp;
      previousTime = timestamp;
    }
    const elapsed = (timestamp - startTime) / 1000;
    const delta = Math.min(0.032, (timestamp - previousTime) / 1000 || 0.016);
    previousTime = timestamp;
    updateParticles(elapsed, delta, getAnimationState(elapsed));
    render(elapsed);
    frameId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (frameId) return;
    if (reducedMotion) {
      render(STABILIZED_TIME);
      return;
    }
    startTime = 0;
    previousTime = 0;
    frameId = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
  };

  const setReducedMotion = (nextValue) => {
    stop();
    reducedMotion = nextValue;
    createParticles();
    start();
  };

  const setPalette = (nextPalette) => {
    palette = { ...palette, ...nextPalette };
    if (reducedMotion) render(STABILIZED_TIME);
  };

  return { resize, start, stop, destroy: stop, setReducedMotion, setPalette };
}
