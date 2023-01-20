import React, {useContext} from 'react';
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
import {isIOS, isWeb, isWebInternal} from '../../utils/common';
import {useChatNotification} from '../../components/chat-notification/useChatNotification';
import {UidType, useLocalUid} from '../../../agora-rn-uikit';
import ImageIcon from '../../atoms/ImageIcon';
import {useRender} from 'customization-api';
import UserAvatar from '../../atoms/UserAvatar';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import Spacer from '../../atoms/Spacer';

const ChatParticipants = (props: any) => {
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  const {selectUser} = props;
  const {height, width} = useWindowDimensions();
  const {renderList, activeUids} = useRender();
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
  const [isHoveredUid, setIsHoveredUid] = React.useState(0);
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
      {Object.entries(renderList).map(([uid, value]) => {
        const uidAsNumber = parseInt(uid);

        if (isChatUser(uidAsNumber, value)) {
          const name = renderList[uidAsNumber]
            ? renderList[uidAsNumber].name + ''
            : remoteUserDefaultLabel;
          return (
            <PlatformWrapper
              isHoveredUid={isHoveredUid}
              setIsHoveredUid={setIsHoveredUid}
              key={uid}
              uid={uidAsNumber}>
              <Pressable
                onPress={() => {
                  selectUser(uidAsNumber);
                }}
                // style={{width: '100%', height: '100%'}}>
              >
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
                  {isHoveredUid !== uidAsNumber ? (
                    unreadIndividualMessageCount &&
                    unreadIndividualMessageCount[uidAsNumber] ? (
                      <>
                        <View style={style.chatNotificationPrivate}>
                          <Text style={style.chatNotificationCountText}>
                            {unreadIndividualMessageCount[uidAsNumber]}
                          </Text>
                        </View>
                        <Spacer size={20} horizontal={true} />
                      </>
                    ) : (
                      <Spacer size={20} horizontal={true} />
                    )
                  ) : (
                    <View style={{alignSelf: 'center', marginRight: 20}}>
                      <ImageIcon
                        iconType="plain"
                        name="chat-nav"
                        tintColor={$config.SECONDARY_ACTION_COLOR}
                      />
                    </View>
                  )}
                </View>
              </Pressable>
            </PlatformWrapper>
          );
        }
      })}
    </ScrollView>
  );
};

const PlatformWrapper = ({children, isHoveredUid, setIsHoveredUid, uid}) => {
  return isWeb() ? (
    <div
      style={{
        backgroundColor:
          isHoveredUid === uid
            ? $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['10%']
            : 'transparent',
        cursor: isHoveredUid === uid ? 'pointer' : 'auto',
      }}
      onMouseEnter={() => {
        setIsHoveredUid(uid);
      }}
      onMouseLeave={() => {
        setIsHoveredUid(0);
      }}>
      {children}
    </div>
  ) : (
    <>{children}</>
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
    backgroundColor: $config.SEMANTIC_NETRUAL,
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
