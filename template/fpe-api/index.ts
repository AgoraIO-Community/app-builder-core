import React from 'react';
import { getDefaultRoutes, CustomRoutesInterface } from './route/defaultRoutes';

/**
 * Importing common components
 */
import { Logo, Error } from '../src/components/common/index'
/**
 * Importing components
 */
import Authenticate from '../src/pages/Authenticate';
import VideoCall from '../src/pages/VideoCall/index';
import Join from '../src/pages/Join';
import Create from '../src/pages/Create/index'
import { PreCallScreen } from '../src/components/precall/index'
/**
 * Importing subcomponents
 */
//Pre call screen
import {
  PreCallLocalMute, PreCallVideoPreview, PreCallLocalAudioMute, PreCallLocalVideoMute,
  PreCallSetName, PreCallSelectDevice, PreCallJoinBtn, PreCallTextInput
} from "../src/components/precall/index";
//Pre call screen
//Create screen
import Share from '../src/components/Share';
//Create screen
//Video call screen
import Navbar from '../src/components/Navbar';
import SettingsView from '../src/components/SettingsView';
import ParticipantsView from '../src/components/ParticipantsView';
import Controls from '../src/components/Controls';
import Chat from '../src/components/Chat'
//video call screen

import ROUTE_KEY from './route/keys';

export interface ComponentsInterface {
  createMeetingScreen?: React.FC<{}>;
  joinMeetingScreen?: React.FC<{}>;
  shareMeetingLinks?: React.FC<{}>;
  PreCallScreen?: React.FC<{}>;
  videoCallScreen?: React.FC<{}>;
}

interface SubcomponentsInterface {
  PreCallVideoPreview?: React.FC<{}>;
  PreCallLocalMute?: React.FC<{}>;
  PreCallLocalAudioMute?: React.FC<{}>;
  PreCallLocalVideoMute?: React.FC<{}>;
  PreCallLogo?: React.FC<{}>;
  PreCallSetName?: React.FC<{}>;
  PreCallSelectDevice?: React.FC<{}>;
  PreCallJoinBtn?: React.FC<{}>;
  PreCallTextInput?: React.FC<{}>;
  ShareLink?: React.FC<{}>;
  NavBar?: React.FC<{}>;
  SettingsView?: React.FC<{}>;
  ParticipantsView?: React.FC<{}>;
  Controls?: React.FC<{}>;
  Chat?: React.FC<{}>;
}
export interface FpeApiInterface {
  /**
   * components used to replace whole screen
   */
  components?: ComponentsInterface;
  /**
   * subcomponents used to replace part of screen or component
   */
  subcomponents?: SubcomponentsInterface,
  /**
   * custom routes used to add new page/routes
   */
  custom_routes?: CustomRoutesInterface[];
  /**
   * message callback used to listen for incoming message from private or public 
   */
  //message_callback?: //TODO:hari;
}

let subcomponents: SubcomponentsInterface = {
  PreCallVideoPreview: PreCallVideoPreview,
  PreCallLogo: Logo,
  PreCallLocalAudioMute: PreCallLocalAudioMute,
  PreCallLocalVideoMute: PreCallLocalVideoMute,
  PreCallLocalMute: PreCallLocalMute,
  PreCallSetName: PreCallSetName,
  PreCallSelectDevice: PreCallSelectDevice,
  PreCallJoinBtn: PreCallJoinBtn,
  PreCallTextInput: PreCallTextInput,
  ShareLink: Share,
  NavBar: Navbar,
  SettingsView: SettingsView,
  ParticipantsView: ParticipantsView,
  Controls: Controls,
  Chat: Chat
}

let components: ComponentsInterface = {
  PreCallScreen: PreCallScreen,
  createMeetingScreen: Create,
  joinMeetingScreen: Join,
  videoCallScreen: VideoCall
}

let FpeApiConfig: FpeApiInterface = {
  components: components,
  subcomponents: subcomponents
};

const getFpeSubCmpConfig = (): SubcomponentsInterface => {
  return FpeApiConfig?.subcomponents ? FpeApiConfig.subcomponents : subcomponents
}
const getFpeCmpConfig = (): ComponentsInterface => {
  return FpeApiConfig?.components ? FpeApiConfig.components : components
}
const getFpeCustomRoutes = (): CustomRoutesInterface[] => {
  return FpeApiConfig?.custom_routes ? FpeApiConfig.custom_routes : []
}

const getFpeConfig = (key: string) => {
  if (key) {
    return FpeApiConfig[key as keyof FpeApiInterface]
  }
  return FpeApiConfig
};

const installComponents = (components?: ComponentsInterface) => {
  let temp = { ...FpeApiConfig.components }
  for (const key in components) {
    let tempComp = components[key as keyof ComponentsInterface]
    if (tempComp) {
      temp[key as keyof ComponentsInterface] = tempComp
    }
  }
  FpeApiConfig.components = temp
}

const installSubComponents = (subcomponents?: SubcomponentsInterface) => {
  let temp = { ...FpeApiConfig.subcomponents }
  for (const key in subcomponents) {
    let tempSubComp = subcomponents[key as keyof SubcomponentsInterface]
    if (tempSubComp) {
      temp[key as keyof SubcomponentsInterface] = tempSubComp;
    }
  }
  FpeApiConfig.subcomponents = temp
}

const installCustomRoutes = (custom_routes: CustomRoutesInterface[] = []) => {
  FpeApiConfig.custom_routes = custom_routes?.concat(getDefaultRoutes())
}

const installFPE = (config: FpeApiInterface) => {
  installComponents(config?.components)
  installSubComponents(config?.subcomponents)
  installCustomRoutes(config?.custom_routes)
  return FpeApiConfig
};

export {
  /** 
   * type defintion
   */
  type CustomRoutesInterface,
  /**
   * Core methods
   */
  installFPE, getFpeConfig, ROUTE_KEY, getFpeSubCmpConfig, getFpeCmpConfig, getFpeCustomRoutes,
  /**
   * Common components
   */
  Logo,
  Error,
  /**
   * Components
   */
  Authenticate,
  Create,
  Join,
  PreCallScreen,
  VideoCall,
  /**
   * Subcomponents
   */
  PreCallLocalMute,
  PreCallVideoPreview,
  PreCallLocalAudioMute,
  PreCallLocalVideoMute,
  PreCallSetName,
  PreCallSelectDevice,
  Navbar,
  SettingsView,
  ParticipantsView,
  Controls,
  Chat
};
