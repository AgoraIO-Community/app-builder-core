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

import {ILocalVideoTrack, IRemoteVideoTrack} from 'agora-rtc-sdk-ng';
import React, {useEffect, useRef} from 'react';
import {StyleProp, StyleSheet, ViewProps, ViewStyle} from 'react-native';
import {RenderModeType} from './Types';
import {LogSource, logger} from '../../../src/logger/AppBuilderLogger';
import {getScreenshareMediaHealthOutcome} from './screenshareMediaHealth';

let screenshareRenderInstanceCounter = 0;

export interface RtcSurfaceViewProps extends ViewProps {
  canvas: {
    renderMode?: RenderModeType;
    uid?: number;
    isScreenshare?: boolean;
    screenshareSurface?: 'min' | 'max' | 'unknown';
  };
}

export interface StyleProps {
  style?: StyleProp<ViewStyle>;
}

interface SurfaceViewInterface extends RtcSurfaceViewProps, StyleProps {}

const RtcSurfaceView = (props: SurfaceViewInterface) => {
  const {
    uid,
    renderMode,
    isScreenshare = false,
    screenshareSurface = renderMode === RenderModeType.RenderModeHidden
      ? 'min'
      : 'max',
  } = props.canvas;
  const renderInstanceIdRef = useRef<string | null>(null);
  if (!renderInstanceIdRef.current) {
    renderInstanceIdRef.current = `screenshare-render-${++screenshareRenderInstanceCounter}`;
  }
  const renderInstanceId = renderInstanceIdRef.current;
  const stream: ILocalVideoTrack | IRemoteVideoTrack =
    uid === 0
      ? window.engine?.localStream?.video
      : uid === 1
      ? window.engine?.screenStream?.video
      : window.engine?.remoteStreams?.get?.(uid)?.video;
  useEffect(
    function () {
      if (isScreenshare && uid !== undefined && uid !== 1) {
        window.engine?.registerRemoteScreenshareUid?.(uid);
      }
      if (stream?.play) {
        try {
          if (renderMode === RenderModeType.RenderModeFit) {
            stream.play(String(uid), {fit: 'contain'});
          } else {
            stream.play(String(uid));
          }
          if (isScreenshare) {
            logger.log(
              LogSource.AgoraSDK,
              'API',
              '[SCREENSHARE_JOURNEY] screen share video surface mounted and track.play invoked',
              {
                action: 'monitor',
                stage: 'video_play',
                outcome: 'invoked',
                screenShareUid: uid,
                role: uid === 1 ? 'sender' : 'viewer',
                screenshareSurface,
                renderInstanceId,
              },
            );
          }
        } catch (error) {
          if (isScreenshare) {
            logger.error(
              LogSource.AgoraSDK,
              'API',
              '[SCREENSHARE_JOURNEY] screen share video track play failed',
              {
                action: 'monitor',
                stage: 'video_play',
                outcome: 'failure',
                screenShareUid: uid,
                role: uid === 1 ? 'sender' : 'viewer',
                screenshareSurface,
                renderInstanceId,
                sdkErrorName: (error as Error)?.name,
                sdkErrorMessage:
                  (error as Error)?.message || String(error || ''),
              },
            );
          }
        }
      }
      let healthTimer: ReturnType<typeof setInterval> | undefined;
      let consecutiveUnhealthySamples = 0;
      let lastLoggedOutcome: string | undefined;
      if (isScreenshare && stream) {
        const checkHealth = () => {
          const diagnostics =
            window.engine?.getScreenshareMediaDiagnostics?.(uid);
          if (!diagnostics) {
            return;
          }
          const stats: any = diagnostics?.stats || {};
          const videoElement = document
            .getElementById(String(uid))
            ?.querySelector('video');
          const isSender = diagnostics.role === 'sender';
          const outcome = getScreenshareMediaHealthOutcome({
            trackReadyState: diagnostics.mediaTrack?.readyState,
            bitrate: isSender ? stats.sendBitrate : stats.receiveBitrate,
            frameRate: isSender
              ? stats.sendFrameRate || stats.captureFrameRate
              : stats.renderFrameRate ||
                stats.decodeFrameRate ||
                stats.receiveFrameRate,
            width: isSender
              ? stats.sendResolutionWidth || stats.captureResolutionWidth
              : stats.receiveResolutionWidth,
            height: isSender
              ? stats.sendResolutionHeight || stats.captureResolutionHeight
              : stats.receiveResolutionHeight,
            videoElementPresent: Boolean(videoElement),
            renderedWidth: videoElement?.videoWidth,
            renderedHeight: videoElement?.videoHeight,
          });
          consecutiveUnhealthySamples =
            outcome === 'healthy' ? 0 : consecutiveUnhealthySamples + 1;
          const reportableOutcome =
            outcome === 'healthy'
              ? lastLoggedOutcome && lastLoggedOutcome !== 'healthy'
                ? 'recovered'
                : 'healthy'
              : consecutiveUnhealthySamples >= 2
              ? outcome
              : 'checking';
          if (
            reportableOutcome !== 'checking' &&
            reportableOutcome !== lastLoggedOutcome
          ) {
            logger[
              reportableOutcome === 'healthy' ||
              reportableOutcome === 'recovered'
                ? 'log'
                : 'warn'
            ](
              LogSource.AgoraSDK,
              'API',
              `[SCREENSHARE_JOURNEY] screen share media health ${reportableOutcome}`,
              {
                action: 'monitor',
                stage: 'media_health',
                outcome: reportableOutcome,
                role: diagnostics.role,
                screenshareSessionId: diagnostics.screenshareSessionId,
                screenShareUid: diagnostics.screenShareUid,
                screenshareSurface,
                renderInstanceId,
                stats,
                mediaTrack: diagnostics.mediaTrack
                  ? {
                      readyState: diagnostics.mediaTrack.readyState,
                      enabled: diagnostics.mediaTrack.enabled,
                      muted: diagnostics.mediaTrack.muted,
                    }
                  : null,
                render: {
                  videoElementPresent: Boolean(videoElement),
                  readyState: videoElement?.readyState,
                  paused: videoElement?.paused,
                  videoWidth: videoElement?.videoWidth,
                  videoHeight: videoElement?.videoHeight,
                },
              },
            );
            lastLoggedOutcome = reportableOutcome;
          }
        };
        healthTimer = setInterval(checkHealth, 5000);
        return () => {
          clearInterval(healthTimer);
          let mediaTrack: MediaStreamTrack | null = null;
          try {
            mediaTrack = stream?.getMediaStreamTrack?.() || null;
          } catch (_) {}
          logger.log(
            LogSource.AgoraSDK,
            'Event',
            '[SCREENSHARE_JOURNEY] screen share video render unmounted',
            {
              action: 'stop',
              stage: 'video_render_cleanup',
              outcome: 'unmounted',
              role: uid === 1 ? 'sender' : 'viewer',
              screenshareSessionId:
                uid === 1
                  ? window.engine?.getScreenshareMediaDiagnostics?.(uid)
                      ?.screenshareSessionId || 'unknown-session'
                  : 'remote-session-by-screen-uid',
              screenShareUid: uid,
              screenshareSurface,
              renderInstanceId,
              playbackCleanup: 'track_playback_stopped',
              mediaTrack: mediaTrack
                ? {
                    readyState: mediaTrack.readyState,
                    enabled: mediaTrack.enabled,
                    muted: mediaTrack.muted,
                  }
                : null,
            },
          );
          stream?.stop?.();
        };
      }
      return () => {
        console.log(`unmounting stream ${uid}`, stream);
        stream && stream.stop();
      };
    },
    [
      uid,
      renderMode,
      stream,
      isScreenshare,
      screenshareSurface,
      renderInstanceId,
    ],
  );

  return stream ? (
    <div
      id={String(uid)}
      className={'video-container'}
      style={{...style.full, ...(props.style as Object), overflow: 'hidden'}}
    />
  ) : (
    <div style={{...style.full, backgroundColor: 'black'}} />
  );
};

const style = StyleSheet.create({
  full: {
    flex: 1,
  },
});

export default RtcSurfaceView;
