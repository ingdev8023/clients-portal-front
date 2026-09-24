export const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export const lerp = (start, end, amount) => start + (end - start) * amount;

export const magnitude = (x, y) => Math.hypot(x, y);

export function normalize(x, y) {
  const length = magnitude(x, y);
  return length > 0.0001 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
}

export const easeInOutCubic = (value) => (
  value < 0.5 ? 4 * value * value * value : 1 - ((-2 * value + 2) ** 3) / 2
);

export const smoothstep = (value) => {
  const bounded = clamp(value, 0, 1);
  return bounded * bounded * (3 - 2 * bounded);
};

export const randomRange = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);
