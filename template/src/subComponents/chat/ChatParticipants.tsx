import React, {useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {UserType} from '../../components/RTMConfigure';
import TextWithTooltip from '../TextWithTooltip';
import chatContext from '../../components/ChatContext';
import {useString} from '../../utils/useString';
import {isIOS, isWeb} from '../../utils/common';
import {useChatNotification} from '../../components/chat-notification/useChatNotification';
import useUserList from '../../utils/useUserList';

const ChatParticipants = (props: any) => {
  const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const {selectUser} = props;
  const userList = useUserList();
  const {height, width} = useWindowDimensions();
  const {localUid} = useContext(chatContext);
  const {unreadIndividualMessageCount} = useChatNotification();

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
              }}>
              {unreadIndividualMessageCount &&
              unreadIndividualMessageCount[uid] ? (
                <View style={style.chatNotificationPrivate}>
                  <Text>{unreadIndividualMessageCount[uid]}</Text>
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
                  value={
                    userList[uid]
                      ? userList[uid].name + ' '
                      : remoteUserDefaultLabel + ' '
                  }
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
    fontWeight: isWeb ? '500' : '700',
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
    fontFamily: isIOS ? 'Helvetica' : 'sans-serif',
    borderRadius: 10,
    position: 'absolute',
    right: 20,
    top: 0,
  },
});
export default ChatParticipants;
