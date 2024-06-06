import {useEffect, useRef} from 'react';
import {
  Option,
  useVB,
  type VBMode,
} from '../../src/components/virtual-background/useVB';
import RNFS from 'react-native-fs';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import {useSidePanel} from '../utils/useSidePanel';
import {SidePanelType} from '../subComponents/SidePanelEnum';

export interface virtualBackgroundInterface {
  vbOptions: Option[]; // options available in vb panel
  setVBOptions: (options: Option[]) => void;
  saveVBOption: (type: VBMode, path: string) => void;
  applyVBOption: () => void;
  isVBOptionSelected: (type: VBMode, path: string) => boolean;
  isVBPanelOpen: boolean;
  closeVBPanel: () => void;
}

export interface VBConfig {
  target: 'mainView' | 'preview';
  blurDegree?: number;
  type: 'blur' | 'img' | 'custom'; // Adjust this as needed based on your configuration options
  source?: HTMLImageElement;
}

const convertBlobToBase64 = async (blobURL: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(blobURL)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
};

const createBase64DataURL = async (uri, mimeType) => {
  try {
    const base64Data = await readFile(uri);
    return `data:${mimeType};base64,${base64Data}`;
  } catch (error) {
    console.error('Error creating base64 data URL:', error);
    throw error;
  }
};
const readFile = async uri => {
  try {
    const base64Data = await RNFS.readFile(uri, 'base64');
    return base64Data;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

// Function to read local file and convert it to base64
const readFileToBase64 = async (filePath: string): Promise<string> => {
  try {
    const base64Data = await RNFS.readFile(filePath, 'base64');
    return base64Data;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

export const useVirtualBackground: () => virtualBackgroundInterface = () => {
  const {
    options,
    setOptions,
    selectedImage,
    vbMode,
    setSelectedImage,
    setVBmode,
    setSaveVB,
    isVBActive,
    setIsVBActive,
  } = useVB();

  const {setSidePanel} = useSidePanel();

  const updateVBOptions = async (options: Option[]) => {
    const vbOptions = [];
    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (option.type === 'image' && option?.isBase64Image === false) {
        const imgObj = {
          type: 'image',
          icon: 'vb',
          path: '',
          id: `VBOption_${i + 1}`,
        };
        try {
          // handle remote url
          console.warn('sd', typeof option.path);
          if (
            typeof option.path === 'string' &&
            option?.path?.startsWith('http')
          ) {
            // handle remote url
            imgObj.path = await convertBlobToBase64(option.path);
          } else {
            // handle local asset
            // error in native
            // console.warn('handle local asset');
            // const base64Data = await readFileToBase64(option.path);
            // imgObj.path = base64Data;
          }
        } catch (error) {
          console.error(
            `Error fetching and converting image ${option.path}:`,
            error,
          );
        }
        vbOptions.push(imgObj);
        if (option?.isSelected && !selectedImage) {
          setSelectedImage(imgObj.path);
          setVBmode('image');
        }
      } else {
        vbOptions.push(option);
      }
    }
    setOptions(vbOptions);
  };

  const saveVBOption = (type: VBMode, path: string) => {
    if (path) {
      setSelectedImage(path);
    } else {
      setSelectedImage(null);
    }
    setVBmode(type);
    setSaveVB(false);
  };

  const applyVBOption = () => {
    setSaveVB(true);
  };
  const closeVBPanel = () => {
    setSidePanel(SidePanelType.None);
    setIsVBActive(false);
  };

  const isVBOptionSelected = (type: VBMode, path: string) => {
    return path ? path === selectedImage : type === vbMode;
  };

  return {
    vbOptions: options,
    setVBOptions: updateVBOptions,
    saveVBOption,
    applyVBOption,
    isVBOptionSelected,
    isVBPanelOpen: isVBActive,
    closeVBPanel,
  };
};
