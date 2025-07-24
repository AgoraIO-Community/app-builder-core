export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  //const s = d.getSeconds().toString().padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  const H = h % 12 || 12;
  return `${H}:${m} ${suffix}`;
}

export type LanguageType =
  | 'en' // English
  | 'fr' // French
  | 'es' // Spanish
  | 'de' // German
  | 'ja' // Japanese (for ElevenLabs only)
  | 'zh' // Chinese
  | 'hi' // Hindi
  | 'ko' // Korean
  | 'pt' // Portuguese
  | 'it' // Italian
  | 'id' // Indonesian
  | 'nl' // Dutch
  | 'tr' // Turkish
  | 'fil' // Filipino
  | 'pl' // Polish
  | 'sv' // Swedish
  | 'bg' // Bulgarian
  | 'ro' // Romanian
  | 'ar' // Arabic
  | 'cs' // Czech
  | 'el' // Greek
  | 'fi' // Finnish
  | 'hr' // Croatian
  | 'ms' // Malay
  | 'sk' // Slovak
  | 'da' // Danish
  | 'ta' // Tamil
  | 'uk' // Ukrainian
  | 'ru' // Russian
  | '';

export type TTSType = 'rime' | 'eleven_labs';

export type RimeModelType = 'mistv2' | 'arcana';
export type ElevenLabsModelType = 'eleven_multilingual_v2';

interface LanguageData {
  label: string;
  value: LanguageType;
}

export const rimeLangData: LanguageData[] = [
  {label: 'English', value: 'en'},
  {label: 'French', value: 'fr'},
  {label: 'German', value: 'de'},
  {label: 'Spanish', value: 'es'},
];

export const elevenLabsLangData: LanguageData[] = [
  {label: 'English', value: 'en'},
  {label: 'Japanese', value: 'ja'},
  {label: 'Chinese', value: 'zh'},
  {label: 'German', value: 'de'},
  {label: 'Hindi', value: 'hi'},
  {label: 'French', value: 'fr'},
  {label: 'Korean', value: 'ko'},
  {label: 'Portuguese', value: 'pt'},
  {label: 'Italian', value: 'it'},
  {label: 'Spanish', value: 'es'},
  {label: 'Indonesian', value: 'id'},
  {label: 'Dutch', value: 'nl'},
  {label: 'Turkish', value: 'tr'},
  {label: 'Filipino', value: 'fil'},
  {label: 'Polish', value: 'pl'},
  {label: 'Swedish', value: 'sv'},
  {label: 'Bulgarian', value: 'bg'},
  {label: 'Romanian', value: 'ro'},
  {label: 'Arabic', value: 'ar'},
  {label: 'Czech', value: 'cs'},
  {label: 'Greek', value: 'el'},
  {label: 'Finnish', value: 'fi'},
  {label: 'Croatian', value: 'hr'},
  {label: 'Malay', value: 'ms'},
  {label: 'Slovak', value: 'sk'},
  {label: 'Danish', value: 'da'},
  {label: 'Tamil', value: 'ta'},
  {label: 'Ukrainian', value: 'uk'},
  {label: 'Russian', value: 'ru'},
];

// Soniox translation rules for stt-rt-preview
const specialGroup = ['fr', 'de', 'it', 'es', 'zh', 'ja', 'ko'];
const slovenianPairs = ['hr', 'fr', 'de', 'it', 'sr', 'es'];

export function getValidElevenLabsTargets(
  source: LanguageType,
  allLangs: LanguageData[],
): LanguageData[] {
  const src = source as string;
  let targets: Set<string> = new Set();

  // Always allow same-language translation
  targets.add(src);

  if (src === 'en') {
    allLangs.forEach(l => {
      if (l.value !== 'en') targets.add(l.value);
    });
  }
  if (src !== 'en') {
    targets.add('en');
  }
  if (src === 'pt') {
    targets.add('es');
  }
  if (src === 'es') {
    targets.add('pt');
  }
  if (src === 'sl') {
    slovenianPairs.forEach(code => targets.add(code));
  }
  if (src === 'hr' || src === 'sr') {
    targets.add('sl');
  }
  if (specialGroup.includes(src)) {
    specialGroup.forEach(code => {
      if (code !== src) targets.add(code);
    });
  }
  return allLangs.filter(l => targets.has(l.value));
}

export function getValidElevenLabsSources(
  target: LanguageType,
  allLangs: LanguageData[],
): LanguageData[] {
  const tgt = target as string;
  let sources: Set<string> = new Set();

  // Always allow same-language translation
  sources.add(tgt);

  if (tgt === 'en') {
    allLangs.forEach(l => {
      if (l.value !== 'en') sources.add(l.value);
    });
  }
  if (tgt !== 'en') {
    sources.add('en');
  }
  if (tgt === 'pt') {
    sources.add('es');
  }
  if (tgt === 'es') {
    sources.add('pt');
  }
  if (tgt === 'sl') {
    slovenianPairs.forEach(code => sources.add(code));
  }
  if (tgt === 'hr' || tgt === 'sr') {
    sources.add('sl');
  }
  if (specialGroup.includes(tgt)) {
    specialGroup.forEach(code => {
      if (code !== tgt) sources.add(code);
    });
  }
  return allLangs.filter(l => sources.has(l.value));
}

export function getLanguageLabel(
  languageCode: LanguageType[],
): string | undefined {
  const langLabels = languageCode.map(langCode => {
    return rimeLangData.find(data => data.value === langCode).label;
  });
  return langLabels ? langLabels.join(', ') : undefined;
}

export function formatDateWithTimeZone(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  const timeZoneOffset = 5.5 * 60; // Offset in minutes for GMT +5:30
  const offsetHours = Math.floor(timeZoneOffset / 60);
  const offsetMinutes = timeZoneOffset % 60;
  const offsetSign = '+';

  return `${day}/${month}/${year} ${hours}:${minutes} GMT ${offsetSign}${offsetHours}:${String(
    offsetMinutes,
  ).padStart(2, '0')}`;
}

export interface VoiceOption {
  name: string;
  description: string;
  value: string;
}
// arcana voices
export const rimeArcanaVoices: VoiceOption[] = [
  {
    name: 'Luna (chill but excitable)',
    description: 'chill but excitable',
    value: 'luna',
  },
  {name: 'Tauro (street smart)', description: 'street smart', value: 'tauro'},
  {name: 'Astra (wide-eyed)', description: 'wide-eyed', value: 'astra'},
  {
    name: 'Pola (warm and gregarious)',
    description: 'warm and gregarious',
    value: 'pola',
  },
  {name: 'Orion (happy)', description: 'happy', value: 'orion'},
  {name: 'Estelle (so sweet)', description: 'so sweet', value: 'estelle'},
  {
    name: 'Andromeda (breathy, yoga vibes)',
    description: 'breathy, yoga vibes',
    value: 'andromeda',
  },
  {
    name: 'Ursa (encyclopedic knowledge)',
    description: 'encyclopedic knowledge',
    value: 'ursa',
  },
];

//mistv2 voices by language
export const rimeMistv2VoicesByLanguage = {
  en: [
    {
      name: 'Amber (Conversational)',
      description: 'Conversational',
      value: 'amber',
    },
    {
      name: 'Allison (General)',
      description: 'General',
      value: 'allison',
    },
    {
      name: 'Ana (Conversational)',
      description: 'Conversational',
      value: 'ana',
    },
    {
      name: 'Brittany (Conversational)',
      description: 'Conversational',
      value: 'brittany',
    },
    {
      name: 'Elena (Conversational)',
      description: 'Conversational',
      value: 'elena',
    },
  ],
  es: [
    {
      name: 'Isa (General)',
      description: 'General',
      value: 'isa',
    },
    {
      name: 'Mari (General)',
      description: 'General',
      value: 'mari',
    },
    {
      name: 'Pablo (General)',
      description: 'General',
      value: 'pablo',
    },
  ],
  de: [
    {
      name: 'Amalia (IVR)',
      description: 'IVR',
      value: 'amalia',
    },
    {
      name: 'Frieda (IVR)',
      description: 'IVR',
      value: 'frieda',
    },
    {
      name: 'Karolina (IVR)',
      description: 'IVR',
      value: 'karolina',
    },
    {
      name: 'Klaus (IVR)',
      description: 'IVR',
      value: 'klaus',
    },
  ],
  fr: [
    {
      name: 'Alois (IVR)',
      description: 'IVR',
      value: 'alois',
    },
    {
      name: 'Juliette (IVR)',
      description: 'IVR',
      value: 'juliette',
    },
    {
      name: 'Marguerite (IVR)',
      description: 'IVR',
      value: 'marguerite',
    },
  ],
};

// Helper function to get voices for a specific language
export const getRimeMistv2VoicesForLanguage = (language: string): VoiceOption[] => {
  const voices = rimeMistv2VoicesByLanguage[language as keyof typeof rimeMistv2VoicesByLanguage];
  return voices || rimeMistv2VoicesByLanguage.en; // Default to English if language not found
};

// Legacy export for backward compatibility
export const rimeMistv2Voices: VoiceOption[] = [
  ...rimeMistv2VoicesByLanguage.en,
  ...rimeMistv2VoicesByLanguage.es,
  ...rimeMistv2VoicesByLanguage.de,
  ...rimeMistv2VoicesByLanguage.fr,
];

export const elevenLabsVoices: VoiceOption[] = [
  // 1. Female
  {
    name: 'Simran - Gen Z, Hindi (Female)',
    value: 'TRnaQb7q41oL7sV0w6Bu',
    description:
      "A bubbly, expressive voice that sounds just like your favorite friend spilling tea over texts. Simran’s tone is light, fast-paced, and full of playful energy—perfect for Gen Z-focused content, AI BFFs, social media storytelling, and voice-based gossip apps. Whether it's for YouTube shorts, Instagram reels, Snapchat series, or interactive voice chats, Simran brings that ultra-relatable, “girl-next-door” charm that hooks listeners instantly.",
  },
  // 2. Male
  {
    name: 'Hope - Conversational, American (Male)',
    value: 'OYTbf65OHHFELVut7v2H',
    description: 'Hope - Crisp, Conversational, American (Male)',
  },
  // 3. Female
  {
    name: 'Emily - Confident, American (Female)',
    value: 'VUGQSU6BSEjkbudnJbOj',
    description:
      'Female American voice with clarity and good diction and pronunciation. Perfect for a tutorial, business, corporate, or news narration or voiceover.',
  },
  // 4. Male
  {
    name: 'Adam - Professional, American (Male)',
    value: 'pNInz6obpgDQGcFmaJgB',
    description:
      'A clear, professional American male voice, ideal for narration, presentations, and business content.',
  },
  // 5. Female
  {
    name: 'Humanoid - Robotic, British (Female)',
    value: 'ZD29qZCdYhhdqzBLRKNH',
    description:
      'A clear, articulate female AI assistant voice with a futuristic, slightly robotic tone—evoking the precision and calm of an advanced digital entity from the future.',
  },
  // 6. Male
  {
    name: 'Antoni - Conversational, Spanish (Male)',
    value: 'ErXwobaYiN019PkySvjV',
    description:
      'A warm, conversational Spanish male voice, great for friendly and engaging content.',
  },
  // 7. Female
  {
    name: 'Molly - Conversational, British (Female)',
    value: 'jkSXBeN4g5pNelNQ3YWw',
    description: 'A high quality, conversational english voice, late twenties.',
  },
  // 8. Male
  {
    name: 'Josh - Natural, American (Male)',
    value: 'TxGEqnHWrfWFTfGW9XjX',
    description:
      'A friendly, natural-sounding American male voice, suitable for a wide range of applications.',
  },
  // 9. Female
  {
    name: 'Samara - Calm, British (Female)',
    value: '19STyYD15bswVz51nqLf',
    description:
      'An elegant yet relaxed British accent female voice that is warm, clear, trustworthy, thoughtful and engaging. Ideal for international projects that educate, explain, motivate or inspire.',
  },
  // 10. Male
  {
    name: 'Arnold - Authoritative, British (Male)',
    value: 'VR6AewLTigWG4xSOukaG',
    description:
      'A deep, authoritative British male voice, perfect for documentaries and formal presentations.',
  },
  // 11. Female
  {
    name: 'Amelia - Upbeat, British (Female)',
    value: 'ZF6FPAbjXT4488VcRRnw',
    description:
      "A young British English woman's voice, clear and easy to understand. Expressive and enthusiastic, it's beautiful for narration, podcasts and social media such as YouTube, Tiktok, Reels and Stories. This studio-produced audio is great for a young woman's Gen-Z voice in audiobooks, high-quality video dubbing, advertising and reading.",
  },
  // 12. Female
  {
    name: 'Jane - Professional, British (Female)',
    value: 'RILOU7YmBhvwJGDGjNmP',
    description:
      'Professional English audiobook narrator in her 50s with a nice tone and cadence. Great for narration, storytelling, or general content creation, like YouTube.',
  },
];

export const ttsOptions = [
  {label: 'Rime TTS', value: 'rime'},
  {label: 'ElevenLabs TTS', value: 'eleven_labs'},
];

export const rimeModelOptions = [
  {label: 'MistV2', value: 'mistv2'},
  {label: 'Arcana', value: 'arcana'},
];

export const elevenLabsModelOptions = [
  {
    label: 'Eleven Multilingual V2',
    value: 'eleven_multilingual_v2',
    disabled: true,
  },
];

//  (defaults to mistv2)
export const rimeVoices = rimeMistv2Voices;

// Function to get voices based on model and optional language
export function getRimeVoicesByModel(model: RimeModelType, language?: string): VoiceOption[] {
  switch (model) {
    case 'mistv2':
      if (language) {
        return getRimeMistv2VoicesForLanguage(language);
      }
      return rimeMistv2Voices;
    case 'arcana':
      return rimeArcanaVoices;
    default:
      return rimeMistv2Voices;
  }
}

export function getElevenLabsVoicesByModel(
  _model?: ElevenLabsModelType,
): VoiceOption[] {
  // Currently all ElevenLabs models use the same voice set
  return elevenLabsVoices;
}

export const V2V_URL = 'https://demo.rteappbuilder.com/rcr';
