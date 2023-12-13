import {createHook} from 'customization-implementation';
import React from 'react';

import {IconsInterface} from '../../atoms/CustomIcon';
import {ILocalVideoTrack} from 'agora-rtc-sdk-ng';

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

const VBProvider: React.FC = ({children}) => {
  const [isVBActive, setIsVBActive] = React.useState<boolean>(false);
  const [vbMode, setVBmode] = React.useState<VBMode>('none');
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [saveVB, setSaveVB] = React.useState(false);
  // can be original video track/clone track
  const [previewVideoTrack, setPreviewVideoTrack] = React.useState<null>(null);
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

  /* Fetch Saved Images from Storage */
  React.useEffect(() => {}, []);

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

  const blurVB = async () => {};

  const imageVB = async () => {};

  const disableVB = async () => {};

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
