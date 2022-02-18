import React from 'react';

type PreCallLocalMuteCmpType = {
  PreCallLocalAudioMute?: React.FC<{}>;
  PreCallLocalVideoMute?: React.FC<{}>;
}

type PreCallCmpType = {
  PreCallVideoPreview?: React.FC<{}>;
  PreCallLocalMute?: PreCallLocalMuteCmpType;
  PreCallLogo?: React.FC<{}>;
  PreCallSetName?: React.FC<{}>;
  PreCallSelectDevice?: React.FC<{}>;
  PreCallJoinBtn?: React.FC<{}>;
  PreCallTextInput?: React.FC<{}>;
}

type VideoCallCmpType = {
  NavBar?: React.FC<{}>;
  SettingsView?: React.FC<{}>;
  ParticipantsView?: React.FC<{}>;
  Controls?: React.FC<{}>;
  Chat?: React.FC<{}>;
}

type ComponentsType = {
  CreateMeetingScreen?: React.FC<{}>;
  ShareLinksScreen?: React.FC<{}>;
  JoinMeetingScreen?: React.FC<{}>;
  PreCallScreen?: PreCallCmpType | React.FC<{}>;
  VideoCallScreen?: VideoCallCmpType;
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
   * message callback used to listen for incoming message from private or public 
   */
  //message_callback?: //TODO:hari;
}
