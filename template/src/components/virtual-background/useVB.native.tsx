import {createHook} from 'customization-implementation';
import React from 'react';
import {IconsInterface} from '../../atoms/CustomIcon';
import {ILocalVideoTrack} from 'agora-rtc-sdk-ng';
import {retrieveImagesFromAsyncStorage} from './VButils.native';

import RtcEngine, {
  VirtualBackgroundBlurDegree,
  VirtualBackgroundSource,
  VirtualBackgroundSourceType,
} from 'react-native-agora';
import {useRtc} from 'customization-api';
import RNFS from 'react-native-fs';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import {ImageSourcePropType} from 'react-native/types';
import imagePathsArray from './imagePaths';
import getUniqueID from '../../../src/utils/getUniqueID';
import {PermissionsAndroid} from 'react-native';
import {isAndroid} from '../../utils/common';

export type VBMode = 'blur' | 'image' | 'custom' | 'none';

export type Option = {
  type: VBMode;
  icon: keyof IconsInterface;
  path?: string & {default?: string};
  label?: string;
  id?: string;
};

type VBContextValue = {
  isVBActive: boolean;
  setIsVBActive: React.Dispatch<React.SetStateAction<boolean>>;
  vbMode: VBMode;
  setVBmode: React.Dispatch<React.SetStateAction<VBMode>>;
  selectedImage: ImageSourcePropType | string | null;
  setSelectedImage: React.Dispatch<
    React.SetStateAction<ImageSourcePropType | string | null>
  >;
  previewVideoTrack: ILocalVideoTrack | null;
  setPreviewVideoTrack: React.Dispatch<React.SetStateAction<ILocalVideoTrack> | null>;
  saveVB: boolean;
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
  saveVB: false,
  setSaveVB: () => {},
  options: [],
  setOptions: () => {},
});

const downloadBase64Image = async (base64Data, filename) => {
  const filePath = `${RNFS.DocumentDirectoryPath}/${filename}`;

  try {
    await RNFS.writeFile(filePath, base64Data, 'base64');
    return filePath;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    return null;
  }
};

async function requestStoragePermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'App needs access to your storage to download files.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Storage permission granted');
    } else {
      console.log('Storage permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}

const VBProvider: React.FC = ({children}) => {
  const [isVBActive, setIsVBActive] = React.useState<boolean>(false);
  const [vbMode, setVBmode] = React.useState<VBMode>('none');
  const [selectedImage, setSelectedImage] = React.useState<
    ImageSourcePropType | string | null
  >(null);
  const [saveVB, setSaveVB] = React.useState(false);
  // can be original video track/clone track
  const [previewVideoTrack, setPreviewVideoTrack] = React.useState<null>(null);
  const [options, setOptions] = React.useState<Option[]>(imagePathsArray);

  const rtc = useRtc();

  /* Fetch Saved Images from AsyncStorage to show in VBPanel */
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        isAndroid() && (await requestStoragePermission());
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
                id: getUniqueID(),
              } as Option),
          ) || []),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const applyVirtualBackgroundToMainView = async (
    config: VirtualBackgroundSource,
    disable = false,
  ) => {
    if (disable) {
      await rtc?.RtcEngineUnsafe.enableVirtualBackground(false, config);
    } else {
      await rtc?.RtcEngineUnsafe.enableVirtualBackground(true, config);
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
    const isBase64Image = typeof selectedImage === 'string';
    let savedImagePath = '';

    if (isBase64Image) {
      const base64Data = selectedImage.split(',')[1]; // Extract base64 data
      savedImagePath = await downloadBase64Image(base64Data, 'img.png');
    } else {
      const uri = resolveAssetSource(selectedImage).uri;
      await RNFS.downloadFile({
        fromUrl: uri,
        toFile: `${RNFS.DocumentDirectoryPath}/img.png`,
      }).promise;
    }

    const imageConfig = new VirtualBackgroundSource({
      backgroundSourceType: VirtualBackgroundSourceType.Img,
      source: isBase64Image
        ? savedImagePath
        : `${RNFS.DocumentDirectoryPath}/img.png`,
    });

    if (saveVB) {
      await applyVirtualBackgroundToMainView(imageConfig);
    } else {
      await applyVirtualBackgroundToMainView(imageConfig);
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
      }}>
      {children}
    </VBContext.Provider>
  );
};

const useVB = createHook(VBContext);

export {VBProvider, useVB};
