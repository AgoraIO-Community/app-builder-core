import React, {createContext, useContext, useState} from 'react';
import ChatContext, {
  controlMessageEnum,
  messageChannelType,
} from '../ChatContext';
import Toast from '../../../react-native-toast-message';
import {
  LiveStreamControlMessageEnum,
  LSNotificationObject,
  liveStreamContext,
  requestStatus,
} from './Types';
import {ClientRole} from '../../../agora-rn-uikit';

const LiveStreamContext = createContext(null as unknown as liveStreamContext);

export const LiveStreamContextConsumer = LiveStreamContext.Consumer;

export const LiveStreamContextProvider = (props: any) => {
  const [raiseHandRequestActive, setRaiseHandRequestActive] =
    React.useState(false);

  const {setRtcProps} = props;

  const {events} = React.useContext(ChatContext);

  const {
    localUid,
    sendControlMessageToUid,
    sendControlMessage,
    updateChannelAttributes,
    broadcastUserAttributes,
  } = useContext(ChatContext);

  const [currLiveStreamRequest, setLiveStreamRequest] = useState<
    Record<string, {}>
  >({});

  const showToast = (text: string) => {
    Toast.show({
      type: 'success',
      text1: text,
      visibilityTime: 1000,
    });
  };

  const updateRtcProps = (newClientRole: ClientRole) => {
    setRtcProps((prevState: any) => ({
      ...prevState,
      role:
        newClientRole === ClientRole.Audience
          ? ClientRole.Audience
          : ClientRole.Broadcaster,
    }));
  };

  React.useEffect(() => {
    // 1. All Hosts in channel listens for this event - channel message
    events.on(
      messageChannelType.Public,
      'onLiveStreamRequestReceived',
      (data: any, error: any) => {
        if (!data) return;
        if (data.msg === LiveStreamControlMessageEnum.raiseHandRequest) {
          showToast(LSNotificationObject.RAISE_HAND_RECEIVED);
          setLiveStreamRequest((oldLiveStreamRequest) => ({
            ...oldLiveStreamRequest,
            [data.uid]: requestStatus.AwaitingAction,
          }));
        }
      },
    );
    // 2. Audience who raised hand listens for this event - private message
    events.on(
      messageChannelType.Private,
      'onLiveStreamRequestAccepted',
      (data: any, error: any) => {
        if (!data) return;
        if (
          data.msg === LiveStreamControlMessageEnum.raiseHandRequestAccepted
        ) {
          /**
           * This If condition solves the raise condition =>
           * if the host approves after the audience has recalled his request
           */
          if (!raiseHandRequestActive) return;
          showToast(LSNotificationObject.RAISE_HAND_ACCEPTED);
          notifyAllHostsInChannel(
            LiveStreamControlMessageEnum.notifyAllRequestApproved,
          );
          updateRtcProps(ClientRole.Broadcaster);
          updateChannelAttributes(localUid, ClientRole.Broadcaster);
          broadcastUserAttributes(
            [{key: 'role', value: ClientRole.Broadcaster.toString()}],
            controlMessageEnum.clientRoleChanged,
          );
        }
      },
    );
    // 3. Audience who raised hand listens for this event - private message
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
          notifyAllHostsInChannel(
            LiveStreamControlMessageEnum.notifyAllRequestRejected,
          );
        }
      },
    );
    // 4. All Hosts in channel listens for this event - channel message
    events.on(
      messageChannelType.Public,
      'onLiveStreamRequestRecall',
      (data: any, error: any) => {
        if (!data) return;
        if (data.msg === LiveStreamControlMessageEnum.raiseHandRequestRecall) {
          showToast(LSNotificationObject.RAISE_HAND_REQUEST_RECALL);
          deleteCurrentLiveStreamRequest(data.uid);
        }
      },
    );
    // 5. Audience who raised hand listens for this event - private message
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
          notifyAllHostsInChannel(
            LiveStreamControlMessageEnum.notifyAllRequestRejected,
          );
          updateRtcProps(ClientRole.Audience);
          updateChannelAttributes(localUid, ClientRole.Audience);
          setRaiseHandRequestActive(false);
        }
      },
    );

    // 5. Audience who raised hand listens for this event - private message
    events.on(
      messageChannelType.Public,
      'onRequestStatusNotification',
      (data: any, error: any) => {
        if (!data) return;
        if (
          data.msg === LiveStreamControlMessageEnum.notifyAllRequestApproved
        ) {
          updateCurrentLiveStreamRequestStatus(
            data.uid,
            requestStatus.Approved,
          );
        }
        if (
          data.msg === LiveStreamControlMessageEnum.notifyAllRequestRejected
        ) {
          deleteCurrentLiveStreamRequest(data.uid);
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
      events.off(messageChannelType.Public, 'onRequestStatusNotification');
    };
  }, [events, localUid, raiseHandRequestActive, currLiveStreamRequest]);

  const deleteCurrentLiveStreamRequest = (uid: number | string) => {
    const {[uid]: value, ...restOfUids} = currLiveStreamRequest;
    setLiveStreamRequest(restOfUids);
  };

  const updateCurrentLiveStreamRequestStatus = (
    uid: number | string,
    status: requestStatus,
  ) => {
    setLiveStreamRequest((oldLiveStreamRequest) => ({
      ...oldLiveStreamRequest,
      [uid]: status,
    }));
  };

  const notifyAllHostsInChannel = (ctrlEnum: LiveStreamControlMessageEnum) => {
    sendControlMessage(ctrlEnum);
  };

  // Live stream request either approve or reject
  const approveRequestOfUID = (uid: number | string) => {
    updateCurrentLiveStreamRequestStatus(uid, requestStatus.Approved);
    sendControlMessageToUid(
      LiveStreamControlMessageEnum.raiseHandRequestAccepted,
      uid,
    );
  };

  const rejectRequestOfUID = (uid: number | string) => {
    deleteCurrentLiveStreamRequest(uid);
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
