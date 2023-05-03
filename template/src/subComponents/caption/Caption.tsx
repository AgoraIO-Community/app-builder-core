import {Platform, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {isWeb, useRender, useRtc} from 'customization-api';
import protoRoot from './proto/ptoto';
import ThemeConfig from '../../../src/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCaption} from './useCaption';
import Transcript from './Transcript';
import {TranscriptText} from './TranscriptText';

const Caption = () => {
  const {renderList} = useRender();
  const {RtcEngine} = useRtc();
  const renderListRef = React.useRef({renderList});
  const [text, setText] = React.useState(''); // state for current live caption
  const finalList = React.useRef<Object>({}); // holds transcript of final words of all users
  const nonfinalList = React.useRef<Object>({}); // holds transcript of intermediate words for each pass of all users
  const outputStreamFinal = React.useRef<Object>({}); // store in localStorage to access previous captions
  const {setTranscript} = useCaption();
  const startTimeRef = React.useRef(0);

  // if want to persist chat script after user refreshes the page
  const updateInStorage = async (obj) => {
    try {
      await AsyncStorage.setItem('fullTranscript', JSON.stringify(obj));
    } catch (error) {
      console.log(error);
    }
  };

  const handleStreamMessageCallback = (...args) => {
    console.warn(`Recived data stream for Web : ${Platform.OS}`, args);
    const [uid, payload] = args;
    //TODO: on native getting illegal buffer error , need to check RN SDK datastream api

    let currentCaption = ''; // holds current caption
    const textstream = protoRoot
      .lookupType('Text')
      .decode(payload as Uint8Array) as any;

    const words = textstream.words;
    const userName =
      renderListRef.current.renderList[textstream.uid]?.name || 'Speaker';
    console.log(
      `Decoded stream for ${userName} (${textstream.uid}) :`,
      textstream,
    );

    //check if we can use the nonfinal words to show live caption and when final words is there we compare and update that
    // if (!finalList.current[textstream.uid]) {
    //   finalList.current[textstream.uid] = [];
    // }
    // if (!nonfinalList.current[textstream.uid]) {
    //   nonfinalList.current[textstream.uid] = [];
    // }

    // categorize words into final & nonFinal objects per uid
    words.map((word) => {
      if (word.isFinal) {
        //    finalList.current[textstream.uid].push(word.text);
        currentCaption = word.text;
        const duration = performance.now() - startTimeRef.current;
        console.log(
          `Time taken to finalize caption ${currentCaption}: ${duration}ms`,
        );
        startTimeRef.current = null; // Reset start time
      } else {
        //   nonfinalList.current[textstream.uid].push(word.text);
        // verify if we can use the nonfinalList to update the live caption text of a particular user so that there is less latency
        if (!startTimeRef.current) {
          startTimeRef.current = performance.now();
        }
      }
    });

    if (currentCaption.length) {
      setText(`${userName} : ${currentCaption}`);
      const key = userName + ':' + new Date().getTime();
      //outputStreamFinal.current[key] = currentCaption;

      setTranscript((prevTranscript) => {
        return {
          ...prevTranscript,
          [key]: currentCaption,
        };
      });

      // updateInStorage(outputStreamFinal.current);
    }
  };

  React.useEffect(() => {
    RtcEngine.addListener('StreamMessage', handleStreamMessageCallback);
  }, []);

  React.useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  return (
    <View style={styles.container}>
      <TranscriptText
        user={text.split(':')[0]}
        value={text.split(':')[1]}
        containerStyle={styles.captionContainer}
        nameContainerStyle={styles.nameContainer}
      />
    </View>
  );
};

export default Caption;

const styles = StyleSheet.create({
  text: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.medium,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  container: {
    // minHeight: ThemeConfig.FontSize.medium,
    maxWidth: 1000,
    alignSelf: 'flex-start',
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginRight: 10,
    marginBottom: 0,
  },
});
