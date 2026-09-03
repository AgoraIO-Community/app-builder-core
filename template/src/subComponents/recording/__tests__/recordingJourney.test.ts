import {runPostStartRecordingLayoutUpdate} from '../recordingJourney';

describe('recording journey', () => {
  it('does not reject recording start when the post-start layout update fails', async () => {
    const layoutError = new Error('layout update failed');
    const onFailure = jest.fn();

    await expect(
      runPostStartRecordingLayoutUpdate(
        () => Promise.reject(layoutError),
        onFailure,
      ),
    ).resolves.toBe(false);
    expect(onFailure).toHaveBeenCalledWith(layoutError);
  });

  it('reports a successful post-start layout update', async () => {
    const onFailure = jest.fn();

    await expect(
      runPostStartRecordingLayoutUpdate(() => Promise.resolve(), onFailure),
    ).resolves.toBe(true);
    expect(onFailure).not.toHaveBeenCalled();
  });
});
