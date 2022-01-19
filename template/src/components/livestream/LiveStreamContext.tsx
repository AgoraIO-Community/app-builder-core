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
  const [raiseHandRequestActive, setRaiseHandRequestActive] =
    React.useState(false);

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
    }));
  };

  React.useEffect(() => {
    // 1. Host listens for this event
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
    // 2. Audience listens for this event
    events.on(
      messageChannelType.Private,
      'onLiveStreamRequestAccepted',
      (data: any, error: any) => {
        if (!data) return;
        if (
          data.msg === LiveStreamControlMessageEnum.raiseHandRequestAccepted
        ) {
          // This If condition solves the raise condition => if the host approves after the audience has recalled his request
          if (!raiseHandRequestActive) return;
          showToast(LSNotificationObject.RAISE_HAND_ACCEPTED);
          updateRtcProps(role.Host);
          updateChannelAttributes(localUid, role.Host);
        }
      },
    );

    // 3. Audience listens for this event
    events.on(
      messageChannelType.Private,
      'onLiveStreamRequestRejected',
      (data: any, error: any) => {
        if (!data) return;
        if (
          data.msg === LiveStreamControlMessageEnum.raiseHandRequestRejected
        ) {
          showToast(LSNotificationObject.RAISE_HAND_REJECTED);
          setRaiseHandRequestActive(false);
        }
      },
    );

    // 4. Host listens for this event
    events.on(
      messageChannelType.Public,
      'onLiveStreamRequestRecall',
      (data: any, error: any) => {
        if (!data) return;
        if (data.msg === LiveStreamControlMessageEnum.raiseHandRequestRecall) {
          showToast(LSNotificationObject.RAISE_HAND_REQUEST_RECALL);
          updateCurrentLiveStreamRequest(data.uid);
        }
      },
    );

    // 5. Audience listens for this event
    events.on(
      messageChannelType.Private,
      'onLiveStreamApprovedRequestRecall',
      (data: any, error: any) => {
        if (!data) return;
        if (
          data.msg ===
          LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall
        ) {
          showToast(LSNotificationObject.RAISE_HAND_APPROVED_REQUEST_RECALL);
          updateRtcProps(role.Audience);
          updateChannelAttributes(localUid, role.Audience);
          setRaiseHandRequestActive(false);
        }
      },
    );

    return () => {
      // Cleanup the listeners
      events.off(messageChannelType.Public, 'onLiveStreamRequestReceived');
      events.off(messageChannelType.Private, 'onLiveStreamRequestAccepted');
      events.off(messageChannelType.Private, 'onLiveStreamRequestRejected');
      events.off(messageChannelType.Public, 'onLiveStreamRequestRecall');
      events.off(
        messageChannelType.Private,
        'onLiveStreamApprovedRequestRecall',
      );
    };
  }, [events, localUid, raiseHandRequestActive]);

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
        raiseHandRequestActive,
        setRaiseHandRequestActive,
      }}>
      {props.children}
    </LiveStreamContext.Provider>
  );
};

export default LiveStreamContext;
