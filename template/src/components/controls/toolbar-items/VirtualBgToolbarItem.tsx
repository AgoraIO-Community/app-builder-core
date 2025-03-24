import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import VBButton from '../../virtual-background/VBButton';
import {useVB} from '../../virtual-background/useVB';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const VirtualBgToolbarItem = props => {
  const {isVBActive, setIsVBActive} = useVB();
  const canAccessVB = useControlPermissionMatrix('virtualBackgroundControl');
  return (
    canAccessVB && (
      <ToolbarItem toolbarProps={props}>
        <VBButton
          isVBOpen={isVBActive}
          setIsVBOpen={setIsVBActive}
          showLabel={$config.ICON_TEXT}
        />
      </ToolbarItem>
    )
  );
};
