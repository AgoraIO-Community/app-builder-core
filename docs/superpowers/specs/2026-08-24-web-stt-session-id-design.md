# Web STT Session ID Coordination

## Objective

Add a call-occurrence `session_id` to the web STT `startv7`, `update`, and
`stopv7` request bodies. Every participant in the same active call must use the
same value so the backend can stitch VTT output. A later call using the same
reusable URL and RTM channel receives a new value when the final remaining
participant completes the graceful end-call cleanup.

This change targets the web build only. React Native behavior remains
unchanged.

## Constraints

- The passphrase and RTC/RTM channel name are reusable and cannot identify a
  single call occurrence.
- The session ID is a generated UUID-like value stored under one RTM message
  channel metadata key, `STT_SESSION_ID`.
- The existing `X-Session-Id` request header is a logging/correlation value. It
  is not the shared STT session ID and remains unchanged.
- RTM metadata notifications are sufficient; the implementation does not
  publish a separate RTM message or enable RTM locks.
- STT requests must not fall back to a participant-local ID when coordination
  fails, because that would split one call across multiple VTT sessions.

## Architecture

### Web session coordinator

A small web-specific coordinator owns the resolved STT session ID and any
in-flight resolution promise for the current RTM channel. The shared STT API
hook calls this coordinator before issuing a web STT request.

Resolution happens after RTM login and channel subscription, which is already a
dependency of the caption flow:

1. Read `STT_SESSION_ID` from RTM channel metadata.
2. If the key exists, cache and return its value.
3. If the key does not exist, generate a candidate ID and create the key with
   item revision `0` (create only if absent).
4. If another participant wins the concurrent create, re-read metadata and use
   the winner's value.
5. Use one shared in-flight promise per channel so concurrent local
   `startv7`/`update` calls cannot create different candidates.
6. Make at most three metadata-read attempts, with 100 ms and 250 ms delays
   after a create conflict or transient read failure.
7. If resolution still fails, return an explicit failure and do not call the
   STT backend.

No RTM lock is required. Metadata compare-and-set provides the only
serialization needed for this single value.

### Web RTM bridge

The custom web bridge must expose the native-shaped storage behavior required
by the coordinator:

- Preserve item `revision`, `authorUserId`, and `updateTs` when mapping
  `getChannelMetadata` results.
- Preserve revision `0` by using nullish defaulting rather than converting it
  to `-1`.
- Implement `removeChannelMetadata` and remove only the requested metadata
  item, passing its current positive revision.
- Continue mapping the numeric message-channel type to the web SDK's
  `MESSAGE` type.

### STT request integration

`useSTTAPI` continues to centralize all STT requests. For web requests it
resolves the coordinated ID and adds this field to the common request body:

```json
{
  "session_id": "shared-call-session-id"
}
```

This guarantees that `startv7`, `update`, and `stopv7` receive the identical
value for the current call. The React Native build does not add the field in
this phase.

## Cleanup and Presence

Graceful cleanup runs before RTM unsubscribe:

1. Query RTM presence directly for the message channel; do not use the
   rendered participant count or host count.
2. If the total occupancy is greater than one, keep the metadata because the
   call is still active.
3. If the local participant is the only RTM occupant, read the current metadata
   item and immediately query occupancy once more.
4. If both occupancy reads show only the local participant, remove only
   `STT_SESSION_ID` using revision-aware removal.
5. Await the removal attempt, clear the local coordinator cache, and then
   unsubscribe/end the call.

The existing STT stop policy is not expanded in this phase. Whenever the
application invokes `stopv7`, it uses the same coordinated `session_id`.

`REMOTE_TIMEOUT` is handled like `REMOTE_LEAVE` for participant state. A remote
leave or timeout does not itself delete `STT_SESSION_ID`, because the remaining
local participant is still part of the active call and another participant may
join later.

## Concurrency and Failure Handling

- Simultaneous first participants converge through revision-`0` create and
  winner re-read.
- A session ID resolution failure blocks only the STT operation and is logged
  as an STT coordination error.
- Metadata cleanup failure is logged, but end-call cleanup continues so the
  user is not trapped in the call.
- Removal is revision-aware to reduce the chance that a concurrent join or
  replacement value is deleted accidentally.
- Page unload, browser crash, device power loss, and simultaneous abrupt loss
  of all participants cannot guarantee client-side cleanup.

## Accepted Limitation

If every participant disappears abruptly, no client remains to remove the
persistent metadata. Two participants ending at almost exactly the same time
can also both observe occupancy greater than one and leave without either one
performing final cleanup. A later participant can therefore see and reuse a
stale session ID.

The two occupancy checks narrow, but cannot eliminate, a concurrent-join race
between the final check and metadata removal because presence and storage are
not one transaction. RTM metadata and presence alone cannot distinguish all of
these cases from a reconnect without a backend lease, TTL, or authoritative
call-occurrence service. This web phase accepts those limitations; backend
expiry remains the complete solution.

## Planned Code Areas

- `template/bridge/rtm/web/index.ts`: revision-preserving metadata mappings and
  channel-metadata removal.
- `template/src/subComponents/caption/useSTTAPI.tsx`: resolve and attach
  `session_id` to all three web STT operations.
- A focused web session-coordinator module beside the caption/STT code, with a
  non-web fallback that preserves current React Native behavior.
- `template/src/utils/useEndCall.ts`: direct RTM occupancy validation and
  metadata cleanup before unsubscribe.
- `template/src/components/RTMConfigure.tsx`: treat `REMOTE_TIMEOUT` as a
  remote departure.

## Verification

Automated tests will cover:

- Existing metadata is reused.
- Simultaneous revision-`0` creation converges on one ID.
- Revision `0` and returned item revisions survive the web bridge.
- Only `STT_SESSION_ID` is removed.
- `startv7`, `update`, and `stopv7` bodies contain the same `session_id`.
- A web STT request is not issued when session resolution fails.
- Metadata remains when more than one RTM occupant is present.
- The final graceful participant removes metadata before unsubscribe.
- `REMOTE_TIMEOUT` follows the same participant-offline path as
  `REMOTE_LEAVE`.
- React Native requests retain their current behavior in this phase.

Proportional web build, type-check, lint, and focused test commands will run
after implementation.
