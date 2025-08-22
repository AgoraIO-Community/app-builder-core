import React, {useEffect, useRef} from 'react';
import {Text, StyleSheet, Animated} from 'react-native';
import {useV2VHealthCheck} from './useV2VHealthCheck';
import ThemeConfig from '../../theme';

export const V2VHealthBadge = () => {
  const {isHealthy} = useV2VHealthCheck();
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isHealthy) {
      // start blinking when server down
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      blinkAnimation.start();

      return () => {
        blinkAnimation.stop();
      };
    } else {
      blinkAnim.setValue(1);
    }
  }, [isHealthy, blinkAnim]);

  if (isHealthy) {
    return null;
  }

  return (
    <Animated.View style={[styles.badge, {opacity: blinkAnim}]}>
      <Text style={styles.badgeText}>V2V Service Down</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: $config.SEMANTIC_ERROR,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});

export default V2VHealthBadge;
