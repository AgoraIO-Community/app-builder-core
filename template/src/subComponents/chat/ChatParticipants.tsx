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
import {isIOS, isWeb, isWebInternal} from '../../utils/common';
import {useChatNotification} from '../../components/chat-notification/useChatNotification';
import {UidType, useLocalUid} from '../../../agora-rn-uikit';
import ImageIcon from '../../atoms/ImageIcon';
import {useRender} from 'customization-api';
import UserAvatar from '../../atoms/UserAvatar';
import ThemeConfig from '../../theme';

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
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <ScrollView>
      {Object.entries(renderList).map(([uid, value]) => {
        const uidAsNumber = parseInt(uid);
        if (isChatUser(uidAsNumber, value)) {
          const name = renderList[uidAsNumber]
            ? renderList[uidAsNumber].name + ''
            : remoteUserDefaultLabel;
          return (
            <PlatformWrapper
              isHovered={isHovered}
              setIsHovered={setIsHovered}
              key={uid}
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
                  <Text style={[style.participantText]}>{name}</Text>
                </View>
                {!isHovered ? (
                  unreadIndividualMessageCount &&
                  unreadIndividualMessageCount[uidAsNumber] ? (
                    <View style={style.chatNotificationPrivate}>
                      <Text style={style.chatNotificationCountText}>
                        {unreadIndividualMessageCount[uidAsNumber]}
                      </Text>
                    </View>
                  ) : (
                    <></>
                  )
                ) : (
                  <View style={{alignSelf: 'center', marginRight: 20}}>
                    <ImageIcon
                      name="chat"
                      tintColor={$config.SECONDARY_ACTION_COLOR}
                    />
                  </View>
                )}
              </View>
            </PlatformWrapper>
          );
        }
      })}
    </ScrollView>
  );
};

const PlatformWrapper = ({children, isHovered, setIsHovered, onPress}) => {
  return isWeb() ? (
    <div
      style={{
        backgroundColor: isHovered
          ? $config.CARD_LAYER_5_COLOR + '10'
          : 'transparent',
        cursor: isHovered ? 'pointer' : 'auto',
      }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onClick={onPress}>
      {children}
    </div>
  ) : (
    <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
  );
};

const style = StyleSheet.create({
  bgContainerStyle: {
    backgroundColor: $config.CARD_LAYER_5_COLOR + '20',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginLeft: 20,
    marginVertical: 16,
  },
  userAvatarContainer: {
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR + '10',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userAvatarText: {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 10,
    fontWeight: '400',
    color: $config.FONT_COLOR,
  },
  participantContainer: {
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  participantTextContainer: {
    flex: 1,
    marginVertical: 28,
  },
  participantText: {
    flex: 1,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 12,
    color: $config.FONT_COLOR,
    textAlign: 'left',
    flexShrink: 1,
  },
  chatNotificationPrivate: {
    backgroundColor: $config.SEMANTIC_NETRUAL,
    borderRadius: 8,
    marginRight: 22,
    marginTop: 24,
    marginBottom: 28,
    width: 24,
    height: 16,
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
