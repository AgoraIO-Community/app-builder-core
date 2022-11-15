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
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {useHistory} from '../components/Router';
import PrimaryButton from '../atoms/PrimaryButton';
import Toast from '../../react-native-toast-message';
import {ErrorContext} from '../components/common';
import ShareLink from '../components/Share';
import Logo from '../components/common/Logo';
import {isWebInternal, isValidReactComponent} from '../utils/common';
import {useCustomization} from 'customization-implementation';
import {useString} from '../utils/useString';
import useCreateMeeting from '../utils/useCreateMeeting';
import {CreateProvider} from './create/useCreate';
import useJoinMeeting from '../utils/useJoinMeeting';
import SDKEvents from '../utils/SdkEvents';
import {MeetingInfoDefaultValue} from '../components/meeting-info/useMeetingInfo';
import {useSetMeetingInfo} from '../components/meeting-info/useSetMeetingInfo';
import Input from '../atoms/Input';
import Toggle from '../atoms/Toggle';
import styles from 'react-native-toast-message/src/components/icon/styles';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import InfoBubble from '../atoms/InfoBubble';
import Card from '../atoms/Card';
import Spacer from '../atoms/Spacer';
import LinkButton from '../atoms/LinkButton';
import DimensionContext from '../components/dimension/DimensionContext';

const mobileOrTablet = isMobileOrTablet();
const isLiveStream = $config.EVENT_MODE;
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

  const {setGlobalErrorMessage} = useContext(ErrorContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [roomTitle, onChangeRoomTitle] = useState('');
  const [pstnCheckbox, setPstnCheckbox] = useState(false);
  const [hostControlCheckbox, setHostControlCheckbox] = useState(true);
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

  const createdText = 'has been created';
  // const meetingNameInputPlaceholder = useString(
  //   'meetingNameInputPlaceholder',
  // )();
  const meetingNameInputPlaceholder = 'The Annual Galactic Meet';
  const loadingWithDots = 'Loading...';
  const createMeetingButton = isLiveStream
    ? 'CREATE A STREAM'
    : 'CREATE A MEETING';
  const haveMeetingID = 'Join with a meeting ID';

  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const [dim, setDim] = React.useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);

  const {getDimensionData} = useContext(DimensionContext);
  const {isDesktop} = getDimensionData();
  useEffect(() => {
    if (isWebInternal()) {
      document.title = $config.APP_NAME;
    }
    const unbind = SDKEvents.on(
      'joinMeetingWithPhrase',
      (phrase, resolve, reject) => {
        console.log('SDKEvents: joinMeetingWithPhrase event called', phrase);
        try {
          setMeetingInfo(MeetingInfoDefaultValue);
          history.push(phrase);
          resolve();
        } catch (error) {
          reject(error);
        }
      },
    );
    return () => {
      unbind();
    };
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
          text1: roomTitle,
          text2: createdText,
          visibilityTime: 1000,
        });
        showShareScreen();
      } catch (error) {
        setLoading(false);
        setGlobalErrorMessage(error);
      }
    }
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
          <ScrollView contentContainerStyle={style.main} onLayout={onLayout}>
            <Card isDesktop={isDesktop}>
              <View>
                <Logo />
                <Spacer size={isDesktop ? 20 : 16} />
                <Text style={style.heading}>
                  {isLiveStream ? 'Create a Livestream' : 'Create a Meeting'}
                </Text>
                <Spacer size={40} />
                <Input
                  labelStyle={style.inputLabelStyle}
                  label={isLiveStream ? 'Stream Name' : 'Meeting Name'}
                  value={roomTitle}
                  placeholder={meetingNameInputPlaceholder}
                  onChangeText={(text) => onChangeRoomTitle(text)}
                  onSubmitEditing={() =>
                    createRoomAndNavigateToShare(
                      roomTitle,
                      pstnCheckbox,
                      hostControlCheckbox,
                    )
                  }
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
                      <Text style={style.toggleLabel}>
                        Make everyone a Co-Host
                      </Text>
                      <InfoBubble
                        text={
                          hostControlCheckbox
                            ? 'Creates two unique links in order to seperate co-hosts from attendees'
                            : 'Everyone is a Host'
                        }
                      />
                    </View>
                    <View style={style.infoToggleContainer}>
                      <Toggle
                        disabled={$config.EVENT_MODE}
                        isEnabled={hostControlCheckbox}
                        toggleSwitch={setHostControlCheckbox}
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
                        <Text style={style.toggleLabel}>
                          Allow joining via a phone number
                        </Text>
                        <InfoBubble text="Attendees can dial a number and join via PSTN" />
                      </View>
                      <View style={style.infoToggleContainer}>
                        <Toggle
                          isEnabled={pstnCheckbox}
                          toggleSwitch={setPstnCheckbox}
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
                  iconName={'videocamPlus'}
                  disabled={roomTitle === '' || loading}
                  containerStyle={!isDesktop && {width: '100%'}}
                  onPress={() =>
                    createRoomAndNavigateToShare(
                      roomTitle,
                      pstnCheckbox,
                      hostControlCheckbox,
                    )
                  }
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
        )
      ) : (
        <></>
      )}
      {roomCreated ? <ShareLink /> : <></>}
    </CreateProvider>
  );
};

const style = StyleSheet.create({
  inputLabelStyle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 18,
    color: '#1A1A1A',
    letterSpacing: 0.08,
    lineHeight: 18,
    paddingLeft: 8,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 32,
    color: $config.PRIMARY_FONT_COLOR,
    fontFamily: 'Source Sans Pro',
  },
  headline: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    color: $config.PRIMARY_FONT_COLOR,
    marginBottom: 40,
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  upper: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  lower: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  toggleLabel: {
    color: '#666666',
    fontSize: 16,
    marginRight: 8,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
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
  },
});

export default Create;
