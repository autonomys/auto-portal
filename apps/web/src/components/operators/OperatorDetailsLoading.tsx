import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const OperatorDetailsLoading: React.FC = () => {
  return (
    <div className="py-12 max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <Card className="animate-pulse mb-8">
        <CardContent className="pt-6">
          <div className="inline-lg mb-6">
            <div className="w-16 h-16 bg-muted rounded-full" />
            <div className="flex-1">
              <div className="h-8 bg-muted rounded w-48 mb-2" />
              <div className="h-5 bg-muted rounded w-32" />
            </div>
            <div className="w-16 h-6 bg-muted rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </CardContent>
      </Card>

      <div className="stack-lg">
        {/* Pool Stats Skeleton */}
        <Card className="animate-pulse">
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
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-40" />
          </CardHeader>
          <CardContent>
            <div className="stack-md">
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
    </div>
  );
};
