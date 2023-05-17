import {StyleSheet, ScrollView} from 'react-native';
import React from 'react';
import {useRender, useRtc} from 'customization-api';
import protoRoot from './proto/ptoto';
import {useCaption} from './useCaption';
import {TranscriptText} from './TranscriptText';
import Spacer from '../../../src/atoms/Spacer';

const Caption = () => {
  const {renderList} = useRender();
  const {RtcEngine} = useRtc();
  const renderListRef = React.useRef({renderList});

  const [textObj, setTextObj] = React.useState<{[key: string]: string}>({}); // state for current live caption for all users
  const finalList = React.useRef<{[key: number]: string[]}>({}); // holds transcript of final words of all users
  const {setMeetingTranscript} = useCaption();
  const startTimeRef = React.useRef<number>(0);
  const meetingTextRef = React.useRef<string>(''); // This is the full meeting text concatenated together.

  const meetingTranscriptRef = React.useRef([]);

  const handleStreamMessageCallback = (...args) => {
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
        if (item.uid == textstream.uid && textstream.time - item.time < 30000) {
          item.text += currentText;
          flag = true;
          // update existing transcript for uid & time
        }
      });

      // meetingTranscript.forEach((item) => {
      //   if (item.uid == textstream.uid && textstream.time - item.time < 30000) {
      //     item.text += currentText;
      //     flag = true;
      //     // update existing transcript for uid & time
      //   }
      // });

      if (!flag) {
        // update with prev history
        meetingTranscriptRef.current.push({
          name: userName,
          uid: textstream.uid,
          time: textstream.time,
          text: currentText,
        });
        // setMeetingTranscript((prevTranscript) => {
        //   return [
        //     ...prevTranscript,
        //     {
        //       name: userName,
        //       uid: textstream.uid,
        //       time: textstream.time,
        //       text: currentText,
        //     },
        //   ];
        // });
      }
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
      const captionTxt = finalList.current[textstream.uid].join(' ');
      if (captionTxt) {
        setMeetingTranscript((prevTranscript) => {
          return [
            ...prevTranscript,
            {
              name: userName,
              uid: textstream.uid,
              time: new Date().getTime(),
              text: captionTxt,
            },
          ];
        });
      }
      // clearing prev sel when empty words
      finalList.current[textstream.uid] = [];
    }

    // console.group('STT-logs');
    // console.log('stt-finalList =>', finalList.current);
    // console.log('stt - all meeting text =>', meetingTextRef.current);
    // console.log('stt - meeting transcript =>', meetingTranscriptRef.current);
    // console.log('stt - current text =>', currentText);
    // console.groupEnd();
  };
  const handleVolumeCallback = (...args) => {
    console.log('in volume callback', args);
  };

  React.useEffect(() => {
    RtcEngine.addListener('StreamMessage', handleStreamMessageCallback);
    RtcEngine.addListener('AudioVolumeIndication', handleVolumeCallback);
  }, []);

  React.useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  const speakers = Object.entries(textObj);
  const activeSpeakers = speakers.filter((item) => item[1] !== '');

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
