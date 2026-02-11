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

  // If direct travel is not possible, we route via hub:
  // leg 1 ends at hub, then we auto-continue to transferTo.
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
  control: { x: number; z: number }
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

  // Used only for returning from MAP to the prior state.
  stateBeforeMap: ImmersiveState | null
}
