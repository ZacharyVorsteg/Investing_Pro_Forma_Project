import React from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  showLabel = true,
  label,
  variant = 'default',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const variants = {
    default: 'from-emerald-500 to-blue-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-amber-500 to-orange-500',
    danger: 'from-red-500 to-rose-500',
  }

  // Auto-select variant based on value
  const autoVariant = 
    percentage >= 80 ? 'success' :
    percentage >= 50 ? 'default' :
    percentage >= 25 ? 'warning' : 'danger'

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">{label || 'Progress'}</span>
          <span className="font-medium text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${variants[variant === 'default' ? autoVariant : variant]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

