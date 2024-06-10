import {useEffect, useRef} from 'react';
import {convertBlobToBase64} from '../../src/components/virtual-background/VButils';
import {
  Option,
  useVB,
  type VBMode,
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
  isVirtualBackgroundSelected: (type: VBMode, path: string) => boolean;
  hideVirtualBackgroundPanel: () => void;
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
  } = useVB();

  const {setSidePanel} = useSidePanel();

  const updateVBOptions = async (options: Option[]) => {
    console.warn('Sdsd');
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
          imgObj.path = await convertBlobToBase64(option.path);
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

  const setVBPreview = (type: VBMode, path: string) => {
    if (path) {
      setSelectedImage(path);
    } else {
      setSelectedImage(null);
    }
    setVBmode(type);
    setSaveVB(false);
  };

  const applyVirtualBackground = () => {
    setSaveVB(true);
  };

  const isVirtualBackgroundSelected = (type: VBMode, path: string) => {
    return path ? path === selectedImage : type === vbMode;
  };

  const hideVirtualBackgroundPanel = () => {
    setSidePanel(SidePanelType.None);
    setIsVBActive(false);
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
    isVirtualBackgroundSelected,
    hideVirtualBackgroundPanel,
  };
};
