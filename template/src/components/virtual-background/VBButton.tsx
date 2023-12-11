import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ToolbarItem} from 'customization-api';
import IconButton from '../../atoms/IconButton';

const VBButton = props => {
  const {isVBOpen, setIsVBOpen, showLabel = false} = props;
  return (
    <IconButton
      hoverEffect={true}
      iconProps={{
        iconBackgroundColor: isVBOpen ? $config.PRIMARY_ACTION_BRAND_COLOR : '',
        tintColor: $config.SECONDARY_ACTION_COLOR,
        name: 'vb',
        iconSize: 26,
      }}
      btnTextProps={{
        text: showLabel ? `Virtual\nBackground` : '',
        numberOfLines: 2,
        textStyle: {
          marginTop: 8,
          fontSize: 12,
          fontWeight: '400',
          fontFamily: 'Source Sans Pro',
          textAlign: 'center',
          color: $config.FONT_COLOR,
        },
      }}
      onPress={() => {
        setIsVBOpen(prev => !prev);
      }}
    />
  );
};

export default VBButton;

const styles = StyleSheet.create({});
