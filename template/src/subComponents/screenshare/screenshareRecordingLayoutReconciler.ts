export type RecordingLayoutReconciliationResult =
  | 'applied'
  | 'already_applied'
  | 'in_progress'
  | 'not_ready';

type ReconcileRecordingLayoutArgs = {
  screenshareSessionId: string | null;
  isRecordingActive: boolean;
  isScreenshareActive: boolean;
  executePresenterQuery: () => Promise<unknown>;
};

export const createScreenshareRecordingLayoutReconciler = () => {
  let recordingActivation = 0;
  let wasRecordingActive = false;
  const appliedKeys = new Set<string>();
  const inProgressKeys = new Set<string>();

  const observeRecordingState = (isRecordingActive: boolean) => {
    if (isRecordingActive && !wasRecordingActive) {
      recordingActivation += 1;
    }
    wasRecordingActive = isRecordingActive;
    return recordingActivation;
  };

  const getKey = (screenshareSessionId: string, activation: number) =>
    `${screenshareSessionId}:${activation}`;

  const markApplied = (
    screenshareSessionId: string,
    isRecordingActive: boolean,
  ) => {
    const activation = observeRecordingState(isRecordingActive);
    if (!isRecordingActive) {
      return;
    }
    appliedKeys.add(getKey(screenshareSessionId, activation));
  };

  const reconcile = async ({
    screenshareSessionId,
    isRecordingActive,
    isScreenshareActive,
    executePresenterQuery,
  }: ReconcileRecordingLayoutArgs): Promise<RecordingLayoutReconciliationResult> => {
    const activation = observeRecordingState(isRecordingActive);
    if (!screenshareSessionId || !isRecordingActive || !isScreenshareActive) {
      return 'not_ready';
    }

    const key = getKey(screenshareSessionId, activation);
    if (appliedKeys.has(key)) {
      return 'already_applied';
    }
    if (inProgressKeys.has(key)) {
      return 'in_progress';
    }

    inProgressKeys.add(key);
    try {
      await executePresenterQuery();
      appliedKeys.add(key);
      return 'applied';
    } finally {
      inProgressKeys.delete(key);
    }
  };

  return {markApplied, reconcile};
};
