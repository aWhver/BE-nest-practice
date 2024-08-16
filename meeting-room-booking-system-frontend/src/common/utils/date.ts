export const formatTime = function(
  date: Date | number,
  format = 'y-m-d h:i:s'
) {
  let time = date;
  if (String(date).length === 13) {
    // 传入的是时间戳
    time = new Date(date);
  }

  const timeObj: Record<string, number> = {
    y: (time as Date).getFullYear(),
    m: (time as Date).getMonth() + 1,
    d: (time as Date).getDate(),
    h: (time as Date).getHours(),
    i: (time as Date).getMinutes(),
    s: (time as Date).getSeconds(),
    w: (time as Date).getDay(),
  };
  const timeStr = format.replace(/(y|m|d|h|i|s|w)+/g, function(
    result,
    key: string
  ) {
    let value: string | number = timeObj[key];
    if (key === 'w')
      return '星期' + ['一', '二', '三', '四', '五', '六', '日'][value - 1];
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return String(value || 0);
  });

  return timeStr;
};
