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
import {
  BtnTemplate,
  ToggleState,
  BtnTemplateInterface,
  PermissionState,
} from '../../agora-rn-uikit';
import useMuteToggleLocal, {MUTE_LOCAL_TYPE} from '../utils/useMuteToggleLocal';
import Styles from '../components/styles';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {useString} from '../utils/useString';
import {useLocalUserInfo} from 'customization-api';
/**
 * A component to mute / unmute the local video
 */
export interface LocalVideoMuteProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    isVideoEnabled: boolean,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

function LocalVideoMute(props: LocalVideoMuteProps) {
  const local = useLocalUserInfo();
  const localMute = useMuteToggleLocal();
  //commented for v1 release
  //const videoLabel = useString('toggleVideoButton')();

  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const onPress = () => {
    localMute(MUTE_LOCAL_TYPE.video);
  };
  const isVideoEnabled = local.video === ToggleState.enabled;
  const videoLabel = isVideoEnabled ? 'Stop Video' : 'Start Video';

  const permissionDenied =
    local.permissionStatus === PermissionState.REJECTED ||
    local.permissionStatus === PermissionState.GRANTED_FOR_MIC_ONLY;

  let btnTemplateProps: BtnTemplateInterface = {
    onPress: onPress,
    name: permissionDenied
      ? 'videocamNotAvailable'
      : isVideoEnabled
      ? 'videocamOn'
      : 'videocamOff',
    disabled: permissionDenied ? true : false,
  };
  btnTemplateProps.styleText = {
    fontFamily: 'Source Sans Pro',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
    color: permissionDenied
      ? '#8F8F8F'
      : isVideoEnabled
      ? $config.PRIMARY_COLOR
      : '#FF414D',
  };
  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.localButtonSmall as Object;
    btnTemplateProps.styleIcon = {
      width: 20,
      height: 20,
    };
  } else {
    btnTemplateProps.style = Styles.localButton as Object;
    btnTemplateProps.btnText = videoLabel;
    btnTemplateProps.styleIcon = {
      width: 24,
      height: 24,
    };
  }

  return props?.render ? (
    props.render(onPress, isVideoEnabled, buttonTemplateName)
  ) : (
    <BtnTemplate {...btnTemplateProps} />
  );
}

export default LocalVideoMute;
