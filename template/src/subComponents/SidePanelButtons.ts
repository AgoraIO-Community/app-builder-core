import {ChatSendButton} from './ChatInput';
import {
  RemoteLiveStreamApprovedRequestRecall,
  RemoteLiveStreamRequestApprove,
  RemoteLiveStreamRequestReject,
  RemoteLiveStreamApprovedRequestRecallProps,
  RemoteLiveStreamControlInterface,
} from './livestream';
import RemoteAudioMute, {RemoteAudioMuteProps} from './RemoteAudioMute';
import RemoteVideoMute, {RemoteVideoMuteProps} from './RemoteVideoMute';
import RemoteEndCall, {RemoteEndCallProps} from './RemoteEndCall';
import {
  MuteAllAudioButton,
  MuteAllVideoButton,
} from '../components/HostControlView';

export const SidePanelButtonsArray: [
  (props: RemoteAudioMuteProps) => JSX.Element,
  (props: RemoteVideoMuteProps) => JSX.Element,
  (props: RemoteEndCallProps) => JSX.Element,
  (props: RemoteLiveStreamApprovedRequestRecallProps) => JSX.Element,
  (props: RemoteLiveStreamControlInterface) => JSX.Element,
  (props: RemoteLiveStreamControlInterface) => JSX.Element,
  () => JSX.Element,
  () => JSX.Element,
  () => JSX.Element,
] = [
  RemoteAudioMute,
  RemoteVideoMute,
  RemoteEndCall,
  RemoteLiveStreamApprovedRequestRecall,
  RemoteLiveStreamRequestApprove,
  RemoteLiveStreamRequestReject,
  ChatSendButton,
  MuteAllAudioButton,
  MuteAllVideoButton,
];
