import {Platform, StyleSheet, Text, View, ScrollView} from 'react-native';
import React from 'react';
import {isWeb, useRender, useRtc} from 'customization-api';
import protoRoot from './proto/ptoto';
import ThemeConfig from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCaption} from './useCaption';
import {TranscriptText} from './TranscriptText';
import Spacer from '../../../src/atoms/Spacer';

const Caption = () => {
  const {renderList} = useRender();
  const {RtcEngine} = useRtc();
  const renderListRef = React.useRef({renderList});
  const [text, setText] = React.useState(''); // state for current live caption
  const [textObj, setTextObj] = React.useState<{[key: string]: string}>({}); // state for current live caption for all users
  const finalList = React.useRef<{[key: number]: string[]}>({}); // holds transcript of final words of all users
  const outputStreamFinal = React.useRef<string>(''); // store in localStorage to access previous captions

  const {setTranscript, setMeetingTranscript, meetingTranscript} = useCaption();
  const startTimeRef = React.useRef<number>(0);
  const simpleTextRef = React.useRef<string>(''); // This is the full meeting text concatenated together.

  const captionsRef = React.useRef<Object>({});
  const simpletextMettingRef = React.useRef([]);

  const isSentenceBoundaryWord = (word) => {
    return word == '.' || word == '?';
  };

  const isPunctuationWord = (word) => {
    return word == '.' || word == '?' || word == ',';
  };

  const handleStreamMessageCallback = (...args) => {
    const [uid, payload] = args; // uid is of the bot which sends the stream messages in the channel
    let currentCaption = ''; // holds current caption
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

    let nonFinalList = [];
    let text1 = ''; // final name:text
    let text2 = '';
    let text3 = ''; // text
    const words = textstream.words;

    // categorize words into final & nonFinal objects per uid
    words.map((word) => {
      if (word.isFinal) {
        finalList.current[textstream.uid].push(word.text);
        // for boundary word clear the finallist for the uid
        if (isSentenceBoundaryWord(word.text)) {
          finalList.current[textstream.uid] = [];
        }
        text1 += `${userName}:${word.text}`;
        if (simpleTextRef.current.length > 0 && !isPunctuationWord(word.text)) {
          simpleTextRef.current += ' ';
          text3 += ' ';
        }
        text3 += word.text;
        simpleTextRef.current += word.text;

        currentCaption = word.text;
        const duration = performance.now() - startTimeRef.current;
        console.log(
          `Time taken to finalize caption ${currentCaption}: ${duration}ms`,
        );
        startTimeRef.current = null; // Reset start time
      } else {
        text2 += `${userName}:${word.text}`;
        nonFinalList.push(word.text);

        if (!startTimeRef.current) {
          startTimeRef.current = performance.now();
        }
      }
    });

    if (text1.length) {
      outputStreamFinal.current +=
        new Date().toLocaleString() + ' ' + text1 + '\n';
    }

    if (text3.length) {
      let flag = false;
      // this.simpletextMetting += this.allData[textstream.uid].name + '</>' + textstream.uid + '</>' + textstream.time + '</>' + text3 + '</br>';
      simpletextMettingRef.current.forEach((item) => {
        if (item.uid == textstream.uid && textstream.time - item.time < 60000) {
          item.text += text3;
          flag = true;
        } else {
          console.log('ready to push');
          console.log(item.name, item.text);
        }
      });
      meetingTranscript.forEach((item) => {
        if (item.uid == textstream.uid && textstream.time - item.time < 60000) {
          item.text += text3;
          flag = true;
        } else {
          console.log('ready to push');
          console.log(item.name, item.text);
        }
      });
      if (!flag) {
        // update with prev history
        simpletextMettingRef.current.push({
          name: userName,
          uid: textstream.uid,
          time: textstream.time,
          text: text3,
        });

        setMeetingTranscript((prev) => {
          return [
            ...prev,
            {
              name: userName,
              uid: textstream.uid,
              time: textstream.time,
              text: text3,
            },
          ];
        });
      }
      console.log('simple meeting --', simpletextMettingRef.current);

      // updating for transcript
      // const key = userName + ':' + new Date().getTime();
      // setTranscript((prevTranscript) => {
      //   return {
      //     ...prevTranscript,
      //     [key]: currentCaption,
      //   };
      // });
    }

    // including prev references of the caption
    let stringBuilder = finalList.current[textstream.uid].join(' ');
    stringBuilder += stringBuilder.length > 0 ? ' ' : '';
    stringBuilder += nonFinalList.join(' ');

    // check for adding only current caption
    let stringBuilder1 = '';
    stringBuilder1 += nonFinalList.join(' ');
    stringBuilder1 += ' ' + currentCaption;

    // adding prev final words

    // finalList.current[textstream.uid].forEach((item) => {
    //   if (stringBuilder.length > 0 && !isPunctuationWord(item)) {
    //     stringBuilder += ' ';
    //   }
    //   stringBuilder += item;
    //   if (isSentenceBoundaryWord(item)) {
    //     stringBuilder += '\n';
    //   }
    // });

    // nonFinalList.forEach((item) => {
    //   if (stringBuilder.length > 0 && !isPunctuationWord(item)) {
    //     stringBuilder += ' ';
    //   }
    //   stringBuilder += item;
    //   if (isSentenceBoundaryWord(item)) {
    //     stringBuilder += '\n';
    //   }
    // });

    if (textstream.words.length === 0) stringBuilder = '';
    console.group('STT-logs');
    console.log('stt-finalList =>', finalList);
    console.log('stt - simpleText =>', simpleTextRef.current);
    console.log('stt - text3 =>', text3);
    console.groupEnd();

    if (stringBuilder) {
      //setText(`${userName} : ${stringBuilder}`);

      setTextObj((prevState) => ({
        ...prevState,
        [textstream.uid]: stringBuilder,
      }));
    }

    if (currentCaption.length) {
      // updating for transcript
      const key = userName + ':' + new Date().getTime();
      setTranscript((prevTranscript) => {
        return {
          ...prevTranscript,
          [key]: currentCaption,
        };
      });
    }
  };

  const handleVolumeIndicator = () => {};

  React.useEffect(() => {
    RtcEngine.addListener('StreamMessage', handleStreamMessageCallback);
    RtcEngine.addListener('AudioVolumeIndication', handleVolumeIndicator);
  }, []);

  React.useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  const speakers = Object.entries(textObj);

  return (
    <ScrollView>
      {speakers.map(([key, value]) => (
        <TranscriptText
          key={key}
          user={
            renderListRef.current.renderList[Number(key)]?.name || 'Speaker'
          }
          value={value.trim()}
          captionContainerStyle={
            speakers.length === 1
              ? styles.singleCaptionContainerStyle
              : styles.captionContainerStyle
          }
          captionStyle={
            speakers.length === 1
              ? styles.singleCaptionStyle
              : styles.captionStyle
          }
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  captionStyle: {
    minHeight: 40,
  },
  singleCaptionStyle: {
    minHeight: 80,
  },
  captionContainerStyle: {
    height: 40,
    marginBottom: 8,
  },
  singleCaptionContainerStyle: {
    height: 80,
  },
});

export default Caption;
