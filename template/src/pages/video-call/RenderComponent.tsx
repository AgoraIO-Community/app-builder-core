import React from 'react';
import {MaxVideoRenderer} from './VideoRenderer';
import {UidType} from '../../../agora-rn-uikit';
import {
  renderComponentObjectInterface,
  useFpe,
  useRenderContext,
} from 'fpe-api';
import {isValidReactComponent} from '../../utils/common';

export type RenderComponentType = {[key: string]: React.FC<any>};

const DefaultRenderComponent: RenderComponentType = {
  rtc: MaxVideoRenderer,
  screenshare: MaxVideoRenderer,
};
interface RenderComponentProps {
  uid: UidType;
}
const RenderComponent = ({uid}: RenderComponentProps) => {
  const {renderList} = useRenderContext();
  const FpeRenderComponent = useFpe((config) =>
    typeof config?.components?.videoCall === 'object' &&
    typeof config?.components?.videoCall?.customContent === 'object'
      ? config?.components?.videoCall?.customContent
      : undefined,
  );

  const getRenderComponent = (type: keyof renderComponentObjectInterface) => {
    //checking FPE providing the render component and whether its valid react element
    const FPEComp =
      FpeRenderComponent &&
      FpeRenderComponent[type] &&
      isValidReactComponent(FpeRenderComponent[type])
        ? FpeRenderComponent[type]
        : false;
    //if its valid element then return fpe comp other return the default component
    if (FPEComp) {
      return FPEComp;
    } else {
      return DefaultRenderComponent[type]
        ? DefaultRenderComponent[type]
        : DefaultRenderComponent['rtc'];
    }
  };

  const RenderComp = getRenderComponent(renderList[uid]?.type);

  return <RenderComp user={renderList[uid]} />;
};

export default RenderComponent;
