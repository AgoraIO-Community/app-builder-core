# Web STT Session ID Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Coordinate one web STT `session_id` per active call and include it in every `startv7`, `update`, and `stopv7` body.

**Architecture:** A web-only coordinator reads or compare-and-set creates `STT_SESSION_ID` in RTM message-channel metadata, caches the winner per channel, and performs guarded final-participant cleanup. The shared STT hook uses a testable request-body builder; webpack selects the web coordinator while the default module preserves current React Native behavior.

**Tech Stack:** React 18, TypeScript 4.8, Agora RTM Web 2.2.3 bridge, Agora React Native RTM-shaped interfaces, Jest 29, React Test Renderer.

**Spec:** `docs/superpowers/specs/2026-08-24-web-stt-session-id-design.md`

## Global Constraints

- Target the web build only; React Native runtime behavior must remain unchanged.
- Store one raw string value under RTM message-channel metadata key `STT_SESSION_ID`.
- Pass the identical body field `session_id` to `startv7`, `update`, and `stopv7`.
- Keep the existing `X-Session-Id` logging header unchanged.
- Use item revision `0` for create-if-absent; do not use RTM locks or manual RTM messages.
- Never issue a web STT request with a participant-local fallback ID.
- Remove only `STT_SESSION_ID`, after two direct presence reads confirm the local user is alone.
- Complete or safely fail web metadata cleanup before RTM unsubscribe.
- Accept the stale-metadata and presence/storage race limitations stated in the spec.

## File Structure

- Create `template/src/subComponents/caption/sttSessionId.ts`: non-web no-op fallback.
- Create `template/src/subComponents/caption/sttSessionId.web.ts`: web CAS coordinator and cleanup.
- Create `template/src/subComponents/caption/sttRequestBody.ts`: pure shared request-body builder.
- Modify `template/bridge/rtm/web/index.ts`: preserve revisions and add metadata removal.
- Modify `template/src/subComponents/caption/useSTTAPI.tsx`: resolve and attach the web ID.
- Create `template/src/rtm/isRemoteDeparture.ts`: leave/timeout predicate.
- Modify `template/src/components/RTMConfigure.tsx`: handle web `REMOTE_TIMEOUT`.
- Modify `template/src/utils/useEndCall.ts`: await web final-user cleanup before unsubscribe.
- Add focused Jest tests beside these units.

---

### Task 1: Complete the Web RTM Metadata Contract

**Files:**
- Modify: `template/bridge/rtm/web/index.ts:1-45,224-313`
- Create: `template/bridge/rtm/web/__tests__/storage.test.ts`

**Interfaces:**
- Consumes: Agora Web storage set/get/remove methods.
- Produces: native-shaped set/get/remove channel metadata methods with item revisions intact.

- [ ] **Step 1: Write the failing bridge tests**

Mock `agora-rtm-sdk` so `new RTMWebClient()` receives spies for all three storage methods. Add these assertions:

```ts
it('preserves create-only revision zero', async () => {
  await client.storage.setChannelMetadata(
    'room',
    1,
    {items: [{key: 'STT_SESSION_ID', value: 'session-a', revision: 0}]},
    {addUserId: true, addTimeStamp: true},
  );
  expect(mockSetChannelMetadata).toHaveBeenCalledWith(
    'room',
    'MESSAGE',
    [{key: 'STT_SESSION_ID', value: 'session-a', revision: 0}],
    {addUserId: true, addTimeStamp: true},
  );
});

it('maps web metadata details to native items', async () => {
  mockGetChannelMetadata.mockResolvedValue({
    channelName: 'room',
    channelType: 'MESSAGE',
    timestamp: 100,
    totalCount: 1,
    majorRevision: 12,
    metadata: {
      STT_SESSION_ID: {
        value: 'session-a', revision: 11, authorUid: '42', updated: 99,
      },
    },
  });
  await expect(client.storage.getChannelMetadata('room', 1)).resolves.toMatchObject({
    majorRevision: 12,
    items: [{
      key: 'STT_SESSION_ID', value: 'session-a', revision: 11,
      authorUserId: '42', updateTs: 99,
    }],
  });
});

it('removes only the requested revision', async () => {
  await client.storage.removeChannelMetadata('room', 1, {
    data: {items: [{key: 'STT_SESSION_ID', value: '', revision: 11}]},
    addUserId: true,
    addTimeStamp: true,
  });
  expect(mockRemoveChannelMetadata).toHaveBeenCalledWith('room', 'MESSAGE', {
    data: [{key: 'STT_SESSION_ID', value: '', revision: 11}],
    addUserId: true,
    addTimeStamp: true,
  });
});
```

- [ ] **Step 2: Run the test and verify the existing bridge fails**

```bash
cd template
npx jest bridge/rtm/web/__tests__/storage.test.ts --runInBand
```

Expected: FAIL because revision `0` becomes `-1`, get strips revision fields, and remove is absent.

- [ ] **Step 3: Implement the bridge mapping**

Import native `RemoveChannelMetadataOptions`. Reuse this conversion for storage events and get responses:

```ts
const toNativeMetadataItem = (
  key: string,
  item: MetaDataDetail,
): NativeMetadataItem => ({
  key,
  value: item.value,
  revision: item.revision,
  authorUserId: item.authorUid,
  updateTs: item.updated,
});
```

Use `item.value ?? ''` and `item.revision ?? -1` in set/remove mappings. Use `webResponse.majorRevision` in the native get response. Add:

```ts
removeChannelMetadata: async (channelName, channelType, options) => {
  const data = options?.data?.items?.map(item => ({
    key: item.key,
    value: item.value ?? '',
    revision: item.revision ?? -1,
  }));
  return this.client.storage.removeChannelMetadata(
    channelName,
    (webChannelTypeMapping[channelType] as ChannelType) || 'MESSAGE',
    {
      ...(data ? {data} : {}),
      addUserId: options?.addUserId ?? true,
      addTimeStamp: options?.addTimeStamp ?? true,
    },
  );
},
```

- [ ] **Step 4: Run bridge tests and type-check**

```bash
cd template
npx jest bridge/rtm/web/__tests__/storage.test.ts --runInBand
npx tsc --noEmit --pretty false
```

Expected: test PASS; no new TypeScript error points to the bridge.

- [ ] **Step 5: Commit**

```bash
git add template/bridge/rtm/web/index.ts template/bridge/rtm/web/__tests__/storage.test.ts
git commit -m "fix: complete web RTM metadata bridge"
```

---

### Task 2: Add the Web STT Session Coordinator

**Files:**
- Create: `template/src/subComponents/caption/sttSessionId.ts`
- Create: `template/src/subComponents/caption/sttSessionId.web.ts`
- Create: `template/src/subComponents/caption/__tests__/sttSessionId.web.test.ts`

**Interfaces:**
- Consumes: RTM storage/presence, `getUniqueID()`, message channel type `1`.
- Produces:
  - `ensureSTTSessionId(channelName): Promise<string | undefined>`
  - `isOnlyLocalRTMParticipant(channelName, localUid): Promise<boolean>`
  - `clearSTTSessionIdIfLast(channelName, localUid): Promise<boolean>`
  - `cleanupSTTSessionOnEnd(channelName, localUid, isActive, stopSTT): Promise<void>`
  - `resetSTTSessionIdCache(channelName?): void`

- [ ] **Step 1: Write failing coordinator tests**

Export a dependency-injected `createSTTSessionCoordinator`. Test these cases with mocked storage and presence:

```ts
const metadata = (value?: string, revision = 7) => ({
  items: value ? [{key: 'STT_SESSION_ID', value, revision}] : [],
});

it('reuses existing metadata without setting', async () => {
  storage.getChannelMetadata.mockResolvedValue(metadata('existing'));
  await expect(coordinator.ensureSTTSessionId('room')).resolves.toBe('existing');
  expect(storage.setChannelMetadata).not.toHaveBeenCalled();
});

it('creates once with revision zero and caches it', async () => {
  storage.getChannelMetadata.mockResolvedValue(metadata());
  const [first, second] = await Promise.all([
    coordinator.ensureSTTSessionId('room'),
    coordinator.ensureSTTSessionId('room'),
  ]);
  expect(first).toBe('candidate');
  expect(second).toBe('candidate');
  await expect(coordinator.ensureSTTSessionId('room')).resolves.toBe('candidate');
  expect(storage.setChannelMetadata).toHaveBeenCalledWith(
    'room', 1,
    {items: [{key: 'STT_SESSION_ID', value: 'candidate', revision: 0}]},
    {addUserId: true, addTimeStamp: true},
  );
  expect(storage.setChannelMetadata).toHaveBeenCalledTimes(1);
});

it('uses the winner after a create conflict', async () => {
  storage.getChannelMetadata
    .mockResolvedValueOnce(metadata())
    .mockResolvedValueOnce(metadata('winner'));
  storage.setChannelMetadata.mockRejectedValue(new Error('revision conflict'));
  await expect(coordinator.ensureSTTSessionId('room')).resolves.toBe('winner');
});

it('keeps metadata while two users are present', async () => {
  presence.getOnlineUsers.mockResolvedValue({
    totalOccupancy: 2,
    occupants: [{userId: '1'}, {userId: '2'}],
  });
  await expect(coordinator.clearSTTSessionIdIfLast('room', '1')).resolves.toBe(false);
  expect(storage.removeChannelMetadata).not.toHaveBeenCalled();
});

it('stops before revision-aware final removal', async () => {
  const calls: string[] = [];
  presence.getOnlineUsers.mockResolvedValue({
    totalOccupancy: 1, occupants: [{userId: '1'}],
  });
  storage.getChannelMetadata.mockResolvedValue(metadata('session-a', 9));
  storage.removeChannelMetadata.mockImplementation(async () => calls.push('remove'));
  await coordinator.cleanupSTTSessionOnEnd('room', '1', true, async () => {
    calls.push('stop');
  });
  expect(calls).toEqual(['stop', 'remove']);
  expect(presence.getOnlineUsers).toHaveBeenCalledTimes(3);
  expect(storage.removeChannelMetadata).toHaveBeenCalledWith(
    'room', 1,
    {data: {items: [{key: 'STT_SESSION_ID', value: '', revision: 9}]},
     addUserId: true, addTimeStamp: true},
  );
});
```

- [ ] **Step 2: Run and verify failure**

```bash
cd template
npx jest src/subComponents/caption/__tests__/sttSessionId.web.test.ts --runInBand
```

Expected: FAIL because both coordinator modules are missing.

- [ ] **Step 3: Implement the non-web fallback**

```ts
export const STT_SESSION_ID_KEY = 'STT_SESSION_ID';
export const ensureSTTSessionId = async (_channel: string) => undefined;
export const isOnlyLocalRTMParticipant = async (_channel: string, _uid: string) => false;
export const clearSTTSessionIdIfLast = async (_channel: string, _uid: string) => false;
export const cleanupSTTSessionOnEnd = async (
  _channel: string, _uid: string, _active: boolean, _stop: () => Promise<void>,
): Promise<void> => {};
export const resetSTTSessionIdCache = (_channel?: string): void => {};
```

This regular `.ts` file is the Metro/native fallback and must not access RTM or generate an ID.

- [ ] **Step 4: Implement the web coordinator factory**

Use this boundary and module-local maps:

```ts
interface CoordinatorDependencies {
  getClient: () => Pick<RTMClient, 'storage' | 'presence'>;
  createId: () => string;
  wait: (milliseconds: number) => Promise<void>;
}

export const createSTTSessionCoordinator = (dependencies: CoordinatorDependencies) => {
  const sessionIds = new Map<string, string>();
  const pending = new Map<string, Promise<string>>();

  const readSessionItem = async (channelName: string) => {
    const response = await dependencies.getClient().storage.getChannelMetadata(
      channelName,
      1,
    );
    return response.items?.find(item => item.key === STT_SESSION_ID_KEY);
  };

  const isOnlyLocalRTMParticipant = async (
    channelName: string,
    localUid: string,
  ): Promise<boolean> => {
    const response = await dependencies.getClient().presence.getOnlineUsers(
      channelName,
      1,
    );
    return response.totalOccupancy === 1 &&
      response.occupants?.length === 1 &&
      String(response.occupants[0].userId) === String(localUid);
  };

  const resolveSessionId = async (channelName: string): Promise<string> => {
    const delays = [0, 100, 250];
    let lastError: unknown;
    for (let attempt = 0; attempt < delays.length; attempt += 1) {
      if (delays[attempt]) await dependencies.wait(delays[attempt]);
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
            {items: [{
              key: STT_SESSION_ID_KEY,
              value: candidate,
              revision: 0,
            }]},
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
    if (cached) return cached;
    const current = pending.get(channelName);
    if (current) return current;
    const resolution = resolveSessionId(channelName);
    pending.set(channelName, resolution);
    try {
      return await resolution;
    } finally {
      if (pending.get(channelName) === resolution) pending.delete(channelName);
    }
  };

  const clearSTTSessionIdIfLast = async (
    channelName: string,
    localUid: string,
  ): Promise<boolean> => {
    if (!(await isOnlyLocalRTMParticipant(channelName, localUid))) return false;
    const item = await readSessionItem(channelName);
    if (!item || !item.revision || item.revision <= 0) {
      sessionIds.delete(channelName);
      pending.delete(channelName);
      return false;
    }
    if (!(await isOnlyLocalRTMParticipant(channelName, localUid))) return false;
    await dependencies.getClient().storage.removeChannelMetadata(
      channelName,
      1,
      {
        data: {items: [{
          key: STT_SESSION_ID_KEY,
          value: '',
          revision: item.revision,
        }]},
        addUserId: true,
        addTimeStamp: true,
      },
    );
    sessionIds.delete(channelName);
    pending.delete(channelName);
    return true;
  };

  const cleanupSTTSessionOnEnd = async (
    channelName: string,
    localUid: string,
    isActive: boolean,
    stopSTT: () => Promise<void>,
  ): Promise<void> => {
    if (!(await isOnlyLocalRTMParticipant(channelName, localUid))) return;
    if (isActive) await stopSTT();
    await clearSTTSessionIdIfLast(channelName, localUid);
  };

  const resetSTTSessionIdCache = (channelName?: string) => {
    if (channelName) {
      sessionIds.delete(channelName);
      pending.delete(channelName);
    } else {
      sessionIds.clear();
      pending.clear();
    }
  };
  return {
    ensureSTTSessionId,
    isOnlyLocalRTMParticipant,
    clearSTTSessionIdIfLast,
    cleanupSTTSessionOnEnd,
    resetSTTSessionIdCache,
  };
};
```

Build the default singleton with `RTMEngine.getInstance().engine`, `getUniqueID`, and `setTimeout`-backed waiting; export wrappers around it.

- [ ] **Step 5: Run tests and commit**

```bash
cd template
npx jest src/subComponents/caption/__tests__/sttSessionId.web.test.ts --runInBand
cd ..
git add template/src/subComponents/caption/sttSessionId.ts template/src/subComponents/caption/sttSessionId.web.ts template/src/subComponents/caption/__tests__/sttSessionId.web.test.ts
git commit -m "feat: coordinate web STT session ids"
```

Expected: all coordinator tests PASS.

---

### Task 3: Add `session_id` to Start, Update, and Stop

**Files:**
- Create: `template/src/subComponents/caption/sttRequestBody.ts`
- Create: `template/src/subComponents/caption/__tests__/sttRequestBody.test.ts`
- Modify: `template/src/subComponents/caption/useSTTAPI.tsx:1-125`
- Create: `template/src/subComponents/caption/__tests__/useSTTAPI.test.tsx`

**Interfaces:**
- Consumes: `ensureSTTSessionId`, `isWebInternal`, current request inputs.
- Produces: `buildSTTRequestBody(options)`; existing `start`, `update`, and `stop` signatures remain unchanged.

- [ ] **Step 1: Write failing table-driven body tests**

```ts
const base = {
  method: 'stopv7' as const,
  botUid: 900000123,
  passphrase: 'phrase',
  encryptionMode: 8,
  localUid: 123,
  channelName: 'room',
  isWeb: true,
  translationConfig: undefined,
  resolveSessionId: async () => 'shared-session',
};

it.each(['startv7', 'update', 'stopv7'] as const)(
  'adds the same shared ID to %s',
  async method => {
    const body = await buildSTTRequestBody({
      method,
      botUid: 900000123,
      passphrase: 'phrase',
      encryptionMode: 8,
      localUid: 123,
      channelName: 'room',
      isWeb: true,
      translationConfig: method === 'stopv7'
        ? undefined
        : {source: ['en-US'], targets: ['de-DE']},
      resolveSessionId: async () => 'shared-session',
    });
    expect(body.session_id).toBe('shared-session');
  },
);

it('does not alter the native body', async () => {
  const resolveSessionId = jest.fn();
  const body = await buildSTTRequestBody({...base, isWeb: false, resolveSessionId});
  expect(body).not.toHaveProperty('session_id');
  expect(resolveSessionId).not.toHaveBeenCalled();
});

it('rejects web construction without a shared ID', async () => {
  await expect(buildSTTRequestBody({
    ...base, isWeb: true, resolveSessionId: async () => undefined,
  })).rejects.toThrow('Unable to resolve the shared STT session ID');
});
```

- [ ] **Step 2: Run and verify failure**

```bash
cd template
npx jest src/subComponents/caption/__tests__/sttRequestBody.test.ts --runInBand
```

Expected: FAIL because the builder is missing.

- [ ] **Step 3: Implement the pure body builder**

```ts
export type STTMethod = 'startv7' | 'update' | 'stopv7';

interface BuildOptions {
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

export const buildSTTRequestBody = async (options: BuildOptions) => {
  const body: Record<string, any> = {
    passphrase: options.passphrase,
    dataStream_uid: options.botUid,
    encryption_mode: options.encryptionMode,
  };
  if (options.isWeb) {
    const sessionId = await options.resolveSessionId(options.channelName);
    if (!sessionId) throw new Error('Unable to resolve the shared STT session ID');
    body.session_id = sessionId;
  }
  if (options.translationConfig?.source?.[0]) {
    body.lang = options.translationConfig.source;
    const targets = options.translationConfig.targets?.filter(
      target => target !== options.translationConfig?.source[0],
    ) || [];
    if (targets.length > 0) {
      body.translate_config = [{
        source_lang: options.translationConfig.source[0],
        target_lang: targets,
      }];
      if (options.method === 'update') body.translate = true;
    } else if (options.method === 'update') {
      body.translate = false;
    }
    body.subscribeAudioUids = [`${options.localUid}`];
  }
  return body;
};
```

- [ ] **Step 4: Integrate the builder before `fetch`**

```ts
const requestBody = await buildSTTRequestBody({
  method,
  botUid,
  passphrase: roomIdRef.current?.host || roomIdRef.current?.attendee || '',
  encryptionMode: $config.ENCRYPTION_ENABLED
    ? rtcPropsRef.current.encryption.mode : null,
  localUid: localUidRef.current,
  channelName: rtcPropsRef.current.channel,
  isWeb: isWebInternal(),
  translationConfig,
  resolveSessionId: ensureSTTSessionId,
});
```

Keep `fetch`, response/error handling, logging, and the `X-Session-Id` header unchanged. The builder must be awaited before `fetch`.

- [ ] **Step 5: Add a hook-level no-fetch test**

Mock the room, storage, props, platform, and coordinator. Render a harness that captures `useSTTAPI()`, then assert:

```ts
mockEnsureSTTSessionId.mockRejectedValue(new Error('RTM unavailable'));
const result = await capturedApi.start(900000123, {
  source: ['en-US'], targets: [],
});
expect(result).toMatchObject({success: false, error: {message: 'RTM unavailable'}});
expect(global.fetch).not.toHaveBeenCalled();
```

Add one successful request assertion that the authorization and existing `X-Session-Id` headers remain present.

- [ ] **Step 6: Run tests and commit**

```bash
cd template
npx jest src/subComponents/caption/__tests__/sttRequestBody.test.ts src/subComponents/caption/__tests__/useSTTAPI.test.tsx --runInBand
cd ..
git add template/src/subComponents/caption/sttRequestBody.ts template/src/subComponents/caption/useSTTAPI.tsx template/src/subComponents/caption/__tests__/sttRequestBody.test.ts template/src/subComponents/caption/__tests__/useSTTAPI.test.tsx
git commit -m "feat: attach shared session id to web STT requests"
```

Expected: both suites PASS; all three methods include one shared ID.

---

### Task 4: Wire Web Cleanup and Timeout Handling

**Files:**
- Create: `template/src/rtm/isRemoteDeparture.ts`
- Create: `template/src/rtm/__tests__/isRemoteDeparture.test.ts`
- Modify: `template/src/components/RTMConfigure.tsx:314-355`
- Modify: `template/src/utils/useEndCall.ts:1-82`
- Create: `template/src/utils/__tests__/useEndCall.test.tsx`

**Interfaces:**
- Consumes: coordinator end cleanup, web detection, RTM unsubscribe, leave type `4`, timeout type `5`.
- Produces: `isRemoteDeparture(type, includeTimeout)` and awaited web cleanup-before-unsubscribe.

- [ ] **Step 1: Write the failing departure tests**

```ts
expect(isRemoteDeparture(4, false)).toBe(true);
expect(isRemoteDeparture(4, true)).toBe(true);
expect(isRemoteDeparture(5, true)).toBe(true);
expect(isRemoteDeparture(5, false)).toBe(false);
expect(isRemoteDeparture(3, true)).toBe(false);
expect(isRemoteDeparture(6, true)).toBe(false);
```

- [ ] **Step 2: Implement and use the predicate**

```ts
export const isRemoteDeparture = (type: number, includeTimeout: boolean) =>
  type === 4 || (includeTimeout && type === 5);
```

Replace the `REMOTE_LEAVE`-only branch in `RTMConfigure` with `isRemoteDeparture(presence.type, isWebInternal())`. Keep the existing UID validation, `_rtm-left` emission, and `offline: true` update. Log whether the event was leave or timeout. Passing the web flag deliberately leaves native timeout behavior unchanged.

- [ ] **Step 3: Write a failing web end-call order test**

Mock the hook dependencies and capture:

```ts
mockCleanup.mockImplementation(async (_channel, _uid, _active, stop) => {
  calls.push('cleanup-start');
  await stop();
  calls.push('cleanup-end');
});
mockStop.mockImplementation(async () => calls.push('stop'));
mockUnsubscribe.mockImplementation(async () => calls.push('unsubscribe'));
await capturedEndCall();
expect(mockCleanup).toHaveBeenCalledWith('room', '123', true, mockStop);
expect(calls).toEqual(['cleanup-start', 'stop', 'cleanup-end', 'unsubscribe']);
```

Add a native-branch test with web detection false. It must not call the coordinator and must keep the current rendered-content host-count stop path.

- [ ] **Step 4: Integrate web cleanup before unsubscribe**

```ts
if (isWebInternal()) {
  try {
    await cleanupSTTSessionOnEnd(
      rtcProps.channel, String(localUid), isSTTActive, stopSTTBotSession,
    );
  } catch (error) {
    console.error('Failed to clean up the web STT session ID', error);
  }
  await RTMEngine.getInstance().engine.unsubscribe(rtcProps.channel);
} else {
  const usersInCall = Object.entries(defaultContent).filter(
    item => item[1].type === 'rtc' &&
      item[1].isHost === 'true' &&
      !item[1].offline,
  );
  if (usersInCall.length === 1 && isSTTActive) {
    stopSTTBotSession().catch(error => {
      console.log('Error stopping stt', error);
    });
  }
  RTMEngine.getInstance().engine.unsubscribe(rtcProps.channel);
}
```

For web, schedule the existing `EndCall` dispatch after cleanup/unsubscribe. Preserve current native dispatch timing and behavior. Do not let metadata failure trap the user in the call.

- [ ] **Step 5: Run tests and commit**

```bash
cd template
npx jest src/rtm/__tests__/isRemoteDeparture.test.ts src/utils/__tests__/useEndCall.test.tsx src/subComponents/caption/__tests__/sttSessionId.web.test.ts --runInBand
cd ..
git add template/src/rtm/isRemoteDeparture.ts template/src/rtm/__tests__/isRemoteDeparture.test.ts template/src/components/RTMConfigure.tsx template/src/utils/useEndCall.ts template/src/utils/__tests__/useEndCall.test.tsx
git commit -m "feat: clean up web STT session on final leave"
```

Expected: web order is stop/remove then unsubscribe; native does not call the web coordinator.

---

### Task 5: Run Web Regression Verification

**Files:**
- Modify only files needed to fix failures caused by Tasks 1-4.

**Interfaces:**
- Consumes: all prior implementation and tests.
- Produces: focused test, lint, type-check, build, and platform-scope evidence.

- [ ] **Step 1: Run all focused tests together**

```bash
cd template
npx jest bridge/rtm/web/__tests__/storage.test.ts src/subComponents/caption/__tests__/sttSessionId.web.test.ts src/subComponents/caption/__tests__/sttRequestBody.test.ts src/subComponents/caption/__tests__/useSTTAPI.test.tsx src/rtm/__tests__/isRemoteDeparture.test.ts src/utils/__tests__/useEndCall.test.tsx --runInBand
```

Expected: all focused suites PASS.

- [ ] **Step 2: Lint touched files**

```bash
cd template
npx eslint bridge/rtm/web/index.ts bridge/rtm/web/__tests__/storage.test.ts src/subComponents/caption/sttSessionId.ts src/subComponents/caption/sttSessionId.web.ts src/subComponents/caption/sttRequestBody.ts src/subComponents/caption/useSTTAPI.tsx src/subComponents/caption/__tests__ src/rtm/isRemoteDeparture.ts src/rtm/__tests__/isRemoteDeparture.test.ts src/components/RTMConfigure.tsx src/utils/useEndCall.ts src/utils/__tests__/useEndCall.test.tsx
```

Expected: no new lint errors in touched files.

- [ ] **Step 3: Type-check and build web production output**

```bash
cd template
npx tsc --noEmit --pretty false
npm run web:build
```

Expected: web build succeeds. If repository-wide TypeScript errors pre-exist, retain their output and prove none references a touched file.

- [ ] **Step 4: Check platform scope and whitespace**

```bash
git diff --name-only 9e9c10ae..HEAD
git diff --check 9e9c10ae..HEAD
```

Expected: no `.native.*`, iOS, Android, Pod, or Gradle changes; no whitespace errors.

- [ ] **Step 5: Perform a two-browser smoke test when credentials are available**

```text
1. Join the same reusable meeting URL in browser A and browser B.
2. Start STT; confirm both startv7 bodies contain the same session_id.
3. Change language/translation; confirm update uses that session_id.
4. Stop STT; confirm stopv7 uses that session_id.
5. End A while B remains; confirm metadata stays.
6. End B; confirm STT_SESSION_ID is removed before unsubscribe.
7. Rejoin and confirm the next startv7 receives a different ID.
```

Expected: one ID across participants and all three methods, retained while anyone remains, replaced after final graceful cleanup.

- [ ] **Step 6: Commit only directly related verification fixes**

Run this step only if Steps 1-4 required edits. Stage the complete known feature file set so the command contains no unresolved path:

```bash
git add template/bridge/rtm/web/index.ts template/bridge/rtm/web/__tests__/storage.test.ts template/src/subComponents/caption/sttSessionId.ts template/src/subComponents/caption/sttSessionId.web.ts template/src/subComponents/caption/sttRequestBody.ts template/src/subComponents/caption/useSTTAPI.tsx template/src/subComponents/caption/__tests__ template/src/rtm/isRemoteDeparture.ts template/src/rtm/__tests__/isRemoteDeparture.test.ts template/src/components/RTMConfigure.tsx template/src/utils/useEndCall.ts template/src/utils/__tests__/useEndCall.test.tsx
git diff --cached --stat
git commit -m "test: verify web STT session lifecycle"
```

If no file required adjustment, do not create an empty commit.
