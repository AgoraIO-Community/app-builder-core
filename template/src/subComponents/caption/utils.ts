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
  | 'en-US'
  | 'hi-IN'
  | 'zh-CN'
  | 'zh-HK'
  | 'fr-FR'
  | 'de-DE'
  | 'ko-KR'
  | 'en-IN'
  | 'ar'
  | 'ja-JP'
  | 'pt-PT'
  | 'es-ES'
  | 'it-IT'
  | 'id-ID'
  | '';

interface LanguageData {
  label: string;
  value: LanguageType;
}

export const langData: LanguageData[] = [
  {label: 'English (US)', value: 'en-US'},
  {label: 'English (India)', value: 'en-IN'},
  {label: 'Hindi', value: 'hi-IN'},
  {label: 'Chinese (Simplified)', value: 'zh-CN'},
  {label: 'Chinese (Traditional)', value: 'zh-HK'},
  {label: 'Arabic', value: 'ar'},
  {label: 'French', value: 'fr-FR'},
  {label: 'German', value: 'de-DE'},
  {label: 'Japanese', value: 'ja-JP'},
  {label: 'Korean', value: 'ko-KR'},
  {label: 'Portuguese', value: 'pt-PT'},
  {label: 'Spanish', value: 'es-ES'},
  {label: 'Italian', value: 'it-IT'},
  {label: 'Indonesian', value: 'id-ID'},
];

export function getLanguageLabel(
  languageCode: LanguageType[],
): string | undefined {
  const langLabels = languageCode.map((langCode) => {
    return langData.find((data) => data.value === langCode).label;
  });
  return langLabels ? langLabels.join(',') : undefined;
}
