import {Option} from './useVB';
import images from './images';

const imagePathsArray: Option[] = [
  {
    type: 'none',
    icon: 'remove',
    label: 'None',

    isSelected: false,
  },
  {
    type: 'blur',
    icon: 'blur',
    label: 'Blur',

    isSelected: false,
  },
  {
    type: 'custom',
    icon: 'upload-new',
    label: 'Custom',

    isSelected: false,
  },
  {
    type: 'image',
    icon: 'vb',
    path: images.bookImageBase64,
    isSelected: false,
  },
  {
    type: 'image',
    icon: 'vb',
    path: images.beachImageBase64,
    isSelected: false,
  },
  {
    type: 'image',
    icon: 'vb',
    path: images.office1ImageBase64,
    isSelected: false,
  },
  {
    type: 'image',
    icon: 'vb',
    path: images.bedroomImageBase64,
    isSelected: false,
  },
  {
    type: 'image',
    icon: 'vb',
    path: images.officeImageBase64,
    isSelected: false,
  },
  {
    type: 'image',
    icon: 'vb',
    path: images.earthImageBase64,
    isSelected: false,
  },
  {
    type: 'image',
    icon: 'vb',
    path: images.mountainsImageBase64,
    isSelected: false,
  },
  {
    type: 'image',
    icon: 'vb',
    path: images.plantsImageBase64,
    isSelected: false,
  },
  {
    type: 'image',
    icon: 'vb',
    path: images.wallImageBase64,
    isSelected: false,
  },
];

export default imagePathsArray;
