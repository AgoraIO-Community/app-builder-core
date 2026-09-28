export type TranscriptStreamListener = (...args: any[]) => void;

type TranscriptStreamSubscription = {
  remove: () => void;
};

export type TranscriptStreamEngine = {
  addListener: (
    event: 'onStreamMessage',
    listener: TranscriptStreamListener,
  ) => unknown;
  removeListener: (
    event: 'onStreamMessage',
    listener: TranscriptStreamListener,
  ) => void;
};

export type TranscriptStreamListenerRegistration = {
  subscription: TranscriptStreamSubscription | null;
};

export const registerTranscriptStreamListener = (
  engine: TranscriptStreamEngine,
  listener: TranscriptStreamListener,
): TranscriptStreamListenerRegistration => {
  const result = engine.addListener('onStreamMessage', listener);
  const subscription =
    result &&
    typeof (result as TranscriptStreamSubscription).remove === 'function'
      ? (result as TranscriptStreamSubscription)
      : null;

  // Native Agora returns void from addListener. The registration object is our
  // platform-independent proof that registration completed successfully.
  return {subscription};
};

export const removeTranscriptStreamListener = (
  engine: TranscriptStreamEngine,
  listener: TranscriptStreamListener,
  registration: TranscriptStreamListenerRegistration,
  web: boolean,
) => {
  if (web) {
    registration.subscription?.remove();
    return;
  }

  engine.removeListener('onStreamMessage', listener);
};
