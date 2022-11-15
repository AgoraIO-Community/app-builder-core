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
import {BtnTemplate, BtnTemplateInterface} from '../../../agora-rn-uikit';
import Styles from '../../components/styles';
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

  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const onPress = () =>
    isScreenshareActive ? stopUserScreenShare() : startUserScreenshare();
  let btnTemplateProps: BtnTemplateInterface = {
    name: isScreenshareActive ? 'screenshareStop' : 'screenshareStart',
    onPress,
    styleIcon: {
      width: 24,
      height: 24,
    },
  };

  const screenShareButton = isScreenshareActive ? 'Stop Share' : 'Start Share';
  // if (buttonTemplateName === ButtonTemplateName.topBar) {
  //   btnTemplateProps.style = Styles.fullWidthButton as Object;
  // } else {
  btnTemplateProps.btnText = screenShareButton;
  btnTemplateProps.style = Styles.localButton as object;
  btnTemplateProps.styleText = {
    fontFamily: 'Source Sans Pro',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
    color: isScreenshareActive ? '#FF414D' : '#099DFD',
  };
  //}

  return props?.render ? (
    props.render(onPress, isScreenshareActive, buttonTemplateName)
  ) : (
    <BtnTemplate {...btnTemplateProps} />
  );
};

export default ScreenshareButton;
