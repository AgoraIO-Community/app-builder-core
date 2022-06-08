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
import {
  BtnTemplate,
  ToggleState,
  LocalContext,
  BtnTemplateInterface,
} from '../../agora-rn-uikit';
import useMuteToggleLocal, {MUTE_LOCAL_TYPE} from '../utils/useMuteToggleLocal';
import Styles from '../components/styles';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {useString} from '../utils/useString';

/**
 * A component to mute / unmute the local video
 */
export interface LocalVideoMuteProps {
  buttonTemplateName?: ButtonTemplateName;
}

function LocalVideoMute(props: LocalVideoMuteProps) {
  const local = useContext(LocalContext);
  const localMute = useMuteToggleLocal();
  const videoLabel = useString('toggleVideoButton')();
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;

  let btnTemplateProps: BtnTemplateInterface = {
    onPress: () => {
      localMute(MUTE_LOCAL_TYPE.video);
    },
    name: local.video === ToggleState.enabled ? 'videocam' : 'videocamOff',
  };

  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.fullWidthButton as Object;
  } else {
    btnTemplateProps.style = Styles.localButton as Object;
    btnTemplateProps.btnText = videoLabel;
  }

  return <BtnTemplate {...btnTemplateProps} />;
}

export default LocalVideoMute;
