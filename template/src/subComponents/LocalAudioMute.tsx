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
import Icons from '../assets/icons';
/**
 * A component to mute / unmute the local audio
 */
export interface LocalAudioMuteProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    isAudioEnabled: boolean,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

function LocalAudioMute(props: LocalAudioMuteProps) {
  const local = useLocalUserInfo();
  const localMute = useMuteToggleLocal();
  //commented for v1 release
  //const audioLabel = useString('toggleAudioButton')();

  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;

  const onPress = () => {
    localMute(MUTE_LOCAL_TYPE.audio);
  };
  const isAudioEnabled = local.audio === ToggleState.enabled;
  const audioLabel = isAudioEnabled ? 'Mute' : 'Unmute';

  const permissionDenied =
    local.permissionStatus === PermissionState.REJECTED ||
    local.permissionStatus === PermissionState.GRANTED_FOR_CAM_ONLY;
  let btnTemplateProps: BtnTemplateInterface = {
    onPress: onPress,
    //name: isAudioEnabled ? 'mic' : 'micOff',
    icon: permissionDenied
      ? Icons.noMic
      : isAudioEnabled
      ? Icons.mic
      : Icons.micOff,
  };

  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.localButtonSmall as Object;
    btnTemplateProps.color = permissionDenied
      ? '#8F8F8F'
      : isAudioEnabled
      ? $config.PRIMARY_COLOR
      : '#999999';
  } else {
    btnTemplateProps.style = Styles.localButton as Object;
    btnTemplateProps.styleText = Styles.localButtonText as Object;
    btnTemplateProps.btnText = audioLabel;
    btnTemplateProps.color = permissionDenied
      ? '#8F8F8F'
      : isAudioEnabled
      ? $config.PRIMARY_COLOR
      : '#FF414D';
  }

  return props?.render ? (
    props.render(onPress, isAudioEnabled, buttonTemplateName)
  ) : (
    <BtnTemplate {...btnTemplateProps} />
  );
}

export default LocalAudioMute;
