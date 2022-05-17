//Icons
export {default as icons} from '../src/assets/icons';

//create screen
export {default as Create} from '../src/pages/Create';

//share screen
export {default as Share} from '../src/components/Share';

//Precall components
export * from '../src/components/precall/index';

//video call components
export * from '../src/pages/video-call/index';
export {default as GridLayout} from '../src/components/GridVideo';
export {default as PinnedLayout} from '../src/components/PinnedVideo';
export {default as VideoComponent} from '../src/pages/video-call/VideoComponent';
export {MaxVideoRenderer as MaxVideoView} from '../src/pages/video-call/VideoRenderer';
export {NameWithMicStatus} from '../src/pages/video-call/NameWithMicStatus';
export {NetworkQualityPill} from '../src/subComponents/NetworkQualityPill';
//videocall screen
export {default as VideocallScreen} from '../src/pages/video-call/VideoCallScreen';

//Settings screen
export {default as HostControlView} from '../src/components/HostControlView';
export {default as SelectDevice} from '../src/subComponents/SelectDevice';
