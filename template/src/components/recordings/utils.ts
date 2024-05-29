export function getRecordedDateTime(ipDate: string) {
  try {
    let rdate = new Date(ipDate);
    let ryear = rdate.getFullYear();
    if (ryear === 1) {
      throw Error(`Invalid end date, ${ipDate}`);
    }
    let rmonth = rdate.getMonth() + 1;
    let rdt = rdate.getDate();
    let hour = rdate.getHours();
    let minute = rdate.getMinutes();
    let ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    minute = minute < 10 ? minute : minute;

    const formattedHHMM = `${String(hour)}:${String(minute).padStart(
      2,
      '0',
    )} ${ampm}`;

    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    let compDate = new Date(ryear, rmonth - 1, rdt); // month - 1 because January == 0
    let diff = today.getTime() - compDate.getTime(); // get the difference between today(at 00:00:00) and the date

    if (compDate.getTime() == today.getTime()) {
      return ['Today', `${formattedHHMM}`];
    } else if (diff <= 24 * 60 * 60 * 1000) {
      return ['Yesterday', `${formattedHHMM}`];
    } else {
      let fulldate = rdate.toDateString();
      fulldate = fulldate.substring(fulldate.indexOf(' ') + 1);
      return [fulldate, `${formattedHHMM}`];
    }
  } catch (error) {
    console.error('error while converting recorded time: ', error);
    return ipDate;
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

export const getDuration = (start: string, end: string): string => {
  try {
    const date_future = new Date(end).valueOf();
    if (date_future < 0) {
      throw new Error(`Not a valid end date, ${end}`);
    }
    const date_now = new Date(start).valueOf();
    let delta = Math.abs(date_future - date_now) / 1000;
    // calculate (and subtract) whole days
    const days = Math.floor(delta / 86400);
    delta -= days * 86400;
    // calculate (and subtract) whole hours
    const hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    // calculate (and subtract) whole minutes
    const minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    // what's left is seconds
    const seconds = Math.floor(delta) % 60;

    // console.log(`date ${hours}:${minutes}:${seconds}`);
    let formattedHHMM = '';
    if (seconds) {
      formattedHHMM = `${String(seconds)}s`;
    }
    if (minutes) {
      formattedHHMM = `${String(minutes)}m ${String(seconds)}s`;
    }
    if (hours) {
      formattedHHMM = `${String(hours)}h ${String(minutes)}m ${String(
        seconds,
      )}s`;
    }
    return formattedHHMM;
  } catch (error) {
    return '-';
  }
};
