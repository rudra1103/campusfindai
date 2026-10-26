import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-surface-card rounded-card border border-brand-border p-5 shadow-card transition-all duration-200',
        hoverEffect && 'hover:shadow-elevated hover:border-slate-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
