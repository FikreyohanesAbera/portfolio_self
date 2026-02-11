export function detectWebglSupport(): boolean {
  try {
    const canvas = document.createElement("canvas")
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    return Boolean(gl)
  } catch {
    return false
  }
}

export type PerfSample = {
  avgFrameMs: number
  recommendedMinimal: boolean
}

export function evaluatePerf(samples: number[]): PerfSample {
  const avg = samples.reduce((a, b) => a + b, 0) / Math.max(1, samples.length)
  // Conservative threshold for “poor performance”.
  const recommendedMinimal = avg > 26 // roughly under 38 frames per second
  return { avgFrameMs: avg, recommendedMinimal }
}
