import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedBackgroundProps {
  children?: ReactNode
  variant?: 'gradient' | 'blobs' | 'particles'
  className?: string
}

export function AnimatedBackground({ 
  children, 
  variant = 'gradient',
  className = '' 
}: AnimatedBackgroundProps) {
  if (variant === 'gradient') {
    return (
      <div className={`absolute inset-0 bg-gradient-animated ${className}`}>
        {children}
      </div>
    )
  }

  if (variant === 'blobs') {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        {/* Animated Gradient Blobs */}
        <motion.div
          className="absolute top-0 -left-4 w-96 h-96 bg-terracotta rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-0 -right-4 w-96 h-96 bg-rose rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.div
          className="absolute -bottom-8 left-1/4 w-96 h-96 bg-lavender rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 50, 0],
            y: [0, -80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {children}
      </div>
    )
  }

  // Particles variant (simplified - can be enhanced later)
  return (
    <div className={`absolute inset-0 ${className}`}>
      {children}
    </div>
  )
}

