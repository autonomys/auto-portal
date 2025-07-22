import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { DashboardPage } from './pages/DashboardPage';
import { OperatorsPage } from './pages/OperatorsPage';
import { OperatorDetailsPage } from './pages/OperatorDetailsPage';
import { StakingPage } from './pages/StakingPage';
import { WithdrawalPage } from './pages/WithdrawalPage';

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
        path: 'operators/:id',
        element: <OperatorDetailsPage />,
      },
      {
        path: 'staking/:operatorId',
        element: <StakingPage />,
      },
      {
        path: 'withdraw/:operatorId',
        element: <WithdrawalPage />,
      },
    ],
  },
]);
