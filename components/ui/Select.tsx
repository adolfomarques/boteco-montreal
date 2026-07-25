import React, { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, fullWidth = true, icon, children, ...props }, ref) => {
    
    const widthStyle = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`flex flex-col gap-2 ${widthStyle}`}>
        {label && (
          <label className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none z-10">
              {icon}
            </div>
          )}
          
          <select
            ref={ref}
            className={`
              appearance-none
              bg-surface-container-low border border-outline-variant/20 rounded-xl 
              text-on-surface text-sm p-3 outline-none transition-all
              focus:ring-2 focus:ring-secondary/50 focus:border-secondary
              disabled:opacity-50 disabled:bg-surface-container-lowest
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-error/50 focus:ring-error/50 focus:border-error' : ''}
              ${widthStyle}
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          
          {/* Custom Select Arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </div>
        </div>
        
        {error && (
          <span className="text-xs text-error mt-1">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
