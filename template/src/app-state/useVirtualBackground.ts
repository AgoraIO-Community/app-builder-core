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
  vbOptions: Option[]; // options available in vb panel
  setVBOptions: (options: Option[]) => void;
  saveVBOption: (type: VBMode, path: string) => void;
  applyVBOption: () => void;
  isVBOptionSelected: (type: VBMode, path: string) => boolean;
  isVBPanelOpen: boolean;
  closeVBPanel: () => void;
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

  const isVBOptionSelected = (type: VBMode, path: string) => {
    return path ? path === selectedImage : type === vbMode;
  };

  const closeVBPanel = () => {
    setSidePanel(SidePanelType.None);
    setIsVBActive(false);
  };

  //TODO: later
  const applyVirtualBackground = (config: VBConfig) => {
    if (config.target === 'mainView') {
      applyVirtualBackgroundToMainView(config);
    } else {
      applyVirtualBackgroundToPreviewView(config);
    }
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
