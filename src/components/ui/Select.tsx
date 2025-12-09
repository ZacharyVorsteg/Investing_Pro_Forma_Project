import React, { forwardRef } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  helperText,
  options,
  placeholder = 'Select an option',
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label 
            htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-2.5 pr-10 rounded-lg appearance-none
            bg-slate-800/50 border border-slate-600
            text-white
            focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
            transition-all duration-200
            cursor-pointer
            ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled className="text-slate-500">
            {placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
              className="bg-slate-800"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {helperText && !error && (
        <p className="text-xs text-slate-400">{helperText}</p>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

