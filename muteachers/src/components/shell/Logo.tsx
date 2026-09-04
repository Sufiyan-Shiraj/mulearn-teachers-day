export function Logo({ height = 26, invert = false, className }: { height?: number; invert?: boolean; className?: string }) {
  return (
    <span className={`lg ${className ?? ''}`} style={{ ['--lg-h' as string]: `${height}px` }}>
      <img
        src="/logo.svg" alt="μlearn ASI" width={2048} height={768} draggable={false}
        style={{ height, width: 'auto', filter: invert ? 'invert(1) brightness(1.6)' : undefined }}
      />
    </span>
  )
}
