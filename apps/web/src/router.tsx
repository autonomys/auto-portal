import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { DashboardPage } from './pages/DashboardPage';
import { OperatorsPage } from './pages/OperatorsPage';
import { StakingPage } from './pages/StakingPage';

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
        element: <DashboardPage />,
      },
      {
        path: 'operators',
        element: <OperatorsPage />,
      },
      {
        path: 'staking/:operatorId',
        element: <StakingPage />,
      },
    ],
  },
]);
