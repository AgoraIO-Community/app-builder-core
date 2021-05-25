import React, {useContext} from 'react';
import {Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Clipboard from './Clipboard';
import ColorContext from '../components/ColorContext';
import {gql, useQuery} from '@apollo/client';
import icons from '../assets/icons';
import platform from '../subComponents/Platform';

import {useParams} from '../components/Router';

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

const ParticipantView = (props: any) => {
  const {phrase} = useParams<{phrase: string}>();
  const {data, loading, error} = useQuery(SHARE, {
    variables: {passphrase: phrase},
  });
  const copyToClipboard = () => {
    if (data && !loading) {
      let stringToCopy = '';
      if ($config.frontEndURL) {
        stringToCopy += `Meeting - ${data.share.title}\nURL for Attendee: ${$config.frontEndURL}/${data.share.passphrase.view}`;
        if (data.share.passphrase.host) {
          stringToCopy += `\nURL for Host: ${$config.frontEndURL}/${data.share.passphrase.host}`;
        }
      } else {
        if (platform === 'web') {
          stringToCopy += `Meeting - ${data.share.title}\nURL for Attendee: ${window.location.origin}/${data.share.passphrase.view}`;
          if (data.share.passphrase.host) {
            stringToCopy += `\nURL for Host: ${window.location.origin}/${data.share.passphrase.host}`;
          }
        } else {
          stringToCopy += `Meeting - ${data.share.title}\nAttendee Meeting ID: ${data.share.passphrase.view}`;
          if (data.share.passphrase.host) {
            stringToCopy += `\nHost Meeting ID: ${data.share.passphrase.host}`;
          }
        }
      }
      if (data.share.pstn) {
        stringToCopy += `\nPSTN Number: ${data.share.pstn.number}\nPSTN Pin: ${data.share.pstn.dtmf}`;
      }
      console.log('Copying string to clipboard:', stringToCopy);
      Clipboard.setString(stringToCopy);
    }
  };

  return (
    <TouchableOpacity
      disabled={!data}
      style={style.backButton}
      onPress={() => copyToClipboard()}>
      <Image
        resizeMode={'contain'}
        style={!data ? [style.backIcon] : style.backIcon}
        source={{uri: icons.clipboard}}
      />
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  backButton: {
    // marginLeft: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  backIcon: {
    width: 28,
    height: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    tintColor: $config.primaryFontColor,
  },
});

export default ParticipantView;
