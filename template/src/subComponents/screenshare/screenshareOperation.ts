import {ScreenshareOperationState} from './useScreenshare';

export type ScreenshareStartDecision = 'accept' | 'skip';
export type ScreenshareStopDecision = 'execute' | 'queue' | 'skip';

export const getScreenshareStartDecision = (
  state: ScreenshareOperationState,
): ScreenshareStartDecision => (state === 'inactive' ? 'accept' : 'skip');

export const getScreenshareStopDecision = (
  state: ScreenshareOperationState,
  hasQueuedStop: boolean,
): ScreenshareStopDecision => {
  if (state === 'active') {
    return 'execute';
  }
  if (state === 'starting' && !hasQueuedStop) {
    return 'queue';
  }
  return 'skip';
};
