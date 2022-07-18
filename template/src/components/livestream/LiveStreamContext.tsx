import React, {createContext, useContext, useState, useRef} from 'react';
import ChatContext, {controlMessageEnum} from '../ChatContext';
import Toast from '../../../react-native-toast-message';
import {
  LiveStreamControlMessageEnum,
  LSNotificationObject,
  liveStreamContext,
  liveStreamPropsInterface,
  raiseHandItemInterface,
  RaiseHandValue,
  raiseHandListInterface,
} from './Types';
import {ClientRole} from '../../../agora-rn-uikit';
import {filterObject, isEmptyObject} from '../../utils';
import {useString} from '../../utils/useString';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';
import useUserList from '../../utils/useUserList';
import {useScreenshare} from '../../subComponents/screenshare/useScreenshare';
import {useLiveStreamDataContext} from '../contexts/LiveStreamDataContext';
import CustomEvents from '../../custom-events/CustomEvents';

const LiveStreamContext = createContext(null as unknown as liveStreamContext);

export const LiveStreamContextConsumer = LiveStreamContext.Consumer;

export const LiveStreamContextProvider = (props: liveStreamPropsInterface) => {
  const raiseHandRemoteHostNotification = useString(
    'raiseHandRemoteHostNotification',
  );
  const lowerHandRemoteHostNotification = useString(
    'lowerHandRemoteHostNotification',
  );
  const raiseHandApprovedLocalNotification = useString(
    'raiseHandApprovedLocalNotification',
  )();
  const raiseHandRejectedLocalNotification = useString(
    'raiseHandRejectedLocalNotification',
  )();
  const raiseHandRevokedLocalNotification = useString(
    'raiseHandRevokedLocalNotification',
  )();
  const raiseHandLocalNotification = useString('raiseHandLocalNotification')();
  const lowerHandsLocalNotification = useString(
    'lowerHandsLocalNotification',
  )();
  const screenshareContextInstance = useScreenshare();
  const {renderList} = useUserList();
  const userListRef = useRef<any>();
  userListRef.current = renderList;
  const {liveStreamData} = useLiveStreamDataContext();
  console.log('liveStreamData: ', liveStreamData);
  const [raiseHandList, setRaiseHandList] = useState<raiseHandListInterface>(
    {},
  );
  const {localUid, broadcastUserAttributes} = useContext(ChatContext);
  const localUidRef = useRef<any>();
  localUidRef.current = localUid;

  const {setRtcProps} = props?.value;
  const {isHost} = useMeetingInfo();

  React.useEffect(() => {
    userListRef.current = renderList;
  }, [renderList]);

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
    return userListRef.current?.[uid]?.name
      ? userListRef.current[uid].name
      : 'user';
  };

  const addOrUpdateLiveStreamRequest = (
    userUID: string,
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
    // Doubt here
    CustomEvents.send('on-client-role-changed', {
      value: newRole.toString(),
      level: 2,
      attributes: [{key: 'role', value: newRole.toString()}],
    });
  };

  // Get feeback for performance wise from @nitesh
  const pendingRequests = filterObject(
    raiseHandList,
    ([k, v]) =>
      v?.raised === RaiseHandValue.TRUE &&
      renderList[k]?.role === ClientRole.Audience,
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
  }, [raiseHandList, renderList]);

  React.useEffect(() => {
    if (
      // Only host should see the pending request
      Object.keys(pendingRequests).length !== 0 &&
      lastRequestReceivedTimestamp >= lastCheckedRequestTimestamp &&
      renderList[localUidRef.current]?.role === ClientRole.Broadcaster
    ) {
      setPendingRequestToReview(true);
    } else {
      setPendingRequestToReview(false);
    }
  }, [lastRequestReceivedTimestamp, lastCheckedRequestTimestamp]);

  /** ******* EVENT LISTENERS SECTION BEGINS ******* */

  React.useEffect(() => {
    /** ********************** HOST EVENTS SECTION BEGINS ********************** */
    // 1. Host can receive raise hand request with true or false value
    CustomEvents.on(LiveStreamControlMessageEnum.raiseHandRequest, (data) => {
      if (!isHost) return;
      // Step 1: Show notifications
      if (data.payload.value === RaiseHandValue.TRUE) {
        // a. All Hosts in channel update raised status to "true" when attendee raise their hand
        showToast(
          `${getAttendeeName(data.sender)} ${
            LSNotificationObject.RAISE_HAND_RECEIVED
          }`,
        );
      } else if (data.payload.value === RaiseHandValue.FALSE) {
        // b. All Hosts in channel update raised status to "false" when attendee recalls their request
        showToast(
          `${getAttendeeName(data.sender)} ${
            LSNotificationObject.RAISE_HAND_REQUEST_RECALL
          }`,
        );
      }
      // 2. Update state
      addOrUpdateLiveStreamRequest(data.sender, {
        ts: data.ts,
        raised: data.payload.value,
      });
    });
    // 2. All Hosts in channel gets notified when an attendee's request gets approved or rejected
    CustomEvents.on(
      LiveStreamControlMessageEnum.notifyHostsInChannel,
      (data) => {
        if (!isHost) return;
        addOrUpdateLiveStreamRequest(data.sender, {
          ts: data.ts,
          raised: data.payload.value,
        });
      },
    );
    /** ********************** HOST EVENTS SECTION ENDS ********************** */

    /** ********************** AUDIENCE EVENTS SECTION BEGINS ********************** */
    // 1. Audience receives this when the request is accepted by host
    CustomEvents.on(
      LiveStreamControlMessageEnum.raiseHandRequestAccepted,
      (data) => {
        if (raiseHandList[localUidRef.current]?.raised === RaiseHandValue.FALSE)
          return;
        showToast(LSNotificationObject.RAISE_HAND_ACCEPTED);
        // Promote user's privileges to host
        changeClientRoleTo(ClientRole.Broadcaster);
        // Audience updates its local attributes and notfies all host when request is approved
        CustomEvents.send(LiveStreamControlMessageEnum.notifyHostsInChannel, {
          value: RaiseHandValue.TRUE,
        });
        addOrUpdateLiveStreamRequest(localUidRef.current, {
          ts: data.ts,
          raised: RaiseHandValue.TRUE,
        });
      },
    );
    /** 2. Audience receives this when the request is rejected by host
     * 2.a  Audience receives this when the request is rejected by host which is not yet approved
     * 2.b  Audience receives this when the request is rejected by host which was approved
     */
    CustomEvents.on(
      LiveStreamControlMessageEnum.raiseHandRequestRejected,
      (data) => {
        /** 2.a */
        console.log('supriya userListRef', userListRef);
        console.log('supriya localUidRef', localUidRef);
        if (
          userListRef.current[localUidRef.current].role == ClientRole.Audience
        ) {
          showToast(LSNotificationObject.RAISE_HAND_REJECTED);
        } else if (
          userListRef.current[localUidRef.current].role ==
          ClientRole.Broadcaster
        ) {
          /** 2.b */
          showToast(LSNotificationObject.RAISE_HAND_APPROVED_REQUEST_RECALL);
          screenshareContextInstance?.stopUserScreenShare(); // This will not exist on ios
          // Demote user's privileges to audience
          changeClientRoleTo(ClientRole.Audience);
        }
        // Audience notifies all host when request is rejected
        CustomEvents.send(LiveStreamControlMessageEnum.notifyHostsInChannel, {
          value: RaiseHandValue.FALSE,
        });
        // TODO: Need to update local users raised attribute
        addOrUpdateLiveStreamRequest(localUidRef.current, {
          ts: data.ts,
          raised: RaiseHandValue.FALSE,
        });
      },
    );
    // 4. Audience when receives kickUser notifies all host when is kicked out
    CustomEvents.on(controlMessageEnum.kickUser, (data) => {
      // Audience updates its local attributes and notfies all host when they(audience) are kicked out
      CustomEvents.send(LiveStreamControlMessageEnum.notifyHostsInChannel, {
        value: RaiseHandValue.FALSE,
        level: 2,
        attributes: [{key: 'raised', value: RaiseHandValue.FALSE}],
      });
    });
    /** ********************** AUDIENCE EVENTS SECTION ENDS ********************** */
  }, []);

  /** ******* EVENT LISTENERS SECTION ENDS ******* */

  /** ******* HOST CONTROLS SECTION BEGINS ******* */
  /* Host controls for Live Streaming
   * a. Host can approve streaming request sent by audience
   * b. Host can reject streaming request sent by audience
   */

  const hostApprovesRequestOfUID = (uid: number) => {
    addOrUpdateLiveStreamRequest(uid.toString(), {
      raised: RaiseHandValue.TRUE,
      ts: new Date().getTime(),
    });
    CustomEvents.send(
      LiveStreamControlMessageEnum.raiseHandRequestAccepted,
      {},
      uid.toString(),
    );
  };

  const hostRejectsRequestOfUID = (uid: number) => {
    addOrUpdateLiveStreamRequest(uid.toString(), {
      raised: RaiseHandValue.FALSE,
      ts: new Date().getTime(),
    });
    CustomEvents.send(
      LiveStreamControlMessageEnum.raiseHandRequestRejected,
      {},
      uid.toString(),
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
    if (raiseHandList[localUidRef.current]?.raised === RaiseHandValue.TRUE)
      return;
    showToast(LSNotificationObject.RAISE_HAND_REQUEST);
    CustomEvents.send(LiveStreamControlMessageEnum.raiseHandRequest, {
      value: RaiseHandValue.TRUE,
      level: 2,
      attributes: [{key: 'raised', value: RaiseHandValue.TRUE}],
    });
    // Update local state
    addOrUpdateLiveStreamRequest(localUidRef.current, {
      raised: RaiseHandValue.TRUE,
      ts: new Date().getTime(),
    });
  };

  const audienceRecallsRequest = async (): Promise<void> => {
    // If hand is already down, skip the call
    if (raiseHandList[localUidRef.current]?.raised === RaiseHandValue.FALSE)
      return;
    /**
     * if: Check if request is already approved
     * else: Audience Request was not approved by host, and was pending
     */
    if (
      renderList[localUidRef.current]?.role == ClientRole.Broadcaster &&
      raiseHandList[localUidRef.current]?.raised === RaiseHandValue.TRUE
    ) {
      screenshareContextInstance?.stopUserScreenShare(); // This will not exist on ios
      // Change role
      changeClientRoleTo(ClientRole.Audience);
    }
    // send message in channel notifying the same
    CustomEvents.send(LiveStreamControlMessageEnum.raiseHandRequest, {
      value: RaiseHandValue.FALSE,
      level: 2,
      attributes: [{key: 'raised', value: RaiseHandValue.FALSE}],
    });
    // Update local state
    addOrUpdateLiveStreamRequest(localUidRef.current, {
      raised: RaiseHandValue.FALSE,
      ts: new Date().getTime(),
    });
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
