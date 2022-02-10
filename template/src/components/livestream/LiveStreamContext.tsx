import React, {createContext, useContext, useState, useRef} from 'react';
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
import ScreenshareContext from '../../subComponents/screenshare/ScreenshareContext';

const LiveStreamContext = createContext(null as unknown as liveStreamContext);

export const LiveStreamContextConsumer = LiveStreamContext.Consumer;

export const LiveStreamContextProvider = (props: any) => {
  const {stopUserScreenShare} = useContext(ScreenshareContext);
  const [raiseHandRequestActive, setRaiseHandRequestActive] = useState(false);

  const {isHost, setRtcProps} = props;

  const {
    localUid,
    sendControlMessageToUid,
    sendControlMessage,
    broadcastUserAttributes,
    events,
  } = useContext(ChatContext);

  const localMe = useRef({uid: localUid, status: ''});

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
    events.on(
      messageChannelType.Public,
      'onLiveStreamActionsForHost',
      (data: any, error: any) => {
        if (!data) return;
        if (!isHost) return;
        switch (data.msg) {
          // 1. All Hosts in channel add the audience request with 'Awaiting action' status
          case LiveStreamControlMessageEnum.raiseHandRequest:
            showToast(LSNotificationObject.RAISE_HAND_RECEIVED);
            addOrUpdateLiveStreamRequest(
              data.uid,
              requestStatus.AwaitingAction,
            );
            break;
          // 2. All Hosts in channel update their status when a audience recalls his request
          case LiveStreamControlMessageEnum.raiseHandRequestRecall:
            showToast(LSNotificationObject.RAISE_HAND_REQUEST_RECALL);
            addOrUpdateLiveStreamRequest(data.uid, requestStatus.Cancelled);
            break;
          // 3. All Host in channel update their status when a audience request is approved
          case LiveStreamControlMessageEnum.notifyAllRequestApproved:
            addOrUpdateLiveStreamRequest(data.uid, requestStatus.Approved);
            break;
          // 4. All Host in channel update their status when a audience request is rejected
          case LiveStreamControlMessageEnum.notifyAllRequestRejected:
            addOrUpdateLiveStreamRequest(data.uid, requestStatus.Cancelled);
            break;
          default:
            break;
        }
      },
    );
    events.on(
      messageChannelType.Private,
      'onLiveStreamActionsForAudience',
      (data: any, error: any) => {
        if (!data) return;
        switch (data.msg) {
          // 1. Audience changes his role once raise hand is requested
          case LiveStreamControlMessageEnum.raiseHandRequestAccepted:
            if (!raiseHandRequestActive) return;
            showToast(LSNotificationObject.RAISE_HAND_ACCEPTED);
            notifyAllHostsInChannel(
              LiveStreamControlMessageEnum.notifyAllRequestApproved,
            );
            changeClientRoleTo(ClientRole.Broadcaster);
            break;
          // 2. Audience receives either his reqyest to be rejected or cancelled
          case LiveStreamControlMessageEnum.raiseHandRequestRejected:
            showToast(LSNotificationObject.RAISE_HAND_REJECTED);
            setRaiseHandRequestActive(false);
            notifyAllHostsInChannel(
              LiveStreamControlMessageEnum.notifyAllRequestRejected,
            );
            break;
          // 3. Audience receives either his reqyest to be rejected or cancelled
          case LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall:
            showToast(LSNotificationObject.RAISE_HAND_APPROVED_REQUEST_RECALL);
            stopUserScreenShare();
            setRaiseHandRequestActive(false);
            notifyAllHostsInChannel(
              LiveStreamControlMessageEnum.notifyAllRequestRejected,
            );
            changeClientRoleTo(ClientRole.Audience);
            break;
          // 4. Audience notfies all host when request is approved
          case LiveStreamControlMessageEnum.notifyAllRequestApproved:
            addOrUpdateLiveStreamRequest(data.uid, requestStatus.Approved);
            break;
          // 5. Audience notfies all host when request is approved
          case LiveStreamControlMessageEnum.notifyAllRequestRejected:
            addOrUpdateLiveStreamRequest(data.uid, requestStatus.Cancelled);
            break;
          // 6. Audience notfies all host when is kicked out
          case controlMessageEnum.kickUser:
            notifyAllHostsInChannel(
              LiveStreamControlMessageEnum.notifyAllRequestRejected,
            );
            break;
          default:
            break;
        }
      },
    );

    return () => {
      // Cleanup the listeners
      events.off(messageChannelType.Public, 'onLiveStreamActionsForHost');
      events.off(messageChannelType.Private, 'onLiveStreamActionsForAudience');
    };
  }, [events, localUid, isHost, raiseHandRequestActive]);

  const addOrUpdateLiveStreamRequest = (
    uid: number | string,
    status: requestStatus,
  ) => {
    setLiveStreamRequest((oldLiveStreamRequest) => ({
      ...oldLiveStreamRequest,
      [uid]: status,
    }));
  };

  const changeClientRoleTo = (newRole: ClientRole) => {
    updateRtcProps(newRole);
    broadcastUserAttributes(
      [{key: 'role', value: newRole.toString()}],
      controlMessageEnum.clientRoleChanged,
    );
  };

  const notifyAllHostsInChannel = (ctrlEnum: LiveStreamControlMessageEnum) => {
    sendControlMessage(ctrlEnum);
  };

  /****************** HOST CONTROLS ******************
   * Host controls for Live Streaming
   * a. Host can approve streaming request sent by audience
   * b. Host can reject streaming request sent by audience
   */

  const hostApprovesRequestOfUID = (uid: number | string) => {
    addOrUpdateLiveStreamRequest(uid, requestStatus.Approved);
    sendControlMessageToUid(
      LiveStreamControlMessageEnum.raiseHandRequestAccepted,
      uid,
    );
  };

  const hostRejectsRequestOfUID = (uid: number | string) => {
    addOrUpdateLiveStreamRequest(uid, requestStatus.Cancelled);
    sendControlMessageToUid(
      LiveStreamControlMessageEnum.raiseHandRequestRejected,
      uid,
    );
  };

  /****************** AUDIENCE CONTROLS ****************
   * Audience have below controls
   * a. Audience can raise a request to live stream
   * b. Audience can recalls his request to live stream
   *   i. While recalling the request could be either approved or not approved
   */

  const audienceSendsRequest = () => {
    showToast('Request sent to host for approval');
    setRaiseHandRequestActive(true);
    sendControlMessage(LiveStreamControlMessageEnum.raiseHandRequest);
  };

  const audienceRecallsRequest = () => {
    /**
     * if: Check if request is already approved
     * else: Audience Request was not approved by host, and was in 'Awaiting Action' status
     */
    if (localMe && localMe.current?.status === requestStatus.Approved) {
      stopUserScreenShare();
      setRaiseHandRequestActive(false);
      /// Change role and send message in channel notifying the same
      changeClientRoleTo(ClientRole.Audience);
      notifyAllHostsInChannel(
        LiveStreamControlMessageEnum.notifyAllRequestRejected,
      );
    } else {
      setRaiseHandRequestActive(false);
      // Send message in channel to withdraw the request
      sendControlMessage(LiveStreamControlMessageEnum.raiseHandRequestRecall);
    }
  };

  return (
    <LiveStreamContext.Provider
      value={{
        currLiveStreamRequest,
        hostApprovesRequestOfUID,
        hostRejectsRequestOfUID,
        audienceSendsRequest,
        audienceRecallsRequest,
        raiseHandRequestActive,
        setRaiseHandRequestActive,
      }}>
      {props.children}
    </LiveStreamContext.Provider>
  );
};

export default LiveStreamContext;
