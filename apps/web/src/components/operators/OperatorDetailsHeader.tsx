import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card>
      <CardContent className="pt-6">
        <div className="inline-lg mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-2xl text-code">
              {getOperatorInitial(operator.name)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-h1">{operator.name}</h1>
            <p className="text-body text-muted-foreground">Domain: {operator.domainName}</p>
          </div>
          <Badge variant={getStatusVariant(operator.status)} className="text-sm">
            {operator.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-label text-muted-foreground block mb-1">Operator ID</span>
            <span className="text-code">{operator.id}</span>
          </div>
          <div>
            <span className="text-label text-muted-foreground block mb-1">Domain ID</span>
            <span className="text-code">{operator.domainId}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-label text-muted-foreground block mb-1">Signing Key</span>
            <AddressDisplay address={operator.ownerAccount} showCopy={true} className="text-code" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
