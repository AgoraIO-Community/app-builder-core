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
import React, {useState, useContext, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import TextInput from '../atoms/TextInput';
import PrimaryButton from '../atoms/PrimaryButton';
import {
  MaxUidConsumer,
  MaxVideoView,
  LocalAudioMute,
  LocalVideoMute,
  LocalUserContext,
  PropsContext,
  ClientRole,
} from '../../agora-rn-uikit';
import SelectDevice from '../subComponents/SelectDevice';
import Logo from '../subComponents/Logo';
import hasBrandLogo from '../utils/hasBrandLogo';
import ColorContext from './ColorContext';
import Error from '../subComponents/Error';

const JoinRoomInputView = (props: any) => {
  const {
    username,
    setUsername,
    queryComplete,
    setCallActive,
    buttonText,
    error,
  } = props;

  return (
    <View style={style.btnContainer}>
      <TextInput
        value={username}
        onChangeText={(text) => {
          setUsername(text);
        }}
        onSubmitEditing={() => {}}
        placeholder={queryComplete ? 'Display name*' : 'Getting name...'}
        editable={queryComplete && !error}
      />
      <View style={{height: 20}} />
      <PrimaryButton
        onPress={() => setCallActive(true)}
        disabled={!queryComplete || username.trim() === '' || error}
        text={queryComplete ? buttonText : 'Loading...'}
      />
    </View>
  );
};

const Precall = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const {rtcProps} = useContext(PropsContext);

  const {queryComplete, error, title} = props;
  const [buttonText, setButtonText] = React.useState('Join Room');

  const [dim, setDim] = useState<[number, number]>([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
  ]);

  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (title) {
        document.title = title + ' | ' + $config.APP_NAME;
      }
    }
  });

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

  const isMobileView = () => dim[0] < dim[1] + 150;

  if (!queryComplete) return <Text style={style.titleFont}>Loading..</Text>;

  const brandHolder = () => (
    <View style={style.nav}>
      {hasBrandLogo && <Logo />}
      {error && <Error error={error} showBack={true} />}
    </View>
  );

  const meetingTitle = () => (
    <>
      <Text style={[style.titleHeading, {color: $config.PRIMARY_COLOR}]}>
        {title}
      </Text>
      <View style={{height: 50}} />
    </>
  );

  return (
    <View style={style.main} onLayout={onLayout}>
      {/* Precall screen only changes for audience in Live Stream event */}
      {$config.EVENT_MODE && rtcProps.role == ClientRole.Audience ? (
        <View style={style.preCallContainer}>
          {brandHolder()}
          {meetingTitle()}
          <JoinRoomInputView {...props} buttonText={buttonText} />
        </View>
      ) : (
        <>
          {brandHolder()}
          <View style={style.content}>
            <View style={style.upperContainer}>
              <View
                style={[
                  style.leftContent,
                  isMobileView() ? {paddingRight: 0} : {paddingRight: 40},
                ]}>
                <MaxUidConsumer>
                  {(maxUsers) => (
                    <View style={{borderRadius: 10, flex: 1}}>
                      <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
                    </View>
                  )}
                </MaxUidConsumer>
                <View style={style.precallControls}>
                  <LocalUserContext>
                    <View style={{alignSelf: 'center'}}>
                      <LocalVideoMute />
                    </View>
                    <View style={{alignSelf: 'center'}}>
                      <LocalAudioMute />
                    </View>
                  </LocalUserContext>
                </View>
                <View style={{marginBottom: '10%'}}>
                  {/* This view is visible only on MOBILE view */}
                  {isMobileView() && (
                    <JoinRoomInputView {...props} buttonText={buttonText} />
                  )}
                </View>
              </View>
              {/* This view is visible only on WEB view */}
              {!isMobileView() && (
                <View style={style.rightContent}>
                  {meetingTitle()}
                  <View
                    style={[{shadowColor: primaryColor}, style.precallPickers]}>
                    <Text style={style.subHeading}>Select Input Device</Text>
                    <View
                      style={{
                        flex: 1,
                        maxWidth: Platform.OS === 'web' ? '25vw' : 'auto',
                        marginVertical: 30,
                      }}>
                      <SelectDevice />
                    </View>
                    <View style={{width: '100%'}}>
                      <JoinRoomInputView {...props} buttonText={buttonText} />
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  full: {flex: 1},
  main: {
    flex: 2,
    // justifyContent: 'space-evenly',
    marginHorizontal: '10%',
    minHeight: 500,
  },
  preCallContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 350,
    justifyContent: 'space-between',
    marginTop: '15%',
  },
  nav: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {flex: 6, flexDirection: 'column'},
  leftContent: {
    flex: 1.3,
    height: '100%',
  },
  upperContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 3,
  },
  rightContent: {
    flex: 1,
    height: '70%',
    backgroundColor: $config.SECONDARY_FONT_COLOR + '25',
    paddingLeft: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: $config.PRIMARY_COLOR,
    justifyContent: 'center',
  },
  titleFont: {
    textAlign: 'center',
    fontSize: 20,
    color: $config.PRIMARY_FONT_COLOR,
  },
  titleHeading: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
  },
  btnContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  precallControls: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 10,
    width: '40%',
    justifyContent: 'space-around',
    marginVertical: '5%',
  },
  precallPickers: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-around',
    marginBottom: '10%',
    height: '35%',
    minHeight: 280,
  },
});

export default Precall;
