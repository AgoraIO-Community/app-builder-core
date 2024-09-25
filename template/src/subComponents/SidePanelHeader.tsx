import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import IconButton from '../atoms/IconButton';
import ThemeConfig from '../theme';
import {IconsInterface} from '../atoms/CustomIcon';
import {isWebInternal} from '../utils/common';
import styles from 'react-native-toast-message/src/styles';
import CommonStyles from '../components/CommonStyles';

export interface SidePanelHeaderProps {
  centerComponent?: React.ReactNode;
  leadingIconName?: keyof IconsInterface;
  leadingIconOnPress?: () => void;
  trailingIconName?: keyof IconsInterface;
  trailingIconOnPress?: () => void;
  trailingIconName2?: keyof IconsInterface;
  trailingIconOnPress2?: () => void;
  isChat?: boolean;
  children?: React.ReactNode;
  showTintedOverlay?: boolean;
}
const SidePanelHeader = React.forwardRef<View, SidePanelHeaderProps>(
  (props: SidePanelHeaderProps, ref) => {
    const {isChat = false, showTintedOverlay = false, children = <></>} = props;
    return (
      <>
        <View
          style={[
            SidePanelStyles.sidePanelHeader,
            isChat ? SidePanelStyles.chatPadding : {},
          ]}>
          {showTintedOverlay && <View style={CommonStyles.tintedOverlay} />}
          {props?.leadingIconName ? (
            <View>
              <IconButton
                hoverEffect={true}
                hoverEffectStyle={{
                  backgroundColor: $config.ICON_BG_COLOR,
                  borderRadius: 20,
                }}
                iconProps={{
                  iconType: 'plain',
                  iconContainerStyle: {
                    padding: 5,
                  },
                  iconSize: 20,
                  name: props.leadingIconName,
                  tintColor: $config.SECONDARY_ACTION_COLOR,
                }}
                onPress={() => {
                  props?.leadingIconOnPress && props.leadingIconOnPress();
                }}
              />
            </View>
          ) : isChat ? (
            <View style={{width: 30, height: 'auto'}}></View>
          ) : null}
          {props?.centerComponent ? props.centerComponent : null}
          <View style={props?.trailingIconName2 && SidePanelStyles.row}>
            {props?.trailingIconName ? (
              <View ref={ref} collapsable={false} style={{flex: 1}}>
                <IconButton
                  hoverEffect={true}
                  hoverEffectStyle={{
                    backgroundColor: $config.ICON_BG_COLOR,
                    borderRadius: 20,
                  }}
                  iconProps={{
                    iconType: 'plain',
                    iconContainerStyle: SidePanelStyles.iconContainerStyle,
                    iconSize: 20,
                    name: props?.trailingIconName,
                    tintColor: $config.SECONDARY_ACTION_COLOR,
                  }}
                  onPress={() => {
                    props?.trailingIconOnPress && props.trailingIconOnPress();
                  }}
                />
              </View>
            ) : null}
            {props?.trailingIconName2 ? (
              <IconButton
                hoverEffect={true}
                hoverEffectStyle={{
                  backgroundColor: $config.ICON_BG_COLOR,
                  borderRadius: 20,
                }}
                iconProps={{
                  iconType: 'plain',
                  iconContainerStyle: SidePanelStyles.iconContainerStyle,
                  iconSize: 20,
                  name: props?.trailingIconName2,
                  tintColor: $config.SECONDARY_ACTION_COLOR,
                }}
                onPress={() => {
                  props?.trailingIconOnPress2 && props.trailingIconOnPress2();
                }}
              />
            ) : null}
          </View>
        </View>
        {children}
      </>
    );
  },
);

export const SidePanelStyles = StyleSheet.create({
  sidePanelHeader: {
    height: isWebInternal() ? 60 : 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: $config.CARD_LAYER_3_COLOR,
    position: 'relative',
  },
  chatPadding: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heading: {
    paddingLeft: 4,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: 1.6 * ThemeConfig.FontSize.normal,
    fontWeight: '600',
    color: $config.FONT_COLOR,
    alignSelf: 'center',
  },
  alignCenterNoPadding: {
    padding: 0,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.3,
  },
  iconContainerStyle: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default SidePanelHeader;
