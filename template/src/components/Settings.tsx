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
      tintColor: isPanelActive ? '#FFFFFF' : '#099DFD',
    },
  };
  iconButtonProps.style = Styles.localButton as Object;
  iconButtonProps.btnText = settingsLabel;
  iconButtonProps.styleText = {
    fontFamily: 'Source Sans Pro',
    fontSize: 12,
    marginTop: 4,
    fontWeight: isPanelActive ? '700' : '400',
    color: isPanelActive ? '#FFFFFF' : '#099DFD',
  };
  return props?.render ? (
    props.render(onPress, isPanelActive)
  ) : (
    <View
      style={[
        style.navItem,
        {
          backgroundColor: isPanelActive
            ? $config.PRIMARY_COLOR
            : 'transparent',
        },
      ]}>
      <IconButton {...iconButtonProps} />
    </View>
  );
};

export const SettingsWithViewWrapper = (props: SettingsIconButtonProps) => {
  return <Settings {...props} />;
};

const style = StyleSheet.create({
  navItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  localButton: {
    borderRadius: 2,
    borderColor: $config.PRIMARY_COLOR,
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
