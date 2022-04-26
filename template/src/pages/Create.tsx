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
import {View, Text, StyleSheet, ScrollView, Platform} from 'react-native';
import {useHistory} from '../components/Router';
import Checkbox from '../subComponents/Checkbox';
import {gql, useMutation} from '@apollo/client';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import HorizontalRule from '../atoms/HorizontalRule';
import TextInput from '../atoms/TextInput';
import Toast from '../../react-native-toast-message';
import {ErrorContext} from '../components/common';
import {ShareLinkProvider} from './ShareLink';
import ShareLink from '../components/Share';
import Logo from '../components/common/Logo';
import {cmpTypeGuard, isWeb} from '../utils/common';
import {useFpe} from 'fpe-api';
import {useString} from '../utils/useString';

const CREATE_CHANNEL = gql`
  mutation CreateChannel(
    $title: String!
    $backendURL: String!
    $enablePSTN: Boolean
  ) {
    createChannel(
      title: $title
      backendURL: $backendURL
      enablePSTN: $enablePSTN
    ) {
      passphrase {
        host
        view
      }
      channel
      title
      pstn {
        number
        dtmf
      }
    }
  }
`;

const Create = () => {
  const share = useFpe((config) => config?.components?.share);
  const {setGlobalErrorMessage} = useContext(ErrorContext);
  const history = useHistory();
  const [roomTitle, onChangeRoomTitle] = useState('');
  const [pstnCheckbox, setPstnCheckbox] = useState(false);
  const [hostControlCheckbox, setHostControlCheckbox] = useState(true);
  const [urlView, setUrlView] = useState('');
  const [urlHost, setUrlHost] = useState('');
  const [pstn, setPstn] = useState({number: '', dtmf: ''});
  const [roomCreated, setRoomCreated] = useState(false);
  const [joinPhrase, setJoinPhrase] = useState('');
  const [createChannel, {data, loading, error}] = useMutation(CREATE_CHANNEL);
  const createdText = useString('meetingCreatedNotificationLabel')();
  const hostControlsToggle = useString<boolean>('hostControlsToggle');
  const pstnToggle = useString<boolean>('pstnToggle');
  const meetingNameInputPlaceholder = useString(
    'meetingNameInputPlaceholder',
  )();
  const loadingWithDots = useString('loadingWithDots')();
  const createMeetingButton = useString('createMeetingButton')();
  const haveMeetingID = useString('haveMeetingID')();
  useEffect(() => {
    setGlobalErrorMessage(error);
  }, [error]);

  console.log('mutation data', data);

  useEffect(() => {
    if (isWeb) {
      document.title = $config.APP_NAME;
    }
  }, []);

  const createRoom = () => {
    if (roomTitle !== '') {
      console.log('Create room invoked');
      createChannel({
        variables: {
          title: roomTitle,
          backendURL: $config.BACKEND_ENDPOINT,
          enablePSTN: pstnCheckbox,
        },
      })
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text1: createdText + ': ' + roomTitle,
            visibilityTime: 1000,
          });
          console.log('promise data', res);
          setUrlView(res.data.createChannel.passphrase.view);
          setUrlHost(res.data.createChannel.passphrase.host);
          setPstn(res.data.createChannel.pstn);
          setJoinPhrase(res.data.createChannel.passphrase.host);
          setRoomCreated(true);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={style.main}>
      <Logo />
      {!roomCreated ? (
        <View style={style.content}>
          <View style={style.leftContent}>
            <Text style={style.heading}>{$config.APP_NAME}</Text>
            <Text style={style.headline}>{$config.LANDING_SUB_HEADING}</Text>
            <View style={style.inputs}>
              <TextInput
                value={roomTitle}
                onChangeText={(text) => onChangeRoomTitle(text)}
                onSubmitEditing={() => createRoom()}
                placeholder={meetingNameInputPlaceholder}
              />
              <View style={{paddingVertical: 10}}>
                <View style={style.checkboxHolder}>
                  {$config.EVENT_MODE ? (
                    <></>
                  ) : (
                    <>
                      <Checkbox
                        disabled={$config.EVENT_MODE}
                        value={hostControlCheckbox}
                        onValueChange={setHostControlCheckbox}
                      />
                      <Text style={style.checkboxTitle}>
                        {/* Restrict Host Controls (Separate host link) */}
                        {hostControlsToggle(hostControlCheckbox)}
                      </Text>
                    </>
                  )}
                </View>
                {$config.PSTN ? (
                  <View style={style.checkboxHolder}>
                    <Checkbox
                      value={pstnCheckbox}
                      onValueChange={setPstnCheckbox}
                    />
                    <Text style={style.checkboxTitle}>
                      {pstnToggle(pstnCheckbox)}
                    </Text>
                  </View>
                ) : (
                  <></>
                )}
              </View>
              <PrimaryButton
                disabled={roomTitle === '' || loading}
                onPress={() => createRoom()}
                text={loading ? loadingWithDots : createMeetingButton}
              />
              <HorizontalRule />
              <SecondaryButton
                onPress={() => history.push('/join')}
                text={haveMeetingID}
              />
            </View>
          </View>
        </View>
      ) : (
        <ShareLinkProvider
          value={{
            attendeeUrl: urlView,
            hostUrl: urlHost,
            isSeparateHostLink: hostControlCheckbox,
            pstn,
            joinPhrase,
            roomTitle,
          }}>
          {cmpTypeGuard(ShareLink, share)}
        </ShareLinkProvider>
      )}
    </ScrollView>
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
    marginBottom: '13%',
    marginTop: '7%',
    minHeight: 350,
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
    marginBottom: 20,
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
});

export default Create;
