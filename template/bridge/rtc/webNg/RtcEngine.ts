/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/
// @ts-nocheck
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  UID,
  ScreenVideoTrackInitConfig,
  RemoteStreamType,
  ICameraVideoTrack,
  EncryptionMode,
  ILocalTrack,
  ClientRoleOptions,
  CameraVideoTrackInitConfig,
  MicrophoneAudioTrackInitConfig,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import type {
  RtcEngineEvents,
  Subscription,
} from 'react-native-agora/lib/typescript/src/common/RtcEvents';

import {IRtcEngine} from 'react-native-agora';
import {VideoProfile} from '../quality';
import {ChannelProfileType, ClientRoleType} from '../../../agora-rn-uikit';
import {role, mode, RtcEngineContext} from './Types';
import {LOG_ENABLED, GEO_FENCING} from '../../../config.json';
import {Platform} from 'react-native';
import isMobileOrTablet from '../../../src/utils/isMobileOrTablet';
import {LogSource, logger} from '../../../src/logger/AppBuilderLogger';
import {
  type VideoEncoderConfigurationPreset,
  type ScreenEncoderConfigurationPreset,
  type VideoEncoderConfiguration,
} from '../../../src/app-state/useVideoQuality';

interface MediaDeviceInfo {
  readonly deviceId: string;
  readonly label: string;
  readonly kind: string;
}

type callbackType = (uid?: UID) => void;

declare global {
  interface Window {
    engine: RtcEngine;
    AgoraRTC: typeof AgoraRTC;
  }
}

window.AgoraRTC = AgoraRTC;

export enum AREAS {
  /**
   * China.
   */
  CHINA = 'CHINA',
  /**
   * Asia, excluding Mainland China.
   */
  ASIA = 'ASIA',
  /**
   * North America.
   */
  NORTH_AMERICA = 'NORTH_AMERICA',
  /**
   * Europe.
   */
  EUROPE = 'EUROPE',
  /**
   * Japan.
   */
  JAPAN = 'JAPAN',
  /**
   * India.
   */
  INDIA = 'INDIA',
  /**
   * @ignore
   */
  OCEANIA = 'OCEANIA',
  /**
   * @ignore
   */
  SOUTH_AMERICA = 'SOUTH_AMERICA',
  /**
   * @ignore
   */
  AFRICA = 'AFRICA',
  /**
   * @ignore
   */
  OVERSEA = 'OVERSEA',
  /**
   * Global.
   */
  GLOBAL = 'GLOBAL',
}

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
   * 5: 128-bit AES encryption, GCM mode.
   *
   * @since v3.3.1
   */
  AES128GCM = 5,
  /**
   * 6: 256-bit AES encryption, GCM mode.
   *
   * @since v3.3.1
   */
  AES256GCM = 6,
  /**
   * 7: 128-bit GCM encryption, GCM mode.
   *
   * @since v3.4.5
   */

  AES128GCM2 = 7,
  /**
   * 8: 256-bit AES encryption, GCM mode.
   *
   * @since v3.4.5
   */
  AES256GCM2 = 8,
}

export enum VideoStreamType {
  'HIGH',
  'LOW',
}

interface LocalStream {
  audio?: ILocalAudioTrack;
  video?: ICameraVideoTrack;
}
interface ScreenStream {
  audio?: ILocalAudioTrack;
  video?: ILocalVideoTrack;
}
interface RemoteStream {
  audio?: IRemoteAudioTrack;
  video?: IRemoteVideoTrack;
}

if ($config.GEO_FENCING) {
  try {
    //include area is comma seperated value
    let includeArea = $config.GEO_FENCING_INCLUDE_AREA
      ? $config.GEO_FENCING_INCLUDE_AREA
      : AREAS.GLOBAL;

    //exclude area is single value
    let excludeArea = $config.GEO_FENCING_EXCLUDE_AREA
      ? $config.GEO_FENCING_EXCLUDE_AREA
      : '';

    includeArea = includeArea?.split(',');

    //pass excludedArea if only its provided
    if (excludeArea) {
      AgoraRTC.setArea({
        areaCode: includeArea,
        excludedArea: excludeArea,
      });
    }
    //otherwise we can pass area directly
    else {
      AgoraRTC.setArea(includeArea);
    }
  } catch (setAeraError) {
    console.log('error on RTC setArea', setAeraError);
  }
}

if ($config.LOG_ENABLED) {
  AgoraRTC.setLogLevel(0);
  AgoraRTC.enableLogUpload();
} else {
  AgoraRTC.disableLogUpload();
}

export default class RtcEngine {
  private activeSpeakerUid: number;
  public appId: string;
  // public AgoraRTC: any;
  public client: any | IAgoraRTCClient;
  public screenClient: any | IAgoraRTCClient;
  public eventsMap = new Map<string, callbackType>([
    ['onUserJoined', () => null],
    ['onUserOffline', () => null],
    ['onJoinChannelSuccess', () => null],
    ['onScreenshareStopped', () => null],
    ['onRemoteAudioStateChanged', () => null],
    ['onRemoteVideoStateChanged', () => null],
    ['onNetworkQuality', () => null],
    ['onActiveSpeaker', () => null],
    ['onStreamMessage', () => null],
  ]);
  public localStream: LocalStream = {};
  public screenStream: ScreenStream = {};
  public remoteStreams = new Map<UID, RemoteStream>();
  private inScreenshare: Boolean = false;
  private videoProfile:
    | VideoEncoderConfigurationPreset
    | VideoEncoderConfiguration;
  private screenShareProfile:
    | ScreenEncoderConfigurationPreset
    | VideoEncoderConfiguration;
  private isPublished = false;
  private isAudioEnabled = false;
  private isVideoEnabled = false;
  private isAudioPublished = false;
  private isVideoPublished = false;
  private isJoined = false;
  private videoDeviceId = undefined;
  private audioDeviceId = undefined;
  private muteLocalVideoMutex = false;
  private muteLocalAudioMutex = false;
  private speakerDeviceId = '';
  private usersVolumeLevel = [];
  // Create channel profile and set it here

  initialize(context: RtcEngineContext) {
    const {appId} = context;
    logger.log(LogSource.AgoraSDK, 'Log', 'RTC engine initialized');
    this.appId = appId;
  }
  getLocalVideoStats() {
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [getLocalVideoStats] getting local video stats',
      );
      const data = this.client?.getLocalVideoStats();
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [getLocalVideoStats] got local video stats successfully',
        data,
      );
      return data;
    } catch (error) {
      return error;
    }
  }

  getRemoteVideoStats(id: string) {
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [getRemoteVideoStats] getting remote video stats',
      );
      const data = this.client.getRemoteVideoStats();
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [getRemoteVideoStats] got remote video stats successfully',
        data,
      );
      return data && data[id] ? data[id] : null;
    } catch (error) {
      logger.error(
        LogSource.AgoraSDK,
        'API',
        'RTC [getRemoteVideoStats] Error while getting remote video stats',
        error,
      );
      return null;
    }
  }

  async setVideoProfile(
    profile: VideoEncoderConfigurationPreset | VideoEncoderConfiguration,
  ): Promise<void> {
    try {
      this.videoProfile = profile;
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEncoderConfiguration] setting video profile.`,
        profile,
      );
      await this.localStream?.video?.setEncoderConfiguration(profile);
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEncoderConfiguration] video profile is set successfully`,
        profile,
      );
    } catch (error) {
      logger.error(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEncoderConfiguration] Error while setting video profile.`,
        error,
      );
    }
  }

  async setScreenShareProfile(
    profile: ScreenEncoderConfigurationPreset | VideoEncoderConfiguration,
  ): Promise<void> {
    try {
      this.screenShareProfile = profile;
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEncoderConfiguration] set screen share profile.`,
        profile,
      );
      await this.screenStream?.video?.setEncoderConfiguration(profile);
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEncoderConfiguration] screen share profile is set successfully.`,
        profile,
      );
    } catch (error) {
      logger.error(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEncoderConfiguration] Error while setting screen share profile.`,
        error,
      );
    }
  }

  async enableAudio(): Promise<void> {
    const audioConfig: MicrophoneAudioTrackInitConfig = {
      bypassWebAudio: Platform.OS == 'web' && isMobileOrTablet(),
      // microphoneId: this.audioDeviceId,
    };
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [createMicrophoneAudioTrack] creating audio track',
        audioConfig,
      );
      let localAudio = await AgoraRTC.createMicrophoneAudioTrack(audioConfig);
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [createMicrophoneAudioTrack] created audio track successfully',
        audioConfig,
      );
      this.localStream.audio = localAudio;
      this.audioDeviceId = localAudio
        ?.getMediaStreamTrack()
        .getSettings().deviceId;
      this.isAudioEnabled = true;
    } catch (e) {
      logger.error(
        LogSource.AgoraSDK,
        'API',
        'RTC [createMicrophoneAudioTrack] Error while creating audio track',
        error,
      );
      let audioError = e;
      e.status = {audioError};
      throw e;
    }
  }

  async enableVideo(
    preferredCameraId?: string,
    preferredMicrophoneId?: string,
  ): Promise<void> {
    /**
     * Issue: Backgrounding the browser or app causes the audio streaming to be cut off.
     * Impact: All browsers and apps that use WKWebView on iOS 15.x, such as Safari and Chrome.
     * Solution:
     *    Upgrade to the Web SDK v4.7.3 or later versions.
     *    When calling createMicrophoneAudioTrack, set bypassWebAudio as true.
     *    The Web SDK directly publishes the local audio stream without processing it through WebAudio.
     */

    const audioConfig: MicrophoneAudioTrackInitConfig = {
      bypassWebAudio: Platform.OS == 'web' && isMobileOrTablet(),
      microphoneId: preferredMicrophoneId,
    };

    const videoConfig: CameraVideoTrackInitConfig = {
      encoderConfig: this.videoProfile,
      cameraId: preferredCameraId,
    };
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [createMicrophoneAndCameraTracks] creating audio and video tracks',
        {
          audioConfig,
          videoConfig,
        },
      );
      let [localAudio, localVideo] =
        // If preferred devices are not present, the createTrack call will fallover to
        // the catch block below.
        await AgoraRTC.createMicrophoneAndCameraTracks(
          audioConfig,
          videoConfig,
        );
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [createMicrophoneAndCameraTracks] audio and video tracks created successfully',
      );
      this.localStream.audio = localAudio;
      this.localStream.video = localVideo;
      this.audioDeviceId = localAudio
        ?.getMediaStreamTrack()
        .getSettings().deviceId;
      this.videoDeviceId = localVideo
        ?.getMediaStreamTrack()
        .getSettings().deviceId;
      this.isVideoEnabled = true;
      this.isAudioEnabled = true;
    } catch (e) {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [createMicrophoneAndCameraTracks] Error while creating audio and video tracks',
        {
          error: e,
        },
      );
      let audioError = false;
      let videoError = false;
      try {
        let localAudio: IMicrophoneAudioTrack;
        logger.log(
          LogSource.AgoraSDK,
          'API',
          'RTC [createMicrophoneAudioTrack] creating audio track ',
          audioConfig,
        );
        try {
          localAudio = await AgoraRTC.createMicrophoneAudioTrack(audioConfig);
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTC [createMicrophoneAudioTrack] audio track created',
          );
        } catch (eAudio) {
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTC [createMicrophoneAudioTrack] Error while creating audio tracks',
            eAudio,
          );
          logger.log(
            LogSource.AgoraSDK,
            'Log',
            'RTC [createMicrophoneAudioTrack] Setting microphoneId as empty and again creating audio track',
          );
          videoConfig.microphoneId = '';
          localAudio = await AgoraRTC.createMicrophoneAudioTrack(audioConfig);
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTC [createMicrophoneAudioTrack] audio track created successfully',
          );
        }
        this.localStream.audio = localAudio;
        this.audioDeviceId = localAudio
          ?.getMediaStreamTrack()
          .getSettings().deviceId;
        this.isAudioEnabled = true;
      } catch (error) {
        logger.error(
          LogSource.AgoraSDK,
          'API',
          'RTC [createMicrophoneAudioTrack] Error while creating audio track',
          error,
        );
        audioError = error;
      }

      try {
        let localVideo: ICameraVideoTrack;
        try {
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTC [createCameraVideoTrack] creating video track',
            videoConfig,
          );
          localVideo = await AgoraRTC.createCameraVideoTrack(videoConfig);
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTC [createCameraVideoTrack] video track created successfully',
          );
        } catch (eVideo) {
          logger.debug(
            LogSource.AgoraSDK,
            'API',
            'RTC [createCameraVideoTrack] Error while creating video tracks',
            eVideo,
          );
          logger.log(
            LogSource.AgoraSDK,
            'Log',
            'RTC [createCameraVideoTrack] Setting cameraId as empty and again creating video track',
          );
          videoConfig.cameraId = '';
          try {
            localVideo = await AgoraRTC.createCameraVideoTrack(videoConfig);
            logger.log(LogSource.AgoraSDK, 'API', 'RTC video track created');
          } catch (error) {
            logger.debug(
              LogSource.AgoraSDK,
              'API',
              'RTC [createCameraVideoTrack] Error while creating video track',
              error,
            );
            logger.log(
              LogSource.AgoraSDK,
              'Log',
              'RTC [RTCEngineBridge]: Provided cameraId and default camera failed, Trying other available devices',
            );
            const devices = await navigator.mediaDevices.enumerateDevices();
            logger.log(
              LogSource.AgoraSDK,
              'Log',
              'RTC [enumerateDevices] media devices available',
              devices,
            );
            for (let device of devices) {
              if (device.kind === 'videoinput') {
                videoConfig.cameraId = device.deviceId;
                try {
                  localVideo = await AgoraRTC.createCameraVideoTrack(
                    videoConfig,
                  );
                  break;
                } catch (eVideoDevice) {
                  videoError = eVideoDevice;
                  logger.log(
                    LogSource.AgoraSDK,
                    'Log',
                    'RTC Camera not available with deviceId',
                    {
                      device,
                      reason: eVideoDevice,
                    },
                  );
                }
              }
            }
          }
        }
        this.localStream.video = localVideo;
        this.videoDeviceId = localVideo
          ?.getMediaStreamTrack()
          .getSettings().deviceId;
        this.isVideoEnabled = true;
      } catch (error) {
        logger.error(
          LogSource.AgoraSDK,
          'API',
          'RTC [createCameraVideoTrack] Error while creating video track',
          error,
        );
        videoError = error;
      }
      e.status = {audioError, videoError};
      throw e;
      // if (audioError && videoError) throw e;
      // else
      //   throw new Error(
      //     audioError ? 'No Microphone found' : 'No Video device found',
      //   );
    }
  }

  async enableAudioVolumeIndication(interval, smooth, isLocal) {
    AgoraRTC.setParameter('AUDIO_VOLUME_INDICATION_INTERVAL', interval);
    logger.log(
      LogSource.AgoraSDK,
      'API',
      `RTC [setParameter] parameter AUDIO_VOLUME_INDICATION_INTERVAL set to interval ${interval}`,
    );
    this.client.enableAudioVolumeIndicator();
    logger.log(
      LogSource.AgoraSDK,
      'API',
      'RTC [enableAudioVolumeIndicator] enabled to report the local and remote users who are speaking and their volumes',
    );
  }

  async publish() {
    if (this.localStream.audio || this.localStream.video) {
      try {
        let tracks: Array<ILocalTrack> = [];
        this.localStream.audio &&
          this.isAudioEnabled &&
          tracks.push(this.localStream.audio);
        this.localStream.video &&
          this.isVideoEnabled &&
          tracks.push(this.localStream.video);

        if (tracks.length > 0) {
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTC [publish] trying to publish tracks',
          );
          await this.client.publish(tracks);
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTC [publish] tracks done successfully',
          );
          if (tracks[0].trackMediaType === 'audio') {
            this.isAudioPublished = true;
          } else if (tracks[0].trackMediaType === 'video') {
            this.isVideoPublished = true;
          }

          if (tracks[1]?.trackMediaType === 'audio') {
            this.isAudioPublished = true;
          } else if (tracks[1]?.trackMediaType === 'video') {
            this.isVideoPublished = true;
          }

          if (this.isPublished === false) {
            this.isPublished = true;
            (this.eventsMap.get('onJoinChannelSuccess') as callbackType)();
          }
        }
      } catch (e) {
        logger.error(
          LogSource.AgoraSDK,
          'API',
          'RTC [publish] Error publish tracks failed',
          {
            error: e,
          },
        );
        console.error(e, this.localStream);
        this.isPublished = false;
      }
    }
  }

  async joinChannel(
    token: string,
    channelName: string,
    optionalUid: number,
    _optionalInfo: {},
  ): Promise<void> {
    // TODO create agora client here
    this.client.on('user-joined', user => {
      logger.log(LogSource.AgoraSDK, 'Event', 'RTC [user-joined]', user);
      (this.eventsMap.get('onUserJoined') as callbackType)({}, user.uid);
      (this.eventsMap.get('onRemoteVideoStateChanged') as callbackType)(
        {},
        user.uid,
        0,
        0,
        0,
      );
      (this.eventsMap.get('onRemoteAudioStateChanged') as callbackType)(
        {},
        user.uid,
        0,
        0,
        0,
      );
    });

    this.client.on('user-left', user => {
      logger.log(LogSource.AgoraSDK, 'Event', 'RTC [user-left]', user);
      const uid = user.uid;
      if (this.remoteStreams.has(uid)) {
        this.remoteStreams.delete(uid);
      }
      (this.eventsMap.get('onUserOffline') as callbackType)({}, uid);
      // (this.eventsMap.get('UserJoined') as callbackType)(uid);
    });
    this.client.on('user-published', async (user, mediaType) => {
      // Initiate the subscription
      logger.log(
        LogSource.AgoraSDK,
        'Event',
        'RTC [user-published]',
        user,
        mediaType,
      );
      if (this.inScreenshare && user.uid === this.screenClient.uid) {
        (this.eventsMap.get('onRemoteVideoStateChanged') as callbackType)(
          {},
          user.uid,
          2,
          0,
          0,
        );
      } else {
        await this.client.subscribe(user, mediaType);
        logger.log(
          LogSource.AgoraSDK,
          'API',
          'RTC [subscribe] to track successfully done',
          user,
          mediaType,
        );
      }
      // If the subscribed track is an audio track
      if (mediaType === 'audio') {
        const audioTrack = user.audioTrack;
        // Play the audio
        audioTrack?.play();
        this.remoteStreams.set(user.uid, {
          ...this.remoteStreams.get(user.uid),
          audio: audioTrack,
        });
        if (this.speakerDeviceId) {
          // setting sepeaker for all remote stream (newly joining user)
          this.remoteStreams
            .get(user.uid)
            ?.audio?.setPlaybackDevice(this.speakerDeviceId);
        }
        (this.eventsMap.get('onRemoteAudioStateChanged') as callbackType)(
          {},
          user.uid,
          2,
          0,
          0,
        );
      } else {
        const videoTrack = user.videoTrack;
        // Play the video
        // videoTrack.play(DOM_ELEMENT);
        this.remoteStreams.set(user.uid, {
          ...this.remoteStreams.get(user.uid),
          video: videoTrack,
        });
        (this.eventsMap.get('onRemoteVideoStateChanged') as callbackType)(
          {},
          user.uid,
          2,
          0,
          0,
        );
      }
    });
    this.client.on('user-unpublished', async (user, mediaType) => {
      logger.log(
        LogSource.AgoraSDK,
        'Event',
        'RTC [user-unpublished]',
        user,
        mediaType,
      );
      if (mediaType === 'audio') {
        const {audio, ...rest} = this.remoteStreams.get(user.uid);
        this.remoteStreams.set(user.uid, rest);
        (this.eventsMap.get('onRemoteAudioStateChanged') as callbackType)(
          {},
          user.uid,
          0,
          0,
          0,
        );
      } else {
        const {video, ...rest} = this.remoteStreams.get(user.uid);
        this.remoteStreams.set(user.uid, rest);
        (this.eventsMap.get('onRemoteVideoStateChanged') as callbackType)(
          {},
          user.uid,
          0,
          0,
          0,
        );
      }
    });

    this.client.on('volume-indicator', volumes => {
      this.usersVolumeLevel = volumes;
      /**
       * old active speaker logic
      const highestvolumeObj = volumes.reduce(
        (highestVolume, volume, index) => {
          if (highestVolume === null) {
            return volume;
          } else {
            if (volume.level > highestVolume.level) {
              return volume;
            }
            return highestVolume;
          }
          //console.log(`${index} UID ${volume.uid} Level ${volume.level}`);
        },
        null,
      );
      const activeSpeakerUid =
        highestvolumeObj && highestvolumeObj?.level > 0 && highestvolumeObj?.uid
          ? highestvolumeObj.uid
          : undefined;

      //To avoid infinite calling dispatch checking if condition.
      if (this.activeSpeakerUid !== activeSpeakerUid) {
        const activeSpeakerCallBack = this.eventsMap.get(
          'ActiveSpeaker',
        ) as callbackType;
        activeSpeakerCallBack(activeSpeakerUid);
        this.activeSpeakerUid = activeSpeakerUid;
      }
       */
    });

    // this.client.on('stream-fallback', (evt))
    this.client.on('stream-type-changed', function (uid, streamType) {
      logger.debug(
        LogSource.AgoraSDK,
        'Event',
        'RTC [stream-type-changed]',
        uid,
        streamType,
      );
    });

    this.client.on(
      'network-quality',
      async ({downlinkNetworkQuality, uplinkNetworkQuality}) => {
        const networkQualityIndicatorCallback = this.eventsMap.get(
          'onNetworkQuality',
        ) as callbackType;

        networkQualityIndicatorCallback(
          {},
          0,
          uplinkNetworkQuality,
          downlinkNetworkQuality,
        );

        const remoteUserNetworkQualities =
          this.client.getRemoteNetworkQuality();

        Object.keys(remoteUserNetworkQualities).forEach(uid => {
          networkQualityIndicatorCallback(
            {},
            uid,
            remoteUserNetworkQualities[uid].uplinkNetworkQuality,
            remoteUserNetworkQualities[uid].downlinkNetworkQuality,
          );
        });
      },
    );

    /* Recieve Captions  */
    this.client.on('stream-message', (uid: UID, payload: UInt8Array) => {
      logger.debug(
        LogSource.AgoraSDK,
        'Event',
        'RTC [stream-message](stt-web: onStreamMessageCallback)',
        uid,
        payload,
      );
      (this.eventsMap.get('onStreamMessage') as callbackType)(uid, payload);
    });

    logger.log(LogSource.AgoraSDK, 'API', 'RTC [join] trying to join channel', {
      appId: this.appId,
      channelName,
      token,
      optionalUid,
    });
    await this.client.join(
      this.appId,
      channelName,
      token || null,
      optionalUid || null,
    );
    logger.log(
      LogSource.AgoraSDK,
      'API',
      'RTC [join] channel joined successfully',
    );
    this.isJoined = true;

    logger.log(
      LogSource.AgoraSDK,
      'Log',
      'RTC [publish] start publishing in the channel',
    );
    await this.publish();
    console.log('enabling screen sleep');
  }

  getUsersVolumeLevel() {
    return this.usersVolumeLevel;
  }

  async leaveChannel(): Promise<void> {
    this.client.leave();
    logger.log(
      LogSource.AgoraSDK,
      'API',
      'RTC [leave] client has left the channel successfully',
    );
    this.remoteStreams.forEach((stream, uid, map) => {
      stream.video?.close();
      stream.audio?.close();
    });
    this.remoteStreams.clear();
    logger.log(
      LogSource.AgoraSDK,
      'Log',
      'RTC closed all remote streams successfully',
    );
    console.log('disabling screen sleep');
  }

  addListener<EventType extends keyof RtcEngineEvents>(
    event: EventType,
    listener: RtcEngineEvents[EventType],
  ): Subscription {
    if (
      event === 'onUserJoined' ||
      event === 'onUserOffline' ||
      event === 'onJoinChannelSuccess' ||
      event === 'onScreenshareStopped' ||
      event === 'onRemoteAudioStateChanged' ||
      event === 'onRemoteVideoStateChanged' ||
      event === 'onNetworkQuality' ||
      event === 'onActiveSpeaker' ||
      event === 'onStreamMessage'
    ) {
      this.eventsMap.set(event, listener as callbackType);
    }

    return {
      remove: () => {
        console.log(
          'Use destroy method to remove all the event listeners from the RtcEngine instead.',
        );
      },
    };
  }

  async muteLocalAudioStream(muted: boolean): Promise<void> {
    let didProcureMutexLock = false;
    try {
      if (!this.muteLocalAudioMutex) {
        // If there no mutex lock, procure a lock
        this.muteLocalAudioMutex = true;
        didProcureMutexLock = true;
        /** setMuted
         *  The SDK does NOT stop audio or video capture.
         *  The camera light stays on for video
         *  It takes less time for the audio or video to resume.
         */
        logger.log(
          LogSource.AgoraSDK,
          'Log',
          `RTC [setMuted] trying to ${
            muted ? 'mute' : 'unmute'
          } local audio stream`,
        );
        logger.log(
          LogSource.AgoraSDK,
          'API',
          `RTC [setMuted] on audio track with value - ${muted}`,
        );
        await this.localStream.audio?.setMuted(muted);
        logger.log(
          LogSource.AgoraSDK,
          'API',
          'RTC [setMuted] on audio track successfully done',
        );
        // Release the lock once done
        this.muteLocalAudioMutex = false;
        this.isAudioEnabled = !muted;
        // Unpublish only after when the user has joined the call
        if (!muted && !this.isAudioPublished && this.isJoined) {
          logger.log(
            LogSource.AgoraSDK,
            'Log',
            'RTC [publish] trying to publish audio track',
          );
          await this.publish();
        }
      }
    } catch (e) {
      if (didProcureMutexLock) {
        this.muteLocalAudioMutex = false;
      }
      logger.error(
        LogSource.AgoraSDK,
        'Log',
        'RTC [setMuted] Error Be sure to invoke the enableVideo method before calling setMuted method.',
        e,
      );
    }
  }

  async muteLocalVideoStream(muted: boolean): Promise<void> {
    let didProcureMutexLock = false;
    try {
      if (!this.muteLocalVideoMutex) {
        // If there no mutex lock, procure a lock
        this.muteLocalVideoMutex = true;
        didProcureMutexLock = true;
        /** setEnabled
         *  The SDK stops audio or video capture.
         *  The indicator light of the camera turns off and stays off.
         *  It takes more time for the audio or video to resume.
         */
        logger.log(
          LogSource.AgoraSDK,
          'Log',
          `RTC [setEnabled] trying to ${
            muted ? 'mute' : 'unmute'
          } local video stream`,
        );
        logger.log(
          LogSource.AgoraSDK,
          'API',
          `RTC [setEnabled] on video track with value - ${!muted}`,
        );
        await this.localStream.video?.setEnabled(!muted);
        logger.log(
          LogSource.AgoraSDK,
          'API',
          'RTC [setEnabled] on video track done successfully',
        );
        // Release the lock once done
        this.muteLocalVideoMutex = false;

        this.isVideoEnabled = !muted;
        // Unpublish only after when the user has joined the call
        if (!muted && !this.isVideoPublished && this.isJoined) {
          logger.log(
            LogSource.AgoraSDK,
            'Log',
            'RTC [publish] publish video track',
          );
          await this.publish();
        }
      }
    } catch (e) {
      // If the function procures the mutex,
      // but if mute throws an error, the lock won't be released
      if (didProcureMutexLock) {
        this.muteLocalVideoMutex = false;
      }
      logger.error(
        LogSource.AgoraSDK,
        'Log',
        'RTC  [setEnabled] Error Be sure to invoke the enableVideo method before calling setEnabled method.',
        e,
      );
    }
  }

  async muteRemoteAudioStream(uid: number, muted: boolean): Promise<void> {
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEnabled] trying to ${
          muted ? 'mute' : 'unmute'
        } remote audio stream of user ${uid}`,
      );
      this.remoteStreams.get(uid)?.audio?.setEnabled(!muted);
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC  [setEnabled] ${
          muted ? 'muted' : 'unmuted'
        } remote audio stream of user ${uid} done successfully`,
      );
    } catch (e) {
      logger.error(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEnabled] Error: while ${
          muted ? 'muting' : 'unmuting'
        } remote audio stream of user ${uid}`,
        e,
      );
    }
  }

  async muteRemoteVideoStream(uid: number, muted: boolean): Promise<void> {
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEnabled] trying to ${
          muted ? 'mute' : 'unmute'
        } remote video stream of user ${uid}`,
      );
      this.remoteStreams.get(uid)?.video?.setEnabled(!muted);
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEnabled]  ${
          muted ? 'muted' : 'unmuted'
        } remote video stream of user ${uid} successfully`,
      );
    } catch (e) {
      logger.error(
        LogSource.AgoraSDK,
        'API',
        `RTC [setEnabled] Error while ${
          muted ? 'muting' : 'unmuting'
        } remote video stream of user ${uid}`,
        e,
      );
      console.error(e);
    }
  }

  async getDevices(
    callback: (devices: Array<MediaDeviceInfo>) => void,
  ): Promise<Array<MediaDeviceInfo>> {
    const devices: Array<MediaDeviceInfo> = await AgoraRTC.getDevices(true);
    callback && callback(devices);
    return devices;
  }

  async setChannelProfile(profile: ChannelProfileType): Promise<void> {
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [createClient] creating user and screen client with profile ${profile}`,
      );
      this.client = AgoraRTC.createClient({
        codec: 'vp9',
        mode:
          profile === ChannelProfileType.ChannelProfileLiveBroadcasting
            ? mode.live
            : mode.rtc,
      });
      this.screenClient = AgoraRTC.createClient({
        codec: 'vp9',
        mode:
          profile === ChannelProfileType.ChannelProfileLiveBroadcasting
            ? mode.live
            : mode.rtc,
      });
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [createClient] user and screen client with profile ${profile} created successfully`,
      );
    } catch (e) {
      logger.error(
        LogSource.AgoraSDK,
        'API',
        `RTC [createClient] Error while creating user and screen client with profile ${profile}`,
        e,
      );
      throw e;
    }
  }

  async setClientRole(
    clientRole: ClientRoleType,
    options?: ClientRoleOptions,
  ): Promise<void> {
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setClientRole] for user and screen client with role ${
          clientRole == ClientRoleType.ClientRoleAudience
            ? 'audience'
            : 'broadcaster'
        }`,
      );
      if (clientRole == ClientRoleType.ClientRoleAudience) {
        if (this.isJoined) {
          // Unpublish the streams when role is changed to Audience
          logger.log(
            LogSource.AgoraSDK,
            'Log',
            'RTC user is already joined, and role is to be changed to audience so we need to unpublish the streams',
          );
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTC [unpublish] unpublish in the channel',
          );
          await this.client.unpublish();
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTC [unpublish] unpublish in the channel done successfully',
          );
          this.isAudioPublished = false;
          this.isVideoPublished = false;
          this.isPublished = false;
        }
        await this.client.setClientRole(role.audience, options);
        await this.screenClient.setClientRole(role.audience, options);
      } else if (clientRole == ClientRoleType.ClientRoleBroadcaster) {
        await this.client.setClientRole(role.host);
        await this.screenClient.setClientRole(role.host);
      }
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setClientRole] for user and screen client with role ${
          clientRole == ClientRoleType.ClientRoleAudience
            ? 'audience'
            : 'broadcaster'
        } done successfully`,
      );
    } catch (e) {
      logger.error(
        LogSource.AgoraSDK,
        'API',
        `RTC [setClientRole] Error while doing setClientRole for user and screen client with role ${
          clientRole == ClientRoleType.ClientRoleAudience
            ? 'audience'
            : 'broadcaster'
        }`,
        e,
      );
      throw e;
    }
  }

  async changeCamera(cameraId, callback, error): Promise<void> {
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setDevice] trying to change camera to ${cameraId}`,
      );
      await this.localStream.video?.setDevice(cameraId);
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [setDevice] camera set done successfully',
      );
      this.videoDeviceId = cameraId;
      callback(cameraId);
    } catch (e) {
      logger.error(
        LogSource.AgoraSDK,
        'API',
        'RTC [setDevice] Error setting camera',
        e,
      );
      error(e);
    }
  }

  async switchCamera(): Promise<void> {
    try {
      logger.log(
        LogSource.AgoraSDK,
        'Log',
        'RTC switching camera on mobile web',
      );
      const devices = await AgoraRTC.getDevices(true);
      for (let i = 0; i < devices.length; i++) {
        let d = devices[i];
        if (d.kind === 'videoinput' && d.deviceId !== this.videoDeviceId) {
          logger.log(
            LogSource.AgoraSDK,
            'API',
            `RTC [setDevice]: trying to change camera to ${d.deviceId}`,
          );
          await this.localStream.video?.setDevice(d.deviceId);
          logger.log(
            LogSource.AgoraSDK,
            'API',
            'RTC [setDevice]: camera set successfully',
          );
          this.videoDeviceId = d.deviceId;
          break;
        }
      }
    } catch (e) {
      logger.error(
        LogSource.AgoraSDK,
        'Log',
        'RTC Error switching camera on mobile web',
        e,
      );
      throw e;
    }
  }

  async changeMic(micId, callback, error) {
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        `RTC [setDevice]: trying to change microphone to ${micId}`,
      );
      await this.localStream.audio?.setDevice(micId);
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [setDevice]: microphone set successfully',
      );
      this.audioDeviceId = micId;
      callback(micId);
    } catch (e) {
      logger.error(
        LogSource.AgoraSDK,
        'API',
        'RTC [setDevice]: Error setting microphone',
        e,
      );
      error(e);
    }
  }

  async changeSpeaker(speakerId, callback, error) {
    try {
      // setting sepeaker for all remote stream (previously joined users)
      this.remoteStreams?.forEach((stream, uid, map) => {
        stream?.audio?.setPlaybackDevice(speakerId);
      });
      this.speakerDeviceId = speakerId;
      callback(speakerId);
    } catch (e) {
      error(e);
    }
  }

  async enableDualStreamMode(enable: boolean) {
    return this.client[enable ? 'enableDualStream' : 'disableDualStream']();
    // enable
    //   ? this.client.enableDualStream(
    //       () => {
    //         console.log('[bridge]: dual stream is enabled');
    //         Promise.resolve(null);
    //       },
    //       (e) => {
    //         console.log('[bridge]: dual stream not enabled', e);
    //         Promise.reject('error in enable dual stream');
    //       },
    //     )
    //   : this.client.disableDualStream(
    //       () => Promise.resolve(null),
    //       () => Promise.reject('error in disable dual stream'),
    //     );
  }

  // Bug in implementation !!!
  async setRemoteSubscribeFallbackOption(option: 0 | 1 | 2) {
    this.streams.forEach(stream => {
      this.client.setStreamFallbackOption(stream, option);
    });
    Promise.resolve();
    console.log('!set fallback');
  }

  getEncryptionMode = (enabled: boolean, encryptmode: RnEncryptionEnum) => {
    let mode: EncryptionMode;
    if (enabled) {
      switch (encryptmode) {
        case RnEncryptionEnum.None:
          mode = 'none';
          break;
        case RnEncryptionEnum.AES128ECB:
          mode = 'aes-128-ecb';
          break;
        case RnEncryptionEnum.AES128XTS:
          mode = 'aes-128-xts';
          break;
        case RnEncryptionEnum.AES256XTS:
          mode = 'aes-256-xts';
          break;
        case RnEncryptionEnum.SM4128ECB:
          mode = 'sm4-128-ecb';
          break;
        case RnEncryptionEnum.AES256GCM:
          mode = 'aes-256-gcm';
          break;
        case RnEncryptionEnum.AES128GCM2:
          mode = 'aes-128-gcm2';
          break;
        case RnEncryptionEnum.AES256GCM2:
          mode = 'aes-256-gcm2';
          break;

        default:
          mode = 'none';
      }
    } else {
      mode = 'none';
    }
    return mode;
  };

  async enableEncryption(
    enabled: boolean,
    config: {
      encryptionMode: RnEncryptionEnum;
      encryptionKey: string;
      encryptionKdfSalt: string;
    },
  ): Promise<void> {
    let mode: EncryptionMode;
    mode = this.getEncryptionMode(enabled, config?.encryptionMode);
    try {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [setEncryptionConfig] trying to set encryption config on user and screen client',
        {
          mode,
        },
      );
      await Promise.all([
        this.client.setEncryptionConfig(
          mode,
          config.encryptionKey,
          config.encryptionKdfSalt,
          true, // encryptDataStream
        ),
        this.screenClient.setEncryptionConfig(
          mode,
          config.encryptionKey,
          config.encryptionKdfSalt,
          true, // encryptDataStream
        ),
      ]);
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [setEncryptionConfig] set encryption config on user and screen client done successfully',
      );
    } catch (e) {
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [setEncryptionConfig] Error while setting encryption config on user and screen client',
        {
          error: e,
        },
      );
      throw e;
    }
  }

  /**
   * @deprecated
   * @param encryptionMode
   */
  setEncryptionSecret(secret: string) {
    // this.client.setEncryptionSecret(secret);
    console.error('Please use enableEncryption instead');
  }

  /**
   * @deprecated
   * @param encryptionMode
   */
  setEncryptionMode(
    encryptionMode: 'aes-128-xts' | 'aes-256-xts' | 'aes-128-ecb',
  ) {
    // this.client.setEncryptionMode(encryptionMode);
    console.error('Please use enableEncryption instead');
  }

  // async removeAllListeners<EventType extends keyof RtcEngineEvents>(event: EventType) {
  //   this.client.removeAllListeners(eventName);
  // }

  async release(): Promise<void> {
    if (this.inScreenshare) {
      (this.eventsMap.get('onUserOffline') as callbackType)(
        {},
        this.screenClient.uid,
      );
      this.screenClient.leave();
      (this.eventsMap.get('onScreenshareStopped') as callbackType)();
    }
    this.eventsMap.forEach((callback, event, map) => {
      this.client.off(event, callback);
    });
    this.eventsMap.clear();
    if (this.remoteStreams.size !== 0) {
      this.remoteStreams.forEach((stream, uid, map) => {
        stream?.video?.isPlaying && stream?.video?.stop();
        stream?.video?.isPlaying && stream?.audio?.stop();
      });
      this.remoteStreams.clear();
    }
    this.localStream.audio?.close();
    this.localStream.video?.close();
    this.localStream = {};
    this.screenStream.audio?.close();
    this.screenStream.video?.close();
    this.screenStream = {};
    logger.log(
      LogSource.AgoraSDK,
      'Log',
      'RTC destroy called. Clearing all events and closing all streams',
    );
  }

  async setRemoteVideoStreamType(
    uid: number,
    streamType: VideoStreamType,
  ): Promise<void> {
    return this.client.setRemoteVideoStreamType(
      uid,
      streamType as unknown as RemoteStreamType,
    );
  }

  isSingleTrack(
    x: ILocalVideoTrack | [ILocalVideoTrack, ILocalAudioTrack],
  ): x is ILocalVideoTrack {
    if ((x as [ILocalVideoTrack, ILocalAudioTrack]).length) {
      return false;
    } else {
      return true;
    }
  }

  async startScreenshare(
    token: string,
    channelName: string,
    optionalInfo: string,
    optionalUid: number,
    appId: string,
    engine: typeof AgoraRTC,
    encryption: {
      screenKey: string;
      mode: RnEncryptionEnum;
      salt: string;
    },
    screenShareConfig: ScreenVideoTrackInitConfig = {
      encoderConfig: this.screenShareProfile,
    },
    audio: 'enable' | 'disable' | 'auto' = 'auto',
  ): Promise<void> {
    const config: ScreenVideoTrackInitConfig = {
      ...screenShareConfig,
      encoderConfig: this.screenShareProfile,
    };
    if (!this.inScreenshare) {
      try {
        logger.debug(
          LogSource.AgoraSDK,
          'Log',
          'RTC start screenshare, creating screen stream',
        );
        if (encryption && encryption.screenKey && encryption.mode) {
          let mode: EncryptionMode;
          mode = this.getEncryptionMode(true, encryption?.mode);
          try {
            /**
             * Since version 4.7.0, if client leaves a call
             * and joins again the encryption needs to be
             * set again
             */
            logger.log(
              LogSource.AgoraSDK,
              'Log',
              'RTC [setEncryptionConfig] setting encryption again on screen client',
            );
            await this.screenClient.setEncryptionConfig(
              mode,
              encryption.screenKey,
              encryption.salt,
              true, // encryptDataStream
            );
          } catch (e) {
            logger.error(
              LogSource.AgoraSDK,
              'Log',
              'RTC [setEncryptionConfig] Error setting encryption for screenshare failed',
              e,
            );
          }
        }

        logger.log(
          LogSource.AgoraSDK,
          'API',
          'RTC [createScreenVideoTrack] Trying to create screenshare tracks',
          {
            config,
          },
        );
        const screenTracks = await AgoraRTC.createScreenVideoTrack(
          config,
          audio,
        );
        logger.log(
          LogSource.AgoraSDK,
          'API',
          'RTC [createScreenVideoTrack] screenshare tracks created successfully',
          {
            tracks: screenTracks,
          },
        );
        if (this.isSingleTrack(screenTracks)) {
          this.screenStream.video = screenTracks;
        } else {
          this.screenStream.video = screenTracks[0];
          this.screenStream.audio = screenTracks[1];
        }
      } catch (e) {
        logger.error(
          LogSource.AgoraSDK,
          'API',
          'RTC [createScreenVideoTrack] Error while creating screenshare tracks',
          e,
        );
        throw e;
      }

      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [join] joining channel of screenclient',
        {
          appId: this.appId,
          channelName,
          token,
          optionalUid,
        },
      );
      await this.screenClient.join(
        this.appId,
        channelName,
        token || null,
        optionalUid || null,
      );
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [join] joined channel successfully',
      );
      this.inScreenshare = true;
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [publish] trying to publish screen tracks',
      );
      await this.screenClient.publish(
        this.screenStream.audio
          ? [this.screenStream.video, this.screenStream.audio]
          : this.screenStream.video,
      );
      logger.log(
        LogSource.AgoraSDK,
        'API',
        'RTC [publish] screenshare tracks published successfully',
      );
      this.screenStream.video.on('track-ended', () => {
        (this.eventsMap.get('onUserOffline') as callbackType)(
          {},
          this.screenClient.uid,
        );

        this.screenClient.leave();

        this.screenStream.audio?.close();
        this.screenStream.video?.close();
        this.screenStream = {};

        (this.eventsMap.get('onScreenshareStopped') as callbackType)();
        this.inScreenshare = false;
      });
    } else {
      (this.eventsMap.get('onUserOffline') as callbackType)(
        {},
        this.screenClient.uid,
      );
      this.screenClient.leave();
      (this.eventsMap.get('onScreenshareStopped') as callbackType)();
      try {
        this.screenStream.audio?.close();
        this.screenStream.video?.close();
        this.screenStream = {};
      } catch (err) {
        throw err;
      }
      this.inScreenshare = false;
    }
  }
}
