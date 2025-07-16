import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOperatorDetails } from '@/hooks/use-operator-details';
import { useOperatorPosition } from '@/hooks/use-positions';
import {
  OperatorDetailsHeader,
  OperatorPoolStats,
  OperatorStakingInfo,
  OperatorActions,
  OperatorDetailsLoading,
} from '@/components/operators';

export const OperatorDetailsPage: React.FC = () => {
  const { id: operatorId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { operator, loading, error } = useOperatorDetails(operatorId || '');
  const { position } = useOperatorPosition(operatorId || '');

  if (loading) {
    return <OperatorDetailsLoading />;
  }

  if (error || !operator) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/operators')} className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Operators
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="ml-2 text-muted-foreground">Not Found</span>
        </div>

        <div className="text-center py-12">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Operator Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || 'The requested operator could not be found or may not exist.'}
          </p>
          <Button onClick={() => navigate('/operators')}>Back to Operators</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/operators')} className="mr-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Operators
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="ml-2 font-medium">{operator.name}</span>
      </div>

      {/* Operator Details */}
      <OperatorDetailsHeader operator={operator} />
      <OperatorPoolStats operator={operator} />
      <OperatorStakingInfo operator={operator} userPosition={position} />
      <OperatorActions operator={operator} userPosition={position} />
    </div>
  );
};
