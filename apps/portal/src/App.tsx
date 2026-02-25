import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useEffect } from 'react';
import { useThemeStore } from '@auto-portal/shared-state';

export const App = () => {
  const initializeTheme = useThemeStore(s => s.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return <RouterProvider router={router} />;
};
