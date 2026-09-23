import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from '../tooltip';

describe('Tooltip', () => {
  it('renders children trigger element', () => {
    render(
      <Tooltip content={<div>Tooltip content</div>}>
        <button>Trigger</button>
      </Tooltip>,
    );

    expect(screen.getByText('Trigger')).toBeDefined();
    expect(screen.queryByText('Tooltip content')).toBeNull();
  });

  it('shows tooltip content on mouse enter and hides on mouse leave when not interactive', () => {
    render(
      <Tooltip content={<div>Tooltip content</div>}>
        <button>Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Trigger');
    fireEvent.mouseEnter(trigger);

    const content = screen.getByText('Tooltip content');
    expect(content).toBeDefined();

    // Default non-interactive tooltip has pointerEvents: 'none'
    const portalContainer = content.closest('div[style*="pointer-events"]');
    expect(portalContainer?.getAttribute('style')).toContain('pointer-events: none');

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText('Tooltip content')).toBeNull();
  });

  it('keeps tooltip visible and enables pointer-events: auto when interactive is true', () => {
    vi.useFakeTimers();

    render(
      <Tooltip interactive content={<a href="https://example.com">Interactive Link</a>}>
        <button>Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Trigger');
    fireEvent.mouseEnter(trigger);

    const link = screen.getByText('Interactive Link');
    expect(link).toBeDefined();

    const portalContainer = link.closest('div[style*="pointer-events"]');
    expect(portalContainer?.getAttribute('style')).toContain('pointer-events: auto');

    // Leaving trigger starts grace period
    fireEvent.mouseLeave(trigger);
    // Still visible within grace period
    expect(screen.getByText('Interactive Link')).toBeDefined();

    // Mouse enters the tooltip content before grace period expires
    if (portalContainer) {
      fireEvent.mouseEnter(portalContainer);
    }
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Remains visible while hovering tooltip
    expect(screen.getByText('Interactive Link')).toBeDefined();

    // Leaving tooltip content closes it after grace period
    if (portalContainer) {
      fireEvent.mouseLeave(portalContainer);
    }
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByText('Interactive Link')).toBeNull();

    vi.useRealTimers();
  });

  it('does not start close timer when moving pointer from tooltip back to trigger container', () => {
    vi.useFakeTimers();

    render(
      <Tooltip interactive content={<a href="https://example.com">Interactive Link</a>}>
        <button>Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Trigger');
    fireEvent.mouseEnter(trigger);

    const link = screen.getByText('Interactive Link');
    const portalContainer = link.closest('div[style*="pointer-events"]');
    expect(portalContainer).not.toBeNull();

    // Mouse leaves tooltip directly to the trigger container
    if (portalContainer) {
      fireEvent.mouseLeave(portalContainer, { relatedTarget: trigger });
    }

    // Advancing timers should not close tooltip because pointer moved to trigger
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('Interactive Link')).toBeDefined();

    // Moving off trigger entirely closes after grace period
    fireEvent.mouseLeave(trigger, { relatedTarget: document.body });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByText('Interactive Link')).toBeNull();

    vi.useRealTimers();
  });
});
