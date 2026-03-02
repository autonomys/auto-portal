import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { features } from './features';

const LoadingSpinner = () => (
  <div className="flex justify-center py-20">
    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })),
);
const OperatorsPage = lazy(() =>
  import('./pages/OperatorsPage').then(m => ({ default: m.OperatorsPage })),
);
const OperatorDetailPage = lazy(() =>
  import('./pages/OperatorDetailPage').then(m => ({ default: m.OperatorDetailPage })),
);
const StakingPage = lazy(() =>
  import('./pages/StakingPage').then(m => ({ default: m.StakingPage })),
);
const WithdrawalPage = lazy(() =>
  import('./pages/WithdrawalPage').then(m => ({ default: m.WithdrawalPage })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'operators',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OperatorsPage />
          </Suspense>
        ),
      },
      {
        path: 'operators/:operatorId',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OperatorDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'staking/:operatorId',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StakingPage />
          </Suspense>
        ),
      },
      {
        path: 'withdraw/:operatorId',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <WithdrawalPage />
          </Suspense>
        ),
      },
      // Feature modules (lazy)
      ...features.map(f => ({
        path: f.routeBase.replace(/^\//, ''),
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <f.routes />
          </Suspense>
        ),
      })),
    ],
  },
]);
