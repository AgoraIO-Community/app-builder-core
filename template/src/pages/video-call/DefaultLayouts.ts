import {layoutObjectType} from 'fpe-api';
import GridVideo from '../../components/GridVideo';
import PinnedVideo from '../../components/PinnedVideo';
import useCustomLayout from './CustomLayout';
import {useLayout} from '../../utils/useLayout';

export const DefaultLayouts: layoutObjectType[] = [
  {
    name: 'grid',
    label: 'Grid Layout',
    iconName: 'gridLayoutIcon',
    component: GridVideo,
  },
  {
    name: 'pinned',
    label: 'Pinned Layout',
    iconName: 'pinnedLayoutIcon',
    component: PinnedVideo,
  },
];

export const getPinnedLayoutName = () => DefaultLayouts[1].name;
export const getGridLayoutName = () => DefaultLayouts[0].name;

export const useSetPinnedLayout = () => {
  const {setActiveLayoutName} = useLayout();
  const layouts = useCustomLayout();
  const pinnedLayoutName = getPinnedLayoutName();
  let checkPinnedLayoutExist = false;
  if (layouts && Array.isArray(layouts) && layouts.length) {
    let data = layouts.filter((item) => item.name === pinnedLayoutName);
    if (data && data.length) {
      checkPinnedLayoutExist = true;
    }
  }
  if (!checkPinnedLayoutExist) {
    return () => {};
  }
  return () => {
    setActiveLayoutName(pinnedLayoutName);
  };
};

export const useChangeDefaultLayout = () => {
  const {setActiveLayoutName} = useLayout();
  const layout = useCustomLayout();

  if (!layout) {
    return () => {};
  }

  if (
    layout &&
    Array.isArray(layout) &&
    (layout.length === 0 || layout.length === 1)
  ) {
    return () => {};
  }

  return () => {
    setActiveLayoutName((activeLayout: string) =>
      activeLayout === layout[1].name ? layout[0].name : layout[1].name,
    );
  };
};
