import React, {useContext} from 'react';
import {whiteboardContext} from './WhiteboardConfigure';
import VideoRenderer from '../../pages/video-call/VideoRenderer';
import {useContent} from 'customization-api';
import WhiteboardView from './WhiteboardView';

const WhiteboardWrapper = () => {
  const {whiteboardUid} = useContext(whiteboardContext);
  const {customContent, pinnedUid, activeUids} = useContent();

  return (
    <VideoRenderer
      isMax={whiteboardUid === pinnedUid || whiteboardUid === activeUids[0]}
      user={{
        uid: customContent[whiteboardUid].uid,
        type: 'whiteboard',
        video: 0,
        audio: 0,
        parentUid: undefined,
      }}
      CustomChild={WhiteboardView}
    />
  );
};

export default WhiteboardWrapper;
