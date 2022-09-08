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
// @ts-nocheck
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useHistory} from '../components/Router';
//import Logo from '../subComponents/Logo';
import Logo from '../components/common/Logo';
import Spacer from '../atoms/Spacer';
import {
  isValidReactComponent,
  shouldAuthenticate,
  hasBrandLogo,
} from '../utils/common';
import LogoutButton from '../subComponents/LogoutButton';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import HorizontalRule from '../atoms/HorizontalRule';
import TextInput from '../atoms/TextInput';
import Error from '../subComponents/Error';
import {useString} from '../utils/useString';
import useNavigateTo from '../utils/useNavigateTo';
import {icons, useFpe} from 'fpe-api';
import {useSetMeetingInfo} from '../components/meeting-info/useSetMeetingInfo';
import {MeetingInfoDefaultValue} from '../components/meeting-info/useMeetingInfo';
import Card from '../atoms/Card';
import Input from '../atoms/Input';
import LinkButton from '../atoms/LinkButton';
import Toast from '../../react-native-toast-message';
import useJoinMeeting from '../utils/useJoinMeeting';

import isMobileOrTablet from '../utils/isMobileOrTablet';

const isLiveStream = $config.EVENT_MODE;
const mobileOrTablet = isMobileOrTablet();

const Join = () => {
  //commented for v1 release
  // const meetingIdInputPlaceholder = useString('meetingIdInputPlaceholder')();
  // const enterMeetingButton = useString('enterMeetingButton')();
  // const createMeetingButton = useString('createMeetingButton')();
  const meetingIdInputPlaceholder = isLiveStream
    ? 'Enter Stream ID'
    : 'Enter Meeting ID';
  const enterMeetingButton = isLiveStream ? 'Enter Stream' : 'Enter Meeting';
  const createMeetingButton = isLiveStream
    ? 'Create a Stream'
    : 'Create a meeting';
  const history = useHistory();
  const [phrase, setPhrase] = useState('');
  const navigateTo = useNavigateTo();
  const [error, setError] = useState<null | {name: string; message: string}>(
    null,
  );

  const useJoin = useJoinMeeting();
  const {setMeetingInfo} = useSetMeetingInfo();
  const createMeeting = () => {
    history.push('/create');
  };

  const startCall = async () => {
    useJoin(phrase)
      .then(() => {
        setMeetingInfo(MeetingInfoDefaultValue);
        navigateTo(phrase);
      })
      .catch((error) => {
        const isInvalidUrl =
          error?.message.toLowerCase().trim() === 'invalid url' || false;
        Toast.show({
          type: 'error',
          text1: isInvalidUrl ? 'Meeting ID Invalid.' : 'Some Error Occured.',
          text2: isInvalidUrl
            ? 'Please enter a valid Meeting ID'
            : 'Please try again',
          visibilityTime: 1000,
        });
      });
  };
  const {JoinComponent} = useFpe((data) => {
    let components: {
      JoinComponent?: React.ComponentType;
    } = {};
    // commented for v1 release
    // if (
    //   data?.components?.join &&
    //   typeof data?.components?.join !== 'object' &&
    //   isValidReactComponent(data?.components?.join)
    // ) {
    //   components.JoinComponent = data?.components?.join;
    // }
    return components;
  });

  return JoinComponent ? (
    <JoinComponent />
  ) : (
    <ScrollView contentContainerStyle={style.main}>
      <Card>
        <View style={style.nav}>
          <Logo />
          {error ? <Error error={error} /> : <></>}
        </View>
        <Spacer size={20} />
        <View style={style.content}>
          <View style={style.leftContent}>
            <Text style={style.heading}>
              {isLiveStream ? 'Join a Stream' : 'Join a Meeting'}
            </Text>
            {/* <Text style={style.headline}>{$config.LANDING_SUB_HEADING}</Text> */}

            <Spacer size={mobileOrTablet ? 20 : 50} />
            <View style={style.inputs}>
              {/* <TextInput
                value={phrase}
                onChangeText={(text) => setPhrase(text)}
                onSubmitEditing={() => startCall()}
                placeholder={meetingIdInputPlaceholder}
              /> */}
              <Input
                label={isLiveStream ? 'Stream ID' : 'Meeting ID'}
                value={phrase}
                helpText={
                  isLiveStream
                    ? 'Enter the stream ID here for the meeting you’d like to join'
                    : 'Enter the meeting ID here for the meeting you’d like to join'
                }
                placeholder={meetingIdInputPlaceholder}
                onChangeText={(text) => setPhrase(text)}
                onSubmitEditing={() => startCall()}
              />
              <Spacer size={mobileOrTablet ? 20 : 50} />

              <PrimaryButton
                icon={icons.createMeeting}
                disabled={phrase === ''}
                onPress={() => startCall()}
                text={enterMeetingButton}
              />

              {/* <SecondaryButton
                onPress={() => createMeeting()}
                text={createMeetingButton}
              /> */}
              <Spacer size={16} />
              <LinkButton
                text={createMeetingButton}
                onPress={() => createMeeting()}
              />

              {shouldAuthenticate ? (
                <LogoutButton setError={setError} /> //setError not available in logout?
              ) : (
                <></>
              )}
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const style = StyleSheet.create({
  illustration: {flex: 1, alignSelf: 'flex-end'},
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
    // marginBottom: '15%',
    //marginTop: '8%',
    // marginRight: '5%',
    marginHorizontal: 'auto',
  },
  heading: {
    // fontSize: 32,
    // fontWeight: '700',
    // textAlign: 'center',
    // color: $config.PRIMARY_FONT_COLOR,
    // marginBottom: 20,
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
    marginBottom: 20,
  },
  inputs: {
    flex: 1,
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    // justifyContent: 'space-evenly',
  },
});

export default Join;
