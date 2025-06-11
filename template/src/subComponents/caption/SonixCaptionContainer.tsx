// @ts-nocheck
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import ThemeConfig from '../../theme';
import {CAPTION_CONTAINER_HEIGHT} from '../../components/CommonStyles';
import {useRtc, useContent, useLocalUid, useCaption} from 'customization-api';

const SonixCaptionContainer = () => {
  const {RtcEngineUnsafe} = useRtc();
  const [caption, setCaption] = useState('Listening...');
  const listenerRef = useRef(null);
  // const [captions, setCaptions] = useState<
  //   Record<string, {final: string[]; nonFinal: string}>
  // >({});
  const {defaultContent, activeUids, customContent} = useContent();
  const localUid = useLocalUid();
  const {sonixCaptions, setSonixCaptions, captionFeed, setCaptionFeed} =
    useCaption();

  useEffect(() => {
    // Add listener for transcription result
    // RtcEngineUnsafe.addCustomListener(
    //   'onSonioxTranscriptionResult',
    //   (uid, transcript) => {
    //     console.log('sonix Captions =>', uid, transcript);
    //     const newFinalTokens: string[] = [];
    //     let newNonFinal = '';

    //     for (const token of transcript.tokens || []) {
    //       if (token.is_final) {
    //         newFinalTokens.push(token.text);
    //       } else {
    //         newNonFinal += token.text;
    //       }
    //     }

    //     setSonixCaptions(prev => {
    //       const prevFinal = prev[uid]?.final || [];
    //       return {
    //         ...prev,
    //         [uid]: {
    //           final: [...prevFinal, ...newFinalTokens],
    //           nonFinal: newNonFinal,
    //         },
    //       };
    //     });
    //   },
    // );

    RtcEngineUnsafe.addCustomListener(
      'onSonioxTranscriptionResult',
      (uid, transcript) => {
        console.log('sonix transcript =>', transcript);
        const finalText = transcript.tokens
          .filter(t => t.is_final)
          .map(t => t.text)
          .join('');

        const nonFinalText = transcript.tokens
          .filter(t => !t.is_final)
          .map(t => t.text)
          .join('');

        setCaptionFeed(prev => {
          const last = prev[prev.length - 1];

          if (last && last.uid === uid) {
            // Update final and nonFinal in same entry
            return [
              ...prev.slice(0, -1),
              {
                ...last,
                text: last.text + (finalText ? ' ' + finalText : ''),
                nonFinal: nonFinalText,
                time: Date.now(),
              },
            ];
          } else {
            return [
              ...prev,
              {
                uid,
                text: finalText,
                nonFinal: nonFinalText,
                time: Date.now(),
              },
            ];
          }
        });
      },
    );

    // Start transcription for the users in the call , later move to start / button
    activeUids.map(uid => {
      RtcEngineUnsafe.startSonioxTranscription(
        uid,
        $config.SONIOX_API_KEY,
        uid === localUid,
      );
    });

    return () => {
      RtcEngineUnsafe.stopSonioxTranscription(); // move to action menu
    };
  }, []);

  return (
    // <View style={styles.container}>
    //   {Object.entries(sonixCaptions).map(([uid, {final, nonFinal}]) => (
    //     <Text key={uid} style={styles.captionText}>
    //       {final.map((word, i) => (
    //         <Text key={`f-${uid}-${i}`} style={{color: 'white'}}>
    //           {word}
    //         </Text>
    //       ))}
    //       <Text style={{color: 'skyblue'}}>{nonFinal}</Text>
    //     </Text>
    //   ))}
    // </View>
    <ScrollView contentContainerStyle={styles.container}>
      {captionFeed.map((entry, index) => (
        <Text key={index} style={styles.captionLine}>
          <Text style={styles.uid}>
            {entry.nonFinal || entry.text
              ? defaultContent[entry.uid].name + ' : '
              : ''}
          </Text>
          <Text style={styles.content}>{entry.text}</Text>
          {entry.nonFinal ? (
            <Text style={styles.live}>{entry.nonFinal}</Text>
          ) : null}
        </Text>
      ))}
    </ScrollView>
  );
};

export default SonixCaptionContainer;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 20,
    height: CAPTION_CONTAINER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey',
    borderRadius: ThemeConfig.BorderRadius.small,
    marginTop: $config.ICON_TEXT ? 8 : 0,
    width: '100%',
  },
  captionText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR,
    fontSize: 24,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  captionLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
    width: '100%',
  },
  uid: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 18,
    fontStyle: 'italic',
  },
  content: {
    flexShrink: 1,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR,
    fontSize: 20,
    flexWrap: 'wrap',
  },
  live: {
    color: 'skyblue',
    fontSize: 20,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
});
