import createHook from '../customization-implementation/createHook';
import RtcContext from '../agora-rn-uikit/src/Contexts/RtcContext';
import RenderContext from '../agora-rn-uikit/src/Contexts/RenderContext';

/**
 * Core hooks live in a dependency-free module so internal application code can
 * consume them without evaluating the public customization API barrel.
 */
export const useRtc = createHook(RtcContext);
export const useRender = createHook(RenderContext);
