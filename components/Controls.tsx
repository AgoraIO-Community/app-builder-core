import React, {useContext, useState} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import LocalUserContext from '../agora-rn-uikit/src/LocalUserContext';
import RtcContext from '../agora-rn-uikit/src/RtcContext';
import {
  Recording,
  LocalAudioMute,
  LocalVideoMute,
  Endcall,
} from '../agora-rn-uikit/Components';
import styles from '../components/styles';

export default function Controls(props) {
  const [screenshareActive, setScreenshareActive] = useState(false);
  const rtc = useContext(RtcContext);
  rtc.RtcEngine.addListener('ScreenshareStopped', () => {
    setScreenshareActive(false);
  });
  return (
    <LocalUserContext>
      <View style={{...styles.bottomBar}}>
        <LocalAudioMute />
        <LocalVideoMute />
        <Recording />
        <TouchableOpacity
          style={
            screenshareActive ? styles.greenLocalButton : styles.localButton
          }
          onPress={() => {
            setScreenshareActive(true);
            rtc.RtcEngine.startScreenshare(
              null,
              props.channelName,
              null,
              null,
              props.appId,
              rtc.RtcEngine,
            );
          }}>
          <Image
            source={{uri: screenshare}}
            style={{width: 25, height: 25, tintColor: '#fff'}}
          />
        </TouchableOpacity>
        <Endcall />
      </View>
    </LocalUserContext>
  );
}

const screenshare =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIEAAABoCAYAAADW65MaAAAABHNCSVQICAgIfAhkiAAAA55JREFUeF7tnSFvVUEUhOc4BAk46gCHo01wFaAq0ZVI/gC1gC1/AIkDgcIBBgHYFoejdcWVBIE7ZMmDtI/7mrzkzu7OvfNs0zmzM192t/fdpJGZGwD2AewAuAZ/5pLAdwDvAOxFZr4EsDuXlXud/yXwqkBwCuCKw5ltAj8KBDnb5XvhfxIwBAbBEJiBC3aCiAgHNK0EVh39K48DQzAtAMpqDMH0Ol17RYZg7cim9wuGYHqdrr2i0SDIzFsAyqNmf/pM4CQivg5ZGwWCzNwEcNDn2u3qTAJbEXG4nMhYEJQvmd467u4T2ImI94ag+56oBg0BNV4NcUOg0RPVpSGgxqshbgg0eqK6NATUeDXEDYFGT1SXhoAar4a4IdDoierSEFDj1RA3BBo9UV0aAmq8GuKGQKMnqktDQI1XQ9wQaPREdWkIqPFqiBsCjZ6oLg0BNV4NcUOg0RPVpSGgxqshbgg0eqK6NATUeDXEDYFGT1SXhoAar4a4IdDoierSEFDj1RA3BBo9UV0aAmq8GuKGQKMnqktDQI1XQ9wQaPREdWkIqPFqiBsCjZ6oLg0BNV4NcUOg0RPVpSGgxqshbgg0eqK6NATUeDXEDYFGT1SXhoAar4a4IdDoierSEFDj1RA3BBo9UV0aAmq8GuKGQKMnqktDQI1XQ9wQaPREdWkIqPFqiBsCjZ6oLg0BNV4NcUOg0RPVpSGgxqshbgg0eqK6NATUeDXEDYFGT1SXhoAar4a4IdDoierSEFDj1RA3BBo9UV1SIdgG8JFq3+JjJLAdEZ+XhUb5h9lFNDMfAtgYw6k1KAmcRMTzIeXRIKDYtmiVBAxBlZj7HmII+u6nijtDUCXmvocYgr77qeJubQgAvKnizENqJnB/aFisoqOmM89qm4AhaJt/F9MNQRc1tDVRIPgA4G5bG57eMIFPBYI7AF4DuN7QiEe3SeAYwG78nZ2ZlwFcauOl+tQ9AI8Gpj4DsF/dTZuBvyLiZxn9D4I2PtpMzcwnAB4PTH8aEeVns/oYgvN1G4K54O+d4HzT3gm8E/hOsLT7+TjwcQBDYAgMwVwYKO9J+k/EM237YuiLoS+GvhiKPDHMzM3FE757AK4KnFunAMoXc+Wiedi7X4njIDO/AbjRe5gD/o4i4mbvvruHYLELHPQe5AX+tnrfDQwBny5DMEbGmXkk+r7DcUR0f4x1vxMUiBZHwgsAt8eAqpLGFwAPej8KZvs+QSUIZMb8BrTfH/1eb/4rAAAAAElFTkSuQmCC';
