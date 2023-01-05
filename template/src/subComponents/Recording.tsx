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
import {ImageIcon as UIKitImageIcon} from '../../agora-rn-uikit';
import {useRecording} from './recording/useRecording';
import {useString} from '../utils/useString';
import Styles from '../components/styles';
import RecordingPopup from './RecordingPopup';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ThemeConfig from '../theme';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

export interface RecordingButtonProps {
  showLabel?: boolean;
  render?: (onPress: () => void, isRecordingActive: boolean) => JSX.Element;
  isOnActionSheet?: boolean;
}

const Recording = (props: RecordingButtonProps) => {
  const {startRecording, stopRecording, isRecordingActive} = useRecording();
  //commented for v1 release
  //const recordingButton = useString<boolean>('recordingButton');
  const recordingButton = (recording: boolean) =>
    recording ? 'Stop Rec' : 'Record';
  const [modalVisible, setModalVisible] = useState(false);
  const {showLabel = $config.ICON_TEXT, isOnActionSheet = false} = props;

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
        : $config.SECONDARY_ACTION_COLOR,
    },
    btnTextProps: {
      text: showLabel ? recordingButton(isRecordingActive) : '',
      textColor: $config.FONT_COLOR,
    },
    onPress,
  };

  iconButtonProps.isOnActionSheet = isOnActionSheet;

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
