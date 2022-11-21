/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {useParams} from '../components/Router';
import {useString} from '../utils/useString';
import useGetMeetingPhrase from '../utils/useGetMeetingPhrase';
import {
  SHARE_LINK_CONTENT_TYPE,
  useShareLink,
} from '../components/useShareLink';
import Styles from '../components/styles';
import Popup from '../atoms/Popup';
import InviteInfo from '../atoms/InviteInfo';
import Spacer from '../atoms/Spacer';
import PrimaryButton from '../atoms/PrimaryButton';
import TertiaryButton from '../atoms/TertiaryButton';
import IconButton, {IconButtonProps} from 'src/atoms/IconButton';

export interface CopyJoinInfoProps {
  showText?: boolean;
  render?: (onPress: () => void) => JSX.Element;
}
//todo hari update CopyJoinInfo to show text
const CopyJoinInfo = (props: CopyJoinInfoProps) => {
  const {phrase} = useParams<{phrase: string}>();
  const getMeeting = useGetMeetingPhrase();
  const {copyShareLinkToClipboard} = useShareLink();
  const [modalVisible, setModalVisible] = React.useState(false);
  //commented for v1 release
  //const copyMeetingInviteButton = useString('copyMeetingInviteButton')();
  const copyMeetingInviteButton = 'Invite';

  useEffect(() => {
    getMeeting(phrase);
  }, [phrase]);

  const onPress = () => {
    setModalVisible(true);
    //copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.MEETING_INVITE);
  };
  let iconButtonProps: IconButtonProps = {
    onPress: onPress,
    iconProps: {
      name: 'share',
      tintColor: '#099DFD',
    },
  };
  iconButtonProps.styleText = {
    fontFamily: 'Source Sans Pro',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
    color: $config.PRIMARY_COLOR,
  };

  // iconButtonProps.style = style.shareIcon;
  // iconButtonProps.btnText = props.showText ? copyMeetingInviteButton : '';
  // iconButtonProps.styleIcon = {
  //   width: 20,
  //   height: 20,
  // };

  iconButtonProps.btnText = copyMeetingInviteButton;
  iconButtonProps.style = Styles.localButton as Object;

  //}

  return props?.render ? (
    props.render(onPress)
  ) : (
    <>
      <Popup
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        title="Invite others to join this meeting"
        showCloseIcon={true}>
        <InviteInfo />
        <Spacer size={40} />
        <View style={style.btnContainer}>
          <PrimaryButton
            iconName="clipboard"
            onPress={() =>
              copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.MEETING_INVITE)
            }
            text={'Copy Invitation'}
          />
        </View>
      </Popup>
      {/** todo hari
        <TertiaryButton text="Invite" onPress={onPress} />
          */}
      <IconButton {...iconButtonProps} />
    </>
  );
};

const style = StyleSheet.create({
  shareIcon: {
    // marginLeft: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 28,
    height: 20,
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
});

export default CopyJoinInfo;
