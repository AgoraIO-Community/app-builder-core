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
import {useRender} from 'customization-api';

const ChatBubble = (props: ChatBubbleProps) => {
  const {renderList} = useRender();
  const {primaryColor} = useContext(ColorContext);
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
  let time =
    new Date(parseInt(createdTimestamp)).getHours() +
    ':' +
    new Date(parseInt(createdTimestamp)).getMinutes();
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
      isSameUser,
      updatedTimestamp,
    )
  ) : (
    <>
      {!isSameUser ? (
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
        <Hyperlink
          onPress={handleUrl}
          linkStyle={{
            color: '#0038FF',
            textDecorationLine: 'underline',
          }}>
          <Text style={style.messageStyle} selectable={true}>
            {message}
          </Text>
        </Hyperlink>
        <Text style={style.timestampStyle}>{time + ' '}</Text>
      </View>
    </>
  );
};

const style = StyleSheet.create({
  remoteUsernameStyle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'left',
    color: '#000000',
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  localUsernameStyle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'left',
    color: '#000000',
    alignSelf: 'flex-end',
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  timestampStyle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'right',
    color: 'rgba(0, 0, 0, 0.3)',
    marginTop: 4,
    marginBottom: 8,
  },
  chatBubbleRemoteView: {
    backgroundColor: '#F0F0F0',
    minWidth: '30%',
    maxWidth: '100%',
    alignSelf: 'flex-start',
    flex: 1,
    marginVertical: 2,
    marginHorizontal: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 12,
  },
  chatBubbleLocalView: {
    backgroundColor: '#F0F0F0',
    minWidth: '30%',
    maxWidth: '100%',
    alignSelf: 'flex-end',
    flex: 1,
    marginVertical: 2,
    marginHorizontal: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 0,
  },
  messageStyle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#000000',
  },
});

export default ChatBubble;
