import React from 'react';

export interface PortalFeatureModule {
  id: string;
  routeBase: string;
  navLabel: string;
  Icon?: React.ComponentType;
  routes: React.LazyExoticComponent<React.ComponentType<{}>>;
  register?: () => void;
}

export type RegisteredFeatures = readonly PortalFeatureModule[];

export const registerFeatures = (modules: PortalFeatureModule[]): RegisteredFeatures => {
  return modules as RegisteredFeatures;
};
