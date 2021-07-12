import React from 'react'
import { render } from '@testing-library/react-native'
import {StorageProvider} from './src/components/StorageContext';
import GraphQLProvider from './src/components/GraphQLProvider';
import {SessionProvider} from './src/components/SessionContext';


const AllTheProviders = ({ children }) => {
  return (
    <StorageProvider>
      <GraphQLProvider>
          <SessionProvider>
            {children}
        </SessionProvider>
      </GraphQLProvider>
    </StorageProvider>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react-native'

// override render method
export { customRender as render }