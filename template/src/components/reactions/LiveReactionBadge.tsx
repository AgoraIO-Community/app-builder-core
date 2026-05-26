import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {useVideoCall} from '../useVideoCall';

interface LiveReactionBadgeProps {
  uid: number | string;
}

const LiveReactionBadge = ({uid}: LiveReactionBadgeProps) => {
  const {latestReactionByUid} = useVideoCall();
  const reaction = latestReactionByUid[String(uid)];

  React.useEffect(() => {
    if (reaction) {
      console.log('reactions-debug', 'tile-badge-update', {
        uid,
        reactionId: reaction.reactionId,
        emoji: reaction.emoji,
      });
    }
  }, [reaction, uid]);

  if (!$config.ENABLE_LIVE_REACTIONS || !reaction) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      <Text style={styles.emoji}>{reaction.emoji}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1001,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%'],
  },
  emoji: {
    fontSize: 18,
    lineHeight: 20,
  },
});

export default LiveReactionBadge;
