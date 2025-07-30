import {ContentObjects} from '../../../agora-rn-uikit/src/Contexts/RtcContext';
import {TranscriptItem} from './useCaption';

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
    return langData.find(data => data.value === langCode).label;
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
  const formattedContent = meetingTranscript
    .map(item => {
      if (item.uid.toString().indexOf('langUpdate') !== -1) {
        return `${defaultContent[item?.uid?.split('-')[1]]?.name} ${item.text}`;
      }
      return `${defaultContent[item.uid].name} ${formatTime(
        Number(item?.time),
      )}:\n${item.text}`;
    })
    .join('\n\n');

  const startTime = formatDateWithTimeZone(
    new Date(meetingTranscript[0]?.time),
  );

  const attendees = Object.entries(defaultContent)
    .filter(
      arr =>
        arr[1].type === 'rtc' &&
        arr[0] !== '100000' && // exclude recording bot
        (arr[1]?.isInWaitingRoom === true ? false : true),
    )
    .map(arr => arr[1].name)
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
