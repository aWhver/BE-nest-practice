/* 题目描述
给你一个字符串，只包含大写字母，求同一字母连续出现的最大次数。例如”AAAABBCDHHH”，同一字母连续出现的最大次数为4，因为一开始A连续出现了4次。

解答要求
时间限制：1000ms, 内存限制：100MB
输入
每组输入第一行有一个整数cases(1<=cases<=100)，表示有cases个测试数据。
接下来每行有一个子串(1<长度<=100)。

输出
输出对应每个子串同一字母连续出现的最大次数。

样例
输入样例 1 复制

3
AAAABBCDHHH
ISDHFSHFDAASDIAHSD
EEEEEEE
输出样例

4
2
7 */
function getMaxCountChar(chars) {
  return chars.map(calcCount);
}
// 'F'
function calcCount(char) {
  // const map = new Map();
  let max = 0;
  let prechar = '';
  let count = 1;
  for (let i = 0, len = char.length; i < len; i++) {
    if (char[i] !== prechar) {
      max = Math.max(max, count);
      count = 1;
      prechar = char[i];
    } else {
      count++;
    }
  }
  max = Math.max(max, count);

  return max;
}

// console.log('ans', getMaxCountChar(['AAAABBCDHHH', 'ISDHFSHFDAASDIAHSD', 'EEEEEEE']));
// console.log('ans', getMaxCountChar(['F', 'GRGYUIDKHDYO', 'GGGGGGGONGGGGG']));


function fn1(intervals1, intervals2) {
  let result = [...intervals1];
  for (let i = 0; i < intervals2.length; i++) {
    const [start2, end2] = intervals2[i];
    for (let j = 0; j < result.length; ) {
      const [start1, end1] = result[j];
      // 区间无交集情况
      if (end1 < start2 || start1 > end2) {
        j++;
        continue;
      }
      // 有交集情况，进行处理
      if (start1 < start2) {
        if (end1 < end2) {
          result[j][1] = start2;
          j++;
        } else {
          result.splice(j, 1, [start1, start2], [end2, end1]);
          j += 2;
        }
      } else {
        if (end1 < end2) {
          result.splice(j, 1, [end1, end2]);
        } else {
          result[j][0] = end2;
          j++;
        }
      }
    }
  }
  const uniqueResult = [];
  for (const interval of result) {
    if (!uniqueResult.length || interval[0]!== uniqueResult[uniqueResult.length - 1][1]) {
      uniqueResult.push(interval);
    } else {
      uniqueResult[uniqueResult.length - 1][1] = interval[1];
    }
  }
  return uniqueResult;
  // return result;
}
function fn(intervals1, intervals2) {
  let result = [...intervals1];
  for (let i = 0; i < intervals2.length; i++) {
    const [start2, end2] = intervals2[i];
    for (let j = 0; j < result.length; ) {
      const [start1, end1] = result[j];
      // 区间无交集情况
      if (end1 < start2 || start1 > end2) {
        j++;
        continue;
      }
      // 有交集情况，进行处理
      if (start1 < start2) {
        if (end1 < end2) {
          result[j][1] = start2;
          j++;
        } else {
          result.splice(j, 1, [start1, start2], [end2, end1]);
          j += 2;
        }
      } else {
        if (end1 < end2) {
          result.splice(j, 1, [end1, end2]);
        } else {
          result[j][0] = end2;
          j++;
        }
      }
    }
  }
  // 去重并处理开始和结束值一致的区间
  const uniqueResult = [];
  for (const interval of result) {
    if (!uniqueResult.length || interval[0] > uniqueResult[uniqueResult.length - 1][1]) {
      if (interval[0]!== interval[1]) {
        uniqueResult.push(interval);
      }
    } else {
      uniqueResult[uniqueResult.length - 1][1] = Math.max(uniqueResult[uniqueResult.length - 1][1], interval[1]);
    }
  }
  return uniqueResult;
}
// function fn(intervals1, intervals2) {
  // intervals1， intervals1是排序好的区间集合
  // 找出intervals1，intervals2的交集
  // 将交集从intervals1中截取掉得到新的intervals
  // 例子：
  // intervals1： [[10, 20], [50, 80], [100, 160]]
  // intervals2: [[40, 55], [150, 180]]
  // intervals: [[10, 20], [55, 80], [100, 150]]
// }
console.log('result', fn([[10, 20], [50, 80], [100, 160]], [[40, 55], [150, 180]]));
console.log('result', fn([[10, 20], [50, 80], [100, 160]], [[40, 55]]));
console.log('result', fn([[10, 20], [50, 80], [100, 160]], [[30, 40]]));
console.log('result', fn([[10, 20], [50, 80], [100, 160]], [[15, 55]]));
console.log('result', fn([[10, 20], [50, 80], [100, 160]], [[15, 155]]));
console.log('result', fn([[10, 20], [50, 80], [100, 160]], [[9, 190]]));
console.log('result', fn([[10, 20], [50, 80], [100, 160]], [[9, 13], [25, 35], [40, 110]]));