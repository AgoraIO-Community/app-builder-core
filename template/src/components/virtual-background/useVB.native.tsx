import {createHook} from 'customization-implementation';
import React from 'react';
import {IconsInterface} from '../../atoms/CustomIcon';
import {ILocalVideoTrack} from 'agora-rtc-sdk-ng';
import {retrieveImagesFromStorage} from './VButils.native';

import RtcEngine, {
  BackgroundBlurDegree,
  VirtualBackgroundSource,
  BackgroundSourceType,
} from 'react-native-agora';
import {useLocalUserInfo, useRtc} from 'customization-api';
import RNFS from 'react-native-fs';
import {ImageSourcePropType} from 'react-native/types';
import imagePathsArray from './imagePaths';
import {LogSource, logger} from '../../logger/AppBuilderLogger';
import {ToggleState} from '../../../agora-rn-uikit';

export type VBMode = 'blur' | 'image' | 'custom' | 'none';

export type Option = {
  type: VBMode;
  icon?: keyof IconsInterface;
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
  vbMode: null,
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
  const extractData = base64Data.split(',')[1];
  const filePath = `${RNFS.DocumentDirectoryPath}/${filename}`;

  try {
    await RNFS.writeFile(filePath, extractData, 'base64');
    return filePath;
  } catch (error) {
    logger.error(
      LogSource.Internals,
      'VIRTUAL_BACKGROUND',
      'Error saving base64 image',
      error,
    );
    return null;
  }
};

const VBProvider: React.FC = ({children}) => {
  const [isVBActive, setIsVBActive] = React.useState<boolean>(false);
  const [vbMode, setVBmode] = React.useState<VBMode>(null);
  const [selectedImage, setSelectedImage] = React.useState<
    ImageSourcePropType | string | null
  >(null);
  const [saveVB, setSaveVB] = React.useState(false);
  // can be original video track/clone track
  const [previewVideoTrack, setPreviewVideoTrack] = React.useState<null>(null);
  const [options, setOptions] = React.useState<Option[]>(imagePathsArray);
  const {video: localVideoStatus} = useLocalUserInfo();
  const isLocalVideoON = localVideoStatus === ToggleState.enabled;

  const rtc = useRtc();

  /* Fetch Saved Images from AsyncStorage to show in VBPanel */
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const customImages = await retrieveImagesFromStorage();
        logger.debug(
          LogSource.Internals,
          'VIRTUAL_BACKGROUND',
          'retrived from async storage',
          customImages,
        );
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
        logger.error(
          LogSource.Internals,
          'VIRTUAL_BACKGROUND',
          'Error fetching data',
          error,
        );
      }
    };

    fetchData();
  }, []);

  /* VB Change modes */
  React.useEffect(() => {
    if (!isLocalVideoON) {
      return;
    }
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
        break;
    }
  }, [vbMode, selectedImage, saveVB, previewVideoTrack, isLocalVideoON]);

  const applyVirtualBackgroundToMainView = async (
    config: VirtualBackgroundSource,
    disable = false,
  ) => {
    if (disable) {
      await rtc?.RtcEngineUnsafe.enableVirtualBackground(false, config, {});
    } else {
      await rtc?.RtcEngineUnsafe.enableVirtualBackground(true, config, {});
    }
  };

  const blurVB = async () => {
    const blurConfig: VirtualBackgroundSource = new VirtualBackgroundSource();
    blurConfig.background_source_type = BackgroundSourceType.BackgroundBlur;
    blurConfig.blur_degree = BackgroundBlurDegree.BlurDegreeMedium;
    await applyVirtualBackgroundToMainView(blurConfig);
  };

  const imageVB = async () => {
    const savedImagePath = await downloadBase64Image(selectedImage, 'img.png');
    const imageConfig: VirtualBackgroundSource = new VirtualBackgroundSource();
    imageConfig.background_source_type = BackgroundSourceType.BackgroundImg;
    imageConfig.source = savedImagePath;
    await applyVirtualBackgroundToMainView(imageConfig);
  };

  const disableVB = async () => {
    const disableConfig: VirtualBackgroundSource =
      new VirtualBackgroundSource();
    disableConfig.background_source_type = BackgroundSourceType.BackgroundNone;
    await applyVirtualBackgroundToMainView(disableConfig, true);
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
