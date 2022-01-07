import React, {useContext} from 'react';
import {StyleSheet} from 'react-native';
import {RtcContext} from '../../agora-rn-uikit';
import {BtnTemplate} from '../../agora-rn-uikit';
import {LocalContext} from '../../agora-rn-uikit';

function SwitchCamera() {
  const {RtcEngine} = useContext(RtcContext);
  const local = useContext(LocalContext);
  return (
    <BtnTemplate
      name={'switchCamera'}
      btnText={'Switch'}
      disabled={local.video ? false : true }
      style={{
        backgroundColor: $config.SECONDARY_FONT_COLOR, //'#fff',
        borderRadius: 23,
        borderColor: $config.PRIMARY_COLOR,
        borderWidth: 0,
        width: 40,
        height: 40,
        padding: 3,
        display: 'flex',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={() => {
        RtcEngine.switchCamera();
      }}
    />
  );
}

export default SwitchCamera;
