import { useEffect, useMemo, useState } from "react"
import { applySeo } from "../../app/seo"
import { writeMode } from "../../app/mode"
import { portfolio } from "../../content/portfolio"
import ChangeModeLink from "../../components/ChangeModeLink"
import { detectWebglSupport } from "./engine/perf"
import { useReducedMotion } from "./engine/useReducedMotion"
import ImmersivePage from "./ImmersivePage"
import styles from "./ImmersiveRoute.module.css"

export default function ImmersiveRoute() {
  const reducedMotion = useReducedMotion()
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    writeMode("immersive")
    applySeo({
      title: `${portfolio.name} · Immersive portfolio`,
      description:
        "Guided Systems Transit: a cinematic, professional guided experience with skippable travel and a map overlay.",
      ogImage: "/og-immersive.png"
    })
  }, [])

  useEffect(() => {
    setSupported(detectWebglSupport())
  }, [])

  const dpr = useMemo(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const cap = isMobile ? 1.2 : 1.5
    return Math.min(window.devicePixelRatio || 1, cap)
  }, [])

  if (!supported) {
    return (
      <main className={styles.fallback}>
        <header className={styles.fallbackTop}>
          <div className={styles.fallbackTitle}>Immersive mode is unavailable</div>
          <ChangeModeLink />
        </header>
        <p className={styles.fallbackText}>
          Your browser does not appear to support the graphics features required for the immersive experience.
          Please use the minimal mode instead.
        </p>
        <a className={styles.fallbackCta} href="/minimal">
          Go to minimal mode
        </a>
      </main>
    )
  }

  return <ImmersivePage reducedMotion={reducedMotion} dpr={dpr} />
}
