import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnimationState } from '../src/components/SystemAnimation/config';
import { createSystemAnimation, getAnimationState, getPhaseProgress } from '../src/components/SystemAnimation/animationEngine';
import { clamp, easeInOutCubic, lerp, magnitude, normalize } from '../src/components/SystemAnimation/math';

afterEach(() => vi.unstubAllGlobals());

describe('system animation mathematics', () => {
  it('provides bounded vector and interpolation helpers', () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
    expect(magnitude(3, 4)).toBe(5);
    expect(normalize(3, 4)).toEqual({ x: 0.6, y: 0.8 });
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
  });

  it('moves through the explicit phase state machine', () => {
    expect(getAnimationState(0)).toBe(AnimationState.CHAOS);
    expect(getAnimationState(2.5)).toBe(AnimationState.ATTRACT);
    expect(getAnimationState(5.5)).toBe(AnimationState.FORM_NODES);
    expect(getAnimationState(8)).toBe(AnimationState.CONNECT);
    expect(getAnimationState(10)).toBe(AnimationState.DATA_FLOW);
    expect(getAnimationState(13)).toBe(AnimationState.STABILIZED);
    expect(getAnimationState(0, true)).toBe(AnimationState.STABILIZED);
    expect(getPhaseProgress(8.7, AnimationState.CONNECT)).toBeCloseTo(0.5, 1);
  });
});

describe('system animation lifecycle', () => {
  it('starts one frame loop and cancels it during cleanup', () => {
    const context = {
      setTransform: vi.fn(), clearRect: vi.fn(), beginPath: vi.fn(), arc: vi.fn(),
      fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    };
    const canvas = { getContext: () => context, style: {} };
    const requestFrame = vi.fn(() => 42);
    const cancelFrame = vi.fn();
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    vi.stubGlobal('cancelAnimationFrame', cancelFrame);
    vi.stubGlobal('devicePixelRatio', 3);

    const engine = createSystemAnimation(canvas);
    engine.resize(800, 600);
    engine.start();
    engine.start();

    expect(requestFrame).toHaveBeenCalledTimes(1);
    expect(canvas.width).toBe(1600);
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    engine.destroy();
    expect(cancelFrame).toHaveBeenCalledWith(42);
  });

  it('renders the stable graph without scheduling motion when reduced motion is enabled', () => {
    const context = {
      setTransform: vi.fn(), clearRect: vi.fn(), beginPath: vi.fn(), arc: vi.fn(),
      fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    };
    const canvas = { getContext: () => context, style: {} };
    const requestFrame = vi.fn(() => 7);
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    vi.stubGlobal('devicePixelRatio', 1);

    const engine = createSystemAnimation(canvas, { reducedMotion: true });
    engine.resize(390, 844);
    engine.start();

    expect(requestFrame).not.toHaveBeenCalled();
    expect(context.stroke).toHaveBeenCalled();
    expect(context.fill).toHaveBeenCalled();
  });
});
