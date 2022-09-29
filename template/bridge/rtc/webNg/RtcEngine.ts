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
} from 'agora-rtc-sdk-ng';
import type {
  RtcEngineEvents,
  Subscription,
} from 'react-native-agora/lib/typescript/src/common/RtcEvents';
import {VideoProfile} from '../quality';
import {ChannelProfile, ClientRole} from '../../../agora-rn-uikit';
import {role, mode} from './Types';
import {LOG_ENABLED, GEO_FENCING} from '../../../config.json';
import {Platform} from 'react-native';
import isMobileOrTablet from '../../../src/utils/isMobileOrTablet';

interface MediaDeviceInfo {
  readonly deviceId: string;
  readonly label: string;
  readonly kind: string;
}

type callbackType = (uid?: UID) => void;

declare global {
  interface Window {
    engine: RtcEngine;
  }
}

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
  AgoraRTC.setArea({
    areaCode: AREAS.GLOBAL,
    excludedArea: AREAS.CHINA,
  });
}

if ($config.LOG_ENABLED) {
  AgoraRTC.setLogLevel(0);
  AgoraRTC.enableLogUpload();
} else {
  AgoraRTC.disableLogUpload();
}

export default class RtcEngine {
  public appId: string;
  // public AgoraRTC: any;
  public client: any | IAgoraRTCClient;
  public screenClient: any | IAgoraRTCClient;
  public eventsMap = new Map<string, callbackType>([
    ['UserJoined', () => null],
    ['UserOffline', () => null],
    ['JoinChannelSuccess', () => null],
    ['ScreenshareStopped', () => null],
    ['RemoteAudioStateChanged', () => null],
    ['RemoteVideoStateChanged', () => null],
    ['NetworkQuality', () => null],
  ]);
  public localStream: LocalStream = {};
  public screenStream: ScreenStream = {};
  public remoteStreams = new Map<UID, RemoteStream>();
  private inScreenshare: Boolean = false;
  private videoProfile: VideoProfile = '480p_9';
  private isPublished = false;
  private isAudioEnabled = true;
  private isVideoEnabled = true;
  private isAudioPublished = false;
  private isVideoPublished = false;
  private isJoined = false;
  private deviceId = '';
  private muteLocalVideoMutex = false;
  private muteLocalAudioMutex = false;

  // Create channel profile and set it here

  // Create channel profile and set it here

  constructor(appId: string) {
    this.appId = appId;
    // this.AgoraRTC = AgoraRTC;
  }

  static async create(appId: string): Promise<RtcEngine> {
    let engine = new RtcEngine(appId);
    window.engine = engine;
    return engine;
  }

  async setVideoProfile(profile: VideoProfile): Promise<void> {
    this.videoProfile = profile;
  }

  async enableAudio(): Promise<void> {
    try {
      let localAudio = await AgoraRTC.createMicrophoneAudioTrack({});
      this.localStream.audio = localAudio;
    } catch (e) {
      let audioError = e;
      e.status = {audioError};
      throw e;
    }
  }

  async enableVideo(): Promise<void> {
    /**
     * Issue: Backgrounding the browser or app causes the audio streaming to be cut off.
     * Impact: All browsers and apps that use WKWebView on iOS 15.x, such as Safari and Chrome.
     * Solution:
     *    Upgrade to the Web SDK v4.7.3 or later versions.
     *    When calling createMicrophoneAudioTrack, set bypassWebAudio as true.
     *    The Web SDK directly publishes the local audio stream without processing it through WebAudio.
     */

    const audioConfig =
      Platform.OS == 'web' && isMobileOrTablet() ? {bypassWebAudio: true} : {};
    try {
      let [localAudio, localVideo] =
        await AgoraRTC.createMicrophoneAndCameraTracks(audioConfig, {
          encoderConfig: this.videoProfile,
        });
      this.localStream.audio = localAudio;
      this.localStream.video = localVideo;
    } catch (e) {
      let audioError = false;
      let videoError = false;
      try {
        let localAudio = await AgoraRTC.createMicrophoneAudioTrack(audioConfig);

        this.localStream.audio = localAudio;
      } catch (error) {
        audioError = error;
      }
      try {
        let localVideo = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: this.videoProfile,
        });
        this.localStream.video = localVideo;
      } catch (error) {
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
          await this.client.publish(tracks);
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
            (this.eventsMap.get('JoinChannelSuccess') as callbackType)();
          }
        }
      } catch (e) {
        console.error(e, this.localStream);
        this.isPublished = false;
      }
    }
  }

  async joinChannel(
    token: string,
    channelName: string,
    optionalInfo: string,
    optionalUid: number,
  ): Promise<void> {
    // TODO create agora client here
    this.client.on('user-joined', (user) => {
      (this.eventsMap.get('UserJoined') as callbackType)(user.uid);
      (this.eventsMap.get('RemoteVideoStateChanged') as callbackType)(
        user.uid,
        0,
        0,
        0,
      );
      (this.eventsMap.get('RemoteAudioStateChanged') as callbackType)(
        user.uid,
        0,
        0,
        0,
      );
    });

    this.client.on('user-left', (user) => {
      const uid = user.uid;
      if (this.remoteStreams.has(uid)) {
        this.remoteStreams.delete(uid);
      }
      (this.eventsMap.get('UserOffline') as callbackType)(uid);
      // (this.eventsMap.get('UserJoined') as callbackType)(uid);
    });
    this.client.on('user-published', async (user, mediaType) => {
      // Initiate the subscription
      if (this.inScreenshare && user.uid === this.screenClient.uid) {
        (this.eventsMap.get('RemoteVideoStateChanged') as callbackType)(
          user.uid,
          2,
          0,
          0,
        );
      } else {
        await this.client.subscribe(user, mediaType);
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
        (this.eventsMap.get('RemoteAudioStateChanged') as callbackType)(
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
        (this.eventsMap.get('RemoteVideoStateChanged') as callbackType)(
          user.uid,
          2,
          0,
          0,
        );
      }
    });
    this.client.on('user-unpublished', async (user, mediaType) => {
      if (mediaType === 'audio') {
        const {audio, ...rest} = this.remoteStreams.get(user.uid);
        this.remoteStreams.set(user.uid, rest);
        (this.eventsMap.get('RemoteAudioStateChanged') as callbackType)(
          user.uid,
          0,
          0,
          0,
        );
      } else {
        const {video, ...rest} = this.remoteStreams.get(user.uid);
        this.remoteStreams.set(user.uid, rest);
        (this.eventsMap.get('RemoteVideoStateChanged') as callbackType)(
          user.uid,
          0,
          0,
          0,
        );
      }
    });

    // this.client.on('stream-fallback', (evt))
    this.client.on('stream-type-changed', function (uid, streamType) {
      console.log('[fallback]: ', uid, streamType);
    });

    this.client.on(
      'network-quality',
      async ({downlinkNetworkQuality, uplinkNetworkQuality}) => {
        const networkQualityIndicatorCallback = this.eventsMap.get(
          'NetworkQuality',
        ) as callbackType;

        networkQualityIndicatorCallback(
          0,
          downlinkNetworkQuality,
          uplinkNetworkQuality,
        );

        const remoteUserNetworkQualities =
          this.client.getRemoteNetworkQuality();

        Object.keys(remoteUserNetworkQualities).forEach((uid) => {
          networkQualityIndicatorCallback(
            uid,
            remoteUserNetworkQualities[uid].downlinkNetworkQuality,
            remoteUserNetworkQualities[uid].uplinkNetworkQuality,
          );
        });
      },
    );

    await this.client.join(
      this.appId,
      channelName,
      token || null,
      optionalUid || null,
    );
    this.isJoined = true;

    await this.publish();
    console.log('enabling screen sleep');
  }

  async leaveChannel(): Promise<void> {
    this.client.leave();
    this.remoteStreams.forEach((stream, uid, map) => {
      stream.video?.close();
      stream.audio?.close();
    });
    this.remoteStreams.clear();
    console.log('disabling screen sleep');
  }

  addListener<EventType extends keyof RtcEngineEvents>(
    event: EventType,
    listener: RtcEngineEvents[EventType],
  ): Subscription {
    if (
      event === 'UserJoined' ||
      event === 'UserOffline' ||
      event === 'JoinChannelSuccess' ||
      event === 'ScreenshareStopped' ||
      event === 'RemoteAudioStateChanged' ||
      event === 'RemoteVideoStateChanged' ||
      event === 'NetworkQuality'
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
        await this.localStream.audio?.setMuted(muted);
        // Release the lock once done
        this.muteLocalAudioMutex = false;
        this.isAudioEnabled = !muted;
        // Unpublish only after when the user has joined the call
        if (!muted && !this.isAudioPublished && this.isJoined) {
          await this.publish();
        }
      }
    } catch (e) {
      if (didProcureMutexLock) {
        this.muteLocalAudioMutex = false;
      }
      console.error(
        e,
        '\n Be sure to invoke the enableVideo method before using this method.',
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
        await this.localStream.video?.setEnabled(!muted);
        // Release the lock once done
        this.muteLocalVideoMutex = false;

        this.isVideoEnabled = !muted;
        // Unpublish only after when the user has joined the call
        if (!muted && !this.isVideoPublished && this.isJoined) {
          await this.publish();
        }
      }
    } catch (e) {
      // If the function procures the mutex,
      // but if mute throws an error, the lock won't be released
      if (didProcureMutexLock) {
        this.muteLocalVideoMutex = false;
      }
      console.error(
        e,
        '\n Be sure to invoke the enableVideo method before using this method.',
      );
    }
  }

  async muteRemoteAudioStream(uid: number, muted: boolean): Promise<void> {
    try {
      this.remoteStreams.get(uid)?.audio?.setEnabled(!muted);
    } catch (e) {
      console.error(e);
    }
  }

  async muteRemoteVideoStream(uid: number, muted: boolean): Promise<void> {
    try {
      this.remoteStreams.get(uid)?.video?.setEnabled(!muted);
    } catch (e) {
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

  async setChannelProfile(profile: ChannelProfile): Promise<void> {
    try {
      this.client = AgoraRTC.createClient({
        codec: 'vp8',
        mode:
          profile === ChannelProfile.LiveBroadcasting ? mode.live : mode.rtc,
      });
      this.screenClient = AgoraRTC.createClient({
        codec: 'vp8',
        mode:
          profile === ChannelProfile.LiveBroadcasting ? mode.live : mode.rtc,
      });
    } catch (e) {
      throw e;
    }
  }

  async setClientRole(
    clientRole: ClientRole,
    options?: ClientRoleOptions,
  ): Promise<void> {
    try {
      if (clientRole == ClientRole.Audience) {
        if (this.isJoined) {
          // Unpublish the streams when role is changed to Audience
          await this.client.unpublish();
          this.isAudioPublished = false;
          this.isVideoPublished = false;
          this.isPublished = false;
        }
        await this.client.setClientRole(role.audience, options);
        await this.screenClient.setClientRole(role.audience, options);
      } else if (clientRole == ClientRole.Broadcaster) {
        await this.client.setClientRole(role.host);
        await this.screenClient.setClientRole(role.host);
      }
    } catch (e) {
      throw e;
    }
  }

  async changeCamera(cameraId, callback, error): Promise<void> {
    try {
      await this.localStream.video?.setDevice(cameraId);
      this.deviceId = cameraId;
      callback(cameraId);
    } catch (e) {
      error(e);
    }
  }

  async switchCamera(): Promise<void> {
    try {
      const devices = await AgoraRTC.getDevices(true);
      for (let i = 0; i < devices.length; i++) {
        let d = devices[i];
        if (d.kind === 'videoinput' && d.deviceId !== this.deviceId) {
          await this.localStream.video?.setDevice(d.deviceId);
          this.deviceId = d.deviceId;
          break;
        }
      }
    } catch (e) {
      throw e;
    }
  }

  async changeMic(micId, callback, error) {
    try {
      await this.localStream.audio?.setDevice(micId);
      callback(micId);
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
    this.streams.forEach((stream) => {
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
    },
  ): Promise<void> {
    let mode: EncryptionMode;
    mode = this.getEncryptionMode(enabled, config?.encryptionMode);
    try {
      await Promise.all([
        this.client.setEncryptionConfig(mode, config.encryptionKey),
        this.screenClient.setEncryptionConfig(mode, config.encryptionKey),
      ]);
    } catch (e) {
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

  async destroy(): Promise<void> {
    if (this.inScreenshare) {
      (this.eventsMap.get('UserOffline') as callbackType)(
        this.screenClient.uid,
      );
      this.screenClient.leave();
      (this.eventsMap.get('ScreenshareStopped') as callbackType)();
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
    },
    config: ScreenVideoTrackInitConfig = {},
    audio: 'enable' | 'disable' | 'auto' = 'auto',
  ): Promise<void> {
    if (!this.inScreenshare) {
      try {
        console.log('[screenshare]: creating stream');

        if (encryption && encryption.screenKey && encryption.mode) {
          let mode: EncryptionMode;
          mode = this.getEncryptionMode(true, encryption?.mode);
          try {
            /**
             * Since version 4.7.0, if client leaves a call
             * and joins again the encryption needs to be
             * set again
             */
            await this.screenClient.setEncryptionConfig(
              mode,
              encryption.screenKey,
            );
          } catch (e) {
            console.log('e: Encryption for screenshare failed', e);
          }
        }

        const screenTracks = await AgoraRTC.createScreenVideoTrack(
          config,
          audio,
        );
        if (this.isSingleTrack(screenTracks)) {
          this.screenStream.video = screenTracks;
        } else {
          this.screenStream.video = screenTracks[0];
          this.screenStream.audio = screenTracks[1];
        }
      } catch (e) {
        console.log('[screenshare]: Error during intialization');
        throw e;
      }

      await this.screenClient.join(
        this.appId,
        channelName,
        token || null,
        optionalUid || null,
      );

      this.inScreenshare = true;
      await this.screenClient.publish(
        this.screenStream.audio
          ? [this.screenStream.video, this.screenStream.audio]
          : this.screenStream.video,
      );

      this.screenStream.video.on('track-ended', () => {
        (this.eventsMap.get('UserOffline') as callbackType)(
          this.screenClient.uid,
        );

        this.screenClient.leave();

        this.screenStream.audio?.close();
        this.screenStream.video?.close();
        this.screenStream = {};

        (this.eventsMap.get('ScreenshareStopped') as callbackType)();
        this.inScreenshare = false;
      });
    } else {
      (this.eventsMap.get('UserOffline') as callbackType)(
        this.screenClient.uid,
      );
      this.screenClient.leave();
      (this.eventsMap.get('ScreenshareStopped') as callbackType)();
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
