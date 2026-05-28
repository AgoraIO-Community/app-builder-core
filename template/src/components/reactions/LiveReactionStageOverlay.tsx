import React from 'react';
import {isWebInternal} from '../../utils/common';
import {useVideoCall} from '../useVideoCall';
import {
  LIVE_REACTION_FLOAT_DURATION,
  LIVE_REACTION_LANE_COUNT,
  LIVE_REACTION_MAP,
} from './catalog';

// Use the bundled Lottie player directly instead of relying on a global.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lottie = require('lottie-web/build/player/lottie.js');

const hashReactionId = (reactionId: string) => {
  let hash = 0;
  for (let i = 0; i < reactionId.length; i += 1) {
    hash = (hash * 31 + reactionId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const css = `
.live-reaction-stage-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1000;
}
.live-reaction-debug-guides {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 999;
}
.live-reaction-debug-lanes {
  position: absolute;
  top: 0;
  left: 16px;
  width: 240px;
  height: 100%;
  display: flex;
  gap: 0;
}
.live-reaction-debug-lane {
  width: 48px;
  height: 100%;
  box-sizing: border-box;
  border-left: 1px dashed rgba(104, 227, 255, 0.75);
  border-right: 1px dashed rgba(104, 227, 255, 0.35);
}
.live-reaction-debug-start-line,
.live-reaction-debug-end-line {
  position: absolute;
  left: 16px;
  width: 240px;
  height: 1px;
}
.live-reaction-debug-start-line {
  bottom: 18px;
  background: rgba(255, 91, 91, 0.9);
  box-shadow: 0 0 0 1px rgba(255, 91, 91, 0.15);
}
.live-reaction-debug-mid-line {
  position: absolute;
  left: 16px;
  width: 240px;
  height: 1px;
  bottom: 50%;
  background: rgba(255, 206, 86, 0.95);
  box-shadow: 0 0 0 1px rgba(255, 206, 86, 0.15);
}
.live-reaction-debug-end-line {
  bottom: calc(100% - 96px);
  background: rgba(104, 227, 255, 0.9);
  box-shadow: 0 0 0 1px rgba(104, 227, 255, 0.15);
}
.live-reaction-debug-label {
  position: absolute;
  left: 4px;
  transform: translateY(-50%);
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 1;
  color: #fff;
  white-space: nowrap;
}
.live-reaction-debug-label--start {
  bottom: 18px;
  background: rgba(255, 91, 91, 0.95);
}
.live-reaction-debug-label--mid {
  bottom: 50%;
  background: rgba(255, 206, 86, 0.95);
}
.live-reaction-debug-label--end {
  bottom: calc(100% - 96px);
  background: rgba(104, 227, 255, 0.95);
}
.live-reaction-stage-item {
  position: absolute;
  width: 64px;
  height: 80px;
  left: var(--reaction-left);
  bottom: 18px;
  opacity: 0;
  animation: live-reaction-float var(--reaction-duration) cubic-bezier(.18,.72,.22,1) forwards;
  will-change: transform, opacity, bottom;
}
.live-reaction-stage-item-content {
  width: 64px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
}
.live-reaction-stage-item img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  display: block;
}
.live-reaction-clap {
  width: 48px;
  height: 48px;
}
.live-reaction-sender-name {
  display: flex;
  min-width: 48px;
  max-width: 88px;
  padding: 4px 10px;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 20px;
  background: ${$config.VIDEO_AUDIO_TILE_AVATAR_COLOR};
  font-size: 12px;
  line-height: 12px;
  font-family: 'Source Sans 3', 'Source Sans Pro';
  font-weight: 400;
  color: ${$config.BACKGROUND_COLOR};
  text-align: center;
}
.live-reaction-sender-name-text {
  min-width: 0;
  max-width: 68px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@keyframes live-reaction-float {
  0% {
    bottom: 18px;
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(0.86);
  }
  12% {
    opacity: 1;
    transform: translate3d(0, -4px, 0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate3d(var(--reaction-drift), -8px, 0) scale(1.02);
  }
  80% {
    opacity: 0.55;
    transform: translate3d(var(--reaction-drift), -10px, 0) scale(1.05);
  }
  100% {
    bottom: calc(100% - 96px);
    opacity: 0;
    transform: translate3d(var(--reaction-drift), 0, 0) scale(1.08);
  }
}
`;

const ReactionArt = ({
  fallbackSrc,
  lottieData,
}: {
  fallbackSrc: string;
  lottieData?: any;
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const animationRef = React.useRef<any>(null);
  const [shouldFallback, setShouldFallback] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || shouldFallback || !lottieData) {
      return;
    }
    if (!lottie?.loadAnimation) {
      setShouldFallback(true);
      return;
    }

    animationRef.current?.destroy();
    animationRef.current = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: lottieData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    });

    animationRef.current.addEventListener('data_failed', () => {
      setShouldFallback(true);
    });

    return () => {
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, [lottieData, shouldFallback]);

  if (shouldFallback) {
    return <img src={fallbackSrc} alt="" aria-hidden="true" />;
  }

  return (
    <div ref={containerRef} className="live-reaction-clap" aria-hidden="true" />
  );
};

const LiveReactionStageOverlay = () => {
  const {floatingReactions} = useVideoCall();
  // const isDev =
  //   typeof __DEV__ !== 'undefined'
  //     ? __DEV__
  //     : process.env.NODE_ENV !== 'production';
  // const isDebugVisible = isDev && $config.ENABLE_LIVE_REACTIONS;
  const isDebugVisible = false;

  if (
    !$config.ENABLE_LIVE_REACTIONS ||
    !isWebInternal() ||
    floatingReactions.length === 0
  ) {
    return null;
  }

  return (
    <>
      <style type="text/css">{css}</style>
      <div className="live-reaction-stage-overlay">
        {isDebugVisible ? (
          <div className="live-reaction-debug-guides" aria-hidden="true">
            <div className="live-reaction-debug-lanes">
              {Array.from({length: LIVE_REACTION_LANE_COUNT}).map(
                (_, index) => (
                  <div
                    key={`debug-lane-${index}`}
                    className="live-reaction-debug-lane"
                  />
                ),
              )}
            </div>
            <div className="live-reaction-debug-start-line" />
            <div className="live-reaction-debug-mid-line" />
            <div className="live-reaction-debug-end-line" />
            <div className="live-reaction-debug-label live-reaction-debug-label--start">
              0% opacity
            </div>
            <div className="live-reaction-debug-label live-reaction-debug-label--mid">
              100% opacity
            </div>
            <div className="live-reaction-debug-label live-reaction-debug-label--end">
              0% opacity
            </div>
          </div>
        ) : null}
        {floatingReactions.map((reaction, index) => {
          const reactionDefinition = LIVE_REACTION_MAP[reaction.assetKey];
          if (!reactionDefinition) {
            return null;
          }
          const lane =
            typeof reaction.lane === 'number'
              ? reaction.lane
              : index % LIVE_REACTION_LANE_COUNT;
          const left = `${16 + lane * 48}px`;
          const drift = `${
            ((hashReactionId(reaction.reactionId) % 3) - 1) * 10
          }px`;
          return (
            <div
              key={reaction.reactionId}
              className="live-reaction-stage-item"
              style={
                {
                  '--reaction-left': left,
                  '--reaction-drift': drift,
                  '--reaction-duration': `${LIVE_REACTION_FLOAT_DURATION}ms`,
                  '--reaction-size': '48px',
                } as React.CSSProperties
              }>
              <div className="live-reaction-stage-item-content">
                <ReactionArt
                  fallbackSrc={reactionDefinition.asset}
                  lottieData={reactionDefinition.lottieData}
                />
                <div
                  className="live-reaction-sender-name"
                  title={reaction.senderDisplayName || reaction.senderUid}>
                  <span className="live-reaction-sender-name-text">
                    {reaction.senderDisplayName || reaction.senderUid}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default LiveReactionStageOverlay;
