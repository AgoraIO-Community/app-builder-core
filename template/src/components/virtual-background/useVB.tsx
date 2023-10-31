import {createHook} from 'customization-implementation';
import React, {useContext} from 'react';
import {useEffect, useRef} from 'react';
import {SidePanelType, useRtc, useSidePanel} from 'customization-api';
import AgoraRTC, {ILocalVideoTrack} from 'agora-rtc-sdk-ng';
import Image from 'react-native';
import VirtualBackgroundExtension from 'agora-extension-virtual-background';
//@ts-ignore
import wasm1 from '../../../node_modules/agora-extension-virtual-background/wasms/agora-wasm.wasm';
import {IconsInterface} from '../../atoms/CustomIcon';
import {PropsContext} from '../../../agora-rn-uikit';
//@ts-ignore

export type VBMode = 'blur' | 'image' | 'custom' | 'none';

export type Option = {
  type: VBMode;
  icon: keyof IconsInterface;
  path?: string & {default?: string};
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
  vbMode: VBMode;
  setVBmode: React.Dispatch<React.SetStateAction<VBMode>>;
  selectedImage: string | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  previewVideoTrack: ILocalVideoTrack | null;
  setPreviewVideoTrack: React.Dispatch<React.SetStateAction<ILocalVideoTrack> | null>;
  setSaveVB: React.Dispatch<React.SetStateAction<boolean>>;
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
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
  setSaveVB: () => {},
  options: [],
  setOptions: () => {},
});

// fn to open IndexDB
export const openIndexedDB = async (dbName, version) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, version);

    request.onsuccess = event => {
      const db = event.target.result;
      resolve(db);
    };

    request.onerror = event => {
      reject(event.target.error);
    };
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('images')) {
        const store = db.createObjectStore('images', {
          keyPath: 'id',
          autoIncrement: false,
        });
        store.createIndex('by_id', 'id', {unique: true});
      }
    };
  });
};

//  function to save custom image base64Data to IndexDB
export const saveImagesToIndexDB = async base64Data => {
  try {
    const db = await openIndexedDB('vb-image-db', 1);
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');

    // for (const base64Image of base64Images) {
    const timestampId = new Date().getTime();
    const item = {
      id: timestampId,
      data: base64Data,
    };
    store.add(item);

    await tx.complete;

    console.log('Added images to the store!');
  } catch (error) {
    console.error('Error saving images to IndexedDB:', error);
  }
};

export const retrieveImagesFromIndexDB = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openIndexedDB('vb-image-db', 1);
      const tx = db.transaction('images', 'readonly');
      const store = tx.objectStore('images');
      const cursorRequest = store.openCursor();

      const retrievedImages = [];

      cursorRequest.onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          // Make sure to access the 'data' property of 'cursor.value'
          retrievedImages.push(cursor.value.data);
          cursor.continue();
        } else {
          console.log('Retrieved images from IndexedDB:', retrievedImages);
          resolve(retrievedImages); // Resolve the promise with retrieved images
        }
      };
    } catch (error) {
      console.error('Error retrieving images from IndexedDB:', error);
      reject(error); // Reject the promise if there's an error
    }
  });
};
//TODO: export methods as utils

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

  const {
    rtcProps: {callActive},
  } = useContext(PropsContext);

  const isPreCallScreen = !callActive;

  let processor =
    useRef<ReturnType<VirtualBackgroundExtension['_createProcessor']>>(null);

  useEffect(() => {
    initializeProcessors();
  }, []);

  //if vitrual got closed by some other settings/chat panel then update the state
  //ex: user open vitrual background using more menu and then open chat will hide the vitrual background panel
  //so we need to update the state
  useEffect(() => {
    if (sidePanel !== SidePanelType.VirtualBackground) {
      setIsVBActive(false);
    }
  }, [sidePanel]);

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
    if (!localVideoTrack) return;
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
      case 'none':
        disableVB();
        break;
      default:
        disableVB();
    }
  }, [vbMode, selectedImage, saveVB, previewVideoTrack]);

  React.useEffect(() => {
    const fetchData = async () => {
      // Retrieve custom images from IndexDB during component initialization
      const customImages = await retrieveImagesFromIndexDB();

      setOptions(prevOptions => [
        ...prevOptions,
        ...(customImages?.map(base64Data => ({
          type: 'image',
          icon: 'vb',
          path: base64Data,
        })) || []),
      ]);
    };

    fetchData();
  }, []);

  const blurVB = async () => {
    const blurConfig: VirtualBackgroundConfig = {blurDegree: 3, type: 'blur'};
    !isPreCallScreen && applyVirtualBackgroundToPreviewView(blurConfig);
    if (saveVB || isPreCallScreen) {
      applyVirtualBackgroundToMainView(blurConfig);
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
      !isPreCallScreen && applyVirtualBackgroundToPreviewView(imgConfig);
      if (saveVB || isPreCallScreen) {
        applyVirtualBackgroundToMainView(imgConfig);
      }
    };
  };

  const disableVB = async () => {
    if (saveVB || isPreCallScreen) {
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
        vbMode,
        setVBmode,
        selectedImage,
        setSelectedImage,
        previewVideoTrack,
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
