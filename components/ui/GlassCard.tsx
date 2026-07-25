import React, { HTMLAttributes, forwardRef } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  level?: 0 | 1 | 2;
  interactive?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = '', level = 1, interactive = false, children, ...props }, ref) => {
    // Level 0: Background
    // Level 1: Cards/Containers
    // Level 2: Modals/Popovers
    
    let baseStyles = '';
    
    if (level === 0) {
      baseStyles = 'bg-surface-container-lowest';
    } else if (level === 1) {
      baseStyles = 'glass-card rounded-xl';
    } else if (level === 2) {
      baseStyles = 'glass-panel rounded-2xl shadow-2xl shadow-primary-container/50';
    }
    
    const interactiveStyles = interactive 
      ? 'transition-all duration-300 hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/5 cursor-pointer' 
      : '';
      
    const combinedClassName = `${baseStyles} ${interactiveStyles} ${className}`;

    return (
      <div ref={ref} className={combinedClassName.trim()} {...props}>
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
