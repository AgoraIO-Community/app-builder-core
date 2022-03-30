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
import { useString } from '../utils/useString';
import { useShareLink } from 'fpe-api';

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
  const hostControlCheckbox = useShareLink(data => data.hostControlCheckbox);
  const copiedToClipboardText = useString('copiedToClipboardNotificationLabel');
  const meetingInviteText = useString('meetingInviteText');
  const copyToClipboard = () => {
    Toast.show({text1: copiedToClipboardText , visibilityTime: 1000});
    if (data && !loading) {
      let stringToCopy = meetingInviteText({
        frontendEndpoint: $config.FRONTEND_ENDPOINT,
        hostControlCheckbox: hostControlCheckbox,
        meetingName: data.share.title,
        url:{
          host: data.share.passphrase.host,
          attendee: data.share.passphrase.view
        },
        id:{
          host: data.share.passphrase.host,
          attendee: data.share.passphrase.view
        },
        pstn: data.share.pstn ? {
          number: data.share.pstn.number,
          pin: data.share.pstn.dtmf
        } : undefined

      })
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
      btnText={props.showText ? useString('copyMeetingInviteButton') : ''}
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
