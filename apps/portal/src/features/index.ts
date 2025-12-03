import { lazy } from 'react';
import { registerFeatures, type PortalFeatureModule } from '@auto-portal/shared-lib';

// Temporary staking feature module that wraps existing portal pages.
const StakingRoutes = lazy(() =>
  import('../pages/OperatorsPage').then(m => ({ default: m.OperatorsPage })),
);

const stakingFeature: PortalFeatureModule = {
  id: 'staking',
  routeBase: '/staking',
  navLabel: 'Staking',
  routes: StakingRoutes,
};

export const features = registerFeatures([stakingFeature]);
