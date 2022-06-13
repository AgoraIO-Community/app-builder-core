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
import React from 'react';
import {Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Clipboard from './Clipboard';
import {gql, useQuery} from '@apollo/client';
import icons from '../assets/icons';
import platform from '../subComponents/Platform';
import {useParams} from '../components/Router';
import Toast from '../../react-native-toast-message';
import {BtnTemplate} from '../../agora-rn-uikit';
import {useString} from '../utils/useString';
import {MeetingInviteInterface} from 'src/language/default-labels/videoCallScreenLabels';
import {
  GetMeetingInviteID,
  GetMeetingInviteURL,
} from '../utils/getMeetingInvite';
import isSDKCheck from '../utils/isSDK'

const SHARE = gql`
  query share($passphrase: String!) {
    share(passphrase: $passphrase) {
      passphrase {
        host
        view
      }
      channel
      title
      pstn {
        number
        dtmf
      }
    }
  }
`;

const CopyJoinInfo = (props: {showText?: boolean}) => {
  const {phrase} = useParams<{phrase: string}>();
  const {data, loading, error} = useQuery(SHARE, {
    variables: {passphrase: phrase},
  });
  const isSDK = isSDKCheck();

  const copiedToClipboardText = useString(
    'copiedToClipboardNotificationLabel',
  )();
  const meetingInviteText =
    useString<MeetingInviteInterface>('meetingInviteText');
  const copyMeetingInviteButton = useString('copyMeetingInviteButton')();
  const copyToClipboard = () => {
    Toast.show({
      type: 'success',
      text1: copiedToClipboardText,
      visibilityTime: 1000,
    });
    if (data && !loading) {
      let baseURL =
        platform === 'web' && !isSDK
          ? $config.FRONTEND_ENDPOINT || window.location.origin
          : undefined;

      let stringToCopy = meetingInviteText({
        meetingName: data.share.title,
        url: baseURL
          ? GetMeetingInviteURL(
              baseURL,
              data.share.passphrase.view,
              data.share.passphrase.host,
            )
          : undefined,
        id: !baseURL
          ? GetMeetingInviteID(
              data.share.passphrase.view,
              data.share.passphrase.host,
            )
          : undefined,
        pstn: data.share.pstn
          ? {
              number: data.share.pstn.number,
              pin: data.share.pstn.dtmf,
            }
          : undefined,
      });
      console.log('Copying string to clipboard:', stringToCopy);
      Clipboard.setString(stringToCopy);
    }
  };

  return (
    <BtnTemplate
      disabled={!data}
      style={style.backButton}
      onPress={() => copyToClipboard()}
      name={'clipboard'}
      btnText={props.showText ? copyMeetingInviteButton : ''}
      color={$config.PRIMARY_FONT_COLOR}
    />
  );
};

const style = StyleSheet.create({
  backButton: {
    // marginLeft: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 28,
    height: 20,
  },
  backIcon: {
    width: 28,
    height: 20,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default CopyJoinInfo;
