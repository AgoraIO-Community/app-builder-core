import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import TranscriptIcon from '../../../subComponents/caption/TranscriptIcon';

export const TranscriptToolbarItem = props => {
  if (!$config.ENABLE_MEETING_TRANSCRIPT) {
    return null;
  }
  return (
    <ToolbarItem toolbarProps={props}>
      <TranscriptIcon isOnActionSheet={true} showLabel={$config.ICON_TEXT} />
    </ToolbarItem>
  );
};
