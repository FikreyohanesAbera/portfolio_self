import { portfolio } from "../../../content/portfolio"
import { WorldGraph, StationId } from "./types"

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

  function edge2(from: StationId, to: StationId, cx: number, cz: number) {
    return [
      { id: `${from}__${to}`, from, to, control: { x: cx, z: cz } },
      { id: `${to}__${from}`, from: to, to: from, control: { x: cx, z: cz } }
    ] as const
  }

  const edges = [
    ...edge2("hub", "education", -6, -2),
    ...edge2("hub", "work", 6, -2),
    ...edge2("hub", "projects", 7, 6),
    ...edge2("hub", "tools", -7, 6),

    // Optional cross-links
    ...edge2("education", "tools", -14, 2),
    ...edge2("work", "projects", 14, 2)
  ]

  for (const pn of projectNodes) {
    edges.push(...edge2("projects", pn.id, 16, 10))
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
