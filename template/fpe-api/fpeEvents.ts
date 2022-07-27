// 1. Import customEvents
import CustomEvents from '../src/custom-events/CustomEvents';
import {EventSourceEnum} from '../src/custom-events';

// 2. Initialize with source "fpe"
const fpeEvents = new CustomEvents(EventSourceEnum.fpe);

// 3. export
export {fpeEvents};
