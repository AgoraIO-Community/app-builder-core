export type ScreenshareMediaHealthOutcome =
  | 'healthy'
  | 'suspected_blank'
  | 'track_ended'
  | 'stats_unavailable';

export const getScreenshareMediaHealthOutcome = ({
  trackReadyState,
  bitrate,
  frameRate,
  width,
  height,
  videoElementPresent = true,
  renderedWidth,
  renderedHeight,
}: {
  trackReadyState?: MediaStreamTrackState;
  bitrate?: number;
  frameRate?: number;
  width?: number;
  height?: number;
  videoElementPresent?: boolean;
  renderedWidth?: number;
  renderedHeight?: number;
}): ScreenshareMediaHealthOutcome => {
  if (trackReadyState === 'ended') {
    return 'track_ended';
  }
  if (
    bitrate === undefined &&
    frameRate === undefined &&
    width === undefined &&
    height === undefined
  ) {
    return 'stats_unavailable';
  }
  if (
    !videoElementPresent ||
    !bitrate ||
    !frameRate ||
    !width ||
    !height ||
    renderedWidth === 0 ||
    renderedHeight === 0
  ) {
    return 'suspected_blank';
  }
  return 'healthy';
};
