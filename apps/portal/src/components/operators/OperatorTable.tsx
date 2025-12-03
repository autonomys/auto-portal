import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatPercentage, getAPYColor, formatNumber } from '@/lib/formatting';
import type { Operator, SortField } from '@/types/operator';
import type { UserPosition } from '@/types/position';
import { useOperatorFilters, useStoredPositions } from '@/hooks/use-operators';
import { Tooltip } from '@/components/ui/tooltip';
import { ApyTooltip } from '@/components/operators/ApyTooltip';
import { OperatorPoolBreakdown } from '@/components/operators/OperatorPoolBreakdown';
import { PositionBreakdown } from '@/components/positions';
import { formatAI3 } from '@/lib/formatting';

interface ActionMenuProps {
  operatorId: string;
  hasPosition: boolean;
  onStake: (operatorId: string) => void;
  onWithdraw: (operatorId: string) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  operatorId,
  hasPosition,
  onStake,
  onWithdraw,
}) => (
  <div className="flex items-center justify-center gap-1">
    <Button size="sm" onClick={() => onStake(operatorId)}>
      Stake
    </Button>
    {hasPosition && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onWithdraw(operatorId)}
            className="text-warning focus:text-warning"
          >
            Withdraw
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  </div>
);

interface OperatorTableProps {
  operators: Operator[];
  stakedOperators?: Operator[];
  loading?: boolean;
  onStake: (operatorId: string) => void;
  onWithdraw: (operatorId: string) => void;
}

interface SortableHeaderProps {
  label: string;
  sortField: SortField;
  currentSortBy: SortField;
  currentSortOrder: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  sortField,
  currentSortBy,
  currentSortOrder,
  onSort,
  align = 'left',
  className = '',
}) => {
  const isActive = currentSortBy === sortField;
  const alignClass =
    align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  const renderSortIcon = () => {
    if (isActive) {
      return currentSortOrder === 'asc' ? (
        <ArrowUp className="h-4 w-4 flex-shrink-0 text-primary" />
      ) : (
        <ArrowDown className="h-4 w-4 flex-shrink-0 text-primary" />
      );
    }
    return (
      <ArrowUpDown className="h-4 w-4 flex-shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
    );
  };

  return (
    <th className={`p-3 sm:p-4 font-medium text-muted-foreground ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortField)}
        className={`
          group flex items-center gap-1.5 ${alignClass} w-full
          hover:text-foreground transition-colors
          ${isActive ? 'text-foreground' : ''}
        `}
      >
        <span>{label}</span>
        {renderSortIcon()}
      </button>
    </th>
  );
};

export const OperatorTable: React.FC<OperatorTableProps> = ({
  operators,
  stakedOperators = [],
  loading = false,
  onStake,
  onWithdraw,
}) => {
  const { positions } = useStoredPositions();
  const { filters, updateSort } = useOperatorFilters();

  const positionByOperatorId = React.useMemo(() => {
    const map = new Map<string, UserPosition>();
    for (const p of positions) {
      map.set(p.operatorId, p);
    }
    return map;
  }, [positions]);

  const operatorIdsWithUserPosition = React.useMemo(() => {
    const ids = new Set<string>();
    for (const position of positions) {
      const hasUserPosition =
        !!position &&
        (position.positionValue > 0 ||
          position.storageFeeDeposit > 0 ||
          (position.pendingDeposit?.amount || 0) > 0);
      if (hasUserPosition) {
        ids.add(position.operatorId);
      }
    }
    return ids;
  }, [positions]);

  const getStatusVariant = (status: Operator['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'inactive':
        return 'outline';
      case 'slashed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getOperatorInitial = (name: string) => name.charAt(0).toUpperCase();

  const handleSort = (field: SortField) => {
    if (filters.sortBy === field) {
      // Toggle sort order if clicking the same field
      updateSort(field, filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      updateSort(field, 'desc');
    }
  };

  const renderTableHeader = () => (
    <thead className="bg-muted/50">
      <tr>
        <SortableHeader
          label="Operator"
          sortField="name"
          currentSortBy={filters.sortBy}
          currentSortOrder={filters.sortOrder}
          onSort={handleSort}
          align="left"
          className="w-[18%]"
        />
        <SortableHeader
          label="Total Value"
          sortField="totalStaked"
          currentSortBy={filters.sortBy}
          currentSortOrder={filters.sortOrder}
          onSort={handleSort}
          align="right"
          className="w-[17%]"
        />
        <SortableHeader
          label="Nominators"
          sortField="nominatorCount"
          currentSortBy={filters.sortBy}
          currentSortOrder={filters.sortOrder}
          onSort={handleSort}
          align="right"
          className="w-[11%]"
        />
        <SortableHeader
          label="Tax"
          sortField="tax"
          currentSortBy={filters.sortBy}
          currentSortOrder={filters.sortOrder}
          onSort={handleSort}
          align="right"
          className="w-[7%]"
        />
        <SortableHeader
          label="Est. APY"
          sortField="apy"
          currentSortBy={filters.sortBy}
          currentSortOrder={filters.sortOrder}
          onSort={handleSort}
          align="right"
          className="w-[10%]"
        />
        <SortableHeader
          label="Status"
          sortField="status"
          currentSortBy={filters.sortBy}
          currentSortOrder={filters.sortOrder}
          onSort={handleSort}
          align="center"
          className="w-[8%]"
        />
        <SortableHeader
          label="Your Position"
          sortField="yourPosition"
          currentSortBy={filters.sortBy}
          currentSortOrder={filters.sortOrder}
          onSort={handleSort}
          align="right"
          className="w-[17%]"
        />
        <th className="text-center p-3 sm:p-4 font-medium text-muted-foreground w-[12%]">
          Actions
        </th>
      </tr>
    </thead>
  );

  const renderOperatorRow = (operator: Operator, index: number, isStaked: boolean) => {
    const userPosition = positionByOperatorId.get(operator.id);
    const hasPosition = operatorIdsWithUserPosition.has(operator.id);

    return (
      <tr
        key={operator.id}
        className={`
          border-t border-border hover:bg-muted/50 transition-colors
          ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
          ${isStaked ? 'bg-primary/5 hover:bg-primary/10' : ''}
        `}
      >
        <td className="p-3 sm:p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {getOperatorInitial(operator.name)}
              </span>
            </div>
            <div className="min-w-0">
              <div className="font-medium text-foreground truncate">{operator.name}</div>
              <div className="text-sm text-muted-foreground">{operator.domainName}</div>
            </div>
          </div>
        </td>

        <td className="p-3 sm:p-4 text-right">
          {operator.totalPoolValue ? (
            <Tooltip
              side="left"
              content={
                <OperatorPoolBreakdown
                  totalStaked={operator.totalStaked}
                  totalStorageFund={operator.totalStorageFund}
                />
              }
            >
              <span className="font-mono font-medium cursor-help">
                {formatNumber(operator.totalPoolValue)} AI3
              </span>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground">--</span>
          )}
        </td>
        <td className="p-3 sm:p-4 text-right">
          {typeof operator.nominatorCount === 'number' ? (
            <span className="font-mono">{formatNumber(operator.nominatorCount)}</span>
          ) : (
            <span className="text-muted-foreground">--</span>
          )}
        </td>
        <td className="p-3 sm:p-4 text-right">
          <span className="font-mono">{formatPercentage(operator.nominationTax)}</span>
        </td>
        <td className="p-3 sm:p-4 text-right">
          {operator.estimatedReturnDetails ? (
            <Tooltip
              side="left"
              content={<ApyTooltip windows={operator.estimatedReturnDetailsWindows} />}
            >
              {(() => {
                const displayApy = operator.estimatedReturnDetails.annualizedReturn * 100;
                return (
                  <span className={`font-mono cursor-help ${getAPYColor(displayApy)}`}>
                    {displayApy.toFixed(2)}%
                  </span>
                );
              })()}
            </Tooltip>
          ) : (
            <span className="text-muted-foreground">NA</span>
          )}
        </td>
        <td className="p-3 sm:p-4 text-center">
          <Badge variant={getStatusVariant(operator.status)}>{operator.status}</Badge>
        </td>
        <td className="p-3 sm:p-4 text-right">
          {(() => {
            if (!userPosition) {
              return null;
            }

            const totalValue =
              userPosition.positionValue +
              userPosition.storageFeeDeposit +
              (userPosition.pendingDeposit?.amount || 0);

            if (totalValue <= 0) {
              return null;
            }

            return (
              <Tooltip side="left" content={<PositionBreakdown position={userPosition} />}>
                <span className="font-mono font-medium cursor-help">
                  {formatAI3(totalValue, 2)}
                </span>
              </Tooltip>
            );
          })()}
        </td>
        <td className="p-3 sm:p-4">
          <ActionMenu
            operatorId={operator.id}
            hasPosition={hasPosition}
            onStake={onStake}
            onWithdraw={onWithdraw}
          />
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full table-fixed min-w-[1000px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground w-[18%]">
                Operator
              </th>
              <th className="text-right p-3 sm:p-4 font-medium text-muted-foreground w-[17%]">
                Total Value
              </th>
              <th className="text-right p-3 sm:p-4 font-medium text-muted-foreground w-[11%]">
                Nominators
              </th>
              <th className="text-right p-3 sm:p-4 font-medium text-muted-foreground w-[7%]">
                Tax
              </th>
              <th className="text-right p-3 sm:p-4 font-medium text-muted-foreground w-[10%]">
                Est. APY
              </th>
              <th className="text-center p-3 sm:p-4 font-medium text-muted-foreground w-[8%]">
                Status
              </th>
              <th className="text-right p-3 sm:p-4 font-medium text-muted-foreground w-[17%]">
                Your Position
              </th>
              <th className="text-center p-3 sm:p-4 font-medium text-muted-foreground w-[12%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, index) => (
              <tr key={index} className="border-t border-border animate-pulse">
                <td className="p-3 sm:p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-32" />
                      <div className="h-3 bg-muted rounded w-20" />
                    </div>
                  </div>
                </td>
                <td className="p-3 sm:p-4 text-right">
                  <div className="h-4 bg-muted rounded w-20 ml-auto" />
                </td>
                <td className="p-3 sm:p-4 text-right">
                  <div className="h-4 bg-muted rounded w-12 ml-auto" />
                </td>
                <td className="p-3 sm:p-4 text-right">
                  <div className="h-4 bg-muted rounded w-12 ml-auto" />
                </td>
                <td className="p-3 sm:p-4 text-right">
                  <div className="h-4 bg-muted rounded w-16 ml-auto" />
                </td>
                <td className="p-3 sm:p-4 text-center">
                  <div className="h-6 bg-muted rounded w-16 mx-auto" />
                </td>
                <td className="p-3 sm:p-4 text-right">
                  <div className="h-4 bg-muted rounded w-20 ml-auto" />
                </td>
                <td className="p-3 sm:p-4">
                  <div className="flex space-x-2 justify-center">
                    <div className="h-8 bg-muted rounded w-14" />
                    <div className="h-8 bg-muted rounded w-8" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const totalOperators = stakedOperators.length + operators.length;

  if (totalOperators === 0) {
    return (
      <div className="border border-border rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No operators found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or filters to find more operators.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed min-w-[1000px]">
          {renderTableHeader()}
          <tbody>
            {/* Staked operators section */}
            {stakedOperators.length > 0 && (
              <>
                {stakedOperators.map((operator, index) => renderOperatorRow(operator, index, true))}
                {/* Section separator */}
                {operators.length > 0 && (
                  <tr className="bg-muted/30">
                    <td colSpan={8} className="py-2 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Discover More Operators
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
            {/* Non-staked operators section */}
            {operators.map((operator, index) => renderOperatorRow(operator, index, false))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
