import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import React, {SetStateAction} from 'react';
import ThemeConfig from '../theme';
import Spacer from '../atoms/Spacer';
import PlatformWrapper from '../utils/PlatformWrapper';
import {isMobileOrTablet} from 'customization-api';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {useString} from '../utils/useString';
import {
  I18nMuteConfirmation,
  I18nMuteType,
  I18nRequestConfirmation,
  muteAllConfirmationPopoverContent,
  muteAllConfirmationPopoverPrimaryBtnText,
  muteConfirmationPopoverContent,
  muteConfirmationPopoverPrimaryBtnText,
  requestConfirmationPopoverContent,
  requestConfirmationPopoverPrimaryBtnText,
} from '../language/default-labels/videoCallScreenLabels';
import {cancelText} from '../language/default-labels/commonLabels';
import InlinePopup from '../../src/atoms/InlinePopup';

export interface RemoteMutePopupProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: React.Dispatch<SetStateAction<boolean>>;
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  name: string;
  onMutePress: () => void;
  type: I18nMuteType;
  action?: 'mute' | 'request';
}

const RemoteMutePopup = (props: RemoteMutePopupProps) => {
  const cancelLabel = useString(cancelText)();
  const muteLabel = useString(muteConfirmationPopoverPrimaryBtnText)();
  const muteAllLabel = useString(muteAllConfirmationPopoverPrimaryBtnText)();
  const requestLabel = useString(requestConfirmationPopoverPrimaryBtnText)();

  const muteAllConfirmation = useString<I18nMuteType>(
    muteAllConfirmationPopoverContent,
  );
  const requestConfirmation = useString<I18nRequestConfirmation>(
    requestConfirmationPopoverContent,
  );
  const muteConfirmation = useString<I18nMuteConfirmation>(
    muteConfirmationPopoverContent,
  );

  const {
    actionMenuVisible,
    setActionMenuVisible,
    modalPosition,
    action = 'mute',
  } = props;
  let message = '';
  let btnLabel = '';

  if (props.name) {
    //mute action
    if (action === 'mute') {
      message = muteConfirmation({
        name: props?.name,
        type: props.type,
      });
      btnLabel = muteLabel;
      //message = `Mute ${props.name}'s ${props.type} for everyone on the call? Only ${props.name} can unmute themselves.`;
    }
    //request action
    else {
      message = requestConfirmation({
        name: props?.name,
        type: props?.type,
      });
      btnLabel = requestLabel;
      // if (props?.type === 'audio') {
      //   //message = `Request ${props.name} to turn on their microphone?`;
      // } else {
      //   //message = `Request ${props.name} to turn on their camera?`;
      // }
    }
  } else {
    message = muteAllConfirmation(props?.type);
    btnLabel = muteAllLabel;
    //message = `Mute everyone's ${props.type} on the call?`;
  }
  const cancelTxt =
    cancelLabel.charAt(0).toUpperCase() + cancelLabel.slice(1).toLowerCase();

  return (
    <InlinePopup
      actionMenuVisible={actionMenuVisible}
      setActionMenuVisible={setActionMenuVisible}
      modalPosition={modalPosition}
      message={message}
      cancelLabel={cancelTxt}
      confirmLabel={btnLabel}
      onConfirmClick={props.onMutePress}
    />
  );
};

export default RemoteMutePopup;
