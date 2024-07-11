import React, {createContext, useState} from 'react';
import {useRtc} from 'customization-api';
import {createHook} from 'customization-implementation';
import {Platform} from 'react-native';

export type VideoQualityType = typeof $config.PROFILE;
export type ScreenShareQualityType = typeof $config.SCREEN_SHARE_PROFILE;

export const videoProfilesArray: VideoQualityType[] = [
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

export const screenShareProfilesArray: ScreenShareQualityType[] = [
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
  videoQuality: VideoQualityType;
  setVideoQuality: (videoQuality: VideoQualityType) => void;
  screenShareQuality: ScreenShareQualityType;
  setScreenShareQuality: (screenShareQuality: ScreenShareQualityType) => void;
}

export const VideoQualityContext = createContext<VideoQualityContextInterface>({
  videoQuality: $config.PROFILE,
  setVideoQuality: (_p: VideoQualityType) => {},
  screenShareQuality: $config.SCREEN_SHARE_PROFILE,
  setScreenShareQuality: (_p: ScreenShareQualityType) => {},
});

export const VideoQualityContextProvider = props => {
  const [currentVideoQuality, setCurrentVideoQuality] =
    useState<VideoQualityType>($config.PROFILE);

  const [currentScreenShareQuality, setCurrentScreenShareQuality] =
    useState<ScreenShareQualityType>($config.SCREEN_SHARE_PROFILE);
  const {RtcEngineUnsafe} = useRtc();

  const setVideoQuality = async (p: VideoQualityType) => {
    if (Platform.OS === 'web' && RtcEngineUnsafe) {
      // @ts-ignore
      await RtcEngineUnsafe.setVideoProfile(p);
      setCurrentVideoQuality(p);
    }
  };

  const setScreenShareQuality = async (p: ScreenShareQualityType) => {
    if (Platform.OS === 'web' && RtcEngineUnsafe) {
      // @ts-ignore
      await RtcEngineUnsafe.setScreenShareProfile(p);
      setCurrentScreenShareQuality(p);
    }
  };

  return (
    <VideoQualityContext.Provider
      value={{
        videoQuality: currentVideoQuality,
        setVideoQuality,
        screenShareQuality: currentScreenShareQuality,
        setScreenShareQuality,
      }}>
      {props.children}
    </VideoQualityContext.Provider>
  );
};

export const useVideoQuality = createHook(VideoQualityContext);
