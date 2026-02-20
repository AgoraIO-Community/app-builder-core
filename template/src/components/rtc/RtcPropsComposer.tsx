/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the "Materials") are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.'s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/

/*
 * RtcPropsComposer
 * - Derives RTC engine config from roomInfo (single source of truth)
 * - Assembles the full PropsInterface value (rtcProps + callbacks + styleProps + mode)
 *   so VideoCall / BreakoutVideoCall can pass it directly to <PropsProvider>
 * - Allows overrides for engine-specific settings not in roomInfo
 * - Separates product state (roomInfo) from engine config (rtcProps)
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {useCustomization} from 'customization-implementation';
import {
  RtcPropsInterface,
  CallbacksInterface,
  VideoProfile,
  EncryptionMode,
  ChannelProfileType,
  ClientRoleType,
  UidType,
} from '../../../agora-rn-uikit';
import {useRoomInfo, WaitingRoomStatus} from '../room-info/useRoomInfo';
import StorageContext from '../StorageContext';
import {SdkApiContext} from '../SdkApiContext';
import {useIsRecordingBot} from '../../subComponents/recording/useIsRecordingBot';
import {useHistory} from '../Router';
import SDKEvents from '../../utils/SdkEvents';
import {useString} from '../../utils/useString';
import {userBannedText} from '../../language/default-labels/videoCallScreenLabels';
import Toast from '../../../react-native-toast-message';
import styles from '../styles';

// Keep enum local since you use it in encryption.mode today
export enum RnEncryptionEnum {
  /**
   * @deprecated
   * 0: This mode is deprecated.
   */
  None = 0,
  /**
   * 1: (Default) 128-bit AES encryption, XTS mode.
   */
  AES128XTS = 1,
  /**
   * 2: 128-bit AES encryption, ECB mode.
   */
  AES128ECB = 2,
  /**
   * 3: 256-bit AES encryption, XTS mode.
   */
  AES256XTS = 3,
  /**
   * 4: 128-bit SM4 encryption, ECB mode.
   *
   * @since v3.1.2.
   */
  SM4128ECB = 4,
  /**
   * 6: 256-bit AES encryption, GCM mode.
   *
   * @since v3.1.2.
   */
  AES256GCM = 6,

  /**
   * 7:  128-bit GCM encryption, GCM mode.
   *
   * @since v3.4.5
   */
  AES128GCM2 = 7,
  /**
   * 8: 256-bit GCM encryption, GCM mode.
   * @since v3.1.2.
   * Compared to AES256GCM encryption mode, AES256GCM2 encryption mode is more secure and requires you to set the salt (encryptionKdfSalt).
   */
  AES256GCM2 = 8,
}

// This matches what your VideoCallStateWrapper currently stores/uses.
// (Includes extra fields beyond RtcPropsInterface)
export type ComposedRtcProps = {
  appId: string;
  channel: string | null;
  uid: UidType | null;
  token: string | null;
  // Your RTM providers currently read this:
  rtm: string | null;
  screenShareUid: any; // keep as-is for now (your data has string)
  screenShareToken: string | null;
  profile: any;
  screenShareProfile: any;
  dual: boolean;
  encryption:
    | false
    | {
        key: string | null;
        mode: number; // your code passes data.encryptionMode or enum value
        screenKey: string | null;
        salt?: any;
      };

  role: ClientRoleType;
  geoFencing: boolean;
  audioRoom: boolean;
  activeSpeaker: boolean;
  preferredCameraId: string | null;
  preferredMicrophoneId: string | null;
  recordingBot: boolean;
  preventJoin?: boolean;
};

export type RtcPropsOverrides = Partial<
  Pick<
    ComposedRtcProps,
    | 'preferredCameraId'
    | 'preferredMicrophoneId'
    | 'role'
    | 'profile'
    | 'screenShareProfile'
    | 'dual'
    | 'preventJoin'
  >
>;

// ============ styleProps (static — no room dependency) ============
const styleProps = {
  maxViewStyles: styles.temp,
  minViewStyles: styles.temp,
  localBtnContainer: styles.bottomBar,
  localBtnStyles: {
    muteLocalAudio: styles.localButton,
    muteLocalVideo: styles.localButton,
    switchCamera: styles.localButton,
    endCall: styles.endCall,
    fullScreen: styles.localButton,
    recording: styles.localButton,
    screenshare: styles.localButton,
  },
  theme: $config.PRIMARY_ACTION_BRAND_COLOR,
  remoteBtnStyles: {
    muteRemoteAudio: styles.remoteButton,
    muteRemoteVideo: styles.remoteButton,
    remoteSwap: styles.remoteButton,
    minCloseBtnStyles: styles.minCloseBtn,
    liveStreamHostControlBtns: styles.liveStreamHostControlBtns,
  },
  BtnStyles: styles.remoteButton,
};

// ============ mode (static — derived from $config) ============
const mode = $config.EVENT_MODE
  ? ChannelProfileType.ChannelProfileLiveBroadcasting
  : ChannelProfileType.ChannelProfileCommunication;
type RtcPropsComposerContextValue = {
  rtcProps: ComposedRtcProps;
  setRtcPropsOverrides: (overrides: RtcPropsOverrides) => void;
  callbacks: CallbacksInterface;
  styleProps: typeof styleProps;
  mode: ChannelProfileType;
};

const RtcPropsComposerContext =
  createContext<RtcPropsComposerContextValue | null>(null);

export const useRtcProps = (): RtcPropsComposerContextValue => {
  const context = React.useContext(RtcPropsComposerContext);
  if (!context) {
    throw new Error('useRtcProps must be used within a RtcPropsComposer');
  }
  return context;
};

export const RtcPropsComposer: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const {data: roomData, isJoinDataFetched, waitingRoomStatus} = useRoomInfo();

  const {store} = useContext(StorageContext);
  const {
    microphoneDevice: sdkMicrophoneDevice,
    cameraDevice: sdkCameraDevice,
    clearState,
  } = useContext(SdkApiContext);
  const {isRecordingBot} = useIsRecordingBot();
  const history = useHistory();
  const bannedUserText = useString(userBannedText)();

  // commented for v1 release
  const afterEndCall = useCustomization(
    data =>
      data?.lifecycle?.useAfterEndCall && data?.lifecycle?.useAfterEndCall(),
  );

  // overrides for user/device changes (so we don't lose them on room switch)
  const [overrides, setOverrides] = useState<RtcPropsOverrides>({});

  const setRtcPropsOverrides = useCallback((patch: RtcPropsOverrides) => {
    setOverrides(prev => ({...prev, ...patch}));
  }, []);

  // compute device defaults (live, not stuck in initial useState)
  const defaultCameraId =
    sdkCameraDevice.deviceId || store?.activeDeviceId?.videoinput || null;

  const defaultMicId =
    sdkMicrophoneDevice.deviceId || store?.activeDeviceId?.audioinput || null;

  // derive preventJoin exactly like your current logic
  const derivedPreventJoin = useMemo(() => {
    if (!$config.ENABLE_WAITING_ROOM) {
      return false;
    }
    if (!isJoinDataFetched || !roomData) {
      return true;
    }
    if (roomData.isHost) {
      return false;
    }
    return waitingRoomStatus === WaitingRoomStatus.APPROVED ? false : true;
  }, [isJoinDataFetched, roomData, waitingRoomStatus]);

  // Memoize encryption separately so the object reference stays stable
  // when the values haven't changed (Join.tsx depends on rtcProps.encryption)
  const encryption = useMemo(() => {
    if (!$config.ENCRYPTION_ENABLED) {
      return false as const;
    }
    return {
      key: roomData?.encryptionSecret ?? null,
      mode: roomData?.encryptionMode ?? RnEncryptionEnum.AES128GCM2,
      screenKey: roomData?.encryptionSecret ?? null,
      salt: roomData?.encryptionSecretSalt,
    };
  }, [
    roomData?.encryptionSecret,
    roomData?.encryptionMode,
    roomData?.encryptionSecretSalt,
  ]);

  const rtcProps = useMemo<ComposedRtcProps>(() => {
    // Base always exists
    const base: ComposedRtcProps = {
      appId: $config.APP_ID,
      channel: null,
      uid: null,
      token: null,
      rtm: null,
      screenShareUid: null,
      screenShareToken: null,
      profile: overrides.profile ?? $config.PROFILE,
      screenShareProfile:
        overrides.screenShareProfile ?? $config.SCREEN_SHARE_PROFILE,
      dual: overrides.dual ?? true,
      encryption,
      role: overrides.role ?? ClientRoleType.ClientRoleBroadcaster,
      geoFencing: $config.GEO_FENCING,
      audioRoom: $config.AUDIO_ROOM,
      activeSpeaker: $config.ACTIVE_SPEAKER,
      preferredCameraId: overrides.preferredCameraId ?? defaultCameraId,
      preferredMicrophoneId: overrides.preferredMicrophoneId ?? defaultMicId,
      recordingBot: !!isRecordingBot,
      preventJoin: overrides.preventJoin ?? derivedPreventJoin,
    };

    // If we don't have complete join data, keep preventJoin = true
    if (!isJoinDataFetched || !roomData) {
      return {
        ...base,
        preventJoin: true, // safest until data is present
      };
    }

    // IMPORTANT: match your current "queryComplete gating" behavior:
    // - waiting room attendee: only allow join when approved (preventJoin handles this)
    // - non waiting room OR host: allow
    //
    // We don't need queryComplete here; consumer can still gate rendering if they want.
    const roleFromData = roomData.isHost
      ? ClientRoleType.ClientRoleBroadcaster
      : ClientRoleType.ClientRoleAudience;

    return {
      ...base,
      channel: roomData.channel ?? null,
      uid: (roomData.uid ?? null) as any,
      token: (roomData.token ?? null) as any,
      rtm: (roomData.rtmToken ?? null) as any,
      screenShareUid: roomData.screenShareUid ?? null,
      screenShareToken: roomData.screenShareToken ?? null,
      role: overrides.role ?? roleFromData,
      encryption,
      preventJoin: overrides.preventJoin ?? derivedPreventJoin,
    };
  }, [
    isJoinDataFetched,
    roomData,
    overrides,
    defaultCameraId,
    defaultMicId,
    derivedPreventJoin,
    isRecordingBot,
    encryption,
  ]);
  // ============ callbacks ============
  // Assembled here so both main room and breakout room share the same
  // callback definitions. roomData updates automatically when the active
  // room switches (via RoomInfoManager), so callbacks stay in sync.
  const callbacks = useMemo<CallbacksInterface>(
    () => ({
      EndCall: () => {
        clearState('join');
        setTimeout(() => {
          // TODO: These callbacks are being called twice
          SDKEvents.emit('leave');
          if (afterEndCall) {
            afterEndCall(roomData?.isHost, history as unknown as History);
          } else {
            history.push('/');
          }
        }, 0);
      },
      // @ts-ignore
      UserJoined: (uid: UidType) => {
        console.log('UIKIT Callback: UserJoined', uid);
        SDKEvents.emit('rtc-user-joined', uid);
      },
      // @ts-ignore
      UserOffline: (uid: UidType) => {
        console.log('UIKIT Callback: UserOffline', uid);
        SDKEvents.emit('rtc-user-left', uid);
      },
      // @ts-ignore
      RemoteAudioStateChanged: (uid: UidType, status: 0 | 2) => {
        console.log('UIKIT Callback: RemoteAudioStateChanged', uid, status);
        if (status === 0) {
          SDKEvents.emit('rtc-user-unpublished', uid, 'audio');
        } else {
          SDKEvents.emit('rtc-user-published', uid, 'audio');
        }
      },
      // @ts-ignore
      RemoteVideoStateChanged: (uid: UidType, status: 0 | 2) => {
        console.log('UIKIT Callback: RemoteVideoStateChanged', uid, status);
        if (status === 0) {
          SDKEvents.emit('rtc-user-unpublished', uid, 'video');
        } else {
          SDKEvents.emit('rtc-user-published', uid, 'video');
        }
      },
      // @ts-ignore
      UserBanned(isBanned) {
        console.log('UIKIT Callback: UserBanned', isBanned);
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text1: bannedUserText,
          visibilityTime: 3000,
        });
      },
    }),
    [roomData?.isHost, history, afterEndCall, bannedUserText, clearState],
  );

  const value = useMemo(
    () => ({rtcProps, setRtcPropsOverrides, callbacks, styleProps, mode}),
    [rtcProps, setRtcPropsOverrides, callbacks],
  );

  return (
    <RtcPropsComposerContext.Provider value={value}>
      {children}
    </RtcPropsComposerContext.Provider>
  );
};
