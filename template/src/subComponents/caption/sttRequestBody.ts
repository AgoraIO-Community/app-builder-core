import {type LanguageTranslationConfig} from './useCaption';

export type STTMethod = 'startv7' | 'update' | 'stopv7';

interface BuildSTTRequestBodyOptions {
  method: STTMethod;
  botUid: number;
  passphrase: string;
  encryptionMode: number | null;
  localUid: string | number;
  channelName: string;
  isWeb: boolean;
  translationConfig?: LanguageTranslationConfig;
  resolveSessionId: (channelName: string) => Promise<string | undefined>;
}

export const buildSTTRequestBody = async (
  options: BuildSTTRequestBodyOptions,
): Promise<Record<string, any>> => {
  const requestBody: Record<string, any> = {
    passphrase: options.passphrase,
    dataStream_uid: options.botUid,
    encryption_mode: options.encryptionMode,
  };

  if (options.isWeb) {
    const sessionId = await options.resolveSessionId(options.channelName);
    if (!sessionId) {
      throw new Error('Unable to resolve the shared STT session ID');
    }
    requestBody.session_id = sessionId;
  }

  if (options.translationConfig?.source?.[0]) {
    requestBody.lang = options.translationConfig.source;
    const sanitizedTargets =
      options.translationConfig.targets?.filter(
        target => target !== options.translationConfig?.source[0],
      ) || [];
    if (sanitizedTargets.length > 0) {
      requestBody.translate_config = [
        {
          source_lang: options.translationConfig.source[0],
          target_lang: sanitizedTargets,
        },
      ];
      if (options.method === 'update') {
        requestBody.translate = true;
      }
    } else if (options.method === 'update') {
      requestBody.translate = false;
    }
    requestBody.subscribeAudioUids = [`${options.localUid}`];
  }

  return requestBody;
};
