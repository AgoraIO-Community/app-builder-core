import React, {useContext} from 'react';
import {useSonioxCaption} from './useSonioxCaption';
import {useString} from '../../../utils/useString';
import ToolbarMenuItem from '../../../atoms/ToolbarMenuItem';
import IconButton from '../../../../src/atoms/IconButton';
import {useActionSheet} from '../../../utils/useActionSheet';
import useSonioxSTTAPI from './useSonioxSTTAPI';
import {toolbarItemCaption2Text} from '../../../language/default-labels/videoCallScreenLabels';
import {PropsContext} from '../../../../agora-rn-uikit';

export interface SonioxCaptionIconProps {
  plainIconHoverEffect?: boolean;
  showLabel?: boolean;
  showWarningIcon?: boolean;
  render?: (onPress: () => void, isPendingRequestInProgress: boolean, isRequestSuccess: boolean, isRequestFailed: boolean) => JSX.Element;
}

const SonioxCaptionIcon = (props: SonioxCaptionIconProps) => {
  const {plainIconHoverEffect = true, showLabel = $config.ICON_TEXT, showWarningIcon = true} = props;
  const {isCaptionON, setIsCaptionON, isSTTError} = useSonioxCaption();
  const {isActionSheetVisible} = useActionSheet();
  const captionLabel = useString<boolean>(toolbarItemCaption2Text);
  const {isAuthorizedSTTUser} = useSonioxSTTAPI();
  const {rtcProps} = useContext(PropsContext);

  const toggleCaption = () => {
    setIsCaptionON(prev => !prev);
  };

  const onPress = () => {
    toggleCaption();
  };

  const iconButtonProps = {
    onPress,
    iconProps: {
      name: isCaptionON ? 'captions-on' : 'captions-off',
      tintColor: isCaptionON
        ? $config.PRIMARY_ACTION_BRAND_COLOR
        : $config.SECONDARY_ACTION_COLOR,
      showWarningIcon: showWarningIcon && isSTTError,
      warningIconName: 'alert',
      warningIconTintColor: $config.SEMANTIC_WARNING,
    },
    btnTextProps: {
      text: showLabel ? captionLabel(isCaptionON) : '',
      textColor: $config.FONT_COLOR,
    },
    plainIconHoverEffect,
  };

  let component;
  if (props.render) {
    component = props.render(onPress, false, false, false);
  } else {
    component = (
      <ToolbarMenuItem
        {...iconButtonProps}
        disabled={isActionSheetVisible}
      />
    );
  }

  return isAuthorizedSTTUser() ? <>{component}</> : <></>;
};

/**
 * A toolbar button which allows user to enable/disable Soniox captions during the call.
 */
export default SonioxCaptionIcon;