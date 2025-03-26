import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import LayoutIconButton from '../../../subComponents/LayoutIconButton';

export interface Props extends ToolbarItemProps {}

export const LayoutToolbarItem = (props: Props) => (
  <ToolbarItem testID="layout-btn" collapsable={false} toolbarProps={props}>
    {/**
     * .measure returns
     * undefined on Android unless collapsable=false or onLayout are specified
     * so added collapsable property
     * https://github.com/facebook/react-native/issues/29712
     * */}
    <LayoutIconButton />
  </ToolbarItem>
);
