import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import React, {useContext} from 'react';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import useWaitingRoomAPI from './useWaitingRoomAPI';
import {DispatchContext, useLocalUid} from '../../../agora-rn-uikit';

const WaitingRoomButton = props => {
  const {uid, screenUid, isAccept} = props;
  const {approval} = useWaitingRoomAPI();
  const localUid = useLocalUid();
  const {dispatch} = useContext(DispatchContext);

  const buttonText = isAccept ? 'Admit' : 'Deny';

  const handleButtonClick = () => {
    const approved = isAccept ? true : false;

    const res = approval({
      host_uid: localUid,
      attendee_uid: uid,
      attendee_screenshare_uid: screenUid,
      approved: approved,
    });

    dispatch({
      type: 'UpdateRenderList',
      value: [uid, {isInWaitingRoom: false}],
    });
  };

  const ButtonComponent = isAccept ? PrimaryButton : TertiaryButton;
  const buttonStyles = {
    minWidth: 'auto',
    borderRadius: ThemeConfig.BorderRadius.small,
    paddingHorizontal: 8,
    paddingVertical: 12,
  };

  return (
    <View style={{flex: 1}}>
      <ButtonComponent
        containerStyle={buttonStyles as ViewStyle}
        textStyle={{
          fontWeight: '600',
          fontSize: 12,
          lineHeight: 12,
          fontFamily: ThemeConfig.FontFamily.sansPro,
          textTransform: 'capitalize',
        }}
        text={buttonText}
        onPress={handleButtonClick}
      />
    </View>
  );
};

export default WaitingRoomButton;
