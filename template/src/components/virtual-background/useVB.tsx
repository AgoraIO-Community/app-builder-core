import {createHook} from 'customization-implementation';
import React from 'react';
import {useEffect, useRef} from 'react';
import {useRtc} from 'customization-api';
import AgoraRTC from 'agora-rtc-sdk-ng';
import Image from 'react-native';
import VirtualBackgroundExtension from 'agora-extension-virtual-background';
//@ts-ignore
import wasm1 from '../../../node_modules/agora-extension-virtual-background/wasms/agora-wasm.wasm';
//@ts-ignore

type mode = 'blur' | 'image' | 'custom' | 'none';

export const VBContext = React.createContext<{
  // for vb state
  isVBActive: boolean;
  setIsVBActive: React.Dispatch<React.SetStateAction<boolean>>;
  imageVB: () => Promise<void>;
  disableVB: () => Promise<void>;
  blurVB: () => Promise<void>;
  vbMode: string;
  setVBmode: React.Dispatch<React.SetStateAction<string>>;
  selectedImage: string;
  setSelectedImage: React.Dispatch<React.SetStateAction<string>>;
}>({
  isVBActive: false,
  setIsVBActive: () => {},
  imageVB: async () => {},
  disableVB: async () => {},
  blurVB: async () => {},
  vbMode: 'none',
  setVBmode: () => {},
  selectedImage: '',
  setSelectedImage: () => {},
});

const VBProvider = ({children}) => {
  const [isVBActive, setIsVBActive] = React.useState<boolean>(false);
  const [vbMode, setVBmode] = React.useState<mode>('none');
  const [selectedImage, setSelectedImage] = React.useState(null);
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

  React.useEffect(() => {
    // isVBActive ? imageVB() : disableVB();
    switch (vbMode) {
      case 'blur':
        blurVB();
        break;
      case 'image':
        imageVB(selectedImage);
        break;
      case 'custom':
        //TODO: custom upload
        break;
      case 'none':
        disableVB();
        break;
      default:
        disableVB();
    }
  }, [isVBActive, vbMode, selectedImage]);

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

  const imageVB = async imagePath => {
    //@ts-ignore
    const localVideoTrack = RtcEngineUnsafe?.localStream?.video;
    let htmlElement = document.createElement('img');
    // htmlElement.crossorigin = 'anonymous'
    htmlElement.src = imagePath.default;
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

  return (
    <VBContext.Provider
      value={{
        isVBActive,
        setIsVBActive,
        imageVB,
        disableVB,
        blurVB,
        vbMode,
        setVBmode,
        selectedImage,
        setSelectedImage,
      }}>
      {children}
    </VBContext.Provider>
  );
};

const useVB = createHook(VBContext);

export {VBProvider, useVB};
