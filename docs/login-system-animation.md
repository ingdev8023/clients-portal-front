# Login system animation

## Architecture

The login background uses the native Canvas API. React mounts one decorative
`SystemAnimation` component, while `animationEngine.js` owns all mutable particle
data and the `requestAnimationFrame` loop. Particle positions never enter React
state, so a rendered frame does not cause a component render.

The layers are:

1. Login page background color.
2. Non-interactive Canvas (`pointer-events: none`).
3. A restrained color overlay.
4. The existing login panel and preference controls.

The engine is split into:

- `math.js`: small vector, interpolation, easing, and clamping helpers.
- `config.js`: phase timing, responsive particle counts, and graph topology.
- `animationEngine.js`: simulation updates and Canvas drawing.
- `SystemAnimation.jsx`: React setup, resize, theme, reduced-motion, and cleanup.

## Coordinate system

Canvas coordinates begin at the top-left. Positive `x` moves right and positive
`y` moves down. Service locations are stored as proportions such as `{ x: 0.5,
y: 0.3 }`, then converted to pixels with `x * width` and `y * height`. This keeps
the topology proportional on phones, tablets, and desktops.

## Position, velocity, and acceleration

Each particle stores position (`x`, `y`) and velocity (`vx`, `vy`). During each
frame, a force changes velocity and velocity changes position:

```text
velocity += acceleration * deltaTime
position += velocity * deltaTime
```

Using elapsed seconds makes the simulation much less dependent on refresh rate.
The frame delta is capped at 32 ms so returning to a backgrounded tab cannot
produce a large physics jump.

## Vectors, magnitude, and normalization

For a particle at `position` moving toward `target`, the engine calculates:

```text
direction = target - position
distance = sqrt(direction.x² + direction.y²)
unitDirection = direction / distance
```

`normalize()` produces the unit direction. The engine can then control the force
strength independently from distance.

## Attraction and damping

The attraction acceleration is:

```js
Math.min(190, strength + distance * 0.11)
```

Far particles receive more help, while the cap prevents unstable speeds. The
phase changes `strength`: attraction begins gently, then node formation becomes
firmer. After acceleration, velocity is multiplied by:

```js
damping ** (delta * 60)
```

That removes energy consistently across frame rates. Visually, particles settle
around their service instead of crossing it forever.

## Chaos and organized motion

Chaos uses combined sine and cosine fields based on time, particle seed, and
position. This creates curved directional changes without per-frame random jitter.
Once attraction begins, every particle has an assigned service node and a target
angle/radius calculated with polar coordinates:

```text
x = node.x + cos(angle) * radius
y = node.y + sin(angle) * radius
```

In the stable phase, the target angle rotates slowly and radius receives a small
sine offset. The system therefore looks alive without losing its structure.

## Connections and packets

The graph deliberately connects client to API, API to three services, and those
services to the database. It is not an all-to-all network. Connections grow with
`lerp(start, end, easedProgress)`.

Packets reuse the same interpolation. A repeating value in `[0, 1]` identifies
where a packet sits on an edge:

```text
x = lerp(start.x, end.x, t)
y = lerp(start.y, end.y, t)
```

Only one subtle packet per edge is drawn. Slight speed offsets prevent all traffic
from moving in lockstep.

## State machine

The phase table in `config.js` drives behavior:

```text
CHAOS       0.0–2.4 s   controlled unstructured movement
ATTRACT     2.4–5.2 s   service attractors become influential
FORM_NODES  5.2–7.6 s   particles settle into rings and clusters
CONNECT     7.6–9.8 s   deliberate graph edges emerge
DATA_FLOW   9.8–12.0 s  packets begin crossing those edges
STABILIZED  12.0 s+     quiet orbiting, breathing, and data flow
```

Reduced-motion users skip directly to a single rendered stable frame with no
animation loop.

## Why Canvas

This is a two-dimensional mathematical simulation with many moving marks. Canvas
provides direct drawing control without adding a dependency or creating dozens of
DOM nodes. Three.js and WebGL would add complexity without improving this version.

## Performance and lifecycle

- Particle counts are 46 on mobile, 76 on tablet, and 118 on desktop.
- Work is linear per frame; there are no particle-to-particle comparisons.
- Device pixel ratio is capped at 2.
- Reusable particle objects avoid per-frame React state and DOM allocation.
- `ResizeObserver` updates dimensions without reading layout every frame.
- Theme changes replace the palette without restarting the simulation.
- Startup is guarded so one engine cannot schedule duplicate frame loops.
- Unmount cancels the frame and disconnects resize, theme, and media listeners.

## Future experiments

Possible later iterations include a coherent flow field, simplex noise, restrained
trails, generated graph topology, or a WebGL/shader version for much larger
particle counts. They are intentionally excluded from this Canvas iteration.
