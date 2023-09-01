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
import React, {useState, useContext} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useHistory} from '../components/Router';
//import Logo from '../subComponents/Logo';
import Logo from '../components/common/Logo';
import Spacer from '../atoms/Spacer';
import {
  isMobileUA,
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
import Card from '../atoms/Card';
import Input from '../atoms/Input';
import LinkButton from '../atoms/LinkButton';
import Toast from '../../react-native-toast-message';
import useJoinMeeting from '../utils/useJoinMeeting';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import ThemeConfig from '../theme';
import IDPLogoutComponent from '../auth/IDPLogoutComponent';

const isLiveStream = $config.EVENT_MODE;
const mobileOrTablet = isMobileOrTablet();

const Join = () => {
  const hasBrandLogo = useHasBrandLogo();
  //commented for v1 release
  // const meetingIdInputPlaceholder = useString('meetingIdInputPlaceholder')();
  // const enterMeetingButton = useString('enterMeetingButton')();
  // const createMeetingButton = useString('createMeetingButton')();
  const meetingIdInputPlaceholder = isLiveStream
    ? 'Enter Stream ID'
    : 'Enter Meeting ID';
  const enterMeetingButton = isLiveStream ? 'Join Stream' : 'Join Meeting';
  const createMeetingButton = isLiveStream
    ? 'Create a Stream'
    : 'Create a meeting';
  const history = useHistory();
  const [phrase, setPhrase] = useState('');
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
        history.push(phrase);
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
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          leadingIcon: null,
        });
      });
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
    <View style={style.root}>
      {!isMobileUA() ? (
        <IDPLogoutComponent containerStyle={{marginBottom: -100}} />
      ) : (
        <></>
      )}
      <ScrollView contentContainerStyle={style.main}>
        {error ? <Error error={error} /> : <></>}
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
            <Spacer size={20} />
            <Text style={style.heading}>
              {isLiveStream ? 'Join a Stream' : 'Join a Meeting'}
            </Text>
            <Spacer size={40} />
            <Input
              labelStyle={style.labelStyle}
              label={isLiveStream ? 'Stream ID' : 'Meeting ID'}
              autoFocus
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
            <Spacer size={60} />
          </View>
          <View style={style.btnContainer}>
            <PrimaryButton
              iconName="video-on"
              disabled={phrase === ''}
              onPress={() => startCall()}
              text={enterMeetingButton}
              containerStyle={isMobileUA() && {width: '100%'}}
            />
            <Spacer size={16} />
            <LinkButton
              text={createMeetingButton}
              onPress={() => createMeeting()}
            />
            {shouldAuthenticate ? (
              <LogoutButton
                //@ts-ignore
                setError={setError}
              /> //setError not available in logout?
            ) : (
              <></>
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
  labelStyle: {
    paddingLeft: 8,
  },
  root: {
    flex: 1,
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
  },
});

export default Join;
