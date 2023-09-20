import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ToolbarItem} from 'customization-api';
import IconButton from '../../atoms/IconButton';
import {useCaption} from '../../../src/subComponents/caption/useCaption';
import {useVB} from './useVB';

const VBButton = () => {
  const {isVBActive, setIsVBActive} = useVB();
  const {isCaptionON} = useCaption();
  console.log('caption', isCaptionON);
  return (
    <ToolbarItem>
      <IconButton
        hoverEffect={true}
        iconProps={{
          iconBackgroundColor: isVBActive
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : '',
          tintColor: $config.SECONDARY_ACTION_COLOR,
          name: 'vb',
          iconSize: 26,
        }}
        btnTextProps={{
          textColor: $config.FONT_COLOR,
          text: isVBActive ? 'VB On' : 'VB Off',
        }}
        onPress={() => {
          setIsVBActive(prev => !prev);
        }}
      />
    </ToolbarItem>
  );
};

export default VBButton;

const styles = StyleSheet.create({});
