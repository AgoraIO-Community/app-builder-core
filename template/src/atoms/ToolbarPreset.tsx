import React from 'react';
import Navbar from '../components/Navbar';
import Controls from '../components/Controls';
import Leftbar from '../components/Leftbar';
import Rightbar from '../components/Rightbar';
import {isMobileUA} from '../utils/common';
import NavbarMobile from '../components/NavbarMobile';
import ActionSheet from '../pages/video-call/ActionSheet';

export type ToolbarMoreOptionDefaultItemName =
  | 'virtual-background'
  | 'noise-cancellation'
  | 'caption'
  | 'transcript'
  | 'view-recordings'
  | 'whiteboard';

export type ToolbarDefaultItemName =
  //bottom bar

  //left
  | 'layout'
  | 'invite'
  //center
  | 'local-audio'
  | 'local-video'
  | 'screenshare'
  | 'recording'
  | 'switch-camera'
  | 'end-call'
  | 'raise-hand'
  | 'more'

  //topbar
  | 'meeting-title'
  | 'participant-count'
  | 'recording-status'
  | 'chat'
  | 'participant'
  | 'settings';

export type ToolbarDefaultItemConfig = {
  [key in ToolbarDefaultItemName]?: ToolbarDefaultItem;
};

export type ToolbarMoreButton = {
  ['more']?: ToolbarMoreDefaultItem;
};

export type ToolbarMoreButtonConfig = {
  [key in ToolbarMoreOptionDefaultItemName]?: {
    hide?: ToolbarItemHide;
    order?: number;
  };
};

export type ToolbarItemAlign = 'start' | 'center' | 'end';
export type ToolbarItemHide = 'yes' | 'no';

export interface ToolbarMoreDefaultItem extends ToolbarDefaultItem {
  fields?: ToolbarMoreButtonConfig;
}

export interface ToolbarDefaultItem {
  component?: () => JSX.Element;
  align?: ToolbarItemAlign;
  hide?: ToolbarItemHide;
  order?: number;
}

export interface ToolbarCustomItem {
  component: () => JSX.Element;
  align: ToolbarItemAlign;
  hide: ToolbarItemHide;
  order?: number;
}
export type ToolbarPresetAlign = 'top' | 'bottom' | 'right' | 'left';

export interface ToolbarMoreMenuCustomItem {
  componentName: string;
  title: string;
  onPress: () => void;
  iconBase64?: string;
  hide?: ToolbarItemHide;
  order?: number;
}
export interface ToolbarBottomPresetProps {
  align: ToolbarPresetAlign;
  customItems?: Array<ToolbarCustomItem>;
  defaultItemsConfig?: ToolbarDefaultItemConfig | ToolbarMoreButton;
  snapPointsMinMax: [number, number];
  customMoreItems?: Array<ToolbarMoreMenuCustomItem>;
}
export interface ToolbarOtherPresetProps {
  align: ToolbarPresetAlign;
  customItems?: Array<ToolbarCustomItem>;
  defaultItemsConfig?: ToolbarDefaultItemConfig | ToolbarMoreButton;
  snapPointsMinMax?: never;
}

export type ToolbarPresetProps =
  | ToolbarBottomPresetProps
  | ToolbarOtherPresetProps;

const ToolbarPreset = (props: ToolbarPresetProps) => {
  const {align} = props;
  if (!align) {
    console.log(
      'ToolbarPreset align prop is empty. please provide align prop to get the corresponding toolbar preset',
    );
    return null;
  }
  if (align === 'left') {
    return (
      <Leftbar customItems={props?.customItems} includeDefaultItems={true} />
    );
  } else if (align === 'right') {
    return (
      <Rightbar customItems={props?.customItems} includeDefaultItems={true} />
    );
  } else if (align === 'top') {
    return isMobileUA() ? (
      <NavbarMobile
        customItems={props?.customItems}
        includeDefaultItems={true}
        defaultItemsConfig={props?.defaultItemsConfig}
      />
    ) : (
      <Navbar
        customItems={props?.customItems}
        includeDefaultItems={true}
        defaultItemsConfig={props?.defaultItemsConfig}
      />
    );
  } else if (align === 'bottom') {
    return isMobileUA() ? (
      <ActionSheet
        customItems={props?.customItems}
        includeDefaultItems={true}
        snapPointsMinMax={props?.snapPointsMinMax}
        defaultItemsConfig={props?.defaultItemsConfig}
      />
    ) : (
      <Controls
        customItems={props?.customItems}
        includeDefaultItems={true}
        defaultItemsConfig={props?.defaultItemsConfig}
        //@ts-ignore
        customMoreItems={props?.customMoreItems}
      />
    );
  } else {
    return null;
  }
};
export default ToolbarPreset;
