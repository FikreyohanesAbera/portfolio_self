import React from "react"
import { Suspense, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Color, Vector3 } from "three"
import { Environment } from "@react-three/drei"

import styles from "./SceneRoot.module.css"
import { buildWorldGraph, findEdge, findNode } from "../engine/worldGraph"
import { createInitialModel, reducer } from "../engine/stateMachine"
import { stepMotion } from "../engine/physics"
import { evaluatePerf } from "../engine/perf"
import { useInputs } from "../engine/useInputs"
import { ImmersiveModel, StationId, TravelPlan } from "../engine/types"

import HubScene from "./HubScene"
import Rails from "./Rails"
import Trolley from "./Trolley"
import MapOverlay from "../ui/MapOverlay"
import HologramPanel from "../ui/HologramPanel"

type Props = {
  reducedMotion: boolean
}

export default function SceneRoot({ reducedMotion }: Props) {
  const graph = useMemo(() => buildWorldGraph(), [])
  const [model, dispatch] = useReducer(reducer, undefined, createInitialModel)
  const [impulseAccum, setImpulseAccum] = useState(0)

  const { invalidate, camera } = useThree()

  // Performance sampling (development only shows overlay; production uses gentle suggestion).
  const perfSamples = useRef<number[]>([])
  const perfT0 = useRef(performance.now())
  const [perfHint, setPerfHint] = useState<{ show: boolean; avgMs: number }>({ show: false, avgMs: 0 })

  // Lazy-loaded district modules (loaded on first visit).
  const [districtLoaded, setDistrictLoaded] = useState<Record<string, boolean>>({
    education: false,
    work: false,
    projects: false,
    tools: false
  })

  useEffect(() => {
    dispatch({ type: "SET_REDUCED_MOTION", value: reducedMotion })
  }, [reducedMotion])

  // Input handling and impulse injection
  useInputs({
    graph,
    model,
    dispatch,
    onImpulse: (impulse) => {
      setImpulseAccum((v) => v + impulse)
      invalidate()
    }
  })

  // Drive rendering on demand when travel or animation is active.
  useEffect(() => {
    let raf = 0
    const animate = () => {
      if (model.state === "TRAVEL" || model.state === "DOCKING") {
        invalidate()
        raf = requestAnimationFrame(animate)
        return
      }
      if (model.state === "HUB" && !model.reducedMotion) {
        // Subtle ambient hub orbit
        invalidate()
        raf = requestAnimationFrame(animate)
        return
      }
      // READING or MAP: render only on interactions.
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [invalidate, model.reducedMotion, model.state])

  // Lighting and background per station/project theme.
  const backgroundColor = useMemo(() => new Color("#070a10"), [])
  useEffect(() => {
    // Basic route: project nodes can tint environment in a subtle way.
    if (model.dockedAt.startsWith("project:")) {
      const projId = model.dockedAt.split(":")[1]
      // Theme is applied in HologramPanel via CSS; here we keep 3d subtle.
      backgroundColor.set("#070a10")
      return
    }
    backgroundColor.set("#070a10")
  }, [backgroundColor, model.dockedAt])

  // Load district scene module when first arriving.
  useEffect(() => {
    const to = model.plan?.to
    if (!to) return
    if (to === "education" || to === "work" || to === "projects" || to === "tools") {
      setDistrictLoaded((s) => ({ ...s, [to]: true }))
    }
  }, [model.plan?.to])

  // Travel plan request helpers
  function requestTravel(from: StationId, to: StationId) {
    const e = findEdge(graph, from, to)
    const plan: TravelPlan = { from, to, edgeId: e.id }
    dispatch({ type: "REQUEST_TRAVEL", plan })
    invalidate()
  }

  // Motion + docking logic
  useFrame((_, dt) => {
    // perf sampling
    const now = performance.now()
    const frameMs = now - perfT0.current
    perfT0.current = now
    perfSamples.current.push(frameMs)
    if (perfSamples.current.length === 120) {
      const { avgFrameMs, recommendedMinimal } = evaluatePerf(perfSamples.current)
      if (recommendedMinimal) setPerfHint({ show: true, avgMs: avgFrameMs })
      perfSamples.current = []
    }

    // HUB: parked. Subtle orbit.
    if (model.state === "HUB") {
      if (!model.reducedMotion) {
        const t = performance.now() * 0.00015
        const r = 7.5
        const cx = Math.cos(t) * r
        const cz = Math.sin(t) * r
        camera.position.lerp(new Vector3(cx, 2.8, cz), 0.04)
        camera.lookAt(0, 1.1, 0)
      } else {
        camera.position.lerp(new Vector3(0, 2.6, 7.6), 0.06)
        camera.lookAt(0, 1.1, 0)
      }
      return
    }

    if (!model.plan) return

    const fromNode = findNode(graph, model.plan.from)
    const toNode = findNode(graph, model.plan.to)

    // Brake zone: last 15% of travel.
    const brakeZone = clamp01((model.motion.progressT - 0.85) / 0.15)

    const { nextT, nextV } = stepMotion(model, dt, impulseAccum, brakeZone)

    if (nextT !== model.motion.progressT || nextV !== model.motion.velocity) {
      dispatch({ type: "TICK_MOTION", nextT, nextV })
    }

    // Consume impulse gradually; keep it simple.
    if (impulseAccum !== 0) setImpulseAccum((v) => v * 0.55)

    // Docking state transition
    if (nextT >= 1 && model.state !== "READING") {
      dispatch({ type: "DOCKED" })
    }

    // Camera: guided follow with look-ahead on speed.
    const travelPos = evalQuadraticBezier(
      fromNode.pos.x, fromNode.pos.z,
      model.plan.edgeId,
      toNode.pos.x, toNode.pos.z,
      nextT,
      graph
    )
    const speed = Math.abs(nextV)
    const lookAhead = 1.2 + speed * 2.6
    const forward = evalQuadraticBezier(
      fromNode.pos.x, fromNode.pos.z,
      model.plan.edgeId,
      toNode.pos.x, toNode.pos.z,
      clamp01(nextT + 0.04),
      graph
    )

    const desiredCam = new Vector3(
      travelPos.x - (forward.x - travelPos.x) * lookAhead,
      2.4 + speed * 0.25,
      travelPos.z - (forward.z - travelPos.z) * lookAhead
    )

    // Focus camera while reading: stable framing.
    if (model.state === "READING" || model.state === "MAP") {
      const stable = new Vector3(toNode.pos.x, 2.6, toNode.pos.z + 7.2)
      camera.position.lerp(stable, model.reducedMotion ? 0.22 : 0.09)
      camera.lookAt(toNode.pos.x, 1.15, toNode.pos.z)
    } else {
      camera.position.lerp(desiredCam, model.reducedMotion ? 0.18 : 0.07)
      camera.lookAt(forward.x, 1.15, forward.z)
    }
  })

  const currentThemeCss = useMemo(() => {
    // Theme styling for the hologram panel and background; subtle.
    if (model.dockedAt.startsWith("project:")) {
      const projId = model.dockedAt.split(":")[1]
      const proj = requireProjectTheme(projId)
      return {
        backgroundImage: proj.backgroundGradient
      } as React.CSSProperties
    }
    return {
      backgroundImage:
        "radial-gradient(1200px 900px at 30% 10%, rgba(143,178,255,0.18) 0%, rgba(7,10,16,1) 55%, rgba(5,7,13,1) 100%)"
    } as React.CSSProperties
  }, [model.dockedAt])

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <fog attach="fog" args={["#070a10", 12, 70]} />

      {/* Soft environment without heavy textures. */}
      <Environment preset="city" />

      <Rails graph={graph} plan={model.plan} />
      <Trolley graph={graph} model={model} />

      {/* Hub scene loads immediately; districts are staged. */}
      <HubScene
        graph={graph}
        model={model}
        onSelectDistrict={(station) => requestTravel(model.dockedAt, station)}
        onSelectProject={(projectId) => requestTravel("projects", (`project:${projectId}` as StationId))}
      />

      <Suspense fallback={null}>
        {districtLoaded.education ? <LazyEducationDistrict /> : null}
        {districtLoaded.work ? <LazyWorkDistrict /> : null}
        {districtLoaded.projects ? <LazyProjectsDistrict /> : null}
        {districtLoaded.tools ? <LazyToolsDistrict /> : null}
      </Suspense>
    </>
  )
}

// District modules are dynamically imported, only loaded after first visit.
const LazyEducationDistrict = lazyOnce(() => import("./districts/EducationDistrict"))
const LazyWorkDistrict = lazyOnce(() => import("./districts/WorkDistrict"))
const LazyProjectsDistrict = lazyOnce(() => import("./districts/ProjectsDistrict"))
// const LazyToolsDistrict = lazyOnce(() => import("./districts/ToolsDistrict"))

function lazyOnce<T extends { default: React.ComponentType<any> }>(
  loader: () => Promise<T>
) {
  let mod: T | null = null
  return function LazyComp() {
    const [C, setC] = useState<React.ComponentType<any> | null>(mod?.default ?? null)
    useEffect(() => {
      if (C) return
      let alive = true
      loader().then((m) => {
        mod = m
        if (alive) setC(() => m.default)
      })
      return () => {
        alive = false
      }
    }, [C])
    return C ? <C /> : null
  }
}

function requireProjectTheme(projectId: string) {
  // Local import only (not a network fetch).
  // This is safe in immersive bundle and stays data-driven.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { projects } = require("../../../content/projects") as typeof import("../../../content/projects")
  const proj = projects.find((p) => p.id === projectId)
  return proj?.theme ?? {
    backgroundGradient:
      "radial-gradient(1200px 900px at 30% 10%, rgba(143,178,255,0.18) 0%, rgba(7,10,16,1) 55%, rgba(5,7,13,1) 100%)"
  }
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

function evalQuadraticBezier(
  x0: number,
  z0: number,
  edgeId: string,
  x2: number,
  z2: number,
  t: number,
  graph: ReturnType<typeof buildWorldGraph>
) {
  const e = graph.edges.find((ed) => ed.id === edgeId)
  if (!e) return { x: x0 + (x2 - x0) * t, z: z0 + (z2 - z0) * t }
  const x1 = e.control.x
  const z1 = e.control.z

  const u = 1 - t
  const x = u * u * x0 + 2 * u * t * x1 + t * t * x2
  const z = u * u * z0 + 2 * u * t * z1 + t * t * z2
  return { x, z }
}
