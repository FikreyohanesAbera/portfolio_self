import React from "react"
import { Link, useLocation } from "react-router-dom"
import styles from "./ChangeModeLink.module.css"
import { clearMode } from "../app/mode"

export default function ChangeModeLink() {
  const location = useLocation()
  return (
    <div className={styles.wrap}>
      <Link
        to="/"
        onClick={() => clearMode()}
        className={styles.link}
        aria-label="Change mode and return to mode selection"
        state={{ from: location.pathname }}
      >
        Change mode
      </Link>
    </div>
  )
}
