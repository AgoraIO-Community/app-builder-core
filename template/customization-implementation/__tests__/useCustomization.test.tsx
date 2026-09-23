import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {describe, expect, it, jest} from '@jest/globals';

jest.mock('customization', () => ({
  __esModule: true,
  default: {
    lifecycle: {
      beforeEndCall: jest.fn(),
    },
  },
}));

jest.mock('../../src/components/SdkApiContext', () => {
  const ReactModule = require('react');

  return {
    SdkApiContext: ReactModule.createContext({customize: {}}),
  };
});

import customizationConfig from 'customization';
import {SdkApiContext} from '../../src/components/SdkApiContext';
import {CustomizationProvider, useCustomization} from '../useCustomization';

const Consumer = ({onRender}: {onRender: (value: unknown) => void}) => {
  onRender(useCustomization());
  return null;
};

describe('CustomizationProvider', () => {
  it('uses the default customization until SDK customization is available', () => {
    const onRender = jest.fn();
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <CustomizationProvider>
          <Consumer onRender={onRender} />
        </CustomizationProvider>,
      );
    });

    expect(onRender).toHaveBeenLastCalledWith(customizationConfig);
    renderer.unmount();
  });

  it('uses customization supplied through the SDK', () => {
    const onRender = jest.fn();
    const customization = {lifecycle: {onDeepLink: jest.fn()}};
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <SdkApiContext.Provider
          value={{customize: {customization}} as React.ContextType<
            typeof SdkApiContext
          >}>
          <CustomizationProvider>
            <Consumer onRender={onRender} />
          </CustomizationProvider>
        </SdkApiContext.Provider>,
      );
    });

    expect(onRender).toHaveBeenLastCalledWith(customization);
    renderer.unmount();
  });
});
