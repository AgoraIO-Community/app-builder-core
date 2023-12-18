import {Option} from './useVB';

const imagePathsArray: Option[] = [
  {type: 'none', icon: 'remove', label: 'None', id: 'VBOption_1'},
  {type: 'blur', icon: 'blur', label: 'Blur', id: 'VBOption_2'},
  {type: 'custom', icon: 'upload-new', label: 'Custom', id: 'VBOption_3'},
  {
    type: 'image',
    icon: 'vb',
    path: require('./images/book.jpg'),
    id: 'VBOption_4',
  },
  {
    type: 'image',
    icon: 'vb',
    path: require('./images/beach.jpg'),
    id: 'VBOption_5',
  },
  {
    type: 'image',
    icon: 'vb',
    path: require('./images/office.jpg'),
    id: 'VBOption_6',
  },
  {
    type: 'image',
    icon: 'vb',
    path: require('./images/bedroom.jpg'),
    id: 'VBOption_7',
  },
  {
    type: 'image',
    icon: 'vb',
    path: require('./images/office1.jpg'),
    id: 'VBOption_8',
  },
  {
    type: 'image',
    icon: 'vb',
    path: require('./images/earth.jpg'),
    id: 'VBOption_9',
  },
  {
    type: 'image',
    icon: 'vb',
    path: require('./images/mountains.jpg'),
    id: 'VBOption_10',
  },
  {
    type: 'image',
    icon: 'vb',
    path: require('./images/plants.jpg'),
    id: 'VBOption_11',
  },
  {
    type: 'image',
    icon: 'vb',
    path: require('./images/wall.jpg'),
    id: 'VBOption_12',
  },
];

export default imagePathsArray;
