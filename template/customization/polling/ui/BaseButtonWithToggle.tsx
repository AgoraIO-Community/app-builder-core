import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {ThemeConfig, $config, ImageIcon} from 'customization-api';
import Toggle from '../../../src/atoms/Toggle';
// import Tooltip from '../../../src/atoms/Tooltip';
import PlatformWrapper from '../../../src/utils/PlatformWrapper';

interface Props {
  text: string;
  value: boolean;
  onPress: (value: boolean) => void;
  tooltip?: boolean;
  tooltTipText?: string;
  hoverEffect?: boolean;
  icon?: string;
}

const BaseButtonWithToggle = ({
  text,
  value,
  onPress,
  hoverEffect = false,
  icon,
}: Props) => {
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
                onPress(value);
              }}>
              <View style={styles.centerRow}>
                <ImageIcon iconType="plain" iconSize={20} icon={icon} />
                <Text style={[styles.text]}>{text}</Text>
              </View>
              <View>
                <Toggle
                  circleColor={'#fff'}
                  isEnabled={value}
                  toggleSwitch={(toggle: boolean) => {
                    onPress(toggle);
                  }}
                />
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
  centerRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
