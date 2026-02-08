import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? "a" : "div"

  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "relative flex flex-col rounded-2xl",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/10",
        "shadow-[0_0_40px_rgba(255,255,255,0.05)]",
        "p-6",
        "max-w-[340px] min-h-[180px]",
        "transition-all duration-300",
        "hover:border-white/20 hover:shadow-[0_0_60px_rgba(255,255,255,0.1)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 ring-2 ring-white/10">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>

        <div>
          <h3 className="text-sm font-semibold text-white">
            {author.name}
          </h3>
          <p className="text-xs text-white/50">
            {author.handle}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/70">
        {text}
      </p>

      {/* glow layer */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-50" />
    </Card>
  )
}
