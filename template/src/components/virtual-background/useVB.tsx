import {createHook} from 'customization-implementation';
import React from 'react';
import {useEffect, useRef} from 'react';
import {SidePanelType, useRtc, useSidePanel} from 'customization-api';
import AgoraRTC, {ILocalVideoTrack} from 'agora-rtc-sdk-ng';
import Image from 'react-native';
import VirtualBackgroundExtension from 'agora-extension-virtual-background';
//@ts-ignore
import wasm1 from '../../../node_modules/agora-extension-virtual-background/wasms/agora-wasm.wasm';
//@ts-ignore

type VBMode = 'blur' | 'image' | 'custom' | 'none';

type ImageOptions = {
  type: 'image';
  icon: string;
  path: string;
};

export type Option = {
  type: VBMode;
  icon: string;
  path?: string;
};

// processors for the main view and preview view
let mainViewProcessor: ReturnType<
  VirtualBackgroundExtension['_createProcessor']
> | null = null;
let previewViewProcessor: ReturnType<
  VirtualBackgroundExtension['_createProcessor']
> | null = null;

// fn to initialize processors
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

type VirtualBackgroundConfig = {
  blurDegree?: number;
  type: 'blur' | 'img' | 'custom'; // Adjust this as needed based on your configuration options
  source?: HTMLImageElement; // Adjust this based on the type of source you expect
};

type VBContextValue = {
  isVBActive: boolean;
  setIsVBActive: React.Dispatch<React.SetStateAction<boolean>>;
  imageVB: () => void;
  disableVB: () => void;
  blurVB: () => void;
  vbMode: VBMode;
  setVBmode: React.Dispatch<React.SetStateAction<VBMode>>;
  selectedImage: string | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  setPreviewVideoTrack: React.Dispatch<React.SetStateAction<ILocalVideoTrack> | null>;
  setSaveVB: React.Dispatch<React.SetStateAction<boolean>>;
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
};

export const VBContext = React.createContext<VBContextValue>({
  isVBActive: false,
  setIsVBActive: () => {},
  imageVB: () => {},
  disableVB: () => {},
  blurVB: () => {},
  vbMode: 'none',
  setVBmode: () => {},
  selectedImage: null,
  setSelectedImage: () => {},
  setPreviewVideoTrack: () => {},
  setSaveVB: () => {},
  options: [],
  setOptions: () => {},
});

const VBProvider: React.FC = ({children}) => {
  const [isVBActive, setIsVBActive] = React.useState<boolean>(false);
  const [vbMode, setVBmode] = React.useState<VBMode>('none');
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [saveVB, setSaveVB] = React.useState(false);
  const {RtcEngineUnsafe} = useRtc();
  // can be original video track/clone track
  const [previewVideoTrack, setPreviewVideoTrack] =
    React.useState<ILocalVideoTrack | null>(null);
  const {sidePanel} = useSidePanel();
  const [options, setOptions] = React.useState<Option[]>(() => [
    {type: 'none', icon: 'remove'},
    {type: 'blur', icon: 'blur'},
    {type: 'custom', icon: 'add'},
    {type: 'image', icon: 'vb', path: require('./images/book.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/beach.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/office.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/bedroom.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/office1.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/earth.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/lamp.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/mountains.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/plants.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/wall.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/sky.jpg')},
  ]);

  let processor =
    useRef<ReturnType<VirtualBackgroundExtension['_createProcessor']>>(null);

  useEffect(() => {
    initializeProcessors();
  }, []);

  const applyVirtualBackgroundToMainView = async (
    config: VirtualBackgroundConfig,
  ) => {
    const localVideoTrack = RtcEngineUnsafe?.localStream?.video;
    //  mainViewProcessor && (await mainViewProcessor.disable()); // Disable the old processor
    localVideoTrack
      ?.pipe(mainViewProcessor)
      .pipe(localVideoTrack?.processorDestination);
    mainViewProcessor.setOptions(config);
    await mainViewProcessor.enable();
  };

  // Function to apply virtual background to the preview view
  const applyVirtualBackgroundToPreviewView = async (
    config: VirtualBackgroundConfig,
  ) => {
    const localVideoTrack = previewVideoTrack; // Use the preview view's video track
    // previewViewProcessor && (await previewViewProcessor.disable()); // Disable the old processor
    localVideoTrack
      ?.pipe(previewViewProcessor)
      .pipe(localVideoTrack?.processorDestination);
    previewViewProcessor.setOptions(config);
    await previewViewProcessor.enable();
  };

  React.useEffect(() => {
    switch (vbMode) {
      case 'blur':
        blurVB();
        break;
      case 'image':
        imageVB();
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
  }, [vbMode, selectedImage, saveVB, previewVideoTrack]);

  const blurVB = async () => {
    const blurConfig: VirtualBackgroundConfig = {blurDegree: 3, type: 'blur'};
    if (saveVB || sidePanel !== SidePanelType.VirtualBackground) {
      applyVirtualBackgroundToMainView(blurConfig);
    } else {
      applyVirtualBackgroundToPreviewView(blurConfig);
    }
  };

  const imageVB = async () => {
    const imagePath = selectedImage;
    let htmlElement = document.createElement('img');
    const imgConfig: VirtualBackgroundConfig = {
      source: htmlElement,
      type: 'img',
    };

    // htmlElement.crossorigin = 'anonymous'
    htmlElement.src =
      typeof imagePath === 'string' ? imagePath : imagePath?.default || '';
    htmlElement.onload = () => {
      if (saveVB || sidePanel !== SidePanelType.VirtualBackground) {
        applyVirtualBackgroundToMainView(imgConfig);
      } else {
        applyVirtualBackgroundToPreviewView(imgConfig);
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
        setPreviewVideoTrack,
        setSaveVB,
        options,
        setOptions,
      }}>
      {children}
    </VBContext.Provider>
  );
};

const useVB = createHook(VBContext);

export {VBProvider, useVB};
