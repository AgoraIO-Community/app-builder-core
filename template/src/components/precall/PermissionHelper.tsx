import {useLocalUserInfo, useRender, useRtc} from 'customization-api';
import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import Popup from '../../atoms/Popup';
import ThemeConfig from '../../theme';
//@ts-ignore
import permissionHelper from '../../assets/permission.png';
import {PermissionState} from '../../../agora-rn-uikit';

const PermissionHelper = () => {
  const {dispatch} = useRtc();
  const {permissionStatus} = useLocalUserInfo();
  const [showPopup, setShowPopup] = useState(false);

  const closePopup = () => {
    dispatch({
      type: 'LocalPermissionState',
      value: [PermissionState.CANCELLED],
    });
  };
  useEffect(() => {
    //If permission already given it will take few milliseconds to resolve the promise. it will show the popup which not required. so added timeout
    setTimeout(() => {
      setShowPopup(true);
    }, 500);
  }, []);
  //todo hari update the modal message based the veritical
  return (
    showPopup && (
      <Popup
        modalVisible={permissionStatus === PermissionState.REQUESTED}
        setModalVisible={closePopup}
        showCloseIcon={false}
        contentContainerStyle={styles.modal}>
        <View style={styles.modalImageContainer}>
          <Image
            style={styles.modalImage}
            resizeMode={'contain'}
            source={{uri: permissionHelper}}
          />
        </View>
        <View style={styles.modalContent}>
          <Text style={styles.infoMessage1}>
            Allow access to camera and microphone
          </Text>
          <Text style={styles.infoMessage2}>
            Select
            <Text style={styles.infoMessage2Highlight}> “Allow” </Text>for
            others to see and hear you
          </Text>
          <TouchableOpacity
            onPress={() => {
              closePopup();
            }}>
            <Text style={styles.dismissBtn}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </Popup>
    )
  );
};

const styles = StyleSheet.create({
  dismissBtn: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: 20,
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    paddingVertical: 32,
  },
  infoMessage1: {
    paddingHorizontal: 76,
    paddingTop: 32,
    paddingBottom: 12,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '700',
    fontSize: ThemeConfig.FontSize.large,
    lineHeight: 25,
    textAlign: 'center',
    color: $config.FONT_COLOR,
  },
  infoMessage2: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 18,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
  },
  infoMessage2Highlight: {
    fontWeight: '700',
  },
  modal: {
    flex: 1,
    flexDirection: 'column',
    maxHeight: 386,
    width: 441,
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
  },
  modalImageContainer: {
    minHeight: 190,
  },
  modalImage: {width: '100%', height: '100%'},
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});
export default PermissionHelper;
