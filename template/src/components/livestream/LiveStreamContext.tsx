import React, {createContext, useContext, useState, useRef} from 'react';
import ChatContext, {
  controlMessageEnum,
  messageChannelType,
  attrRequestTypes,
} from '../ChatContext';
import Toast from '../../../react-native-toast-message';
import {
  LiveStreamControlMessageEnum,
  LSNotificationObject,
  liveStreamContext,
  requestStatus,
  requestInterface,
  attrRequestStatus,
  attrRequestInterface,
  liveStreamPropsInterface,
} from './Types';
import {ClientRole} from '../../../agora-rn-uikit';
import ScreenshareContext from '../../subComponents/screenshare/ScreenshareContext';
import {filterObject} from '../../utils';

const LiveStreamContext = createContext(null as unknown as liveStreamContext);

export const LiveStreamContextConsumer = LiveStreamContext.Consumer;

export const LiveStreamContextProvider = (props: liveStreamPropsInterface) => {
  const screenshareContextInstance = useContext(ScreenshareContext);

  const {
    userList,
    localUid,
    sendControlMessageToUid,
    sendControlMessage,
    broadcastUserAttributes,
    addOrUpdateLocalUserAttributes,
    events,
  } = useContext(ChatContext);

  const {isHost, setRtcProps} = props;

  const [currLiveStreamRequest, setLiveStreamRequest] = useState<
    Partial<Record<string, requestInterface>>
  >({});

  const [uidsOfInitialRequests, setUidsOfInitialRequests] = useState<
    attrRequestInterface[]
  >([]);

  const [activeLiveStreamRequest, setActiveLiveStreamRequest] = useState<
    Partial<Record<string, requestInterface>>
  >({});

  const [raiseHandRequestActive, setRaiseHandRequestActive] = useState(false);

  const [lastCheckedRequestTimestamp, setLastCheckedRequestTimestamp] =
    useState(0);

  const [lastRequestReceivedTimestamp, setLastRequestReceivedTimestamp] =
    useState(0);

  const [isPendingRequestToReview, setPendingRequestToReview] = useState(false);

  const localUserRef = useRef({uid: localUid, status: ''});

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

  React.useEffect(() => {
    setActiveLiveStreamRequest(
      filterObject(
        currLiveStreamRequest,
        ([k, v]) => v?.status === requestStatus.AwaitingAction,
      ),
    );
  }, [currLiveStreamRequest]);

  React.useEffect(() => {
    // Get the time timestamp of recent request
    const recentRequest = Object.values(activeLiveStreamRequest).sort(
      (a, b) => b?.ts - a?.ts || 0,
    )[0]; // sorting in descending order and take the first request

    if (recentRequest?.ts) {
      setLastRequestReceivedTimestamp(recentRequest.ts);
    }
    if (Object.keys(activeLiveStreamRequest).length === 0) {
      setPendingRequestToReview(false);
    }
  }, [activeLiveStreamRequest]);

  React.useEffect(() => {
    if (
      // If active requests and last seen is less than last message received
      Object.keys(activeLiveStreamRequest).length !== 0 &&
      lastRequestReceivedTimestamp >= lastCheckedRequestTimestamp
    ) {
      setPendingRequestToReview(true);
    } else {
      setPendingRequestToReview(false);
    }
  }, [lastRequestReceivedTimestamp, lastCheckedRequestTimestamp]);

  React.useEffect(() => {
    // Remove requests for users who are offline
    setLiveStreamRequest(
      filterObject(
        currLiveStreamRequest,
        ([k, v]) => userList[k] && !userList[k]?.offline,
      ),
    );

    // Check attribute of user joined if it has request livestreaming attribute
    const uidsOfUsersHavingLSRequest: attrRequestInterface[] = Object.keys(
      filterObject(
        userList,
        ([k, v]) =>
          v?.requests === attrRequestStatus.RaiseHand_AwaitingAction ||
          v?.requests === attrRequestStatus.RaiseHand_Approved,
      ),
    ).map((key) => ({
      uid: key,
      status:
        userList[key]?.requests || attrRequestStatus.RaiseHand_AwaitingAction,
    }));

    // console.log('uidsOfUsersHavingLSRequest', uidsOfUsersHavingLSRequest);
    // Set uids of user who have active live streaming request
    setUidsOfInitialRequests([...uidsOfUsersHavingLSRequest]);
  }, [userList]);

  React.useEffect(() => {
    // Filter new requests
    const initialRequests = uidsOfInitialRequests
      .filter(
        (item: attrRequestInterface) => !currLiveStreamRequest?.[item.uid],
      )
      .reduce((acc, item) => {
        return {
          ...acc,
          [item.uid]: {
            uid: item.uid,
            ts: new Date().getTime(),
            status:
              item.status === attrRequestStatus.RaiseHand_Approved
                ? requestStatus.Approved
                : requestStatus.AwaitingAction,
          },
        };
      }, {});
    setLiveStreamRequest((oldLiveStreamRequest) => ({
      ...oldLiveStreamRequest,
      ...initialRequests,
    }));
  }, [uidsOfInitialRequests]);

  // Events listening section

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
            showToast(
              `${getAttendeeName(data.uid)} ${
                LSNotificationObject.RAISE_HAND_RECEIVED
              }`,
            );
            addOrUpdateLiveStreamRequest({
              uid: data.uid,
              ts: data.ts,
              status: requestStatus.AwaitingAction,
            });
            break;
          // 2. All Hosts in channel update their status when a audience recalls his request
          case LiveStreamControlMessageEnum.raiseHandRequestRecall:
            showToast(
              `${getAttendeeName(data.uid)} ${
                LSNotificationObject.RAISE_HAND_REQUEST_RECALL
              }`,
            );
            addOrUpdateLiveStreamRequest({
              uid: data.uid,
              ts: data.ts,
              status: requestStatus.Cancelled,
            });
            break;
          // 3. All Host in channel update their status when a audience request is approved
          case LiveStreamControlMessageEnum.notifyAllRequestApproved:
            addOrUpdateLiveStreamRequest({
              uid: data.uid,
              ts: data.ts,
              status: requestStatus.Approved,
            });
            break;
          // 4. All Host in channel update their status when a audience request is rejected
          case LiveStreamControlMessageEnum.notifyAllRequestRejected:
            addOrUpdateLiveStreamRequest({
              uid: data.uid,
              ts: data.ts,
              status: requestStatus.Cancelled,
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
            if (!raiseHandRequestActive) return;
            showToast(LSNotificationObject.RAISE_HAND_ACCEPTED);
            // Audience notfies all host when request is approved
            notifyAllHostsInChannel(
              LiveStreamControlMessageEnum.notifyAllRequestApproved,
            );
            changeClientRoleTo(ClientRole.Broadcaster);
            localUserRef.current.status = requestStatus.Approved;
            updateLocalUserAttributes(attrRequestStatus.RaiseHand_Approved);
            break;
          // 2. Audience receives this when the request is cancelled by host
          case LiveStreamControlMessageEnum.raiseHandRequestRejected:
            showToast(LSNotificationObject.RAISE_HAND_REJECTED);
            setRaiseHandRequestActive(false);
            // Audience notfies all host when request is approved
            notifyAllHostsInChannel(
              LiveStreamControlMessageEnum.notifyAllRequestRejected,
            );
            localUserRef.current.status = requestStatus.Cancelled;
            updateLocalUserAttributes(attrRequestTypes.none);
            break;
          // 3. Audience receives this when host demotes (canceled after approval)
          case LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall:
            showToast(LSNotificationObject.RAISE_HAND_APPROVED_REQUEST_RECALL);
            screenshareContextInstance?.stopUserScreenShare(); // This will not exist on ios
            setRaiseHandRequestActive(false);
            // Audience notfies all host when request is rejected
            notifyAllHostsInChannel(
              LiveStreamControlMessageEnum.notifyAllRequestRejected,
            );
            changeClientRoleTo(ClientRole.Audience);
            localUserRef.current.status = requestStatus.Cancelled;
            break;
          // 4. Audience when receives kickUser notifies all host when is kicked out
          case controlMessageEnum.kickUser:
            notifyAllHostsInChannel(
              LiveStreamControlMessageEnum.notifyAllRequestRejected,
            );
            localUserRef.current.status = requestStatus.Cancelled;
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
  }, [events, localUid, isHost, raiseHandRequestActive, userList]);

  const addOrUpdateLiveStreamRequest = (request: requestInterface) => {
    if (request && request?.uid && request?.ts && request?.uid) {
      setLiveStreamRequest((oldLiveStreamRequest) => ({
        ...oldLiveStreamRequest,
        [request?.uid as string]: {
          status: request.status,
          ts: request.ts,
          uid: request.uid,
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

  const notifyAllHostsInChannel = (ctrlEnum: LiveStreamControlMessageEnum) => {
    sendControlMessage(ctrlEnum);
  };

  /****************** HOST CONTROLS ******************
   * Host controls for Live Streaming
   * a. Host can approve streaming request sent by audience
   * b. Host can reject streaming request sent by audience
   */

  const hostApprovesRequestOfUID = (uid: number | string) => {
    addOrUpdateLiveStreamRequest({
      uid,
      ts: new Date().getTime(),
      status: requestStatus.Cancelled,
    });
    sendControlMessageToUid(
      LiveStreamControlMessageEnum.raiseHandRequestAccepted,
      uid,
    );
  };

  const hostRejectsRequestOfUID = (uid: number | string) => {
    addOrUpdateLiveStreamRequest({
      uid,
      ts: new Date().getTime(),
      status: requestStatus.Cancelled,
    });
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
    showToast(LSNotificationObject.RAISE_HAND_REQUEST);
    setRaiseHandRequestActive(true);
    sendControlMessage(LiveStreamControlMessageEnum.raiseHandRequest);
    updateLocalUserAttributes(attrRequestStatus.RaiseHand_AwaitingAction);
  };

  const audienceRecallsRequest = () => {
    /**
     * if: Check if request is already approved
     * else: Audience Request was not approved by host, and was in 'Awaiting Action' status
     */
    if (
      localUserRef &&
      localUserRef.current?.status === requestStatus.Approved
    ) {
      screenshareContextInstance?.stopUserScreenShare(); // This will not exist on ios
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
    updateLocalUserAttributes(attrRequestTypes.none);
    showToast(LSNotificationObject.RAISE_HAND_REQUEST_RECALL_LOCAL);
  };

  const updateLocalUserAttributes = (
    value: attrRequestTypes | attrRequestStatus,
  ) => {
    addOrUpdateLocalUserAttributes([{key: 'requests', value: value}]);
  };

  return (
    <LiveStreamContext.Provider
      value={{
        setLastCheckedRequestTimestamp,
        isPendingRequestToReview,
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
