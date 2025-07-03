// Palabra language types and utils (updated for Palabra)
import {sourceLanguages, targetLanguages} from '@palabra-ai/translator';

export type SourceLanguageType = (typeof sourceLanguages)[number]['code'];
export type TargetLanguageType = (typeof targetLanguages)[number]['code'];

export interface LanguageData {
  label: string;
  value: string;
}

// Source languages for dropdown (main, not hidden/experimental)
export const sourceLangData: LanguageData[] = sourceLanguages
  .filter(lang => ('hidden' in lang ? !lang.hidden : true))
  .map(lang => ({label: lang.label, value: lang.code}));

// Target languages for dropdown (main, not hidden/experimental)
export const targetLangData: LanguageData[] = targetLanguages
  .filter(lang => ('hidden' in lang ? !lang.hidden : true))
  .map(lang => ({label: lang.label, value: lang.code}));
