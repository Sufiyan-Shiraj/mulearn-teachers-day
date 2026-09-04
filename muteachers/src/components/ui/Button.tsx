import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './button.css'

type Variant = 'dark' | 'outline' | 'crimson' | 'gold' | 'ghost' | 'paper'
type Size = 'md' | 'lg' | 'sm'

interface Common {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  trailing?: ReactNode
  full?: boolean
  className?: string
  children?: ReactNode
}

export function Button({
  variant = 'dark', size = 'md', icon, trailing, full, className, children, ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cls(variant, size, full, className)} {...rest}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-label">{children}</span>}
      {trailing && <span className="btn-trail">{trailing}</span>}
    </button>
  )
}

export function ButtonLink({
  to, variant = 'dark', size = 'md', icon, trailing, full, className, children, onClick,
}: Common & { to: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <Link to={to} className={cls(variant, size, full, className)} onClick={onClick}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-label">{children}</span>}
      {trailing && <span className="btn-trail">{trailing}</span>}
    </Link>
  )
}

function cls(v: Variant, s: Size, full?: boolean, extra?: string) {
  return `btn btn--${v} btn--${s}${full ? ' btn--full' : ''}${extra ? ' ' + extra : ''}`
}

/* the small chevron-in-a-circle used on secondary buttons */
export function ChevronPill() {
  return (
    <span className="btn-chev">
      <svg viewBox="0 0 12 12" aria-hidden><path d="M4.4 2.4 8 6l-3.6 3.6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  )
}

export function SparkIcon() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden fill="none">
      <path d="M9 1.6v3M9 13.4v3M1.6 9h3M13.4 9h3M3.8 3.8l2.1 2.1M12.1 12.1l2.1 2.1M14.2 3.8l-2.1 2.1M5.9 12.1l-2.1 2.1"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="9" r="2.5" fill="currentColor" />
    </svg>
  )
}

export function ArrowRight({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden fill="none">
      <path d="M3 10h13M11.5 5.2 16.4 10l-4.9 4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
