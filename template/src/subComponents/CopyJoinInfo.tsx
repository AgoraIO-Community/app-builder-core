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
import React, {useEffect, useContext} from 'react';
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
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ThemeConfig from '../theme';
import {CopyMeetingInfo} from '../components/Share';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {useIsDesktop} from '../utils/common';

export interface CopyJoinInfoProps {
  showLabel?: boolean;
  showTeritaryButton?: boolean;
  render?: (onPress: () => void) => JSX.Element;
  isOnActionSheet?: boolean;
}
//todo hari update CopyJoinInfo to show text
const CopyJoinInfo = (props: CopyJoinInfoProps) => {
  const {phrase} = useParams<{phrase: string}>();
  const getMeeting = useGetMeetingPhrase();
  const {copyShareLinkToClipboard} = useShareLink();
  const [modalVisible, setModalVisible] = React.useState(false);
  const {
    showLabel = $config.ICON_TEXT || false,
    showTeritaryButton = false,
    isOnActionSheet = false,
  } = props;
  //commented for v1 release
  //const copyMeetingInviteButton = useString('copyMeetingInviteButton')();
  const copyMeetingInviteButton = 'Invite';
  const isDesktop = useIsDesktop()('popup');

  useEffect(() => {
    getMeeting(phrase);
  }, [phrase]);

  const onPress = () => {
    setModalVisible(true);
  };
  let iconButtonProps: IconButtonProps = {
    onPress: onPress,
    iconProps: {
      name: 'share',
      tintColor: $config.SECONDARY_ACTION_COLOR,
    },
    btnTextProps: {
      textColor: $config.FONT_COLOR,
      text: showLabel ? copyMeetingInviteButton : '',
    },
  };

  iconButtonProps.isOnActionSheet = isOnActionSheet;

  return props?.render ? (
    props.render(onPress)
  ) : (
    <>
      <Popup
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        title="Invite others to join this meeting"
        showCloseIcon={true}
        containerStyle={{alignItems: isDesktop ? 'center' : 'stretch'}}
        contentContainerStyle={style.contentContainer}>
        <CopyMeetingInfo showSubLabel={false} />
        <View style={isDesktop ? style.btnContainer : style.btnContainerMobile}>
          {isDesktop ? (
            <View style={{flex: 1}}>
              <TertiaryButton
                text={'CANCEL'}
                textStyle={style.btnText}
                containerStyle={{
                  width: '100%',
                  height: 48,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
                onPress={() => {
                  setModalVisible(false);
                }}
              />
            </View>
          ) : null}
          {isDesktop ? <Spacer size={10} horizontal={true} /> : <></>}
          <View style={{flex: 1}}>
            <PrimaryButton
              textStyle={style.btnText}
              containerStyle={{
                minWidth: 'auto',
                width: '100%',
                borderRadius: 8,
                height: 48,
                paddingVertical: 12,
                paddingHorizontal: 12,
              }}
              onPress={() => {
                copyShareLinkToClipboard(
                  SHARE_LINK_CONTENT_TYPE.MEETING_INVITE,
                );
              }}
              text={'COPY INVITATION'}
            />
          </View>
        </View>
      </Popup>
      {showTeritaryButton ? (
        <TertiaryButton text="Invite" onPress={onPress} />
      ) : (
        <IconButton {...iconButtonProps} />
      )}
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
  },
  btnContainerMobile: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
  },
  contentContainer: {
    padding: 24,
    minWidth: 342,
  },
});

export default CopyJoinInfo;
