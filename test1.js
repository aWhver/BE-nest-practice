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

console.log('ans', getMaxCountChar(['AAAABBCDHHH', 'ISDHFSHFDAASDIAHSD', 'EEEEEEE']));
console.log('ans', getMaxCountChar(['F', 'GRGYUIDKHDYO', 'GGGGGGGONGGGGG']));