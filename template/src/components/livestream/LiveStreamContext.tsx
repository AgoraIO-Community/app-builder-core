import React, {createContext, useContext, useState} from 'react';
import ChatContext, {messageChannelType} from '../ChatContext';
import Toast from '../../../react-native-toast-message';
import {
  LiveStreamControlMessageEnum,
  LSNotificationObject,
  liveStreamContext,
} from './Types';

export enum mode {
  Live = 'live',
  Communication = 'rtc',
}

export enum role {
  Host = 'host',
  Audience = 'audience',
}

const LiveStreamContext = createContext(null as unknown as liveStreamContext);

export const LiveStreamContextConsumer = LiveStreamContext.Consumer;

export const LiveStreamContextProvider = (props: any) => {
  const {setRtcProps} = props;
  const {localUid, sendControlMessageToUid, updateChannelAttributes} =
    useContext(ChatContext);

  const [currLiveStreamRequest, setLiveStreamRequest] = useState<Array<number>>(
    [],
  );

  const showToast = (text: string) => {
    Toast.show({
      type: 'success',
      text1: text,
      visibilityTime: 1000,
    });
  };
  const {events} = React.useContext(ChatContext);

  const updateRtcProps = async (newClientRole: role) => {
    setRtcProps((prevState: any) => ({
      ...prevState,
      role: newClientRole === role.Audience ? role.Audience : role.Host,
      enableAudioVideoTrack: newClientRole === role.Audience ? false : true,
    }));
  };

  React.useEffect(() => {
    events.on(
      messageChannelType.Public,
      'onLiveStreamRequestReceived',
      (data: any, error: any) => {
        if (!data) return;
        if (data.msg === LiveStreamControlMessageEnum.raiseHandRequest) {
          showToast(LSNotificationObject.RAISE_HAND_RECEIVED);
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
        if (
          data.msg === LiveStreamControlMessageEnum.raiseHandRequestAccepted
        ) {
          showToast(LSNotificationObject.RAISE_HAND_ACCEPTED);
          updateRtcProps(role.Host);
          updateChannelAttributes(localUid, role.Host);
        }
      },
    );

    events.on(
      messageChannelType.Private,
      'onLiveStreamRequestRejected',
      (data: any, error: any) => {
        if (!data) return;
        if (
          data.msg === LiveStreamControlMessageEnum.raiseHandRequestRejected
        ) {
          showToast(LSNotificationObject.RAISE_HAND_REJECTED);
        }
      },
    );

    events.on(
      messageChannelType.Private,
      'onLiveStreamApprovedRequestRecalled',
      (data: any, error: any) => {
        if (!data) return;
        if (
          data.msg ===
          LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall
        ) {
          showToast(LSNotificationObject.RAISE_HAND_APPROVED_REQUEST_RECALL);
          updateRtcProps(role.Audience);
          updateChannelAttributes(localUid, role.Host);
        }
      },
    );

    () => {
      // clean up listeners
    };
  }, [events, localUid]);

  // SUP TODO: Change the update to hook, basically send control message when state changes i.e currLiveStreamRequest
  const updateCurrentLiveStreamRequest = (uid: number | string) => {
    setLiveStreamRequest(
      currLiveStreamRequest.filter(
        (liveStreamUserId) => liveStreamUserId != uid,
      ),
    );
  };

  const approveRequestOfUID = (uid: number | string) => {
    updateCurrentLiveStreamRequest(uid);
    sendControlMessageToUid(
      LiveStreamControlMessageEnum.raiseHandRequestAccepted,
      uid,
    );
  };

  const rejectRequestOfUID = (uid: number | string) => {
    updateCurrentLiveStreamRequest(uid);
    sendControlMessageToUid(
      LiveStreamControlMessageEnum.raiseHandRequestRejected,
      uid,
    );
  };

  return (
    <LiveStreamContext.Provider
      value={{
        currLiveStreamRequest,
        approveRequestOfUID,
        rejectRequestOfUID,
      }}>
      {props.children}
    </LiveStreamContext.Provider>
  );
};

export default LiveStreamContext;
