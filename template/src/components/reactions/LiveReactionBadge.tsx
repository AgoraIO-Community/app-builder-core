import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {useVideoCall} from '../useVideoCall';

interface LiveReactionBadgeProps {
  uid: number | string;
  hasLeadingIcon?: boolean;
}

const LiveReactionBadge = ({
  uid,
  hasLeadingIcon = false,
}: LiveReactionBadgeProps) => {
  const {latestReactionByUid} = useVideoCall();
  const reaction = latestReactionByUid[String(uid)];

  if (!$config.ENABLE_LIVE_REACTIONS || !reaction) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        hasLeadingIcon ? styles.containerWithLeadingIcon : null,
      ]}>
      <Text style={styles.emoji}>{reaction.emoji}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1001,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%'],
  },
  containerWithLeadingIcon: {
    left: 48,
  },
  emoji: {
    fontSize: 24,
    lineHeight: 26,
  },
});

export default LiveReactionBadge;
