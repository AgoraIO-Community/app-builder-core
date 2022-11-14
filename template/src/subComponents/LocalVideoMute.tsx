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
//@ts-ignore
import camOnIcon from '../assets/icons/cam-on.svg';
//@ts-ignore
import camOffIcon from '../assets/icons/cam-off.svg';
//@ts-ignore
import noCamIcon from '../assets/icons/no-cam.svg';
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
    //name: isVideoEnabled ? 'videocam' : 'videocamOff',
    icon: permissionDenied
      ? noCamIcon
      : isVideoEnabled
      ? camOnIcon
      : camOffIcon,
  };

  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.actionSheetButton as Object;
    btnTemplateProps.color = permissionDenied
      ? '#8F8F8F'
      : isVideoEnabled
      ? $config.PRIMARY_COLOR
      : '#999999';
  } else {
    btnTemplateProps.style = Styles.localButton as Object;
    btnTemplateProps.styleText = Styles.localButtonText as Object;
    btnTemplateProps.btnText = videoLabel;
    btnTemplateProps.color = permissionDenied
      ? '#8F8F8F'
      : isVideoEnabled
      ? $config.PRIMARY_COLOR
      : '#FF414D';
  }

  return props?.render ? (
    props.render(onPress, isVideoEnabled, buttonTemplateName)
  ) : (
    <BtnTemplate {...btnTemplateProps} />
  );
}

export default LocalVideoMute;
