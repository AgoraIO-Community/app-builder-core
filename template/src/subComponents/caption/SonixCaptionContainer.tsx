// @ts-nocheck
import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import ThemeConfig from '../../theme';
import {CAPTION_CONTAINER_HEIGHT} from '../../components/CommonStyles';
import {useRtc, useContent, useLocalUid} from 'customization-api';

const SonixCaptionContainer = () => {
  const {RtcEngineUnsafe} = useRtc();
  const [caption, setCaption] = useState('Listening...');
  const listenerRef = useRef(null);
  const [captions, setCaptions] = useState<
    Record<string, {final: string[]; nonFinal: string}>
  >({});
  const {defaultContent, activeUids, customContent} = useContent();
  const localUid = useLocalUid();

  useEffect(() => {
    // Add listener for transcription result
    RtcEngineUnsafe.addCustomListener(
      'onSonioxTranscriptionResult',
      (uid, transcript) => {
        console.log('sonix Captions =>', uid, transcript);
        const newFinalTokens: string[] = [];
        let newNonFinal = '';

        for (const token of transcript.tokens || []) {
          if (token.is_final) {
            newFinalTokens.push(token.text);
          } else {
            newNonFinal += token.text;
          }
        }

        setCaptions(prev => {
          const prevFinal = prev[uid]?.final || [];
          return {
            ...prev,
            [uid]: {
              final: [...prevFinal, ...newFinalTokens],
              nonFinal: newNonFinal,
            },
          };
        });
      },
    );

    // Start transcription for the users in the call , later move to start / button
    //activeUids.map(uid => {
    RtcEngineUnsafe.startSonioxTranscription($config.SONIOX_API_KEY);
    //  });

    return () => {
      //RtcEngineUnsafe.stopSonioxTranscription(); // move to action menu
    };
  }, []);

  return (
    <View style={styles.container}>
      {Object.entries(captions).map(([uid, {final, nonFinal}]) => (
        <Text key={uid} style={styles.captionText}>
          {final.map((word, i) => (
            <Text key={`f-${uid}-${i}`} style={{color: 'white'}}>
              {word}
            </Text>
          ))}
          <Text style={{color: 'skyblue'}}>{nonFinal}</Text>
        </Text>
      ))}
    </View>
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
  },
  captionText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR,
    fontSize: 24,
    textAlign: 'left',
  },
});
