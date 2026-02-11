import { projects, Project } from "./projects"

export type Experience = {
  role: string
  company: string
  dateRange: string
  bullets: string[]
}

export type Education = {
  degree: string
  institution: string
  dateRange: string
  highlights: string[]
}

export type ToolGroup = {
  label: string
  items: string[]
}

export type Portfolio = {
  name: string
  headline: string
  pitch: string
  actions: { label: string; href: string }[]
  education: Education[]
  experience: Experience[]
  projects: Project[]
  tools: ToolGroup[]
}

export const portfolio: Portfolio = {
  name: "Your Name",
  headline: "Senior front end engineer and creative technologist",
  pitch:
    "I build fast, accessible interfaces and high-end interactive experiences with a strong systems mindset.",
  actions: [
    { label: "View projects", href: "#projects" },
    { label: "Download résumé", href: "/resume.pdf" },
    { label: "Contact", href: "mailto:you@example.com" }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "Your University",
      dateRange: "2022 to 2026",
      highlights: [
        "Coursework: data structures, algorithms, databases, distributed systems, human computer interaction",
        "Focus: performance engineering, interaction design, and system reliability"
      ]
    }
  ],
  experience: [
    {
      role: "Team lead, full stack engineer",
      company: "Example Organization",
      dateRange: "2024 to present",
      bullets: [
        "Shipped production features across front end and back end with measurable reliability improvements.",
        "Built reporting workflows with export and filtering designed for large data sets.",
        "Improved user experience with motion that respects reduced motion preferences."
      ]
    },
    {
      role: "Front end engineer",
      company: "Example Studio",
      dateRange: "2023 to 2024",
      bullets: [
        "Created accessible, responsive interfaces with clean information architecture.",
        "Reduced page load cost through code splitting and careful asset staging.",
        "Partnered with design to produce polished interactions that remain usable."
      ]
    }
  ],
  projects,
  tools: [
    {
      label: "Languages",
      items: ["TypeScript", "JavaScript", "Go", "Python", "SQL"]
    },
    {
      label: "Front end",
      items: ["React", "React Router", "Vite", "CSS Modules", "Accessibility"]
    },
    {
      label: "Back end",
      items: ["Gin", "Node.js", "REST", "Webhooks", "Authentication"]
    },
    {
      label: "Databases",
      items: ["PostgreSQL", "MongoDB", "Redis"]
    },
    {
      label: "Cloud",
      items: ["Cloud Run", "Object storage", "Continuous integration and delivery"]
    },
    {
      label: "Testing",
      items: ["Unit tests", "Integration tests", "Mocks", "Coverage tooling"]
    },
    {
      label: "Other",
      items: ["Three.js", "Interaction design", "Performance profiling"]
    }
  ]
}
