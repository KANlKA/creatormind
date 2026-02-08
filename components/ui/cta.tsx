import * as React from "react"
import { cn } from "@/lib/utils"
import GlareButton from "@/components/ui/GlareButton"
import SpotlightCard from "@/components/ui/SpotlightCard"

export interface CTAProps {
  title: string
  description?: string
  primaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export const CTA = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: CTAProps) => {
  return (
    <SpotlightCard
      className={cn(
        "w-full px-10 py-10 md:px-14 md:py-12",
        className
      )}
      spotlightColor="rgba(255, 255, 255, 0.15)"
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-400 mb-4">
          {title}
        </h2>

        {description && (
          <p className="text-lg text-gray-400 mb-8">
            {description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          {primaryAction && (
            <GlareButton
              onClick={primaryAction.onClick}
              href={primaryAction.href}
            >
              {primaryAction.label}
            </GlareButton>
          )}

          {secondaryAction && (
            <GlareButton
              onClick={secondaryAction.onClick}
              href={secondaryAction.href}
              className="border-white/20"
            >
              {secondaryAction.label}
            </GlareButton>
          )}
        </div>
      </div>
    </SpotlightCard>
  )
}
