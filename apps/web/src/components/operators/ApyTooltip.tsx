import React from 'react';
import type { ReturnDetailsWindows } from '@/types/operator';
import { getAPYColor } from '@/lib/formatting';

interface ApyTooltipProps {
  windows?: ReturnDetailsWindows;
}

export const ApyTooltip: React.FC<ApyTooltipProps> = ({ windows }) => {
  const renderRow = (label: string, value?: number, isPrimary = false) => (
    <div className="flex items-center justify-between gap-3 whitespace-nowrap" key={label}>
      <span className={`text-[11px] ${isPrimary ? 'text-white font-medium' : 'text-white/80'}`}>
        {label} {isPrimary && '(displayed)'}
      </span>
      <span
        className={`font-mono ${value !== undefined ? getAPYColor(value) : 'text-white/50'} ${isPrimary ? 'font-semibold' : ''}`}
      >
        {value !== undefined ? `${value.toFixed(2)}%` : 'NA'}
      </span>
    </div>
  );

  const d1 = windows?.d1 ? windows.d1.annualizedReturn * 100 : undefined;
  const d3 = windows?.d3 ? windows.d3.annualizedReturn * 100 : undefined;
  const d7 = windows?.d7 ? windows.d7.annualizedReturn * 100 : undefined;
  const d30 = windows?.d30 ? windows.d30.annualizedReturn * 100 : undefined;

  return (
    <div className="space-y-1.5 min-w-[140px]">
      <div className="text-[11px] text-white/70 mb-1 whitespace-nowrap">Est. APY lookbacks</div>
      {renderRow('1 day', d1, true)}
      {renderRow('3 days', d3)}
      {renderRow('7 days', d7)}
      {renderRow('30 days', d30)}
    </div>
  );
};
export default ApyTooltip;
