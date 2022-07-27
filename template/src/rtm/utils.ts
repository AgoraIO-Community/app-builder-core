export const hasJsonStructure = (str: string) => {
  if (typeof str !== 'string') return false;
  try {
    const result = JSON.parse(str);
    const type = Object.prototype.toString.call(result);
    return type === '[object Object]' || type === '[object Array]';
  } catch (err) {
    return false;
  }
};

export const safeJsonParse = (str: string) => {
  try {
    return [null, JSON.parse(str)];
  } catch (err) {
    return [err];
  }
};

export const adjustUID = (uid: number): number => {
  let adjustedUID = uid;
  if (adjustedUID < 0) {
    adjustedUID = uid + parseInt('0xffffffff') + 1;
  }
  return adjustedUID;
};

export const timeNow = () => new Date().getTime();
