import {controlMessageEnum} from '../components/ChatContext';
import events from '../rtm-events-api';

const endCallEveryOne = () => {
  events.send(controlMessageEnum.endCallForEveryone);
};
export default endCallEveryOne;
