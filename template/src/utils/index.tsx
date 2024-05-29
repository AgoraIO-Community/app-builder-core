import {isWebInternal} from './common';

const Buffer = require('buffer/').Buffer;
type Entry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

export function filterObject<T extends object>(
  obj: T,
  fn: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean,
) {
  return Object.fromEntries(
    (Object.entries(obj) as Entry<T>[]).filter(fn),
  ) as Partial<T>;
}

export function kFormatter(num: number) {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.round(Math.abs(num) / 100) / 10) + 'k'
    : Math.sign(num) * Math.abs(num);
}

export function numFormatter(num: number) {
  if (num === null || num === 0) {
    return '0';
  }
  const value = Math.abs(num);
  const sign = Math.sign(num);
  let newValue: string | number = value;
  if (value >= 1000) {
    var suffixes = ['', 'k', 'm', 'b', 't', 't+'];
    var suffixNum = Math.floor(('' + value).length / 3);
    var shortValue;
    for (var precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum != 0
          ? value / Math.pow(1000, suffixNum)
          : value
        ).toPrecision(precision),
      );
      var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
      if (dotLessShortValue.length <= 2) {
        break;
      }
    }
    if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
    newValue = shortValue + suffixes[suffixNum];
  }
  newValue = sign === -1 ? `-${newValue}` : `${newValue}`;
  return newValue;
}

export function isEmptyObject(obj: object) {
  if (obj == null) return true;
  if (typeof obj !== 'object') return true;
  for (const key in obj) {
    return false;
  }
  return true;
}

export const randomNameGenerator = (num: number) => {
  let res = '';
  for (let i = 0; i < num; i++) {
    const random = Math.floor(Math.random() * 10);
    res += String.fromCharCode(97 + random);
  }
  return res;
};
export function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
export function isURL(str) {
  if (!str) {
    return false;
  }
  var urlRegex =
    '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  var url = new RegExp(urlRegex, 'i');
  return str.length < 2083 && url.test(str);
}

export const base64ToUint8Array = (base64Str: string) => {
  let decodedData;

  decodedData = Buffer.from(base64Str, 'base64').toString('binary');

  if (isWebInternal()) {
    const result: Uint8Array = new Uint8Array(
      new ArrayBuffer(decodedData.length),
    );
    for (let i = 0; i < decodedData.length; i += 1) {
      result[i] = decodedData.charCodeAt(i);
    }
    return result;
  } else {
    const result: number[] = [];
    for (let i = 0; i < decodedData.length; i++) {
      result.push(decodedData.charCodeAt(i));
    }
    return result;
  }
};

export function timeAgo(timestamp: number) {
  const now = new Date().getTime();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else {
    return 'just now';
  }
}

export const containsOnlyEmojis = (text: string) => {
  const emojiRegex =
    /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}\s]/gu;
  return (
    emojiRegex.test(text) &&
    !/[^\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}\s]/gu.test(
      text,
    )
  );
};
