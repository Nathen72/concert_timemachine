import type { HTMLAttributes } from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export default function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles = {
    default: 'bg-gray-700 text-gray-200',
    primary: 'bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/30',
    success: 'bg-success/20 text-success-light ring-1 ring-success/30',
    warning: 'bg-warning/20 text-warning-light ring-1 ring-warning/30',
    error: 'bg-error/20 text-error-light ring-1 ring-error/30',
    info: 'bg-info/20 text-info-light ring-1 ring-info/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const dotSize = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`${dotSize[size]} rounded-full bg-current animate-pulse`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
