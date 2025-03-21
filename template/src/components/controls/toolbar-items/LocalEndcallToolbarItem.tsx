import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import LocalEndcall from '../../../subComponents/LocalEndCall';

export interface LocalEndcallToolbarItemProps {
  customExit?: () => void;
}

export const LocalEndcallToolbarItem = (
  props?: LocalEndcallToolbarItemProps,
) => {
  return (
    <ToolbarItem
      testID={props?.customExit ? 'endCall-btn-custom' : 'endCall-btn'}
      toolbarProps={props}>
      <LocalEndcall {...props} />
    </ToolbarItem>
  );
};
