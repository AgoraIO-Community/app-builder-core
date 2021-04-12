// import statements are not allowed in global configs
type VideoProfile =
  | '120p_1'
  | '120p_3'
  | '180p_1'
  | '180p_3'
  | '180p_4'
  | '240p_1'
  | '240p_3'
  | '240p_4'
  | '360p_1'
  | '360p_3'
  | '360p_4'
  | '360p_6'
  | '360p_7'
  | '360p_8'
  | '360p_9'
  | '360p_10'
  | '360p_11'
  | '480p_1'
  | '480p_2'
  | '480p_3'
  | '480p_4'
  | '480p_6'
  | '480p_8'
  | '480p_9'
  | '480p_10'
  | '720p_1'
  | '720p_2'
  | '720p_3'
  | '720p_5'
  | '720p_6';

interface ConfigInterface {
  projectName: string;
  displayName: string;
  logo: string;
  AppID: string;
  primaryColor: string;
  frontEndURL: string;
  backEndURL: string;
  pstn: boolean;
  precall: boolean;
  watermark: boolean;
  chat: boolean;
  cloudRecording: boolean;
  screenSharing: boolean;
  platformIos: boolean;
  platformAndroid: boolean;
  platformWeb: boolean;
  platformWindows: boolean;
  platformMac: boolean;
  platformLinux: boolean;
  CLIENT_ID: string;
  landingHeading: string;
  landingSubHeading: string;
  illustration: string;
  bg: string;
  ENABLE_OAUTH: boolean;
  encryption: boolean;
  profile: VideoProfile;
}
declare var $config: ConfigInterface;
