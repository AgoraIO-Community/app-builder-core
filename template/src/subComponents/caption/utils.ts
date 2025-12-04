import {ContentObjects} from '../../../agora-rn-uikit/src/Contexts/RtcContext';
import {TranscriptItem, LanguageTranslationConfig} from './useCaption';

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  //const s = d.getSeconds().toString().padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  const H = h % 12 || 12;
  return `${H}:${m} ${suffix}`;
}

/**
 * Check if translation configuration has changed
 * Compares source language and target languages between two configs
 * @param prev - Previous translation configuration
 * @param next - New translation configuration
 * @returns true if config has changed, false otherwise
 */
export const hasConfigChanged = (
  prev: LanguageTranslationConfig,
  next: LanguageTranslationConfig,
): boolean => {
  const sourceChanged =
    (prev.source || []).sort().join(',') !==
    (next.source || []).sort().join(',');
  const targetsChanged =
    (prev.targets || []).sort().join(',') !==
    (next.targets || []).sort().join(',');
  return sourceChanged || targetsChanged;
};

export type LanguageType =
  | 'ar-EG'
  | 'ar-JO'
  | 'ar-SA'
  | 'ar-AE'
  | 'bn-IN'
  | 'zh-CN'
  | 'zh-HK'
  | 'zh-TW'
  | 'nl-NL'
  | 'en-IN'
  | 'en-US'
  | 'fil-PH'
  | 'fr-FR'
  | 'de-DE'
  | 'gu-IN'
  | 'he-IL'
  | 'hi-IN'
  | 'id-ID'
  | 'it-IT'
  | 'ja-JP'
  | 'kn-IN'
  | 'ko-KR'
  | 'ms-MY'
  | 'fa-IR'
  | 'pt-PT'
  | 'ru-RU'
  | 'es-ES'
  | 'ta-IN'
  | 'te-IN'
  | 'th-TH'
  | 'tr-TR'
  | 'vi-VN'
  | '';

interface LanguageData {
  label: string;
  value: LanguageType;
}

export const langData: LanguageData[] = [
  {label: 'Arabic (EG)', value: 'ar-EG'},
  {label: 'Arabic (JO)', value: 'ar-JO'},
  {label: 'Arabic (SA)', value: 'ar-SA'},
  {label: 'Arabic (UAE)', value: 'ar-AE'},
  {label: 'Bengali (IN)', value: 'bn-IN'},
  {label: 'Chinese', value: 'zh-CN'},
  {label: 'Chinese (HK)', value: 'zh-HK'},
  {label: 'Chinese (TW)', value: 'zh-TW'},
  {label: 'Dutch', value: 'nl-NL'},
  {label: 'English (IN)', value: 'en-IN'},
  {label: 'English (US)', value: 'en-US'},
  {label: 'Filipino', value: 'fil-PH'},
  {label: 'French', value: 'fr-FR'},
  {label: 'German', value: 'de-DE'},
  {label: 'Gujarati', value: 'gu-IN'},
  {label: 'Hebrew', value: 'he-IL'},
  {label: 'Hindi', value: 'hi-IN'},
  {label: 'Indonesian', value: 'id-ID'},
  {label: 'Italian', value: 'it-IT'},
  {label: 'Japanese', value: 'ja-JP'},
  {label: 'Kannada', value: 'kn-IN'},
  {label: 'Korean', value: 'ko-KR'},
  {label: 'Malay', value: 'ms-MY'},
  {label: 'Persian', value: 'fa-IR'},
  {label: 'Portuguese', value: 'pt-PT'},
  {label: 'Russian', value: 'ru-RU'},
  {label: 'Spanish', value: 'es-ES'},
  {label: 'Tamil', value: 'ta-IN'},
  {label: 'Telugu', value: 'te-IN'},
  {label: 'Thai', value: 'th-TH'},
  {label: 'Turkish', value: 'tr-TR'},
  {label: 'Vietnamese', value: 'vi-VN'},
];

export function getLanguageLabel(
  languageCode: LanguageType[],
): string | undefined {
  const langLabels = languageCode.map(langCode => {
    return langData.find(data => data.value === langCode)?.label;
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

export const formatTranscriptContent = (
  meetingTranscript: TranscriptItem[],
  meetingTitle: string,
  defaultContent: ContentObjects,
) => {
  // Helper function to get display text based on stored translation language
  // Uses the translation language that was active when this transcript item was created
  const getDisplayText = (item: TranscriptItem): string => {
    // Use the stored translation language from when this item was created
    const storedTranslationLanguage = item.selectedTranslationLanguage;

    if (!storedTranslationLanguage || !item.translations) {
      return item.text; // no translation selected or no translations available, show original
    }

    // find translation for the stored language
    const currentTranslation = item.translations.find(
      t => t.lang === storedTranslationLanguage,
    );
    if (currentTranslation?.text) {
      return currentTranslation.text;
    }

    // if stored language not available, show original
    return item.text;
  };

  const formattedContent = meetingTranscript
    .map(item => {
      if (
        item.uid.toString().includes('langUpdate') ||
        item.uid.toString().includes('translationUpdate')
      ) {
        // return `${defaultContent[item?.uid?.split('-')[1]]?.name} ${item.text}`;
        return item.text;
      }

      const speakerName = defaultContent[item.uid]?.name || 'Speaker';

      // Original
      let entry = `${speakerName}:\n${item.text}`;

      // Selected Translation
      const storedLang = item.selectedTranslationLanguage;
      const selectedTranslation = storedLang
        ? item.translations?.find(t => t.lang === storedLang) || null
        : null;
      if (selectedTranslation) {
        const langLabel =
          langData.find(l => l.value === selectedTranslation.lang)?.label ||
          selectedTranslation.lang;

        entry += `\n→ (${langLabel}) ${selectedTranslation.text}`;
      }

      return entry;
    })
    .join('\n\n');

  const startTime = formatDateWithTimeZone(
    new Date(meetingTranscript[0]?.time),
  );

  const attendees = Object.entries(defaultContent)
    .filter(([uid, user]) => {
      const uidNum = Number(uid);

      const isBot =
        uidNum === 111111 || // STT bot (web)
        uidNum > 900000000 || // STT bots (native)
        uidNum === 100000 || // Recording bot (web user)
        uidNum === 100001; // Recording bot (web screen)

      const isWaitingRoom = user?.isInWaitingRoom === true;

      return user.type === 'rtc' && !isBot && !isWaitingRoom;
    })
    .map(([_, user]) => user.name)
    .join(',');

  const info =
    'This editable transcript was computer generated and might contain errors. People can also change\nthe text after it was created.';
  const finalContent = `${meetingTitle} (${startTime}) - Transcript \n\nParticipants\n${attendees} \n\nTranscript\n${info} \n\n${formattedContent}`;

  // to give unique file name
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10);
  const formattedTime = currentDate
    .toTimeString()
    .slice(0, 8)
    .replace(/:/g, '');

  // adding the filename
  const fileName = `MeetingTranscript_${formattedDate}_${formattedTime}.txt`;

  return [finalContent, fileName];
};

/**
 * Get the appropriate caption text to display based on the user's source/spoken language
 * For other users' captions: shows translation matching user's source/spoken language
 * For current user's captions: shows original text
 * Falls back to original text if translation is not available
 *
 * @param captionText - The original caption text
 * @param translations - Array of available translations
 * @param viewerSourceLanguage - The user's source (spoken) language
 * @returns The appropriate caption text to display
 */
export const getUserTranslatedText = (
  captionText: string,
  translations: Array<{lang: string; text: string; isFinal: boolean}> = [],
  sourceLanguage: LanguageType,
  selectedTranslationLanguage: LanguageType,
  // speakerUid: string | number,
  // currentUserUid: string | number,
): {
  value: string;
  langLabel: string;
} => {
  // console.log(
  //   'getUserTranslatedText input params',
  //   captionText,
  //   translations,
  //   viewerSourceLanguage,
  //   speakerUid,
  //   currentUserUid,
  // );

  // 1. If the speaker is the local user, always show their own source text
  if (!selectedTranslationLanguage) {
    return {
      value: captionText,
      langLabel: getLanguageLabel([sourceLanguage]) || '',
    };
  }

  // For other users' captions, try to find translation matching viewer's source language
  if (selectedTranslationLanguage && translations && translations.length > 0) {
    const matchingTranslation = translations.find(
      t => t.lang === selectedTranslationLanguage,
    );
    if (matchingTranslation) {
      // Translation exists (even if empty)
      // - If text is empty: show nothing (don’t fallback)
      // - If text exists: show it
      const translatedText = matchingTranslation.text?.trim() || '';
      return {
        value: translatedText,
        langLabel: getLanguageLabel([selectedTranslationLanguage]) || '',
      };
    }
  }

  // Fallback to original text if no translation found
  return {
    value: captionText,
    langLabel: 'Original',
  };
};

export interface TranslateConfig {
  source_lang: string;
  target_lang: string[];
}

export const mergeTranslationConfigs = (
  existingTranslateConfig: TranslateConfig[],
  userOwnLanguages: LanguageType[],
  selectedTranslationLanguage: string,
): TranslateConfig[] => {
  // Create new translate_config for user's own languages
  const newTranslateConfigs = userOwnLanguages.map(spokenLang => ({
    source_lang: spokenLang,
    target_lang: [selectedTranslationLanguage],
  }));

  // Merge with existing configuration
  const mergedTranslateConfig = [...existingTranslateConfig];

  newTranslateConfigs.forEach(newConfig => {
    const existingIndex = mergedTranslateConfig.findIndex(
      existing => existing.source_lang === newConfig.source_lang,
    );

    if (existingIndex !== -1) {
      // Same source language - merge target languages
      const existingTargets = mergedTranslateConfig[existingIndex].target_lang;
      const mergedTargets = [
        ...new Set([...existingTargets, ...newConfig.target_lang]),
      ];
      mergedTranslateConfig[existingIndex] = {
        ...mergedTranslateConfig[existingIndex],
        target_lang: mergedTargets,
      };
    } else {
      // Different source language - add new config
      mergedTranslateConfig.push(newConfig);
    }
  });

  return mergedTranslateConfig;
};
