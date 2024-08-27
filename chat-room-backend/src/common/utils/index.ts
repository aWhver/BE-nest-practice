import * as crypto from 'crypto';

export const md5 = function (str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};

export const generateCaptcha = function () {
  let str = '';
  for (let i = 0; i < 6; i++) {
    str += (Math.random() * 10) | 0;
  }
  return str;
};
