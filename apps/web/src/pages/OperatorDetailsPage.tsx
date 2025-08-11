import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOperatorDetails } from '@/hooks/use-operator-details';
import { useOperatorPosition } from '@/hooks/use-positions';
import {
  OperatorDetailsHeader,
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
      <div className="py-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/operators')} className="font-sans">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <span className="text-muted-foreground font-sans">Operator Not Found</span>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
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
              <h2 className="text-h3 mb-2">Operator Not Found</h2>
              <p className="text-body text-muted-foreground mb-6">
                {error || 'The requested operator could not be found or may not exist.'}
              </p>
              <Button onClick={() => navigate('/operators')} className="font-sans">
                Back to Operators
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/operators')} className="font-sans">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Operators
        </Button>
        <div className="h-6 w-px bg-border" />
        <h1 className="text-xl font-serif font-semibold text-foreground">{operator.name}</h1>
      </div>

      {/* Operator Summary with inline actions in the right card */}
      <OperatorDetailsHeader operator={operator} userPosition={position} />
    </div>
  );
};
