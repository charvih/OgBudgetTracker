interface TipCardProps {
  text: string
  variant?: "tip" | "warning" | "danger" | "info"
}

const styles = {
  tip:     { card: "border-l-4 border-violet-400 bg-violet-50", text: "text-violet-800" },
  warning: { card: "border-l-4 border-amber-400 bg-amber-50",   text: "text-amber-800"  },
  danger:  { card: "border-l-4 border-rose-400 bg-rose-50",     text: "text-rose-800"   },
  info:    { card: "border-l-4 border-blue-400 bg-blue-50",     text: "text-blue-800"   },
}

export function TipCard({ text, variant = "tip" }: TipCardProps) {
  const s = styles[variant]
  return (
    <div className={`rounded-lg p-3 ${s.card}`}>
      <p className={`text-sm leading-relaxed ${s.text}`}>{text}</p>
    </div>
  )
}
