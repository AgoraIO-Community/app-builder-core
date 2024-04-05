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

export const getFileName = (url: string) => {
  return url.split('#')[0].split('?')[0].split('/').pop();
};

export const downloadRecording = (url: string) => {
  const fileName = getFileName(url);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function (_) {
    var blob = new Blob([xhr.response], {type: 'video/mp4'});
    // render `blob` url ✅
    const downloadUrl = URL.createObjectURL(blob);
    // anchor element to download
    const anchor = document.createElement('a');
    anchor.setAttribute('download', fileName);
    anchor.href = downloadUrl;
    // click to dowload the file
    anchor.click();
    // revoke download url
    URL.revokeObjectURL(downloadUrl);
  };
  xhr.send();
  // fetch(url, {method: 'get', mode: 'no-cors', referrerPolicy: 'no-referrer'})
  //   .then(res => res.blob())
  //   .then(res => {
  //     const anchor = document.createElement('a');
  //     anchor.setAttribute('download', fileName);
  //     const downloadUrl = URL.createObjectURL(res);
  //     anchor.href = downloadUrl;
  //     anchor.setAttribute('target', '_blank');
  //     anchor.click();
  //     URL.revokeObjectURL(downloadUrl);
  //   })
  //   .catch(error => {
  //     console.log('supriya error', error); // OUTPUT ERRORS, SUCH AS CORS WHEN TESTING NON LOCALLY
  //   });
};
