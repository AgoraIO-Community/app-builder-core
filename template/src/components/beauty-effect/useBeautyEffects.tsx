import {createHook} from 'customization-implementation';
import React, {useState} from 'react';
import {useEffect, useRef} from 'react';
import AgoraRTC, {ILocalVideoTrack} from 'agora-rtc-sdk-ng';
import BeautyExtension from 'agora-extension-beauty-effect';
import {useRtc} from 'customization-api';

export type BeautyEffectOptions = {
  lighteningContrastLevel: 0 | 1 | 2;
  lighteningLevel: Number;
  smoothnessLevel?: Number;
  sharpnessLevel?: Number;
  rednessLevel?: Number;
};

const extension = new BeautyExtension();
AgoraRTC.registerExtensions([extension]);
const processor = extension.createProcessor();

type BeautyEffectContextValue = {
  beautyEffectsOn: boolean;
  setBeautyEffectsOn: React.Dispatch<React.SetStateAction<boolean>>;
  lighteningContrastLevel: LighteningContrastLevel;
  setLighteningContrastLevel: React.Dispatch<
    React.SetStateAction<LighteningContrastLevel>
  >;
  lighteningLevel: Level;
  setLighteningLevel: React.Dispatch<React.SetStateAction<Level>>;
  smoothnessLevel: Level;
  setSmoothnessLevel: React.Dispatch<React.SetStateAction<Level>>;
  sharpnessLevel: Level;
  setSharpnessLevel: React.Dispatch<React.SetStateAction<Level>>;
  rednessLevel: Level;
  setRednessLevel: React.Dispatch<React.SetStateAction<Level>>;
};
export type LighteningContrastLevel = 0 | 1 | 2;
export type Level = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

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
  });

const BeautyEffectProvider: React.FC = ({children}) => {
  const [beautyEffectsOn, setBeautyEffectsOn] = useState<boolean>(false);
  const [lighteningContrastLevel, setLighteningContrastLevel] =
    useState<LighteningContrastLevel>(2);
  const [lighteningLevel, setLighteningLevel] = useState<Level>(0.4);
  const [smoothnessLevel, setSmoothnessLevel] = useState<Level>(0.6);
  const [sharpnessLevel, setSharpnessLevel] = useState<Level>(0.5);
  const [rednessLevel, setRednessLevel] = useState<Level>(0.5);

  const {RtcEngineUnsafe} = useRtc();
  //@ts-ignore
  const localVideoTrack = RtcEngineUnsafe?.localStream?.video;
  localVideoTrack?.pipe(processor).pipe(localVideoTrack?.processorDestination);

  useEffect(() => {
    if (beautyEffectsOn) {
      applyBeautyEffect();
    } else {
      removeBeautyEffect();
    }
  }, [
    beautyEffectsOn,
    lighteningLevel,
    smoothnessLevel,
    sharpnessLevel,
    rednessLevel,
  ]);

  const removeBeautyEffect = async () => {
    await processor.disable();
  };

  const applyBeautyEffect = async () => {
    //@ts-ignore

    await processor.setOptions({
      lighteningContrastLevel,
      lighteningLevel,
      smoothnessLevel,
      sharpnessLevel,
      rednessLevel,
    });

    processor.enable();
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
      }}>
      {children}
    </BeautyEffectsContext.Provider>
  );
};

const useBeautyEffect = createHook(BeautyEffectsContext);

export {BeautyEffectProvider, useBeautyEffect};
