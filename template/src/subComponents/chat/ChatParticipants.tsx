import React, {useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {UserType} from '../../components/RTMConfigure';
import TextWithTooltip from '../TextWithTooltip';
import chatContext from '../../components/ChatContext';

const ChatParticipants = (props: any) => {
  const {
    selectUser,
    setPrivateMessageLastSeen,
    privateMessageCountMap,
    lastCheckedPrivateState,
  } = props;
  const {height, width} = useWindowDimensions();
  const {userList, localUid} = useContext(chatContext);

  const isChatUser = (userId: string, userInfo: any) => {
    return (
      userId !== localUid &&
      parseInt(userId) !== 1 &&
      userInfo?.type !== UserType.ScreenShare &&
      !userInfo?.offline
    );
  };

  return (
    <ScrollView>
      {Object.entries(userList).map(([uid, value]) => {
        if (isChatUser(uid, value)) {
          return (
            <TouchableOpacity
              style={style.participantContainer}
              key={uid}
              onPress={() => {
                selectUser(uid);
                setPrivateMessageLastSeen({
                  userId: uid,
                  lastSeenCount: privateMessageCountMap[uid],
                });
              }}>
              {(privateMessageCountMap[uid] || 0) -
                (lastCheckedPrivateState[uid] || 0) !==
              0 ? (
                <View style={style.chatNotificationPrivate}>
                  <Text>
                    {(privateMessageCountMap[uid] || 0) -
                      (lastCheckedPrivateState[uid] || 0)}
                  </Text>
                </View>
              ) : null}
              <View style={{flex: 1}}>
                <TextWithTooltip
                  touchable={false}
                  style={[
                    style.participantText,
                    {
                      fontSize: RFValue(16, height > width ? height : width),
                    },
                  ]}
                  value={userList[uid] ? userList[uid].name + ' ' : 'User '}
                />
              </View>
              <View>
                <Text
                  style={{
                    color: $config.PRIMARY_FONT_COLOR,
                    fontSize: 18,
                  }}>{`>`}</Text>
              </View>
            </TouchableOpacity>
          );
        }
      })}
    </ScrollView>
  );
};

const style = StyleSheet.create({
  participantContainer: {
    flexDirection: 'row',
    flex: 1,
    height: 20,
    marginTop: 10,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  participantText: {
    flex: 1,
    fontWeight: Platform.OS === 'web' ? '500' : '700',
    flexDirection: 'row',
    color: $config.PRIMARY_FONT_COLOR,
    textAlign: 'left',
    flexShrink: 1,
    marginRight: 30,
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
export default ChatParticipants;
