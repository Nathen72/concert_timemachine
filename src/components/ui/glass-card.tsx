import { cn } from '@/lib/utils'
import { HTMLAttributes, ReactNode } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'strong' | 'dark'
  hoverable?: boolean
}

export function GlassCard({ 
  children, 
  variant = 'default', 
  hoverable = true,
  className,
  ...props 
}: GlassCardProps) {
  const variantClasses = {
    default: 'glass',
    strong: 'glass-strong',
    dark: 'glass-dark',
  }

  return (
    <div
      className={cn(
        variantClasses[variant],
        hoverable && variant !== 'dark' && 'glass-card',
        'rounded-xl transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

