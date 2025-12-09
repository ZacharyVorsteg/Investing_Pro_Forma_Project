import React from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium
    rounded-lg transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-[1.02] active:scale-[0.98]
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-emerald-500 to-emerald-600
      hover:from-emerald-400 hover:to-emerald-500
      text-white shadow-lg shadow-emerald-500/25
      focus:ring-emerald-500
    `,
    secondary: `
      bg-slate-700 hover:bg-slate-600
      text-slate-100 border border-slate-600
      focus:ring-slate-500
    `,
    ghost: `
      bg-transparent hover:bg-slate-700/50
      text-slate-300 hover:text-white
      focus:ring-slate-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600
      hover:from-red-400 hover:to-red-500
      text-white shadow-lg shadow-red-500/25
      focus:ring-red-500
    `,
    success: `
      bg-gradient-to-r from-green-500 to-green-600
      hover:from-green-400 hover:to-green-500
      text-white shadow-lg shadow-green-500/25
      focus:ring-green-500
    `,
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon ? (
        leftIcon
      ) : null}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}

