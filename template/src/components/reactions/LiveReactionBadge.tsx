import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {useVideoCall} from '../useVideoCall';
import {getLiveReactionMap} from './catalog';

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

  const definition = getLiveReactionMap()[reaction.assetKey];
  const isCustom = !!definition?.custom;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        hasLeadingIcon ? styles.containerWithLeadingIcon : null,
      ]}>
      {isCustom ? (
        <Image
          source={definition!.asset}
          style={styles.customImage}
          resizeMode="contain"
          accessibilityLabel={definition!.custom!.label}
        />
      ) : (
        <Text style={styles.emoji}>{reaction.emoji}</Text>
      )}
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
  customImage: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});

export default LiveReactionBadge;
