import React, {
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {calculateBarData, draw} from './utils';
import {ILocalAudioTrack, IRemoteAudioTrack} from 'agora-rtc-sdk-ng';

export interface Props {
  /**
   * Width of the visualization. Default: "100%"
   */
  width?: number | string;
  /**
   * Height of the visualization. Default: "100%"
   */
  height?: number | string;
  /**
   * Width of each individual bar in the visualization. Default: `2`
   */
  barWidth?: number;
  /**
   * Gap between each bar in the visualization. Default: `1`
   */
  gap?: number;
  /**
   * BackgroundColor for the visualization: Default: `transparent`
   */
  backgroundColor?: string;
  /**
   * Color of the bars drawn in the visualization. Default: `"rgb(160, 198, 255)"`
   */
  barColor?: string;
  /**
   * An unsigned integer, representing the window size of the FFT, given in number of samples.
   * Default: `1024`
   */
  fftSize?:
    | 32
    | 64
    | 128
    | 256
    | 512
    | 1024
    | 2048
    | 4096
    | 8192
    | 16384
    | 32768;
  /**
   * A double, representing the maximum decibel value for scaling the FFT analysis data
   * Default: `-10`
   */
  maxDecibels?: number;
  /**
   * A double, representing the minimum decibel value for scaling the FFT analysis data
   * Default: `-90`
   */
  minDecibels?: number;
  /**
   * A double within the range 0 to 1 (0 meaning no time averaging). The default value is 0.8.
   * Default: `0.4`
   */
  smoothingTimeConstant?: number;
  audioTrack?: ILocalAudioTrack | IRemoteAudioTrack;
}

const LiveAudioVisualizer: (props: Props) => ReactElement = ({
  width = '100%',
  height = '100%',
  barWidth = 2,
  gap = 1,
  backgroundColor = 'transparent',
  barColor = 'rgb(160, 198, 255)',
  fftSize = 1024,
  maxDecibels = -10,
  minDecibels = -90,
  smoothingTimeConstant = 0.4,
  audioTrack,
}: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaStreamAudioSourceNode>();
  const [analyser, setAnalyser] = useState<AnalyserNode>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioTrack) {
      // Clean up if track is null
      if (audioContext) {
        audioContext.state !== 'closed' && audioContext.close();
        setAudioContext(null);
        setAnalyser(null);
        setAudioSource(null);
      }
      return;
    }

    const newAudioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const newAnalyser = newAudioContext.createAnalyser();
    newAnalyser.fftSize = fftSize;
    newAnalyser.minDecibels = minDecibels;
    newAnalyser.maxDecibels = maxDecibels;
    newAnalyser.smoothingTimeConstant = smoothingTimeConstant;

    const source = newAudioContext.createMediaStreamSource(
      new MediaStream([audioTrack.getMediaStreamTrack()]),
    );
    source.connect(newAnalyser);

    setAudioContext(newAudioContext);
    setAnalyser(newAnalyser);
    setAudioSource(source);

    return () => {
      source.disconnect();
      newAnalyser.disconnect();
      newAudioContext.state !== 'closed' && newAudioContext.close();
    };
  }, [audioTrack, fftSize, minDecibels, maxDecibels, smoothingTimeConstant]);

  useEffect(() => {
    if (analyser && audioTrack) {
      requestAnimationFrame(report);
    }
  }, [analyser, audioTrack]);

  const report = useCallback(() => {
    if (!analyser || !audioContext || !audioTrack) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    processFrequencyData(data);

    if (audioTrack.isPlaying) {
      requestAnimationFrame(report);
    }
  }, [analyser, audioContext, audioTrack]);

  const processFrequencyData = (data: Uint8Array): void => {
    if (!canvasRef.current) return;

    const dataPoints = calculateBarData(
      data,
      canvasRef.current.width,
      barWidth,
      gap,
    );
    draw(
      dataPoints,
      canvasRef.current,
      barWidth,
      gap,
      backgroundColor,
      barColor,
    );
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        aspectRatio: 'unset',
      }}
    />
  );
};

export {LiveAudioVisualizer};
