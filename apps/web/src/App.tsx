import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { router } from './router';
import indexerService from './services/indexer-service';
import { ThemeProvider } from './contexts/theme-context';

export const App = () => (
  <ThemeProvider>
    <ApolloProvider client={indexerService.getClient()}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </ThemeProvider>
);
