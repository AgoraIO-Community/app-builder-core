import React, {createContext, useContext, useState} from 'react';
import ChatContext, {
  messageChannelType,
  controlMessageEnum,
} from './ChatContext';
import {RtcContext, PropsContext} from '../../agora-rn-uikit';

interface liveStreamContext {
  currLiveStreamRequest: Array<number>;
  approveRequestOfUID: (uid: number) => void;
  rejectRequestOfUID: (uid: number) => void;
  updateClientRole: (role: role) => void;
}

/** * User role for live streaming mode */
enum ClientRole {
  /** 1: A host can both send and receive streams. */
  Broadcaster = 1,
  /** 2: The default role. An audience can only receive streams.*/
  Audience = 2,
}

/** * Mode for RTC (Live or Broadcast) */
enum ChannelProfile {
  /** * 0: (Default) The Communication profile. Use this profile in one-on-one calls or group calls, where all users can talk freely. */
  Communication = 0,
  /** * 1: The Live-Broadcast profile. Users in a live-broadcast channel have a role as either host or audience. A host can both send and receive streams; an audience can only receive streams. */
  LiveBroadcasting = 1,
}

export enum mode {
  Live = 'live',
  Communication = 'rtc',
}

export enum role {
  Host = 'host',
  Audience = 'audience',
}

const LiveStreamContext = createContext(null as unknown as liveStreamContext);

export default LiveStreamContext;

export const LiveStreamConsumer = LiveStreamContext.Consumer;

export const LiveStreamRequestProvider = (props: any) => {
  const {setRtcProps} = props;
  const {sendControlMessageToUid} = useContext(ChatContext);
  const {RtcEngine, dispatch} = useContext(RtcContext);
  const {rtcProps} = useContext(PropsContext);

  const [currLiveStreamRequest, setLiveStreamRequest] = useState<Array<number>>(
    [],
  );

  const {events} = React.useContext(ChatContext);

  React.useEffect(() => {
    const setRole = async () => {
      if (rtcProps.mode === mode.Live) {
        if (rtcProps.role === role.Audience) {
          dispatch({
            type: 'LocalMuteAudio',
            value: [0],
          });
          dispatch({
            type: 'LocalMuteVideo',
            value: [0],
          });
        } else {
          await RtcEngine.enableVideo();
        }
      }
    };
    setRole();
  }, []);

  const updateClientRole = async (newClientRole: role) => {
    if (newClientRole === role.Audience) {
      await RtcEngine.setClientRole(ClientRole.Audience);
      setRtcProps((prevState) => ({
        ...prevState,
        role: role.Audience,
      }));
    }
    if (newClientRole === role.Host) {
      await RtcEngine.setClientRole(ClientRole.Broadcaster);
      await RtcEngine.enableVideo();
      setRtcProps((prevState) => ({
        ...prevState,
        role: role.Host,
      }));
    }
  };

  React.useEffect(() => {
    events.on(
      messageChannelType.Public,
      'onLiveStreamRequestReceived',
      (data: any, error: any) => {
        if (!data) return;
        if (data.msg === controlMessageEnum.raiseHandRequest) {
          setLiveStreamRequest((oldLiveStreamRequest) => [
            ...oldLiveStreamRequest,
            data.uid,
          ]);
        }
      },
    );
    events.on(
      messageChannelType.Private,
      'onLiveStreamRequestAccepted',
      (data: any, error: any) => {
        if (!data) return;
        if (data.msg === controlMessageEnum.raiseHandRequestAccepted) {
          updateClientRole(role.Host);
        }
      },
    );
  }, [events]);

  // SUP TODO: Change the update to hook, basically send control message when state changes i.e currLiveStreamRequest
  const updateCurrentLiveStreamRequest = (uid: number | string) => {
    setLiveStreamRequest(
      currLiveStreamRequest.filter(
        (liveStreamUserId) => liveStreamUserId != uid,
      ),
    );
  };

  const approveRequestOfUID = (uid: number | string) => {
    // SUP TODO: Add toast notitications
    // updateCurrentLiveStreamRequest(uid);
    sendControlMessageToUid(controlMessageEnum.raiseHandRequestAccepted, uid);
  };

  const rejectRequestOfUID = (uid: number | string) => {
    // SUP TODO: Add toast notitications
    // updateCurrentLiveStreamRequest(uid);
    sendControlMessageToUid(controlMessageEnum.raiseHandRequestRejected, uid);
  };

  return (
    <LiveStreamContext.Provider
      value={{
        currLiveStreamRequest,
        approveRequestOfUID,
        rejectRequestOfUID,
        updateClientRole,
      }}>
      {props.children}
    </LiveStreamContext.Provider>
  );
};
