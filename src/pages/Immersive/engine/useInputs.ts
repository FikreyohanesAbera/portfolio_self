import { useEffect } from "react"
import type { Action } from "./stateMachine"
import type { ImmersiveModel, StationId, TravelPlan, WorldGraph } from "./types"
import { applyScrollImpulse } from "./physics"
import { tryFindEdge } from "./worldGraph"

/**
 * Inputs:
 * - M toggles map
 * - Escape closes map
 * - During TRAVEL/DOCKING: wheel and Arrow keys control throttle (impulses)
 * - During READING: wheel scrolls panel naturally (we do NOT preventDefault)
 * - During MAP: wheel does nothing (preventDefault)
 */
export function useInputs(args: {
  graph: WorldGraph
  model: ImmersiveModel
  dispatch: (a: Action) => void
  onImpulse: (impulse: number) => void
  onRequestTravel: (to: StationId) => void
}) {
  const { model, dispatch, onImpulse, onRequestTravel } = args

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Map toggle
      if (e.key === "m" || e.key === "M") {
        e.preventDefault()
        if (model.state === "MAP") dispatch({ type: "CLOSE_MAP" } as any)
        else dispatch({ type: "OPEN_MAP" } as any)
        return
      }

      // Escape closes map
      if (e.key === "Escape") {
        if (model.state === "MAP") {
          e.preventDefault()
          dispatch({ type: "CLOSE_MAP" } as any)
        }
        return
      }

      // Keyboard throttle in TRAVEL/DOCKING
      if (model.state === "TRAVEL" || model.state === "DOCKING") {
        if (e.key === "ArrowUp") {
          e.preventDefault()
          onImpulse(0.08)
          return
        }
        if (e.key === "ArrowDown") {
          e.preventDefault()
          onImpulse(-0.08)
          return
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dispatch, model.state, onImpulse])

  useEffect(() => {
    function onWheel(e: WheelEvent) {
      if (model.state === "TRAVEL" || model.state === "DOCKING") {
        // Prevent page scroll while traveling.
        e.preventDefault()
        const impulse = applyScrollImpulse(e.deltaY)
        onImpulse(impulse)
        return
      }

      // MAP: prevent scroll so the page does not move behind the overlay.
      if (model.state === "MAP") {
        e.preventDefault()
        return
      }

      // HUB: allow default (no page scroll usually)
      // READING: allow default so the panel content scrolls.
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    return () => window.removeEventListener("wheel", onWheel as any)
  }, [model.state, onImpulse])
}
