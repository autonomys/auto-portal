import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { router } from './router';
import indexerService from './services/indexer-service';
import { ThemeProvider } from '@/components/theme/theme-provider';

export const App = () => (
  <ApolloProvider client={indexerService.getClient()}>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </ApolloProvider>
);
