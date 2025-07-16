import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AddressDisplay } from '@/components/wallet/AddressDisplay';
import type { Operator } from '@/types/operator';

interface OperatorDetailsHeaderProps {
  operator: Operator;
}

export const OperatorDetailsHeader: React.FC<OperatorDetailsHeaderProps> = ({ operator }) => {
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

  const getOperatorInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="border border-border rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {getOperatorInitial(operator.name)}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{operator.name}</h1>
            <p className="text-lg text-muted-foreground">{operator.domainName}</p>
          </div>
        </div>
        <Badge variant={getStatusVariant(operator.status)} className="text-sm">
          {operator.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="block text-muted-foreground mb-1">Operator ID</span>
          <span className="font-mono text-foreground">{operator.id}</span>
        </div>
        <div>
          <span className="block text-muted-foreground mb-1">Domain ID</span>
          <span className="font-mono text-foreground">{operator.domainId}</span>
        </div>
        <div className="md:col-span-2">
          <span className="block text-muted-foreground mb-1">Signing Key</span>
          <AddressDisplay
            address={operator.ownerAccount}
            showCopy={true}
            className="font-mono text-foreground"
          />
        </div>
      </div>
    </div>
  );
};
