import {type RTMClient} from 'agora-react-native-rtm';

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

  const getAndLogChannelMetadata = async (
    channelName: string,
    context: string,
  ) => {
    const response = await dependencies
      .getClient()
      .storage.getChannelMetadata(channelName, 1);

    console.log('[STT_SESSION_ID] Full RTM channel metadata', {
      channelName,
      context,
      metadata: response,
    });

    return response;
  };

  const logChannelMetadataBestEffort = async (
    channelName: string,
    context: string,
  ): Promise<void> => {
    try {
      await getAndLogChannelMetadata(channelName, context);
    } catch (error) {
      console.log('[STT_SESSION_ID] Unable to read RTM channel metadata', {
        channelName,
        context,
        error,
      });
    }
  };

  const readSessionItem = async (channelName: string, context: string) => {
    const response = await getAndLogChannelMetadata(channelName, context);
    return response.items?.find(item => item.key === STT_SESSION_ID_KEY);
  };

  const isOnlyLocalRTMParticipant = async (
    channelName: string,
    localUid: string,
  ): Promise<boolean> => {
    const response = await dependencies
      .getClient()
      .presence.getOnlineUsers(channelName, 1);
    const occupantUserIds =
      response.occupants?.map(occupant => String(occupant.userId)) ?? [];
    const isOnlyLocalParticipant =
      response.totalOccupancy === 1 &&
      occupantUserIds.length === 1 &&
      occupantUserIds[0] === String(localUid);

    console.log('[STT_SESSION_ID] RTM participant check', {
      channelName,
      localUid: String(localUid),
      totalOccupancy: response.totalOccupancy,
      occupantUserIds,
      isOnlyLocalParticipant,
    });

    return isOnlyLocalParticipant;
  };

  const resolveSessionId = async (channelName: string): Promise<string> => {
    const delays = [0, 100, 250];
    let lastError: unknown;

    console.log('[STT_SESSION_ID] Resolving session ID from RTM metadata', {
      channelName,
    });

    for (let attempt = 0; attempt < delays.length; attempt += 1) {
      if (delays[attempt] > 0) {
        await dependencies.wait(delays[attempt]);
      }

      try {
        const existing = await readSessionItem(
          channelName,
          `session lookup attempt ${attempt + 1}`,
        );
        if (existing?.value) {
          console.log(
            '[STT_SESSION_ID] Reusing session ID from RTM channel metadata',
            {
              channelName,
              sessionId: existing.value,
              revision: existing.revision,
            },
          );
          sessionIds.set(channelName, existing.value);
          return existing.value;
        }

        const candidate = dependencies.createId();
        console.log(
          '[STT_SESSION_ID] No existing session ID found; creating one',
          {channelName, sessionId: candidate, attempt: attempt + 1},
        );
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
          console.log(
            '[STT_SESSION_ID] Created session ID in RTM channel metadata',
            {channelName, sessionId: candidate},
          );
          await logChannelMetadataBestEffort(
            channelName,
            'after session ID creation',
          );
          sessionIds.set(channelName, candidate);
          return candidate;
        } catch (error) {
          lastError = error;
          console.log(
            '[STT_SESSION_ID] Session ID creation did not win; reading shared value',
            {channelName, sessionId: candidate, error},
          );
          const winner = await readSessionItem(
            channelName,
            `after creation conflict on attempt ${attempt + 1}`,
          );
          if (winner?.value) {
            console.log(
              '[STT_SESSION_ID] Reusing session ID created by another participant',
              {
                channelName,
                sessionId: winner.value,
                revision: winner.revision,
              },
            );
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
      console.log('[STT_SESSION_ID] Using locally cached session ID', {
        channelName,
        sessionId: cached,
      });
      return cached;
    }

    const pending = pendingResolutions.get(channelName);
    if (pending) {
      console.log('[STT_SESSION_ID] Waiting for pending session ID lookup', {
        channelName,
      });
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
    console.log(
      '[STT_SESSION_ID] Rechecking participants before reading metadata',
      {channelName, localUid: String(localUid)},
    );
    if (!(await isOnlyLocalRTMParticipant(channelName, localUid))) {
      console.log(
        '[STT_SESSION_ID] Metadata cleanup skipped because another participant is present',
        {channelName, localUid: String(localUid)},
      );
      return false;
    }

    const item = await readSessionItem(channelName, 'before metadata removal');
    if (!item || !item.revision || item.revision <= 0) {
      console.log(
        '[STT_SESSION_ID] Metadata cleanup skipped because no removable session ID was found',
        {channelName},
      );
      sessionIds.delete(channelName);
      pendingResolutions.delete(channelName);
      return false;
    }

    console.log(
      '[STT_SESSION_ID] Final participant check before removing metadata',
      {channelName, localUid: String(localUid)},
    );
    if (!(await isOnlyLocalRTMParticipant(channelName, localUid))) {
      console.log(
        '[STT_SESSION_ID] Metadata removal cancelled because a participant joined during cleanup',
        {channelName, localUid: String(localUid)},
      );
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
    console.log('[STT_SESSION_ID] Removed RTM channel metadata', {
      channelName,
      key: STT_SESSION_ID_KEY,
      revision: item.revision,
    });
    sessionIds.delete(channelName);
    pendingResolutions.delete(channelName);
    await logChannelMetadataBestEffort(channelName, 'after session ID removal');
    return true;
  };

  const cleanupSTTSessionOnEnd = async (
    channelName: string,
    localUid: string,
    isSTTActive: boolean,
    stopSTT: () => Promise<void>,
  ): Promise<void> => {
    console.log(
      '[STT_SESSION_ID] Checking participants before starting end-call cleanup',
      {channelName, localUid: String(localUid), isSTTActive},
    );
    if (!(await isOnlyLocalRTMParticipant(channelName, localUid))) {
      console.log(
        '[STT_SESSION_ID] End-call cleanup skipped because another participant is present',
        {channelName, localUid: String(localUid)},
      );
      return;
    }
    if (isSTTActive) {
      console.log(
        '[STT_SESSION_ID] Local user is last; stopping STT before metadata cleanup',
        {channelName},
      );
      await stopSTT();
    }
    console.log(
      '[STT_SESSION_ID] STT stop completed; revalidating before metadata cleanup',
      {channelName},
    );
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
