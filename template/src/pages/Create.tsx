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
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useHistory} from '../components/Router';
import Checkbox from '../subComponents/Checkbox';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import HorizontalRule from '../atoms/HorizontalRule';
import TextInput from '../atoms/TextInput';
import Toast from '../../react-native-toast-message';
import {ErrorContext} from '../components/common';
import ShareLink from '../components/Share';
import Logo from '../components/common/Logo';
import {isWeb, isValidReactComponent} from '../utils/common';
import {icons, useFpe, useMeetingInfo} from 'fpe-api';
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

const mobileOrTablet = isMobileOrTablet();
const isLiveStream = $config.EVENT_MODE;
const Create = () => {
  const {CreateComponent} = useFpe((data) => {
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
  const {
    meetingPassphrase: {attendee, host, pstn},
  } = useMeetingInfo();
  //commented for v1 release
  // const createdText = useString('meetingCreatedNotificationLabel')();
  // const hostControlsToggle = useString<boolean>('hostControlsToggle');
  // const pstnToggle = useString<boolean>('pstnToggle');
  // const loadingWithDots = useString('loadingWithDots')();
  // const createMeetingButton = useString('createMeetingButton')();
  // const haveMeetingID = useString('haveMeetingID')();

  const createdText = 'has been created';
  const hostControlsToggle = (toggle: boolean) => (
    <View style={style.infoContainer}>
      <Text style={style.toggleLabel}>Restrict Host Controls</Text>
      <InfoBubble text={toggle ? 'Separate host link' : 'Everyone is a Host'} />
    </View>
  );

  const pstnToggle = (value: boolean) => (
    <View style={style.infoContainer}>
      <Text style={style.toggleLabel}> Use PSTN </Text>
      <InfoBubble text="Join by dialing a number" />
    </View>
  );
  const meetingNameInputPlaceholder = useString(
    'meetingNameInputPlaceholder',
  )();
  const loadingWithDots = 'Loading...';
  const createMeetingButton = isLiveStream
    ? 'CREATE A STREAM'
    : 'CREATE A MEETING';
  const haveMeetingID = 'Join with a meeting ID?';

  useEffect(() => {
    if (isWeb) {
      document.title = $config.APP_NAME;
    }
    SDKEvents.on('joinMeetingWithPhrase', (phrase) => {
      console.log(
        'DEBUG(aditya)-SDKEvents: joinMeetingWithPhrase event called',
      );
      useJoin(phrase);
    });
    return () => {
      SDKEvents.off('joinMeetingWithPhrase');
    };
  }, []);

  const showShareScreen = () => {
    setRoomCreated(true);
  };

  useEffect(() => {
    if (attendee) {
      SDKEvents.emit('create', host, attendee, pstn);
    }
  }, [attendee]);

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
          <ScrollView contentContainerStyle={style.main}>
            <Card>
              <Logo />
              <Spacer size={20} />
              <View style={style.content}>
                <View style={style.leftContent}>
                  <Text style={style.heading}>
                    {isLiveStream ? 'Create a Livestream' : 'Create a Meeting'}
                  </Text>
                  {/* <Text style={style.headline}>
                  {$config.LANDING_SUB_HEADING}
                </Text> */}

                  {/* <TextInput
                    value={roomTitle}
                    onChangeText={(text) => onChangeRoomTitle(text)}
                    onSubmitEditing={() =>
                      createRoomAndNavigateToShare(
                        roomTitle,
                        pstnCheckbox,
                        hostControlCheckbox,
                      )
                    }
                    placeholder={meetingNameInputPlaceholder}
                  /> */}
                  <Spacer size={40} />
                  <Input
                    autoFocus
                    label={isLiveStream ? 'Stream Name' : 'Meeting Name'}
                    value={roomTitle}
                    helpText={
                      isLiveStream
                        ? 'Name and create a livestream  where you want to meet with others'
                        : 'Name and create a meeting room where you want to meet with others'
                    }
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
                  <View style={{paddingVertical: mobileOrTablet ? 20 : 50}}>
                    {$config.EVENT_MODE ? (
                      <></>
                    ) : (
                      <>
                        <View style={style.toggleContainer}>
                          {hostControlsToggle(hostControlCheckbox)}
                          <Toggle
                            disabled={$config.EVENT_MODE}
                            isEnabled={hostControlCheckbox}
                            toggleSwitch={setHostControlCheckbox}
                          />
                        </View>
                        {/* <Checkbox
                            disabled={$config.EVENT_MODE}
                            value={hostControlCheckbox}
                            onValueChange={setHostControlCheckbox}
                          />
                          <Text style={style.checkboxTitle}>
                         
                            {hostControlsToggle(hostControlCheckbox)}
                          </Text> */}
                      </>
                    )}
                    <View style={style.separator} />

                    {$config.PSTN ? (
                      <View style={style.toggleContainer}>
                        {pstnToggle(pstnCheckbox)}
                        <Toggle
                          isEnabled={pstnCheckbox}
                          toggleSwitch={setPstnCheckbox}
                        />
                      </View>
                    ) : (
                      // <View style={style.checkboxHolder}>
                      //   <Checkbox
                      //     value={pstnCheckbox}
                      //     onValueChange={setPstnCheckbox}
                      //   />
                      //   <Text style={style.checkboxTitle}>
                      //     {pstnToggle(pstnCheckbox)}
                      //   </Text>
                      // </View>
                      <></>
                    )}
                  </View>
                  <View style={style.btnContainer}>
                    <PrimaryButton
                      icon={icons.createMeeting}
                      disabled={roomTitle === '' || loading}
                      onPress={() =>
                        createRoomAndNavigateToShare(
                          roomTitle,
                          pstnCheckbox,
                          hostControlCheckbox,
                        )
                      }
                      text={loading ? loadingWithDots : createMeetingButton}
                    />
                    {/* <HorizontalRule /> */}
                    <Spacer size={16} />
                    <LinkButton
                      text={haveMeetingID}
                      onPress={() => history.push('/join')}
                    />
                    {/* <SecondaryButton
                      onPress={() => history.push('/join')}
                      text={haveMeetingID}
                    /> */}
                  </View>
                </View>
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
  main: {
    paddingVertical: '8%',
    marginHorizontal: '8%',
    display: 'flex',
    justifyContent: 'space-evenly',
    flexGrow: 1,
  },
  nav: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  content: {flex: 6, flexDirection: 'row'},
  leftContent: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-evenly',
    minHeight: 350,
    // marginRight: '5%',
    marginHorizontal: 'auto',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
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
  inputs: {
    flex: 1,
    // marginVertical: '2%',
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  // textInput: textInput,
  checkboxHolder: {
    marginVertical: 0,
    flexDirection: 'row',
    marginTop: 0,
    marginBottom: 2,
    // flex: .2,
    // height: 10,
    // justifyContent: 'center',
    // alignContent: 'center',
    justifyContent: 'flex-start',
    // alignItems: 'flex-start',
  },
  checkboxTitle: {
    color: $config.PRIMARY_FONT_COLOR + '60',
    paddingHorizontal: 5,
    alignSelf: 'center',
    // marginVertical: 'auto',
    // fontWeight: '700',
  },
  checkboxCaption: {
    color: $config.PRIMARY_FONT_COLOR + '60',
    paddingHorizontal: 5,
  },
  checkboxTextHolder: {
    marginVertical: 0, //check if 5
    flexDirection: 'column',
  },
  // urlTitle: {
  //   color: '#fff',
  //   fontSize: 14,
  // },
  urlHolder: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: 'center',
    maxWidth: 400,
    minHeight: 45,
  },
  // url: {
  //   color: '#fff',
  //   fontSize: 18,
  //   fontWeight: '700',
  //   textDecorationLine: 'underline',
  // },
  pstnHolder: {
    flexDirection: 'row',
    width: '80%',
  },
  pstnMargin: {
    marginRight: '10%',
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F2',
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  toggleLabel: {
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 16,
    marginRight: 8,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
  },
  separator: {
    height: 5,
  },
  infoContainer: {
    flexDirection: 'row',
  },
});

export default Create;
