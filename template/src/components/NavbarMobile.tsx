import React from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import Toolbar from '../atoms/Toolbar';
import {
  ToolbarCustomItem,
  ToolbarDefaultItem,
  ToolbarDefaultItemConfig,
  ToolbarItemHide,
} from '../atoms/ToolbarPreset';
import {
  MeetingTitleToolbarItem,
  ParticipantCountToolbarItem,
  RecordingStatusToolbarItem,
} from './Navbar';
import {useRecording} from '../subComponents/recording/useRecording';
import {CustomToolbarSort, updateToolbarDefaultConfig} from '../utils/common';

export interface NavbarProps {
  customItems?: ToolbarCustomItem[];
  includeDefaultItems?: boolean;
  defaultItemsConfig?: ToolbarDefaultItemConfig;
}

const NavbarMobile = (props: NavbarProps) => {
  const {isRecordingActive} = useRecording();
  const defaultItems: ToolbarDefaultItem[] = [
    {
      align: 'start',
      componentName: 'meeting-title',
      component: MeetingTitleToolbarItem,
      order: 0,
    },
    {
      align: 'start',
      componentName: 'participant-count',
      component: ParticipantCountToolbarItem,
      order: 1,
    },
    {
      align: 'start',
      componentName: 'recording-status',
      component: isRecordingActive ? RecordingStatusToolbarItem : null,
      order: 2,
    },
  ];
  const {
    customItems = [],
    includeDefaultItems = true,
    defaultItemsConfig = {},
  } = props;
  const {width, height} = useWindowDimensions();

  const isHidden = (hide: ToolbarItemHide = false) => {
    try {
      return typeof hide === 'boolean'
        ? hide
        : typeof hide === 'function'
        ? hide(width, height)
        : false;
    } catch (error) {
      console.log('debugging isHidden error', error);
      return false;
    }
  };

  const customTopBarItems = customItems
    ?.concat(
      includeDefaultItems
        ? updateToolbarDefaultConfig(defaultItems, defaultItemsConfig)
        : [],
    )
    ?.filter(i => !isHidden(i?.hide) && i?.component)
    ?.sort(CustomToolbarSort);

  const renderContent = (
    items: ToolbarCustomItem[],
    type: 'start' | 'center' | 'end',
  ) => {
    return items?.map((item, index) => {
      const ToolbarItem = item?.component;
      if (ToolbarItem) {
        return <ToolbarItem key={`top-toolbar-${type}` + index} />;
      } else {
        return null;
      }
    });
  };
  return (
    <Toolbar>
      <View style={style.startContent}>
        {renderContent(customTopBarItems, 'start')}
      </View>
    </Toolbar>
  );
};
export default NavbarMobile;
const style = StyleSheet.create({
  startContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  centerContent: {
    zIndex: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endContent: {
    flex: 1,
    zIndex: 9,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
