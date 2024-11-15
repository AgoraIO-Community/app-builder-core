import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {
  SHARE_LINK_CONTENT_TYPE,
  useShareLink,
} from '../components/useShareLink';
import Spacer from './Spacer';
import ImageIcon from './ImageIcon';
import Tooltip from './Tooltip';
import ThemeConfig from '../theme';
import {shareRoomCopyBtnTooltipText} from '../language/default-labels/shareLinkScreenLabels';
import {useString} from '../utils/useString';

interface Props {
  text: SHARE_LINK_CONTENT_TYPE;
  variant?: 'none' | 'primary' | 'secondary';
  size?: number;
}

const ClipboardIconButton = (props: Props) => {
  const {copyShareLinkToClipboard} = useShareLink();
  const copiedToClipboard = useString(shareRoomCopyBtnTooltipText)();
  const {text, variant = 'primary', size = 26} = props;

  const getTintColor = () => {
    if (variant == 'primary') {
      return $config.PRIMARY_ACTION_BRAND_COLOR;
    }
    return $config.SECONDARY_ACTION_COLOR;
  };
  return (
    <View style={style.iconContainer}>
      <Tooltip
        rootTooltipContainer={style.tooltipContainer}
        isClickable
        onPress={() => {
          copyShareLinkToClipboard(text);
        }}
        toolTipIcon={
          <>
            <ImageIcon
              iconType="plain"
              name="tick-fill"
              tintColor={$config.SEMANTIC_SUCCESS}
            />
            <Spacer size={8} horizontal={true} />
          </>
        }
        toolTipMessage={copiedToClipboard}
        renderContent={(isToolTipVisible, setToolTipVisible) => {
          return (
            <TouchableOpacity
              onPress={() => {
                copyShareLinkToClipboard(text, () => {
                  setToolTipVisible(true);
                });
                //setToolTipVisible(true);
              }}>
              <ImageIcon
                iconSize={size}
                iconType="plain"
                name="clipboard"
                tintColor={getTintColor()}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default ClipboardIconButton;

export const style = StyleSheet.create({
  iconContainer: {
    flexBasis: 60,
    height: 60,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderLeftWidth: 0,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopRightRadius: ThemeConfig.BorderRadius.medium,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: ThemeConfig.BorderRadius.medium,
    borderTopLeftRadius: 0,
  },
  tooltipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
});
