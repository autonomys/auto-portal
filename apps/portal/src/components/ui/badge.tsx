/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-500 text-white shadow hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
        warning:
          'border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700',
        info: 'border-transparent bg-blue-500 text-white shadow hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
        brand:
          'border-transparent bg-[#5870B3] text-white shadow hover:bg-[#5870B3]/90 dark:bg-[#5870B3] dark:hover:bg-[#5870B3]/90',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      shape: {
        default: 'rounded-md',
        pill: 'rounded-full',
        dot: 'rounded-full px-1.5 py-1.5 text-[0px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, shape, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant, size, shape }), className)} {...props} />
  ),
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
