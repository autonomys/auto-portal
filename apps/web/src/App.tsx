import { RouterProvider } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { router } from './router';
import indexerService from './services/indexer-service';
import { config } from './config';

// Conditional Apollo Provider based on indexer feature flag
export const App = () => {
  if (config.features.enableIndexer) {
    return (
      <ApolloProvider client={indexerService.getClient()}>
        <RouterProvider router={router} />
      </ApolloProvider>
    );
  }

  // RPC-only mode - no Apollo Provider needed
  return <RouterProvider router={router} />;
};
