import React, {useContext} from 'react';
import {MinUidContext, MaxUidContext} from '../../../agora-rn-uikit';
import RenderComponent from './RenderComponent';
import {useFpe} from 'fpe-api';
import {isValidElementType} from '../../utils/common';

const VideoArrayRenderer = ({children}: {children: React.FC<any>}) => {
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);

  const FpeRenderComponent = useFpe((config) =>
    typeof config?.components?.videoCall === 'object' &&
    typeof config?.components?.videoCall?.renderComponentObject === 'object'
      ? config?.components?.videoCall?.renderComponentObject
      : undefined,
  );

  const minArray = min.map((user, index) => {
    const MinComponent =
      FpeRenderComponent &&
      FpeRenderComponent[user.type] &&
      isValidElementType(FpeRenderComponent[user.type])
        ? FpeRenderComponent[user.type]
        : RenderComponent[user.type]
        ? RenderComponent[user.type]
        : RenderComponent['rtc'];
    return <MinComponent user={user} isMax={false} index={index} />;
  });

  const maxArray = max.map((user, index) => {
    const MaxComponent =
      FpeRenderComponent &&
      FpeRenderComponent[user.type] &&
      isValidElementType(FpeRenderComponent[user.type])
        ? FpeRenderComponent[user.type]
        : RenderComponent[user.type]
        ? RenderComponent[user.type]
        : RenderComponent['rtc'];
    return <MaxComponent user={user} isMax={false} index={index} />;
  });

  return <>{children(minArray, maxArray)}</>;
};

export default VideoArrayRenderer;
