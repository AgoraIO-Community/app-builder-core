import React, {createContext, useState, useEffect, useRef} from 'react';
import {useRtc} from 'customization-api';
import {ToggleState} from '../../agora-rn-uikit';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {AIDenoiserExtension} from 'agora-extension-ai-denoiser';
//@ts-ignore
import wasm1 from './../../node_modules/agora-extension-ai-denoiser/external/denoiser-wasm.wasm';
//@ts-ignore
import wasm2 from './../../node_modules/agora-extension-ai-denoiser/external/denoiser-wasm-simd.wasm';
import {createHook} from 'customization-implementation';
import {LogSource, logger} from '../logger/AppBuilderLogger';
// Necessary To bypass treeshaking, dont remove
console.log('wasm files loaded are', wasm1, wasm2);

export interface NoiseSupressionContextInterface {
  isNoiseSupressionEnabled: ToggleState;
  setNoiseSupression: (
    p: (currentState: boolean) => boolean | boolean,
  ) => Promise<void>;
}

export const NoiseSupressionContext =
  createContext<NoiseSupressionContextInterface>({
    isNoiseSupressionEnabled: ToggleState.disabled,
    setNoiseSupression: async () => {},
  });

export function NoiseSupressionProvider(props) {
  const {callActive} = props;
  const [isNoiseSupressionEnabled, setIsNoiseSupressionEnabled] = useState(
    ToggleState.disabled,
  );

  const {RtcEngineUnsafe} = useRtc();
  let processor = useRef(null);

  useEffect(() => {
    if (callActive && $config.ENABLE_NOISE_CANCELLATION_BY_DEFAULT) {
      setNoiseSupression(p => !p);
    }
  }, [callActive]);

  useEffect(() => {
    if ($config.ENABLE_NOISE_CANCELLATION) {
      try {
        const denoiserExtension = new AIDenoiserExtension({assetsPath: 'wasm'});
        AgoraRTC.registerExtensions([denoiserExtension]);
        processor.current = denoiserExtension.createProcessor();
        processor.current.disable();
      } catch (error) {
        logger.error(
          LogSource.Internals,
          'NOISE_CANCELLATION',
          'Failed to initiate AIDenoiserExtension',
          error,
        );
      }
    }
  }, []);

  const enableNoiseSuppression = async () => {
    if (!$config.ENABLE_NOISE_CANCELLATION) {
      throw new Error('AINS disabled in config');
    }
    //@ts-ignore
    const localAudioTrack = RtcEngineUnsafe?.localStream?.audio;

    try {
      if (processor?.current) {
        localAudioTrack
          ?.pipe(processor.current)
          .pipe(localAudioTrack?.processorDestination);

        await processor?.current?.enable();
        logger.log(
          LogSource.Internals,
          'NOISE_CANCELLATION',
          'noise suppression enabled',
        );
      }
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'NOISE_CANCELLATION',
        'Failed to enable noise suppression',
        error,
      );
    }
  };

  const disableNoiseSuppression = async () => {
    try {
      if (processor?.current) {
        await processor?.current?.disable();
        logger.log(
          LogSource.Internals,
          'NOISE_CANCELLATION',
          'noise suppression disabled',
        );
      }
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'NOISE_CANCELLATION',
        'Failed to disable noise suppression',
        error,
      );
    }
  };

  const setNoiseSupression: NoiseSupressionContextInterface['setNoiseSupression'] =
    async p => {
      if (
        isNoiseSupressionEnabled === ToggleState.disabling ||
        isNoiseSupressionEnabled === ToggleState.enabling
      ) {
        logger.error(
          LogSource.Internals,
          'NOISE_CANCELLATION',
          'Cant change noise supression, already in transition',
        );
        throw new Error('Cant change noise supression, already in transition');
      }
      let stateToBeSet =
        typeof p === 'function'
          ? p(isNoiseSupressionEnabled === ToggleState.enabled)
          : p;

      if (stateToBeSet) {
        setIsNoiseSupressionEnabled(ToggleState.enabling);
        await enableNoiseSuppression();
        setIsNoiseSupressionEnabled(ToggleState.enabled);
      } else {
        setIsNoiseSupressionEnabled(ToggleState.disabling);
        await disableNoiseSuppression();
        setIsNoiseSupressionEnabled(ToggleState.disabled);
      }
    };

  return (
    <NoiseSupressionContext.Provider
      value={{
        isNoiseSupressionEnabled,
        setNoiseSupression,
      }}>
      {props.children}
    </NoiseSupressionContext.Provider>
  );
}

export const useNoiseSupression = createHook(NoiseSupressionContext);
