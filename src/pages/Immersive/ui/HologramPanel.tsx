import type { CSSProperties } from "react"
import { useEffect, useMemo, useState } from "react"
import styles from "./HologramPanel.module.css"
import type { ImmersiveModel, StationId } from "../engine/types"
import { portfolio } from "../../../content/portfolio"
import { projects } from "../../../content/projects"

type Props = {
  model: ImmersiveModel
  themeStyle?: CSSProperties
  onOpenMap: () => void
  onSkip: () => void
  onExpress: () => void
  onDepart: () => void
  onSelectHub: (to: StationId) => void
}

export default function HologramPanel({
  model,
  themeStyle,
  onOpenMap,
  onSkip,
  onExpress,
  onDepart,
  onSelectHub
}: Props) {
  const docked = model.plan?.to ?? model.dockedAt

  const showReading = model.state === "READING"
  const showTravel = model.state === "TRAVEL" || model.state === "DOCKING"
  const showHub = model.state === "HUB"

  // Compact by default during travel. Expand automatically when reading.
  const [collapsed, setCollapsed] = useState<boolean>(true)

  useEffect(() => {
    if (showReading) setCollapsed(false)
    if (showHub) setCollapsed(false)
    if (showTravel) setCollapsed(true)
  }, [showHub, showReading, showTravel])

  const panel = useMemo(() => {
    if (docked === "hub") return { title: "Central hub", content: renderHero() }
    if (docked === "education") return { title: "Education district", content: renderEducation() }
    if (docked === "work") return { title: "Work district", content: renderWork() }
    if (docked === "projects") return { title: "Projects district", content: renderProjects(onSelectHub) }
    if (docked === "tools") return { title: "Tools district", content: renderTools() }
    if (docked.startsWith("project:")) {
      const id = docked.split(":")[1]
      return { title: "Project node", content: renderProject(id) }
    }
    return { title: "Station", content: <div /> }
  }, [docked, onSelectHub])

  // During travel we do not offer “jump” buttons here.
  // Use map or skip travel so it never feels like clicks are ignored.
  const canNavigateNow = showReading || showHub

  return (
    <div className={styles.wrap} aria-label="Guided Systems Transit panel">
      {/* Top HUD strip: always available */}
      <div className={styles.hudRow}>
        <button type="button" className={styles.iconBtn} onClick={onOpenMap} aria-label="Open map">
          Map
        </button>

        <div className={styles.status}>
          <span className={styles.statusLabel}>State</span>
          <span className={styles.statusValue}>{model.state}</span>
        </div>

        <div className={styles.controls}>
          <button type="button" className={styles.smallBtn} onClick={onExpress}>
            {model.express ? "Express mode is on" : "Express mode is off"}
          </button>

          {showTravel ? (
            <button type="button" className={styles.smallBtn} onClick={onSkip}>
              Skip travel
            </button>
          ) : null}

          <a className={styles.smallBtn} href="/minimal">
            Switch to minimal
          </a>

          {/* Collapse toggle */}
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
          >
            {collapsed ? "Show panel" : "Hide panel"}
          </button>
        </div>
      </div>

      {/* During travel, keep the panel collapsed by default and show a small hint */}
      {showTravel ? (
        <div className={styles.travelHint} role="status">
          Travel in progress. Scroll controls speed. Use “Skip travel” for a fast jump or open the map.
        </div>
      ) : null}

      {/* Content panel: only when not collapsed */}
      {!collapsed ? (
        <div className={styles.panel} style={themeStyle} aria-label="Holographic content panel">
          <div className={styles.panelTop}>
            <div className={styles.panelTitle}>{panel.title}</div>
            <div className={styles.panelMeta}>
              {showTravel ? "Travel in progress. Scroll controls speed." : "Docked. Scroll reads content."}
            </div>
          </div>

          <div className={styles.body} data-reading={showReading ? "yes" : "no"}>
            {panel.content}
          </div>

          {/* Bottom row: only enable navigation when it is meaningful */}
          {showReading ? (
            <div className={styles.bottomRow}>
              <button type="button" className={styles.primary} onClick={() => onSelectHub("hub")}>
                Return to hub
              </button>
              <button type="button" className={styles.secondary} onClick={onDepart}>
                Depart
              </button>
            </div>
          ) : (
            <div className={styles.bottomRow}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => onSelectHub("hub")}
                disabled={!canNavigateNow}
                aria-disabled={!canNavigateNow}
              >
                Go to hub
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => onSelectHub("education")}
                disabled={!canNavigateNow}
                aria-disabled={!canNavigateNow}
              >
                Education
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => onSelectHub("work")}
                disabled={!canNavigateNow}
                aria-disabled={!canNavigateNow}
              >
                Work
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => onSelectHub("projects")}
                disabled={!canNavigateNow}
                aria-disabled={!canNavigateNow}
              >
                Projects
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => onSelectHub("tools")}
                disabled={!canNavigateNow}
                aria-disabled={!canNavigateNow}
              >
                Tools
              </button>

              {!canNavigateNow ? (
                <span className={styles.disabledNote}>Use the map or skip travel while moving.</span>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function renderHero() {
  return (
    <div>
      <h2 className={styles.h2}>{portfolio.name}</h2>
      <p className={styles.p}>{portfolio.headline}</p>
      <p className={styles.pMuted}>{portfolio.pitch}</p>

      <div className={styles.actions}>
        {portfolio.actions.map((a) => (
          <a
            key={a.label}
            className={styles.action}
            href={a.href}
            target={a.href.startsWith("http") ? "_blank" : undefined}
            rel={a.href.startsWith("http") ? "noreferrer" : undefined}
          >
            {a.label}
          </a>
        ))}
      </div>

      <div className={styles.tip}>Open the map or use the district buttons when docked.</div>
    </div>
  )
}

function renderEducation() {
  return (
    <div>
      {portfolio.education.map((e) => (
        <article key={e.degree} className={styles.block}>
          <div className={styles.blockTitle}>{e.degree}</div>
          <div className={styles.blockMeta}>
            {e.institution} · {e.dateRange}
          </div>
          <ul className={styles.list}>
            {e.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

function renderWork() {
  return (
    <div>
      {portfolio.experience.map((x) => (
        <article key={`${x.role}-${x.company}`} className={styles.block}>
          <div className={styles.blockTitle}>{x.role}</div>
          <div className={styles.blockMeta}>
            {x.company} · {x.dateRange}
          </div>
          <ul className={styles.list}>
            {x.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

function renderProjects(onSelectHub: (to: StationId) => void) {
  return (
    <div>
      <p className={styles.pMuted}>Each project is a node platform. Select one to travel to its station.</p>
      <div className={styles.grid}>
        {portfolio.projects.map((p) => (
          <button
            key={p.id}
            type="button"
            className={styles.cardBtn}
            onClick={() => onSelectHub(`project:${p.id}` as StationId)}
          >
            <div className={styles.cardTitle}>{p.title}</div>
            <div className={styles.cardText}>{p.summary}</div>
            <div className={styles.cardMeta}>{p.stack.join(" · ")}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function renderTools() {
  return (
    <div>
      <div className={styles.grid2}>
        {portfolio.tools.map((g) => (
          <div key={g.label} className={styles.toolCard}>
            <div className={styles.blockTitle}>{g.label}</div>
            <div className={styles.pills}>
              {g.items.map((i) => (
                <span className={styles.pill} key={i}>
                  {i}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderProject(projectId: string) {
  const p = projects.find((x) => x.id === projectId)
  if (!p) return <div className={styles.pMuted}>Unknown project.</div>

  return (
    <div>
      <div className={styles.block}>
        <div className={styles.blockTitle}>{p.title}</div>
        <div className={styles.blockMeta}>{p.stack.join(" · ")}</div>
        <p className={styles.pMuted}>{p.summary}</p>

        <div className={styles.links}>
          {p.links.map((l) => (
            <a key={l.href} className={styles.link} href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <div className={styles.case}>
        <div className={styles.caseTitle}>Problem</div>
        <p className={styles.pMuted}>{p.caseStudy.problem}</p>

        <div className={styles.caseTitle}>Approach</div>
        <ul className={styles.list}>
          {p.caseStudy.approach.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>

        <div className={styles.caseTitle}>Impact</div>
        <ul className={styles.list}>
          {p.caseStudy.impact.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
