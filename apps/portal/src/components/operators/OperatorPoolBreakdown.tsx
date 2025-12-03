import React from 'react';
import { formatAI3 } from '@/lib/formatting';

interface OperatorPoolBreakdownProps {
  totalStaked: string; // AI3 string
  totalStorageFund?: string; // AI3 string
}

export const OperatorPoolBreakdown: React.FC<OperatorPoolBreakdownProps> = ({
  totalStaked,
  totalStorageFund,
}) => {
  const stakedNum = parseFloat(totalStaked || '0');
  const storageNum = parseFloat(totalStorageFund || '0');
  const total = stakedNum + storageNum;

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-gray-300 border-b border-gray-700 pb-1">
        Operator Pool Breakdown
      </div>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-gray-300 whitespace-nowrap">Staked:</span>
          <span className="font-mono text-white">{formatAI3(stakedNum, 4)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-300 whitespace-nowrap">Storage Fund:</span>
          <span className="font-mono text-white">{formatAI3(storageNum, 4)}</span>
        </div>
        <div className="border-t border-gray-700 pt-1 mt-2">
          <div className="flex justify-between gap-6 font-semibold">
            <span className="text-gray-200 whitespace-nowrap">Total Value:</span>
            <span className="font-mono text-white">{formatAI3(total, 4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorPoolBreakdown;
