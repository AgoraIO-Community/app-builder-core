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
import React from 'react';
import {StyleSheet} from 'react-native';
import {BtnTemplate, BtnTemplateInterface} from '../../../agora-rn-uikit';
import {useString} from '../../utils/useString';
import {useScreenshare} from './useScreenshare';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../../utils/useButtonTemplate';
/**
 * A component to start and stop screen sharing on web clients.
 * Screen sharing is not yet implemented on mobile platforms.
 * Electron has it's own screen sharing component
 */

export interface ScreenshareButtonProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    isScreenshareActive: boolean,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const ScreenshareButton = (props: ScreenshareButtonProps) => {
  const {isScreenshareActive, startUserScreenshare, stopUserScreenShare} =
    useScreenshare();
  //commented for v1 release
  //const screenShareButton = useString('screenShareButton')();
  const screenShareButton = 'Share';
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const onPress = () =>
    isScreenshareActive ? stopUserScreenShare() : startUserScreenshare();
  let btnTemplateProps: BtnTemplateInterface = {
    name: isScreenshareActive ? 'screenshareOffIcon' : 'screenshareIcon',
    onPress,
  };

  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = isScreenshareActive
      ? (style.activeBtn as Object)
      : (style.nonActiveBtn as Object);
  } else {
    btnTemplateProps.btnText = screenShareButton;
    btnTemplateProps.style = isScreenshareActive
      ? style.greenLocalButton
      : style.localButton;
  }

  return props?.render ? (
    props.render(onPress, isScreenshareActive, buttonTemplateName)
  ) : (
    <BtnTemplate {...btnTemplateProps} />
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    borderRadius: 20,
    borderColor: $config.PRIMARY_COLOR,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBtn: {
    backgroundColor: '#4BEB5B',
    borderRadius: 20,
    borderColor: '#F86051',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  nonActiveBtn: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  greenLocalButton: {
    backgroundColor: '#4BEB5B',
    borderRadius: 20,
    borderColor: '#F86051',
    width: 40,
    height: 40,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: '90%',
    height: '90%',
  },
});

export default ScreenshareButton;
