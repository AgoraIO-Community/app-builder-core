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
  // from,
} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
// import useMount from './useMount';
import React, {createContext, useContext, useRef} from 'react';
import StorageContext from './StorageContext';
import AsyncStorage from '@react-native-community/async-storage';
// import {onError} from '@apollo/client/link/error';

export const GraphQLContext = createContext<{
  client: ApolloClient<NormalizedCacheObject>;
}>({client: {}});

const GraphQLProvider = (props: {children: React.ReactNode}) => {
  const httpLink = createHttpLink({
    uri: `${$config.BACKEND_ENDPOINT}/query`,
    credentials: 'include',
  });
  const {store} = useContext(StorageContext);
  const authLink = setContext(async (_, {headers}) => {
    // get the authentication token from local storage if it exists
    // return the headers to the context so httpLink can read them
    const storeString = await AsyncStorage.getItem('store');
    let token;
    if (storeString) {
      token = JSON.parse(storeString).token;
    }

    console.log('link module token', storeString);
    return {
      headers: {
        ...headers,
        'X-Project-ID': $config.PROJECT_ID,
        'X-Platform-ID': 'turnkey_web',
        ...(token && {authorization: token ? `Bearer ${token}` : ''}),
      },
    };
  });

  // const errorLink = onError(
  //   ({graphQLErrors, networkError, operation, forward}) => {
  //     console.log('supriya graphQLErrors: ', graphQLErrors);
  //     // To retry on network errors, we recommend the RetryLink
  //     // instead of the onError link. This just logs the error.
  //     if (networkError) {
  //       console.log(`supriya [Network error]: ${networkError}`);
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

  const client = useRef(
    new ApolloClient({
      link: authLink.concat(httpLink),
      // link: from([authLink, errorLink, httpLink]),
      cache: new InMemoryCache(),
    }),
  );

  // useEffect(() => {
  //   console.log("store changed", store)
  //   client.current = new ApolloClient({
  //     link: authLink.concat(httpLink),
  //     cache: new InMemoryCache(),
  //   });
  // }, [authLink, httpLink, store]);
  console.log('GraphQL render triggered', store);

  return (
    <GraphQLContext.Provider value={{client: client.current}}>
      <ApolloProvider client={client.current}>{props.children}</ApolloProvider>
    </GraphQLContext.Provider>
  );
};

export default GraphQLProvider;
