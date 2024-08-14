import React from 'react';
import {
  ToolbarPreset,
  useSidePanel,
  ToolbarItem,
  ImageIcon,
  ThemeConfig,
  $config,
} from 'customization-api';
import {View, Text, StyleSheet} from 'react-native';

const POLL_SIDEBAR_NAME = 'side-panel-poll';

export const CustomMoreItem = () => {
  return (
    <ToolbarItem style={style.toolbarItem}>
      <View style={style.toolbarImg}>
        <ImageIcon
          iconType="plain"
          iconSize={20}
          name="pen"
          tintColor={$config.SECONDARY_ACTION_COLOR}
        />
      </View>
      <Text style={style.toolbarText}>Polls</Text>
    </ToolbarItem>
  );
};

const CustomBottomToolbar = () => {
  const {setSidePanel} = useSidePanel();

  return (
    <ToolbarPreset
      align="bottom"
      items={{
        more: {
          fields: {
            test: {
              component: CustomMoreItem,
              onPress: () => {
                setSidePanel(POLL_SIDEBAR_NAME);
              },
            },
          },
        },
      }}
    />
  );
};

export {CustomBottomToolbar, POLL_SIDEBAR_NAME};

const style = StyleSheet.create({
  toolbarItem: {
    display: 'flex',
    flexDirection: 'row',
  },
  toolbarImg: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  toolbarText: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '400',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});
