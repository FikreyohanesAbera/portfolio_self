import { ImmersiveModel } from "./types"

export type MotionParams = {
  minCruise: number
  maxSpeed: number
  friction: number
  impulseScale: number
  dockingFriction: number
  dockingMaxSpeed: number
  snapEpsilon: number
  snapSpeed: number
}

export function getMotionParams(model: ImmersiveModel): MotionParams {
  const baseMax = model.express ? 1.55 : 1.05
  const reducedMotion = model.reducedMotion

  return {
    minCruise: reducedMotion ? 0.0 : 0.18,
    maxSpeed: reducedMotion ? 4.0 : baseMax,
    friction: reducedMotion ? 6.0 : 2.5,
    impulseScale: reducedMotion ? 0.0026 : 0.0016,
    dockingFriction: 4.2,
    dockingMaxSpeed: reducedMotion ? 0.6 : 0.45,
    snapEpsilon: 0.012,
    snapSpeed: 0.12
  }
}

export function applyScrollImpulse(model: ImmersiveModel, deltaY: number): number {
  // Wheel delta convention: positive is scroll down.
  // We map scroll down to accelerate forward, scroll up to brake.
  const p = getMotionParams(model)
  const raw = -deltaY
  const clamped = Math.max(-180, Math.min(180, raw))
  return clamped * p.impulseScale
}

export function stepMotion(
  model: ImmersiveModel,
  dtSeconds: number,
  impulse: number,
  brakeZone: number // 0..1 where 1 is deep in brake zone
): { nextT: number; nextV: number } {
  const p = getMotionParams(model)

  const v0 = model.motion.velocity
  const t0 = model.motion.progressT

  // Brake zone reduces maximum speed smoothly.
  const brakeMax = lerp(p.maxSpeed, p.dockingMaxSpeed, smoothstep(0, 1, brakeZone))
  const maxSpeed = Math.max(0, brakeMax)

  // Acceleration from impulse.
  let v = v0 + impulse

  // Enforce minimum cruise while traveling forward, unless reduced motion.
  if (!model.reducedMotion && (model.state === "TRAVEL" || model.state === "DOCKING")) {
    if (v > 0 && v < p.minCruise) v = p.minCruise
  }

  // Friction: stronger in docking state and near station.
  const friction = model.state === "DOCKING" ? p.dockingFriction : p.friction
  v = v * Math.exp(-friction * dtSeconds)

  // Clamp
  v = Math.max(-maxSpeed, Math.min(maxSpeed, v))

  // Integrate progress.
  let t = t0 + v * dtSeconds

  // Clamp t
  t = Math.max(0, Math.min(1, t))

  // Soft snap near station if slow.
  const distToEnd = 1 - t
  if (distToEnd < p.snapEpsilon && Math.abs(v) < p.snapSpeed) {
    t = 1
    v = 0
  }

  return { nextT: t, nextV: v }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}
