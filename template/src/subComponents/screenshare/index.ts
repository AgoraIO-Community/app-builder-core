import { createHook } from 'fpe-implementation';
import {default as ScreenshareContext, type ScreenshareContextInterface} from './ScreenshareContext';

export {default as ScreenshareButton} from './ScreenshareButton';
export {default as ScreenshareProvider} from './ScreenshareConfigure';

const useScreenshare = createHook(ScreenshareContext);
export {type ScreenshareContextInterface, useScreenshare};