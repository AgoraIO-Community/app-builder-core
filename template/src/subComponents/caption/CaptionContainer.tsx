import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import Caption from './Caption';

const CaptionContainer = () => {
  const [captions, setCaptions] = React.useState([]); // to hold records of captions for transcript purposes.

  return (
    <View style={styles.container}>
      <Text style={{color: '#fff'}}>captions will come here ...</Text>
      <Caption />
    </View>
  );
};

export default CaptionContainer;

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
