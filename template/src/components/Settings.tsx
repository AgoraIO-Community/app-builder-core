/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import ColorContext from './ColorContext';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {useSidePanel} from '../utils/useSidePanel';
import {useString} from '../utils/useString';
import Styles from './styles';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ThemeConfig from '../theme';
import Spacer from '../atoms/Spacer';

export interface SettingsIconButtonProps {
  render?: (onPress: () => void, isPanelActive: boolean) => JSX.Element;
}

const Settings = (props: SettingsIconButtonProps) => {
  const {primaryColor} = useContext(ColorContext);
  const {sidePanel, setSidePanel} = useSidePanel();
  //commented for v1 release
  //const settingsLabel = useString('settingsLabel')();
  const settingsLabel = 'Settings';
  const isPanelActive = sidePanel === SidePanelType.Settings;
  const onPress = () => {
    isPanelActive
      ? setSidePanel(SidePanelType.None)
      : setSidePanel(SidePanelType.Settings);
  };
  let iconButtonProps: IconButtonProps = {
    onPress: onPress,
    iconProps: {
      name: 'settings',
      tintColor: isPanelActive
        ? $config.PRIMARY_ACTION_TEXT_COLOR
        : $config.PRIMARY_ACTION_BRAND_COLOR,
    },
  };
  iconButtonProps.btnText = $config.ICON_TEXT ? settingsLabel : '';
  iconButtonProps.styleText = {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 12,
    marginTop: 4,
    fontWeight: isPanelActive ? '700' : '400',
    color: isPanelActive
      ? $config.PRIMARY_ACTION_BRAND_COLOR
      : $config.PRIMARY_ACTION_TEXT_COLOR,
  };
  iconButtonProps.style = {
    width: 48,
    height: 48,
    backgroundColor: isPanelActive
      ? $config.PRIMARY_ACTION_BRAND_COLOR
      : $config.CARD_LAYER_1_COLOR,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  };

  return props?.render ? (
    props.render(onPress, isPanelActive)
  ) : (
    <>
      <View
        style={[
          style.navItem,
          // {
          //   backgroundColor: isPanelActive
          //     ? $config.PRIMARY_ACTION_BRAND_COLOR
          //     : 'transparent',
          // },
        ]}>
        <Spacer size={11} horizontal={true} />
        <IconButton {...iconButtonProps} />
      </View>
    </>
  );
};

export const SettingsWithViewWrapper = (props: SettingsIconButtonProps) => {
  return <Settings {...props} />;
};

const style = StyleSheet.create({
  navItem: {
    paddingVertical: 8,
  },
  localButton: {
    borderRadius: 2,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    width: 30,
    height: 30,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'contain',
  },
});

export default Settings;
