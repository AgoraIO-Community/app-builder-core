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
