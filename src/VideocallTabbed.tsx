/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, Platform, Image, Dimensions, ScrollView } from 'react-native';
import {LocalControls, MinVideoView, MaxVideoView, RemoteAudioMute, RemoteVideoMute} from './agora-rn-uikit/Components';
import RtcConfigure from './agora-rn-uikit/src/RTCConfigure';
import { MinUidConsumer } from './agora-rn-uikit/src/MinUidContext';
import { MaxUidConsumer } from './agora-rn-uikit/src/MaxUidContext';
import { PropsProvider, PropsInterface } from './agora-rn-uikit/src/PropsContext';
import RtcContext from './agora-rn-uikit/src/RtcContext';
const { width } = Dimensions.get('window');

const App: React.FC<PropsInterface> = () => {
  RtcContext.Provider;
  const [participantsView, setParticipantsView] = useState(false);
  const [videoCall, setVideoCall] = useState(true);
  const rtcProps = {
    appId: '9383ec2f56364d478cefc38b0a37d8bc',
    channel: 'channel-x',
  };
  const callbacks = {
    EndCall: () => setVideoCall(false),
  };

  return (videoCall ?
    <View style={styles.main}>
      <PropsProvider value={{ rtcProps, callbacks, styleProps }}>
        <RtcConfigure>
          <StatusBar hidden />
          <View style={styles.navbar}>
            <TouchableOpacity onPress={() => { setParticipantsView(!participantsView); }} style={styles.participantButton}>
              <Image source={{ uri: participantIcon }} style={styles.participantIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.videoView}>
            {
              participantsView ?
                <View style={styles.participantView}>
                  <MinUidConsumer>
                    {(minUsers) =>
                      minUsers.map((user) => (user.uid !== 'local' ?
                        <View style={styles.participantContainer}>
                          <Text style={styles.participantText}>
                            {user.uid}
                          </Text>
                          <View style={styles.participantButtonContainer}>
                            <RemoteAudioMute user={user} />
                            <RemoteVideoMute user={user} rightButton={true} />
                          </View>
                        </View> : <></>
                      ))
                    }
                  </MinUidConsumer>
                  <MaxUidConsumer>
                    {(maxUsers) =>
                      maxUsers.map((user) => (user.uid !== 'local' ?
                        <View style={styles.participantContainer}>
                          <Text style={styles.participantText}>
                            {user.uid}
                          </Text>
                          <View style={styles.participantButtonContainer}>
                            <RemoteAudioMute user={user} />
                            <RemoteVideoMute user={user} rightButton={false} />
                          </View>
                        </View> : <></>
                      ))
                    }
                  </MaxUidConsumer>
                </View>
                : <></>
            }
            <View style={styles.full}>
              <View style={styles.videoViewInner}>
                <View style={styles.full}>
                  <MaxUidConsumer>
                    {(maxUsers) => (
                      <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
                    )}
                  </MaxUidConsumer>
                </View>
              </View>
              <View style={styles.participantCount}>
                <View style={styles.participantCountInner}>
                  <MinUidConsumer>
                    {minUsers => (
                      <Text style={styles.participantCountText}>+{minUsers.length}</Text>
                    )}
                  </MinUidConsumer>
                </View>
                <ScrollView horizontal={true} decelerationRate={0}
                  snapToInterval={width / 2} snapToAlignment={'center'} style={styles.full}>
                  <RtcContext.Consumer>
                    {(data) => (
                      <MinUidConsumer>
                        {(minUsers) => minUsers.map((user) => (
                          <TouchableOpacity style={styles.remoteViewTouchable}
                            onPress={() => { data.dispatch({ type: 'SwapVideo', value: [user] }); }}>
                            <View style={styles.full}>
                              <MinVideoView user={user} key={user.uid} showOverlay={false} />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </MinUidConsumer>
                    )}
                  </RtcContext.Consumer>
                </ScrollView>
              </View>
            </View>
          </View>
          <LocalControls />
        </RtcConfigure>
      </PropsProvider>
    </View >
    : <View style={styles.full}>
      <StatusBar hidden />
      <Text style={styles.callCompleteText}>Call complete</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  main:{
    flex:1,
    backgroundColor: '#333',
    flexDirection: 'column',
  },
  full: {
    flex: 1,
  },
  navbar: {
    flex: 1,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  participantIcon: {
    flex: 1,
    margin: 4,
    resizeMode: 'contain',
  },
  participantButton: {
    height: '80%',
    width: 40,
    marginHorizontal: 20,
  },
  videoView: {
    flex: 12,
    backgroundColor: '#333',
    flexDirection: 'column',
  },
  videoViewInner: {
    flex:8,
  },
  bottomBar: {
    flex: 2,
    paddingHorizontal: '1%',
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'relative',
    margin: 0,
    bottom: 0,
  },
  temp: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  bottomBarButton: {
    height: '70%',
    width: 60,
    backgroundColor: '#6D767D',
  },
  participantView: {
    width: Platform.OS === 'web' ? '25%' : '50%',
    height: '100%',
    backgroundColor: '#6E757D',
    zIndex: 20,
    position: 'absolute',
  },
  participantContainer: {
    flexDirection: 'row',
    flex: 0.1, backgroundColor: '#6E757D',
    height: '15%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 22 : 17,
    flexDirection: 'row',
    color: '#fff',
    lineHeight: 20,
    paddingLeft: 10,
    alignSelf: 'center',
  },
  participantCountText: {
    fontSize: 22,
    lineHeight: width / 7.5,
    color: '#ABABAB',
  },
  participantMicButton: {
    width: 17,
    height: 17,
    backgroundColor: '#777',
    marginTop: 10,
    marginLeft: 10,
  },
  participantButtonContainer: {
    flex: 0.3,
    flexDirection: 'row',
    paddingRight: 20,
    alignSelf: 'center',
  },
  participantCount: {
    flex: 2,
    backgroundColor: '#121116',
    flexDirection: 'row',
  },
  participantCountInner: {
    width: width / 7.5,
		height: width / 7.5,
		backgroundColor: '#444',
		borderRadius: width / 6,
		alignItems: 'center',
		marginHorizontal: 15,
    alignSelf: 'center',
  },
  localButton: {
    backgroundColor: '#6E757D',
    borderRadius: 5,
    borderColor: '#6E757D',
  },
  endCall: {
    backgroundColor: '#F86051',
    borderRadius: 5,
    borderColor: '#F86051',
    width: 46,
    height: 46,
  },
  remoteViewTouchable:{
    width: width / 4.5,
    borderRadius: 10,
    borderColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth * 3,
    marginHorizontal: 2,
    marginVertical: 10,
    zIndex: 40,
  },
  remoteButton: {
    width: 25,
    height: 25,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    marginHorizontal: 0,
  },
  minCloseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 25,
    height: 25,
    borderRadius: 0,
    position: 'absolute',
    right: 5,
    top: 5,
  },
  remoteBtnContainer: {
    bottom: 0,
    position: 'absolute',
    marginVertical: 0,
    marginBottom: 5,
  },
  callCompleteText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 26 : 22,
    flexDirection: 'row',
    color: '#fff',
    lineHeight: Platform.OS === 'web' ? 26 : 22,
    marginTop: '10%',
    alignSelf: 'center',
  },
});

const styleProps = {
  'maxViewStyles': styles.temp,
  'minViewStyles': styles.temp,
  'localBtnContainer': styles.bottomBar,
  'localBtnStyles': {
    'muteLocalAudio': styles.localButton,
    'muteLocalVideo': styles.localButton,
    'switchCamera': styles.localButton,
    'endCall': styles.endCall,
    'fullScreen': styles.localButton,
  },
  'remoteBtnContainer': styles.remoteBtnContainer,
  'remoteBtnStyles': {
    'muteRemoteAudio': styles.remoteButton,
    'muteRemoteVideo': styles.remoteButton,
    'remoteSwap': styles.remoteButton,
    'minCloseBtnStyles': styles.minCloseBtn,
  },
  'BtnStyles': styles.remoteButton,
};

const participantIcon = 'data:image/png;base64,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';

export default App;
