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
import {ClientRole, useLocalUid, UidType} from '../../../agora-rn-uikit';
import {filterObject, isEmptyObject} from '../../utils';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';
import {useScreenshare} from '../../subComponents/screenshare/useScreenshare';
import events, {EventPersistLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import {useRender} from 'customization-api';

const LiveStreamContext = createContext(null as unknown as liveStreamContext);

export const LiveStreamContextConsumer = LiveStreamContext.Consumer;

export const LiveStreamContextProvider: React.FC<liveStreamPropsInterface> = (
  props,
) => {
  const screenshareContextInstance = useScreenshare();
  const screenshareContextInstanceRef = useRef<any>();
  screenshareContextInstanceRef.current = screenshareContextInstance;

  const {renderList} = useRender();
  const renderListRef = useRef<any>();
  renderListRef.current = renderList;

  const [raiseHandList, setRaiseHandList] = useState<raiseHandListInterface>(
    {},
  );
  const raiseHandListRef = useRef<any>();
  raiseHandListRef.current = raiseHandList;

  React.useEffect(() => {
    renderListRef.current = renderList;
  }, [renderList]);

  React.useEffect(() => {
    raiseHandListRef.current = raiseHandList;
  }, [raiseHandList]);

  const localUid = useLocalUid();
  const localUidRef = useRef<any>();
  localUidRef.current = localUid;

  const {hasUserJoinedRTM} = useContext(ChatContext);

  const {setRtcProps, rtcProps, callActive} = props?.value;
  const {
    data: {isHost},
  } = useMeetingInfo();

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
    return renderListRef.current?.[uid]?.name
      ? renderListRef.current[uid].name
      : 'user';
  };

  const addOrUpdateLiveStreamRequest = (
    userUID: UidType,
    payload: Partial<raiseHandItemInterface>,
  ) => {
    if (userUID && !isEmptyObject(payload)) {
      const userId = `${userUID}`;
      setRaiseHandList((oldRaisedHandList) => ({
        ...oldRaisedHandList,
        [userId]: {
          raised: payload?.raised || RaiseHandValue.FALSE,
          ts: payload?.ts || Date.now(),
          role:
            payload?.role ||
            oldRaisedHandList[userId]?.role ||
            ClientRole.Audience,
        },
      }));
    }
  };

  const changeClientRoleTo = (newRole: ClientRole) => {
    updateRtcProps(newRole);
  };

  const UpdtLocStateAndBCastAttr = (newRole: ClientRole, ts: number) => {
    switch (newRole) {
      case ClientRole.Audience:
        addOrUpdateLiveStreamRequest(localUidRef.current, {
          raised: RaiseHandValue.FALSE,
          ts: ts,
          role: ClientRole.Audience,
        });
        // Audience notfies all host when request is rejected
        events.send(
          EventNames.RAISED_ATTRIBUTE,
          JSON.stringify({
            action: LiveStreamControlMessageEnum.notifyHostsInChannel,
            value: RaiseHandValue.FALSE,
          }),
          EventPersistLevel.LEVEL2,
        );
        break;
      case ClientRole.Broadcaster:
        // Update local state
        addOrUpdateLiveStreamRequest(localUidRef.current, {
          raised: RaiseHandValue.TRUE,
          ts: ts,
          role: ClientRole.Broadcaster,
        });
        // Audience notfies all host when request is approved
        events.send(
          EventNames.RAISED_ATTRIBUTE,
          JSON.stringify({
            action: LiveStreamControlMessageEnum.notifyHostsInChannel,
            value: RaiseHandValue.TRUE,
          }),
          EventPersistLevel.LEVEL2,
        );
      default:
        break;
    }
  };

  // Get feeback for performance wise from @nitesh
  const pendingRequests = filterObject(
    raiseHandList,
    ([k, v]) =>
      v?.raised === RaiseHandValue.TRUE && v?.role == ClientRole.Audience,
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
  }, [raiseHandList]);

  React.useEffect(() => {
    if (
      // Only true host should see the pending request
      Object.keys(pendingRequests).length !== 0 &&
      lastRequestReceivedTimestamp >= lastCheckedRequestTimestamp &&
      isHost
    ) {
      setPendingRequestToReview(true);
    } else {
      setPendingRequestToReview(false);
    }
  }, [lastRequestReceivedTimestamp, lastCheckedRequestTimestamp]);

  /** ******* SETTING UP ROLES BEGINS ******* */
  React.useEffect(() => {
    events.on(EventNames.ROLE_ATTRIBUTE, (data) => {
      setRaiseHandList((prevState) => {
        return {
          ...prevState,
          [data.sender]: {
            ...prevState[data.sender],
            role:
              data.payload in ClientRole
                ? parseInt(data.payload)
                : ClientRole.Audience,
          },
        };
      });
    });
  }, []);

  React.useEffect(() => {
    if (!callActive || !hasUserJoinedRTM) return;
    events.send(
      EventNames.ROLE_ATTRIBUTE,
      JSON.stringify(
        rtcProps.role in ClientRole ? rtcProps.role : ClientRole.Audience,
      ),
      EventPersistLevel.LEVEL2,
    );
    setRaiseHandList((prevState) => {
      return {
        ...prevState,
        [localUid]: {
          ...prevState[localUid],
          role:
            rtcProps.role in ClientRole ? rtcProps.role : ClientRole.Audience,
        },
      };
    });
  }, [callActive, rtcProps.role, hasUserJoinedRTM]);

  /** ******* SETTING UP ROLES ENDS ********/

  /** ******* EVENT LISTENERS SECTION BEGINS ******* */

  React.useEffect(() => {
    /** ********************** HOST EVENTS SECTION BEGINS ********************** */
    events.on(EventNames.RAISED_ATTRIBUTE, (data) => {
      if (!isHost) return;
      const payload = JSON.parse(data.payload);
      const action = payload.action;
      const value = payload.value;

      switch (action) {
        // 1. Host can receive raise hand request with true or false value
        case LiveStreamControlMessageEnum.raiseHandRequest:
          switch (value) {
            case RaiseHandValue.TRUE:
              // Step 1: Show notifications
              showToast(
                `${getAttendeeName(data.sender)} ${
                  LSNotificationObject.RAISE_HAND_RECEIVED
                }`,
              );
              // 2. All Hosts in channel update their raised state to "true" when attendee raise their hand
              addOrUpdateLiveStreamRequest(data.sender, {
                ts: data.ts,
                raised: RaiseHandValue.TRUE,
                role: ClientRole.Audience,
              });
              break;
            case RaiseHandValue.FALSE:
              // Step 1: Show notifications
              showToast(
                `${getAttendeeName(data.sender)} ${
                  LSNotificationObject.RAISE_HAND_REQUEST_RECALL
                }`,
              );
              // 2. All Hosts in channel update raised state to "false" when attendee recalls their request
              addOrUpdateLiveStreamRequest(data.sender, {
                ts: data.ts,
                raised: RaiseHandValue.FALSE,
                role: ClientRole.Audience,
              });
            default:
              break;
          }
          break;
        // 2. All Hosts in channel gets notified when an attendee's request gets approved or rejected
        case LiveStreamControlMessageEnum.notifyHostsInChannel:
          if (!isHost) return;
          switch (value) {
            case RaiseHandValue.TRUE:
              addOrUpdateLiveStreamRequest(data.sender, {
                ts: data.ts,
                raised: RaiseHandValue.TRUE,
                role: ClientRole.Broadcaster,
              });
              break;
            case RaiseHandValue.FALSE:
              addOrUpdateLiveStreamRequest(data.sender, {
                ts: data.ts,
                raised: RaiseHandValue.FALSE,
                role: ClientRole.Audience,
              });
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
    });
    /** ********************** HOST EVENTS SECTION ENDS ********************** */

    /** ********************** AUDIENCE EVENTS SECTION BEGINS ********************** */
    // 1. Audience receives this when the request is accepted by host
    events.on(LiveStreamControlMessageEnum.raiseHandRequestAccepted, (data) => {
      if (raiseHandList[localUidRef.current]?.raised === RaiseHandValue.FALSE)
        return;
      showToast(LSNotificationObject.RAISE_HAND_ACCEPTED);
      // Promote user's privileges to host
      changeClientRoleTo(ClientRole.Broadcaster);
      // Audience updates its local attributes and notfies all host when request is approved
      UpdtLocStateAndBCastAttr(ClientRole.Broadcaster, data.ts);
    });
    /** 2. Audience receives this when the request is rejected by host
     * 2.a  Audience receives this when the request is rejected by host which is not yet approved
     * 2.b  Audience receives this when the request when is demoted by the host
     */
    events.on(LiveStreamControlMessageEnum.raiseHandRequestRejected, (data) => {
      /** 2.a */
      if (
        raiseHandListRef.current[localUidRef.current].role ==
        ClientRole.Audience
      ) {
        showToast(LSNotificationObject.RAISE_HAND_REJECTED);
      } else if (
        raiseHandListRef.current[localUidRef.current].role ==
        ClientRole.Broadcaster
      ) {
        /** 2.b */
        showToast(LSNotificationObject.RAISE_HAND_APPROVED_REQUEST_RECALL);
        screenshareContextInstanceRef?.current?.stopUserScreenShare(); // This will not exist on ios

        // Demote user's privileges to audience
        changeClientRoleTo(ClientRole.Audience);
      }
      // Audience updates its local attributes and notfies all host when demoted/request rejected
      UpdtLocStateAndBCastAttr(ClientRole.Audience, data.ts);
    });
    // 3. Audience when receives kickUser notifies all host when is kicked out
    events.on(controlMessageEnum.kickUser, (data) => {
      // Audience updates its local attributes and notfies all host when they(audience) are kicked out
      UpdtLocStateAndBCastAttr(ClientRole.Audience, data.ts);
    });
    /** ********************** AUDIENCE EVENTS SECTION ENDS ********************** */
  }, []);

  /** ******* EVENT LISTENERS SECTION ENDS ******* */

  /** ******* HOST CONTROLS SECTION BEGINS ******* */
  /* Host controls for Live Streaming
   * a. Host can approve streaming request sent by audience
   * b. Host can reject streaming request sent by audience
   */

  const hostApprovesRequestOfUID = (uid: UidType) => {
    addOrUpdateLiveStreamRequest(uid, {
      raised: RaiseHandValue.TRUE,
      ts: new Date().getTime(),
    });
    events.send(
      LiveStreamControlMessageEnum.raiseHandRequestAccepted,
      '',
      EventPersistLevel.LEVEL1,
      uid,
    );
  };

  const hostRejectsRequestOfUID = (uid: UidType) => {
    addOrUpdateLiveStreamRequest(uid, {
      raised: RaiseHandValue.FALSE,
      ts: new Date().getTime(),
    });
    events.send(
      LiveStreamControlMessageEnum.raiseHandRequestRejected,
      '',
      EventPersistLevel.LEVEL1,
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
    if (raiseHandList[localUidRef.current]?.raised === RaiseHandValue.TRUE)
      return;
    showToast(LSNotificationObject.RAISE_HAND_REQUEST);
    events.send(
      EventNames.RAISED_ATTRIBUTE,
      JSON.stringify({
        action: LiveStreamControlMessageEnum.raiseHandRequest,
        value: RaiseHandValue.TRUE,
      }),
      EventPersistLevel.LEVEL1,
    );
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
      raiseHandList[localUidRef.current]?.role == ClientRole.Broadcaster &&
      raiseHandList[localUidRef.current]?.raised === RaiseHandValue.TRUE
    ) {
      screenshareContextInstanceRef?.current?.stopUserScreenShare(); // This will not exist on ios
      // Change role
      changeClientRoleTo(ClientRole.Audience);
    }
    UpdtLocStateAndBCastAttr(ClientRole.Audience, new Date().getTime());
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
