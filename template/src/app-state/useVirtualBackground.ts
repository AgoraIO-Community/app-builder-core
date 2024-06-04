import {useEffect, useRef} from 'react';
import {convertBlobToBase64} from '../../src/components/virtual-background/VButils';
import {
  Option,
  useVB,
  type VBMode,
} from '../../src/components/virtual-background/useVB';

export interface userVBOptions {
  type: VBMode;
  label?: string;
  imagePaths?: string[];
}

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
    applyVirtualBackgroundToMainView,
    applyVirtualBackgroundToPreviewView,
  } = useVB();

  const updateVBOptions1 = async (options: userVBOptions[]) => {
    const vbOptions = [];
    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (option.type === 'none' || option.type === 'blur') {
        vbOptions.push({
          type: option.type,
          icon: option.type === 'none' ? 'remove' : 'blur',
          label: option.label,
          id: `VBOption_${i + 1}`,
        });
      } else if (option.type === 'image' && option.imagePaths) {
        for (let j = 0; j < option.imagePaths.length; j++) {
          const imgPath = option.imagePaths[j];
          const imgObj = {
            type: 'image',
            icon: 'vb',
            path: '',
            id: `VBOption_${i + j + 1}`,
          };

          try {
            imgObj.path = await convertBlobToBase64(imgPath);
          } catch (error) {
            console.error(
              `Error fetching and converting image ${imgPath}:`,
              error,
            );
          }

          vbOptions.push(imgObj);
        }
      }
    }

    setOptions(vbOptions);
  };
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
        if (option?.isSelected) {
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
  };
};
