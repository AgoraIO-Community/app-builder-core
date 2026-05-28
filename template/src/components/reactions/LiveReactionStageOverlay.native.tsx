import React from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useVideoCall} from '../useVideoCall';
import {LIVE_REACTION_LANE_COUNT} from './catalog';

const NATIVE_REACTION_START_BOTTOM = 18;
const NATIVE_REACTION_TOP_MARGIN = 120;
const NATIVE_REACTION_MIN_TRAVEL = 220;

const AnimatedReaction = ({
  emoji,
  sender,
  left,
  travel,
}: {
  emoji: string;
  sender: string;
  left: number;
  travel: number;
}) => {
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 4200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, travel]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -travel],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.12, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.reactionContainer,
        {
          left,
          bottom: NATIVE_REACTION_START_BOTTOM,
          opacity,
          transform: [{translateY}],
        },
      ]}>
      <Text style={styles.reactionEmoji}>{emoji}</Text>
      <View style={styles.reactionSenderPill}>
        <Text numberOfLines={1} style={styles.reactionSender}>
          {sender}
        </Text>
      </View>
    </Animated.View>
  );
};

const LiveReactionDebugGuides = ({travel}: {travel: number}) => {
  const mid = NATIVE_REACTION_START_BOTTOM + travel / 2;
  const end = NATIVE_REACTION_START_BOTTOM + travel;

  return (
    <View pointerEvents="none" style={styles.debugOverlay}>
      <View style={styles.debugLanes}>
        {Array.from({length: LIVE_REACTION_LANE_COUNT}).map((_, index) => (
          <View key={`debug-lane-${index}`} style={styles.debugLane} />
        ))}
      </View>
      <View
        style={[styles.debugStartLine, {bottom: NATIVE_REACTION_START_BOTTOM}]}
      />
      <View style={[styles.debugMidLine, {bottom: mid}]} />
      <View style={[styles.debugEndLine, {bottom: end}]} />
      <Text
        style={[
          styles.debugLabel,
          {bottom: NATIVE_REACTION_START_BOTTOM},
          styles.debugLabelStart,
        ]}>
        0% opacity
      </Text>
      <Text style={[styles.debugLabel, {bottom: mid}, styles.debugLabelMid]}>
        100% opacity
      </Text>
      <Text style={[styles.debugLabel, {bottom: end}, styles.debugLabelEnd]}>
        0% opacity
      </Text>
    </View>
  );
};

const LiveReactionStageOverlay = () => {
  const {floatingReactions} = useVideoCall();
  const [overlayHeight, setOverlayHeight] = React.useState(0);
  const travel = Math.max(
    NATIVE_REACTION_MIN_TRAVEL,
    overlayHeight - NATIVE_REACTION_START_BOTTOM - NATIVE_REACTION_TOP_MARGIN,
  );
  // const isDebugVisible = __DEV__ && $config.ENABLE_LIVE_REACTIONS;
  const isDebugVisible = false;

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    if (nextHeight > 0) {
      setOverlayHeight(nextHeight);
    }
  }, []);

  if (!$config.ENABLE_LIVE_REACTIONS || floatingReactions.length === 0) {
    return null;
  }

  return (
    <View onLayout={handleLayout} pointerEvents="none" style={styles.overlay}>
      {isDebugVisible ? <LiveReactionDebugGuides travel={travel} /> : null}
      {floatingReactions.map((reaction, index) => {
        const lane =
          typeof reaction.lane === 'number'
            ? reaction.lane
            : index % LIVE_REACTION_LANE_COUNT;
        const left = 16 + lane * 48;

        return (
          <AnimatedReaction
            key={reaction.reactionId}
            left={left}
            emoji={reaction.emoji}
            sender={reaction.senderDisplayName || reaction.senderUid}
            travel={travel}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  debugOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  debugLanes: {
    position: 'absolute',
    top: 0,
    left: 16,
    width: 240,
    height: '100%',
    flexDirection: 'row',
  },
  debugLane: {
    width: 48,
    height: '100%',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(104, 227, 255, 0.45)',
  },
  debugStartLine: {
    position: 'absolute',
    left: 16,
    width: 240,
    height: 1,
    backgroundColor: 'rgba(255, 91, 91, 0.9)',
  },
  debugMidLine: {
    position: 'absolute',
    left: 16,
    width: 240,
    height: 1,
    backgroundColor: 'rgba(255, 206, 86, 0.95)',
  },
  debugEndLine: {
    position: 'absolute',
    left: 16,
    width: 240,
    height: 1,
    backgroundColor: 'rgba(104, 227, 255, 0.9)',
  },
  debugLabel: {
    position: 'absolute',
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 10,
    lineHeight: 12,
    color: '#fff',
  },
  debugLabelStart: {
    backgroundColor: 'rgba(255, 91, 91, 0.95)',
  },
  debugLabelMid: {
    backgroundColor: 'rgba(255, 206, 86, 0.95)',
  },
  debugLabelEnd: {
    backgroundColor: 'rgba(104, 227, 255, 0.95)',
  },
  reactionContainer: {
    position: 'absolute',
    width: 64,
    height: 86,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 4,
    paddingBottom: 4,
  },
  reactionEmoji: {
    fontSize: 32,
    lineHeight: 38,
  },
  reactionSenderPill: {
    minWidth: 48,
    width: 88,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionSender: {
    maxWidth: 68,
    fontSize: 12,
    lineHeight: 12,
    fontFamily: 'Source Sans 3',
    fontWeight: '400',
    color: $config.BACKGROUND_COLOR,
    textAlign: 'center',
  },
});

export default LiveReactionStageOverlay;
