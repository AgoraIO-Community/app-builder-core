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
  const {phrase} = useParams();
  const {data, loading, error} = useQuery(SHARE, {
    variables: {passphrase: phrase},
  });
  const copyToClipboard = () => {
    if (data && !loading) {
      let stringToCopy = '';
      $config.frontEndURL
        ? (stringToCopy += `Meeting - ${data.share.title}
URL for Attendee: ${$config.frontEndURL}/${data.share.passphrase.view}
URL for Host: ${$config.frontEndURL}/${data.share.passphrase.host}`)
        : platform === 'web'
        ? (stringToCopy += `Meeting - ${data.share.title}
URL for Attendee: ${window.location.origin}/${data.share.passphrase.view}
URL for Host: ${window.location.origin}/${data.share.passphrase.host}`)
        : (stringToCopy += `Meeting - ${data.share.title}
Attendee Meeting ID: ${data.share.passphrase.view}
Host Meeting ID: ${data.share.passphrase.host}`);

      data.share.pstn
        ? (stringToCopy += `PSTN Number: ${data.share.pstn.number}
PSTN Pin: ${data.share.pstn.dtmf}`)
        : '';
      console.log(stringToCopy);
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
    tintColor: '#fff',
  },
});

export default ParticipantView;
