export type Mode = "minimal" | "immersive"

const KEY = "portfolio_mode_v1"

export function readMode(): Mode | null {
  const raw = localStorage.getItem(KEY)
  if (raw === "minimal" || raw === "immersive") return raw
  return null
}

export function writeMode(mode: Mode) {
  localStorage.setItem(KEY, mode)
}

export function clearMode() {
  localStorage.removeItem(KEY)
}
