import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Color } from "three"
import { Environment, OrbitControls } from "@react-three/drei"

import type { WorldGraph } from "../engine/worldGraph"
import { findNode } from "../engine/worldGraph"
import { stepMotion } from "../engine/physics"
import type { ImmersiveModel } from "../engine/types"

import HubScene from "../three/HubScene"
import Rails from "../three/Rails"
import Trolley from "../three/Trolley"
import CabCameraRig from "./CabCameraRig"

type Props = {
  graph: WorldGraph
  model: ImmersiveModel
  dispatch: React.Dispatch<any>
  impulseAccum: number
  setImpulseAccum: React.Dispatch<React.SetStateAction<number>>
  onPerfSample: (samples: number[]) => void
}

export default function SceneRoot3D({
  graph,
  model,
  dispatch,
  impulseAccum,
  setImpulseAccum,
  onPerfSample
}: Props) {
  const { invalidate, camera } = useThree()

  // Development performance sampling
  const perfSamples = useRef<number[]>([])
  const lastT = useRef(performance.now())

  // Lazy-loaded district modules
  const [districtLoaded, setDistrictLoaded] = useState<Record<string, boolean>>({
    education: false,
    work: false,
    projects: false,
    tools: false
  })

  const backgroundColor = useMemo(() => new Color("#070a10"), [])

  useEffect(() => {
    const to = model.plan?.to
    if (!to) return
    if (to === "education" || to === "work" || to === "projects" || to === "tools") {
      setDistrictLoaded((s) => ({ ...s, [to]: true }))
    }
  }, [model.plan?.to])

  useFrame((_, dt) => {
    // Frame time sampling
    const now = performance.now()
    const frameMs = now - lastT.current
    lastT.current = now
    perfSamples.current.push(frameMs)
    if (perfSamples.current.length === 120) {
      onPerfSample(perfSamples.current)
      perfSamples.current = []
    }

    // HUB: orbit controls own the camera
    if (model.state === "HUB") return

    if (!model.plan) return

    const fromNode = findNode(graph, model.plan.from)
    const toNode = findNode(graph, model.plan.to)

    // Brake zone: last 15 percent of travel
    const brakeZone = clamp01((model.motion.progressT - 0.85) / 0.15)
    const { nextT, nextV } = stepMotion(model, dt, impulseAccum, brakeZone)

    if (nextT !== model.motion.progressT || nextV !== model.motion.velocity) {
      dispatch({ type: "TICK_MOTION", nextT, nextV })
      invalidate()
    }

    if (impulseAccum !== 0) setImpulseAccum((v) => v * 0.55)

    // Dock
    if (nextT >= 1 && model.state !== "READING") {
      dispatch({ type: "DOCKED" })
      invalidate()
    }

    // Reading and map: keep camera stable, but cab rig will still keep the “inside trolley” feel.
    // If you want a more stable reading camera, we can add a gentle offset here later.
    void fromNode
    void toNode
  })

  // If you want a consistent starting orbit camera, set it once:
  useEffect(() => {
    if (model.state !== "HUB") return
    camera.position.set(0, 2.8, 7.6)
    camera.lookAt(0, 1.1, 0)
  }, [camera, model.state])

  function requestTravel(to: any) {
    dispatch({ type: "REQUEST_TRAVEL_TO", to })
    invalidate()
  }

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <fog attach="fog" args={["#070a10", 12, 70]} />

      <Environment preset="city" />

      {/* Orbit controls in hub only */}
      <OrbitControls
        enabled={model.state === "HUB"}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={5.5}
        maxDistance={10}
        minPolarAngle={0.9}
        maxPolarAngle={1.45}
        target={[0, 1.1, 0]}
      />

      {/* Cab camera: standing inside trolley (disabled in hub) */}
      <CabCameraRig graph={graph} model={model} />

      <Rails graph={graph} plan={model.plan} />
      <Trolley graph={graph} model={model} />

      <HubScene
        graph={graph}
        model={model}
        onSelectDistrict={(station) => dispatch({ type: "REQUEST_TRAVEL_TO", to: station })}
        onSelectProject={(projectId) => dispatch({ type: "REQUEST_TRAVEL_TO", to: `project:${projectId}` })}
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
const LazyEducationDistrict = lazyOnce(() => import("../three/districts/EducationDistrict"))
const LazyWorkDistrict = lazyOnce(() => import("../three/districts/WorkDistrict"))
const LazyProjectsDistrict = lazyOnce(() => import("../three/districts/ProjectsDistrict"))
const LazyToolsDistrict = lazyOnce(() => import("../three/districts/ToolsDistrict"))

function lazyOnce<T extends { default: React.ComponentType<any> }>(loader: () => Promise<T>) {
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

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}
