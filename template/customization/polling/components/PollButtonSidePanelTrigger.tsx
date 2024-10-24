import React from 'react';
import {
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
import pollIcons from '../poll-icons';

const POLL_SIDEBAR_NAME = 'side-panel-poll';

const PollButtonSidePanelTrigger = () => {
  const {isOnActionSheet} = useActionSheet();
  const {setSidePanel} = useSidePanel();

  // On smaller screens
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
  // On bigger screens
  return (
    <ToolbarItem style={{...style.toolbarItem, ...style.spacing}}>
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

export {PollButtonSidePanelTrigger, POLL_SIDEBAR_NAME};

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
  spacing: {
    margin: 12,
    marginLeft: 16,
  },
});
