import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function BlockUI() {
  return (
    <View style={styles.blockui__wrapper}>
      <Text>
        Please change to portrait mode to further access our application
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  blockui__wrapper: {
    //don't added overflow: hidden, bottombar minimized version layout popup will be shown in the overflow
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 99999,
    display: 'none',
    /*
      Change colors accordingly
      */
    background: '#000',
    color: '#fff',
  },
});
