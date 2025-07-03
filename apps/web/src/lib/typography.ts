// Typography system for consistent text styling
export const typography = {
  // Display text
  display: 'text-5xl font-serif font-bold leading-tight',

  // Headings
  h1: 'text-4xl font-serif font-bold leading-tight',
  h2: 'text-2xl font-serif font-semibold leading-tight',
  h3: 'text-xl font-serif font-semibold leading-snug',
  h4: 'text-lg font-serif font-medium leading-snug',
  h5: 'text-base font-serif font-medium leading-normal',
  h6: 'text-sm font-serif font-medium leading-normal',

  // Body text
  body: 'text-base font-sans leading-relaxed',
  bodySmall: 'text-sm font-sans leading-relaxed',
  bodyLarge: 'text-lg font-sans leading-relaxed',

  // UI text
  label: 'text-sm font-medium font-sans leading-normal',
  caption: 'text-xs font-sans text-muted-foreground leading-normal',
  overline: 'text-xs font-sans uppercase tracking-wide leading-normal',

  // Code and data
  code: 'text-sm font-mono leading-normal',
  codeSmall: 'text-xs font-mono leading-normal',

  // Interactive elements
  button: 'text-sm font-medium font-sans leading-normal',
  link: 'text-sm font-medium font-sans leading-normal text-primary hover:underline',
} as const;

export type TypographyVariant = keyof typeof typography;

export const getTypographyClasses = (variant: TypographyVariant) => {
  return typography[variant];
};
