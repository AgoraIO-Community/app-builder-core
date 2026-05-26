import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useVideoCall} from '../useVideoCall';
import {LIVE_REACTION_LANE_COUNT} from './catalog';

const LiveReactionStageOverlay = () => {
  const {floatingReactions} = useVideoCall();

  if (!$config.ENABLE_LIVE_REACTIONS || floatingReactions.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {floatingReactions.map((reaction, index) => {
        const lane =
          typeof reaction.lane === 'number'
            ? reaction.lane
            : index % LIVE_REACTION_LANE_COUNT;
        const left = 16 + lane * 48;

        return (
          <View
            key={reaction.reactionId}
            style={[styles.reactionContainer, {left}]}>
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text numberOfLines={1} style={styles.reactionSender}>
              {reaction.senderDisplayName || reaction.senderUid}
            </Text>
          </View>
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
  reactionContainer: {
    position: 'absolute',
    bottom: 18,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  reactionEmoji: {
    fontSize: 32,
    lineHeight: 36,
  },
  reactionSender: {
    marginTop: 2,
    maxWidth: 64,
    fontSize: 11,
    lineHeight: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});

export default LiveReactionStageOverlay;
