import type { ImmersiveModel, StationId, TravelPlan, ImmersiveState } from "./types"

export type Action =
  | { type: "SET_REDUCED_MOTION"; value: boolean }
  | { type: "TOGGLE_EXPRESS" }
  | { type: "OPEN_MAP" }
  | { type: "CLOSE_MAP" }
  | { type: "REQUEST_TRAVEL"; plan: TravelPlan }
  | { type: "TICK_MOTION"; nextT: number; nextV: number }
  | { type: "DOCKED" }
  | { type: "SKIP_TRAVEL_TO_DOCK" }
  | { type: "DEPART" }

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

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

export function reducer(state: ImmersiveModel, action: Action): ImmersiveModel {
  switch (action.type) {
    case "SET_REDUCED_MOTION":
      return { ...state, reducedMotion: action.value }

    case "TOGGLE_EXPRESS":
      return { ...state, express: !state.express }

    case "OPEN_MAP":
      return {
        ...state,
        stateBeforeMap: state.state,
        state: "MAP"
      }

    case "CLOSE_MAP":
      return {
        ...state,
        state: state.stateBeforeMap ?? (state.plan ? "TRAVEL" : "READING"),
        stateBeforeMap: null
      }

    case "REQUEST_TRAVEL": {
      const baseCruise = state.express ? 0.10 : 0.07

      return {
        ...state,
        state: "TRAVEL",
        plan: action.plan,
        // While traveling, dockedAt can remain where we were parked.
        // We update dockedAt when we actually dock.
        motion: {
          progressT: 0,
          velocity: baseCruise
        }
      }
    }

    case "TICK_MOTION": {
      // If we are very near the end, switch to DOCKING for the last segment.
      const nextT = clamp01(action.nextT)
      const nextV = action.nextV

      let nextState: ImmersiveState = state.state
      if (state.plan) {
        if (nextT >= 0.86 && (state.state === "TRAVEL" || state.state === "HUB")) {
          nextState = "DOCKING"
        }
      }

      return {
        ...state,
        state: nextState,
        motion: { progressT: nextT, velocity: nextV }
      }
    }

    case "SKIP_TRAVEL_TO_DOCK": {
      if (!state.plan) return state
      return {
        ...state,
        state: "READING",
        dockedAt: state.plan.to,
        motion: { progressT: 1, velocity: 0 },
        plan: null
      }
    }

    case "DOCKED": {
      if (!state.plan) return state
      return {
        ...state,
        state: "READING",
        dockedAt: state.plan.to,
        motion: { progressT: 1, velocity: 0 },
        plan: null
      }
    }

    case "DEPART": {
      // Leave reading mode but remain docked at the current station.
      // This re-enables navigation buttons without starting travel automatically.
      return {
        ...state,
        state: "HUB",
        plan: null,
        motion: { progressT: 0, velocity: 0 }
      }
    }


    default:
      return state
  }
}
