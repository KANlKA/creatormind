import GlareHover from "./GlareHover"

interface GlareButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
}

export default function GlareButton({
  children,
  onClick,
  href,
  className = "",
}: GlareButtonProps) {
  const content = (
    <div className="px-7 py-3 text-gray-400 font-medium text-base tracking-wide">
      {children}
    </div>
  )

  const button = (
    <GlareHover
      glareColor="#ffffff"
      glareOpacity={0.25}
      glareAngle={-30}
      glareSize={250}
      borderRadius="14px"
      borderColor="rgba(156, 163, 175, 1)"
      background="rgba(0,0,0,0.9)"
      className={`border-[3px] ${className}`}
    >
      {content}
    </GlareHover>
  )

  if (href) return <a href={href}>{button}</a>

  return <div onClick={onClick}>{button}</div>
}
