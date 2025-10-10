import { getSpacingClasses, type SpacingSize } from './spacing';

// Layout utilities for common patterns and compositions
export const layout = {
  // Common layout patterns
  stack: (spacing: SpacingSize = 'md') => `flex flex-col ${getSpacingClasses('gap', spacing)}`,
  inline: (spacing: SpacingSize = 'md') => `flex items-center ${getSpacingClasses('gap', spacing)}`,
  grid: (cols: number, spacing: SpacingSize = 'md') =>
    `grid grid-cols-${cols} ${getSpacingClasses('gap', spacing)}`,

  // Container patterns
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: (spacing: SpacingSize = 'xl') => `${getSpacingClasses('spaceY', spacing)}`,

  // Card patterns
  cardContent: 'p-6 pt-0',
  cardHeader: 'flex flex-col space-y-1.5 p-6',
  cardFooter: 'flex items-center p-6 pt-0',

  // Grid responsive patterns
  gridResponsive: {
    '1-2': 'grid grid-cols-1 md:grid-cols-2',
    '1-3': 'grid grid-cols-1 md:grid-cols-3',
    '2-4': 'grid grid-cols-2 md:grid-cols-4',
    '1-2-3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },

  // Flex utilities
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',

  // Common spacings for page layout
  pageSection: 'py-12',
  pageHeader: 'border-b border-border pb-8 text-center',
  pageContent: 'space-y-12',
} as const;

export const getLayoutClasses = (pattern: keyof typeof layout, ...args: unknown[]) => {
  const layoutValue = layout[pattern];
  if (typeof layoutValue === 'function') {
    return (layoutValue as (...args: unknown[]) => string)(...args);
  }
  return layoutValue as string;
};
