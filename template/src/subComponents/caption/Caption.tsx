import {StyleSheet, ScrollView} from 'react-native';
import React, {MutableRefObject} from 'react';
import {useRtc} from 'customization-api';
import protoRoot from './proto/ptoto';
import {useCaption} from './useCaption';
import {TranscriptText} from './TranscriptText';
import Spacer from '../../../src/atoms/Spacer';
import Loading from '../Loading';
import {ContentObjects} from '../../../agora-rn-uikit/src/Contexts/RtcContext';
import {streamMessageCallback} from './utils';
interface CaptionProps {
  renderListRef: MutableRefObject<{renderList: ContentObjects}>;
}

const Caption: React.FC<CaptionProps> = ({renderListRef}) => {
  const {RtcEngineUnsafe: RtcEngine} = useRtc();
  const [textObj, setTextObj] = React.useState<{[key: string]: string}>({}); // state for current live caption for all users
  const finalList = React.useRef<{[key: number]: string[]}>({}); // holds transcript of final words of all users
  const {setMeetingTranscript, meetingTranscript, isLangChangeInProgress} =
    useCaption();
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
    setTextObj,
  };

  const handleStreamMessageCallback = (...args) => {
    streamMessageCallback(args, sttObj);
  };

  React.useEffect(() => {
    RtcEngine.addListener('StreamMessage', handleStreamMessageCallback);
  }, []);

  // React.useEffect(() => {
  //   renderListRef.current.renderList = renderList;
  // }, [renderList]);

  const speakers = Object.entries(textObj);
  const activeSpeakers = speakers.filter((item) => item[1] !== '');
  if (isLangChangeInProgress)
    return <Loading text="Setting Spoken Language" background="transparent" />;

  return (
    <ScrollView>
      {speakers.map(([key, value], index) => (
        <>
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
          {index !== speakers.length - 1 && <Spacer size={10} />}
        </>
      ))}
    </ScrollView>
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
