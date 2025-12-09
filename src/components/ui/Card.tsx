import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  style?: React.CSSProperties
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  style,
}) => {
  const variants = {
    default: 'bg-slate-800/50 border border-slate-700/50',
    glass: 'glass',
    elevated: 'bg-slate-800 border border-slate-700 shadow-xl shadow-black/20',
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`
        rounded-xl
        ${variants[variant]}
        ${paddings[padding]}
        ${hover ? 'transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10' : ''}
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  action,
}) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    <div>{children}</div>
    {action}
  </div>
)

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  subtitle?: string
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  subtitle,
}) => (
  <div className={className}>
    <h3 className="text-lg font-semibold text-white">{children}</h3>
    {subtitle && (
      <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
    )}
  </div>
)

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => (
  <div className={className}>{children}</div>
)

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => (
  <div className={`mt-4 pt-4 border-t border-slate-700/50 ${className}`}>
    {children}
  </div>
)

