import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ThemeConfig, $config} from 'customization-api';
import Toggle from '../../../src/atoms/Toggle';
import Tooltip from '../../../src/atoms/Tooltip';
import PlatformWrapper from '../../../src/utils/PlatformWrapper';

interface Props {
  text: string;
  tooltip?: boolean;
  tooltTipText?: string;
  onPress: (value: boolean) => void;
  hoverEffect?: boolean;
}

const BaseButtonWithToggle = ({
  text,
  tooltTipText,
  onPress,
  hoverEffect = false,
}: Props) => {
  const [toggle, toggleSwitch] = useState<boolean>(false);

  return (
    <View style={styles.toggleButton}>
      {/* <Tooltip
        placement="top"
        toolTipMessage={tooltTipText}
        fontSize={ThemeConfig.FontSize.normal}
        renderContent={() => {
      return ( */}
      <PlatformWrapper>
        {(isHovered: boolean) => {
          return (
            <TouchableOpacity
              style={[
                styles.container,
                hoverEffect && isHovered ? styles.hover : {},
              ]}
              onPress={() => {
                toggleSwitch(prev => !prev);
              }}>
              {/* Container to hold text and switch side by side */}
              <Text style={[styles.text]}>{text}</Text>
              <View>
                <Toggle isEnabled={toggle} toggleSwitch={toggleSwitch} />
              </View>
            </TouchableOpacity>
          );
        }}
      </PlatformWrapper>
      {/* );
      }}
      /> */}
    </View>
  );
};

export default BaseButtonWithToggle;

const styles = StyleSheet.create({
  toggleButton: {
    width: '100%',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 4,
  },
  hover: {
    backgroundColor: 'rgba(128, 128, 128, 0.25)',
  },
  text: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 12,
    fontWeight: '400',
    marginRight: 12,
  },
});
