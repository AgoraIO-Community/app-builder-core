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
import Logo from '../subComponents/Logo';
import {
  isValidReactComponent,
  shouldAuthenticate,
  useHasBrandLogo,
} from '../utils/common';
import LogoutButton from '../subComponents/LogoutButton';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import HorizontalRule from '../atoms/HorizontalRule';
import TextInput from '../atoms/TextInput';
import Error from '../subComponents/Error';
import {useString} from '../utils/useString';
import {useCustomization} from 'customization-implementation';
import {useSetMeetingInfo} from '../components/meeting-info/useSetMeetingInfo';
import {MeetingInfoDefaultValue} from '../components/meeting-info/useMeetingInfo';

const Join = () => {
  const hasBrandLogo = useHasBrandLogo();
  //commented for v1 release
  // const meetingIdInputPlaceholder = useString('meetingIdInputPlaceholder')();
  // const enterMeetingButton = useString('enterMeetingButton')();
  // const createMeetingButton = useString('createMeetingButton')();
  const meetingIdInputPlaceholder = 'Enter Meeting ID';
  const enterMeetingButton = 'Enter Meeting';
  const createMeetingButton = 'Create Meeting';
  const history = useHistory();
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState<null | {name: string; message: string}>(
    null,
  );
  const {setMeetingInfo} = useSetMeetingInfo();
  const createMeeting = () => {
    history.push('/create');
  };

  const startCall = async () => {
    setMeetingInfo(MeetingInfoDefaultValue);
    history.push(phrase);
  };
  const {JoinComponent} = useCustomization((data) => {
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
      <View style={style.nav}>
        {hasBrandLogo() && <Logo />}
        {error ? <Error error={error} /> : <></>}
      </View>
      <View style={style.content}>
        <View style={style.leftContent}>
          <Text style={style.heading}>{$config.APP_NAME}</Text>
          <Text style={style.headline}>{$config.LANDING_SUB_HEADING}</Text>
          <View style={style.inputs}>
            <TextInput
              value={phrase}
              onChangeText={(text) => setPhrase(text)}
              onSubmitEditing={() => startCall()}
              placeholder={meetingIdInputPlaceholder}
            />
            <View style={{height: 10}} />
            <PrimaryButton
              disabled={phrase === ''}
              onPress={() => startCall()}
              text={enterMeetingButton}
            />
            <HorizontalRule />
            <SecondaryButton
              onPress={() => createMeeting()}
              text={createMeetingButton}
            />
            {shouldAuthenticate ? (
              <LogoutButton setError={setError} /> //setError not available in logout?
            ) : (
              <></>
            )}
          </View>
        </View>
      </View>
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
    minHeight: 300,
    flex: 1,
    justifyContent: 'space-evenly',
    marginBottom: '15%',
    marginTop: '8%',
    // marginRight: '5%',
    marginHorizontal: 'auto',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: $config.PRIMARY_FONT_COLOR,
    marginBottom: 20,
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
    justifyContent: 'space-evenly',
  },
});

export default Join;
