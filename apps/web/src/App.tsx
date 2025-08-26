import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { router } from './router';
import indexerService from './services/indexer-service';

export const App = () => (
  <ApolloProvider client={indexerService.getClient()}>
    <RouterProvider router={router} />
  </ApolloProvider>
);
