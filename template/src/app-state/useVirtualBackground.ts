import {useEffect, useRef} from 'react';
import {convertBlobToBase64} from '../../src/components/virtual-background/VButils';
import {
  Option,
  useVB,
  type VBMode,
} from '../../src/components/virtual-background/useVB';

interface userVBOptions {
  type: VBMode;
  label?: string;
  imagePaths?: string[];
}

export interface virtualBackgroundInterface {
  options: Option[]; // options available in vb panel
  selectedImage: string | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  vbMode: VBMode;
  setVBmode: React.Dispatch<React.SetStateAction<VBMode>>;
  setSaveVB: React.Dispatch<React.SetStateAction<boolean>>;
  updateVBOptions: (options: userVBOptions[]) => void;
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
  } = useVB();

  const updateVBOptions = async options => {
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
            continue;
          }

          vbOptions.push(imgObj);
        }
      }
    }

    setOptions(vbOptions);
  };
  return {
    options,
    selectedImage,
    setSelectedImage,
    vbMode,
    setVBmode,
    updateVBOptions,
    setSaveVB,
  };
};
