import {createHook} from 'customization-implementation';
import React, {useState} from 'react';
import {useEffect, useRef} from 'react';
import AgoraRTC, {ILocalVideoTrack} from 'agora-rtc-sdk-ng';
import BeautyExtension from 'agora-extension-beauty-effect';
import {useRoomInfo, useRtc} from 'customization-api';
import {useVB} from '../virtual-background/useVB';

export type BeautyEffects = {
  lighteningContrastLevel?: 0 | 1 | 2;
  lighteningLevel?: Number;
  smoothnessLevel?: Number;
  sharpnessLevel?: Number;
  rednessLevel?: Number;
};

export type BeautyProcessorType = ReturnType<
  BeautyExtension['_createProcessor']
> | null;

const extension = new BeautyExtension();
AgoraRTC.registerExtensions([extension]);
const beautyProcessor = extension.createProcessor();

type BeautyEffectContextValue = {
  beautyEffectsOn: boolean;
  setBeautyEffectsOn: React.Dispatch<React.SetStateAction<boolean>>;
  lighteningContrastLevel: LighteningContrastLevel;
  setLighteningContrastLevel: React.Dispatch<
    React.SetStateAction<LighteningContrastLevel>
  >;
  lighteningLevel: number;
  setLighteningLevel: React.Dispatch<React.SetStateAction<number>>;
  smoothnessLevel: number;
  setSmoothnessLevel: React.Dispatch<React.SetStateAction<number>>;
  sharpnessLevel: number;
  setSharpnessLevel: React.Dispatch<React.SetStateAction<number>>;
  rednessLevel: number;
  setRednessLevel: React.Dispatch<React.SetStateAction<number>>;
  applyBeautyEffect: (config?: BeautyEffects) => void;
  removeBeautyEffect: () => void;
  beautyProcessor: BeautyProcessorType;
};
export type LighteningContrastLevel = 0 | 1 | 2;

export const BeautyEffectsContext =
  React.createContext<BeautyEffectContextValue>({
    beautyEffectsOn: false,
    setBeautyEffectsOn: () => {},
    lighteningContrastLevel: 2,
    setLighteningContrastLevel: () => {},
    lighteningLevel: 0.4,
    setLighteningLevel: () => {},
    smoothnessLevel: 0.6,
    setSmoothnessLevel: () => {},
    sharpnessLevel: 0.5,
    setSharpnessLevel: () => {},
    rednessLevel: 0.5,
    setRednessLevel: () => {},
    applyBeautyEffect: () => {},
    removeBeautyEffect: () => {},
    beautyProcessor: null,
  });

const BeautyEffectProvider: React.FC = ({children}) => {
  const [beautyEffectsOn, setBeautyEffectsOn] = useState<boolean>(false);
  const [lighteningContrastLevel, setLighteningContrastLevel] =
    useState<LighteningContrastLevel>(2);
  const [lighteningLevel, setLighteningLevel] = useState<number>(0.4);
  const [smoothnessLevel, setSmoothnessLevel] = useState<number>(0.6);
  const [sharpnessLevel, setSharpnessLevel] = useState<number>(0.5);
  const [rednessLevel, setRednessLevel] = useState<number>(0.5);

  const {roomPreference} = useRoomInfo();

  const {vbProcessor} = useVB();

  const {RtcEngineUnsafe} = useRtc();
  //@ts-ignore
  const localVideoTrack = RtcEngineUnsafe?.localStream?.video;

  if (!roomPreference?.disableVideoProcessors) {
    if ($config.ENABLE_VIRTUAL_BACKGROUND) {
      localVideoTrack
        ?.pipe(beautyProcessor)
        .pipe(vbProcessor)
        .pipe(localVideoTrack?.processorDestination);
    } else {
      localVideoTrack
        ?.pipe(beautyProcessor)
        .pipe(localVideoTrack?.processorDestination);
    }
  }

  useEffect(() => {
    if (beautyEffectsOn) {
      applyBeautyEffect({
        lighteningContrastLevel,
        lighteningLevel,
        smoothnessLevel,
        sharpnessLevel,
        rednessLevel,
      });
    } else {
      removeBeautyEffect();
    }
  }, [
    beautyEffectsOn,
    lighteningLevel,
    smoothnessLevel,
    sharpnessLevel,
    rednessLevel,
    lighteningContrastLevel,
  ]);

  const removeBeautyEffect = async () => {
    await beautyProcessor.disable();
  };

  const applyBeautyEffect = async (config: BeautyEffects) => {
    //@ts-ignore
    await beautyProcessor.setOptions(config);
    beautyProcessor.enable();
  };

  return (
    <BeautyEffectsContext.Provider
      value={{
        beautyEffectsOn,
        setBeautyEffectsOn,
        lighteningContrastLevel,
        setLighteningContrastLevel,
        lighteningLevel,
        setLighteningLevel,
        smoothnessLevel,
        setSmoothnessLevel,
        sharpnessLevel,
        setSharpnessLevel,
        rednessLevel,
        setRednessLevel,
        applyBeautyEffect,
        removeBeautyEffect,
        beautyProcessor,
      }}>
      {children}
    </BeautyEffectsContext.Provider>
  );
};

const useBeautyEffect = createHook(BeautyEffectsContext);

export {BeautyEffectProvider, useBeautyEffect};
