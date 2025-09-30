/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the "Materials") are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.'s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/
import React, {useEffect, useRef} from 'react';
import {useChatConfigure} from '../../chat/chatConfigure';
import {useChatUIControls, ChatType} from '../../chat-ui/useChatUIControls';
import {useBreakoutRoomInfo} from '../../room-info/useSetBreakoutRoomInfo';

/**
 * BreakoutChatInitializer - Handles automatic initialization of breakout room chat
 *
 * This component:
 * 1. Automatically creates/joins the breakout room group chat when user enters
 * 2. Sets the chat context to breakout room
 * 3. Handles cleanup when leaving breakout room
 */
const BreakoutChatInitializer: React.FC = () => {
  const {leaveGroupChat} = useChatConfigure();
  const {setChatType, setCurrentGroupChatId} = useChatUIControls();
  const {breakoutRoomChannelData} = useBreakoutRoomInfo();
  // const initializedGroupIdRef = useRef<string | null>(null);

  useEffect(() => {
    // const initializeBreakoutChat = async () => {
    // Get chat details from breakout room channel data
    //   const chatDetails = breakoutRoomChannelData?.chat;
    //   console.log('supriya-chatDetails init: ', chatDetails);

    //   if (!chatDetails?.groupId) {
    //     console.warn('No chat details available for breakout room');
    //     return;
    //   }

    //   // Check if chat SDK is connected before proceeding
    //   if (chatConnectionStatus !== 'connected') {
    //     console.warn(
    //       'Chat SDK not connected yet, skipping initialization. Status:',
    //       chatConnectionStatus,
    //     );
    //     return;
    //   }

    //   // Prevent multiple initializations for the same group
    //   if (initializedGroupIdRef.current === chatDetails.groupId) {
    //     console.log('Chat already initialized for group:', chatDetails.groupId);
    //     return;
    //   }

    //   try {
    //     console.log('Initializing breakout room chat:', {
    //       groupId: chatDetails.groupId,
    //       isGroupOwner: chatDetails.isGroupOwner,
    //     });

    //     // Backend already created the group, so just join it
    //     // await joinGroupChat(chatDetails.groupId);
    //     console.log(
    //       'supriya-chatdetails Joined breakout room group chat:',
    //       chatDetails.groupId,
    //     );

    //     // Set the current chat context to breakout room
    //     setCurrentGroupChatId(chatDetails.groupId);
    //     setChatType(ChatType.BreakoutGroupChat);

    //     // Mark this group as initialized
    //     initializedGroupIdRef.current = chatDetails.groupId;
    //   } catch (error) {
    //     console.error('Failed to initialize breakout room chat:', error);
    //   }
    // };

    // const currentGroupId = breakoutRoomChannelData?.chat?.groupId;

    // if (
    //   breakoutRoomChannelData?.isBreakoutMode &&
    //   breakoutRoomChannelData.channel_name &&
    //   currentGroupId
    // ) {
    //   initializeBreakoutChat();
    // }

    // Cleanup when leaving breakout room or changing to different group
    return () => {
      const chatDetails = breakoutRoomChannelData?.chat;
      console.log('supriya-chatdetails leave');

      // Only cleanup if we're leaving the initialized group
      if (
        chatDetails?.groupId
        //  && initializedGroupIdRef.current === chatDetails.groupId
      ) {
        leaveGroupChat(chatDetails.groupId).catch(error => {
          console.error(
            'supriya-chatdetails Failed to leave breakout room chat:',
            error,
          );
        });
        // Reset chat context to main room
        setCurrentGroupChatId(null);
        setChatType(ChatType.Group);
        console.log('Cleaned up breakout room chat');
        // initializedGroupIdRef.current = null;
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default BreakoutChatInitializer;
