import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'secondary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-lg';
    
    // Size variants
    const sizeStyles = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };
    
    // Color variants based on Samba Modern
    const variantStyles = {
      primary: 'bg-primary text-on-primary hover:brightness-110 shadow-lg shadow-primary/20',
      secondary: 'bg-secondary text-on-secondary hover:brightness-110 shadow-lg shadow-secondary/20',
      outline: 'border-2 border-outline-variant text-on-surface hover:bg-surface-variant hover:border-outline',
      ghost: 'text-on-surface-variant hover:text-secondary hover:bg-surface-container-high',
    };
    
    const widthStyle = fullWidth ? 'w-full' : '';
    
    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`;
    
    return (
      <button ref={ref} className={combinedClassName.trim()} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
