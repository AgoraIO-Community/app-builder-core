import {StyleSheet, Text, View} from 'react-native';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import React from 'react';

const AnimatedRings = ({isActiveSpeaker, children, isMobileView}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isActiveSpeaker
            ? $config.PRIMARY_ACTION_BRAND_COLOR +
              hexadecimalTransparency['15%']
            : 'transparent',
        },
        {
          width: isMobileView ? 100 : 140,
          height: isMobileView ? 100 : 140,
          borderRadius: isMobileView ? 50 : 80,
        },
      ]}>
      {children}
    </View>
  );
};

export default AnimatedRings;

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 140,
    borderRadius: 80,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
