import React, {useContext, useState} from 'react';
import {Image, TouchableOpacity, View, Picker, Text} from 'react-native';
import styles from '../components/styles';
import icons from '../assets/icons';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';

export default function ScreenshareButton(props) {
  const [screenListActive, setScreenListActive] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [screens, setScreens] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const rtc = useContext(RtcContext);
  const {screenshareActive, setScreenshareActive} = props;
  rtc.RtcEngine.addListener('ScreenshareStopped', () => {
    setScreenshareActive(false);
  });
  return (
    <>
      <TouchableOpacity
        style={screenshareActive ? styles.greenLocalButton : styles.localButton}
        disabled={buttonDisabled}
        onPress={() => {
          if (!screenshareActive) {
            setScreenshareActive(true);
            setScreens(rtc.RtcEngine.getScreenDisplaysInfo());
            setScreenListActive(true);
            setButtonDisabled(true);
          } else {
            rtc.RtcEngine.startScreenshare();
          }
        }}>
        <Image
          source={{uri: icons.screenshareIcon}}
          style={styles.buttonIcon}
        />
      </TouchableOpacity>
      {screenListActive ? (
        <View style={styles.popupView}>
          <Text style={styles.popupText}>Please select a screen to share:</Text>
          <Picker
            selectedValue={selectedScreen}
            style={styles.popupPicker}
            onValueChange={(itemValue) => setSelectedScreen(itemValue)}>
            {screens.map((device: any, i) => {
              console.log(device, i);
              return (
                <Picker.Item label={'screen' + (i + 1)} value={i} key={i} />
              );
            })}
          </Picker>
          <TouchableOpacity
            onPress={() => {
              rtc.RtcEngine.startScreenshare(screens[selectedScreen]);
              setScreenListActive(false);
              setScreenshareActive(true);
              setButtonDisabled(false);
            }}
            style={styles.popupButton}>
            <Text style={styles.buttonText}>Start Sharing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <></>
      )}
    </>
  );
}
