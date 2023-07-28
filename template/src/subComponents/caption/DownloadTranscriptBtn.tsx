import {StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native';
import React from 'react';
import {useCaption} from './useCaption';
import PrimaryButton from '../../atoms/PrimaryButton';
import useTranscriptDownload from './useTranscriptDownload';
import ThemeConfig from '../../../src/theme';

interface DownloadTranscriptBtn {
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const DownloadTranscriptBtn = (props: DownloadTranscriptBtn) => {
  const {textStyle = {}, containerStyle = {}} = props;
  const {meetingTranscript} = useCaption();
  const {downloadTranscript} = useTranscriptDownload();
  return meetingTranscript?.length > 0 ? (
    <View style={styles.btnContainer}>
      <PrimaryButton
        iconSize={20}
        iconName={'download'}
        containerStyle={[styles.btnContainerStyle, containerStyle] as Object}
        textStyle={[styles.btnTxtStyle, textStyle] as Object}
        onPress={() => {
          downloadTranscript();
        }}
        text={'Download Transcript'}
      />
    </View>
  ) : null;
};

export default DownloadTranscriptBtn;

const styles = StyleSheet.create({
  btnContainerStyle: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderRadius: 4,
  },
  btnContainer: {
    // margin: 20,
  },

  btnTxtStyle: {
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: ThemeConfig.FontSize.small,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
