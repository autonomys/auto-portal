import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { router } from './router';
import indexerService from './services/indexer-service';
import { useEffect } from 'react';
import { useThemeStore } from '@auto-portal/shared-state';

export const App = () => {
  const initializeTheme = useThemeStore(s => s.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <ApolloProvider client={indexerService.getClient()}>
      <RouterProvider router={router} />
    </ApolloProvider>
  );
};
