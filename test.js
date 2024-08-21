/* 现场编程题题目内容：
只出现一次的数字。
给你一个 非空 整数数组 nums ，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。
你必须设计并实现线性时间复杂度的算法来解决此问题，且该算法只使用常量额外空间。
示例 1 ：
输入：nums = [2,2,1]
输出：1

示例 2 ：
输入：nums = [4,1,2,1,2]
输出：4

示例 3 ：
输入：nums = [1]
输出：1 */
/* function uniqueNum (nums) {
  const obj = {};
  nums.forEach(num => {
    if (!obj[num]) {
      // map.set(num, 1)
      obj[num] = 1;
    } else {
      // map.delete(num);
      delete obj[num];
    }
  });

  return Object.keys(obj)[0]
} */

function uniqueNum (nums) {
  let ans = 0;
  nums.forEach(num => {
   ans = ans ^ num;
  });

  return ans;
}
console.log('arg: [4,1,2,1,2]', uniqueNum([4,1,2,1,2]));
console.log('arg: [1]', uniqueNum([1]));
console.log('arg: [2,1,2]', uniqueNum([2,1,2]));