import React, {useEffect, useState, useContext} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  Redirect,
  Toast,
  useErrorContext,
  isWebInternal,
  trimText,
  useString,
  useCreateRoom,
  RoomInfoDefaultValue,
  useRoomInfo,
  Card,
  useSetRoomInfo,
  isSDK,
  useHistory,
  useStorageContext,
} from 'customization-api';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {AgoraLogo, AgoraOpenAILogo, OpenAILogo, CallIcon} from './icons';
import {AgentContext} from './AgentControls/AgentContext';
import ThemeConfig from '../../theme';

const CustomCreateNative = () => {
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
  const history = useHistory();
  const {agentAuthToken} = useContext(AgentContext);

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

  useEffect(() => {
    // to check if user logged in quer param
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('auth') === 'success' && roomTitle != '') {
      createRoomAndNavigateToShare(roomTitle?.trim(), false, false);
    }
  }, [roomTitle]);

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
          name: 'Unable to join Channel',
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
      {!roomCreated && !agentAuthToken && (
        <View style={style.root}>
          <View style={style.mainMobile}>
            <Card cardContainerStyle={style.mobileContainerStyle}>
              <View>
                <View style={style.topLogoContainer}>
                  <View style={{paddingTop: 14}}>
                    <AgoraLogo />
                  </View>
                  <View>
                    <OpenAILogo />
                  </View>
                </View>
                <View style={style.centerLogoContainer}>
                  <AgoraOpenAILogo />
                  <Text style={style.mainTextStyle}>Agora & OpenAI</Text>
                  <Text style={style.subTextStyle}>
                    Agora Conversational AI demo built in partnership with
                    OpenAI
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                disabled={loading || !roomTitle?.trim()}
                style={style.btnContainer}
                onPress={() => {
                  const queryParams = new URLSearchParams(
                    window.location.search,
                  );
                  if (!$config.BACKEND_ENDPOINT) {
                    showError();
                  } else {
                    // handleSSOLogin()
                    history.push('/login');
                  }
                }}>
                <CallIcon fill="#111111" />
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 18,
                    fontStyle: 'normal',
                    fontWeight: '600',
                    lineHeight: 18,
                  }}>
                  {loading ? loadingText : 'Sign in to Join Call'}
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        </View>
      )}
      {roomCreated && agentAuthToken && <Redirect to={host} />}
    </>
  );
};

const style = StyleSheet.create({
  root: {
    flex: 1,
  },
  main: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mainMobile: {
    paddingBottom: 80,
    paddingTop: 66,
    flex: 1,
  },
  mobileContainerStyle: {
    backgroundColor: 'transparent',
    flex: 1,
    paddingBottom: 0,
    paddingTop: 0,
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    height: 56,
    padding: 20,
    justifyContent: 'center',
    alignContent: 'center',
    gap: 8,
    borderRadius: 4,
    backgroundColor: '#00C2FF',
  },
  separator: {
    height: 1,
  },
  topLogoContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    flexShrink: 0,
  },
  centerLogoContainer: {
    paddingTop: 135,
    paddingBottom: 10,
    display: 'flex',
    paddingHorizontal: 8,
    flexFirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
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
    color: '#FFFFFF' + hexadecimalTransparency['70%'],
    textAlign: 'center',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21.6,
  },
});

export default CustomCreateNative;
