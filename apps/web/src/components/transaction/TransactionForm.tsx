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
        <CardTitle className="text-h3">{title}</CardTitle>
      </CardHeader>
      <CardContent className="stack-lg">{children}</CardContent>
    </Card>
  );
};
