import {getScreenshareMediaHealthOutcome} from '../screenshareMediaHealth';

describe('screen-share media health classification', () => {
  it('classifies flowing and rendered video as healthy', () => {
    expect(
      getScreenshareMediaHealthOutcome({
        trackReadyState: 'live',
        bitrate: 900000,
        frameRate: 15,
        width: 1920,
        height: 1080,
        videoElementPresent: true,
        renderedWidth: 1920,
        renderedHeight: 1080,
      }),
    ).toBe('healthy');
  });

  it('classifies zero bitrate or frames as suspected blank video', () => {
    expect(
      getScreenshareMediaHealthOutcome({
        trackReadyState: 'live',
        bitrate: 0,
        frameRate: 0,
        width: 1920,
        height: 1080,
      }),
    ).toBe('suspected_blank');
  });

  it('classifies a missing render element as suspected blank video', () => {
    expect(
      getScreenshareMediaHealthOutcome({
        trackReadyState: 'live',
        bitrate: 900000,
        frameRate: 15,
        width: 1920,
        height: 1080,
        videoElementPresent: false,
      }),
    ).toBe('suspected_blank');
  });

  it('reports an ended source track separately', () => {
    expect(getScreenshareMediaHealthOutcome({trackReadyState: 'ended'})).toBe(
      'track_ended',
    );
  });
});
