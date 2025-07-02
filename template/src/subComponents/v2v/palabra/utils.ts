// Palabra language types and utils (placeholder)
export type PalabraLanguageType = string; // Replace with actual type if needed

export type LanguageType =
  | 'en' // English
  | 'fr' // French
  | 'ja' // Japanese
  | 'es' // Spanish
  | 'de' // German
  | 'hi' // Hindi
  | '';

interface LanguageData {
  label: string;
  value: LanguageType;
}

export const langData: LanguageData[] = [
  {label: 'English', value: 'en'},
  {label: 'French', value: 'fr'},
  {label: 'German', value: 'de'},
  {label: 'Japanese', value: 'ja'},
  {label: 'Spanish', value: 'es'},
  {label: 'Hindi', value: 'hi'},
];

export const getPalabraSupportedLanguages = () => [
  'en',
  'es',
  'fr',
  'de',
  'zh',
  'ja',
  'ko',
  'ru',
  'ar',
  'pt',
  'it',
  'nl',
  'tr',
  'pl',
  'uk',
  'cs',
  'da',
  'fi',
  'el',
  'he',
  'hu',
  'id',
  'ro',
  'sk',
  'sv',
  'vi',
  'bg',
  'es_MX',
  'en_GB',
  'pt_BR',
];
