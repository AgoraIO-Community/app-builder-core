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
import React, {useContext, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {MaxUidContext} from '../../agora-rn-uikit';
import {MaxVideoView} from '../../agora-rn-uikit';
import {
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
  ClientRole,
  PropsContext,
} from '../../agora-rn-uikit';
import {LocalUserContext} from '../../agora-rn-uikit';
import {RtcContext} from '../../agora-rn-uikit';
import TextInput from '../atoms/TextInput';
import Error from '../subComponents/Error';
import PrimaryButton from '../atoms/PrimaryButton';

const Precall = (props: any) => {
  const maxUsers = useContext(MaxUidContext);
  const rtc = useContext(RtcContext);
  const {rtcProps} = useContext(PropsContext);
  rtc.RtcEngine.startPreview();

  const {setCallActive, queryComplete, username, setUsername, error, title} =
    props;

  const [buttonText, setButtonText] = React.useState('Join Room');

  useEffect(() => {
    let clientRole = '';
    if (rtcProps?.role == 1) {
      clientRole = 'Host';
    }
    if (rtcProps?.role == 2) {
      clientRole = 'Audience';
    }
    setButtonText(
      $config.EVENT_MODE ? `Join Room as ${clientRole}` : `Join Room`,
    );
  }, [rtcProps?.role]);

  const isAudienceInLiveStreaming = () =>
    $config.EVENT_MODE && rtcProps?.role == ClientRole.Audience;

  const meetingTitle = () => (
    <>
      <Text style={[style.titleHeading, {color: $config.PRIMARY_COLOR}]}>
        {title}
      </Text>
      <View style={{height: 25}} />
    </>
  );

  return (
    <View style={style.full}>
      <View style={style.heading}>
        <Text style={style.headingText}>Precall </Text>
      </View>
      <View
        style={{
          zIndex: 50,
          position: 'absolute',
          width: '100%',
          left: '18%',
          top: 10,
          alignSelf: 'center',
        }}>
        {error ? <Error error={error} showBack={true} /> : <></>}
      </View>
      {meetingTitle()}
      {!isAudienceInLiveStreaming() && (
        <View style={style.full}>
          <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
        </View>
      )}
      <View style={style.textInputHolder}>
        <TextInput
          value={username}
          onChangeText={(text) => {
            setUsername(text);
          }}
          onSubmitEditing={() => {}}
          placeholder={queryComplete ? 'Display name*' : 'Getting name...'}
          editable={queryComplete}
        />
      </View>
      <View style={{height: 20}} />
      {!isAudienceInLiveStreaming() && (
        <View style={style.controls}>
          <LocalUserContext>
            <View style={style.width50}>
              <LocalVideoMute />
            </View>
            <View style={style.width50} />
            <View style={style.width50}>
              <LocalAudioMute />
            </View>
            <View style={style.width50} />
            <View style={style.width50}>
              <SwitchCamera />
            </View>
          </LocalUserContext>
        </View>
      )}
      <View style={{marginBottom: 50, alignItems: 'center'}}>
        <PrimaryButton
          text={buttonText}
          disabled={!queryComplete || username.trim() === ''}
          onPress={() => setCallActive(true)}
        />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  full: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: 'center',
  },
  heading: {flex: 0.1, justifyContent: 'center'},
  headingText: {
    fontSize: 24,
    color: $config.PRIMARY_FONT_COLOR,
    fontWeight: '700',
    alignSelf: 'center',
  },
  textInputHolder: {
    flex: 0.1,
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
  },
  textInput: {
    width: '80%',
    paddingLeft: 8,
    borderColor: $config.PRIMARY_COLOR,
    borderWidth: 2,
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 16,
    minHeight: 45,
    alignSelf: 'center',
  },
  controls: {
    flex: 0.2,
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 5,
  },
  width50: {width: 50},
  buttonActive: {
    backgroundColor: $config.PRIMARY_COLOR,
    height: 50,
    width: 180,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  buttonDisabled: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    height: 50,
    width: 180,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  buttonText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
  titleHeading: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
});

export default Precall;
