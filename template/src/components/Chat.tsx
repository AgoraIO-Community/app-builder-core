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
import {
  View,
  Platform,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import ChatContainer from '../subComponents/ChatContainer';
import ChatInput from '../subComponents/ChatInput';
import ChatParticipants from '../subComponents/chat/ChatParticipants';
import ColorContext from './ColorContext';
import chatContext from './ChatContext';

const Chat = (props: any) => {
  const {height, width} = useWindowDimensions();
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isSmall = dim[0] < 700;

  const {userList} = useContext(chatContext);

  const {
    setChatDisplayed,
    pendingPrivateNotification,
    pendingPublicNotification,
    lastCheckedPrivateState,
    privateMessageCountMap,
    setPrivateMessageLastSeen,
    setPrivateChatDisplayed,
  } = props;
  const {primaryColor} = useContext(ColorContext);
  const [groupActive, setGroupActive] = useState(true);
  const [privateActive, setPrivateActive] = useState(false);
  const [selectedUserID, setSelectedUser] = useState('');

  //Initally private state should be false
  useEffect(() => {
    setPrivateChatDisplayed(false);
  }, []);

  useEffect(() => {
    if (privateActive && selectedUserID) {
      setPrivateMessageLastSeen({
        userId: selectedUserID,
        lastSeenCount: privateMessageCountMap[selectedUserID],
      });
    }
  }, [pendingPrivateNotification]);

  const selectGroup = () => {
    setPrivateActive(false);
    setGroupActive(true);
    setPrivateChatDisplayed(false);
  };
  const selectPrivate = () => {
    setGroupActive(false);
    setPrivateChatDisplayed(true);
  };
  const selectUser = (userUID: any) => {
    setSelectedUser(userUID);
    setPrivateActive(true);
  };

  return (
    <View
      style={
        Platform.OS === 'web'
          ? !isSmall
            ? style.chatView
            : style.chatViewNative
          : style.chatViewNative
      }>
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
          {pendingPublicNotification !== 0 ? (
            <View style={style.chatNotification}>
              <Text>{pendingPublicNotification}</Text>
            </View>
          ) : null}
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
          {pendingPrivateNotification !== 0 ? (
            <View style={style.chatNotification}>
              <Text>{pendingPrivateNotification}</Text>
            </View>
          ) : null}
          <Text style={!groupActive ? style.groupTextActive : style.groupText}>
            Private
          </Text>
        </TouchableOpacity>
      </View>
      {groupActive ? (
        <>
          <ChatContainer privateActive={privateActive} />
          <View style={[style.chatInputLineSeparator, {marginBottom: 0}]} />
          <View>
            <View style={style.chatInputContainer}>
              <View style={[style.chatInputLineSeparator, {opacity: 0.3}]} />
              <ChatInput privateActive={privateActive} />
            </View>
          </View>
        </>
      ) : (
        <>
          {!privateActive ? (
            <ChatParticipants
              selectUser={selectUser}
              setPrivateMessageLastSeen={setPrivateMessageLastSeen}
              privateMessageCountMap={privateMessageCountMap}
              lastCheckedPrivateState={lastCheckedPrivateState}
            />
          ) : (
            <>
              <ChatContainer
                privateActive={privateActive}
                setPrivateActive={setPrivateActive}
                selectedUserID={selectedUserID}
                selectedUsername={
                  userList[selectedUserID]
                    ? userList[selectedUserID]?.name + ' '
                    : 'User '
                }
              />
              <View style={[style.chatInputLineSeparator, {marginBottom: 0}]} />
              <View>
                <View style={style.chatInputContainer}>
                  <View
                    style={[style.chatInputLineSeparator, {opacity: 0.3}]}
                  />
                  <ChatInput
                    privateActive={privateActive}
                    selectedUserID={selectedUserID}
                  />
                </View>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  chatView: {
    width: '20%',
    minWidth: 200,
    maxWidth: 300,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    flex: 1,
    shadowColor: $config.PRIMARY_FONT_COLOR + '80',
    shadowOpacity: 0.5,
    shadowOffset: {width: -2, height: 1},
    shadowRadius: 3,
  },
  chatViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    bottom: 0,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
  },
  heading: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
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
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 25,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  chatNav: {
    flexDirection: 'row',
    height: '6%',
  },
  chatInputContainer: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    paddingBottom: 10,
  },
  chatInputLineSeparator: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    width: '100%',
    height: 1,
    marginHorizontal: -20,
    alignSelf: 'center',
    opacity: 0.5,
    marginBottom: 10,
  },
  groupActive: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    flex: 1,
    height: '100%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + 22,
    flex: 1,
    height: '100%',
    textAlign: 'center',
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privateActive: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  private: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + 22,
    flex: 1,
    height: '100%',
    borderBottomLeftRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupTextActive: {
    marginVertical: 'auto',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
    color: $config.PRIMARY_FONT_COLOR,
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
    color: $config.PRIMARY_FONT_COLOR + 50,
  },
  chatNotification: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: $config.PRIMARY_COLOR,
    color: $config.SECONDARY_FONT_COLOR,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    borderRadius: 10,
    position: 'absolute',
    left: 25,
    top: -5,
  },
  chatNotificationPrivate: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: $config.PRIMARY_COLOR,
    color: $config.SECONDARY_FONT_COLOR,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    borderRadius: 10,
    position: 'absolute',
    right: 20,
    top: 0,
  },
});

export default Chat;
