import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useRender} from 'customization-api';
import protoRoot from './proto/ptoto';

const Caption = () => {
  const {caption, renderList} = useRender();
  //console.log('stream:caption component ++++>', caption);

  const uint8array = caption.msgs;
  let textstream = protoRoot.lookupType('Text').decode(uint8array);

  console.log('stream: decoded', textstream);
  return (
    <View>
      <Text>Caption</Text>
    </View>
  );
};

export default Caption;

const styles = StyleSheet.create({});
