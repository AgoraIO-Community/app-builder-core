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
import React, {useEffect, useState} from 'react';
import {useRecording} from './recording/useRecording';
import {useString} from '../utils/useString';
import Styles from '../components/styles';
import RecordingPopup from './RecordingPopup';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ThemeConfig from '../theme';

export interface RecordingButtonProps {
  showLabel?: boolean;
  render?: (onPress: () => void, isRecordingActive: boolean) => JSX.Element;
}

const Recording = (props: RecordingButtonProps) => {
  const {startRecording, stopRecording, isRecordingActive} = useRecording();
  //commented for v1 release
  //const recordingButton = useString<boolean>('recordingButton');
  const recordingButton = (recording: boolean) =>
    recording ? 'Stop Recording' : 'Record';
  const [modalVisible, setModalVisible] = useState(false);
  const {showLabel = true} = props;

  const doStopRecording = () => {
    if (isRecordingActive) {
      stopRecording && stopRecording();
      setModalVisible(false);
    }
  };

  const onPress = () => {
    if (!isRecordingActive) {
      startRecording && startRecording();
    } else {
      setModalVisible(true);
    }
  };
  let iconButtonProps: IconButtonProps = {
    iconProps: {
      name: isRecordingActive ? 'stop-recording' : 'recording',
      tintColor: isRecordingActive
        ? $config.SEMANTIC_ERROR
        : $config.PRIMARY_ACTION_BRAND_COLOR,
    },
    onPress,
  };

  iconButtonProps.btnText = showLabel ? recordingButton(isRecordingActive) : '';

  iconButtonProps.styleText = {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
    color: isRecordingActive
      ? $config.SEMANTIC_ERROR
      : $config.PRIMARY_ACTION_BRAND_COLOR,
  };
  iconButtonProps.toolTipMessage = showLabel
    ? !isRecordingActive
      ? 'Record'
      : 'Stop Recording'
    : '';

  return props?.render ? (
    props.render(onPress, isRecordingActive)
  ) : (
    <>
      <RecordingPopup
        stopRecording={doStopRecording}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <IconButton {...iconButtonProps} />
    </>
  );
};

export default Recording;
