import * as crypto from 'crypto';

export const md5 = function (str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};
