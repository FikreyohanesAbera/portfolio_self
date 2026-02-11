export type CoreStationId = "hub" | "education" | "work" | "projects" | "tools"
export type StationId = CoreStationId | `project:${string}`

export type ImmersiveState = "HUB" | "TRAVEL" | "DOCKING" | "READING" | "MAP"

export type Motion = {
  progressT: number // [0..1]
  velocity: number
}

export type TravelPlan = {
  from: StationId
  to: StationId
  edgeId: string
  transferTo?: StationId
}

export type WorldNode = {
  id: StationId
  label: string
  kind: "hub" | "district" | "project"
  pos: { x: number; z: number }
}

export type WorldEdge = {
  id: string
  from: StationId
  to: StationId

  // Cubic Bézier controls in x/z plane (y is handled in the three dimensional layer).
  // The curve is: P0(start) -> C1 -> C2 -> P3(end)
  c1: { x: number; z: number }
  c2: { x: number; z: number }
}

export type WorldGraph = {
  nodes: WorldNode[]
  edges: WorldEdge[]
}

export type ImmersiveModel = {
  state: ImmersiveState
  dockedAt: StationId
  plan: TravelPlan | null

  express: boolean
  reducedMotion: boolean

  motion: Motion
  stateBeforeMap: ImmersiveState | null
}
