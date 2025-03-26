import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import LocalEndcall from '../../../subComponents/LocalEndCall';

export interface Props {
  customExit?: () => void;
}

export const LocalEndcallToolbarItem = (props?: Props) => {
  return (
    <ToolbarItem
      testID={props?.customExit ? 'endCall-btn-custom' : 'endCall-btn'}
      toolbarProps={props}>
      <LocalEndcall />
    </ToolbarItem>
  );
};
