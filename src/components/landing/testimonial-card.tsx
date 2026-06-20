interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  initials: string;
  className?: string;
}

export function TestimonialCard({ quote, name, role, initials, className }: TestimonialCardProps) {
  return (
    <figure
      className={`flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm ${
        className ?? ''
      }`}
    >
      <blockquote className="flex-1 text-base leading-relaxed text-foreground">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          {initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </figcaption>
    </figure>
  );
}
