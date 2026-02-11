import type { StationId, WorldEdge, WorldNode } from "./types"

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

function hash01(s: string) {
  // deterministic pseudo-random in [0,1)
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // >>> 0 to force unsigned
  return ((h >>> 0) % 100000) / 100000
}

export function makeCubicControls(fromId: StationId, toId: StationId, a: { x: number; z: number }, b: { x: number; z: number }) {
  const dx = b.x - a.x
  const dz = b.z - a.z
  const dist = Math.hypot(dx, dz) || 1

  // Unit direction
  const ux = dx / dist
  const uz = dz / dist

  // Perpendicular (left-hand)
  const px = -uz
  const pz = ux

  // A per-edge seed that changes curvature, twist, and side.
  const seed = hash01(`${fromId}->${toId}`)

  // Side chooses left/right, magnitude controls how "arched" it feels.
  const side = seed < 0.5 ? -1 : 1

  // Curvature magnitude: ~20% to ~55% of distance
  const mag = dist * (0.20 + 0.35 * hash01(`mag:${fromId}->${toId}`))

  // Asymmetry: control points are not symmetric, so the arc feels unique.
  const t1 = 0.28 + 0.10 * hash01(`t1:${fromId}->${toId}`)
  const t2 = 0.72 - 0.10 * hash01(`t2:${fromId}->${toId}`)

  // Small "twist" adds character without making rails kink.
  const twist = dist * (0.06 * (hash01(`tw:${fromId}->${toId}`) - 0.5))

  const c1 = {
    x: a.x + dx * t1 + px * side * (mag * 0.85) + ux * twist,
    z: a.z + dz * t1 + pz * side * (mag * 0.85) + uz * twist
  }

  const c2 = {
    x: a.x + dx * t2 + px * side * (mag * 1.00) - ux * twist,
    z: a.z + dz * t2 + pz * side * (mag * 1.00) - uz * twist
  }

  return { c1, c2 }
}

export function cubicBezier2D(p0: { x: number; z: number }, c1: { x: number; z: number }, c2: { x: number; z: number }, p3: { x: number; z: number }, tRaw: number) {
  const t = clamp01(tRaw)
  const u = 1 - t

  const b0 = u * u * u
  const b1 = 3 * u * u * t
  const b2 = 3 * u * t * t
  const b3 = t * t * t

  return {
    x: b0 * p0.x + b1 * c1.x + b2 * c2.x + b3 * p3.x,
    z: b0 * p0.z + b1 * c1.z + b2 * c2.z + b3 * p3.z
  }
}

export function evalEdgePosition(edge: WorldEdge, fromNode: WorldNode, toNode: WorldNode, t: number) {
  return cubicBezier2D(fromNode.pos, edge.c1, edge.c2, toNode.pos, t)
}

export function reverseControls(edge: { c1: { x: number; z: number }; c2: { x: number; z: number } }) {
  // When reversing travel direction, swap control points so the same curve is traversed backwards.
  return { c1: edge.c2, c2: edge.c1 }
}
