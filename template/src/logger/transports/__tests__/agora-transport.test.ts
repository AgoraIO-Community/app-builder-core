const mockDatadogLog = jest.fn();

jest.mock('@datadog/browser-logs', () => ({
  datadogLogs: {
    init: jest.fn(),
    logger: {log: mockDatadogLog},
  },
}));

const {getTransportLogger} = jest.requireActual('../agora-transport.ts');

describe('Agora Datadog transport structured content', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('emits screen-share journey fields as an object that Datadog can filter', () => {
    const transport = getTransportLogger();
    const journey = {
      screenshareSessionId: 'screen-session-1',
      screenshareAttemptId: 'attempt-1',
      action: 'start',
    };

    transport('[SCREENSHARE_JOURNEY] start', 'info', {}, {}, [journey]);

    expect(mockDatadogLog).toHaveBeenCalledWith(
      '[SCREENSHARE_JOURNEY] start',
      expect.objectContaining({logContent: journey}),
      'info',
      undefined,
    );
  });

  it('preserves the existing array shape for unrelated logs', () => {
    const transport = getTransportLogger();
    const content = [{value: 'unchanged'}];

    transport('other log', 'info', {}, {}, content);

    expect(mockDatadogLog).toHaveBeenCalledWith(
      'other log',
      expect.objectContaining({logContent: content}),
      'info',
      undefined,
    );
  });
});
