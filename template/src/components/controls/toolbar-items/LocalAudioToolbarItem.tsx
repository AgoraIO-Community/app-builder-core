import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import LocalAudioMute from '../../../subComponents/LocalAudioMute';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export interface Props extends Partial<ToolbarItemProps> {
  showToolTip?: boolean;
  iconBGColor?: string;
  iconSize?: number;
  containerStyle?: object;
}

export const LocalAudioToolbarItem = (props: Props) => {
  const {
    showToolTip = false,
    iconBGColor,
    iconSize,
    containerStyle,
    ...toolbarProps
  } = props;
  const canAccessLocalAudio = useControlPermissionMatrix('localAudioControl');
  return (
    canAccessLocalAudio && (
      <ToolbarItem testID="localAudio-btn" toolbarProps={toolbarProps}>
        <LocalAudioMute
          showToolTip={showToolTip}
          iconBGColor={iconBGColor}
          iconSize={iconSize}
          containerStyle={containerStyle}
        />
      </ToolbarItem>
    )
  );
};
