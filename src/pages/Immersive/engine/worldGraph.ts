import { portfolio } from "../../../content/portfolio"
import type { WorldGraph, StationId, WorldEdge } from "./types"
import { makeCubicControls, reverseControls } from "./curve"

export function buildWorldGraph(): WorldGraph {
  const nodes = [
    { id: "hub" as const, label: "Hub", kind: "hub" as const, pos: { x: 0, z: 0 } },
    { id: "education" as const, label: "Education", kind: "district" as const, pos: { x: -12, z: -6 } },
    { id: "work" as const, label: "Work", kind: "district" as const, pos: { x: 12, z: -6 } },
    { id: "projects" as const, label: "Projects", kind: "district" as const, pos: { x: 12, z: 10 } },
    { id: "tools" as const, label: "Tools", kind: "district" as const, pos: { x: -12, z: 10 } }
  ]

  const projectNodes = portfolio.projects.map((p, idx) => {
    const angle = (idx / Math.max(1, portfolio.projects.length)) * Math.PI * 1.1 - 0.35
    const r = 6.5
    return {
      id: `project:${p.id}` as const,
      label: p.title,
      kind: "project" as const,
      pos: {
        x: 12 + Math.cos(angle) * r,
        z: 10 + Math.sin(angle) * r
      }
    }
  })

  const allNodes = [...nodes, ...projectNodes]

  function nodePos(id: StationId) {
    const n = allNodes.find((x) => x.id === id)
    if (!n) throw new Error(`Unknown node: ${id}`)
    return n.pos
  }

  function edge2(from: StationId, to: StationId): WorldEdge[] {
    const a = nodePos(from)
    const b = nodePos(to)

    const { c1, c2 } = makeCubicControls(from, to, a, b)

    const forward: WorldEdge = {
      id: `${from}__${to}`,
      from,
      to,
      c1,
      c2
    }

    const reversedControls = reverseControls({ c1, c2 })
    const backward: WorldEdge = {
      id: `${to}__${from}`,
      from: to,
      to: from,
      c1: reversedControls.c1,
      c2: reversedControls.c2
    }

    return [forward, backward]
  }

  // Hub to districts
  const edges: WorldEdge[] = [
    ...edge2("hub", "education"),
    ...edge2("hub", "work"),
    ...edge2("hub", "projects"),
    ...edge2("hub", "tools"),

    // Cross-links (optional, now also curved and bidirectional)
    ...edge2("education", "tools"),
    ...edge2("work", "projects")
  ]

  // Projects district to each project node
  for (const pn of projectNodes) {
    edges.push(...edge2("projects", pn.id))
  }

  return { nodes: allNodes, edges }
}

export function findNode(graph: WorldGraph, id: StationId) {
  const n = graph.nodes.find((x) => x.id === id)
  if (!n) throw new Error(`Unknown node: ${id}`)
  return n
}

export function tryFindEdge(graph: WorldGraph, from: StationId, to: StationId) {
  return graph.edges.find((x) => x.from === from && x.to === to) ?? null
}

export function findEdge(graph: WorldGraph, from: StationId, to: StationId) {
  const e = tryFindEdge(graph, from, to)
  if (!e) throw new Error(`Unknown edge: ${from} -> ${to}`)
  return e
}
