import React, {useState} from 'react';
import {View, Platform, Text, StyleSheet, TouchableOpacity} from 'react-native';
import ChatContainer from '../subComponents/ChatContainer';
import ChatInput from '../subComponents/ChatInput';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';

const Chat = () => {
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
    console.log(user);
    setSelectedUser(user);
    setPrivateActive(true);
    // setGroupActive(false);
    console.log(privateActive);
  };
  return (
    // <View style={Platform.OS === 'web' ? styles.chatWeb : styles.chatNative}>
    <View style={style.participantView}>
      <View style={style.heading}>
        <Text style={style.headingText}>Chats</Text>
      </View>
      <View style={style.chatNav}>
        <TouchableOpacity
          onPress={selectGroup}
          style={groupActive ? style.groupActive : style.group}>
          <Text style={groupActive ? style.groupTextActive : style.groupText}>
            Group
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={selectPrivate}
          style={!groupActive ? style.privateActive : style.private}>
          <Text style={!groupActive ? style.groupTextActive : style.groupText}>
            Private
          </Text>
        </TouchableOpacity>
      </View>
      {groupActive ? (
        <>
          <ChatContainer privateActive={privateActive} />
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
                              {user.uid}
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
              />
              <ChatInput
                privateActive={privateActive}
                selectedUser={selectedUser}
              />
            </>
          )}
        </>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  participantView: {
    position: 'absolute',
    zIndex: 5,
    width: '20%',
    height: '92%',
    minWidth: 200,
    maxWidth: 400,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  heading: {
    backgroundColor: '#fff',
    width: '100%',
    height: '7%',
    paddingLeft: 20,
  },
  headingText: {
    marginVertical: 'auto',
    fontWeight: '700',
    color: '#333',
    fontSize: 25,
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
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#099DFD',
    height: '100%',
    textAlign: 'center',
  },
  group: {
    backgroundColor: '#fff',
    flex: 1,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderTopColor: '#B4E1FF',
    borderRightWidth: 2,
    borderColor: '#099DFD',
    height: '100%',
    textAlign: 'center',
  },
  privateActive: {
    backgroundColor: '#fff',
    // borderBottomWidth: 2,
    borderTopWidth: 2,
    // borderTopColor: '#B4E1FF',
    borderColor: '#099DFD',
    flex: 1,
    height: '100%',
    textAlign: 'center',
  },
  private: {
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderTopColor: '#B4E1FF',
    borderColor: '#099DFD',
    flex: 1,
    height: '100%',
    // paddingLeft: 20,
    textAlign: 'center',
  },
  groupTextActive: {
    marginVertical: 'auto',
    fontWeight: '700',
    color: '#333',
    fontSize: 16,
    justifyContent: 'center',
  },
  groupText: {
    marginVertical: 'auto',
    fontWeight: '700',
    color: '#C1C1C1',
    fontSize: 16,
    justifyContent: 'center',
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
});

export default Chat;
