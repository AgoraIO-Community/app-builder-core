import {Platform, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {isWeb, useRender, useRtc} from 'customization-api';
import protoRoot from './proto/ptoto';
import ThemeConfig from '../../../src/theme';
import {useCaptionToggle} from './useCaptionToggle';

const Caption = () => {
  const {renderList} = useRender();
  const {RtcEngine} = useRtc();
  const renderListRef = React.useRef({renderList});
  const [text, setText] = React.useState(''); // state for current caption
  const lastSeqRef = React.useRef<number>(-1); // stores last seg to verify we get new seq on each pass
  const finalList = React.useRef<Object>({}); // holds transcript of final words of all users
  const nonfinalList = React.useRef<Object>({}); // holds transcript of intermediate words for each pass of all users
  const outputStreamFinal = React.useRef<Object>({}); // store in localStorage to access previous captions

  const handleStreamMessageCallback = (...args) => {
    console.group('StreamMessage Callback');

    console.warn(`Recived data stream for Platform : ${Platform.OS}`, args);
    const uid = args[0];
    const payload = args[1];
    //TODO: on native getting illegal buffer error , need to check RN SDK datastream api
    if (isWeb) {
      let text1 = ''; // holds current caption
      const textstream = protoRoot
        .lookupType('Text')
        .decode(payload as unknown as Uint8Array) as any;
      console.log('Decoded stream:', textstream);
      const words = textstream.words;
      const userName =
        renderListRef.current.renderList[textstream.uid]?.name || 'User';

      if (textstream.seqnum === lastSeqRef.current) {
        return;
      }
      lastSeqRef.current = textstream.seqnum;

      //check if final & nonfinal list exists for the current user
      if (!finalList.current[textstream.uid]) {
        finalList.current[textstream.uid] = [];
      }
      if (!nonfinalList.current[textstream.uid]) {
        nonfinalList.current[textstream.uid] = [];
      }

      // categorize words into final & nonFinal objects
      words.map((word) => {
        if (word.isFinal) {
          finalList.current[textstream.uid].push(word.text);
          // if (isSentenceBoundaryWord(word.text)) {
          //   finalList.current[textstream.uid] = [];
          // }
          text1 = word.text;
        } else {
          nonfinalList.current[textstream.uid].push(word.text);
        }
      });

      if (text1.length) {
        // storing for transcript
        // outputStreamFinal.current +=
        //   userName + ':' + new Date().toLocaleString() + ' => ' + text1 + '\n';
        const key = userName + ':' + new Date().toLocaleString();
        outputStreamFinal.current[key] = text1;
        localStorage.setItem(
          'fullTranscript',
          JSON.stringify(outputStreamFinal.current),
        );
      }

      console.log('Full Transcript : \n', outputStreamFinal.current);

      if (text1) {
        setText(`${userName} : ${text1}`);
      }
    }
    console.groupEnd();
  };

  React.useEffect(() => {
    RtcEngine.addListener('StreamMessage', handleStreamMessageCallback);
    return () =>
      RtcEngine.removeListener('StreamMessage', handleStreamMessageCallback);
  }, []);

  React.useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  // console.log('stream: decoded', textstream);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
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
    minHeight: ThemeConfig.FontSize.medium,
  },
});
