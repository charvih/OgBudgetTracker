// This component renders a single coloured card displaying one piece of AI financial advice.
// The card's border and background colour change based on the variant — tip, warning, danger, or info —
// so different types of advice are visually distinct from each other.

interface TipCardProps {
  text: string
  variant?: "tip" | "warning" | "danger" | "info"
}

// A lookup table mapping each variant name to the CSS classes for its card and text colour.
const styles = {
  tip:     { card: "border-l-4 border-violet-400 bg-violet-50", text: "text-violet-800" },
  warning: { card: "border-l-4 border-amber-400 bg-amber-50",   text: "text-amber-800"  },
  danger:  { card: "border-l-4 border-rose-400 bg-rose-50",     text: "text-rose-800"   },
  info:    { card: "border-l-4 border-blue-400 bg-blue-50",     text: "text-blue-800"   },
}

// Renders a coloured card with the given text and the visual style matching the variant.
export function TipCard({ text, variant = "tip" }: TipCardProps) {
  const s = styles[variant]
  return (
    <div className={`rounded-lg p-3 ${s.card}`}>
      <p className={`text-sm leading-relaxed ${s.text}`}>{text}</p>
    </div>
  )
}
