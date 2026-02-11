import React from "react"
import { createBrowserRouter } from "react-router-dom"

const GatePage = React.lazy(() => import("../pages/Gate/GatePage"))
const MinimalPage = React.lazy(() => import("../pages/Minimal/MinimalPage"))

// Critical: immersive is lazy and never imported on gate or minimal.
const ImmersiveRoute = React.lazy(() => import("../pages/Immersive/ImmersiveRoute"))

function LazyBoundary({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div style={{ padding: 24, color: "rgba(255,255,255,0.75)" }}>
          Loading…
        </div>
      }
    >
      {children}
    </React.Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LazyBoundary>
        <GatePage />
      </LazyBoundary>
    )
  },
  {
    path: "/minimal",
    element: (
      <LazyBoundary>
        <MinimalPage />
      </LazyBoundary>
    )
  },
  {
    path: "/immersive",
    element: (
      <LazyBoundary>
        <ImmersiveRoute />
      </LazyBoundary>
    )
  }
])
