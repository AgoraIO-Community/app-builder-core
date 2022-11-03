import {layoutObjectType} from 'customization-api';
import GridVideo from '../../components/GridVideo';
import PinnedVideo from '../../components/PinnedVideo';
import useLayoutsData from './useLayoutsData';
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
  const {setLayout} = useLayout();
  const layouts = useLayoutsData();
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
    setLayout(pinnedLayoutName);
  };
};

export const useChangeDefaultLayout = () => {
  const {setLayout} = useLayout();
  const layout = useLayoutsData();

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
    setLayout((activeLayout: string) =>
      activeLayout === layout[1].name ? layout[0].name : layout[1].name,
    );
  };
};
