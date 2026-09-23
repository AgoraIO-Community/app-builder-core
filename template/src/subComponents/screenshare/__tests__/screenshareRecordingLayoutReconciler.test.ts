import {createScreenshareRecordingLayoutReconciler} from '../screenshareRecordingLayoutReconciler';

describe('screen-share recording layout reconciler', () => {
  it('waits until recording and a published screen share are both active', async () => {
    const executePresenterQuery = jest.fn().mockResolvedValue(undefined);
    const reconciler = createScreenshareRecordingLayoutReconciler();

    await expect(
      reconciler.reconcile({
        screenshareSessionId: 'session-1',
        isRecordingActive: true,
        isScreenshareActive: false,
        executePresenterQuery,
      }),
    ).resolves.toBe('not_ready');
    expect(executePresenterQuery).not.toHaveBeenCalled();
  });

  it('applies presenter layout once both states are active', async () => {
    const executePresenterQuery = jest.fn().mockResolvedValue(undefined);
    const reconciler = createScreenshareRecordingLayoutReconciler();

    await expect(
      reconciler.reconcile({
        screenshareSessionId: 'session-1',
        isRecordingActive: true,
        isScreenshareActive: true,
        executePresenterQuery,
      }),
    ).resolves.toBe('applied');
    expect(executePresenterQuery).toHaveBeenCalledTimes(1);
  });

  it('reconciles when recording becomes active while screen-share publishing is still pending', async () => {
    const executePresenterQuery = jest.fn().mockResolvedValue(undefined);
    const reconciler = createScreenshareRecordingLayoutReconciler();

    await expect(
      reconciler.reconcile({
        screenshareSessionId: 'session-1',
        isRecordingActive: false,
        isScreenshareActive: false,
        executePresenterQuery,
      }),
    ).resolves.toBe('not_ready');
    await expect(
      reconciler.reconcile({
        screenshareSessionId: 'session-1',
        isRecordingActive: true,
        isScreenshareActive: false,
        executePresenterQuery,
      }),
    ).resolves.toBe('not_ready');
    await expect(
      reconciler.reconcile({
        screenshareSessionId: 'session-1',
        isRecordingActive: true,
        isScreenshareActive: true,
        executePresenterQuery,
      }),
    ).resolves.toBe('applied');
    expect(executePresenterQuery).toHaveBeenCalledTimes(1);
  });

  it('does not duplicate a layout query for the same recording and screen-share session', async () => {
    const executePresenterQuery = jest.fn().mockResolvedValue(undefined);
    const reconciler = createScreenshareRecordingLayoutReconciler();
    const args = {
      screenshareSessionId: 'session-1',
      isRecordingActive: true,
      isScreenshareActive: true,
      executePresenterQuery,
    };

    await expect(reconciler.reconcile(args)).resolves.toBe('applied');
    await expect(reconciler.reconcile(args)).resolves.toBe('already_applied');
    expect(executePresenterQuery).toHaveBeenCalledTimes(1);
  });

  it('deduplicates a query that is already in progress', async () => {
    let resolveQuery: () => void = () => {};
    const executePresenterQuery = jest.fn(
      () =>
        new Promise<void>(resolve => {
          resolveQuery = resolve;
        }),
    );
    const reconciler = createScreenshareRecordingLayoutReconciler();
    const args = {
      screenshareSessionId: 'session-1',
      isRecordingActive: true,
      isScreenshareActive: true,
      executePresenterQuery,
    };

    const firstReconciliation = reconciler.reconcile(args);
    await expect(reconciler.reconcile(args)).resolves.toBe('in_progress');
    resolveQuery();
    await expect(firstReconciliation).resolves.toBe('applied');
    expect(executePresenterQuery).toHaveBeenCalledTimes(1);
  });

  it('applies layout again when recording restarts during the same screen-share session', async () => {
    const executePresenterQuery = jest.fn().mockResolvedValue(undefined);
    const reconciler = createScreenshareRecordingLayoutReconciler();

    await reconciler.reconcile({
      screenshareSessionId: 'session-1',
      isRecordingActive: true,
      isScreenshareActive: true,
      executePresenterQuery,
    });
    await reconciler.reconcile({
      screenshareSessionId: 'session-1',
      isRecordingActive: false,
      isScreenshareActive: true,
      executePresenterQuery,
    });
    await expect(
      reconciler.reconcile({
        screenshareSessionId: 'session-1',
        isRecordingActive: true,
        isScreenshareActive: true,
        executePresenterQuery,
      }),
    ).resolves.toBe('applied');
    expect(executePresenterQuery).toHaveBeenCalledTimes(2);
  });

  it('retries after a failed layout query', async () => {
    const layoutError = new Error('layout update failed');
    const executePresenterQuery = jest
      .fn()
      .mockRejectedValueOnce(layoutError)
      .mockResolvedValueOnce(undefined);
    const reconciler = createScreenshareRecordingLayoutReconciler();
    const args = {
      screenshareSessionId: 'session-1',
      isRecordingActive: true,
      isScreenshareActive: true,
      executePresenterQuery,
    };

    await expect(reconciler.reconcile(args)).rejects.toBe(layoutError);
    await expect(reconciler.reconcile(args)).resolves.toBe('applied');
    expect(executePresenterQuery).toHaveBeenCalledTimes(2);
  });

  it('honours a presenter layout already applied by the normal start path', async () => {
    const executePresenterQuery = jest.fn().mockResolvedValue(undefined);
    const reconciler = createScreenshareRecordingLayoutReconciler();

    reconciler.markApplied('session-1', true);
    await expect(
      reconciler.reconcile({
        screenshareSessionId: 'session-1',
        isRecordingActive: true,
        isScreenshareActive: true,
        executePresenterQuery,
      }),
    ).resolves.toBe('already_applied');
    expect(executePresenterQuery).not.toHaveBeenCalled();
  });
});
