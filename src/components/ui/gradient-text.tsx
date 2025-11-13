import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  variant?: 'primary' | 'accent' | '60s' | '70s' | '80s' | '90s' | '00s'
  className?: string
}

export function GradientText({ children, variant = 'primary', className }: GradientTextProps) {
  const variantClasses = {
    primary: 'text-gradient-primary',
    accent: 'text-gradient-accent',
    '60s': 'text-gradient-60s',
    '70s': 'text-gradient-70s',
    '80s': 'text-gradient-80s',
    '90s': 'text-gradient-90s',
    '00s': 'text-gradient-00s',
  }

  return (
    <span className={cn(variantClasses[variant], className)}>
      {children}
    </span>
  )
}

