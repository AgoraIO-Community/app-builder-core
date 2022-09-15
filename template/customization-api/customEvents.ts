// 1. Import customEvents
import Events from '../src/custom-events/CustomEvents';
import {EventSourceEnum} from '../src/custom-events';

// 2. Initialize with source "fpe"
const CustomEvents = new Events(EventSourceEnum.fpe);

// 3. export
export {CustomEvents};
