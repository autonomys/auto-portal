import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const OperatorDetailsLoading: React.FC = () => {
  return (
    <div className="py-12 max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="h-10 bg-muted rounded w-20 animate-pulse" />
        <div className="h-6 w-px bg-border" />
        <div className="h-6 bg-muted rounded w-48 animate-pulse" />
      </div>

      {/* Main Operator Summary Skeleton */}
      <Card className="mb-8 animate-pulse">
        <CardContent className="pt-6">
          {/* Header Section */}
          <div className="inline-lg mb-6">
            <div className="w-16 h-16 bg-muted rounded-full" />
            <div className="flex-1">
              <div className="h-8 bg-muted rounded w-48 mb-2" />
              <div className="h-5 bg-muted rounded w-32" />
            </div>
            <div className="w-16 h-6 bg-muted rounded" />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-muted rounded w-16 mx-auto mb-1" />
                <div className="h-4 bg-muted rounded w-12 mx-auto" />
              </div>
            ))}
          </div>

          {/* Technical Details Section */}
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <div className="h-4 bg-muted rounded w-24 mb-1" />
                <div className="h-4 bg-muted rounded w-8" />
              </div>
              <div>
                <div className="h-4 bg-muted rounded w-24 mb-1" />
                <div className="h-4 bg-muted rounded w-8" />
              </div>
            </div>

            <div className="mb-4">
              <div className="h-4 bg-muted rounded w-24 mb-1" />
              <div className="h-4 bg-muted rounded w-80" />
            </div>

            <div className="h-4 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Actions Skeleton */}
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-12 bg-muted rounded flex-1" />
            <div className="h-12 bg-muted rounded flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
