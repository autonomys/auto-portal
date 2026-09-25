import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Tooltip } from '../tooltip';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const renderTooltip = () => {
  vi.useFakeTimers();
  render(
    <>
      <Tooltip interactive content={<a href="https://example.com">Primer</a>}>
        <span>Balance</span>
      </Tooltip>
      <button>Stake</button>
    </>,
  );
  const trigger = screen.getByText('Balance').closest('[tabindex]') as HTMLElement;
  act(() => trigger.focus());
  act(() => vi.advanceTimersByTime(20));
  return trigger;
};

// jsdom does not implement native Tab navigation. These fixtures contain only
// enabled buttons, anchors and tabindex=0 elements, in their native DOM order.
const moveSequentialFocus = (backward = false) => {
  const tabbables = [...document.querySelectorAll<HTMLElement>('a[href], button, [tabindex="0"]')];
  const index = tabbables.indexOf(document.activeElement as HTMLElement);
  act(() => tabbables[index + (backward ? -1 : 1)].focus());
};

it('keeps the primer reachable between the trigger and the following page control', () => {
  renderTooltip();
  const link = screen.getByRole('link', { name: 'Primer' });
  moveSequentialFocus();
  expect(document.activeElement).toBe(link);
  act(() => vi.advanceTimersByTime(200));
  expect(screen.getByRole('link', { name: 'Primer' })).toBe(link);
  moveSequentialFocus();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Stake' }));
  act(() => vi.advanceTimersByTime(200));
  expect(screen.queryByRole('link', { name: 'Primer' })).toBeNull();
});

it('allows reverse navigation from the primer back to its trigger', () => {
  const trigger = renderTooltip();
  moveSequentialFocus();
  expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Primer' }));
  moveSequentialFocus(true);
  expect(document.activeElement).toBe(trigger);
  act(() => vi.advanceTimersByTime(200));
  expect(screen.getByRole('link', { name: 'Primer' })).toBeDefined();
});

it('returns focus to the trigger when Escape closes the focused primer', () => {
  const trigger = renderTooltip();
  moveSequentialFocus();
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(document.activeElement).toBe(trigger);
  expect(screen.queryByRole('link', { name: 'Primer' })).toBeNull();
});

it('does not remove a focused primer when the pointer leaves', () => {
  const trigger = renderTooltip();
  moveSequentialFocus();
  const link = screen.getByRole('link', { name: 'Primer' });
  fireEvent.mouseEnter(trigger);
  fireEvent.mouseLeave(trigger, { relatedTarget: document.body });
  act(() => vi.advanceTimersByTime(200));
  expect(document.activeElement).toBe(link);
  expect(screen.getByRole('link', { name: 'Primer' })).toBe(link);
});
