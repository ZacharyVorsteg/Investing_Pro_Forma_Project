import React, { forwardRef } from 'react'
import { HelpCircle, AlertCircle, CheckCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  helperText?: string
  leftAddon?: string
  rightAddon?: string
  state?: 'known' | 'estimate' | 'incomplete'
  onStateChange?: (state: 'known' | 'estimate' | 'incomplete') => void
  showStateSelector?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  helperText,
  leftAddon,
  rightAddon,
  state,
  onStateChange,
  showStateSelector = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  const stateStyles = {
    known: 'border-emerald-500/50 bg-emerald-500/5',
    estimate: 'border-amber-500/50 bg-amber-500/5',
    incomplete: 'border-slate-600',
  }

  const stateIcons = {
    known: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    estimate: <AlertCircle className="w-4 h-4 text-amber-400" />,
    incomplete: null,
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
          {hint && (
            <button
              type="button"
              className="text-slate-400 hover:text-slate-300 transition-colors"
              title={hint}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      
      <div className="relative">
        {leftAddon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-slate-400 text-sm">{leftAddon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-slate-800/50 border ${state ? stateStyles[state] : 'border-slate-600'}
            text-white placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
            transition-all duration-200
            ${leftAddon ? 'pl-8' : ''}
            ${rightAddon || (state && stateIcons[state]) ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {rightAddon && (
            <span className="text-slate-400 text-sm">{rightAddon}</span>
          )}
          {state && stateIcons[state]}
        </div>
      </div>

      {showStateSelector && onStateChange && (
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => onStateChange('known')}
            className={`
              text-xs px-2 py-1 rounded-md transition-all
              ${state === 'known' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'}
            `}
          >
            I know the exact amount
          </button>
          <button
            type="button"
            onClick={() => onStateChange('estimate')}
            className={`
              text-xs px-2 py-1 rounded-md transition-all
              ${state === 'estimate' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' 
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'}
            `}
          >
            Help me estimate
          </button>
          <button
            type="button"
            onClick={() => onStateChange('incomplete')}
            className={`
              text-xs px-2 py-1 rounded-md transition-all
              ${state === 'incomplete' 
                ? 'bg-slate-500/20 text-slate-400 border border-slate-500/50' 
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'}
            `}
          >
            I'll research later
          </button>
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-slate-400 flex items-start gap-1.5">
          <span className="text-emerald-400">💡</span>
          {helperText}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

