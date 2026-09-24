export const AnimationState = Object.freeze({
  CHAOS: 'chaos',
  ATTRACT: 'attract',
  FORM_NODES: 'form_nodes',
  CONNECT: 'connect',
  DATA_FLOW: 'data_flow',
  STABILIZED: 'stabilized',
});

export const PHASES = Object.freeze([
  { state: AnimationState.CHAOS, start: 0, end: 2.4 },
  { state: AnimationState.ATTRACT, start: 2.4, end: 5.2 },
  { state: AnimationState.FORM_NODES, start: 5.2, end: 7.6 },
  { state: AnimationState.CONNECT, start: 7.6, end: 9.8 },
  { state: AnimationState.DATA_FLOW, start: 9.8, end: 12 },
  { state: AnimationState.STABILIZED, start: 12, end: Number.POSITIVE_INFINITY },
]);

export const STABILIZED_TIME = 14;

export const CONNECTIONS = Object.freeze([
  [0, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [3, 5],
  [4, 5],
]);

export function particleCountForWidth(width) {
  if (width < 480) return 46;
  if (width < 900) return 76;
  return 118;
}

// Coordinates are normalized so the same topology scales from phones to wide displays.
export const NODE_LAYOUT = Object.freeze([
  { id: 'client', x: 0.5, y: 0.1, scale: 0.72 },
  { id: 'api', x: 0.5, y: 0.3, scale: 1.05, primary: true },
  { id: 'service-a', x: 0.16, y: 0.53, scale: 0.82 },
  { id: 'service-b', x: 0.5, y: 0.57, scale: 0.82 },
  { id: 'service-c', x: 0.84, y: 0.53, scale: 0.82 },
  { id: 'database', x: 0.5, y: 0.86, scale: 0.94, data: true },
]);
