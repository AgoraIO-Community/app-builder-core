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
import { useString } from '../utils/getString';

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

const ParticipantView = (props: {showText?: boolean}) => {
  const {phrase} = useParams<{phrase: string}>();
  const {data, loading, error} = useQuery(SHARE, {
    variables: {passphrase: phrase},
  });
  const copiedToClipboardText = useString('copiedToClipboard');
  const meetingText = useString('meeting');
  const URLForAttendeeText = useString('URLForAttendee');
  const URLForHostText = useString('URLForHost');
  const attendeeMeetingIDText = useString('attendeeMeetingID');
  const hostMeetingIDText = useString('hostMeetingID');
  const PSTNNumberText = useString('PSTNNumber');
  const PSTNPinText = useString('PSTNPin');

  const copyToClipboard = () => {
    Toast.show({text1: copiedToClipboardText , visibilityTime: 1000});
    if (data && !loading) {
      let stringToCopy = '';
      if ($config.FRONTEND_ENDPOINT) {
        stringToCopy += `${meetingText} - ${data.share.title}\n${URLForAttendeeText}: ${$config.FRONTEND_ENDPOINT}/${data.share.passphrase.view}`;
        if (data.share.passphrase.host) {
          stringToCopy += `\n${URLForHostText}: ${$config.FRONTEND_ENDPOINT}/${data.share.passphrase.host}`;
        }
      } else {
        if (platform === 'web') {
          stringToCopy += `${meetingText} - ${data.share.title}\n${URLForAttendeeText}: ${window.location.origin}/${data.share.passphrase.view}`;
          if (data.share.passphrase.host) {
            stringToCopy += `\n${URLForHostText}: ${window.location.origin}/${data.share.passphrase.host}`;
          }
        } else {
          stringToCopy += `${meetingText} - ${data.share.title}\n${attendeeMeetingIDText}: ${data.share.passphrase.view}`;
          if (data.share.passphrase.host) {
            stringToCopy += `\n${hostMeetingIDText}: ${data.share.passphrase.host}`;
          }
        }
      }
      if (data.share.pstn) {
        stringToCopy += `\n${PSTNNumberText}: ${data.share.pstn.number}\n${PSTNPinText}: ${data.share.pstn.dtmf}`;
      }
      console.log('Copying string to clipboard:', stringToCopy);
      Clipboard.setString(stringToCopy);
      // Clipboard.setString(JSON.stringify(data));
    }
  };

  return (
    <BtnTemplate
      disabled={!data}
      style={style.backButton}
      onPress={() => copyToClipboard()}
      name={'clipboard'}
      btnText={props.showText ? useString('copyMeetingInvite') : ''}
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

export default ParticipantView;
