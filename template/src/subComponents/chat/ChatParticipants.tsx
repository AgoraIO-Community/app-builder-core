import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  Pressable,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import TextWithTooltip from '../TextWithTooltip';
import {useString} from '../../utils/useString';
import {isIOS, isMobileUA, isWebInternal} from '../../utils/common';
import {useChatNotification} from '../../components/chat-notification/useChatNotification';
import {UidType, useLocalUid} from '../../../agora-rn-uikit';
import ImageIcon from '../../atoms/ImageIcon';
import {useRender} from 'customization-api';
import UserAvatar from '../../atoms/UserAvatar';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import Spacer from '../../atoms/Spacer';

const ChatIcon = () => (
  <View style={{alignSelf: 'center', marginRight: 20}}>
    <ImageIcon
      iconType="plain"
      name="chat-nav"
      tintColor={$config.SECONDARY_ACTION_COLOR}
    />
  </View>
);

const ChatParticipants = (props: any) => {
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  const {selectUser} = props;
  const {renderList, activeUids} = useRender();
  const localUid = useLocalUid();
  const {unreadIndividualMessageCount} = useChatNotification();
  const isMobile = isMobileUA();
  return (
    <ScrollView>
      {activeUids && activeUids.length === 1 ? (
        <View style={style.defaultMessageContainer}>
          <Text style={style.defaultMessageText}>
            No one else has joined yet.
          </Text>
        </View>
      ) : (
        <></>
      )}
      {Object.keys(renderList)
        .map((i) => parseInt(i))
        .filter((i) => {
          try {
            if (isNaN(i)) {
              return false;
            } else {
              const userId = i;
              const userInfo = renderList[userId];
              return (
                userId !== localUid && //user can't chat with own user
                // @ts-ignore
                userId !== '1' && //user can't chat with pstn user
                userInfo?.type === 'rtc' &&
                !userInfo?.offline
              );
            }
          } catch (error) {
            return false;
          }
        })
        .sort((a, b) => {
          return (
            renderList[b]?.lastMessageTimeStamp -
            renderList[a]?.lastMessageTimeStamp
          );
        })
        .map((uid) => {
          const uidAsNumber = uid;
          const name = renderList[uidAsNumber]
            ? renderList[uidAsNumber].name + ''
            : remoteUserDefaultLabel;
          return (
            <PlatformWrapper key={'chat-participant' + uid}>
              {(isHovered: boolean) => {
                return (
                  <Pressable
                    onPress={() => {
                      selectUser(uidAsNumber);
                    }}>
                    <View style={style.participantContainer}>
                      <View style={style.bgContainerStyle}>
                        <UserAvatar
                          name={name}
                          containerStyle={style.userAvatarContainer}
                          textStyle={style.userAvatarText}
                        />
                      </View>
                      <View style={style.participantTextContainer}>
                        <Text numberOfLines={1} style={[style.participantText]}>
                          {name}
                        </Text>
                      </View>
                      {unreadIndividualMessageCount &&
                      unreadIndividualMessageCount[uidAsNumber] &&
                      !isHovered ? (
                        <>
                          <View style={style.chatNotificationPrivate}>
                            <Text style={style.chatNotificationCountText}>
                              {unreadIndividualMessageCount[uidAsNumber]}
                            </Text>
                          </View>
                          <Spacer size={20} horizontal={true} />
                        </>
                      ) : isMobile || isHovered ? (
                        <ChatIcon />
                      ) : (
                        <></>
                      )}
                    </View>
                  </Pressable>
                );
              }}
            </PlatformWrapper>
          );
        })}
    </ScrollView>
  );
};

const PlatformWrapper = ({children}) => {
  const [isHovered, setIsHovered] = useState(false);
  return isWebInternal() && !isMobileUA() ? (
    <div
      style={{
        backgroundColor: isHovered
          ? $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['10%']
          : 'transparent',
        cursor: isHovered ? 'pointer' : 'auto',
      }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}>
      {children(isHovered)}
    </div>
  ) : (
    <>{children(false)}</>
  );
};

const style = StyleSheet.create({
  defaultMessageContainer: {
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 0,
  },
  defaultMessageText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: 12,
    color: $config.FONT_COLOR + hexadecimalTransparency['40%'],
  },
  bgContainerStyle: {
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginLeft: 20,
    marginVertical: 8,
  },
  userAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userAvatarText: {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 12,
    fontWeight: '400',
    color: $config.CARD_LAYER_1_COLOR,
  },
  participantContainer: {
    flexDirection: 'row',
    //  flex: 1,
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantTextContainer: {
    flex: 1,
    alignSelf: 'center',
  },
  participantText: {
    //flex: 1,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    color: $config.FONT_COLOR,
    textAlign: 'left',
    flexShrink: 1,
  },
  chatNotificationPrivate: {
    backgroundColor: $config.SEMANTIC_NEUTRAL,
    borderRadius: 8,
    alignSelf: 'center',
  },
  chatNotificationCountText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 12,
    textAlign: 'center',
    color: $config.FONT_COLOR,
    paddingVertical: 2,
    paddingLeft: 8,
    paddingRight: 9,
  },
});

export default ChatParticipants;
