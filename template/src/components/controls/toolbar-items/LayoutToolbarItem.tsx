import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import LayoutIconButton from '../../../subComponents/LayoutIconButton';

export const LayoutToolbarItem = props => (
  <ToolbarItem testID="layout-btn" collapsable={false} toolbarProps={props}>
    {/**
     * .measure returns undefined on Android unless collapsable=false or onLayout are specified
     * so added collapsable property
     * https://github.com/facebook/react-native/issues/29712
     * */}
    <LayoutIconButton />
  </ToolbarItem>
);
