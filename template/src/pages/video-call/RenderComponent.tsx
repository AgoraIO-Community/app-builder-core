import React from 'react';
import VideoRenderer from './VideoRenderer';
import {UidType} from '../../../agora-rn-uikit';
import {useRender} from 'customization-api';
import {useCustomization} from 'customization-implementation';
import {isValidReactComponent} from '../../utils/common';

export type RenderComponentType = {[key: string]: React.FC<any>};

const DefaultRenderComponent: RenderComponentType = {
  rtc: VideoRenderer,
  screenshare: VideoRenderer,
};
interface RenderComponentProps {
  uid: UidType;
  isMax?: boolean;
}
const RenderComponent = ({uid, isMax = false}: RenderComponentProps) => {
  const {renderList} = useRender();
  const RenderComp = DefaultRenderComponent['rtc'];

  return <RenderComp user={renderList[uid]} isMax={isMax} />;
};

export default RenderComponent;
