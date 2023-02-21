import {SdkMethodEvents} from '../SDKAppWrapper';
import {createNanoEvents, Emitter} from 'nanoevents';

type EventParameterHelper<T extends keyof SdkMethodEvents> =
  Parameters<SdkMethodEvents[T]>;

type EventReturnTypeHelper<T extends keyof SdkMethodEvents> =
  ReturnType<SdkMethodEvents[T]>;

type EventKeyNameHelper = keyof SdkMethodEvents;

type injectAsync<T extends (...p: any) => any> = (
  res: (result?: ReturnType<T> | PromiseLike<ReturnType<T>>) => void,
  rej: (reason?: any) => void,
  ...params: Parameters<T>
) => void;

type _InternalSDKMethodEventsMap = {
  [K in EventKeyNameHelper]: injectAsync<SdkMethodEvents[K]>;
};

type emitCacheType = {
  [K in EventKeyNameHelper]?:
    | Parameters<_InternalSDKMethodEventsMap[K]>
    | 'disabled';
};

class SDKMethodEvents {
  constructor() {
    this.emitter = createNanoEvents();
  }

  emitter: Emitter;

  emitCache: emitCacheType = {};

  async emit<T extends EventKeyNameHelper>(
    event: T,
    ...params: EventParameterHelper<T>
  ) {
    if (this.emitCache[event] && this.emitCache[event] !== 'disabled') {
      throw new Error(`Event: ${event} already in callstack`);
    }

    const result = await new Promise<EventReturnTypeHelper<T>>((res, rej) => {
      if (this.emitCache[event] !== 'disabled') {
        this.emitCache[event] = [res, rej, ...params] as any;
      }
      this.emitter.emit(event, res, rej, ...params);
    });

    return result;
  }

  on<T extends EventKeyNameHelper>(
    event: T,
    callback: _InternalSDKMethodEventsMap[T],
  ) {
    const unsub = this.emitter.on(event, callback);
    if (this.emitCache[event] && this.emitCache[event] !== 'disabled') {
      this.emitter.emit(event, ...this.emitCache[event]);
    }
    this.emitCache[event] = 'disabled';
    return unsub;
  }
}

const SDKMethodEventsManager = new SDKMethodEvents();

export default SDKMethodEventsManager;
