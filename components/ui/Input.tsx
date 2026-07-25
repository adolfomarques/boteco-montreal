import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, fullWidth = true, icon, ...props }, ref) => {
    
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
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
          />
        </div>
        
        {error && (
          <span className="text-xs text-error mt-1">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
