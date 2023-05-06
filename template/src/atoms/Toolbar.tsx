import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useToolbar, ToolbarPosition} from '../utils/useToolbar';
import {isWebInternal, useIsDesktop} from '../utils/common';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

export interface ToolbarProps {
  children: React.ReactNode;
}
const Toolbar = (props: ToolbarProps) => {
  const {position} = useToolbar();
  const {children} = props;
  const isDesktop = useIsDesktop();
  const paddingHorizontal = isDesktop('toolbar') ? 32 : 10;

  return (
    <View
      style={[
        position === ToolbarPosition.left || position === ToolbarPosition.right
          ? {
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingVertical: paddingHorizontal,
            }
          : position === ToolbarPosition.top
          ? isWebInternal()
            ? toolBarStyles.topBarNonNativeStyle
            : toolBarStyles.topBarNativeStyle
          : position === ToolbarPosition.bottom
          ? toolBarStyles.bottomBarStyle
          : {},
        position === ToolbarPosition.top || position === ToolbarPosition.bottom
          ? {paddingHorizontal}
          : {},
      ]}>
      {children}
    </View>
  );
};

export default Toolbar;

const toolBarStyles = StyleSheet.create({
  topBarNonNativeStyle: {
    width: '100%',
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: $config.TOOLBAR_COLOR,
  },
  topBarNativeStyle: {
    width: '100%',
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    height: '8%',
    backgroundColor:
      $config.SECONDARY_ACTION_COLOR + hexadecimalTransparency['80%'],
  },
  bottomBarStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: $config.TOOLBAR_COLOR,
  },
});
