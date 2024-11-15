/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  ApolloProvider,
  NormalizedCacheObject,
  ApolloLink,
  // from,
} from '@apollo/client';
import React, {createContext, useContext, useEffect, useState} from 'react';
import getUniqueID from '../../src/utils/getUniqueID';
import StorageContext from './StorageContext';

export const GraphQLContext = createContext<{
  client: ApolloClient<NormalizedCacheObject>;
}>({
  //@ts-ignore
  client: {},
});

const httpLink = createHttpLink({
  uri: `${$config.BACKEND_ENDPOINT}/v1/query`,
  credentials: 'include',
});

const cache = new InMemoryCache();

const DEFAULT_CLIENT = new ApolloClient({
  link: httpLink,
  cache: cache,
});

const authLink = (token: string) => {
  /**
   * Below we create a new link, whenever a token changes, set
   * context with headers and forward the link so as to
   * execute the next link in the chain
   */
  return new ApolloLink((operation, forward) => {
    if (token) {
      operation.setContext(({headers = {}}) => ({
        headers: {
          ...headers,
          'X-Project-ID': $config.PROJECT_ID,
          'X-Platform-ID': 'turnkey_web',
          ...(token && {
            authorization: token ? `Bearer ${token}` : '',
          }),
        },
      }));
    }
    return forward(operation);
  });
};

const GraphQLProvider = (props: {children: React.ReactNode}) => {
  const {store} = useContext(StorageContext);
  const [client, setClient] = useState(DEFAULT_CLIENT);

  // useEffect(() => {
  //   setClient(
  //     new ApolloClient({
  //       link: authLink(store?.token).concat(httpLink),
  //       cache: new InMemoryCache(),
  //     }),
  //   );
  // }, [store?.token]);

  useEffect(() => {
    if (!store?.token) {
      return;
    }
    (async () => {
      const link = authLink(store?.token).concat(httpLink);
      setClient(new ApolloClient({link, cache}));
    })();
  }, [store?.token]);

  // const errorLink = onError(
  //   ({graphQLErrors, networkError, operation, forward}) => {
  //     // To retry on network errors, we recommend the RetryLink
  //     // instead of the onError link. This just logs the error.
  //     if (networkError) {

  //       // switch (err.extensions.code) {
  //       //   // Apollo Server sets code to UNAUTHENTICATED
  //       //   // when an AuthenticationError is thrown in a resolver
  //       //   case 'UNAUTHENTICATED':
  //       //     // Modify the operation context with a new token
  //       //     const oldHeaders = operation.getContext().headers;
  //       //     operation.setContext({
  //       //       headers: {
  //       //         ...oldHeaders,
  //       //         authorization: getNewToken(),
  //       //       },
  //       //     });
  //       //     // Retry the request, returning the new observable
  //       //     return forward(operation);
  //       // }
  //     }
  //   },
  // );

  return (
    <GraphQLContext.Provider value={{client: client}}>
      <ApolloProvider client={client}>{props.children}</ApolloProvider>
    </GraphQLContext.Provider>
  );
};

export default GraphQLProvider;
