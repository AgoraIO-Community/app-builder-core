// @ts-nocheck
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import ThemeConfig from '../../theme';
import {CAPTION_CONTAINER_HEIGHT} from '../../components/CommonStyles';
import {useRtc, useContent, useLocalUid, useCaption} from 'customization-api';

const SonixCaptionContainer = () => {
  const {RtcEngineUnsafe} = useRtc();
  const {defaultContent, activeUids, customContent} = useContent();
  const localUid = useLocalUid();
  const {captionFeed, setCaptionFeed} = useCaption();
  const scrollRef = React.useRef<ScrollView>(null);

  useEffect(() => {
    // Add listener for transcription result
    RtcEngineUnsafe.addCustomListener(
      'onSonioxTranscriptionResult',
      (uid, transcript) => {
        console.log('sonix transcript =>', uid, transcript);
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

          // Skip if there's nothing new to add
          if (!finalText && !nonFinalText) {
            return prev;
          }

          // If same speaker, merge into last line
          if (last && last.uid === uid) {
            return [
              ...prev.slice(0, -1),
              {
                ...last,
                text: last.text + (finalText ? ' ' + finalText : ''),
                nonFinal: nonFinalText,
                time: Date.now(),
              },
            ];
          }

          // If speaker changes OR no previous entry
          if (finalText || nonFinalText) {
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

          return prev;
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
      RtcEngineUnsafe.stopSonioxTranscription();
    };
  }, []);

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      ref={scrollRef}
      showsVerticalScrollIndicator={true}
      onContentSizeChange={() => {
        scrollRef.current?.scrollToEnd({animated: true});
      }}>
      {captionFeed.map((entry, index) => (
        <Text key={index} style={styles.captionLine}>
          <Text style={styles.uid}>
            {entry.nonFinal || entry.text
              ? defaultContent[entry.uid].name + ' : '
              : ''}{' '}
          </Text>
          <Text style={styles.content}>{entry.text}</Text>
          {entry.nonFinal && <Text style={styles.live}>{entry.nonFinal}</Text>}
        </Text>
      ))}
    </ScrollView>
  );
};

export default SonixCaptionContainer;

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: CAPTION_CONTAINER_HEIGHT,
    height: CAPTION_CONTAINER_HEIGHT,
    backgroundColor: '#815f46',
    borderRadius: ThemeConfig.BorderRadius.small,
    marginTop: $config.ICON_TEXT ? 8 : 0,
    overflowY: 'scroll',
  },
  container: {
    padding: 12,
    flexGrow: 1,
  },
  captionLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
    flexShrink: 1,
    lineHeight: 24,
  },
  uid: {
    color: 'orange',
    fontWeight: 'bold',

    fontSize: 18,
    lineHeight: 24,
  },
  content: {
    color: 'white',
    fontSize: 18,
    flexShrink: 1, // test
    lineHeight: 24,
  },
  live: {
    color: 'skyblue',
    fontSize: 18,
    lineHeight: 24,
  },
});
