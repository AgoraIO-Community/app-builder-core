import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {describe, expect, it, jest} from '@jest/globals';

jest.mock('customization', () => ({
  __esModule: true,
  default: undefined,
}));

jest.mock('../../src/components/SdkApiContext', () => {
  const ReactModule = require('react');

  return {
    SdkApiContext: ReactModule.createContext({customize: {}}),
  };
});

import {CustomizationProvider, useCustomization} from '../useCustomization';

const LifecycleConsumer = ({
  onRender,
}: {
  onRender: (value: unknown) => void;
}) => {
  const {lifecycle} = useCustomization();
  onRender(lifecycle);
  return null;
};

describe('undefined customization fallback', () => {
  it('provides a safe default in the regular web application', () => {
    const onRender = jest.fn();
    let renderer!: TestRenderer.ReactTestRenderer;

    expect(() => {
      act(() => {
        renderer = TestRenderer.create(
          <LifecycleConsumer onRender={onRender} />,
        );
      });
    }).not.toThrow();

    expect(onRender).toHaveBeenLastCalledWith(undefined);
    renderer.unmount();
  });

  it('provides a safe default through CustomizationProvider', () => {
    const onRender = jest.fn();
    let renderer!: TestRenderer.ReactTestRenderer;

    expect(() => {
      act(() => {
        renderer = TestRenderer.create(
          <CustomizationProvider>
            <LifecycleConsumer onRender={onRender} />
          </CustomizationProvider>,
        );
      });
    }).not.toThrow();

    expect(onRender).toHaveBeenLastCalledWith(undefined);
    renderer.unmount();
  });
});
