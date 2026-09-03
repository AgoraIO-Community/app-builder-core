import {describe, expect, it, jest} from '@jest/globals';
import {buildSTTRequestBody, type STTMethod} from '../sttRequestBody';

const createOptions = (method: STTMethod) => ({
  method,
  botUid: 900000123,
  passphrase: 'phrase',
  encryptionMode: 8,
  localUid: 123,
  channelName: 'room',
  translationConfig:
    method === 'stopv7'
      ? undefined
      : {source: ['en-US'] as any, targets: ['de-DE'] as any},
  resolveSessionId: jest.fn(async () => 'shared-session'),
});

describe('buildSTTRequestBody', () => {
  it.each(['startv7', 'update', 'stopv7'] as STTMethod[])(
    'adds the coordinated session ID to %s on every client platform',
    async method => {
      const body = await buildSTTRequestBody(createOptions(method));

      expect(body.session_id).toBe('shared-session');
      expect(body.passphrase).toBe('phrase');
      expect(body.dataStream_uid).toBe(900000123);
      expect(body.encryption_mode).toBe(8);
    },
  );

  it('keeps the existing update translation payload behavior', async () => {
    const body = await buildSTTRequestBody({
      ...createOptions('update'),
      translationConfig: {
        source: ['en-US'],
        targets: ['en-US', 'de-DE'],
      },
    });

    expect(body).toMatchObject({
      lang: ['en-US'],
      translate: true,
      translate_config: [
        {
          source_lang: 'en-US',
          target_lang: ['de-DE'],
        },
      ],
      subscribeAudioUids: ['123'],
    });
  });

  it('rejects construction when the shared ID is unavailable', async () => {
    await expect(
      buildSTTRequestBody({
        ...createOptions('stopv7'),
        resolveSessionId: jest.fn(async () => undefined),
      }),
    ).rejects.toThrow('Unable to resolve the shared STT session ID');
  });
});
