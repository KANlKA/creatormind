import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const ctaVariants = cva(
  "relative w-full rounded-3xl overflow-hidden transition-all",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-600 to-purple-800",
        gradient: "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800",
        solid: "bg-purple-900/30 backdrop-blur-sm border border-purple-500/20",
        dark: "bg-gray-900/80 backdrop-blur-sm border border-gray-700/50",
      },
      size: {
        default: "p-8 md:p-12",
        sm: "p-6 md:p-8",
        lg: "p-12 md:p-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CTAProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ctaVariants> {
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
}

const CTA = React.forwardRef<HTMLDivElement, CTAProps>(
  ({
    className,
    variant,
    size,
    title,
    description,
    primaryAction,
    secondaryAction,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(ctaVariants({ variant, size, className }))}
        {...props}
      >
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h2>

          {description && (
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              {description}
            </p>
          )}

          {children}

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {primaryAction && (
                primaryAction.href ? (
                  <a href={primaryAction.href}>
                    <Button
                      size="lg"
                      className="bg-white text-purple-900 hover:bg-gray-100 font-semibold px-8 py-6 text-lg"
                      onClick={primaryAction.onClick}
                    >
                      {primaryAction.label}
                    </Button>
                  </a>
                ) : (
                  <Button
                    size="lg"
                    className="bg-white text-purple-900 hover:bg-gray-100 font-semibold px-8 py-6 text-lg"
                    onClick={primaryAction.onClick}
                  >
                    {primaryAction.label}
                  </Button>
                )
              )}

              {secondaryAction && (
                secondaryAction.href ? (
                  <a href={secondaryAction.href}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                      onClick={secondaryAction.onClick}
                    >
                      {secondaryAction.label}
                    </Button>
                  </a>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                    onClick={secondaryAction.onClick}
                  >
                    {secondaryAction.label}
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

CTA.displayName = "CTA"

export { CTA, ctaVariants }
