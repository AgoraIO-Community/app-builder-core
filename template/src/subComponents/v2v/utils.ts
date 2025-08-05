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

export const rimeMistv2WebSocketLangData: LanguageData[] = [
  {label: 'English', value: 'en'},
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
      name: 'Abbie (Conversational)',
      description: 'Conversational',
      value: 'abbie',
    },
    {
      name: 'Allison (General)',
      description: 'General',
      value: 'allison',
    },
    {
      name: 'Ally (Conversational)',
      description: 'Conversational',
      value: 'ally',
    },
    {
      name: 'Alona (Conversational)',
      description: 'Conversational',
      value: 'alona',
    },
    {
      name: 'Amber (Conversational)',
      description: 'Conversational',
      value: 'amber',
    },
    {
      name: 'Ana (Conversational)',
      description: 'Conversational',
      value: 'ana',
    },
    {
      name: 'Antoine (General)',
      description: 'General',
      value: 'antoine',
    },
    {
      name: 'Armon (General)',
      description: 'General',
      value: 'armon',
    },
    {
      name: 'Brenda (General)',
      description: 'General',
      value: 'brenda',
    },
    {
      name: 'Brittany (Conversational)',
      description: 'Conversational',
      value: 'brittany',
    },
    {
      name: 'Carol (General)',
      description: 'General',
      value: 'carol',
    },
    {
      name: 'Colin (General)',
      description: 'General',
      value: 'colin',
    },
    {
      name: 'Courtney (General)',
      description: 'General',
      value: 'courtney',
    },
    {
      name: 'Elena (Conversational)',
      description: 'Conversational',
      value: 'elena',
    },
    {
      name: 'Elliot (General)',
      description: 'General',
      value: 'elliot',
    },
    {
      name: 'Eva (Conversational)',
      description: 'Conversational',
      value: 'eva',
    },
    {
      name: 'Geoff (Narration)',
      description: 'Narration',
      value: 'geoff',
    },
    {
      name: 'Gerald (Conversational)',
      description: 'Conversational',
      value: 'gerald',
    },
    {
      name: 'Gypsum (General)',
      description: 'General',
      value: 'gypsum',
    },
    {
      name: 'Hank (General)',
      description: 'General',
      value: 'hank',
    },
    {
      name: 'Helen (General)',
      description: 'General',
      value: 'helen',
    },
    {
      name: 'Hera (Conversational)',
      description: 'Conversational',
      value: 'hera',
    },
    {
      name: 'Jen (General)',
      description: 'General',
      value: 'jen',
    },
    {
      name: 'Joe (Narration)',
      description: 'Narration',
      value: 'joe',
    },
    {
      name: 'Joy (Conversational)',
      description: 'Conversational',
      value: 'joy',
    },
    {
      name: 'Juan (Conversational)',
      description: 'Conversational',
      value: 'juan',
    },
    {
      name: 'Kendra (General)',
      description: 'General',
      value: 'kendra',
    },
    {
      name: 'Kendrick (General)',
      description: 'General',
      value: 'kendrick',
    },
    {
      name: 'Kenneth (General)',
      description: 'General',
      value: 'kenneth',
    },
    {
      name: 'Kevin (Conversational)',
      description: 'Conversational',
      value: 'kevin',
    },
    {
      name: 'Kris (General)',
      description: 'General',
      value: 'kris',
    },
    {
      name: 'Linda (Conversational)',
      description: 'Conversational',
      value: 'linda',
    },
    {
      name: 'Madison (Conversational)',
      description: 'Conversational',
      value: 'madison',
    },
    {
      name: 'Marge (General)',
      description: 'General',
      value: 'marge',
    },
    {
      name: 'Marina (General)',
      description: 'General',
      value: 'marina',
    },
    {
      name: 'Marissa (Conversational)',
      description: 'Conversational',
      value: 'marissa',
    },
    {
      name: 'Marta (Conversational)',
      description: 'Conversational',
      value: 'marta',
    },
    {
      name: 'Maya (General)',
      description: 'General',
      value: 'maya',
    },
    {
      name: 'Nicholas (Conversational)',
      description: 'Conversational',
      value: 'nicholas',
    },
    {
      name: 'Nyles (General)',
      description: 'General',
      value: 'nyles',
    },
    {
      name: 'Phil (General)',
      description: 'General',
      value: 'phil',
    },
    {
      name: 'Reba (General)',
      description: 'General',
      value: 'reba',
    },
    {
      name: 'Rex (General)',
      description: 'General',
      value: 'rex',
    },
    {
      name: 'Rick (General)',
      description: 'General',
      value: 'rick',
    },
    {
      name: 'Ritu (General)',
      description: 'General',
      value: 'ritu',
    },
    {
      name: 'Rob (General)',
      description: 'General',
      value: 'rob',
    },
    {
      name: 'Rodney (Conversational)',
      description: 'Conversational',
      value: 'rodney',
    },
    {
      name: 'Rohan (General)',
      description: 'General',
      value: 'rohan',
    },
    {
      name: 'Rosco (General)',
      description: 'General',
      value: 'rosco',
    },
    {
      name: 'Samantha (Narration)',
      description: 'Narration',
      value: 'samantha',
    },
    {
      name: 'Sandy (General)',
      description: 'General',
      value: 'sandy',
    },
    {
      name: 'Selena (Conversational)',
      description: 'Conversational',
      value: 'selena',
    },
    {
      name: 'Seth (General)',
      description: 'General',
      value: 'seth',
    },
    {
      name: 'Sharon (General)',
      description: 'General',
      value: 'sharon',
    },
    {
      name: 'Stan (Conversational)',
      description: 'Conversational',
      value: 'stan',
    },
    {
      name: 'TJ (General)',
      description: 'General',
      value: 'tj',
    },
    {
      name: 'Tamra (Narration)',
      description: 'Narration',
      value: 'tamra',
    },
    {
      name: 'Tanya (Conversational)',
      description: 'Conversational',
      value: 'tanya',
    },
    {
      name: 'Tibur (General)',
      description: 'General',
      value: 'tibur',
    },
    {
      name: 'Tyler (Conversational)',
      description: 'Conversational',
      value: 'tyler',
    },
    {
      name: 'Viv (General)',
      description: 'General',
      value: 'viv',
    },
    {
      name: 'Yadira (Conversational)',
      description: 'Conversational',
      value: 'yadira',
    },
    {
      name: 'Zest (General)',
      description: 'General',
      value: 'zest',
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

export const V2V_URL = 'https://demo.rteappbuilder.com/v2v-prod';

// Get Rime language data based on connection type and model
export function getRimeLangDataByConnection(
  useRestTTS: boolean,
  model: RimeModelType,
): LanguageData[] {
  // For Rime MistV2 model
  if (model === 'mistv2') {
    // WebSocket mode: only English and Spanish
    if (!useRestTTS) {
      return rimeMistv2WebSocketLangData;
    }
    // REST API mode: all Rime languages
    return rimeLangData;
  }
  
  // For Arcana model: always use all Rime languages (REST API only)
  return rimeLangData;
}

// Check if a language is valid for the current connection type and model
export function isLanguageValidForConnection(
  language: LanguageType,
  useRestTTS: boolean,
  model: RimeModelType,
): boolean {
  const availableLanguages = getRimeLangDataByConnection(useRestTTS, model);
  return availableLanguages.some(lang => lang.value === language);
}
