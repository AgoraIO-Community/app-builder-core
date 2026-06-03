export interface LiveReactionDefinition {
  key: string;
  emoji: string;
  asset: any;
  lottieData?: any;
}

export interface LiveReactionEvent {
  reactionId: string;
  assetKey: string;
  emoji: string;
  senderUid: string;
  senderDisplayName?: string;
  timestamp: number;
  lane?: number;
}

export const LIVE_REACTION_LANE_COUNT = 5;
export const LIVE_REACTION_BADGE_DURATION = 10_000;
export const LIVE_REACTION_FLOAT_DURATION = 4_200;
export const LIVE_REACTION_MAX_FLOATING_ITEMS = 20;

export const LIVE_REACTIONS: LiveReactionDefinition[] = [
  {
    key: 'sparkling-heart',
    emoji: '💖',
    asset: require('../../assets/live-reactions/1f496.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f496.json'),
  },
  {
    key: 'thumbs-up',
    emoji: '👍',
    asset: require('../../assets/live-reactions/1f44d.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f44d.json'),
  },
  {
    key: 'party-popper',
    emoji: '🎉',
    asset: require('../../assets/live-reactions/1f389.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f389.json'),
  },
  {
    key: 'clap',
    emoji: '👏',
    asset: require('../../assets/live-reactions/1f44f.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f44f.json'),
  },
  {
    key: 'joy',
    emoji: '😂',
    asset: require('../../assets/live-reactions/1f602.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f602.json'),
  },
  {
    key: 'wow',
    emoji: '😮',
    asset: require('../../assets/live-reactions/1f62e.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f62e.json'),
  },
  {
    key: 'cry',
    emoji: '😢',
    asset: require('../../assets/live-reactions/1f622.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f622.json'),
  },
  {
    key: 'thinking',
    emoji: '🤔',
    asset: require('../../assets/live-reactions/1f914.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f914.json'),
  },
];

export const LIVE_REACTION_MAP = LIVE_REACTIONS.reduce<
  Record<string, LiveReactionDefinition>
>((acc, reaction) => {
  acc[reaction.key] = reaction;
  return acc;
}, {});
