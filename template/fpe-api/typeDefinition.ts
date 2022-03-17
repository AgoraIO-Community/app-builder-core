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
import { channelMessage, chatInputInterface } from '../src/components/ChatContext';
import { TextInterface } from 'src/language';

//todo:hari define AnyReactComponent support any react component
export type AnyReactComponent = React.FC<any>

export interface PreCallInterface {
  preview?: AnyReactComponent;
  audioMute?: AnyReactComponent;
  videoMute?: AnyReactComponent;
  meetingName?: AnyReactComponent;
  deviceSelect?: AnyReactComponent;
  joinButton?: AnyReactComponent;
  textBox?: AnyReactComponent;
}

export interface ChatCmpInterface {
  chatBubble?: React.FC<channelMessage>;
  chatInput?: React.FC<chatInputInterface>;
}

export interface VideoCallInterface {
  topBar?: AnyReactComponent;
  settingsPanel?: AnyReactComponent;
  participantsPanel?: AnyReactComponent;
  bottomBar?: AnyReactComponent;
  chat?: ChatCmpInterface | AnyReactComponent;
}

export type ComponentsInterface ={
  precall?: PreCallInterface | AnyReactComponent
  create?: AnyReactComponent;
  share?: AnyReactComponent;
  join?: AnyReactComponent;
  videoCall?: VideoCallInterface | AnyReactComponent;
}

export interface CustomRoutesInterface {
  path: string;
  component: AnyReactComponent;
  exact?: boolean;
  componentProps?: object;
  privateRoute?: boolean;
  routeProps?: object;
  failureRedirectTo?: string;
};

export interface i18nInterface {
  label: string
  locale: string,
  data: {
    [key in keyof TextInterface]: ((input:string) => string) | string
  }
}

export interface FpeApiInterface {
  /**
   * components used to replace whole screen or subcomponents
   */
  components?: ComponentsInterface;
  /**
   * custom routes used to add new page/routes
   */
  customRoutes?: CustomRoutesInterface[];
  /**
   * Custom context/api provider wrapped in root level
   */
  appRoot?: React.ReactNode;
  /**
   * 
   */
  i18n?:i18nInterface[]
  /**
   * message callback used to listen for incoming message from private or public 
   */
  //message_callback?: //TODO:hari;
}
