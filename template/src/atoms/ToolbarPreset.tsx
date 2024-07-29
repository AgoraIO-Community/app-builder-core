import React from 'react';
import Navbar from '../components/Navbar';
import Controls from '../components/Controls';
import Leftbar from '../components/Leftbar';
import Rightbar from '../components/Rightbar';
import {isMobileUA} from '../utils/common';
import NavbarMobile from '../components/NavbarMobile';
import ActionSheet from '../pages/video-call/ActionSheet';

export type MoreButtonDefaultKeys =
  | 'virtual-background'
  | 'noise-cancellation'
  | 'caption'
  | 'transcript'
  | 'view-recordings'
  | 'whiteboard'
  | 'chat'
  | 'participant'
  | 'settings'
  | 'layout'
  | 'invite'
  | 'screenshare'
  | 'recording';

export type BottomToolbarDefaultKeys =
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
  | 'more';

export type TopToolbarDefaultKeys =
  //topbar
  | 'meeting-title'
  | 'participant-count'
  | 'recording-status'
  | 'chat'
  | 'participant'
  | 'settings';

export type ToolbarMoreButtonFields = {
  [key in MoreButtonDefaultKeys]?: {
    hide?: ToolbarItemHide;
    order?: number;
  };
};

export type ToolbarItemAlign = 'start' | 'center' | 'end';
export type ToolbarHideCallback = (width: number, height: number) => boolean;
export type ToolbarItemHide = boolean | ToolbarHideCallback;

export interface ToolbarDefaultItem {
  component?: () => JSX.Element;
  align?: ToolbarItemAlign;
  hide?: ToolbarItemHide;
  order?: number;
}
export interface ToolbarMoreDefaultItem extends ToolbarDefaultItem {
  fields?: ToolbarMoreButtonFields;
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
  align: 'bottom';
  items?:
    | {
        [key: string]: ToolbarDefaultItem;
      }
    | {
        ['more']?: ToolbarMoreDefaultItem;
      }
    | {
        [key in BottomToolbarDefaultKeys]?: ToolbarDefaultItem;
      };
  snapPointsMinMax?: [number, number];
}
export interface ToolbarTopPresetProps {
  align: 'top';
  items?:
    | {
        [key in TopToolbarDefaultKeys]?: ToolbarDefaultItem;
      }
    | {
        [key: string]: ToolbarDefaultItem;
      };
}
export interface ToolbarRightPresetProps {
  align: 'right';
  items?: {
    [key in TopToolbarDefaultKeys]?: ToolbarDefaultItem;
  };
}
export interface ToolbarLeftPresetProps {
  align: 'left';
  items?: {
    [key in TopToolbarDefaultKeys]?: ToolbarDefaultItem;
  };
}

export type ToolbarPresetProps =
  | ToolbarBottomPresetProps
  | ToolbarTopPresetProps
  | ToolbarLeftPresetProps
  | ToolbarRightPresetProps;

const ToolbarPreset = (props: ToolbarPresetProps) => {
  const {align} = props;
  if (!align) {
    console.log(
      'ToolbarPreset align prop is empty. please provide align prop to get the corresponding toolbar preset',
    );
    return null;
  }
  if (align === 'left') {
    return <Leftbar items={props?.items} includeDefaultItems={true} />;
  } else if (align === 'right') {
    return <Rightbar items={props?.items} includeDefaultItems={true} />;
  } else if (align === 'top') {
    return isMobileUA() ? (
      <NavbarMobile items={props?.items} includeDefaultItems={true} />
    ) : (
      <Navbar items={props?.items} includeDefaultItems={true} />
    );
  } else if (align === 'bottom') {
    return isMobileUA() ? (
      <ActionSheet
        items={props?.items}
        includeDefaultItems={true}
        snapPointsMinMax={props?.snapPointsMinMax}
      />
    ) : (
      <Controls items={props?.items} includeDefaultItems={true} />
    );
  } else {
    return null;
  }
};
export default ToolbarPreset;
