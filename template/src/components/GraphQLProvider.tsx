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
import React, {createContext, useContext, useEffect, useRef} from 'react';
import StorageContext from './StorageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const GraphQLProvider = (props: {children: React.ReactNode}) => {
  const authLink = setContext(async (_, {headers}) => {
    // get the authentication token from local storage if it exists
    // return the headers to the context so httpLink can read them
    const storeString = await AsyncStorage.getItem('store');
    let token;
    if (storeString) {
      token = JSON.parse(storeString).token;
    }
    if (token) {
      return {
        headers: {
          ...headers,
          'X-Project-ID': $config.PROJECT_ID,
          'X-Platform-ID': 'turnkey_web',
          ...(token && {
            authorization: token ? `Bearer ${token}` : '',
          }),
        },
      };
    } else {
      return headers;
    }
  });

  const client = useRef(
    new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    }),
  );

  return (
    <GraphQLContext.Provider value={{client: client.current}}>
      <ApolloProvider client={client.current}>{props.children}</ApolloProvider>
    </GraphQLContext.Provider>
  );
};

export default GraphQLProvider;
