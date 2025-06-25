import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import ThemeConfig from '../../theme';
import {CAPTION_CONTAINER_HEIGHT} from '../../components/CommonStyles';
import {
  useRtc,
  useContent,
  useLocalUid,
  useCaption,
  useRoomInfo,
} from 'customization-api';
import PQueue from 'p-queue';

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const SonixCaptionContainer = () => {
  const {RtcEngineUnsafe} = useRtc();
  const {defaultContent, activeUids} = useContent();
  const localUid = useLocalUid();
  const {
    captionFeed,
    setCaptionFeed,
    setIsSTTListenerAdded,
    isSTTListenerAdded,
  } = useCaption();
  const scrollRef = React.useRef<ScrollView>(null);
  const queueRef = React.useRef(new PQueue({concurrency: 1}));
  const [autoScroll, setAutoScroll] = useState(true);

  // in-progress captions per speaker now
  const activeCaptionsRef = useRef({});
  const {
    data: {channel},
  } = useRoomInfo();

  const engine = RtcEngineUnsafe;

  useEffect(() => {
    const createBot = async () => {
      try {
        const response = await fetch('http://34.221.57.161:8000/create_bot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel_name: channel, // '2e01d5e2-0ca7-4e9b-8d39-191e9bc3802e',
            user_id: localUid.toString(), //'2201',
            source_lang: ['*'],
            target_lang: 'en',
          }),
        });
        const data = await response.json();
        console.log('Bot created:', data);
      } catch (error) {
        console.error('Error creating bot:', error);
      }
    };

    const addStreamListener = () => {
      !isSTTListenerAdded &&
        RtcEngineUnsafe.addListener('onStreamMessage', sonixCaptionCallback);
    };
    addStreamListener();
    createBot();
  }, []);

  const sonixCaptionCallback = (uid, transcript) => {
    setIsSTTListenerAdded(true);
    const queueCallback = () => {
      console.log('sonix transcript =>', uid, transcript);
      const jsonString = new TextDecoder().decode(transcript);
      const data = JSON.parse(jsonString);

      console.log('Decoded stream message:', data);
      const finalData = JSON.parse(data.token);

      const finalText = finalData
        .filter(t => t.is_final)
        .map(t => t.text)
        .join('');
      const nonFinalText = finalData
        .filter(t => !t.is_final)
        .map(t => t.text)
        .join('');

      // merge into in-progress buffer
      const active = activeCaptionsRef.current[uid] || {
        uid,
        text: '',
        nonFinal: '',
        time: Date.now(),
      };

      if (finalText) {
        active.text = (active.text + ' ' + finalText).trim();
      }
      active.nonFinal = nonFinalText;
      active.time = Date.now();
      activeCaptionsRef.current[uid] = active;

      // If fully finalized, commit to feed + remove from active buffer
      if (!nonFinalText && finalText) {
        setCaptionFeed(prev => [...prev, {...active, nonFinal: ''}]);
        delete activeCaptionsRef.current[uid];
      } else {
        // partial update: force rerender by setting dummy feed (not needed in your hook-based context)
        setCaptionFeed(prev => [...prev]); // triggers UI refresh
      }
    };

    queueRef.current.add(queueCallback);
  };

  const handleScroll = event => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setAutoScroll(isAtBottom);
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      ref={scrollRef}
      showsVerticalScrollIndicator={true}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onContentSizeChange={() => {
        if (autoScroll) {
          scrollRef.current?.scrollToEnd({animated: true});
        }
      }}>
      {/* Show committed lines
      {captionFeed.map((entry, index) => (
        <Text key={`feed-${index}`} style={styles.captionLine}>
          <Text style={styles.uid}>
            {defaultContent[entry.uid]?.name} ({formatTime(entry.time)}) :
          </Text>
          <Text style={styles.content}> {entry.text}</Text>
        </Text>
      ))}

      {/*  Show all active speakers */}
      {/* {Object.values(activeCaptionsRef.current)
        .filter(entry => entry.text || entry.nonFinal)
        .map((entry, index) => (
          <Text key={`active-${index}`} style={styles.captionLine}>
            <Text style={styles.uid}>
              {defaultContent[entry.uid]?.name} ({formatTime(entry.time)}) :
            </Text>
            <Text style={styles.content}> {entry.text}</Text>
            {entry.nonFinal && (
              <Text style={styles.live}> {entry.nonFinal}</Text>
            )}
          </Text>
        ))} */}
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
    flexShrink: 1,
    lineHeight: 24,
  },
  live: {
    color: 'skyblue',
    fontSize: 18,
    lineHeight: 24,
  },
});
