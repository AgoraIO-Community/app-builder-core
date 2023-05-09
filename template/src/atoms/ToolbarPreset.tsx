import Controls from '../components/Controls';
import React from 'react';

export interface ToolbarCustomItem {
  component: () => JSX.Element;
  align: 'start' | 'center' | 'end';
  hide: 'yes' | 'no' | 'never';
  order: number;
}

export interface ToolbarPresetProps {
  align: 'top' | 'left' | 'bottom' | 'right';
  customItems?: Array<ToolbarCustomItem>;
}

const ToolbarPreset = (props: ToolbarPresetProps) => {
  const {align} = props;
  if (align === 'left' || align === 'right') {
    //process custom items and show
  } else if (align === 'top') {
    //todo topbar
  } else if (align === 'bottom') {
    return <Controls customItems={props.customItems} />;
  } else {
    return null;
  }
  return null;
};
export default ToolbarPreset;
