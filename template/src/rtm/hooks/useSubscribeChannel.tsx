/* --------------------------------------------------------------------------
 * useSubscribeChannel.ts
 * -------------------------------------------------------------------------- */
import {useEffect} from 'react';
import type {RTMClient} from 'agora-react-native-rtm';
import RTMEngine from '../../rtm/RTMEngine';

export function useSubscribeChannel(
  client: RTMClient | null,
  channelId: string | null,
) {
  useEffect(() => {
    if (!client || !channelId) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await client.subscribe(channelId, {
          withMessage: true,
          withPresence: true,
          withMetadata: true,
          withLock: false,
        });
        RTMEngine.getInstance().addSecondaryChannel(channelId);
      } catch (err) {
        console.warn(`Failed to subscribe to secondary ${channelId}`, err);
      }
    })();

    return () => {
      if (!cancelled) {
        client.unsubscribe(channelId).catch(() => {});
        RTMEngine.getInstance().removeSecondaryChannel(channelId);
      }
      cancelled = true;
    };
  }, [client, channelId]);
}
