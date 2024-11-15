import React, {createContext, useState} from 'react';
import {useRtc} from 'customization-api';
import {createHook} from 'customization-implementation';
import {Platform} from 'react-native';

export type VideoEncoderConfigurationPreset = VideoProfilePreset;
export type ScreenEncoderConfigurationPreset = ScreenShareProfilePreset;

// Specifies a constraint for a property, such as the resolution or bitrate for video capture in
interface ConstraintLong {
  /**
   * A required value of a property. If the video capture device cannot output this value, the video capture fails.
   */
  exact?: number;
  /**
   * An ideal value of a property. If the video capture device cannot output this value, it outputs the closest value instead.
   */
  ideal?: number;
  /**
   * The upper limit of the property.
   */
  max?: number;
  /**
   * The lower limit of the property.
   */
  min?: number;
}

export interface VideoEncoderConfiguration {
  /**
   * The maximum bitrate of the video (Kbps).
   */
  bitrateMax?: number;
  /**
   * The minimum bitrate of the video (Kbps).
   */

  bitrateMin?: number;
  /**
   * Frame rate of the video (fps).
   * You can pass a number, or a constraint such as { max: 30, min: 5 }.
   */

  frameRate?: number | ConstraintLong;
  /**
   * Height of the video.
   * You can pass a number, or a constraint such as { max: 1280, min: 720 }.
   */
  height?: number | ConstraintLong;
  /**
   * Width of the video.
   * You can pass a number, or a constraint such as { max: 1280, min: 720 }.
   */
  width?: number | ConstraintLong;
}

export const videoProfilesArray: VideoEncoderConfigurationPreset[] = [
  '120p_1',
  '120p_3',
  '180p_1',
  '180p_3',
  '180p_4',
  '240p_1',
  '240p_3',
  '240p_4',
  '360p_1',
  '360p_3',
  '360p_4',
  '360p_6',
  '360p_7',
  '360p_8',
  '360p_9',
  '360p_10',
  '360p_11',
  '480p_1',
  '480p_2',
  '480p_3',
  '480p_4',
  '480p_6',
  '480p_8',
  '480p_9',
  '480p_10',
  '720p_1',
  '720p_2',
  '720p_3',
  '720p_5',
  '720p_6',
];

export const screenShareProfilesArray: ScreenEncoderConfigurationPreset[] = [
  '480p_1',
  '480p_2',
  '480p_3',
  '720p',
  '720p_1',
  '720p_2',
  '720p_3',
  '1080p',
  '1080p_1',
  '1080p_2',
  '1080p_3',
];

interface VideoQualityContextInterface {
  currentVideoQuality:
    | VideoEncoderConfigurationPreset
    | VideoEncoderConfiguration;
  setVideoQuality: (
    videoQuality: VideoEncoderConfigurationPreset | VideoEncoderConfiguration,
  ) => void;
  currentScreenShareQuality:
    | ScreenEncoderConfigurationPreset
    | VideoEncoderConfiguration;
  setScreenShareQuality: (
    screenShareQuality:
      | ScreenEncoderConfigurationPreset
      | VideoEncoderConfiguration,
  ) => void;
  videoEncoderPresets: VideoEncoderConfigurationPreset[];
  screenShareEncoderPresets: ScreenEncoderConfigurationPreset[];
}

export const VideoQualityContext = createContext<VideoQualityContextInterface>({
  currentVideoQuality: $config.PROFILE,
  setVideoQuality: (
    _p: VideoEncoderConfigurationPreset | VideoEncoderConfiguration,
  ) => {},
  currentScreenShareQuality: $config.SCREEN_SHARE_PROFILE,
  setScreenShareQuality: (
    _p: ScreenEncoderConfigurationPreset | VideoEncoderConfiguration,
  ) => {},
  videoEncoderPresets: videoProfilesArray,
  screenShareEncoderPresets: screenShareProfilesArray,
});

export const VideoQualityContextProvider = props => {
  const [currentVideoQuality, setCurrentVideoQuality] = useState<
    VideoEncoderConfigurationPreset | VideoEncoderConfiguration
  >($config.PROFILE);

  const [currentScreenShareQuality, setCurrentScreenShareQuality] = useState<
    ScreenEncoderConfigurationPreset | VideoEncoderConfiguration
  >($config.SCREEN_SHARE_PROFILE);

  const {RtcEngineUnsafe} = useRtc();

  const setVideoQuality = async (
    q: VideoEncoderConfigurationPreset | VideoEncoderConfiguration,
  ) => {
    if (Platform.OS === 'web' && RtcEngineUnsafe) {
      // @ts-ignore
      await RtcEngineUnsafe.setVideoProfile(q);
      setCurrentVideoQuality(q);
    }
  };

  const setScreenShareQuality = async (
    q: ScreenEncoderConfigurationPreset | VideoEncoderConfiguration,
  ) => {
    if (Platform.OS === 'web' && RtcEngineUnsafe) {
      // @ts-ignore
      await RtcEngineUnsafe.setScreenShareProfile(q);
      setCurrentScreenShareQuality(q);
    }
  };

  return (
    <VideoQualityContext.Provider
      value={{
        currentVideoQuality,
        setVideoQuality,
        currentScreenShareQuality,
        setScreenShareQuality,
        videoEncoderPresets: videoProfilesArray,
        screenShareEncoderPresets: screenShareProfilesArray,
      }}>
      {props.children}
    </VideoQualityContext.Provider>
  );
};

export const useVideoQuality = createHook(VideoQualityContext);
