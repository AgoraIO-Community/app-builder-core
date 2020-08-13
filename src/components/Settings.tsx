import React, {useState} from 'react';
import {View, TouchableOpacity, Text, Image} from 'react-native';
import icons from '../assets/icons';
import styles from './styles';
import SelectDevice from '../subComponents/SelectDevice';

const Settings = (props) => {
  const [screenListActive, setScreenListActive] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.localButton}
        disabled={buttonDisabled}
        onPress={() => {
          if (!screenListActive) {
            setScreenListActive(true);
            setButtonDisabled(true);
          }
        }}>
        <Image source={{uri: icons.settings}} style={styles.buttonIcon} />
      </TouchableOpacity>
      {screenListActive ? (
        <View style={styles.popupView}>
          <Text style={styles.popupText}>Choose Audio/Video Devices</Text>
          <View style={styles.popupPickerHolder}>
            <SelectDevice />
          </View>
          <TouchableOpacity
            style={styles.popupButton}
            onPress={() => {
              setScreenListActive(false);
              setButtonDisabled(false);
            }}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

export default Settings;
