import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className
}: TestimonialsSectionProps) {
  return (
    <section
      className={cn(
        "bg-transparent text-white",
        "py-20 sm:py-28",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 text-center">

        {/* Title */}
        <div className="flex flex-col items-center gap-4 px-6">
          <h2 className="max-w-[900px] text-4xl font-semibold leading-tight sm:text-6xl">
            {title}
          </h2>

          {description && (
            <p className="max-w-[720px] text-lg text-white/70 sm:text-xl">
              {description}
            </p>
          )}
        </div>

        {/* Marquee */}
        <div className="relative w-full overflow-hidden">
          <div className="group flex overflow-hidden [--gap:2rem] [gap:var(--gap)] [--duration:60s]">

            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee group-hover:[animation-play-state:paused]">
              {[...Array(3)].map((_, setIndex) =>
                testimonials.map((testimonial, i) => (
                  <TestimonialCard
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                    className="w-[380px] p-6 text-base sm:text-lg"
                  />
                ))
              )}
            </div>

          </div>

          {/* Edge fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black to-transparent" />
        </div>
      </div>
    </section>
  )
}
