import { describe, it, expect } from 'vitest';
import { typography, getTypographyClasses } from '../typography';
import { spacing, getSpacingClasses } from '../spacing';
import { layout, getLayoutClasses } from '../layout';

describe('typography system', () => {
  it('returns valid typography classes for display and headings', () => {
    expect(getTypographyClasses('display')).toBe(typography.display);
    expect(getTypographyClasses('h1')).toBe(typography.h1);
    expect(getTypographyClasses('h2')).toBe(typography.h2);
    expect(getTypographyClasses('h3')).toBe(typography.h3);
    expect(getTypographyClasses('h4')).toBe(typography.h4);
    expect(getTypographyClasses('h5')).toBe(typography.h5);
    expect(getTypographyClasses('h6')).toBe(typography.h6);
  });

  it('returns valid typography classes for body, UI text, and interactive elements', () => {
    expect(getTypographyClasses('body')).toBe('text-base font-sans leading-relaxed');
    expect(getTypographyClasses('bodySmall')).toBe('text-sm font-sans leading-relaxed');
    expect(getTypographyClasses('label')).toBe('text-sm font-medium font-sans leading-normal');
    expect(getTypographyClasses('caption')).toBe('text-xs font-sans text-muted-foreground leading-normal');
    expect(getTypographyClasses('button')).toBe('text-sm font-medium font-sans leading-normal');
    expect(getTypographyClasses('code')).toBe('text-sm font-mono leading-normal');
    expect(getTypographyClasses('link')).toContain('hover:underline');
  });
});

describe('spacing system', () => {
  it('returns valid gap classes', () => {
    expect(getSpacingClasses('gap', 'xs')).toBe('gap-2');
    expect(getSpacingClasses('gap', 'sm')).toBe('gap-3');
    expect(getSpacingClasses('gap', 'md')).toBe('gap-4');
    expect(getSpacingClasses('gap', 'lg')).toBe('gap-6');
    expect(getSpacingClasses('gap', 'xl')).toBe('gap-8');
    expect(getSpacingClasses('gap', '2xl')).toBe('gap-12');
    expect(getSpacingClasses('gap', '3xl')).toBe('gap-16');
  });

  it('returns valid space-y and space-x utilities', () => {
    expect(getSpacingClasses('spaceY', 'md')).toBe('space-y-4');
    expect(getSpacingClasses('spaceX', 'lg')).toBe('space-x-6');
  });

  it('returns valid padding and margin utilities', () => {
    expect(getSpacingClasses('padding', 'sm')).toBe('p-3');
    expect(getSpacingClasses('margin', 'xl')).toBe('m-8');
  });
});

describe('layout patterns', () => {
  it('formats stack with spacing gap', () => {
    expect(layout.stack()).toBe('flex flex-col gap-4');
    expect(layout.stack('lg')).toBe('flex flex-col gap-6');
  });

  it('formats inline items with spacing gap', () => {
    expect(layout.inline()).toBe('flex items-center gap-4');
    expect(layout.inline('xs')).toBe('flex items-center gap-2');
  });

  it('formats grid with column count and gap', () => {
    expect(layout.grid(3)).toBe('grid grid-cols-3 gap-4');
    expect(layout.grid(4, 'xl')).toBe('grid grid-cols-4 gap-8');
  });

  it('provides static container and section classes', () => {
    expect(layout.container).toContain('max-w-7xl mx-auto');
    expect(layout.section()).toBe('space-y-8');
    expect(layout.section('md')).toBe('space-y-4');
  });

  it('retrieves functional and static layout classes via getLayoutClasses helper', () => {
    expect(getLayoutClasses('container')).toBe(layout.container);
    expect(getLayoutClasses('flexCenter')).toBe('flex items-center justify-center');
    expect(getLayoutClasses('stack', 'sm')).toBe('flex flex-col gap-3');
    expect(getLayoutClasses('grid', 2, 'xs')).toBe('grid grid-cols-2 gap-2');
  });
});
