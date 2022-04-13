import React, {createContext, useContext, useState, useReducer} from 'react';
import ChatContext, {
  controlMessageEnum,
  messageChannelType,
} from '../ChatContext';
import Toast from '../../../react-native-toast-message';
import {
  LiveStreamControlMessageEnum,
  LSNotificationObject,
  liveStreamContext,
  liveStreamPropsInterface,
  raiseHandItemInterface,
  RaiseHandValue,
} from './Types';
import {ClientRole} from '../../../agora-rn-uikit';
import ScreenshareContext from '../../subComponents/screenshare/ScreenshareContext';
import {filterObject, isEmptyObject} from '../../utils';

const LiveStreamContext = createContext(null as unknown as liveStreamContext);

export const LiveStreamContextConsumer = LiveStreamContext.Consumer;

export const LiveStreamContextProvider = (props: liveStreamPropsInterface) => {
  const screenshareContextInstance = useContext(ScreenshareContext);

  const {
    userList,
    localUid,
    sendControlMessageToUid,
    broadcastUserAttributes,
    events,
    raiseHandList,
    setRaiseHandList,
    sendLevel2message,
  } = useContext(ChatContext);

  const {isHost, setRtcProps} = props;

  const [lastCheckedRequestTimestamp, setLastCheckedRequestTimestamp] =
    useState(0);

  const [lastRequestReceivedTimestamp, setLastRequestReceivedTimestamp] =
    useState(0);

  const [isPendingRequestToReview, setPendingRequestToReview] = useState(false);

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

  const getAttendeeName = (uid: number | string) => {
    return userList[uid] ? userList[uid]?.name : 'user';
  };

  const addOrUpdateLiveStreamRequest = (
    userUID: number,
    payload: raiseHandItemInterface,
  ) => {
    if (userUID && !isEmptyObject(payload)) {
      setRaiseHandList((oldRaisedHandList) => ({
        ...oldRaisedHandList,
        [userUID.toString()]: {
          raised: payload?.raised || RaiseHandValue.FALSE,
          ts: payload?.ts || Date.now(),
        },
      }));
    }
  };

  const changeClientRoleTo = (newRole: ClientRole) => {
    updateRtcProps(newRole);
    broadcastUserAttributes(
      [{key: 'role', value: newRole.toString()}],
      controlMessageEnum.clientRoleChanged,
    );
  };

  // Get feeback for performance wise from @nitesh
  const pendingRequests = filterObject(
    raiseHandList,
    ([k, v]) =>
      v?.raised === RaiseHandValue.TRUE &&
      userList[k]?.role === ClientRole.Audience,
  );

  React.useEffect(() => {
    // Get the time timestamp of recent request
    const recentRequest = Object.values(pendingRequests).sort(
      (a, b) => b?.ts - a?.ts || 0,
    )[0]; // sorting in descending order and take the first request

    if (recentRequest?.ts) {
      setLastRequestReceivedTimestamp(recentRequest.ts);
    }
    if (Object.keys(pendingRequests).length === 0) {
      setPendingRequestToReview(false);
    }
  }, [raiseHandList, userList]);

  React.useEffect(() => {
    if (
      Object.keys(pendingRequests).length !== 0 &&
      lastRequestReceivedTimestamp >= lastCheckedRequestTimestamp
    ) {
      setPendingRequestToReview(true);
    } else {
      setPendingRequestToReview(false);
    }
  }, [lastRequestReceivedTimestamp, lastCheckedRequestTimestamp]);

  /** ******* EVENT LISTENERS SECTION BEGINS ******* */

  React.useEffect(() => {
    events.on(
      messageChannelType.Public,
      'onLiveStreamActionsForHost',
      (data: any, error: any) => {
        if (!data) return;
        if (!isHost) return;
        switch (data.msg) {
          // 1. All Hosts in channel update raised status to "true" when attendee raise their hand
          case LiveStreamControlMessageEnum.raiseHandRequest:
            showToast(
              `${getAttendeeName(data.uid)} ${
                LSNotificationObject.RAISE_HAND_RECEIVED
              }`,
            );
            addOrUpdateLiveStreamRequest(data.uid, {
              ts: parseInt(data.ts),
              raised: RaiseHandValue.TRUE,
            });
            break;
          // 2. All Hosts in channel update raised status to "false" when attendee recalls their request
          case LiveStreamControlMessageEnum.raiseHandRequestRecall:
            showToast(
              `${getAttendeeName(data.uid)} ${
                LSNotificationObject.RAISE_HAND_REQUEST_RECALL
              }`,
            );
            addOrUpdateLiveStreamRequest(data.uid, {
              ts: data.ts,
              raised: RaiseHandValue.FALSE,
            });
            break;
          // 3. All Hosts in channel gets notified when an attendee's request gets approved
          case LiveStreamControlMessageEnum.notifyAllRequestApproved:
            addOrUpdateLiveStreamRequest(data.uid, {
              ts: data.ts,
              raised: RaiseHandValue.TRUE,
            });
            break;
          // 4. All Hosts in channel gets notified when an attendee's request gets rejected
          case LiveStreamControlMessageEnum.notifyAllRequestRejected:
            addOrUpdateLiveStreamRequest(data.uid, {
              ts: data.ts,
              raised: RaiseHandValue.FALSE,
            });
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
          // 1. Audience receives this when the request is accepted by host
          case LiveStreamControlMessageEnum.raiseHandRequestAccepted:
            if (raiseHandList[localUid]?.raised === RaiseHandValue.FALSE)
              return;
            showToast(LSNotificationObject.RAISE_HAND_ACCEPTED);
            // Promote user's privileges to host
            changeClientRoleTo(ClientRole.Broadcaster);
            // Audience updates its local attributes and notfies all host when request is approved
            sendLevel2message(
              [{key: 'raised', value: RaiseHandValue.TRUE}],
              LiveStreamControlMessageEnum.notifyAllRequestApproved,
              setRaiseHandList,
            );
            break;
          // 2. Audience receives this when the request is rejected by host
          case LiveStreamControlMessageEnum.raiseHandRequestRejected:
            showToast(LSNotificationObject.RAISE_HAND_REJECTED);
            // Audience updates its local attributes and notfies all host when request is rejected
            sendLevel2message(
              [{key: 'raised', value: RaiseHandValue.FALSE}],
              LiveStreamControlMessageEnum.notifyAllRequestRejected,
              setRaiseHandList,
            );
            break;
          // 3. Audience receives this when host demotes (rejected after approval)
          case LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall:
            showToast(LSNotificationObject.RAISE_HAND_APPROVED_REQUEST_RECALL);
            screenshareContextInstance?.stopUserScreenShare(); // This will not exist on ios
            // Demote user's privileges to audience
            changeClientRoleTo(ClientRole.Audience);
            // Audience updates its local attributes and notfies all host when they(audience) are demoted from host
            sendLevel2message(
              [{key: 'raised', value: RaiseHandValue.FALSE}],
              LiveStreamControlMessageEnum.notifyAllRequestRejected,
              setRaiseHandList,
            );
            break;
          // 4. Audience when receives kickUser notifies all host when is kicked out
          case controlMessageEnum.kickUser:
            // Audience updates its local attributes and notfies all host when they(audience) are kicked out
            sendLevel2message(
              [{key: 'raised', value: RaiseHandValue.FALSE}],
              LiveStreamControlMessageEnum.notifyAllRequestRejected,
              setRaiseHandList,
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
  }, [events, localUid, isHost, userList, raiseHandList]);

  /** ******* EVENT LISTENERS SECTION ENDS ******* */

  /** ******* HOST CONTROLS SECTION BEGINS *******
   * Host controls for Live Streaming
   * a. Host can approve streaming request sent by audience
   * b. Host can reject streaming request sent by audience
   */

  const hostApprovesRequestOfUID = (uid: number) => {
    addOrUpdateLiveStreamRequest(uid, {
      raised: RaiseHandValue.TRUE,
      ts: new Date().getTime(),
    });
    sendControlMessageToUid(
      LiveStreamControlMessageEnum.raiseHandRequestAccepted,
      uid,
    );
  };

  const hostRejectsRequestOfUID = (uid: number) => {
    addOrUpdateLiveStreamRequest(uid, {
      raised: RaiseHandValue.FALSE,
      ts: new Date().getTime(),
    });
    sendControlMessageToUid(
      LiveStreamControlMessageEnum.raiseHandRequestRejected,
      uid,
    );
  };

  /** ******* HOST CONTROLS SECTION ENDS ******* */

  /** ******* AUDIENCE CONTROLS SECTION BEGINS *******
   * Audience have below controls
   * a. Audience can raise a request to live stream
   * b. Audience can recalls his request to live stream
   *   i. While recalling the request could be either approved or not approved
   */

  const audienceSendsRequest = async (): Promise<void> => {
    // If hand is already raised, skip the call
    if (raiseHandList[localUid]?.raised === RaiseHandValue.TRUE) return;
    showToast(LSNotificationObject.RAISE_HAND_REQUEST);
    sendLevel2message(
      [{key: 'raised', value: RaiseHandValue.TRUE}],
      LiveStreamControlMessageEnum.raiseHandRequest,
      setRaiseHandList,
    );
  };

  const audienceRecallsRequest = async (): Promise<void> => {
    // If hand is already down, skip the call
    if (raiseHandList[localUid]?.raised === RaiseHandValue.FALSE) return;
    /**
     * if: Check if request is already approved
     * else: Audience Request was not approved by host, and was pending
     */
    if (
      userList[localUid]?.role == ClientRole.Broadcaster &&
      raiseHandList[localUid]?.raised === RaiseHandValue.TRUE
    ) {
      screenshareContextInstance?.stopUserScreenShare(); // This will not exist on ios
      /// Change role and send message in channel notifying the same
      changeClientRoleTo(ClientRole.Audience);
      sendLevel2message(
        [{key: 'raised', value: RaiseHandValue.FALSE}],
        LiveStreamControlMessageEnum.notifyAllRequestRejected,
        setRaiseHandList,
      );
    } else {
      // Send message in channel to withdraw the request
      sendLevel2message(
        [{key: 'raised', value: RaiseHandValue.FALSE}],
        LiveStreamControlMessageEnum.raiseHandRequestRecall,
        setRaiseHandList,
      );
    }
    showToast(LSNotificationObject.RAISE_HAND_REQUEST_RECALL_LOCAL);
  };

  /** ******* AUDIENCE CONTROLS SECTION ENDS ******* */

  return (
    <LiveStreamContext.Provider
      value={{
        setLastCheckedRequestTimestamp,
        isPendingRequestToReview,
        raiseHandList,
        hostApprovesRequestOfUID,
        hostRejectsRequestOfUID,
        audienceSendsRequest,
        audienceRecallsRequest,
      }}>
      {props.children}
    </LiveStreamContext.Provider>
  );
};

export default LiveStreamContext;
