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
import React, {useContext, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useHistory} from '../components/Router';
import SessionContext from '../components/SessionContext';
// import OpenInNativeButton from '../subComponents/OpenInNativeButton';
import Logo from '../subComponents/Logo';
import {hasBrandLogo} from '../utils/common';
import LogoutButton from '../subComponents/LogoutButton';
import ColorContext from '../components/ColorContext';
// import Illustration from '../subComponents/Illustration';
// import {secondaryBtn} from '../../theme.json';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import HorizontalRule from '../atoms/HorizontalRule';
import TextInput from '../atoms/TextInput';
import Error from '../subComponents/Error';
import {shouldAuthenticate} from '../utils/common';
import {useString} from '../utils/useString';
// const joinFlag = 0;
const Join = () => {
  const history = useHistory();
  const [phrase, setPhrase] = useState('');
  const {primaryColor} = useContext(ColorContext);
  const {joinSession} = useContext(SessionContext);
  const [error, setError] = useState<null | {name: string; message: string}>(
    null,
  );

  const createMeeting = () => {
    history.push('/create');
  };

  const startCall = async () => {
    joinSession({phrase});
  };

  return (
    <ScrollView contentContainerStyle={style.main}>
      <View style={style.nav}>
        {hasBrandLogo && <Logo />}
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
              placeholder={useString('meetingIdInputPlaceholder')()}
            />
            <View style={{height: 10}} />
            <PrimaryButton
              disabled={phrase === ''}
              onPress={() => startCall()}
              text={useString('enterMeetingButton')()}
            />
            <HorizontalRule />
            <SecondaryButton
              onPress={() => createMeeting()}
              text={useString('createMeetingButton')()}
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
