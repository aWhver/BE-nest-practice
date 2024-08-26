import * as crypto from 'crypto';

export const md5 = function (str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};

export const formatTime = function (
  date: number | Date,
  format = 'y-m-d h:i:s',
) {
  let time: Date;
  if (typeof date === 'number' && String(date).length === 13) {
    time = new Date(date);
  } else {
    time = date as Date;
  }
  const timeobj = {
    y: time.getFullYear(),
    m: time.getMonth() + 1,
    d: time.getDate(),
    h: time.getHours(),
    i: time.getMinutes(),
    s: time.getSeconds(),
    w: time.getDay(),
  };

  return format.replace(/(y|m|d|h|i|s)/gi, (key, result) => {
    let value = timeobj[key.toLocaleLowerCase()];
    if (key.toLocaleLowerCase() === 'w')
      return '星期' + ['一', '二', '三', '四', '五', '六', '日'][value - 1];
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return String(value || 0);
  });
};
