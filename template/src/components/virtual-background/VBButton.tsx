import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ToolbarItem} from 'customization-api';
import IconButton from '../../atoms/IconButton';

const VBButton = props => {
  const {isVBOpen, setIsVBOpen} = props;
  return (
    <ToolbarItem>
      <IconButton
        hoverEffect={true}
        iconProps={{
          iconBackgroundColor: isVBOpen
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : '',
          tintColor: $config.SECONDARY_ACTION_COLOR,
          name: 'vb',
          iconSize: 26,
        }}
        btnTextProps={{
          textColor: $config.FONT_COLOR,
          text: isVBOpen ? 'VB On' : 'VB Off',
        }}
        onPress={() => {
          setIsVBOpen(prev => !prev);
        }}
      />
    </ToolbarItem>
  );
};

export default VBButton;

const styles = StyleSheet.create({});
