import {layoutObjectType} from 'fpe-api';
import GridVideo from '../../components/GridVideo';
import PinnedVideo from '../../components/PinnedVideo';

export const DefaultLayouts: layoutObjectType[] = [
  {name: 'GridLayout', iconName: 'gridLayoutIcon', component: GridVideo},
  {name: 'PinnedLayout', iconName: 'pinnedLayoutIcon', component: PinnedVideo},
];
