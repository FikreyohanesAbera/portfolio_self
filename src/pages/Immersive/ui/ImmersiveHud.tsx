import React from "react"
import styles from "./ImmersiveHud.module.css"

export default function ImmersiveHud({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className={styles.hint} aria-live="polite">
      <div className={styles.row}>
        <span className={styles.kbd}>M</span>
        <span>Open map</span>
        <span className={styles.sep}>·</span>
        <span className={styles.kbd}>Arrow Up</span>
        <span>Accelerate</span>
        <span className={styles.sep}>·</span>
        <span className={styles.kbd}>Arrow Down</span>
        <span>Brake</span>
      </div>
      {reducedMotion ? (
        <div className={styles.rowSmall}>
          Reduced motion is enabled. Travel is shortened and instant navigation is available.
        </div>
      ) : null}
    </div>
  )
}
