import React from "react"
import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import styles from "./GatePage.module.css"
import { Mode, readMode, writeMode } from "../../app/mode"
import { applySeo } from "../../app/seo"

export default function GatePage() {
  const navigate = useNavigate()
  const location = useLocation() as any

  useEffect(() => {
    applySeo({
      title: "Choose mode · Developer Portfolio",
      description:
        "Choose a fast minimal mode or an optional immersive guided experience.",
      ogImage: "/og-minimal.png"
    })
  }, [])

  useEffect(() => {
    const saved = readMode()
    if (!saved) return
    // Auto-redirect on subsequent visits
    navigate(saved === "minimal" ? "/minimal" : "/immersive", { replace: true })
  }, [navigate])

  function choose(mode: Mode) {
    writeMode(mode)
    navigate(mode === "minimal" ? "/minimal" : "/immersive")
  }

  // Optional minimal preload (lightweight).
  async function preloadMinimal() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    import("../Minimal/MinimalPage")
  }

  const from = location?.state?.from

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.mark} aria-hidden="true" />
          <div>
            <div className={styles.title}>Developer Portfolio</div>
            <div className={styles.subtitle}>
              Choose your experience. The immersive mode is optional and loads only if you select it.
            </div>
          </div>
        </div>
        {from ? (
          <div className={styles.from}>
            You came from <span className={styles.path}>{String(from)}</span>
          </div>
        ) : null}
      </header>

      <section className={styles.grid} aria-label="Mode selection">
        <article className={styles.card}>
          <h2 className={styles.h2}>Minimal mode</h2>
          <p className={styles.p}>
            Fast, readable, recruiter-friendly, and accessible. No three dimensional libraries are downloaded.
          </p>
          <ul className={styles.list}>
            <li>Semantic structure and keyboard navigation</li>
            <li>Great for quick scanning and sharing</li>
            <li>Small bundle and quick load</li>
          </ul>
          <button
            className={styles.primary}
            onMouseEnter={preloadMinimal}
            onFocus={preloadMinimal}
            onClick={() => choose("minimal")}
          >
            Enter minimal mode
          </button>
          <div className={styles.smallHint}>
            Direct link: <span className={styles.mono}>/minimal</span>
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.h2}>Immersive mode</h2>
          <p className={styles.p}>
            Guided Systems Transit: a cinematic trolley ride through districts that represent education, work, projects, and tools.
          </p>
          <ul className={styles.list}>
            <li>Guided travel with scroll-wheel throttle control</li>
            <li>Map overlay for quick navigation</li>
            <li>Skip travel for speed</li>
          </ul>
          <button className={styles.secondary} onClick={() => choose("immersive")}>
            Enter immersive mode
          </button>
          <div className={styles.smallHint}>
            Direct link: <span className={styles.mono}>/immersive</span>
          </div>
        </article>
      </section>

      <footer className={styles.footer}>
        <span className={styles.note}>
          Tip: If you prefer reduced motion, immersive mode will shorten transitions and allow instant navigation.
        </span>
      </footer>
    </main>
  )
}
