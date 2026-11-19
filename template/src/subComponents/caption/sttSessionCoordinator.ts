import {type RTMClient} from 'agora-react-native-rtm';

export const STT_SESSION_ID_KEY = 'STT_SESSION_ID';

interface CoordinatorDependencies {
  getClient: () => Pick<RTMClient, 'storage' | 'presence'>;
  createId: () => string;
  wait: (milliseconds: number) => Promise<void>;
  log?: (event: string, details: Record<string, unknown>) => void;
}

export const createSTTSessionCoordinator = (
  dependencies: CoordinatorDependencies,
) => {
  const sessionIds = new Map<string, string>();
  const pendingResolutions = new Map<string, Promise<string>>();
  const pendingRotations = new Map<string, Promise<string>>();
  // Channels whose current cached session_id was minted by this FE (either
  // via initial createId or via rotateSessionId), until their first start.
  // Later starts must validate reused IDs even if this FE originally minted them.
  const freshlyCreatedChannels = new Set<string>();

  // Observability must not affect session coordination.
  const logSessionEvent = (
    event: string,
    details: Record<string, unknown>,
  ): void => {
    try {
      dependencies.log?.(event, details);
    } catch {
      // A failed logging transport must not fail an STT operation.
    }
  };

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
          logSessionEvent('STT session resolved', {
            channelName,
            sessionId: existing.value,
            source: 'rtm',
            revision: existing.revision,
          });
          sessionIds.set(channelName, existing.value);
          freshlyCreatedChannels.delete(channelName);
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
          logSessionEvent('STT session resolved', {
            channelName,
            sessionId: candidate,
            source: 'created',
          });
          sessionIds.set(channelName, candidate);
          freshlyCreatedChannels.add(channelName);
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
            logSessionEvent('STT session resolved', {
              channelName,
              sessionId: winner.value,
              source: 'creation_peer',
              revision: winner.revision,
            });
            sessionIds.set(channelName, winner.value);
            freshlyCreatedChannels.delete(channelName);
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
    const rotation = pendingRotations.get(channelName);
    if (rotation) {
      return rotation;
    }
    const cached = sessionIds.get(channelName);
    if (cached) {
      console.log('[STT_SESSION_ID] Using locally cached session ID', {
        channelName,
        sessionId: cached,
      });
      logSessionEvent('STT session resolved', {
        channelName,
        sessionId: cached,
        source: 'cache',
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
      freshlyCreatedChannels.delete(channelName);
      return;
    }
    sessionIds.clear();
    pendingResolutions.clear();
    freshlyCreatedChannels.clear();
  };

  const wasSessionIdFreshlyCreated = (channelName: string): boolean =>
    freshlyCreatedChannels.has(channelName);

  const markSessionIdUsed = (channelName: string, sessionId: string): void => {
    if (sessionIds.get(channelName) === sessionId) {
      freshlyCreatedChannels.delete(channelName);
    }
  };

  const replaceSessionId = async (
    channelName: string,
    staleSessionId: string,
  ): Promise<string> => {
    console.log('[STT_SESSION_ID] Rotating session ID due to stale value', {
      channelName,
      staleSessionId,
    });

    // Finish any older lookup before replacing its value, so it cannot later
    // restore the stale ID in the local cache.
    await pendingResolutions.get(channelName)?.catch(() => undefined);
    sessionIds.delete(channelName);
    freshlyCreatedChannels.delete(channelName);

    const existing = await readSessionItem(
      channelName,
      'before session ID rotation',
    );

    if (
      existing?.value &&
      staleSessionId &&
      existing.value !== staleSessionId
    ) {
      console.log(
        '[STT_SESSION_ID] Another peer already rotated; adopting their value',
        {
          channelName,
          sessionId: existing.value,
          revision: existing.revision,
          staleSessionId,
        },
      );
      logSessionEvent('STT session rotation adopted', {
        channelName,
        staleSessionId,
        sessionId: existing.value,
        revision: existing.revision,
        source: 'rtm',
      });
      sessionIds.set(channelName, existing.value);
      return existing.value;
    }

    const candidate = dependencies.createId();
    const expectedRevision = existing?.revision ?? 0;
    console.log('[STT_SESSION_ID] Attempting revision-checked replacement', {
      channelName,
      currentSessionId: existing?.value ?? null,
      nextSessionId: candidate,
      expectedRevision,
    });

    try {
      await dependencies.getClient().storage.setChannelMetadata(
        channelName,
        1,
        {
          items: [
            {
              key: STT_SESSION_ID_KEY,
              value: candidate,
              revision: expectedRevision,
            },
          ],
        },
        {addUserId: true, addTimeStamp: true},
      );
      console.log(
        '[STT_SESSION_ID] Rotated session ID in RTM channel metadata',
        {channelName, sessionId: candidate},
      );
      logSessionEvent('STT session rotated', {
        channelName,
        staleSessionId,
        sessionId: candidate,
        expectedRevision,
      });
      sessionIds.set(channelName, candidate);
      freshlyCreatedChannels.add(channelName);
      await logChannelMetadataBestEffort(
        channelName,
        'after session ID rotation',
      );
      return candidate;
    } catch (error) {
      console.log(
        '[STT_SESSION_ID] Rotation lost the race; reading shared value',
        {channelName, attemptedSessionId: candidate, error},
      );
      const winner = await readSessionItem(
        channelName,
        'after rotation conflict',
      );
      if (winner?.value && winner.value !== staleSessionId) {
        console.log(
          '[STT_SESSION_ID] Adopting session ID rotated by another participant',
          {
            channelName,
            sessionId: winner.value,
            revision: winner.revision,
          },
        );
        logSessionEvent('STT session rotation adopted', {
          channelName,
          staleSessionId,
          sessionId: winner.value,
          revision: winner.revision,
          source: 'write_recovery',
        });
        sessionIds.set(channelName, winner.value);
        freshlyCreatedChannels.delete(channelName);
        return winner.value;
      }
      logSessionEvent('STT session rotation failed', {
        channelName,
        staleSessionId,
        attemptedSessionId: candidate,
        expectedRevision,
      });
      throw error;
    }
  };

  const rotateSessionId = async (
    channelName: string,
    staleSessionId: string,
  ): Promise<string> => {
    // Serialize local recoveries as well as using RTM revisions across peers.
    while (pendingRotations.has(channelName)) {
      await pendingRotations.get(channelName)!.catch(() => undefined);
    }
    const rotation = replaceSessionId(channelName, staleSessionId);
    pendingRotations.set(channelName, rotation);
    try {
      return await rotation;
    } finally {
      if (pendingRotations.get(channelName) === rotation) {
        pendingRotations.delete(channelName);
      }
    }
  };

  return {
    ensureSTTSessionId,
    isOnlyLocalRTMParticipant,
    clearSTTSessionIdIfLast,
    cleanupSTTSessionOnEnd,
    resetSTTSessionIdCache,
    rotateSessionId,
    wasSessionIdFreshlyCreated,
    markSessionIdUsed,
  };
};
