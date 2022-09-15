// 1. Import Events
import Events from '../src/rtm-events-api/Events';
import {EventSourceEnum} from '../src/rtm-events-api';

// 2. Initialize with source "fpe"
const fpeEvents = new Events(EventSourceEnum.fpe);

// 3. export
export {fpeEvents as customEvents};
