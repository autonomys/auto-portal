import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, side = 'top', className }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [actualSide, setActualSide] = React.useState<typeof side>(side);
  const [coords, setCoords] = React.useState<{
    top: number;
    left: number;
    transform: string;
  } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const calculatePosition = React.useCallback(() => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !tooltip) return;

    const rect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const margin = 8;

    // Decide final side with minimal logic: only left/right can flip
    let nextSide: typeof side = side;
    if (side === 'left' && rect.left - tooltipRect.width - margin < 0) {
      nextSide = 'right';
    } else if (side === 'right' && rect.right + tooltipRect.width + margin > window.innerWidth) {
      nextSide = 'left';
    }

    // Compute fixed coordinates
    let top = 0;
    let left = 0;
    let transform = '';

    if (nextSide === 'left' || nextSide === 'right') {
      top = rect.top + rect.height / 2;
      left = nextSide === 'left' ? rect.left - margin : rect.right + margin;
      transform = nextSide === 'left' ? 'translate(-100%, -50%)' : 'translate(0, -50%)';

      // Clamp vertically so it never clips viewport
      const half = tooltipRect.height / 2;
      const minTop = margin + half;
      const maxTop = window.innerHeight - margin - half;
      top = Math.min(Math.max(top, minTop), maxTop);
    } else {
      top = nextSide === 'top' ? rect.top - margin : rect.bottom + margin;
      left = rect.left + rect.width / 2;
      transform = nextSide === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)';

      // Keep horizontally within viewport a bit (simple clamp)
      const half = tooltipRect.width / 2;
      const minLeft = margin + half;
      const maxLeft = window.innerWidth - margin - half;
      left = Math.min(Math.max(left, minLeft), maxLeft);
    }

    setActualSide(nextSide);
    setCoords({ top, left, transform });
  }, [side]);

  React.useLayoutEffect(() => {
    if (!isVisible) return;
    // Measure after mount
    const id = requestAnimationFrame(() => {
      calculatePosition();
    });
    const handler = () => calculatePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [isVisible, calculatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="relative z-10">{children}</div>
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={cn(
              'fixed z-50 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg w-max max-w-[280px]',
              className,
            )}
            style={{
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              transform: coords?.transform,
              pointerEvents: 'none',
              visibility: coords ? 'visible' : 'hidden',
            }}
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 bg-gray-900 rotate-45',
                actualSide === 'top' && 'top-full left-1/2 -translate-x-1/2 -mt-1',
                actualSide === 'right' && 'right-full top-1/2 -translate-y-1/2 -mr-1',
                actualSide === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
                actualSide === 'left' && 'left-full top-1/2 -translate-y-1/2 -ml-1',
              )}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};
