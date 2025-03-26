import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import LocalVideoMute from '../../../subComponents/LocalVideoMute';

export interface Props extends Partial<ToolbarItemProps> {
  showToolTip?: boolean;
}

export const LocalVideoToolbarItem = (props: Props) => {
  const {showToolTip = false, ...toolbarProps} = props;
  return (
    !$config.AUDIO_ROOM && (
      <ToolbarItem testID="localVideo-btn" toolbarProps={toolbarProps}>
        <LocalVideoMute showToolTip={showToolTip} />
      </ToolbarItem>
    )
  );
};
