import {StyleSheet, View, Platform} from 'react-native';
import React, {MutableRefObject} from 'react';
import {isWeb, useRtc} from 'customization-api';
import protoRoot from './proto/ptoto';
import {useCaption} from './useCaption';
import {TranscriptText} from './TranscriptText';
import Spacer from '../../../src/atoms/Spacer';
import Loading from '../Loading';
import {RenderObjects} from '../../../agora-rn-uikit/src/Contexts/RtcContext';
import {streamMessageCallback} from './utils';
import {isWebInternal} from '../../utils/common';

interface CaptionProps {
  renderListRef: MutableRefObject<{renderList: RenderObjects}>;
}

const Caption: React.FC<CaptionProps> = ({renderListRef}) => {
  const {RtcEngine} = useRtc();
  const finalList = React.useRef<{[key: number]: string[]}>({}); // holds transcript of final words of all users
  const {
    setMeetingTranscript,
    meetingTranscript,
    isLangChangeInProgress,
    isSTTActive,
    captionObj, //state for current live caption for all users
    setCaptionObj,
  } = useCaption();
  const startTimeRef = React.useRef<number>(0);
  const meetingTextRef = React.useRef<string>(''); // This is the full meeting text concatenated together.

  const meetingTranscriptRef = React.useRef(meetingTranscript);
  const sttObj = {
    renderListRef,
    finalList,
    meetingTextRef,
    startTimeRef,
    meetingTranscriptRef,
    setMeetingTranscript,
    setCaptionObj,
  };

  const handleStreamMessageCallback1 = (...args: any[]) => {
    if (isWebInternal()) {
      streamMessageCallback(args, sttObj);
    } else {
      const [uid, , data] = args;
      const streamBuffer = Object.values(data);
      streamMessageCallback([uid, streamBuffer], sttObj);
    }
  };

  React.useEffect(() => {
    if (!isSTTActive) {
      RtcEngine.addListener('StreamMessage', handleStreamMessageCallback1);
    }
    setCaptionObj({}); // clear live captions on mount
  }, []);

  const speakers = Object.entries(captionObj);
  const activeSpeakers = speakers.filter((item) => item[1] !== '');
  if (isLangChangeInProgress)
    return <Loading text="Setting Spoken Language" background="transparent" />;

  return (
    <View>
      {speakers.map(([key, value], index) => (
        <TranscriptText
          key={key}
          user={
            renderListRef.current.renderList[Number(key)]?.name || 'Speaker'
          }
          value={value.trim()}
          captionContainerStyle={
            activeSpeakers.length === 1
              ? styles.singleCaptionContainerStyle
              : styles.captionContainerStyle
          }
          captionStyle={
            activeSpeakers.length === 1
              ? styles.singleCaptionStyle
              : styles.captionStyle
          }
        />
        /* {index !== speakers.length - 1 && <Spacer size={10} />} */
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  captionStyle: {
    minHeight: 45,
  },
  singleCaptionStyle: {
    minHeight: 90,
  },
  captionContainerStyle: {
    height: 45,
  },
  singleCaptionContainerStyle: {
    height: 90,
  },
});

export default Caption;
