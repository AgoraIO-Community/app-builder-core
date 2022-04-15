import {createHook} from 'fpe-implementation';
import type {ScreenshareContextInterface} from './ScreenshareContext';
import {default as ScreenshareContext} from './ScreenshareContext';

export {default as ScreenshareButton} from './ScreenshareButton';
export {default as ScreenshareProvider} from './ScreenshareConfigure';

const useScreenshare = createHook(ScreenshareContext);
export type {ScreenshareContextInterface};
export {useScreenshare};
