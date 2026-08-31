// @ts-ignore
import tyCustom from '../../assets/live-reactions/custom/ty.png';
// @ts-ignore
import agoraCustom from '../../assets/live-reactions/custom/agora.png';

export type SkinToneCode = '1f3fb' | '1f3fc' | '1f3fd' | '1f3fe' | '1f3ff';
export type SkinTonePreference = 'default' | SkinToneCode;

export interface LiveReactionSkinToneAsset {
  asset: any;
  lottieData?: any;
}

export interface LiveReactionCustomMeta {
  label: string;
  fallbackEmoji: string;
}

export interface LiveReactionDefinition {
  key: string;
  emoji: string;
  asset: any;
  lottieData?: any;
  skinToneVariants?: Record<SkinToneCode, LiveReactionSkinToneAsset>;
  custom?: LiveReactionCustomMeta;
}

export interface LiveReactionEvent {
  reactionId: string;
  assetKey: string;
  emoji: string;
  senderUid: string;
  senderDisplayName?: string;
  timestamp: number;
  lane?: number;
  skinTone?: SkinToneCode;
}

export const LIVE_REACTION_LANE_COUNT = 5;
export const LIVE_REACTION_BADGE_DURATION = 10_000;
export const LIVE_REACTION_FLOAT_DURATION = 4_200;
export const LIVE_REACTION_MAX_FLOATING_ITEMS = 20;

export const SKIN_TONE_CODES: SkinToneCode[] = [
  '1f3fb',
  '1f3fc',
  '1f3fd',
  '1f3fe',
  '1f3ff',
];

export const SKIN_TONE_MODIFIER: Record<SkinToneCode, string> = {
  '1f3fb': '\u{1F3FB}',
  '1f3fc': '\u{1F3FC}',
  '1f3fd': '\u{1F3FD}',
  '1f3fe': '\u{1F3FE}',
  '1f3ff': '\u{1F3FF}',
};

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
    skinToneVariants: {
      '1f3fb': {
        asset: require('../../assets/live-reactions/1f44d_1f3fb.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f44d_1f3fb.json'),
      },
      '1f3fc': {
        asset: require('../../assets/live-reactions/1f44d_1f3fc.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f44d_1f3fc.json'),
      },
      '1f3fd': {
        asset: require('../../assets/live-reactions/1f44d_1f3fd.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f44d_1f3fd.json'),
      },
      '1f3fe': {
        asset: require('../../assets/live-reactions/1f44d_1f3fe.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f44d_1f3fe.json'),
      },
      '1f3ff': {
        asset: require('../../assets/live-reactions/1f44d_1f3ff.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f44d_1f3ff.json'),
      },
    },
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
    skinToneVariants: {
      '1f3fb': {
        asset: require('../../assets/live-reactions/1f44f_1f3fb.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f44f_1f3fb.json'),
      },
      '1f3fc': {
        asset: require('../../assets/live-reactions/1f44f_1f3fc.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f44f_1f3fc.json'),
      },
      '1f3fd': {
        asset: require('../../assets/live-reactions/1f44f_1f3fd.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f44f_1f3fd.json'),
      },
      '1f3fe': {
        asset: require('../../assets/live-reactions/1f44f_1f3fe.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f44f_1f3fe.json'),
      },
      '1f3ff': {
        asset: require('../../assets/live-reactions/1f44f_1f3ff.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f44f_1f3ff.json'),
      },
    },
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
  {
    key: 'eyes',
    emoji: '👀',
    asset: require('../../assets/live-reactions/1f440.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f440.json'),
  },
  {
    key: 'rocket',
    emoji: '🚀',
    asset: require('../../assets/live-reactions/1f680.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f680.json'),
  },
  {
    key: 'upside-down-face',
    emoji: '🙃',
    asset: require('../../assets/live-reactions/1f643.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f643.json'),
  },
  {
    key: 'fire',
    emoji: '🔥',
    asset: require('../../assets/live-reactions/1f525.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f525.json'),
  },
  {
    key: 'hundred',
    emoji: '💯',
    asset: require('../../assets/live-reactions/1f4af.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f4af.json'),
  },
  {
    key: 'raising-hands',
    emoji: '🙌',
    asset: require('../../assets/live-reactions/1f64c.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f64c.json'),
    skinToneVariants: {
      '1f3fb': {
        asset: require('../../assets/live-reactions/1f64c_1f3fb.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f64c_1f3fb.json'),
      },
      '1f3fc': {
        asset: require('../../assets/live-reactions/1f64c_1f3fc.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f64c_1f3fc.json'),
      },
      '1f3fd': {
        asset: require('../../assets/live-reactions/1f64c_1f3fd.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f64c_1f3fd.json'),
      },
      '1f3fe': {
        asset: require('../../assets/live-reactions/1f64c_1f3fe.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f64c_1f3fe.json'),
      },
      '1f3ff': {
        asset: require('../../assets/live-reactions/1f64c_1f3ff.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f64c_1f3ff.json'),
      },
    },
  },
  {
    key: 'light-bulb',
    emoji: '💡',
    asset: require('../../assets/live-reactions/1f4a1.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f4a1.json'),
  },
  {
    key: 'folded-hands',
    emoji: '🙏',
    asset: require('../../assets/live-reactions/1f64f.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f64f.json'),
    skinToneVariants: {
      '1f3fb': {
        asset: require('../../assets/live-reactions/1f64f_1f3fb.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f64f_1f3fb.json'),
      },
      '1f3fc': {
        asset: require('../../assets/live-reactions/1f64f_1f3fc.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f64f_1f3fc.json'),
      },
      '1f3fd': {
        asset: require('../../assets/live-reactions/1f64f_1f3fd.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f64f_1f3fd.json'),
      },
      '1f3fe': {
        asset: require('../../assets/live-reactions/1f64f_1f3fe.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f64f_1f3fe.json'),
      },
      '1f3ff': {
        asset: require('../../assets/live-reactions/1f64f_1f3ff.gif'),
        lottieData: require('../../assets/live-reactions/animated/1f64f_1f3ff.json'),
      },
    },
  },
  {
    key: 'check-mark',
    emoji: '✅',
    asset: require('../../assets/live-reactions/2705.gif'),
    lottieData: require('../../assets/live-reactions/animated/2705.json'),
  },
  {
    key: 'sunglasses',
    emoji: '😎',
    asset: require('../../assets/live-reactions/1f60e.gif'),
    lottieData: require('../../assets/live-reactions/animated/1f60e.json'),
  },
  {
    key: 'thank-you',
    emoji: '🙏',
    asset: tyCustom,
    custom: {label: 'Thank you', fallbackEmoji: '🙏'},
  },
  {
    key: 'agora',
    emoji: '🅰️',
    asset: agoraCustom,
    custom: {label: 'Agora', fallbackEmoji: '🅰️'},
  },
];

export const LIVE_REACTION_MAP = LIVE_REACTIONS.reduce<
  Record<string, LiveReactionDefinition>
>((acc, reaction) => {
  acc[reaction.key] = reaction;
  return acc;
}, {});

export function supportsSkinTone(
  reaction: LiveReactionDefinition | undefined,
): boolean {
  return !!reaction?.skinToneVariants;
}

export function resolveReactionVisual(
  assetKey: string,
  skinTone?: SkinToneCode,
): LiveReactionSkinToneAsset | undefined {
  const reaction = LIVE_REACTION_MAP[assetKey];
  if (!reaction) {
    return undefined;
  }
  if (skinTone && reaction.skinToneVariants?.[skinTone]) {
    return reaction.skinToneVariants[skinTone];
  }
  return {asset: reaction.asset, lottieData: reaction.lottieData};
}

export function applySkinToneToEmoji(
  reaction: LiveReactionDefinition,
  tone: SkinTonePreference,
): string {
  if (tone === 'default' || !reaction.skinToneVariants?.[tone]) {
    return reaction.emoji;
  }
  return `${reaction.emoji}${SKIN_TONE_MODIFIER[tone]}`;
}
