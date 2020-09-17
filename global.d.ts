interface ConfigInterface {
  projectName: string;
  displayName: string;
  logoRect: boolean;
  logoSquare: boolean;
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
}
declare var $config: ConfigInterface;
