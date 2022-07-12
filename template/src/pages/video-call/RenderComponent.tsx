import React from 'react';
import {MaxVideoRenderer} from './VideoRenderer';
import {RenderInterface, UidType} from '../../../agora-rn-uikit';
import {renderComponentObjectInterface, useFpe} from 'fpe-api';
import {isValidReactComponent} from '../../utils/common';

export type RenderComponentType = {[key: string]: React.FC<any>};

const DefaultRenderComponent: RenderComponentType = {
  rtc: MaxVideoRenderer,
  screenshare: MaxVideoRenderer,
};
interface RenderComponentProps {
  user: RenderInterface;
  uid: UidType;
}
const RenderComponent = ({user, uid}: RenderComponentProps) => {
  const FpeRenderComponent = useFpe((config) =>
    typeof config?.components?.videoCall === 'object' &&
    typeof config?.components?.videoCall?.renderComponentObject === 'object'
      ? config?.components?.videoCall?.renderComponentObject
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

  const RenderComp = getRenderComponent(user?.type);

  return <RenderComp user={user} uid={uid} />;
};

export default RenderComponent;
