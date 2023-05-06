import React from 'react';
import {View, ViewProps, ViewStyle, StyleSheet} from 'react-native';
import {ToolbarPosition, useToolbar} from '../utils/useToolbar';
import {isWebInternal} from '../utils/common';

export interface ToolbarItemProps extends ViewProps {
  style?: ViewStyle;
  children: React.ReactNode;
}
const ToolbarItem = (props: ToolbarItemProps) => {
  const {isHorizontal, position} = useToolbar();
  //isHorizontal true -> top/bottom bar
  //isHorizontal false -> left/right bar
  // todo hari - first item shouldnot contain the margin right
  // todo hari - last item shouldnot contain the margin right
  return (
    <View
      {...props}
      style={[
        props?.style,
        // isHorizontal ? {flexDirection: 'column'} : {flexDirection: 'row'},
        position === ToolbarPosition.left
          ? toolbarItemStyles.leftBarItemStyle
          : position === ToolbarPosition.right
          ? toolbarItemStyles.rightBarItemStyle
          : position === ToolbarPosition.bottom
          ? toolbarItemStyles.bottomBarItemStyle
          : isWebInternal() && position === ToolbarPosition.top
          ? toolbarItemStyles.topBarItemNonNativeStyle
          : !isWebInternal() && position === ToolbarPosition.top
          ? toolbarItemStyles.topBarItemNativeStyle
          : {},
      ]}>
      {props?.children}
    </View>
  );
};
export default ToolbarItem;

const toolbarItemStyles = StyleSheet.create({
  topBarItemNativeStyle: {},
  topBarItemNonNativeStyle: {
    marginTop: 8,
    marginBottom: 10,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  bottomBarItemStyle: {
    marginTop: 10,
    marginBottom: 16,
    marginHorizontal: 10,
  },
  leftBarItemStyle: {
    marginLeft: 16,
    marginRight: 10,
    marginVertical: 10,
  },
  rightBarItemStyle: {
    marginRight: 16,
    marginLeft: 10,
    marginVertical: 10,
  },
});
