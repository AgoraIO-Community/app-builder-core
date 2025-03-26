import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import CaptionIcon from '../../../subComponents/caption/CaptionIcon';

export interface Props extends Omit<Partial<ToolbarItemProps>, 'children'> {
  onPressCallback?: () => void;
}

export const CaptionToolbarItem = (props: Props) => {
  const {onPressCallback = () => {}, ...toolbarProps} = props;
  return (
    <ToolbarItem toolbarProps={toolbarProps}>
      <CaptionIcon
        isOnActionSheet={true}
        showLabel={$config.ICON_TEXT}
        closeActionSheet={onPressCallback}
      />
    </ToolbarItem>
  );
};
