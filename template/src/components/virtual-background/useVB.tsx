import {createHook} from 'customization-implementation';
import React from 'react';
import {useEffect, useRef} from 'react';
import {SidePanelType, useRtc, useSidePanel} from 'customization-api';
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
  imageVB: (imagePath: string) => Promise<void>;
  disableVB: () => Promise<void>;
  blurVB: () => Promise<void>;
  vbMode: string;
  setVBmode: React.Dispatch<React.SetStateAction<string>>;
  selectedImage: string;
  setSelectedImage: React.Dispatch<React.SetStateAction<string>>;
}>({
  isVBActive: false,
  setIsVBActive: () => {},
  imageVB: async (imagePath: string) => {},
  disableVB: async () => {},
  blurVB: async () => {},
  vbMode: 'none',
  setVBmode: () => {},
  selectedImage: '',
  setSelectedImage: () => {},
});

// Initialize processors for the main view and preview view
let mainViewProcessor = null;
let previewViewProcessor = null;

// Function to initialize processors
const initializeProcessors = () => {
  const mainViewExtension = new VirtualBackgroundExtension();
  AgoraRTC.registerExtensions([mainViewExtension]);
  mainViewProcessor = mainViewExtension.createProcessor();
  mainViewProcessor.init(wasm1).then(() => {
    mainViewProcessor.disable();
  });

  previewViewProcessor = mainViewExtension.createProcessor();
  previewViewProcessor.init(wasm1).then(() => {
    previewViewProcessor.disable();
  });
};

const VBProvider = ({children}) => {
  const [isVBActive, setIsVBActive] = React.useState<boolean>(false);
  const [vbMode, setVBmode] = React.useState<mode>('none');
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [saveVB, setSaveVB] = React.useState(false);
  const {RtcEngineUnsafe} = useRtc();

  // can be original video track/clone track
  const [videoTrack, setVideoTrack] = React.useState(null);
  const {sidePanel} = useSidePanel();

  let processor =
    useRef<ReturnType<VirtualBackgroundExtension['_createProcessor']>>(null);

  useEffect(() => {
    initializeProcessors();
  }, []);

  const applyVirtualBackgroundToMainView = async options => {
    const localVideoTrack = RtcEngineUnsafe?.localStream?.video;
    //  mainViewProcessor && (await mainViewProcessor.disable()); // Disable the old processor
    localVideoTrack
      ?.pipe(mainViewProcessor)
      .pipe(localVideoTrack?.processorDestination);
    mainViewProcessor.setOptions(options);
    await mainViewProcessor.enable();
  };

  // Function to apply virtual background to the preview view
  const applyVirtualBackgroundToPreviewView = async options => {
    const localVideoTrack = videoTrack; // Use the preview view's video track
    // previewViewProcessor && (await previewViewProcessor.disable()); // Disable the old processor
    localVideoTrack
      ?.pipe(previewViewProcessor)
      .pipe(localVideoTrack?.processorDestination);
    previewViewProcessor.setOptions(options);
    await previewViewProcessor.enable();
  };

  const unpipeProcessor = async () => {
    if (processor.current) {
      await processor.current.unpipe();
    }
  };

  React.useEffect(() => {
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
  }, [vbMode, selectedImage, saveVB, videoTrack]);

  const blurVB = async () => {
    const blurConfig = {blurDegree: 3, type: 'blur'};
    if (saveVB || sidePanel !== SidePanelType.VirtualBackground) {
      applyVirtualBackgroundToMainView(blurConfig);
    } else {
      applyVirtualBackgroundToPreviewView(blurConfig);
    }
  };

  const imageVB = async (imagePath: {default: string}) => {
    let htmlElement = document.createElement('img');

    // htmlElement.crossorigin = 'anonymous'
    htmlElement.src = imagePath.default;
    htmlElement.onload = () => {
      if (saveVB || sidePanel !== SidePanelType.VirtualBackground) {
        applyVirtualBackgroundToMainView({source: htmlElement, type: 'img'});
      } else {
        applyVirtualBackgroundToPreviewView({source: htmlElement, type: 'img'});
      }
    };
  };

  const disableVB = async () => {
    if (saveVB || sidePanel !== SidePanelType.VirtualBackground) {
      await mainViewProcessor.disable();
    } else {
      await previewViewProcessor.disable();
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
        videoTrack,
        setVideoTrack,
        setSaveVB,
      }}>
      {children}
    </VBContext.Provider>
  );
};

const useVB = createHook(VBContext);

export {VBProvider, useVB};
