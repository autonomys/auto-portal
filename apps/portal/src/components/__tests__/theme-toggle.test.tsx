import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ThemeToggle } from '../theme-toggle';

const { cyclePreference } = vi.hoisted(() => ({ cyclePreference: vi.fn() }));

vi.mock('@auto-portal/shared-state', () => ({
  useThemeStore: (
    selector: (state: {
      preference: 'light';
      isDarkMode: boolean;
      cyclePreference: () => void;
    }) => unknown,
  ) => selector({ preference: 'light', isDarkMode: false, cyclePreference }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('offers only the theme button as a tab stop and shows its tooltip on focus', () => {
  const { container } = render(<ThemeToggle />);
  const button = screen.getByRole('button', { name: 'Toggle theme (current: Light mode)' });
  const tabStops = Array.from(container.querySelectorAll<HTMLElement>('button, [tabindex="0"]'));
  expect(tabStops).toEqual([button]);

  act(() => button.focus());
  expect(screen.getByText('Theme: Light mode')).toBeDefined();
  fireEvent.click(button);
  expect(cyclePreference).toHaveBeenCalledOnce();
  act(() => button.blur());
  expect(screen.queryByText('Theme: Light mode')).toBeNull();
});
