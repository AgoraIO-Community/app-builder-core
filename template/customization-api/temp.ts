//exporting for simple-practice demo

import VideoRenderer from '../src/pages/video-call/VideoRenderer';
import {DispatchContext} from '../agora-rn-uikit';
import IconButton from '../src/atoms/IconButton';
import WhiteboardView from '../src/components/whiteboard/WhiteboardView';
import {whiteboardContext} from '../src/components/whiteboard/WhiteboardConfigure';
import {useVideoCall} from '../src/components/useVideoCall';
import {useScreenshare} from '../src/subComponents/screenshare/useScreenshare';

export {
  VideoRenderer,
  DispatchContext,
  IconButton,
  WhiteboardView,
  whiteboardContext,
  useVideoCall,
  useScreenshare,
};
