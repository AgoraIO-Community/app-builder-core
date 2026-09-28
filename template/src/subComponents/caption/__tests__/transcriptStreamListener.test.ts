import {
  registerTranscriptStreamListener,
  removeTranscriptStreamListener,
  TranscriptStreamEngine,
} from '../transcriptStreamListener';

describe('transcript stream listener lifecycle', () => {
  it('tracks and removes a native listener when addListener returns void', () => {
    const listener = jest.fn();
    const engine: TranscriptStreamEngine = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };

    const registration = registerTranscriptStreamListener(engine, listener);

    expect(registration).toEqual({subscription: null});
    expect(engine.addListener).toHaveBeenCalledTimes(1);
    expect(engine.addListener).toHaveBeenCalledWith(
      'onStreamMessage',
      listener,
    );

    removeTranscriptStreamListener(engine, listener, registration, false);

    expect(engine.removeListener).toHaveBeenCalledTimes(1);
    expect(engine.removeListener).toHaveBeenCalledWith(
      'onStreamMessage',
      listener,
    );
  });

  it('uses the subscription returned by the web bridge', () => {
    const listener = jest.fn();
    const remove = jest.fn();
    const engine: TranscriptStreamEngine = {
      addListener: jest.fn(() => ({remove})),
      removeListener: jest.fn(),
    };

    const registration = registerTranscriptStreamListener(engine, listener);
    removeTranscriptStreamListener(engine, listener, registration, true);

    expect(remove).toHaveBeenCalledTimes(1);
    expect(engine.removeListener).not.toHaveBeenCalled();
  });
});
