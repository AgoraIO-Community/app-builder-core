import {createHook} from 'customization-implementation';
import React, {useState} from 'react';
import {useEffect, useRef} from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {useRtc} from 'customization-api';
import {useVB} from '../virtual-background/useVB';
import {
  SuperClarityExtension,
  SuperClarityEvents,
  SuperClarityProcessor,
} from 'agora-extension-super-clarity';
import {useBeautyEffect} from '../beauty-effect/useBeautyEffects';

const extension = new SuperClarityExtension();
AgoraRTC.registerExtensions([extension]);
const superClarityProcessor = extension.createProcessor();

type SuperClarityContextValue = {
  superClarityOn: boolean;
  setSuperClarityOn: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SuperClarityContext =
  React.createContext<SuperClarityContextValue>({
    superClarityOn: false,
    setSuperClarityOn: () => {},
  });

const SuperClarityProvider: React.FC = ({children}) => {
  const [superClarityOn, setSuperClarityOn] = useState<boolean>(false);
  const {vbProcessor} = useVB();
  const {beautyProcessor} = useBeautyEffect();

  // if ($config.ENABLE_VIRTUAL_BACKGROUND) {
  //   localVideoTrack
  //     ?.pipe(beautyProcessor)
  //     .pipe(vbProcessor)
  //     .pipe(localVideoTrack?.processorDestination);
  // } else {
  //   localVideoTrack
  //     ?.pipe(beautyProcessor)
  //     .pipe(localVideoTrack?.processorDestination);
  // }

  const {RtcEngineUnsafe} = useRtc();
  //@ts-ignore
  const localVideoTrack = RtcEngineUnsafe?.localStream?.video;

  const applySuperClarity = async () => {
    await superClarityProcessor.enable();
  };
  const removeSuperClarity = async () => {
    await superClarityProcessor.disable();
  };

  localVideoTrack
    ?.pipe(vbProcessor)
    ?.pipe(beautyProcessor)
    ?.pipe(superClarityProcessor)
    ?.pipe(localVideoTrack?.processorDestination);

  useEffect(() => {
    if (superClarityOn) {
      applySuperClarity();
    } else {
      removeSuperClarity();
    }
  }, [superClarityOn]);
  return (
    <SuperClarityContext.Provider value={{superClarityOn, setSuperClarityOn}}>
      {children}
    </SuperClarityContext.Provider>
  );
};

const useSuperClarity = createHook(SuperClarityContext);

export {SuperClarityProvider, useSuperClarity};
