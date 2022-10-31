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
import TextWithTooltip from '../TextWithTooltip';
import {useString} from '../../utils/useString';
import {isIOS, isWebInternal} from '../../utils/common';
import {useChatNotification} from '../../components/chat-notification/useChatNotification';
import {UidType, useLocalUid} from '../../../agora-rn-uikit';
import {useRender} from 'customization-api';
import UserAvatar from '../../atoms/UserAvatar';

const ChatParticipants = (props: any) => {
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  const {selectUser} = props;
  const {height, width} = useWindowDimensions();
  const {renderList} = useRender();
  const localUid = useLocalUid();
  const {unreadIndividualMessageCount} = useChatNotification();
  const isChatUser = (userId: UidType, userInfo: any) => {
    return (
      userId !== localUid && //user can't chat with own user
      // @ts-ignore
      userId !== '1' && //user can't chat with pstn user
      userInfo?.type === 'rtc' &&
      !userInfo?.offline
    );
  };

  return (
    <ScrollView>
      {Object.entries(renderList).map(([uid, value]) => {
        const uidAsNumber = parseInt(uid);
        if (isChatUser(uidAsNumber, value)) {
          const name = renderList[uidAsNumber]
            ? renderList[uidAsNumber].name + ''
            : remoteUserDefaultLabel;
          return (
            <TouchableOpacity
              style={style.participantContainer}
              key={uid}
              onPress={() => {
                selectUser(uidAsNumber);
              }}>
              <UserAvatar
                name={name}
                containerStyle={style.userAvatarContainer}
                textStyle={style.userAvatarText}
              />
              <View style={style.participantTextContainer}>
                <Text style={[style.participantText]}>{name}</Text>
              </View>
              {unreadIndividualMessageCount &&
              unreadIndividualMessageCount[uidAsNumber] ? (
                <View style={style.chatNotificationPrivate}>
                  <Text style={style.chatNotificationCountText}>
                    {unreadIndividualMessageCount[uidAsNumber]}
                  </Text>
                </View>
              ) : (
                <></>
              )}
            </TouchableOpacity>
          );
        }
      })}
    </ScrollView>
  );
};

const style = StyleSheet.create({
  userAvatarContainer: {
    backgroundColor: '#021F3380',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginLeft: 20,
    marginVertical: 16,
  },
  userAvatarText: {
    fontSize: 12,
    lineHeight: 10,
    fontWeight: '400',
    color: '#fff',
  },
  participantContainer: {
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden',
  },
  participantTextContainer: {
    flex: 1,
    marginVertical: 28,
  },
  participantText: {
    flex: 1,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 12,
    color: '#000000',
    textAlign: 'left',
    flexShrink: 1,
  },
  chatNotificationPrivate: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    marginRight: 22,
    marginTop: 24,
    marginBottom: 28,
    width: 24,
    height: 16,
  },
  chatNotificationCountText: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 12,
    textAlign: 'center',
    color: '#FFFFFF',
    paddingVertical: 2,
    paddingLeft: 8,
    paddingRight: 9,
  },
});

export default ChatParticipants;
