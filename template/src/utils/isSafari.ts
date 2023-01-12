import {isWeb} from './common';

const isSafari = () => {
  if (
    isWeb() &&
    navigator.userAgent.search('Safari') >= 0 &&
    navigator.userAgent.search('Chrome') < 0
  ) {
    return true;
  }
  return false;
};
export default isSafari;
