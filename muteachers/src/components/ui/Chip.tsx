import './chip.css'

export function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button className="chip" data-active={active ? '' : undefined} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  )
}

export function ChipRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`chip-row ${className}`}>{children}</div>
}
