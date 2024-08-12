import {StyleSheet, Text, View} from 'react-native';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import React from 'react';
import {isMobileUA} from '../utils/common';
import IconButton from '../atoms/IconButton';

const RecordingInfo = ({recordingLabel = ''}) => {
  return (
    <View style={[styles.recordingView]}>
      <IconButton
        placement="right"
        isClickable={false}
        containerStyle={styles.recordingView}
        disabled={true}
        iconProps={{
          name: 'recording-status',
          iconType: 'plain',
          iconSize: 20,
          tintColor: $config.SEMANTIC_ERROR,
        }}
        btnTextProps={{
          text: recordingLabel,
          textColor: $config.SEMANTIC_ERROR,
          textStyle: {
            fontFamily: 'Source Sans Pro',
            fontWeight: '600',
            fontSize: 12,
            lineHeight: 12,
            marginTop: 0,
            marginLeft: 4,
          },
        }}
      />
    </View>
  );
};

export default RecordingInfo;

const styles = StyleSheet.create({
  recordingView: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
});
