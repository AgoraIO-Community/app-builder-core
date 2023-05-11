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
  close: string;
  'back-btn': string;
  participants: string;
  chat: string;
  settings: string;
  'more-menu': string;
  share: string;
  'switch-camera': string;
  remove: string;
  info: string;
  send: string;
  'downside-triangle': string;
  profile: string;
  'link-share': string;
  'list-view': string;
  expand: string;
  collapse: string;
  'active-speaker': string;
  'connection-unsupported': string;
  'connection-bad': string;
  'connection-good': string;
  'connection-loading': string;
  'connection-very-bad': string;
  'connection-unpublished': string;
  'remove-meeting': string;
  'pencil-outlined': string;
  'pencil-filled': string;
  alert: string;
  speaker: string;
  person: string;
  pinned: string;
  grid: string;
  people: string;
  'chat-nav': string;
  'chat-filled': string;
  'chat-outlined': string;
  'demote-filled': string;
  'demote-outlined': string;
  'promote-filled': string;
  'promote-outlined': string;
  'pin-filled': string;
  'pin-outlined': string;
  'unpin-filled': string;
  'unpin-outlined': string;
  'mic-on-filled': string;
  'mic-on-outlined': string;
  'mic-off-filled': string;
  'mic-off-outlined': string;
  'video-on-filled': string;
  'video-on-outlined': string;
  'video-off-filled': string;
  'video-off-outlined': string;
  'turn-off-stt': string;
  'live-caption-mode': string;
}
