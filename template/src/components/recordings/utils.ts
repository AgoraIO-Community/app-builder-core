import Toast from '../../../react-native-toast-message';

export function getRecordedDate(ipDate: string) {
  let rdate = new Date(ipDate);
  let ryear = rdate.getFullYear();
  let rmonth = rdate.getMonth() + 1;
  let rdt = rdate.getDate();
  const hour = rdate.getHours();
  const minute = rdate.getMinutes();
  const formattedHHMM = `${String(hour).padStart(2, '0')}:${String(
    minute,
  ).padStart(2, '0')}`;

  let today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  let compDate = new Date(ryear, rmonth - 1, rdt); // month - 1 because January == 0
  let diff = today.getTime() - compDate.getTime(); // get the difference between today(at 00:00:00) and the date

  if (compDate.getTime() == today.getTime()) {
    return `Today\n${formattedHHMM}`;
  } else if (diff <= 24 * 60 * 60 * 1000) {
    return `Yesterday\n${formattedHHMM}`;
  } else {
    let fulldate = rdate.toDateString();
    fulldate = fulldate.substring(fulldate.indexOf(' ') + 1);
    return `${fulldate}\n${formattedHHMM}`;
  }
}

const showLinkCopiedToast = () => {
  Toast.show({
    leadingIconName: 'info',
    type: 'info',
    text1: 'Link copied',
    visibilityTime: 100000,
  });
};
