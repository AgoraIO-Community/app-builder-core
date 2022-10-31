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
import {ImageIcon} from '../../agora-rn-uikit';

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
    <View style={style.bubbleContainer}>
      {!isSameUser ? (
        <View style={isLocal ? style.bubbleImgLocal : style.bubbleImgRemote}>
          <ImageIcon
            name={isLocal ? 'chatBubbleLocal' : 'chatBubbleRemote'}
            style={{width: 8, height: 10}}
            color={isLocal ? '#E6F5FF' : '#F4F4F4'}
          />
        </View>
      ) : (
        <></>
      )}
      <View
        style={
          isLocal ? style.chatBubbleLocalView : style.chatBubbleRemoteView
        }>
        {!isSameUser ? (
          <View style={style.usernameViewStyle}>
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
          </View>
        ) : (
          <></>
        )}
        <View>
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
        </View>
        <View>
          <Text style={style.timestampStyle}>{time + ' '}</Text>
        </View>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  bubbleContainer: {
    position: 'relative',
  },
  bubbleImgLocal: {
    position: 'absolute',
    top: 5,
    right: 13,
  },
  bubbleImgRemote: {
    position: 'absolute',
    top: 5,
    left: 13,
  },
  usernameViewStyle: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 12,
    paddingBottom: 8,
  },
  remoteUsernameStyle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'left',
    color: '#181818',
  },
  localUsernameStyle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'left',
    color: '#099DFD',
    opacity: 0.7,
  },
  timestampStyle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'right',
    color: '#003E66',
    opacity: 0.5,
  },
  full: {
    flex: 1,
  },
  chatBubbleRemoteView: {
    backgroundColor: '#F4F4F4',
    minWidth: '30%',
    maxWidth: '100%',
    alignSelf: 'flex-start',
    flex: 1,
    marginVertical: 5,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 12,
    marginHorizontal: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 12,
  },
  chatBubbleLocalView: {
    backgroundColor: '#E6F5FF',
    minWidth: '30%',
    maxWidth: '100%',
    alignSelf: 'flex-end',
    flex: 1,
    marginVertical: 5,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 12,
    marginHorizontal: 20,
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
