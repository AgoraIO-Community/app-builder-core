import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import ScreenshareButton from '../../../subComponents/screenshare/ScreenshareButton';
import isMobileOrTablet from '../../../utils/isMobileOrTablet';

export const ScreenShareToolbarItem = props => {
  return (
    $config.SCREEN_SHARING &&
    !isMobileOrTablet() && (
      <ToolbarItem testID="screenShare-btn" toolbarProps={props}>
        <ScreenshareButton />
      </ToolbarItem>
    )
  );
};
