import React, { useRef } from "react"

interface GlareHoverProps {
  width?: string
  height?: string
  background?: string
  borderRadius?: string
  borderColor?: string
  children?: React.ReactNode
  glareColor?: string
  glareOpacity?: number
  glareAngle?: number
  glareSize?: number
  transitionDuration?: number
  playOnce?: boolean
  className?: string
  style?: React.CSSProperties
}

const GlareHover: React.FC<GlareHoverProps> = ({
  width = "auto",
  height = "auto",
  background = "#000",
  borderRadius = "12px",
  borderColor = "rgba(255,255,255,0.2)",
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.35,
  glareAngle = -30,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = "",
  style = {},
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null)

  const hex = glareColor.replace("#", "")
  let rgba = glareColor

  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`
  }

  const animateIn = () => {
    const el = overlayRef.current
    if (!el) return
    el.style.transition = "none"
    el.style.backgroundPosition = "-100% -100%, 0 0"
    el.style.transition = `${transitionDuration}ms ease`
    el.style.backgroundPosition = "100% 100%, 0 0"
  }

  const animateOut = () => {
    const el = overlayRef.current
    if (!el) return
    if (playOnce) {
      el.style.transition = "none"
      el.style.backgroundPosition = "-100% -100%, 0 0"
    } else {
      el.style.transition = `${transitionDuration}ms ease`
      el.style.backgroundPosition = "-100% -100%, 0 0"
    }
  }

  return (
    <div
      className={`relative grid place-items-center overflow-hidden border ${className}`}
      style={{
        background,
        borderRadius,
        borderColor,
        ...style,
      }}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(${glareAngle}deg,
            rgba(0,0,0,0) 60%,
            ${rgba} 70%,
            rgba(0,0,0,0) 100%)`,
          backgroundSize: `${glareSize}% ${glareSize}%`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "-100% -100%",
        }}
      />
      {children}
    </div>
  )
}

export default GlareHover
