import {
  ToolbarPreset,
  ToolbarComponents,
  useSidePanel,
  IconButton,
  SidePanelType,
  useActionSheet,
  IconButtonProps,
  ToolbarItem,
} from 'customization-api';
import {isMobileUA} from '../../utils/common';
import React, {useEffect} from 'react';
import {AgentControl} from './AgentControls';

export const CustomSettingButton = () => {
  const {sidePanel, setSidePanel} = useSidePanel();

  const isPanelActive = sidePanel === 'custom-settings-panel';
  const onPress = () => {
    isPanelActive
      ? setSidePanel(SidePanelType.None)
      : setSidePanel('custom-settings-panel');
  };
  const {isOnActionSheet} = useActionSheet();
  let iconButtonProps: IconButtonProps = {
    onPress: onPress,

    iconProps: {
      name: 'settings',
      tintColor: isPanelActive
        ? $config.PRIMARY_ACTION_TEXT_COLOR
        : $config.SECONDARY_ACTION_COLOR,
      iconBackgroundColor: isPanelActive
        ? $config.PRIMARY_ACTION_BRAND_COLOR
        : '',
    },
    btnTextProps: {
      text: '',
      textColor: $config.FONT_COLOR,
    },
  };
  iconButtonProps.isOnActionSheet = isOnActionSheet;
  if (isOnActionSheet) {
    iconButtonProps.btnTextProps.textStyle = {
      color: $config.FONT_COLOR,
      marginTop: 8,
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'Source Sans Pro',
      textAlign: 'center',
    };
  }
  return (
    <ToolbarItem>
      <IconButton {...iconButtonProps} />
    </ToolbarItem>
  );
};

export const CustomTranscriptButton = () => {
  const {sidePanel, setSidePanel} = useSidePanel();

  const isPanelActive = sidePanel === 'agent-transcript-panel';
  const onPress = () => {
    isPanelActive
      ? setSidePanel(SidePanelType.None)
      : setSidePanel('agent-transcript-panel');
  };
  const {isOnActionSheet} = useActionSheet();
  let iconButtonProps: IconButtonProps = {
    onPress: onPress,

    iconProps: {
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIpSURBVHgB7dv/TcJAFAfwL8b/ZYRzA5lA3AAmECcAJkAnQCaQDYQJqBPIBnQD2KC+S4+kIem9El+l1O8nuZTQpxzf/r4WgIiIiIiIiKhhOlULsyzryqQv7QHXbdvpdFawJOEMpO2z9thJG1T57uoaFP7RJ9ppqK1NVQLaycShnQ7S7iWkQ1nBTeyvw9rj0F5+v/oYK4gGhOvfIVfRi83UAvr3GJCCASkYkIIBKRiQggEpGJCCASkYkIIBKRiQ4ha2UmlvYTqWFhuUWkhLkA85WHHSZjAcgbAO6EnGVtLwOpHhkj3yIYVTS6mboAbymYlMdjBiuYmlhXCO1iW1X6hJ6EMKI5YBOVl67uS9ssGo6CDVb4Q+OBix3sQ20sFpeP2M8o6OpM7ve9aw5TfnOQxZB+RQfYB/Elqj8TCvYEAKBqRgQAoGpLA+inkJDE/UkB+6/f05F6nxpwyrUNOHIeuApnIm+w5jWf5kyQblNzJ7x7N4qR3J5ANGLDexQx3heOHe+aJk9rp4iSOvl2jopUbduiXv351RezbLgLqyes9Qg3B9NS6Z3Zf5k0Kt74NZQNb7oNfQWcsxHs8p8+eFhWMWjlfHUawL406e8bnmeB6kYEAKBqRgQAoGpNAC2qL9vmMzo48Bh2sgfwvlEoftv+DvxNzHCqJrULgGekF7TbUCdR8UnkQfwnYI49L8glefsvcq/5jFCw+WX/2PWaQlsafriYiIiIiIiBrtB7K/UdV6QM6CAAAAAElFTkSuQmCC',
      tintColor: isPanelActive
        ? $config.PRIMARY_ACTION_TEXT_COLOR
        : $config.SECONDARY_ACTION_COLOR,
      iconBackgroundColor: isPanelActive
        ? $config.PRIMARY_ACTION_BRAND_COLOR
        : '',
    },
    btnTextProps: {
      text: '',
      textColor: $config.FONT_COLOR,
    },
  };
  iconButtonProps.isOnActionSheet = isOnActionSheet;
  if (isOnActionSheet) {
    iconButtonProps.btnTextProps.textStyle = {
      color: $config.FONT_COLOR,
      marginTop: 8,
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'Source Sans Pro',
      textAlign: 'center',
    };
  }
  return (
    <ToolbarItem>
      <IconButton {...iconButtonProps} />
    </ToolbarItem>
  );
};

const Bottombar = () => {
  const {MeetingTitleToolbarItem} = ToolbarComponents;
  const {setSidePanel} = useSidePanel();

  useEffect(() => {
    setTimeout(() => {
      !isMobileUA() && setSidePanel('custom-settings-panel');
    });
  }, []);

  return (
    <ToolbarPreset
      align="bottom"
      items={{
        layout: {hide: true},
        invite: {hide: true},
        more: {hide: true},
        'meeting-title': {
          align: 'start',
          component: MeetingTitleToolbarItem,
          order: 1,
          hide: false,
        },
        'participant-count': {
          hide: true,
        },
        'local-video': {hide: true},
        'local-audio': {align: 'center', order: 1},
        screenshare: {hide: true},
        recording: {hide: true},
        'connect-agent': {
          align: 'center',
          label: 'Agent',
          component: AgentControl,
          order: 2,
        },
        'end-call': {align: 'center', order: 3, hide: true},
        'custom-transcript': {
          align: 'end',
          order: 0,
          component: CustomTranscriptButton,
        },
        'custom-settings': {
          align: 'end',
          order: 2,
          component: CustomSettingButton,
        },
      }}
    />
  );
};

export default Bottombar;
