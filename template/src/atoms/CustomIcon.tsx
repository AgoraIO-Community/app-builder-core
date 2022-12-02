/* 
Steps to add/remove icons:
1. Open Icomoon : https://icomoon.io/app/#/select
2. Upload the current selection.js from ./src/assets/selection.json  
3. Add / Remove SVG'd from the set
4. Generate a new Font File
5. Download Zip folder , replace iconmoon.ttf file in ./src/assets/font/iconmoon.ttf with downloded
6. Replace selection.json and font-styles.css content 
7. Run npx react-native link react-native-vector-icons to copy in the android/app/src/main/assets/fonts directory and in Info.plist (for Android and iOS respectively).
*/

import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import icoMoonConfig from '../assets/selection.json';
export default createIconSetFromIcoMoon(icoMoonConfig);

export interface IconsInterface {
  'video-plus': string;
  'video-on': string;
  'video-off': string;
  'mic-on': string;
  'mic-off': string;
  'no-cam': string;
  'no-mic': string;
  clipboard: string;
  tick: string;
  'tick-fill': string;
  'arrow-down': string;
  'arrow-up': string;
  'screen-share': string;
  'stop-screen-share': string;
  recording: string;
  'stop-recording': string;
  'end-call': string;
  'raise-hand': string;
  'lower-hand': string;
  'close-rounded': string;
  'close-square': string;
  'back-btn': string;
  participants: string;
  chat: string;
  settings: string;
  'more-menu': string;
  share: string;
  'switch-camera': string;
  remove: string;
  layout: string;
  'pinned-layout': string;
  'grid-layout': string;
  info: string;
  send: string;
  'downside-triangle': string;
  profile: string;
  'link-share': string;
  'list-view': string;
  expand: string;
  collapse: string;
  cancel: string;
  'active-speaker': string;
  // screenshareStart: string;
  // screenshareStop: string;
  // recordingStart: string;
  // recordingStop: string;
  // raiseHand: string;
  // lowerHand: string;
  // endCall: string;

  // share: string;
  // gridLayoutIcon: string;
  // pinnedLayoutIcon: string;

  // participant: string;
  // participantActive: string;

  // chat: string;
  // chatActive: string;

  // settings: string;
  // settingsActive: string;

  // videocamWhite: string;
  // info: string;
  // downsideTriangle: string;

  // switchCamera: string;

  // backBtn: string;

  // send: string;
  // sendActive: string;

  // closeSquare: string;
  // closeRounded: string;

  // networkIcons: {
  //   Excellent: string;
  //   Good: string;
  //   Bad: string;
  //   VeryBad: string;
  //   Loading: string;
  //   Unpublished: string;
  //   Unsupported: string;
  // };

  // downArrow: string;
  // upArrow: string;
  // downArrowDisabled: string;
  // downArrowTriangle: string;
  // tick: string;
  // remoteEndCall: string;
  // more: string;
  // more2: string;
  // listView: string;
}
