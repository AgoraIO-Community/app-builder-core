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
import {BtnTemplate, BtnTemplateInterface} from '../../agora-rn-uikit';
import {useRecording} from './recording/useRecording';
import {useString} from '../utils/useString';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import Styles from '../components/styles';

export interface RecordingButtonProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    isRecordingActive: boolean,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const Recording = (props: RecordingButtonProps) => {
  const {startRecording, stopRecording, isRecordingActive} = useRecording();
  //commented for v1 release
  //const recordingButton = useString<boolean>('recordingButton');
  const recordingButton = (recording: boolean) =>
    recording ? 'Recording' : 'Record';
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const onPress = () => {
    if (!isRecordingActive) {
      startRecording && startRecording();
    } else {
      stopRecording && stopRecording();
    }
  };
  let btnTemplateProps: BtnTemplateInterface = {
    name: isRecordingActive ? 'recordingActiveIcon' : 'recordingIcon',
    onPress,
    color: isRecordingActive ? '#FD0845' : $config.PRIMARY_COLOR,
  };

  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.fullWidthButton as Object;
  } else {
    btnTemplateProps.btnText = recordingButton(isRecordingActive);
    btnTemplateProps.style = Styles.localButton as Object;
  }

  return props?.render ? (
    props.render(onPress, isRecordingActive, buttonTemplateName)
  ) : (
    <BtnTemplate {...btnTemplateProps} />
  );
};

export default Recording;
