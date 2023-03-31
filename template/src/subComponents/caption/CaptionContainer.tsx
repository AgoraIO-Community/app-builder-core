import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useRender} from 'customization-api';

const CaptionContainer = () => {
  const {caption, renderList} = useRender();
  console.log('captionuse', caption);
  console.log('caption Container');

  return (
    <View style={styles.container}>
      <Text style={{color: '#fff'}}>captions will come here ...</Text>
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
