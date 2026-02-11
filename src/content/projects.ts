export type ProjectTheme = {
  backgroundGradient: string
  fogColor: string
  accent: string
  ambientIntensity: number
  keyLightIntensity: number
}

export type Project = {
  id: string
  title: string
  summary: string
  stack: string[]
  links: { label: string; href: string }[]
  caseStudy: {
    problem: string
    approach: string[]
    impact: string[]
  }
  theme: ProjectTheme
}

export const projects: Project[] = [
  {
    id: "cp-transit",
    title: "Guided Systems Transit Portfolio",
    summary:
      "Dual-mode portfolio with a fast minimal experience and an optional immersive guided experience.",
    stack: ["React", "TypeScript", "Vite", "React Router", "Three.js"],
    links: [
      { label: "Source code", href: "https://example.com" },
      { label: "Live site", href: "https://example.com" }
    ],
    caseStudy: {
      problem:
        "Create a recruiter-friendly portfolio while preserving room for a cinematic, interactive experience.",
      approach: [
        "Route-level code splitting so the immersive bundle is never downloaded for minimal users.",
        "A deterministic state machine that prevents scroll conflicts between travel and reading.",
        "Data-driven content so both modes remain consistent."
      ],
      impact: [
        "Minimal mode stays lightweight and accessible.",
        "Immersive mode loads in stages and remains skippable for speed."
      ]
    },
    theme: {
      backgroundGradient:
        "radial-gradient(1000px 800px at 35% 15%, rgba(143,178,255,0.25) 0%, rgba(7,10,16,1) 60%)",
      fogColor: "#0b1020",
      accent: "#8fb2ff",
      ambientIntensity: 0.5,
      keyLightIntensity: 1.1
    }
  },
  {
    id: "distributed-dash",
    title: "Operational Dashboards and Data Pipelines",
    summary:
      "Monitoring dashboards and pipeline observability for reliable service operation.",
    stack: ["TypeScript", "React", "PostgreSQL", "Cloud"],
    links: [{ label: "Case study", href: "https://example.com" }],
    caseStudy: {
      problem:
        "Keep systems understandable under real-world constraints such as latency, retries, and partial failures.",
      approach: [
        "Define key service indicators that map to real user impact.",
        "Instrument pipelines with consistent identifiers and structured logs.",
        "Provide actionable drill-down rather than vanity metrics."
      ],
      impact: [
        "Faster diagnosis of incidents.",
        "More confidence in releases through measurable change detection."
      ]
    },
    theme: {
      backgroundGradient:
        "radial-gradient(900px 700px at 50% 20%, rgba(167,240,216,0.22) 0%, rgba(7,10,16,1) 60%)",
      fogColor: "#09151a",
      accent: "#a7f0d8",
      ambientIntensity: 0.55,
      keyLightIntensity: 1.0
    }
  }
]
