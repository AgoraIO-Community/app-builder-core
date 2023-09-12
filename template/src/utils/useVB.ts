import {useEffect, useRef} from 'react';
import {useRtc} from 'customization-api';
import AgoraRTC from 'agora-rtc-sdk-ng';
import VirtualBackgroundExtension from 'agora-extension-virtual-background';
//@ts-ignore
import wasm1 from './../../node_modules/agora-extension-virtual-background/wasms/agora-wasm.wasm';
//@ts-ignore
import image from './book.jpg';
// Necessary To bypass treeshaking, dont remove
console.log('VB wasm file loaded are', wasm1, image);

const useVB = () => {
  const {RtcEngineUnsafe} = useRtc();
  let processor =
    useRef<ReturnType<VirtualBackgroundExtension['_createProcessor']>>(null);

  useEffect(() => {
    const vbExtension = new VirtualBackgroundExtension();
    AgoraRTC.registerExtensions([vbExtension]);
    processor.current = vbExtension.createProcessor();
    processor.current.init(wasm1).then(() => {
      processor.current.disable();
    });
  }, []);

  const colorVB = async () => {
    //@ts-ignore
    const localVideoTrack = RtcEngineUnsafe?.localStream?.video;

    if (processor.current) {
      localVideoTrack
        ?.pipe(processor.current)
        .pipe(localVideoTrack?.processorDestination);
      processor.current.setOptions({type: 'color', color: '#00ff00'});
      await processor?.current?.enable();
    }
  };

  const blurVB = async () => {
    //@ts-ignore
    const localVideoTrack = RtcEngineUnsafe?.localStream?.video;

    if (processor.current) {
      localVideoTrack
        ?.pipe(processor.current)
        .pipe(localVideoTrack?.processorDestination);
      processor.current.setOptions({blurDegree: 3, type: 'blur'});
      await processor?.current?.enable();
    }
  };

  const imageVB = async () => {
    //@ts-ignore
    const localVideoTrack = RtcEngineUnsafe?.localStream?.video;
    let htmlElement = document.createElement('img');
    // htmlElement.crossorigin = 'anonymous'
    htmlElement.src = image;
    htmlElement.onload = async () => {
      if (processor.current) {
        localVideoTrack
          ?.pipe(processor.current)
          .pipe(localVideoTrack?.processorDestination);
        processor.current.setOptions({source: htmlElement, type: 'img'});
        await processor?.current?.enable();
      }
    };
  };

  const disableVB = async () => {
    if (processor.current) {
      await processor?.current?.disable();
    }
  };

  return {
    colorVB,
    imageVB,
    blurVB,
    disableVB,
  };
};

export default useVB;
