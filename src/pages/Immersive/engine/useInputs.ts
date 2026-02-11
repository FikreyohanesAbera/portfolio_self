import { useEffect, useRef } from "react"
import { Action } from "./stateMachine"
import { ImmersiveModel, StationId, TravelPlan, WorldGraph } from "./types"
import { applyScrollImpulse } from "./physics"
import { findEdge } from "./worldGraph"

export function useInputs(args: {
  graph: WorldGraph
  model: ImmersiveModel
  dispatch: (a: Action) => void
  onImpulse: (impulse: number) => void
}) {
  const { graph, model, dispatch, onImpulse } = args
  const wheelLocked = useRef(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "m" || e.key === "M") {
        e.preventDefault()
        if (model.state === "MAP") dispatch({ type: "CLOSE_MAP" })
        else dispatch({ type: "OPEN_MAP" })
      }

      if (e.key === "Escape") {
        if (model.state === "MAP") dispatch({ type: "CLOSE_MAP" })
      }

      // Keyboard throttle in TRAVEL/DOCKING
      if (model.state === "TRAVEL" || model.state === "DOCKING") {
        if (e.key === "ArrowUp") {
          e.preventDefault()
          onImpulse(0.06)
        }
        if (e.key === "ArrowDown") {
          e.preventDefault()
          onImpulse(-0.06)
        }
      }

      // Hub selection
      if (model.state === "HUB") {
        if (e.key === "Enter") {
          e.preventDefault()
          const plan = buildPlan(graph, model.dockedAt, model.selectedStationInHub)
          dispatch({ type: "REQUEST_TRAVEL", plan })
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault()
          cycleHubSelection(dispatch, model.selectedStationInHub, -1)
        }
        if (e.key === "ArrowRight") {
          e.preventDefault()
          cycleHubSelection(dispatch, model.selectedStationInHub, +1)
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dispatch, graph, model.dockedAt, model.selectedStationInHub, model.state, onImpulse])

  useEffect(() => {
    function onWheel(e: WheelEvent) {
      if (model.state === "TRAVEL" || model.state === "DOCKING") {
        // Prevent page scroll while traveling.
        e.preventDefault()
        const impulse = applyScrollImpulse(model, e.deltaY)
        onImpulse(impulse)
        return
      }

      // HUB: allow default scroll (page does not scroll anyway), but we can keep it passive.
      // READING: content panel should scroll naturally, so do not prevent default.
      // MAP: prevent scroll to avoid accidental page scroll.
      if (model.state === "MAP") {
        e.preventDefault()
      }
    }

    // Non-passive because we conditionally prevent default.
    window.addEventListener("wheel", onWheel, { passive: false })
    return () => window.removeEventListener("wheel", onWheel as any)
  }, [model, onImpulse])

  useEffect(() => {
    // Guard against accidental browser back swipe or overscroll patterns in some environments.
    wheelLocked.current = model.state === "TRAVEL" || model.state === "DOCKING"
  }, [model.state])
}

function buildPlan(graph: WorldGraph, from: StationId, to: StationId): TravelPlan {
  const e = findEdge(graph, from, to)
  return { from, to, edgeId: e.id }
}

function cycleHubSelection(dispatch: (a: Action) => void, current: StationId, dir: -1 | 1) {
  const options: StationId[] = ["education", "work", "projects", "tools"]
  const idx = options.indexOf(current)
  const next = options[(idx + dir + options.length) % options.length]
  dispatch({ type: "SELECT_IN_HUB", station: next })
}
