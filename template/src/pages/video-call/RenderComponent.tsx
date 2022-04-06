import {MaxVideoRenderer} from './VideoRenderer';

export type RenderComponentType = {[key: string]: React.FC<any>};

const RenderComponent: RenderComponentType = {
  rtc: MaxVideoRenderer,
};

export default RenderComponent;