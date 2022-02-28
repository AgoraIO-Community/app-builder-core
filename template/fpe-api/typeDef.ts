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
import React from 'react';
import { channelMessage, chatInputInterface } from 'src/components/ChatContext';

export type PreCallLocalMuteCmpType = {
  PreCallLocalAudioMute?: React.FC<{}>;
  PreCallLocalVideoMute?: React.FC<{}>;
}

export type PreCallCmpType = {
  PreCallVideoPreview?: React.FC<{}>;
  PreCallLocalMute?: PreCallLocalMuteCmpType | React.FC<{}>;
  PreCallLogo?: React.FC<{}>;
  PreCallSetName?: React.FC<{}>;
  PreCallSelectDevice?: React.FC<{}>;
  PreCallJoinBtn?: React.FC<{}>;
  PreCallTextInput?: React.FC<{}>;
}

export type ChatCmpType = {
  ChatBubble?: React.FC<channelMessage>;
  ChatInput?: React.FC<chatInputInterface>;
}

export type VideoCallCmpType = {
  NavBar?: React.FC<{}>;
  SettingsView?: React.FC<{}>;
  ParticipantsView?: React.FC<{}>;
  Controls?: React.FC<{}>;
  Chat?: ChatCmpType | React.FC<{}>;
}

export type ComponentsType = {
  CreateMeetingScreen?: React.FC<{}>;
  ShareLinksScreen?: React.FC<{}>;
  JoinMeetingScreen?: React.FC<{}>;
  PreCallScreen?: PreCallCmpType | React.FC<{}>
  VideoCallScreen?: VideoCallCmpType | React.FC<{}>;
}

export interface CustomRoutesInterface {
  path: string;
  component: React.ElementType;
  exact?: boolean;
  componentProps?: object;
  privateRoute?: boolean;
  routeProps?: object;
  failureRedirectTo?: string;
};

export interface FpeApiInterface {
  /**
   * components used to replace whole screen or subcomponents
   */
  components?: ComponentsType;
  /**
   * custom routes used to add new page/routes
   */
  custom_routes?: CustomRoutesInterface[];
  /**
   * Custom context/api provider wrapped in root level
   */
  root_wrapper?: React.ReactNode;
  /**
   * message callback used to listen for incoming message from private or public 
   */
  //message_callback?: //TODO:hari;
}
