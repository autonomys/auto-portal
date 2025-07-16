import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const OperatorDetailsLoading: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      {/* Header Skeleton */}
      <div className="border border-border rounded-xl p-6 mb-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded-full" />
            <div>
              <div className="h-8 bg-muted rounded w-48 mb-2" />
              <div className="h-5 bg-muted rounded w-32" />
            </div>
          </div>
          <div className="w-16 h-6 bg-muted rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-muted rounded w-24 mb-1" />
            <div className="h-4 bg-muted rounded w-8" />
          </div>
          <div>
            <div className="h-4 bg-muted rounded w-24 mb-1" />
            <div className="h-4 bg-muted rounded w-8" />
          </div>
          <div className="md:col-span-2">
            <div className="h-4 bg-muted rounded w-24 mb-1" />
            <div className="h-4 bg-muted rounded w-80" />
          </div>
        </div>
      </div>

      {/* Pool Stats Skeleton */}
      <Card className="mb-6 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-muted rounded w-24 mx-auto mb-1" />
                <div className="h-4 bg-muted rounded w-20 mx-auto mb-1" />
                <div className="h-3 bg-muted rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Staking Info Skeleton */}
      <Card className="mb-6 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-4 bg-muted rounded w-24" />
              </div>
            ))}
            <div className="pt-4 border-t border-border">
              <div className="h-5 bg-muted rounded w-48 mb-2" />
              <div className="h-4 bg-muted rounded w-full mb-1" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
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
