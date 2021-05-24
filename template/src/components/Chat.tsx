import React, {useState, useContext} from 'react';
import {
  View,
  Platform,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import ChatContainer from '../subComponents/ChatContainer';
import ChatInput from '../subComponents/ChatInput';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import icons from '../assets/icons';
import ColorContext from './ColorContext';
import chatContext from './ChatContext';

const Chat = (props: any) => {
  const {userList, localUid} = useContext(chatContext);
  const {primaryColor} = useContext(ColorContext);
  const [groupActive, setGroupActive] = useState(true);
  const [privateActive, setPrivateActive] = useState(false);
  const [selectedUser, setSelectedUser] = useState({uid: null});
  const selectGroup = () => {
    setPrivateActive(false);
    setGroupActive(true);
  };
  const selectPrivate = () => {
    setGroupActive(false);
  };
  const selectUser = (user: any) => {
    setSelectedUser(user);
    setPrivateActive(true);
  };
  return (
    // <View 
    <KeyboardAvoidingView
      behavior={'padding'}
    style={Platform.OS === 'web' ? style.chatView : style.chatViewNative}>
      {/* <View style={style.heading}>
        <TouchableOpacity
          style={style.backButton}
          onPress={() => setChatDisplayed(false)}>
          <Image
            resizeMode={'contain'}
            style={style.backIcon}
            source={{uri: icons.backBtn}}
          />
          <Text style={style.headingText}>Chats</Text>
        </TouchableOpacity>
      </View> */}
      <View style={style.chatNav}>
        <TouchableOpacity
          onPress={selectGroup}
          style={
            groupActive
              ? [style.groupActive, {borderColor: primaryColor}]
              : [
                  style.group,
                  {
                    borderColor: primaryColor,
                    borderTopColor: primaryColor + '80',
                  },
                ]
          }>
          <Text style={groupActive ? style.groupTextActive : style.groupText}>
            Group
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={selectPrivate}
          style={
            !groupActive
              ? [style.privateActive, {borderColor: primaryColor}]
              : [
                  style.private,
                  {
                    borderColor: primaryColor,
                    borderTopColor: primaryColor + '80',
                  },
                ]
          }>
          <Text style={!groupActive ? style.groupTextActive : style.groupText}>
            Private
          </Text>
        </TouchableOpacity>
      </View>
      {groupActive ? (
        <>
          <ChatContainer privateActive={privateActive} />
          <View style={{ backgroundColor: $config.primaryFontColor + '80', width: '100%', height: 1, marginHorizontal: -20, alignSelf: 'center', opacity: 0.5 }} />
          <ChatInput privateActive={privateActive} />
        </>
      ) : (
        <>
          {!privateActive ? (
            <MinUidConsumer>
              {(minUsers) => (
                <MaxUidConsumer>
                  {(maxUser) =>
                    [...minUsers, ...maxUser].map((user) => {
                      if (user.uid !== 'local') {
                        return (
                          <TouchableOpacity
                            style={style.participantContainer}
                            key={user.uid}
                            onPress={() => selectUser(user)}>
                            <Text style={style.participantText}>
                              {userList[user.uid]
                                ? userList[user.uid].name + ' '
                                : 'User '}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                    })
                  }
                </MaxUidConsumer>
              )}
            </MinUidConsumer>
          ) : (
            <>
              <ChatContainer
                privateActive={privateActive}
                setPrivateActive={setPrivateActive}
                selectedUser={selectedUser}
                selectedUsername={
                  userList[selectedUser.uid]
                    ? userList[selectedUser.uid].name + ' '
                    : 'User '
                }
              />
              <View style={{ backgroundColor: $config.primaryFontColor + '80', width: '100%', height: 1, marginHorizontal: -20, alignSelf: 'center', opacity: 0.5 }} />
              <ChatInput
                privateActive={privateActive}
                selectedUser={selectedUser}
              />
            </>
          )}
        </>
      )}
    {/* </View> */}
    </KeyboardAvoidingView>
  );
};

const style = StyleSheet.create({
  chatView: {
    width: '20%',
    minWidth: 200,
    maxWidth: 300,
    backgroundColor: '#fff',
    flex: 1,
    // paddingTop: 20,
    shadowColor:  $config.tertiaryFontColor,
    shadowOpacity: .5,
    shadowOffset: {width:-2, height: 0},
    shadowRadius: 3
  },
  chatViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    // flex: 1,
    right: 0,
    top: 0,
    backgroundColor: '#fff',
  },
  heading: {
    backgroundColor: '#fff',
    width: 150,
    height: '7%',
    paddingLeft: 20,
    flexDirection: 'row',
  },
  headingText: {
    flex: 1,
    paddingLeft: 5,
    marginVertical: 'auto',
    fontWeight: '700',
    color: '#333',
    fontSize: 25,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  chatNav: {
    flexDirection: 'row',
    height: '6%',
    // marginBottom: 15,
  },
  groupActive: {
    backgroundColor: '#fff',
    flex: 1,
    height: '100%',
    textAlign: 'center',
  },
  group: {
    backgroundColor: '#f1f4f9',
    flex: 1,
    height: '100%',
    textAlign: 'center',
    borderBottomRightRadius: 10,
  },
  privateActive: {
    backgroundColor: '#fff',
    flex: 1,
    height: '100%',
    textAlign: 'center',
  },
  private: {
    backgroundColor: '#f1f4f9',
    flex: 1,
    height: '100%',
    textAlign: 'center',
    borderBottomLeftRadius: 10,
  },
  groupTextActive: {
    marginVertical: 'auto',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  groupText: {
    marginVertical: 'auto',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 5,
    justifyContent: 'center',
    color: '#B9B9B9',
  },
  participantContainer: {
    flexDirection: 'row',
    flex: 0.07,
    // marginTop: 5,
    backgroundColor: '#fff',
    height: '15%',
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantText: {
    flex: 1,
    fontSize: 18,
    fontWeight: Platform.OS === 'web' ? '500' : '700',
    flexDirection: 'row',
    color: '#333',
    lineHeight: 20,
    paddingLeft: 10,
    alignSelf: 'center',
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

export default Chat;
