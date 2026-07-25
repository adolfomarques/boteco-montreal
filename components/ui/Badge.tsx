import React, { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost';
  pill?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'secondary', pill = true, children, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center font-label-caps uppercase tracking-widest text-[10px] font-bold px-2 py-1';
    
    const roundedStyles = pill ? 'rounded-full' : 'rounded';
    
    const variantStyles = {
      primary: 'bg-primary/10 text-primary',
      secondary: 'bg-secondary/10 text-secondary',
      tertiary: 'bg-tertiary/10 text-tertiary',
      outline: 'border border-outline-variant text-on-surface-variant',
      ghost: 'bg-surface-container-highest text-on-surface-variant',
    };
    
    const combinedClassName = `${baseStyles} ${roundedStyles} ${variantStyles[variant]} ${className}`;
    
    return (
      <span ref={ref} className={combinedClassName.trim()} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
