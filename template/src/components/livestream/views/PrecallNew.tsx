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
import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import TextInput from '../../../atoms/TextInput';
import PrimaryButton from '../../../atoms/PrimaryButton';
import {
  MaxUidConsumer,
  MaxVideoView,
  LocalAudioMute,
  LocalVideoMute,
  LocalUserContext,
  PropsContext,
} from '../../../../agora-rn-uikit';
import SelectDevice from '../../../subComponents/SelectDevice';
import Logo from '../../../subComponents/Logo';
import hasBrandLogo from '../../../utils/hasBrandLogo';
import ColorContext from '../../ColorContext';
import Error from '../../../subComponents/Error';
import {mode, role} from '../../../../agora-rn-uikit/src/Contexts/PropsContext';

const JoinRoomInputView = (props: any) => {
  const {username, setUsername, queryComplete, setCallActive} = props;
  return (
    <View style={style.btnContainer}>
      <TextInput
        value={username}
        onChangeText={(text) => {
          setUsername(text);
        }}
        onSubmitEditing={() => {}}
        placeholder={queryComplete ? 'Display name*' : 'Getting name...'}
        editable={queryComplete}
      />
      <View style={{height: 20}} />
      <PrimaryButton
        onPress={() => setCallActive(true)}
        disabled={!queryComplete || username.trim() === ''}
        text={queryComplete ? 'Join Room' : 'Loading...'}
      />
    </View>
  );
};

const PrecallNew = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const {rtcProps} = useContext(PropsContext);

  const {queryComplete, error, title} = props;

  const [dim, setDim] = useState<Array<number>>([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
  ]);

  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };

  const isMobileView = () => dim[0] < dim[1] + 150;
  const isAudienceView = () => rtcProps.role === role.Audience;
  const isLiveEvent = () => rtcProps.mode === mode.Live;

  if (!queryComplete) return <Text style={style.titleFont}>Loading..</Text>;

  return (
    <View style={style.main} onLayout={onLayout}>
      {/* Precall screen only changes for audience in Live Stream event */}
      {isLiveEvent() && isAudienceView() ? (
        <View style={style.preCallContainer}>
          <Text style={style.titleFont}>Join meeting ::: {title}</Text>
          <View style={{height: 50}} />
          <JoinRoomInputView {...props} />
        </View>
      ) : (
        <>
          <View style={style.nav}>
            <Text style={style.titleFont}>Join meeting ::: {title}</Text>
            {hasBrandLogo && <Logo />}
            {error && <Error error={error} showBack={true} />}
          </View>
          <View style={style.content}>
            <View style={style.upperContainer}>
              <View style={style.leftContent}>
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
                  {isMobileView() && <JoinRoomInputView {...props} />}
                </View>
              </View>
              {/* This view is visible only on WEB view */}
              {!isMobileView() && (
                <View style={style.rightContent}>
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
                      <JoinRoomInputView {...props} />
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
    justifyContent: 'space-evenly',
    marginHorizontal: '10%',
  },
  preCallContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 200,
    justifyContent: 'space-between',
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
    padding: '10px 50px',
    flex: 3,
  },
  rightContentContainer: {
    display: 'flex',
    flex: 1,
  },
  rightContent: {
    flex: 1,
    height: '70%',
    backgroundColor: $config.SECONDARY_FONT_COLOR + '25',
    padding: 20,
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
  subHeading: {
    fontSize: 28,
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

export default PrecallNew;
