import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 focus-visible:outline-cyan-200',
  secondary: 'bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white/70',
  ghost: 'bg-transparent text-slate-200 hover:text-white hover:bg-white/5 focus-visible:outline-white/50',
}

export function Button({
  variant = 'primary',
  icon,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`.trim()

  return (
    <button className={styles} {...rest}>
      {icon && <span className="text-base">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

export default Button
