import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionFormProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-serif">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
};