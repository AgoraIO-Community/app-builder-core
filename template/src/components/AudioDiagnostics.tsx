import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {IAgoraRTCClient, ILocalAudioTrack} from 'agora-rtc-sdk-ng';
import {RtcContext, ToggleState} from '../../agora-rn-uikit';
import {useLocalUserInfo} from 'customization-api';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import ChatContext from './ChatContext';
import {webLinkStateMapping} from '../../bridge/rtm/web/Types';

type AudioEngine = {
  client?: IAgoraRTCClient;
  localStream?: {audio?: ILocalAudioTrack};
};

type AudioSnapshot = {
  appMic: string;
  rtcConnection: string;
  sdkMic: string;
  sdkTrackMuted: string;
  sdkTrackEnabled: string;
  browserTrack: string;
  published: string;
  inputLevel: string;
  sendBitrate: string;
  sendBytes: string;
  upstreamLoss: string;
};

type TrackProcessorConstructor = new (input: {track: MediaStreamTrack}) => {
  readable?: ReadableStream;
};

const unavailable = '—';

const errorLabel = (error: unknown) =>
  error instanceof Error ? `${error.name}: ${error.message}` : String(error);

const appMicLabel = (value?: ToggleState) => {
  switch (value) {
    case ToggleState.enabled:
      return 'On';
    case ToggleState.disabled:
      return 'Off';
    case ToggleState.enabling:
      return 'Turning on';
    case ToggleState.disabling:
      return 'Turning off';
    default:
      return unavailable;
  }
};

const readAudioSnapshot = (
  engine: AudioEngine | undefined,
  appAudioState?: ToggleState,
): AudioSnapshot => {
  const client = engine?.client;
  const track = engine?.localStream?.audio;
  let browserTrack: MediaStreamTrack | undefined;
  let sdkMic = unavailable;
  let inputLevel = unavailable;
  let stats: ReturnType<IAgoraRTCClient['getLocalAudioStats']> | undefined;

  try {
    browserTrack = track?.getMediaStreamTrack();
    if (track) {
      inputLevel = track.getVolumeLevel().toFixed(2);
    }
    if (client?.connectionState === 'CONNECTED') {
      stats = client.getLocalAudioStats();
    }
  } catch (_) {
    // A track can be replaced or closed while this snapshot is being read.
  }

  if (track && browserTrack?.readyState === 'ended') {
    sdkMic = 'Ended';
  } else if (track) {
    sdkMic = track.muted || !track.enabled ? 'Off' : 'On';
  }

  return {
    appMic: appMicLabel(appAudioState),
    rtcConnection: client?.connectionState ?? unavailable,
    sdkMic,
    sdkTrackMuted: track ? String(track.muted) : unavailable,
    sdkTrackEnabled: track ? String(track.enabled) : unavailable,
    browserTrack: browserTrack
      ? `${browserTrack.readyState}, enabled=${browserTrack.enabled}, muted=${browserTrack.muted}`
      : unavailable,
    published:
      client && track
        ? String(client.localTracks.includes(track))
        : unavailable,
    inputLevel,
    sendBitrate:
      typeof stats?.sendBitrate === 'number'
        ? `${(stats.sendBitrate / 1000).toFixed(1)} kbps`
        : unavailable,
    sendBytes:
      typeof stats?.sendBytes === 'number'
        ? stats.sendBytes.toLocaleString()
        : unavailable,
    upstreamLoss:
      typeof stats?.currentPacketLossRate === 'number'
        ? String(stats.currentPacketLossRate)
        : unavailable,
  };
};

const AudioDiagnostics = () => {
  const {RtcEngineUnsafe} = useContext(RtcContext);
  const {
    hasUserJoinedRTM,
    rtmConnectionState,
    rtmLinkState,
    debugInterruptRtm,
  } = useContext(ChatContext) ?? {};
  const engine = RtcEngineUnsafe as unknown as AudioEngine | undefined;
  const client = engine?.client;
  const local = useLocalUserInfo();
  const appAudioStateRef = useRef(local?.audio);
  appAudioStateRef.current = local?.audio;

  const [snapshot, setSnapshot] = useState<AudioSnapshot>(() =>
    readAudioSnapshot(engine, local?.audio),
  );
  const [events, setEvents] = useState<string[]>([]);
  const [rtmTestPending, setRtmTestPending] = useState(false);
  const [rtmTestResult, setRtmTestResult] = useState('');
  const [processorTestResult, setProcessorTestResult] = useState('');

  const appendEvent = useCallback((message: string, details?: object) => {
    const time = new Date().toISOString();
    setEvents(previous => [`${time}  ${message}`, ...previous].slice(0, 12));
    logger.log(
      LogSource.Internals,
      'DEVICE_CONFIGURE',
      `[AUDIO_DIAGNOSTICS] ${message}`,
      details ?? {},
    );
  }, []);

  useEffect(() => {
    if (!client) {
      return;
    }

    let observedTrack: MediaStreamTrack | undefined;
    let previousState = '';
    const onTrackEnded = () => appendEvent('Browser microphone track ended');
    const onTrackMute = () => appendEvent('Browser microphone track muted');
    const onTrackUnmute = () => appendEvent('Browser microphone track unmuted');
    const detachTrack = () => {
      observedTrack?.removeEventListener('ended', onTrackEnded);
      observedTrack?.removeEventListener('mute', onTrackMute);
      observedTrack?.removeEventListener('unmute', onTrackUnmute);
    };
    const sample = () => {
      const current = readAudioSnapshot(engine, appAudioStateRef.current);
      setSnapshot(current);

      let nextTrack: MediaStreamTrack | undefined;
      try {
        nextTrack = engine?.localStream?.audio?.getMediaStreamTrack();
      } catch (_) {}
      if (nextTrack !== observedTrack) {
        detachTrack();
        observedTrack = nextTrack;
        observedTrack?.addEventListener('ended', onTrackEnded);
        observedTrack?.addEventListener('mute', onTrackMute);
        observedTrack?.addEventListener('unmute', onTrackUnmute);
        appendEvent(
          nextTrack
            ? 'Browser microphone track attached'
            : 'Browser microphone track removed',
        );
      }

      const state = [
        current.appMic,
        current.rtcConnection,
        current.sdkTrackMuted,
        current.sdkTrackEnabled,
        current.browserTrack,
        current.published,
      ].join('|');
      if (previousState && previousState !== state) {
        appendEvent('Audio state changed', {
          appMic: current.appMic,
          rtcConnection: current.rtcConnection,
          sdkTrackMuted: current.sdkTrackMuted,
          sdkTrackEnabled: current.sdkTrackEnabled,
          browserTrack: current.browserTrack,
          published: current.published,
        });
      }
      previousState = state;
    };
    const onConnection = (current: string, previous: string, reason?: string) =>
      appendEvent(
        `RTC ${previous} → ${current}${reason ? ` (${reason})` : ''}`,
      );
    const onPublished = (user: {uid: string | number}, mediaType: string) => {
      if (mediaType === 'audio') {
        appendEvent(`Remote audio published: ${user.uid}`);
      }
    };
    const onUnpublished = (user: {uid: string | number}, mediaType: string) => {
      if (mediaType === 'audio') {
        appendEvent(`Remote audio unpublished: ${user.uid}`);
      }
    };

    client.on('connection-state-change', onConnection);
    client.on('user-published', onPublished);
    client.on('user-unpublished', onUnpublished);
    sample();
    const interval = setInterval(sample, 1000);

    return () => {
      clearInterval(interval);
      detachTrack();
      client.off('connection-state-change', onConnection);
      client.off('user-published', onPublished);
      client.off('user-unpublished', onUnpublished);
    };
  }, [appendEvent, client, engine]);

  useEffect(() => {
    if (!rtmLinkState) {
      return;
    }
    appendEvent(
      `RTM ${webLinkStateMapping[rtmLinkState.previousState] ?? 'UNKNOWN'} → ${
        webLinkStateMapping[rtmLinkState.currentState] ?? 'UNKNOWN'
      } (reason ${rtmLinkState.reasonCode})`,
      {
        ...rtmLinkState,
        audio: readAudioSnapshot(engine, appAudioStateRef.current),
      },
    );
  }, [appendEvent, engine, rtmLinkState]);

  const markIncident = () => {
    const current = readAudioSnapshot(engine, appAudioStateRef.current);
    setSnapshot(current);
    appendEvent('Incident marked by user', {
      ...current,
      rtmConnection:
        webLinkStateMapping[rtmConnectionState ?? 0] ?? unavailable,
    });
  };

  const interruptRtm = async () => {
    if (!debugInterruptRtm || rtmTestPending) {
      return;
    }
    setRtmTestPending(true);
    setRtmTestResult('RTM interruption in progress…');
    appendEvent(
      'RTM-only interruption requested (10 seconds)',
      readAudioSnapshot(engine, appAudioStateRef.current),
    );
    try {
      await debugInterruptRtm();
      setRtmTestResult('RTM reconnected and resubscribed');
      appendEvent(
        'RTM-only interruption completed',
        readAudioSnapshot(engine, appAudioStateRef.current),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setRtmTestResult(`RTM test failed: ${message}`);
      appendEvent('RTM-only interruption failed', {error: message});
    } finally {
      setRtmTestPending(false);
    }
  };

  const testVideoTrackStates = () => {
    const Processor = (
      globalThis as typeof globalThis & {
        MediaStreamTrackProcessor?: TrackProcessorConstructor;
      }
    ).MediaStreamTrackProcessor;

    if (!Processor || typeof document === 'undefined') {
      const result =
        'MediaStreamTrackProcessor is unavailable in this browser.';
      setProcessorTestResult(result);
      appendEvent('Disposable video track test unavailable', {result});
      return;
    }

    let track: MediaStreamTrack | undefined;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 2;
      track = canvas.captureStream(1).getVideoTracks()[0];
      if (!track) {
        throw new Error('Canvas capture did not create a video track');
      }

      track.enabled = false;
      const disabledState = track.readyState;
      let disabledResult = 'accepted';
      try {
        const processor = new Processor({track});
        processor.readable?.cancel().catch(() => {});
      } catch (error) {
        disabledResult = errorLabel(error);
      }

      track.stop();
      const endedState = track.readyState;
      let endedResult = 'accepted';
      try {
        const processor = new Processor({track});
        processor.readable?.cancel().catch(() => {});
      } catch (error) {
        endedResult = errorLabel(error);
      }

      const result = `Disabled (${disabledState}): ${disabledResult}\nEnded (${endedState}): ${endedResult}`;
      setProcessorTestResult(result);
      appendEvent('Disposable video track processor test completed', {
        disabledState,
        disabledResult,
        endedState,
        endedResult,
      });
    } catch (error) {
      const result = `Video track test failed: ${errorLabel(error)}`;
      setProcessorTestResult(result);
      appendEvent('Disposable video track processor test failed', {result});
    } finally {
      track?.stop();
    }
  };

  const rows: Array<[string, string]> = [
    ['App mic', snapshot.appMic],
    ['RTC connection', snapshot.rtcConnection],
    [
      'RTM connection',
      webLinkStateMapping[rtmConnectionState ?? 0] ?? unavailable,
    ],
    ['SDK mic', snapshot.sdkMic],
    ['Audio published', snapshot.published],
    ['Input level', snapshot.inputLevel],
    ['Audio send rate', snapshot.sendBitrate],
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Audio diagnostics (POC)</Text>
      <Text style={styles.hint}>
        Keep this panel open during the test. These readings do not change your
        microphone.
      </Text>
      {rows.map(([label, value]) => (
        <View style={styles.row} key={label}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={testVideoTrackStates}>
        <Text style={styles.buttonText}>Compare disabled vs ended video</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>
        Uses a temporary canvas track, not your camera or microphone. Reproduces
        a browser constructor error only; it does not recreate the call failure.
      </Text>
      {processorTestResult ? (
        <Text style={styles.event}>{processorTestResult}</Text>
      ) : null}
      <TouchableOpacity style={styles.button} onPress={markIncident}>
        <Text style={styles.buttonText}>Mark incident</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          (rtmTestPending || !hasUserJoinedRTM || rtmConnectionState !== 2) &&
            styles.buttonDisabled,
        ]}
        disabled={
          rtmTestPending || !hasUserJoinedRTM || rtmConnectionState !== 2
        }
        onPress={interruptRtm}>
        <Text style={styles.buttonText}>
          {rtmTestPending ? 'Restoring RTM…' : 'Log out/in RTM (10 seconds)'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.hint}>
        Test calls only: chat and presence disconnect, then reconnect. RTC and
        microphone are not changed. This does not create the exact socket error
        shown in the incident screenshot.
      </Text>
      {rtmTestResult ? <Text style={styles.event}>{rtmTestResult}</Text> : null}
      <Text style={styles.hint}>
        To test reconnect recovery, interrupt Wi-Fi externally, then restore it.
        Do not use mute or leave.
      </Text>
      <Text style={styles.eventsTitle}>Recent events (UTC)</Text>
      {events.length ? (
        events.map((event, index) => (
          <Text style={styles.event} key={`${index}-${event}`}>
            {event}
          </Text>
        ))
      ) : (
        <Text style={styles.event}>No events yet</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderRadius: 8,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
  },
  heading: {color: $config.FONT_COLOR, fontSize: 16, fontWeight: '600'},
  hint: {
    color: $config.SEMANTIC_NEUTRAL,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: $config.INPUT_FIELD_BORDER_COLOR,
    paddingVertical: 8,
  },
  label: {color: $config.SEMANTIC_NEUTRAL, fontSize: 12, flex: 1},
  value: {color: $config.FONT_COLOR, fontSize: 12, flex: 1, textAlign: 'right'},
  button: {
    alignItems: 'center',
    padding: 10,
    marginTop: 12,
    borderRadius: 6,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  buttonDisabled: {opacity: 0.5},
  buttonText: {color: $config.PRIMARY_ACTION_TEXT_COLOR, fontWeight: '600'},
  eventsTitle: {color: $config.FONT_COLOR, fontSize: 13, fontWeight: '600'},
  event: {color: $config.SEMANTIC_NEUTRAL, fontSize: 11, marginTop: 6},
});

export default AudioDiagnostics;
