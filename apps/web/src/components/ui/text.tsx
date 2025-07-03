import React from 'react';
import { cn } from '@/lib/utils';
import { typography, type TypographyVariant } from '@/lib/typography';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  as: Component = 'p',
  className,
  children,
  ...props
}) => {
  return (
    <Component className={cn(typography[variant], className)} {...props}>
      {children}
    </Component>
  );
};
