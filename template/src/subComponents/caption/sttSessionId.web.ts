import {type RTMClient} from 'agora-react-native-rtm';
import RTMEngine from '../../rtm/RTMEngine';
import getUniqueID from '../../utils/getUniqueID';

export const STT_SESSION_ID_KEY = 'STT_SESSION_ID';

interface CoordinatorDependencies {
  getClient: () => Pick<RTMClient, 'storage' | 'presence'>;
  createId: () => string;
  wait: (milliseconds: number) => Promise<void>;
}

export const createSTTSessionCoordinator = (
  dependencies: CoordinatorDependencies,
) => {
  const sessionIds = new Map<string, string>();
  const pendingResolutions = new Map<string, Promise<string>>();

  const readSessionItem = async (channelName: string) => {
    const response = await dependencies
      .getClient()
      .storage.getChannelMetadata(channelName, 1);
    return response.items?.find(item => item.key === STT_SESSION_ID_KEY);
  };

  const isOnlyLocalRTMParticipant = async (
    channelName: string,
    localUid: string,
  ): Promise<boolean> => {
    const response = await dependencies
      .getClient()
      .presence.getOnlineUsers(channelName, 1);
    return (
      response.totalOccupancy === 1 &&
      response.occupants?.length === 1 &&
      String(response.occupants[0].userId) === String(localUid)
    );
  };

  const resolveSessionId = async (channelName: string): Promise<string> => {
    const delays = [0, 100, 250];
    let lastError: unknown;

    for (let attempt = 0; attempt < delays.length; attempt += 1) {
      if (delays[attempt] > 0) {
        await dependencies.wait(delays[attempt]);
      }

      try {
        const existing = await readSessionItem(channelName);
        if (existing?.value) {
          sessionIds.set(channelName, existing.value);
          return existing.value;
        }

        const candidate = dependencies.createId();
        try {
          await dependencies.getClient().storage.setChannelMetadata(
            channelName,
            1,
            {
              items: [
                {
                  key: STT_SESSION_ID_KEY,
                  value: candidate,
                  revision: 0,
                },
              ],
            },
            {addUserId: true, addTimeStamp: true},
          );
          sessionIds.set(channelName, candidate);
          return candidate;
        } catch (error) {
          lastError = error;
          const winner = await readSessionItem(channelName);
          if (winner?.value) {
            sessionIds.set(channelName, winner.value);
            return winner.value;
          }
        }
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(
      `Unable to resolve the shared STT session ID: ${String(lastError)}`,
    );
  };

  const ensureSTTSessionId = async (channelName: string): Promise<string> => {
    const cached = sessionIds.get(channelName);
    if (cached) {
      return cached;
    }

    const pending = pendingResolutions.get(channelName);
    if (pending) {
      return pending;
    }

    const resolution = resolveSessionId(channelName);
    pendingResolutions.set(channelName, resolution);
    try {
      return await resolution;
    } finally {
      if (pendingResolutions.get(channelName) === resolution) {
        pendingResolutions.delete(channelName);
      }
    }
  };

  const clearSTTSessionIdIfLast = async (
    channelName: string,
    localUid: string,
  ): Promise<boolean> => {
    if (!(await isOnlyLocalRTMParticipant(channelName, localUid))) {
      return false;
    }

    const item = await readSessionItem(channelName);
    if (!item || !item.revision || item.revision <= 0) {
      sessionIds.delete(channelName);
      pendingResolutions.delete(channelName);
      return false;
    }

    if (!(await isOnlyLocalRTMParticipant(channelName, localUid))) {
      return false;
    }

    await dependencies
      .getClient()
      .storage.removeChannelMetadata(channelName, 1, {
        data: {
          items: [
            {
              key: STT_SESSION_ID_KEY,
              value: '',
              revision: item.revision,
            },
          ],
        },
        addUserId: true,
        addTimeStamp: true,
      });
    sessionIds.delete(channelName);
    pendingResolutions.delete(channelName);
    return true;
  };

  const cleanupSTTSessionOnEnd = async (
    channelName: string,
    localUid: string,
    isSTTActive: boolean,
    stopSTT: () => Promise<void>,
  ): Promise<void> => {
    if (!(await isOnlyLocalRTMParticipant(channelName, localUid))) {
      return;
    }
    if (isSTTActive) {
      await stopSTT();
    }
    await clearSTTSessionIdIfLast(channelName, localUid);
  };

  const resetSTTSessionIdCache = (channelName?: string): void => {
    if (channelName) {
      sessionIds.delete(channelName);
      pendingResolutions.delete(channelName);
      return;
    }
    sessionIds.clear();
    pendingResolutions.clear();
  };

  return {
    ensureSTTSessionId,
    isOnlyLocalRTMParticipant,
    clearSTTSessionIdIfLast,
    cleanupSTTSessionOnEnd,
    resetSTTSessionIdCache,
  };
};

const coordinator = createSTTSessionCoordinator({
  getClient: () => RTMEngine.getInstance().engine,
  createId: getUniqueID,
  wait: milliseconds =>
    new Promise(resolve => setTimeout(resolve, milliseconds)),
});

export const ensureSTTSessionId = coordinator.ensureSTTSessionId;
export const isOnlyLocalRTMParticipant = coordinator.isOnlyLocalRTMParticipant;
export const clearSTTSessionIdIfLast = coordinator.clearSTTSessionIdIfLast;
export const cleanupSTTSessionOnEnd = coordinator.cleanupSTTSessionOnEnd;
export const resetSTTSessionIdCache = coordinator.resetSTTSessionIdCache;
