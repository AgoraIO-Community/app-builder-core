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

  const handleStreamMessageCallback2 = (...args) => {
    const [uid, payload] = args; // uid is of the bot which sends the stream messages in the channel
    let nonFinalList = []; // holds intermediate results
    let currentText = ''; // holds current caption
    const textstream = protoRoot
      .lookupType('Text')
      .decode(payload as Uint8Array) as any;
    console.log('STT - Parsed Textstream : ', textstream);

    const userName =
      renderListRef.current.renderList[textstream.uid]?.name || 'Speaker'; // identifying speaker of caption

    // creating [] for each user to store thier complete transcripts
    if (!finalList.current[textstream.uid]) {
      finalList.current[textstream.uid] = [];
    }

    const words = textstream.words;

    // categorize words into final & nonFinal objects per uid
    words.map((word) => {
      if (word.isFinal) {
        finalList.current[textstream.uid].push(word.text);
        if (meetingTextRef.current.length > 0) {
          meetingTextRef.current += ' ';
        }
        currentText += word.text;
        meetingTextRef.current += word.text;
        const duration = performance.now() - startTimeRef.current;
        console.log(
          `Time taken to finalize caption ${currentText}: ${duration}ms`,
        );
        startTimeRef.current = null; // Reset start time
      } else {
        nonFinalList.push(word.text);
        if (!startTimeRef.current) {
          startTimeRef.current = performance.now();
        }
      }
    });

    if (currentText.length) {
      let flag = false;
      meetingTranscriptRef.current.forEach((item) => {
        if (
          item.uid == textstream.uid &&
          new Date().getTime() - item.time < 30000
        ) {
          item.text = item.text + ' ' + currentText;
          flag = true;
          // update existing transcript for uid & time
        }
      });

      if (!flag) {
        // update with prev history
        meetingTranscriptRef.current.push({
          name: userName,
          uid: textstream.uid,
          time: new Date().getTime(), //textstream.time, // textstream.time returing value 699391063 - which is not comparable with timestamp
          text: currentText,
        });
      }

      setMeetingTranscript((prevTranscript) => {
        return [...meetingTranscriptRef.current];
      });
    }

    // including prev references of the caption
    let stringBuilder = finalList?.current[textstream.uid]?.join(' ');
    stringBuilder += stringBuilder?.length > 0 ? ' ' : '';
    stringBuilder += nonFinalList?.join(' ');

    // when stringBuilder is '' then it will clear the live captions when person stops speaking
    if (textstream.words.length === 0) {
      stringBuilder = '';
    }
    setTextObj((prevState) => ({
      ...prevState,
      [textstream.uid]: stringBuilder,
    }));

    if (textstream.words.length === 0) {
      // clearing prev sel when empty words
      finalList.current[textstream.uid] = [];
    }

    console.group('STT-logs');
    console.log('stt-finalList =>', finalList.current);
    console.log('stt - all meeting text =>', meetingTextRef.current);
    console.log('stt - meeting transcript =>', meetingTranscriptRef.current);
    console.log('stt - current text =>', currentText);
    console.groupEnd();
  };

  React.useEffect(() => {
    RtcEngine.addListener('StreamMessage', handleStreamMessageCallback);
  }, []);

  // React.useEffect(() => {
  //   renderListRef.current.renderList = renderList;
  // }, [renderList]);

  const speakers = Object.entries(textObj);
  const activeSpeakers = speakers.filter((item) => item[1] !== '');
  if (isLangChangeInProgress) return <Loading text="Setting Spoken Language" />;

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
