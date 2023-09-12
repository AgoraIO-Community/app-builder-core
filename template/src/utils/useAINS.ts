import {useEffect, useRef} from 'react';
import {useRtc} from 'customization-api';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {AIDenoiserExtension} from 'agora-extension-ai-denoiser';
//@ts-ignore
import wasm1 from './../../node_modules/agora-extension-ai-denoiser/external/denoiser-wasm.wasm';
//@ts-ignore
import wasm2 from './../../node_modules/agora-extension-ai-denoiser/external/denoiser-wasm-simd.wasm';
// Necessary To bypass treeshaking, dont remove
console.log('wasm files loaded are', wasm1, wasm2);

const useAINS = () => {
  const {RtcEngineUnsafe} = useRtc();
  let processor = useRef(null);

  useEffect(() => {
    if ($config.ENABLE_AINS) {
      const denoiserExtension = new AIDenoiserExtension({assetsPath: 'wasm'});
      AgoraRTC.registerExtensions([denoiserExtension]);
      processor.current = denoiserExtension.createProcessor();
      processor.current.disable();
    }
  }, []);

  const enableNoiseSuppression = async () => {
    //@ts-ignore
    const localAudioTrack = RtcEngineUnsafe?.localStream?.audio;

    if (processor?.current) {
      localAudioTrack
        ?.pipe(processor.current)
        .pipe(localAudioTrack?.processorDestination);
      await processor?.current?.enable();
    }
  };

  const disableNoiseSuppression = async () => {
    if (processor?.current) {
      await processor?.current?.disable();
    }
  };

  return {
    enableNoiseSuppression,
    disableNoiseSuppression,
  };
};

export default useAINS;
