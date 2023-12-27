import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import React from 'react';
import ThemeConfig from '../theme';
import ImageIcon from './ImageIcon';
import {isMobileUA} from '../../src/utils/common';

const InlineNotification = (props: {text: string; customStyle?: ViewStyle}) => {
  const {text, customStyle} = props;
  const isMobile = isMobileUA();
  return (
    <View
      style={[
        styles.container,
        isMobile && styles.mobileContainer,
        customStyle ? customStyle : {},
      ]}>
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
    flex: 1,
  },
  mobileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    marginHorizontal: 20,
  },
  container: {
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
