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
import React, {useEffect, useState, useContext} from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable} from 'react-native';
import {useHistory} from '../components/Router';
import PrimaryButton from '../atoms/PrimaryButton';
import Toast from '../../react-native-toast-message';
import {ErrorContext} from '../components/common';
import ShareLink from '../components/Share';
import Logo from '../components/common/Logo';
import {
  isWebInternal,
  maxInputLimit,
  isMobileUA,
  trimText,
} from '../utils/common';
import {useCustomization} from 'customization-implementation';
import {useString} from '../utils/useString';
import useCreateMeeting from '../utils/useCreateMeeting';
import {CreateProvider} from './create/useCreate';
import useJoinMeeting from '../utils/useJoinMeeting';
import {MeetingInfoDefaultValue} from '../components/meeting-info/useMeetingInfo';
import Input from '../atoms/Input';
import Toggle from '../atoms/Toggle';
import Card from '../atoms/Card';
import Spacer from '../atoms/Spacer';
import LinkButton from '../atoms/LinkButton';
import StorageContext from '../components/StorageContext';
import ThemeConfig from '../theme';
import Tooltip from '../atoms/Tooltip';
import ImageIcon from '../atoms/ImageIcon';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {randomNameGenerator} from '../utils';
import {useSetMeetingInfo} from '../components/meeting-info/useSetMeetingInfo';
import IDPLogoutComponent from '../auth/IDPLogoutComponent';
import isSDK from '../utils/isSDK';

const Create = () => {
  const {CreateComponent} = useCustomization((data) => {
    let components: {
      CreateComponent?: React.ElementType;
    } = {};
    // commented for v1 release
    // if (
    //   data?.components?.create &&
    //   typeof data?.components?.create !== 'object'
    // ) {
    //   if (
    //     data?.components?.create &&
    //     isValidReactComponent(data?.components?.create)
    //   )
    //     components.CreateComponent = data?.components?.create;
    // }
    return components;
  });

  const useJoin = useJoinMeeting();
  const {setStore} = useContext(StorageContext);
  const {setGlobalErrorMessage} = useContext(ErrorContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [roomTitle, onChangeRoomTitle] = useState('');
  // const [randomRoomTitle, setRandomRoomTitle] = useState('');
  const [pstnToggle, setPstnToggle] = useState(false);
  const [coHostToggle, setCoHostToggle] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const createRoomFun = useCreateMeeting();
  const {setMeetingInfo} = useSetMeetingInfo();
  //commented for v1 release
  // const createdText = useString('meetingCreatedNotificationLabel')();
  // const hostControlsToggle = useString<boolean>('hostControlsToggle');
  // const pstnToggle = useString<boolean>('pstnToggle');
  // const loadingWithDots = useString('loadingWithDots')();
  // const createMeetingButton = useString('createMeetingButton')();
  // const haveMeetingID = useString('haveMeetingID')();

  const createdText = ' has been created';
  // const meetingNameInputPlaceholder = useString(
  //   'meetingNameInputPlaceholder',
  // )();
  const meetingNameInputPlaceholder = 'The Annual Galactic Meet';
  const loadingWithDots = 'Loading...';

  const btnLabel = () => {
    if ($config.AUDIO_ROOM) {
      if ($config.EVENT_MODE) {
        return 'CREATE A AUDIO LIVECAST';
      } else {
        return 'CREATE A VOICE CHAT';
      }
    } else {
      if ($config.EVENT_MODE) {
        return 'CREATE A STREAM';
      } else {
        return 'CREATE A MEETING';
      }
    }
  };

  const createMeetingButton = btnLabel();
  const haveMeetingID = 'Join with a meeting ID';

  const isDesktop = !isMobileUA();
  useEffect(() => {
    //Generating the random room title for placeholder
    // setRandomRoomTitle(
    //   `${randomNameGenerator(3)}-${randomNameGenerator(
    //     3,
    //   )}-${randomNameGenerator(3)}`,
    // );

    if (isWebInternal() && !isSDK) {
      document.title = $config.APP_NAME;
    }
    console.log('[SDKEvents] Join listener registered');
    return () => {};
  }, []);

  const showShareScreen = () => {
    setRoomCreated(true);
  };

  const createRoomAndNavigateToShare = async (
    roomTitle: string,
    enablePSTN: boolean,
    isSeparateHostLink: boolean,
  ) => {
    if (roomTitle !== '') {
      setLoading(true);
      try {
        setMeetingInfo(MeetingInfoDefaultValue);
        await createRoomFun(roomTitle, enablePSTN, isSeparateHostLink);
        setLoading(false);
        Toast.show({
          type: 'success',
          text1: trimText(roomTitle) + createdText,
          text2: 'Your New meeting is now live',
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          leadingIcon: null,
        });
        showShareScreen();
      } catch (error) {
        setLoading(false);
        setGlobalErrorMessage(error);
      }
    }
  };

  const renderInfoIcon = (isToolTipVisible, setToolTipVisible) => {
    return (
      <Pressable onPress={() => setToolTipVisible(true)}>
        <ImageIcon
          iconType="plain"
          name="info"
          iconSize={20}
          tintColor={
            isToolTipVisible
              ? $config.SECONDARY_ACTION_COLOR
              : $config.SEMANTIC_NEUTRAL
          }
        />
      </Pressable>
    );
  };

  const getHeading = () => {
    if ($config.AUDIO_ROOM) {
      if ($config.EVENT_MODE) {
        return 'Create a Audio Livecast';
      } else {
        return 'Create a Voice Chat';
      }
    } else {
      if ($config.EVENT_MODE) {
        return 'Create a Livestream';
      } else {
        return 'Create a Meeting';
      }
    }
  };

  const getInputLabel = () => {
    if ($config.AUDIO_ROOM) {
      if ($config.EVENT_MODE) {
        return 'Audio Livecast Name';
      } else {
        return 'Voice Chat Name';
      }
    } else {
      if ($config.EVENT_MODE) {
        return 'Stream Name';
      } else {
        return 'Meeting Name';
      }
    }
  };

  const showError = () => {
    Toast.show({
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
    <CreateProvider
      value={{
        showShareScreen,
      }}>
      {!roomCreated ? (
        CreateComponent ? (
          <CreateComponent />
        ) : (
          <View style={style.root}>
            {!isMobileUA() ? (
              <IDPLogoutComponent containerStyle={{marginBottom: -100}} />
            ) : (
              <></>
            )}
            <ScrollView contentContainerStyle={style.main}>
              <Card>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Logo />
                    {isMobileUA() ? (
                      <IDPLogoutComponent
                        containerStyle={{marginTop: 0, marginRight: 0}}
                      />
                    ) : (
                      <></>
                    )}
                  </View>
                  <Spacer size={isDesktop ? 20 : 16} />
                  <Text style={style.heading}>{getHeading()}</Text>
                  <Spacer size={40} />
                  <Input
                    maxLength={maxInputLimit}
                    labelStyle={style.inputLabelStyle}
                    label={getInputLabel()}
                    value={roomTitle}
                    placeholder={meetingNameInputPlaceholder}
                    onChangeText={(text) => onChangeRoomTitle(text)}
                    onSubmitEditing={() => {
                      if (!roomTitle?.trim()) {
                        return;
                      } else {
                        if (!$config.BACKEND_ENDPOINT) {
                          showError();
                        } else {
                          // !roomTitle?.trim() &&
                          //   onChangeRoomTitle(randomRoomTitle);
                          createRoomAndNavigateToShare(
                            roomTitle?.trim(),
                            pstnToggle,
                            !coHostToggle,
                          );
                        }
                      }
                    }}
                  />
                  <Spacer size={40} />
                  {$config.EVENT_MODE ? (
                    <></>
                  ) : (
                    <View
                      style={[
                        style.toggleContainer,
                        style.upper,
                        !$config.PSTN ? style.lower : {},
                      ]}>
                      <View style={style.infoContainer}>
                        <Text numberOfLines={1} style={style.toggleLabel}>
                          Make everyone a Co-Host
                        </Text>
                        <Tooltip
                          activeBgStyle={style.tooltipActiveBgStyle}
                          defaultBgStyle={style.tooltipDefaultBgStyle}
                          toolTipMessage="Turning on will give everyone the control of this meeting"
                          renderContent={(
                            isToolTipVisible,
                            setToolTipVisible,
                          ) =>
                            renderInfoIcon(isToolTipVisible, setToolTipVisible)
                          }></Tooltip>
                      </View>
                      <View style={style.infoToggleContainer}>
                        <Toggle
                          disabled={$config.EVENT_MODE}
                          isEnabled={coHostToggle}
                          toggleSwitch={setCoHostToggle}
                        />
                      </View>
                    </View>
                  )}
                  {$config.PSTN ? (
                    <>
                      <View style={style.separator} />
                      <View
                        style={[
                          style.toggleContainer,
                          style.lower,
                          $config.EVENT_MODE ? style.upper : {},
                        ]}>
                        <View style={style.infoContainer}>
                          <Text numberOfLines={1} style={style.toggleLabel}>
                            Allow joining via a phone number
                          </Text>
                          <Tooltip
                            activeBgStyle={style.tooltipActiveBgStyle}
                            defaultBgStyle={style.tooltipDefaultBgStyle}
                            toolTipMessage="Attendees can dial a number and join via PSTN"
                            renderContent={(
                              isToolTipVisible,
                              setToolTipVisible,
                            ) =>
                              renderInfoIcon(
                                isToolTipVisible,
                                setToolTipVisible,
                              )
                            }></Tooltip>
                        </View>
                        <View style={style.infoToggleContainer}>
                          <Toggle
                            isEnabled={pstnToggle}
                            toggleSwitch={setPstnToggle}
                          />
                        </View>
                      </View>
                    </>
                  ) : (
                    <></>
                  )}
                  <Spacer size={isDesktop ? 60 : 125} />
                </View>
                <View style={[style.btnContainer]}>
                  <PrimaryButton
                    iconName={'video-plus'}
                    disabled={loading || !roomTitle?.trim()}
                    containerStyle={!isDesktop && {width: '100%'}}
                    onPress={() => {
                      if (!$config.BACKEND_ENDPOINT) {
                        showError();
                      } else {
                        // !roomTitle?.trim() &&
                        //   onChangeRoomTitle(randomRoomTitle);
                        createRoomAndNavigateToShare(
                          roomTitle?.trim(),
                          pstnToggle,
                          !coHostToggle,
                        );
                      }
                    }}
                    text={loading ? loadingWithDots : createMeetingButton}
                  />
                  <Spacer size={16} />
                  <LinkButton
                    text={haveMeetingID}
                    onPress={() => history.push('/join')}
                  />
                </View>
              </Card>
            </ScrollView>
          </View>
        )
      ) : (
        <></>
      )}
      {roomCreated ? <ShareLink /> : <></>}
    </CreateProvider>
  );
};

const style = StyleSheet.create({
  root: {
    flex: 1,
  },
  inputLabelStyle: {
    paddingLeft: 8,
  },
  main: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  heading: {
    fontSize: ThemeConfig.FontSize.extraLarge,
    fontWeight: '700',
    lineHeight: ThemeConfig.FontSize.extraLarge,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    opacity: ThemeConfig.EmphasisOpacity.high,
  },
  headline: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    color: $config.FONT_COLOR,
    marginBottom: 40,
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  upper: {
    borderTopLeftRadius: ThemeConfig.BorderRadius.medium,
    borderTopRightRadius: ThemeConfig.BorderRadius.medium,
  },
  lower: {
    borderBottomLeftRadius: ThemeConfig.BorderRadius.medium,
    borderBottomRightRadius: ThemeConfig.BorderRadius.medium,
  },
  toggleLabel: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    marginRight: 4,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    alignSelf: 'center',
  },
  separator: {
    height: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    flex: 0.8,
  },
  infoToggleContainer: {
    flex: 0.2,
    alignItems: 'flex-end',
    alignSelf: 'center',
  },
  tooltipActiveBgStyle: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['20%'],
    borderRadius: 14,
    padding: 5,
  },
  tooltipDefaultBgStyle: {
    padding: 5,
  },
});

export default Create;
