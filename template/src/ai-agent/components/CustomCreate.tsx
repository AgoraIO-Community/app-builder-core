import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import {
  useRoomInfo,
  useCreateRoom,
  Toast,
  isWebInternal,
  trimText,
  useString,
  Spacer,
  useSetRoomInfo,
  isSDK,
  useStorageContext,
  useErrorContext,
  RoomInfoDefaultValue,
} from 'customization-api';
import {Redirect} from '../../components/Router';
import ThemeConfig from '../../theme';

//@ts-ignore
import AgoraLogo from '../assets/agora-logo.png';
//@ts-ignore
import AIAgentLogo from '../assets/ai-agent-logo.png';
import Checkbox from '../../atoms/Checkbox';
import {isMobileUA} from '../../utils/common';
const CustomCreate = () => {
  const {
    data: {
      roomId: {host},
    },
  } = useRoomInfo();
  const {setGlobalErrorMessage} = useErrorContext();
  const [loading, setLoading] = useState(false);
  const [roomTitle, onChangeRoomTitle] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const createRoomFun = useCreateRoom();
  const {setRoomInfo} = useSetRoomInfo();
  const {setStore} = useStorageContext();
  const loadingText = useString('loadingText')();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isWebInternal() && !isSDK) {
      document.title = $config.APP_NAME;
    }
    console.log('[SDKEvents] Join listener registered');
    return () => {};
  }, []);

  // set default room and username
  useEffect(() => {
    const generateChannelId = () => {
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 16; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }
      return result;
    };
    setStore(prevState => {
      return {
        ...prevState,
        displayName: 'You',
      };
    });
    // set default meeting name
    onChangeRoomTitle(generateChannelId);
  }, []);

  const createRoomAndNavigateToShare = async (
    roomTitle: string,
    enablePSTN: boolean,
    isSeparateHostLink: boolean,
  ) => {
    if (roomTitle !== '') {
      setLoading(true);
      try {
        setRoomInfo(RoomInfoDefaultValue);
        //@ts-ignore
        //isSeparateHostLink will be for internal usage since backend integration is not there
        await createRoomFun(roomTitle, enablePSTN, isSeparateHostLink);

        setLoading(false);
        Toast.show({
          leadingIconName: 'tick-fill',
          type: 'success',
          text1: 'You have joined channel ' + trimText(roomTitle),
          text2: null,
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          leadingIcon: null,
        });
        setRoomCreated(true);
      } catch (error) {
        setLoading(false);
        setGlobalErrorMessage({
          name: 'Unable to join channel',
          message: error.message,
        });
      }
    }
  };
  const showError = () => {
    Toast.show({
      leadingIconName: 'alert',
      type: 'error',
      text1: 'Backend endpoint not configured',
      text2: 'Please configure backend endpoint config.json',
      visibilityTime: 1000 * 10,
      primaryBtn: null,
      secondaryBtn: null,
      leadingIcon: null,
    });
  };

  return (
    <>
      {!roomCreated ? (
        <View style={isMobileUA() ? style.rootMobile : style.root}>
          <View style={style.topLogoContainer}>
            <Image style={style.topLogo} source={{uri: AgoraLogo}} />
          </View>
          <View style={style.centerContentContainer}>
            <Spacer size={isMobileUA() ? 52 : 90} />
            <View style={style.centerLogoContainer}>
              <Image
                style={{width: 120, height: 120}}
                source={{uri: AIAgentLogo}}
              />
              <Text style={style.mainTextStyle}>AI Agents</Text>
            </View>
          </View>
          <View style={style.bottomContentContainer}>
            <Spacer size={isMobileUA() ? 52 : 72} />
            <View style={style.termsAndConditionsContainer}>
              <Checkbox
                tickColor="black"
                label=""
                disabled={false}
                checked={checked}
                onChange={setChecked}
                checkBoxStyle={checked ? {borderWidth: 0} : {}}
              />
              <Text style={style.subTextStyle}>
                I agree to the{' '}
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL('https://www.agora.io/en/terms-of-service/')
                  }>
                  <Text style={{textDecorationLine: 'underline'}}>
                    Agora Terms of Service
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
            <Spacer size={isMobileUA() ? 52 : 28} />
            <TouchableOpacity
              disabled={loading || !roomTitle?.trim() || !checked}
              style={[
                style.btnContainer,
                !checked ? style.btnDisabledEffect : {},
              ]}
              onPress={() => {
                if (!$config.BACKEND_ENDPOINT) {
                  showError();
                } else {
                  createRoomAndNavigateToShare(roomTitle?.trim(), false, false);
                }
              }}>
              <Text style={style.btnTextStyle}>
                {loading ? loadingText : 'Get Started'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Redirect to={host} />
      )}
    </>
  );
};

const style = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: 20,
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#111',
    borderRadius: 20,
  },
  rootMobile: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    paddingVertical: 72,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#111',
    justifyContent: 'space-between',
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    height: 60,
    padding: 20,
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 40,
    backgroundColor: '#0097D4',
  },
  btnDisabledEffect: {
    opacity: 0.8,
  },
  btnTextStyle: {
    textAlign: 'center',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 18,
    color: '#FDFCFB',
  },
  topLogoContainer: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    display: 'flex',
    width: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  topLogo: {
    width: 100,
    height: 35,
  },
  centerContentContainer: {
    width: isMobileUA() ? '100%' : 400,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLogoContainer: {
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTextStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 40,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 40,
    letterSpacing: 1,
  },
  subTextStyle: {
    color: '#FDFCFB',
    textAlign: 'center',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 14,
  },
  termsAndConditionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContentContainer: {
    width: isMobileUA() ? '100%' : 400,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomCreate;
