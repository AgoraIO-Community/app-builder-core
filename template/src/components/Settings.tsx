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
import {BtnTemplate, BtnTemplateInterface} from '../../agora-rn-uikit';
import {useSidePanel} from '../utils/useSidePanel';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {useString} from '../utils/useString';
import Styles from './styles';

export interface SettingsIconButtonProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    isPanelActive: boolean,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const Settings = (props: SettingsIconButtonProps) => {
  const {primaryColor} = useContext(ColorContext);
  const {sidePanel, setSidePanel} = useSidePanel();
  //commented for v1 release
  //const settingsLabel = useString('settingsLabel')();
  const settingsLabel = 'Settings';
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const isPanelActive = sidePanel === SidePanelType.Settings;
  const onPress = () => {
    isPanelActive
      ? setSidePanel(SidePanelType.None)
      : setSidePanel(SidePanelType.Settings);
  };
  let btnTemplateProps: BtnTemplateInterface = {
    onPress: onPress,
    name: isPanelActive ? 'settingsFilled' : 'settings',
  };
  if (buttonTemplateName === ButtonTemplateName.bottomBar) {
    btnTemplateProps.btnText = settingsLabel;
    btnTemplateProps.style = Styles.localButtonWithoutBG as Object;
  } else {
    btnTemplateProps.style = [
      style.localButtonWithMatchingStyle,
      {borderColor: primaryColor},
    ];
  }
  return props?.render ? (
    props.render(onPress, isPanelActive, buttonTemplateName)
  ) : (
    <BtnTemplate {...btnTemplateProps} />
  );
};

export const SettingsWithViewWrapper = (props: SettingsIconButtonProps) => {
  return (
    <View style={[style.navItem, style.navSmItem]}>
      <Settings {...props} />
    </View>
  );
};

const style = StyleSheet.create({
  navItem: {
    height: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  navSmItem: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '15%',
  },
  main: {
    width: '50%',
    height: '80%',
    left: '25%',
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    justifyContent: 'space-evenly',
    alignContent: 'center',
    paddingVertical: 5,
    flexDirection: 'column',
  },
  popupPickerHolder: {
    // height: '40%',
    justifyContent: 'space-around',
    paddingHorizontal: '8%',
  },
  buttonIcon: {
    // width: 30,
    // height: 30,
    width: '100%',
    height: '100%',
    tintColor: $config.PRIMARY_COLOR,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
    // marginBottom: 20,
    alignSelf: 'center',
  },
  primaryBtn: {
    width: '60%',
    alignSelf: 'center',
    backgroundColor: $config.PRIMARY_COLOR,
    maxWidth: 400,
    minHeight: 45,
  },
  primaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
  localButton: {
    borderRadius: 2,
    borderColor: $config.PRIMARY_COLOR,
    // borderWidth: 1,
    width: 30,
    height: 30,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'contain',
  },
  localButtonWithMatchingStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default Settings;
