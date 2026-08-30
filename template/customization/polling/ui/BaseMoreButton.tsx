import {StyleSheet, View} from 'react-native';
import React, {forwardRef} from 'react';
import {hexadecimalTransparency, IconButton} from 'customization-api';

interface MoreMenuProps {
  setActionMenuVisible: (f: boolean) => void;
}

const BaseMoreButton = forwardRef<View, MoreMenuProps>(
  ({setActionMenuVisible}, ref) => {
    return (
      <View ref={ref} collapsable={false}>
        <IconButton
          hoverEffect={true}
          hoverEffectStyle={style.hoverEffect}
          iconProps={{
            iconType: 'plain',
            name: 'more-menu',
            iconSize: 18,
            tintColor: $config.SECONDARY_ACTION_COLOR,
            iconContainerStyle: style.iconContainerStyle,
          }}
          onPress={() => {
            setActionMenuVisible(true);
          }}
        />
      </View>
    );
  },
);

export {BaseMoreButton};

const style = StyleSheet.create({
  hoverEffect: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%'],
    borderRadius: 18,
  },
  iconContainerStyle: {
    padding: 4,
    borderRadius: 18,
  },
});
