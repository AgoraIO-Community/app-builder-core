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
