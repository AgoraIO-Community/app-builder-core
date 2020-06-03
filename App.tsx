import React, { useState } from 'react';
import { View, StyleSheet, TextInput, StatusBar, TouchableOpacity, Text, Platform, Image } from 'react-native';
import { Controls, MaxVideoView, RemoteAudioMute, RemoteVideoMute } from './agora-rn-uikit/Components';
import RtcConfigure from './agora-rn-uikit/src/RTCConfigure';
import { MinUidConsumer } from './agora-rn-uikit/src/MinUidContext';
import { MaxUidConsumer } from './agora-rn-uikit/src/MaxUidContext';
import { PropsProvider, PropsInterface } from './agora-rn-uikit/src/PropsContext';
import images from './src/images';
const App: React.FC<PropsInterface> = () => {
  const [channel, onChangeChannel] = useState();
  const [password, onChangePassword] = useState();
  const [joinCall, setJoinCall] = useState(true);
  const [participantsView, setParticipantsView] = useState(false);
  const [videoCall, setVideoCall] = useState(true);
  const rtcProps = {
    appId: '9383ec2f56364d478cefc38b0a37d8bc',
    channel: channel,
  };
  const callbacks = {
    EndCall: () => setVideoCall(false),
  };
  const startCall = () => {
    rtcProps.channel = channel;
    setJoinCall(false);
  };

  return (
    joinCall ?
      <View style={ Platform.OS === 'web' ? styles.mainContainerWeb : styles.mainContainer }>
        <StatusBar hidden />
        <View style={styles.contentContainer}>
          <Image source={{ uri: images.icons }} style={styles.icons} />
          <Image source={{ uri: images.logo }} style={styles.logo} />
          <TextInput
            style={styles.textBox}
            value={channel}
            onChangeText={(text) => onChangeChannel(text)}
            placeholder="Channel Name"
            placeholderTextColor="#3DAAF8"
            autoCorrect={false}
          />
          <TextInput
            style={styles.textBox}
            value={password}
            onChangeText={(text) => onChangePassword(text)}
            placeholder="Password (Optional)"
            placeholderTextColor="#3DAAF8"
            secureTextEntry={true}
          />
          <TouchableOpacity style={styles.button} onPress={() => startCall()}>
            <Text style={styles.buttonText}>Enter</Text>
          </TouchableOpacity>
        </View>
        {Platform.OS === 'web' ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: images.people }} style={styles.hero} />
          </View>
        ) : <></>
        }
      </View>
        : videoCall ?
  <View style={styles.main}>
    <PropsProvider value={{ rtcProps, callbacks, styleProps }}>
      <RtcConfigure>
        <StatusBar hidden />
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => { setParticipantsView(!participantsView); }} style={styles.participantsButton}>
            <Image source={{ uri: participantIcon }} style={styles.participantIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.videoView}>
          {
            participantsView ?
              <View style={styles.participantsView}>
                <MinUidConsumer>
                  {(minUsers) =>
                    minUsers.map((user) => (user.uid !== 'local' ?
                      <View style={styles.participantContainer} key={user.uid}>
                        <Text style={styles.participantsText}>
                          {user.uid}
                        </Text>
                        <View style={styles.participantsButtonContainer}>
                          <RemoteAudioMute user={user} />
                          <RemoteVideoMute user={user} rightButton={false} />
                        </View>
                      </View> : <></>
                    ))
                  }
                </MinUidConsumer>
                <MaxUidConsumer>
                  {(maxUsers) =>
                    maxUsers.map((user) => (user.uid !== 'local' ?
                      <View style={styles.participantContainer} key={user.uid}>
                        <Text style={styles.participantsText}>
                          {user.uid}
                        </Text>
                        <View style={styles.participantsButtonContainer}>
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
            <MaxUidConsumer>
              {(maxUsers) => (
                <View style={styles.full}>
                  <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid}/>
                </View>
              )}
            </MaxUidConsumer>
            <MinUidConsumer>
              {(minUsers) =>
                minUsers.map((user) => (
                  <View style={styles.full} key={user.uid}>
                    <MaxVideoView user={user} key={user.uid} />
                  </View>
                ))
              }
            </MinUidConsumer>
          </View>
        </View>
        <Controls showButton={false} />
      </RtcConfigure>
    </PropsProvider>
  </View>
  : <View style={styles.main}>
    <StatusBar hidden />
    <Text style={styles.callCompleteText}>Call complete</Text>
    <TouchableOpacity style={styles.buttonDark} onPress={() => {setJoinCall(true); setVideoCall(true);}}>
            <Text style={styles.buttonText}>Back</Text>
    </TouchableOpacity>
    </View>
  );
};

const styles ={
  main: {
    flex: 1,
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
  participantsButton: {
    height: '80%',
    width: 40,
    marginHorizontal: 20,
  },
  videoView: {
    flex: 12,
    backgroundColor: '#333',
    flexDirection: 'column',
  },
  maxVideoContainer: {
    flex: 1,
    margin: 5,
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
  participantsView: {
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
  participantsText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 22 : 17,
    flexDirection: 'row',
    color: '#fff',
    lineHeight: 20,
    paddingLeft: 10,
    alignSelf: 'center',
  },
  participantsMicButton: {
    width: 17,
    height: 17,
    backgroundColor: '#777',
    marginTop: 10,
    marginLeft: 10,
  },
  participantsButtonContainer: {
    flex: 0.3,
    flexDirection: 'row',
    paddingRight: 20,
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
  remoteButton: {
    width: 25,
    height: 25,
    borderRadius: 0,
    borderWidth: 0,
    borderRightWidth: 0,
    backgroundColor: '#6E757D',
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
  callCompleteText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 26 : 22,
    flexDirection: 'row',
    color: '#fff',
    lineHeight: Platform.OS === 'web' ? 26 : 22,
    marginTop: '10%',
    alignSelf: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#009DEC',
  },
  mainContainerWeb: {
    flex: 1,
    backgroundColor: '#009DEC',
    //backgroundImage: 'linear-gradient(0deg, #0076D6, #02BFFC)',
    flexDirection: 'row',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#ff0000',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: '10%',
    alignItems: 'center',
    paddingTop: '4%',
    marginTop: 80,
  },
  buttonText: {
    width: '100%',
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#fff',
  },
  textBox: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#007FD6',
    color: '#fff',
    marginBottom: 15,
    maxWidth: 500,
    minHeight: 40,
  },
  button: {
    width: '100%',
    backgroundColor: '#00C7FE',
    maxWidth: 500,
    minHeight: 40,
  },
  buttonDark: {
    width: '80%',
    backgroundColor: '#6E757D',
    maxWidth: 500,
    //minHeight: 60,
    alignSelf:'center',
    marginBottom:'10%',
  },
  icons: {
    tintColor: '#fff',
    width: 175,
    height: 35,
    alignSelf: 'center',
    margin: 30,
    marginTop: 100,
  },
  logo: {
    tintColor: '#fff',
    width: 177,
    height: 45,
    alignSelf: 'center',
    marginBottom: 40,
  },
  hero: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
};

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
  'remoteBtnStyles': {
    'muteRemoteAudio': styles.remoteButton,
    'muteRemoteVideo': styles.remoteButton,
    'remoteSwap': styles.remoteButton,
    'minCloseBtnStyles': styles.minCloseBtn,
  },
  'BtnStyles': styles.remoteButton,
};

const participantIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABQCAYAAADvCdDvAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAACTwAAAk8B95E4kAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAatSURBVHic7Zzpr11jFId/61RLzVGNIVSooYiEqhgrPphVXFLV8hcgjTQhESF8EaWGkEjKV7SmUDXGPItqKyKtchFCDdUKdSu07n182PvGdbvP3dN6z97nZD/J+fLufdbvXWudPa293iM1NDQ0NDQ09ARW9QTyAkyRdK6k0yUdKekgSbvHmzdL+lbSWklvS3rJzL6rYp49DWDAhcDrwCDZGQReA2YBXffjqyXADGBFjiS040Pg+Kr96Vrio+IaYKtDMob5B7gFaFXtX1cBTAAec0zEaJ4Gdqraz64AGA88FzAZwzwL7FC1v7UHeLADyRhmcdX+1hrgig4mY5h5Vfs9ktrcCgJ7SVonaXKHpTdJmmZmGzusm0id7jZuUueTIUmTJF1fgW4imY8QYIKkvvgzXdIB8abvJa2WtEzSMjPbmncSwN6KnrB3zvtdJ7ZImmJmv+b9Ysi4jCV6CfBVhvPxl8DFBezPD3aFyM7VdYtLkmALuKOAc7eT4+ELeLeAhjdv1S0uScKLSji4MKPGrvg+jRflb2CXusQlSfQSByf7Muic6qDjxclVxyXx8CG6UC1Km1wGFgHjU/Y5zEHHizHn0om4tDuf9Uk6xEH4UEkXpewzyUHHi71TtgePy1gJ8SLN1kRHrbKk3XYHj0u7hMxwFE6z9ZejVln+TNkePC7tErKvo/D+KdtrUbKISZtL8Li0S4hnjYuU7f2OWmX5ImV78Li0S8gPjsJptj6RtM1RryhbJX2ask/wuLRLyEpH4TFtmdmApA8d9YrygZltSdkneFzaJeQZR+Esth531CtKljkEj0viOTF+AForaWpJ0X5JR5vZmKckYJKiam+m0kUABiQdlFbt7URcEo+QuFR8XUlRJF2bloxYb5OkB0vqlWFxltJ7p+Oy/TeLVTSHuS2n1l7AhpI1oiJsJDpCaxmX0cItopJxHoaAhRQoMwPzSjhalDl1j0vSBPqA/gyiXwBptas0rcU5HS3D/d0SlyTx8cBs4GHgM+CP+LMWeCjellbZzaKzA1HPVGiW49CX1am4VApR5+LSgMl4iqZzMR+E6e3dRtPbWw5gOvCBQzLeB46r2p+egOhouQB4hfzrQ14Bzq/ah6zUpnMxK8AB+m8F1VHafgXVN/r/Cqr1FUyzMGOVTkY3f2Uta2xR1CS2SlG9xrdJrEKc4pKveY7szV9Z8WkSq5g4Ll92LC4Ub/7Kyu104To/outX6Lhsf9dHueavNPqBMyuIpwvATGBNwPgsHC3o0fyVxBBwJ7BjRbF0A9gx9iUUfcNCE/C9ZgwzAMzN4OhU4CpgCbCaqPo6/DC4HrgZ2M8hoPvFttbHtrfGWqtj7SuB1J4rYC6wJUC8+oHxAuYEML4ZOHUMp8YBlwPvZbS3jWi9+QLgSGBchsCNi/ddEH93WwadoXhO88bSAE4jqld5M9uAJZI8l3UNSDrPzN5t48zZku6TdEQJjT8lrZH0laTfJP0ej+8haU9Fb/SOVrn1JuskzTezV5M2AjMlvSjft5yPCPjcMcNDwOw2Dkyksws6vXgASOyuJDq7DDlqrRPR6cWLxEZkYDLwkaNOp1kBJC63A+5y1NlsQFojW1bWSDpu9Lvi2JG3JU1z0qmKdZJON7NfRg4SPb1/rKiMUxqvMjSSrkxIxkRJL6j7kyFFPjzPqPcocfnjaqV3aGbCKyFPmtk7CeP3yrdBuWpOkHTP6EEze1NRfao0Xqesk8zsf92HwFmSXnawXUfONLPXRg4AJ0haUdawR0LeMrMzRg4Q3cOvlXR4Sdt15TNJx5jZ4MhB4B1Jp5Ux3FL03FCGhxPGLlPvJkOK/sku6fZ+SUm7m1sq10A8KGl5wnjuNd9dyPyEsWWShkrYXNlSwkUqjwEz2zByAJgqKXU1aw9wCnDwyAEz+1HRLXBR7m6Z2XJJRdsbVyWMnaMufDVcAJN0dsL46oL2bjWz51uSZGY3SLpQ0hvKd01J+jWUuqh1GTMTxvIkZEDS65JmmdmNUoBfMvCxpGO97daUVWbm+pwVomHswAA268oUb4MhErJbAJt1Zff0XfIR4pTlVazsCszMNYZNj2vNaBJSM5qE1IwQCRlM36VncPc1REI2pO/SM/zkbTBEQjz/7aDufORtMERClgawWVce9TYY4jmkpeiXM93bds1YKelEMytTbt8O9yMknuCl6u1ryQZJl3onQwp022tmX0s6Scnl+W5npaIegm9CGA/63iI+fc1R1Ko6Q9I+klL7cmvGoKSfFZ2Gl0p6IsSR0dDQ0NDQ0NBj/AtyxIlmNwu9yAAAAABJRU5ErkJggg==';

export default App;
