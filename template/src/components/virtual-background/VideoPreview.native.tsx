import React from 'react';
import {MaxVideoView, useLocalUid} from '../../../agora-rn-uikit';
import {useContent, usePreCall, useRtc} from 'customization-api';
import InlineNotification from '../../atoms/InlineNotification';

interface VideoPreviewProps {
  isLocalVideoON?: boolean;
}

const VideoPreview = ({isLocalVideoON = false}: VideoPreviewProps) => {
  const {defaultContent} = useContent();
  const {isCameraAvailable} = usePreCall();
  const localUid = useLocalUid();

  const rtc = useRtc();
  const fallbackText = isCameraAvailable
    ? `Camera is currently off. Selected background will be applied as soon
as your camera turns on.`
    : `Your camera is switched off. Save a background to apply once it’s turned on.`;
  rtc?.RtcEngineUnsafe?.startPreview();

  if (!isLocalVideoON) {
    return <InlineNotification text={fallbackText} />;
  }

  return (
    <MaxVideoView
      user={defaultContent[localUid]}
      key={localUid}
      fallback={() => <InlineNotification text={fallbackText} />}
      isFullView={true}
      containerStyle={{
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    />
  );
};

export default VideoPreview;
