import {ChatSendButton, ChatSendButtonProps} from './ChatInput';
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
  MuteAllAudioButtonProps,
  MuteAllVideoButton,
  MuteAllVideoButtonProps,
} from '../components/HostControlView';

export const SidePanelButtonsArray: [
  (props: RemoteAudioMuteProps) => JSX.Element,
  (props: RemoteVideoMuteProps) => JSX.Element,
  (props: RemoteEndCallProps) => JSX.Element,
  (props: RemoteLiveStreamApprovedRequestRecallProps) => JSX.Element,
  (props: RemoteLiveStreamControlInterface) => JSX.Element,
  (props: RemoteLiveStreamControlInterface) => JSX.Element,
  (props: ChatSendButtonProps) => JSX.Element,
  (props: MuteAllAudioButtonProps) => JSX.Element,
  (props: MuteAllVideoButtonProps) => JSX.Element,
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
