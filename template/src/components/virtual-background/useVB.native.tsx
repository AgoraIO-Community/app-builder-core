import {createHook} from 'customization-implementation';
import React from 'react';

import {IconsInterface} from '../../atoms/CustomIcon';
import {ILocalVideoTrack} from 'agora-rtc-sdk-ng';
import {retrieveImagesFromAsyncStorage} from './VButils.native';
import RtcEngine, {
  Color,
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
  VirtualBackgroundBlurDegree,
  VirtualBackgroundSource,
  VirtualBackgroundSourceStateReason,
  VirtualBackgroundSourceType,
} from 'react-native-agora';
import {useRtc} from 'customization-api';

export type VBMode = 'blur' | 'image' | 'custom' | 'none';

export type Option = {
  type: VBMode;
  icon: keyof IconsInterface;
  path?: string & {default?: string};
};

type VirtualBackgroundConfig = {
  blurDegree?: number;
  type: 'blur' | 'img' | 'custom'; // Adjust this as needed based on your configuration options
  source?: HTMLImageElement; // Adjust this based on the type of source you expect
};

type VBContextValue = {
  isVBActive: boolean;
  setIsVBActive: React.Dispatch<React.SetStateAction<boolean>>;
  vbMode: VBMode;
  setVBmode: React.Dispatch<React.SetStateAction<VBMode>>;
  selectedImage: string | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  previewVideoTrack: ILocalVideoTrack | null;
  setPreviewVideoTrack: React.Dispatch<React.SetStateAction<ILocalVideoTrack> | null>;
  saveVB: boolean;
  setSaveVB: React.Dispatch<React.SetStateAction<boolean>>;
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  previewVideoEngine: RtcEngine;
  setPreviewVideoEngine: React.Dispatch<React.SetStateAction<RtcEngine>>;
};

export const VBContext = React.createContext<VBContextValue>({
  isVBActive: false,
  setIsVBActive: () => {},
  vbMode: 'none',
  setVBmode: () => {},
  selectedImage: null,
  setSelectedImage: () => {},
  previewVideoTrack: null,
  setPreviewVideoTrack: () => {},
  saveVB: false,
  setSaveVB: () => {},
  options: [],
  setOptions: () => {},
  previewVideoEngine: null,
  setPreviewVideoEngine: () => {},
});

// fn to initialize processors
const initializeProcessors = () => {
  // const mainViewExtension = new VirtualBackgroundExtension();
  // AgoraRTC.registerExtensions([mainViewExtension]);
  // mainViewProcessor = mainViewExtension.createProcessor();
  // mainViewProcessor.init(wasm1).then(() => {
  //   mainViewProcessor.disable();
  // });
  // previewViewProcessor = mainViewExtension.createProcessor();
  // previewViewProcessor.init(wasm1).then(() => {
  //   previewViewProcessor.disable();
  // });
};

const VBProvider: React.FC = ({children}) => {
  const [isVBActive, setIsVBActive] = React.useState<boolean>(false);
  const [vbMode, setVBmode] = React.useState<VBMode>('none');
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [saveVB, setSaveVB] = React.useState(false);
  // can be original video track/clone track
  const [previewVideoTrack, setPreviewVideoTrack] = React.useState<null>(null);
  const [previewVideoEngine, setPreviewVideoEngine] =
    React.useState<RtcEngine>(null);
  const [options, setOptions] = React.useState<Option[]>(() => [
    {type: 'none', icon: 'remove', label: 'None'},
    {type: 'blur', icon: 'blur', label: 'Blur'},
    {type: 'custom', icon: 'add', label: 'Custom'},
    {type: 'image', icon: 'vb', path: require('./images/beach.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/book.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/office.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/bedroom.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/office1.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/earth.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/lamp.jpg')},
    {
      type: 'image',
      icon: 'vb',
      path: require('./images/mountains.jpg'),
    },
    {type: 'image', icon: 'vb', path: require('./images/plants.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/wall.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/sky.jpg')},
  ]);

  const rtc = useRtc();

  React.useEffect(() => {
    initializeProcessors();
  }, []);

  /* Fetch Saved Images from AsyncStorage to show in VBPanel */
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const customImages = await retrieveImagesFromAsyncStorage();
        console.log('retrived from async storage', customImages);
        setOptions((prevOptions: Option[]) => [
          ...prevOptions,
          ...(customImages?.map(
            base64Data =>
              ({
                type: 'image',
                icon: 'vb',
                path: base64Data,
              } as Option),
          ) || []),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle the error as needed
      }
    };

    fetchData();
  }, []);

  const applyVirtualBackgroundToMainView = async (
    config: VirtualBackgroundSource,
    disable = false,
  ) => {
    if (disable) {
      //  await rtc?.RtcEngineUnsafe.disableVideo();
      await rtc?.RtcEngineUnsafe.enableVirtualBackground(false, config);
      // await rtc?.RtcEngineUnsafe.enableVideo();
      // await rtc?.RtcEngineUnsafe.startPreview();
    } else {
      //  await rtc?.RtcEngineUnsafe.disableVideo();
      await rtc?.RtcEngineUnsafe.enableVirtualBackground(true, config);
      // await rtc?.RtcEngineUnsafe.enableVideo();
      // await rtc?.RtcEngineUnsafe.startPreview();
    }
  };

  // Function to apply virtual background to the preview view
  const applyVirtualBackgroundToPreviewView = async (
    config: VirtualBackgroundSource,
    disable = false,
  ) => {
    /*TODO for preview track */
    if (disable) {
      // await rtc?.RtcEngineUnsafe.disableVideo();
      // await previewVideoEngine.enableVirtualBackground(false, config);
      // await previewVideoEngine.enableVideo();
      // await previewVideoEngine.startPreview();
    } else {
      // await previewVideoEngine.enableVirtualBackground(true, config);
      // await previewVideoEngine.enableVideo();
      // await previewVideoEngine.startPreview();
    }
  };

  /* VB Change modes */
  React.useEffect(() => {
    switch (vbMode) {
      case 'blur':
        blurVB();
        break;
      case 'image':
        imageVB();
        break;
      case 'none':
        disableVB();
        break;
      default:
        disableVB();
    }
  }, [vbMode, selectedImage, saveVB, previewVideoTrack]);

  React.useEffect(() => {}, []);

  const blurVB = async () => {
    const blurConfig: VirtualBackgroundSource = new VirtualBackgroundSource({
      backgroundSourceType: VirtualBackgroundSourceType.Blur,
      blur_degree: VirtualBackgroundBlurDegree.Medium,
    });
    if (saveVB) {
      await applyVirtualBackgroundToMainView(blurConfig);
    } else {
      await applyVirtualBackgroundToMainView(blurConfig);
    }
  };

  const imageVB = async () => {
    const imgConfig: VirtualBackgroundSource = new VirtualBackgroundSource({
      backgroundSourceType: VirtualBackgroundSourceType.Img,
      source: selectedImage,
    });
    // const imagePath = selectedImage;
    // let htmlElement = document.createElement('img');
    // const imgConfig: VirtualBackgroundConfig = {
    //   source: htmlElement,
    //   type: 'img',
    // };
    // // htmlElement.crossorigin = 'anonymous'
    // htmlElement.src =
    //   //@ts-ignore
    //   typeof imagePath === 'string' ? imagePath : imagePath?.default || '';
    // htmlElement.onload = async () => {

    // this.virtualSource = new VirtualBackgroundSource({
    //   backgroundSourceType: VirtualBackgroundSourceType.Img,
    //   source: RNFS.DocumentDirectoryPath + '/img.png',
    // })
    if (saveVB) {
      await applyVirtualBackgroundToMainView(imgConfig);
    } else {
      await applyVirtualBackgroundToPreviewView(imgConfig);
    }
  };

  const disableVB = async () => {
    const disableConfig: VirtualBackgroundSource = new VirtualBackgroundSource(
      {},
    );
    if (saveVB) {
      await applyVirtualBackgroundToMainView(disableConfig, true);
    } else {
      await applyVirtualBackgroundToMainView(disableConfig, true);
    }
  };

  return (
    <VBContext.Provider
      value={{
        isVBActive,
        setIsVBActive,
        vbMode,
        setVBmode,
        selectedImage,
        setSelectedImage,
        previewVideoTrack,
        setPreviewVideoTrack,
        saveVB,
        setSaveVB,
        options,
        setOptions,
        previewVideoEngine,
        setPreviewVideoEngine,
      }}>
      {children}
    </VBContext.Provider>
  );
};

const useVB = createHook(VBContext);

export {VBProvider, useVB};
