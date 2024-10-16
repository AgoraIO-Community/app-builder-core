import React from 'react';
import {
  ToolbarPreset,
  useSidePanel,
  ToolbarItem,
  ImageIcon,
  ThemeConfig,
  $config,
  useActionSheet,
  IconButton,
  IconButtonProps,
} from 'customization-api';
import {View, Text, StyleSheet} from 'react-native';
import pollIcons from './polling/poll-icons';

const POLL_SIDEBAR_NAME = 'side-panel-poll';

export const PollMoreItem = () => {
  const {isOnActionSheet} = useActionSheet();
  const {setSidePanel} = useSidePanel();

  if (isOnActionSheet) {
    const iconButtonProps: IconButtonProps = {
      onPress: () => {
        setSidePanel(POLL_SIDEBAR_NAME);
      },
      iconProps: {
        icon: pollIcons['bar-chart'],
        tintColor: $config.SECONDARY_ACTION_COLOR,
      },
      btnTextProps: {
        text: 'Polls',
        textColor: $config.FONT_COLOR,
        numberOfLines: 1,
        textStyle: {
          marginTop: 8,
        },
      },
      isOnActionSheet: isOnActionSheet,
    };

    return (
      <ToolbarItem>
        <IconButton {...iconButtonProps} />
      </ToolbarItem>
    );
  }
  return (
    <ToolbarItem style={style.toolbarItem}>
      <View style={style.toolbarImg}>
        <ImageIcon
          iconType="plain"
          iconSize={15}
          icon={pollIcons['bar-chart']}
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
            poll: {
              component: PollMoreItem,
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
    alignItems: 'center',
    gap: 8,
  },
  toolbarImg: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  toolbarText: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '400',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});
