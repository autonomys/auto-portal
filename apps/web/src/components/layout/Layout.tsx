import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  // Use custom className if provided, otherwise use default padding
  const mainClasses = className
    ? `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`
    : `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={mainClasses}>{children}</main>
    </div>
  );
};
