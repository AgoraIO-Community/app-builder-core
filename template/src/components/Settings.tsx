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
import IconButton, {IconButtonProps} from '../atoms/IconButton';

export interface SettingsIconButtonProps {
  render?: (onPress: () => void, isPanelActive: boolean) => JSX.Element;
}

const Settings = (props: SettingsIconButtonProps) => {
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
        : $config.SECONDARY_ACTION_COLOR,
      iconBackgroundColor: isPanelActive
        ? $config.PRIMARY_ACTION_BRAND_COLOR
        : '',
    },
    btnTextProps: {
      text: $config.ICON_TEXT ? settingsLabel : '',
      textColor: $config.FONT_COLOR,
    },
  };

  return props?.render ? (
    props.render(onPress, isPanelActive)
  ) : (
    <>
      <View>
        <IconButton {...iconButtonProps} />
      </View>
    </>
  );
};

export const SettingsWithViewWrapper = (props: SettingsIconButtonProps) => {
  return <Settings {...props} />;
};

const style = StyleSheet.create({
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
