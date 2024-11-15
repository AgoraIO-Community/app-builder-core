import {useEffect, useRef} from 'react';
import {
  convertBlobToBase64,
  retrieveImagesFromStorage,
} from '../../src/components/virtual-background/VButils';
import {
  Option,
  useVB,
  type VBMode,
  type VBProcessorType,
} from '../../src/components/virtual-background/useVB';

import {useSidePanel} from '../utils/useSidePanel';
import {SidePanelType} from '../subComponents/SidePanelEnum';

export interface VBConfig {
  target: 'mainView' | 'preview';
  blurDegree?: number;
  type: 'blur' | 'img' | 'custom'; // Adjust this as needed based on your configuration options
  source?: HTMLImageElement;
}

export interface virtualBackgroundInterface {
  virtualBackgrounds: Option[]; // options available in vb panel
  addVirtualBackgrounds: (options: Option[]) => void;
  setVBPreview: (type: VBMode, path: string) => void;
  applyVirtualBackground: () => void;
  isVirtualBackgroundPanelOpen: boolean;
  hideVirtualBackgroundPanel: () => void;
  showVirtualBackgroundPanel: () => void;
  virtualBackgroundProcessor: VBProcessorType;
}

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
    applyVirtualBackgroundToMainView,
    applyVirtualBackgroundToPreviewView,
    vbProcessor,
  } = useVB();

  const {setSidePanel} = useSidePanel();

  const updateVBOptions = async (options: Option[]) => {
    const vbOptions = [];
    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (option.type === 'image') {
        const imgObj = {
          type: 'image',
          icon: 'vb',
          path: '',
          id: `VBOption_${i + 1}`,
          isSelected: false,
        };
        try {
          imgObj.path = await convertBlobToBase64(option.path);
        } catch (error) {
          console.error(
            `Error fetching and converting image ${option.path}:`,
            error,
          );
        }
        vbOptions.push(imgObj);
        if (option?.isSelected && !selectedImage) {
          imgObj.isSelected = true;
          setSelectedImage(imgObj.path);
          setVBmode('image');
        }
      } else {
        option.isSelected = false;
        vbOptions.push(option);
      }
    }

    const customImages = await retrieveImagesFromStorage();
    const savedImagesArr = customImages?.map(
      base64Data =>
        ({
          type: 'image',
          icon: 'vb',
          path: base64Data,
        } as Option),
    );
    // also fetch from db
    setOptions([...vbOptions, ...savedImagesArr]);
  };

  const setVBPreview = (type: VBMode, path: string) => {
    if (path) {
      setSelectedImage(path);
    } else {
      setSelectedImage(null);
    }
    setVBmode(type);
    setSaveVB(false);
    // update selected options
    // Update selected options
    options.forEach(option => {
      // Reset isSelected for all options
      option.isSelected = false;

      // Set isSelected for the matching option
      if (type === 'image' && path && option.path === path) {
        option.isSelected = true;
      } else if (type !== 'image' && type === option.type) {
        option.isSelected = true;
      }
    });
  };

  const applyVirtualBackground = () => {
    setSaveVB(true);
  };

  const hideVirtualBackgroundPanel = () => {
    setSidePanel(SidePanelType.None);
    setIsVBActive(false);
  };
  const showVirtualBackgroundPanel = () => {
    setSidePanel(SidePanelType.VirtualBackground);
    setIsVBActive(true);
  };

  //TODO: later
  // const applyVirtualBackground = (config: VBConfig) => {
  //   if (config.target === 'mainView') {
  //     applyVirtualBackgroundToMainView(config);
  //   } else {
  //     applyVirtualBackgroundToPreviewView(config);
  //   }
  // };
  return {
    virtualBackgrounds: options,
    addVirtualBackgrounds: updateVBOptions,
    setVBPreview,
    applyVirtualBackground,
    isVirtualBackgroundPanelOpen: isVBActive,
    hideVirtualBackgroundPanel,
    showVirtualBackgroundPanel,
    virtualBackgroundProcessor: vbProcessor,
  };
};
