import React from 'react';
import Navbar from '../components/Navbar';
import Controls from '../components/Controls';
import Leftbar from '../components/Leftbar';
import Rightbar from '../components/Rightbar';

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
  if (!align) {
    console.log(
      'ToolbarPreset align prop is empty. please provide align prop to get the corresponding toolbar preset',
    );
    return null;
  }
  if (align === 'left') {
    return <Leftbar customItems={props?.customItems} />;
  } else if (align === 'right') {
    return <Rightbar customItems={props?.customItems} />;
  } else if (align === 'top') {
    return <Navbar customItems={props?.customItems} />;
  } else if (align === 'bottom') {
    return <Controls customItems={props?.customItems} />;
  } else {
    return null;
  }
};
export default ToolbarPreset;
