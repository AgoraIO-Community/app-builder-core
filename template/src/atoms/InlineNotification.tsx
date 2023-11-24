import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import ThemeConfig from '../theme';
import ImageIcon from './ImageIcon';

const InlineNotification = (props: {text: string}) => {
  const {text} = props;
  return (
    <View style={styles.textContainer}>
      <View style={styles.iconStyleView}>
        <ImageIcon
          base64={true}
          iconSize={20}
          iconType="plain"
          name={'warning'}
        />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default InlineNotification;

const styles = StyleSheet.create({
  text: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
  },
  textContainer: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 171, 0, 0.15)',
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  iconStyleView: {
    marginRight: 4,
    width: 20,
    height: 20,
  },
});
