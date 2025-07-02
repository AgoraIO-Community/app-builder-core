// Palabra language types and utils (updated for Palabra)

// Source language codes (from Palabra SDK)
export type SourceLanguageType =
  | 'auto'
  | 'ar'
  | 'zh'
  | 'cs'
  | 'da'
  | 'nl'
  | 'en'
  | 'fi'
  | 'fr'
  | 'de'
  | 'el'
  | 'he'
  | 'hi'
  | 'hu'
  | 'id'
  | 'it'
  | 'ja'
  | 'ko'
  | 'pl'
  | 'pt'
  | 'ru'
  | 'es'
  | 'tr'
  | 'uk'
  | 'sv'
  | 'sk'
  | 'bg'
  | 'ro'
  | 'ba'
  | 'eu'
  | 'be'
  | 'bn'
  | 'ca'
  | 'hr'
  | 'eo'
  | 'et'
  | 'gl'
  | 'ia'
  | 'ga'
  | 'lv'
  | 'lt'
  | 'ms'
  | 'mt'
  | 'mr'
  | 'mn'
  | 'no'
  | 'fa'
  | 'sl'
  | 'sw'
  | 'ta'
  | 'th'
  | 'ur'
  | 'ug'
  | 'vi'
  | 'cy';

// Target language codes (from Palabra SDK)
export type TargetLanguageType =
  | 'ar-sa'
  | 'ar-ae'
  | 'zh'
  | 'zh-hant'
  | 'en-gb'
  | 'en-us'
  | 'fr'
  | 'de'
  | 'hi'
  | 'id'
  | 'it'
  | 'ja'
  | 'ko'
  | 'pt'
  | 'pt-br'
  | 'ru'
  | 'es'
  | 'es-mx'
  | 'tr'
  | 'uk'
  | 'sv'
  | 'pl'
  | 'nl'
  | 'fi'
  | 'hu'
  | 'el'
  | 'cs'
  | 'da'
  | 'bg'
  | 'ro'
  | 'sk';

export interface LanguageData {
  label: string;
  value: string;
}

// Source languages for dropdown (main, not hidden/experimental)
export const sourceLangData: LanguageData[] = [
  {label: 'Auto', value: 'auto'},
  {label: 'Arabic', value: 'ar'},
  {label: 'Chinese', value: 'zh'},
  {label: 'Czech', value: 'cs'},
  {label: 'Danish', value: 'da'},
  {label: 'Dutch', value: 'nl'},
  {label: 'English', value: 'en'},
  {label: 'Finnish', value: 'fi'},
  {label: 'French', value: 'fr'},
  {label: 'German', value: 'de'},
  {label: 'Greek', value: 'el'},
  {label: 'Hebrew', value: 'he'},
  {label: 'Hindi', value: 'hi'},
  {label: 'Hungarian', value: 'hu'},
  {label: 'Indonesian', value: 'id'},
  {label: 'Italian', value: 'it'},
  {label: 'Japanese', value: 'ja'},
  {label: 'Korean', value: 'ko'},
  {label: 'Polish', value: 'pl'},
  {label: 'Portuguese', value: 'pt'},
  {label: 'Russian', value: 'ru'},
  {label: 'Spanish', value: 'es'},
  {label: 'Turkish', value: 'tr'},
  {label: 'Ukrainian', value: 'uk'},
  {label: 'Swedish', value: 'sv'},
  {label: 'Slovak', value: 'sk'},
  {label: 'Bulgarian', value: 'bg'},
  {label: 'Romanian', value: 'ro'},
];

// Target languages for dropdown (main, not hidden/experimental)
export const targetLangData: LanguageData[] = [
  {label: 'Arabic (Saudi)', value: 'ar-sa'},
  {label: 'Arabic (UAE)', value: 'ar-ae'},
  {label: 'Chinese (Simplified)', value: 'zh'},
  {label: 'Chinese (Traditional)', value: 'zh-hant'},
  {label: 'English (British)', value: 'en-gb'},
  {label: 'English (US)', value: 'en-us'},
  {label: 'French', value: 'fr'},
  {label: 'German', value: 'de'},
  {label: 'Hindi', value: 'hi'},
  {label: 'Indonesian', value: 'id'},
  {label: 'Italian', value: 'it'},
  {label: 'Japanese', value: 'ja'},
  {label: 'Korean', value: 'ko'},
  {label: 'Portuguese', value: 'pt'},
  {label: 'Portuguese (Brazilian)', value: 'pt-br'},
  {label: 'Russian', value: 'ru'},
  {label: 'Spanish', value: 'es'},
  {label: 'Spanish (Mexican)', value: 'es-mx'},
  {label: 'Turkish', value: 'tr'},
  {label: 'Ukrainian', value: 'uk'},
  {label: 'Swedish', value: 'sv'},
  {label: 'Polish', value: 'pl'},
  {label: 'Dutch', value: 'nl'},
  {label: 'Finnish', value: 'fi'},
  {label: 'Hungarian', value: 'hu'},
  {label: 'Greek', value: 'el'},
  {label: 'Czech', value: 'cs'},
  {label: 'Danish', value: 'da'},
  {label: 'Bulgarian', value: 'bg'},
  {label: 'Romanian', value: 'ro'},
  {label: 'Slovak', value: 'sk'},
];
