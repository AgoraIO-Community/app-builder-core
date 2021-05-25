import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import LocalAudioMute from '../subComponents/LocalAudioMute';
import LocalVideoMute from '../subComponents/LocalVideoMute';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import RemoteAudioMute from '../subComponents/RemoteAudioMute';
import RemoteVideoMute from '../subComponents/RemoteVideoMute';
import RemoteEndCall from '../subComponents/RemoteEndCall';
import chatContext from './ChatContext';
import Clipboard from '../subComponents/Clipboard';
import ColorContext from './ColorContext';
import {gql, useQuery} from '@apollo/client';
import icons from '../assets/icons';
import platform from '../subComponents/Platform';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {UserType} from './RTMConfigure';

const ParticipantView = (props: any) => {
  const {userList, localUid} = useContext(chatContext);
  const {primaryColor} = useContext(ColorContext);

  return (
    <View
      style={
        Platform.OS === 'web'
          ? style.participantView
          : style.participantViewNative
      }>
      <TouchableOpacity
        style={style.backButton}
        onPress={() => props.setSidePanel(SidePanelType.None)}>
        {/* <Image
          resizeMode={'contain'}
          style={style.backIcon}
          source={{uri: icons.backBtn}}
        /> */}
        <Text style={style.heading}>Participants</Text>
      </TouchableOpacity>
      <MinUidConsumer>
        {(minUsers) => (
          <MaxUidConsumer>
            {(maxUser) =>
              [...minUsers, ...maxUser].map((user) =>
                user.uid === 'local' ? (
                  <View style={style.participantContainer} key={user.uid}>
                    <Text style={style.participantText}>
                      {userList[localUid]
                        ? userList[localUid].name + ' '
                        : 'You '}
                    </Text>
                    <View style={style.participantButtonContainer}>
                      <LocalUserContext>
                        <LocalAudioMute />
                        <LocalVideoMute />
                      </LocalUserContext>
                    </View>
                  </View>
                ) : user.uid === 1 ? (
                  <View style={style.participantContainer} key={user.uid}>
                    <Text style={style.participantText}>
                      {userList[localUid]
                        ? userList[localUid].name + "'s screenshare "
                        : 'Your screenshare '}
                    </Text>
                  </View>
                ) : (
                  <View style={style.participantContainer} key={user.uid}>
                    <Text style={style.participantText}>
                      {userList[user.uid]
                        ? userList[user.uid].name + ' '
                        : 'User '}
                    </Text>
                    {userList[user.uid].type !== UserType.ScreenShare ? (
                      <View style={style.participantButtonContainer}>
                        <RemoteAudioMute
                          uid={user.uid}
                          audio={user.audio}
                          isHost={props.isHost}
                        />
                        <RemoteVideoMute
                          uid={user.uid}
                          video={user.video}
                          isHost={props.isHost}
                        />
                        <RemoteEndCall uid={user.uid} isHost={props.isHost} />
                      </View>
                    ) : (
                      <></>
                    )}
                  </View>
                ),
              )
            }
          </MaxUidConsumer>
        )}
      </MinUidConsumer>
    </View>
  );
};

const style = StyleSheet.create({
  participantView: {
    width: '20%',
    minWidth: 200,
    maxWidth: 300,
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 20,
    shadowColor: $config.tertiaryFontColor,
    shadowOpacity: 0.5,
    shadowOffset: {width: -2, height: 0},
    shadowRadius: 3,
    // borderLeftColor: $config.tertiaryFontColor,
    // borderLeftWidth: 1
  },
  participantViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    top: 0,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    // textAlign: 'center',
    color: '#333',
  },
  participantContainer: {
    flexDirection: 'row',
    flex: 0.07,
    backgroundColor: '#fff',
    height: '15%',
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 20 : 16,
    fontWeight: '500',
    flexDirection: 'row',
    color: '#333',
    lineHeight: 20,
    paddingLeft: 10,
    alignSelf: 'center',
  },
  participantButtonContainer: {
    // flex: 0.3,
    flexDirection: 'row',
    paddingRight: 10,
    alignSelf: 'center',
    alignItems: 'center',
  },
  secondaryBtn: {
    alignSelf: 'center',
    width: '60%',
    borderColor: $config.primaryColor,
    borderWidth: 3,
    maxWidth: 400,
    minHeight: 42,
    minWidth: 200,
    marginTop: 'auto',
  },
  secondaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    textAlignVertical: 'center',
    color: $config.primaryColor,
  },
  backButton: {
    // marginLeft: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  backIcon: {
    width: 20,
    height: 12,
    alignSelf: 'center',
    justifyContent: 'center',
    tintColor: '#333',
  },
});

export default ParticipantView;
