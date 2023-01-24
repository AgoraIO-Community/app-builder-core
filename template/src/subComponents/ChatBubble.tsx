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
import React, {useContext} from 'react';
import {View, Text, StyleSheet, Linking} from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import {useString} from '../utils/useString';
import {ChatBubbleProps} from '../components/ChatContext';
import ColorContext from '../components/ColorContext';
import {isWebInternal} from '../utils/common';
import {useChatUIControl, useRender} from 'customization-api';
import ThemeConfig from '../theme';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import Spacer from '../atoms/Spacer';
import {formatAMPM} from '../utils';

const ChatBubble = (props: ChatBubbleProps) => {
  const {renderList} = useRender();
  const {primaryColor} = useContext(ColorContext);
  const {privateActive, selectedChatUserId} = useChatUIControl();
  let {
    isLocal,
    isSameUser,
    message,
    createdTimestamp,
    uid,
    isDeleted,
    msgId,
    updatedTimestamp,
  } = props;
  let time = formatAMPM(new Date(parseInt(createdTimestamp)));

  const handleUrl = (url: string) => {
    if (isWebInternal()) {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';

  return props?.render ? (
    props.render(
      isLocal,
      message,
      createdTimestamp,
      uid,
      msgId,
      isDeleted,
      updatedTimestamp,
      isSameUser,
    )
  ) : (
    <>
      {!isSameUser && !(privateActive && selectedChatUserId) ? (
        <Text
          style={
            isLocal ? style.localUsernameStyle : style.remoteUsernameStyle
          }>
          {isLocal
            ? 'You'
            : renderList[uid]
            ? renderList[uid].name
            : remoteUserDefaultLabel}
        </Text>
      ) : (
        <></>
      )}
      <View
        style={
          isLocal ? style.chatBubbleLocalView : style.chatBubbleRemoteView
        }>
        <View
          style={
            isLocal
              ? style.chatBubbleLocalViewLayer2
              : style.chatBubbleRemoteViewLayer2
          }>
          <Hyperlink
            onPress={handleUrl}
            linkStyle={{
              color: $config.FONT_COLOR,
              textDecorationLine: 'underline',
            }}>
            <Text style={style.messageStyle} selectable={true}>
              {message}
            </Text>
          </Hyperlink>
          {/* <Spacer size={5} /> */}
          <Text style={style.timestampStyle}>{time}</Text>
        </View>
      </View>
    </>
  );
};

const style = StyleSheet.create({
  remoteUsernameStyle: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: ThemeConfig.FontSize.small,
    textAlign: 'left',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  localUsernameStyle: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: ThemeConfig.FontSize.small,
    textAlign: 'left',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    alignSelf: 'flex-end',
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  timestampStyle: {
    // position: 'absolute',
    // bottom: 0,
    // right: 12,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.tiny,
    textAlign: 'right',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.disabled,
    marginTop: 4,
    marginBottom: 6,
  },
  chatBubbleRemoteView: {
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    minWidth: '30%',
    maxWidth: '80%',
    alignSelf: 'flex-start',
    marginVertical: 2,
    marginHorizontal: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 12,
  },
  chatBubbleRemoteViewLayer2: {
    backgroundColor: 'transparent',
    //  width: '100%',
    // height: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 0,
  },
  chatBubbleLocalViewLayer2: {
    //width: '100%',
    //height: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 0,
    backgroundColor:
      $config.PRIMARY_ACTION_BRAND_COLOR + hexadecimalTransparency['10%'],
  },
  chatBubbleLocalView: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['20%'],
    minWidth: '30%',
    maxWidth: '80%',
    alignSelf: 'flex-end',
    marginVertical: 2,
    marginHorizontal: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 0,
  },
  messageStyle: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: ThemeConfig.FontSize.small * 1.4,
    color: $config.FONT_COLOR,
  },
});

export default ChatBubble;
