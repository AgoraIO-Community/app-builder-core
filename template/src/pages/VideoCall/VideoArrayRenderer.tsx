import React, {useContext} from 'react';
import {MinUidContext, MaxUidContext} from '../../../agora-rn-uikit';
import RenderComponent from './RenderComponent';
import {useFpe} from 'fpe-api';

const VideoArrayRenderer = ({
  children,
}: {
  children: React.FC<any>;
}) => {
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);

  const FpeRenderComponent = useFpe((config) => {
    const videocall = config.components?.videoCall
    if(videocall && typeof videocall === 'object' && videocall.renderComponentObject)
      return videocall.renderComponentObject;
    else 
      return undefined
  });
  
  const minArray = min.map((user, index) => {
    const MinComponent = FpeRenderComponent
      ? FpeRenderComponent[user.type]
      : RenderComponent[user.type];
    return <MinComponent user={user} isMax={false} index={index} />;
  });

  const maxArray = max.map((user, index) => {
    const MaxComponent = FpeRenderComponent
      ? FpeRenderComponent[user.type]
      : RenderComponent[user.type];
    return <MaxComponent user={user} isMax={false} index={index} />;
  });

  return <>{children(minArray, maxArray)}</>;
};

export default VideoArrayRenderer;