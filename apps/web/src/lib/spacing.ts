// Spacing system for consistent layout patterns
export const spacing = {
  // Gap utilities
  gap: {
    xs: 'gap-2', // 8px
    sm: 'gap-3', // 12px
    md: 'gap-4', // 16px
    lg: 'gap-6', // 24px
    xl: 'gap-8', // 32px
    '2xl': 'gap-12', // 48px
    '3xl': 'gap-16', // 64px
  },

  // Vertical spacing
  spaceY: {
    xs: 'space-y-2', // 8px
    sm: 'space-y-3', // 12px
    md: 'space-y-4', // 16px
    lg: 'space-y-6', // 24px
    xl: 'space-y-8', // 32px
    '2xl': 'space-y-12', // 48px
    '3xl': 'space-y-16', // 64px
  },

  // Horizontal spacing
  spaceX: {
    xs: 'space-x-2', // 8px
    sm: 'space-x-3', // 12px
    md: 'space-x-4', // 16px
    lg: 'space-x-6', // 24px
    xl: 'space-x-8', // 32px
    '2xl': 'space-x-12', // 48px
    '3xl': 'space-x-16', // 64px
  },

  // Padding utilities
  padding: {
    xs: 'p-2', // 8px
    sm: 'p-3', // 12px
    md: 'p-4', // 16px
    lg: 'p-6', // 24px
    xl: 'p-8', // 32px
    '2xl': 'p-12', // 48px
    '3xl': 'p-16', // 64px
  },

  // Margin utilities
  margin: {
    xs: 'm-2', // 8px
    sm: 'm-3', // 12px
    md: 'm-4', // 16px
    lg: 'm-6', // 24px
    xl: 'm-8', // 32px
    '2xl': 'm-12', // 48px
    '3xl': 'm-16', // 64px
  },
} as const;

export type SpacingSize = keyof typeof spacing.gap;

export const getSpacingClasses = (type: keyof typeof spacing, size: SpacingSize) => {
  return spacing[type][size];
};
