import type { ImmersiveModel, ImmersiveState, StationId, TravelPlan } from "./types"

export function createInitialModel(): ImmersiveModel {
  return {
    state: "HUB",
    dockedAt: "hub",
    plan: null,

    express: false,
    reducedMotion: false,

    motion: { progressT: 0, velocity: 0 },

    stateBeforeMap: null
  }
}

type Action =
  | { type: "SET_REDUCED_MOTION"; value: boolean }
  | { type: "TOGGLE_EXPRESS" }
  | { type: "OPEN_MAP" }
  | { type: "CLOSE_MAP" }
  | { type: "REQUEST_TRAVEL"; plan: TravelPlan }
  | { type: "TICK_MOTION"; nextT: number; nextV: number }
  | { type: "DOCKED" }
  | { type: "SKIP_TRAVEL_TO_DOCK" }
  | { type: "DEPART" }
  | { type: "SET_DOCKED"; at: StationId }

export function reducer(state: ImmersiveModel, action: Action): ImmersiveModel {
  switch (action.type) {
    case "SET_REDUCED_MOTION":
      return { ...state, reducedMotion: action.value }

    case "TOGGLE_EXPRESS":
      return { ...state, express: !state.express }

    case "OPEN_MAP": {
      if (state.state === "MAP") return state
      return {
        ...state,
        stateBeforeMap: state.state,
        state: "MAP",
        motion: { ...state.motion, velocity: 0 }
      }
    }

    case "CLOSE_MAP": {
      if (state.state !== "MAP") return state
      const back: ImmersiveState = state.stateBeforeMap ?? "READING"
      return { ...state, state: back, stateBeforeMap: null }
    }

    case "REQUEST_TRAVEL": {
      // When starting a new leg, reset progress and give it a small initial cruise speed.
      // We keep dockedAt as the current station until DOCKED.
      return {
        ...state,
        state: "TRAVEL",
        plan: action.plan,
        motion: { progressT: 0, velocity: state.express ? 0.42 : 0.28 },
        stateBeforeMap: null
      }
    }

    case "TICK_MOTION": {
      if (!state.plan) return state
      return {
        ...state,
        motion: { progressT: action.nextT, velocity: action.nextV }
      }
    }

    case "SKIP_TRAVEL_TO_DOCK": {
      if (!state.plan) return state
      return {
        ...state,
        state: "READING",
        dockedAt: state.plan.to,
        motion: { progressT: 1, velocity: 0 }
      }
    }

    case "DOCKED": {
      if (!state.plan) return state
      return {
        ...state,
        state: "READING",
        dockedAt: state.plan.to,
        motion: { progressT: 1, velocity: 0 }
      }
    }

    case "DEPART": {
      // "Depart" is intentionally not an automatic travel without a destination.
      // Returning to HUB makes the controls feel responsive.
      if (state.state !== "READING") return state
      return { ...state, state: "HUB" }
    }

    case "SET_DOCKED":
      return { ...state, dockedAt: action.at }

    default:
      return state
  }
}
