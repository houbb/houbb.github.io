---
layout: post
title: leetcode bit operator 位运算
date:  2020-6-8 15:13:08 +0800
categories: [Algorithm]
tags: [algorithm, data-struct, bit-operator, sf]
published: true
---


# 

# chat

## 是什么？

Java 中的位运算是对整数类型（`byte`, `short`, `int`, `long`）的二进制位进行操作的一种运算方式。位运算通常用于底层编程、优化性能、加密算法等领域。Java 提供了多种位运算符，下面是对这些运算符的详细介绍：

### 1. **按位与 (`&`)**

按位与运算符对两个操作数的每一位进行与操作。如果对应的位都为 `1`，结果为 `1`，否则为 `0`。

**示例**:
```java
int a = 5;   // 0101
int b = 3;   // 0011
int result = a & b;  // 0001
System.out.println(result);  // 输出 1
```
**解释**: 5（二进制 `0101`）和 3（二进制 `0011`）按位与的结果是 1（二进制 `0001`）。

### 2. **按位或 (`|`)**

按位或运算符对两个操作数的每一位进行或操作。如果对应的位有一个为 `1`，结果为 `1`，否则为 `0`。

**示例**:
```java
int a = 5;   // 0101
int b = 3;   // 0011
int result = a | b;  // 0111
System.out.println(result);  // 输出 7
```
**解释**: 5（二进制 `0101`）和 3（二进制 `0011`）按位或的结果是 7（二进制 `0111`）。

### 3. **按位异或 (`^`)**

按位异或运算符对两个操作数的每一位进行异或操作。如果对应的位不同，则结果为 `1`，相同则为 `0`。

**示例**:
```java
int a = 5;   // 0101
int b = 3;   // 0011
int result = a ^ b;  // 0110
System.out.println(result);  // 输出 6
```
**解释**: 5（二进制 `0101`）和 3（二进制 `0011`）按位异或的结果是 6（二进制 `0110`）。

### 4. **按位取反 (`~`)**

按位取反运算符将操作数的每一位都反转，即 `0` 变 `1`，`1` 变 `0`。

**示例**:
```java
int a = 5;   // 0101
int result = ~a;  // 1010
System.out.println(result);  // 输出 -6
```
**解释**: 5（二进制 `0101`）按位取反后得到 -6（二进制 `1010`，补码表示）。注意，由于 Java 中的整数是用补码表示的，结果是负数。

### 5. **左移 (`<<`)**

左移运算符将操作数的二进制位向左移动指定的位数，左移后低位补 `0`。左移相当于乘以 `2` 的 `n` 次方（`n` 为移位数）。

**示例**:
```java
int a = 5;   // 0101
int result = a << 1;  // 1010
System.out.println(result);  // 输出 10
```
**解释**: 5（二进制 `0101`）左移 1 位后得到 10（二进制 `1010`），即 `5 * 2^1 = 10`。

### 6. **右移 (`>>`)**

右移运算符将操作数的二进制位向右移动指定的位数。右移时，符号位（对于负数）会保持不变，其他位会被丢弃。

**示例**:
```java
int a = 5;   // 0101
int result = a >> 1;  // 0010
System.out.println(result);  // 输出 2
```
**解释**: 5（二进制 `0101`）右移 1 位后得到 2（二进制 `0010`），即 `5 / 2^1 = 2`。

### 7. **无符号右移 (`>>>`)**

无符号右移运算符将操作数的二进制位向右移动指定的位数。无符号右移与右移的区别在于，它不考虑符号位，无论是正数还是负数，都会用 `0` 来填充高位。

**示例**:
```java
int a = -5;  // 11111111111111111111111111111011
int result = a >>> 1;  // 01111111111111111111111111111101
System.out.println(result);  // 输出 2147483643
```
**解释**: `-5` 的二进制表示为补码形式 `11111111111111111111111111111011`，无符号右移 1 位后得到 `2147483643`，高位补充 `0`。

### 8. **移位运算与溢出**

移位操作对于大整数值会造成溢出，尤其是使用 `<<` 和 `>>` 时。Java 的 `int` 类型是 32 位，超出范围时会截断。需要注意的是，移位位数大于等于位数长度（例如 32 位整数移位 32 位或更多）时，会产生未定义的行为。

### 9. **位运算的应用**

- **性能优化**: 位运算通常比算术运算（如乘法、除法）更高效。比如，左移 `n` 位相当于乘以 `2^n`，右移 `n` 位相当于除以 `2^n`。
- **判断奇偶**: 判断一个数是否为奇数可以通过 `x & 1`，如果结果为 `1`，则 `x` 是奇数。
- **交换两个数**: 通过异或运算可以交换两个数的值而不需要临时变量：
    ```java
    a = a ^ b;
    b = a ^ b;
    a = a ^ b;
    ```

位运算虽然简单，但由于其底层性质，常常用在需要高效、精确控制的场景中。

## leetcode 经典题目

位运算在 LeetCode 中有许多经典的题目，它们常用于优化算法、减少时间复杂度以及解决某些特殊问题。下面列举了一些经典的 LeetCode 题目，它们都涉及到位运算：

### 1. **[LeetCode 136. Single Number](https://leetcode.com/problems/single-number/)**
   **题目描述**: 给定一个非空整数数组，每个元素都出现两次，只有一个元素出现一次。找出这个唯一的元素。

   **解法**: 使用位运算中的 **异或**（`^`）。异或的性质是：相同的数字异或结果为 0，0 和任何数字异或结果为该数字本身。所以异或所有元素，最后的结果就是那个只出现一次的数字。

   **代码**:
   ```java
   public int singleNumber(int[] nums) {
       int result = 0;
       for (int num : nums) {
           result ^= num;  // 将所有元素进行异或
       }
       return result;
   }
   ```

   **时间复杂度**: O(n)，其中 n 是数组的长度。
   
   **空间复杂度**: O(1)，只用了常数空间。

---

### 2. **[LeetCode 137. Single Number II](https://leetcode.com/problems/single-number-ii/)**
   **题目描述**: 给定一个整数数组 `nums`，其中每个元素出现三次，除了一个元素只出现一次。找出这个唯一的元素。

   **解法**: 使用位运算的 **计数法**。可以通过记录每一位出现的次数来找到只出现一次的数字。通过和 3 取模来找到那一位为 1 的数字。

   **代码**:
   ```java
   public int singleNumber(int[] nums) {
       int ones = 0, twos = 0;
       for (int num : nums) {
           ones = (ones ^ num) & ~twos;
           twos = (twos ^ num) & ~ones;
       }
       return ones;
   }
   ```

   **时间复杂度**: O(n)，其中 n 是数组的长度。
   
   **空间复杂度**: O(1)，只用了常数空间。

---

### 3. **[LeetCode 191. Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/)**
   **题目描述**: 编写一个函数，输入一个无符号整数 `n`，返回其二进制表示中 `1` 的个数。

   **解法**: 使用 **位运算** 来判断每一位是否为 1，可以通过不断与 1 做 **按位与运算**，然后右移，直到数字变为 0。

   **代码**:
   ```java
   public int hammingWeight(int n) {
       int count = 0;
       while (n != 0) {
           count += n & 1;  // 如果当前最低位是 1，则计数器加 1
           n >>>= 1;         // 无符号右移
       }
       return count;
   }
   ```

   **时间复杂度**: O(32)，因为 `n` 是 32 位的整数。

   **空间复杂度**: O(1)。

---

### 4. **[LeetCode 268. Missing Number](https://leetcode.com/problems/missing-number/)**
   **题目描述**: 给定一个包含 `n` 个数字的数组，数字范围从 `0` 到 `n`，请找出这个数组中缺失的那个数字。

   **解法**: 使用 **异或运算**。对于一个包含数字 `0` 到 `n` 的数组，所有数字与它们的索引异或后，最后的结果就是缺失的那个数字。

   **代码**:
   ```java
   public int missingNumber(int[] nums) {
       int result = nums.length;  // 初始时将结果设为 n
       for (int i = 0; i < nums.length; i++) {
           result ^= i ^ nums[i];
       }
       return result;
   }
   ```

   **时间复杂度**: O(n)，其中 n 是数组的长度。
   
   **空间复杂度**: O(1)。

---

### 5. **[LeetCode 462. Minimum Moves to Equal Array Elements II](https://leetcode.com/problems/minimum-moves-to-equal-array-elements-ii/)**
   **题目描述**: 给定一个整数数组，求最小的移动次数，使得数组中的所有元素都变成一样的数。每次移动可以使一个元素增加或减少 1。

   **解法**: 通过 **位运算**，在中位数附近的元素最接近相同，所以使用 **中位数** 来解决该问题。

   **代码**:
   ```java
   public int minMoves2(int[] nums) {
       Arrays.sort(nums);
       int median = nums[nums.length / 2];
       int moves = 0;
       for (int num : nums) {
           moves += Math.abs(num - median);
       }
       return moves;
   }
   ```

   **时间复杂度**: O(n log n)，需要对数组进行排序。
   
   **空间复杂度**: O(1)。

---

### 6. **[LeetCode 260. Single Number III](https://leetcode.com/problems/single-number-iii/)**
   **题目描述**: 给定一个整数数组 `nums`，其中有两个元素只出现一次，其他元素出现两次。找出这两个只出现一次的数字。

   **解法**: 使用 **异或运算**。首先通过异或所有元素得到这两个唯一元素的异或结果，然后通过分组的方式找出这两个数字。

   **代码**:
   ```java
   public int[] singleNumber(int[] nums) {
       int xor = 0;
       for (int num : nums) {
           xor ^= num;  // 先对所有元素进行异或
       }
       int rightmostBit = xor & (-xor);  // 获取异或结果的最低位 1
       int[] result = new int[2];
       for (int num : nums) {
           if ((num & rightmostBit) != 0) {
               result[0] ^= num;  // 低位 1 分组
           } else {
               result[1] ^= num;  // 低位 0 分组
           }
       }
       return result;
   }
   ```

   **时间复杂度**: O(n)，其中 n 是数组的长度。
   
   **空间复杂度**: O(1)。

---

### 7. **[LeetCode 405. Convert a Number to Hexadecimal](https://leetcode.com/problems/convert-a-number-to-hexadecimal/)**
   **题目描述**: 给定一个整数 `num`，将其转换为十六进制字符串。你需要使用最少的字符。

   **解法**: 可以通过 **位运算** 按 4 位分割，逐步计算出十六进制字符串。

   **代码**:
   ```java
   public String toHex(int num) {
       if (num == 0) return "0";
       StringBuilder sb = new StringBuilder();
       char[] hex = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};
       while (num != 0) {
           sb.append(hex[num & 15]);  // 获取最低四位并转为十六进制字符
           num >>>= 4;  // 无符号右移四位
       }
       return sb.reverse().toString();
   }
   ```

   **时间复杂度**: O(log n)，其中 n 是整数 `num` 的大小。

   **空间复杂度**: O(1)。

---

### 总结

位运算在 LeetCode 中的应用非常广泛，特别是在需要优化时间复杂度或者处理与二进制位相关的问题时。

通过掌握异或、按位与、按位或、右移和左移等位运算技巧，可以有效地解决一系列看似复杂的问题，尤其是在处理数组、位图和数字特性时。


## leetcode 中的经典题目

位运算在 LeetCode 中有许多经典的题目，它们常用于优化算法、减少时间复杂度以及解决某些特殊问题。

下面列举了一些经典的 LeetCode 题目，它们都涉及到位运算：

### 1. **[LeetCode 136. Single Number](https://leetcode.com/problems/single-number/)**
   **题目描述**: 给定一个非空整数数组，每个元素都出现两次，只有一个元素出现一次。找出这个唯一的元素。

   **解法**: 使用位运算中的 **异或**（`^`）。
   
   异或的性质是：相同的数字异或结果为 0，0 和任何数字异或结果为该数字本身。所以异或所有元素，最后的结果就是那个只出现一次的数字。

   **代码**:
   ```java
   public int singleNumber(int[] nums) {
       int result = 0;
       for (int num : nums) {
           result ^= num;  // 将所有元素进行异或
       }
       return result;
   }
   ```

   **时间复杂度**: O(n)，其中 n 是数组的长度。
   
   **空间复杂度**: O(1)，只用了常数空间。

---

### 2. **[LeetCode 137. Single Number II](https://leetcode.com/problems/single-number-ii/)**
   **题目描述**: 给定一个整数数组 `nums`，其中每个元素出现三次，除了一个元素只出现一次。找出这个唯一的元素。

   **解法**: 使用位运算的 **计数法**。可以通过记录每一位出现的次数来找到只出现一次的数字。通过和 3 取模来找到那一位为 1 的数字。

   **代码**:
   ```java
   public int singleNumber(int[] nums) {
       int ones = 0, twos = 0;
       for (int num : nums) {
           ones = (ones ^ num) & ~twos;
           twos = (twos ^ num) & ~ones;
       }
       return ones;
   }
   ```

   **时间复杂度**: O(n)，其中 n 是数组的长度。
   
   **空间复杂度**: O(1)，只用了常数空间。

---

### 3. **[LeetCode 191. Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/)**
   **题目描述**: 编写一个函数，输入一个无符号整数 `n`，返回其二进制表示中 `1` 的个数。

   **解法**: 使用 **位运算** 来判断每一位是否为 1，可以通过不断与 1 做 **按位与运算**，然后右移，直到数字变为 0。

   **代码**:
   ```java
   public int hammingWeight(int n) {
       int count = 0;
       while (n != 0) {
           count += n & 1;  // 如果当前最低位是 1，则计数器加 1
           n >>>= 1;         // 无符号右移
       }
       return count;
   }
   ```

   **时间复杂度**: O(32)，因为 `n` 是 32 位的整数。

   **空间复杂度**: O(1)。

---

### 4. **[LeetCode 268. Missing Number](https://leetcode.com/problems/missing-number/)**
   **题目描述**: 给定一个包含 `n` 个数字的数组，数字范围从 `0` 到 `n`，请找出这个数组中缺失的那个数字。

   **解法**: 使用 **异或运算**。对于一个包含数字 `0` 到 `n` 的数组，所有数字与它们的索引异或后，最后的结果就是缺失的那个数字。

   **代码**:
   ```java
   public int missingNumber(int[] nums) {
       int result = nums.length;  // 初始时将结果设为 n
       for (int i = 0; i < nums.length; i++) {
           result ^= i ^ nums[i];
       }
       return result;
   }
   ```

   **时间复杂度**: O(n)，其中 n 是数组的长度。
   
   **空间复杂度**: O(1)。

---

### 5. **[LeetCode 462. Minimum Moves to Equal Array Elements II](https://leetcode.com/problems/minimum-moves-to-equal-array-elements-ii/)**
   **题目描述**: 给定一个整数数组，求最小的移动次数，使得数组中的所有元素都变成一样的数。每次移动可以使一个元素增加或减少 1。

   **解法**: 通过 **位运算**，在中位数附近的元素最接近相同，所以使用 **中位数** 来解决该问题。

   **代码**:
   ```java
   public int minMoves2(int[] nums) {
       Arrays.sort(nums);
       int median = nums[nums.length / 2];
       int moves = 0;
       for (int num : nums) {
           moves += Math.abs(num - median);
       }
       return moves;
   }
   ```

   **时间复杂度**: O(n log n)，需要对数组进行排序。
   
   **空间复杂度**: O(1)。

---

### 6. **[LeetCode 260. Single Number III](https://leetcode.com/problems/single-number-iii/)**
   **题目描述**: 给定一个整数数组 `nums`，其中有两个元素只出现一次，其他元素出现两次。找出这两个只出现一次的数字。

   **解法**: 使用 **异或运算**。首先通过异或所有元素得到这两个唯一元素的异或结果，然后通过分组的方式找出这两个数字。

   **代码**:
   ```java
   public int[] singleNumber(int[] nums) {
       int xor = 0;
       for (int num : nums) {
           xor ^= num;  // 先对所有元素进行异或
       }
       int rightmostBit = xor & (-xor);  // 获取异或结果的最低位 1
       int[] result = new int[2];
       for (int num : nums) {
           if ((num & rightmostBit) != 0) {
               result[0] ^= num;  // 低位 1 分组
           } else {
               result[1] ^= num;  // 低位 0 分组
           }
       }
       return result;
   }
   ```

   **时间复杂度**: O(n)，其中 n 是数组的长度。
   
   **空间复杂度**: O(1)。

---

### 7. **[LeetCode 405. Convert a Number to Hexadecimal](https://leetcode.com/problems/convert-a-number-to-hexadecimal/)**
   **题目描述**: 给定一个整数 `num`，将其转换为十六进制字符串。你需要使用最少的字符。

   **解法**: 可以通过 **位运算** 按 4 位分割，逐步计算出十六进制字符串。

   **代码**:
   ```java
   public String toHex(int num) {
       if (num == 0) return "0";
       StringBuilder sb = new StringBuilder();
       char[] hex = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};
       while (num != 0) {
           sb.append(hex[num & 15]);  // 获取最低四位并转为十六进制字符
           num >>>= 4;  // 无符号右移四位
       }
       return sb.reverse().toString();
   }
   ```

   **时间复杂度**: O(log n)，其中 n 是整数 `num` 的大小。

   **空间复杂度**: O(1)。

---

## 记忆的技巧

理解和记住位运算确实有一定难度，尤其是当它们在日常工作中不常用时。以下是一些帮助记忆和应用位运算的技巧：

### 1. **理解基本原理与运算性质**
   位运算的核心是操作二进制位，掌握一些基本的运算性质可以帮助你记住它们的作用：
   - **异或**（`^`）: 相同的数字异或结果是 0，0 和任何数字异或是该数字本身。这种对称性可以帮助你记住它的用途（如找出唯一的数字）。
   - **按位与**（`&`）: 只有当两个位都为 1 时结果才是 1，常用于检查特定位。
   - **按位或**（`|`）: 只要有一个位是 1，结果就是 1，常用于合并状态或标记。
   - **左移/右移**（`<<`, `>>`）: 左移相当于乘以 2 的幂，右移相当于除以 2 的幂。

### 2. **通过例子加深记忆**
   在学习位运算时，实际操作几个简单例子非常有帮助。比如，手动做几个异或、与、或、移位的题目，逐步分析每一步的运算过程。这可以帮助你直观地理解每种运算的作用。

### 3. **理解位运算在实际问题中的应用**

   位运算通常用于以下几种场景，理解这些场景有助于记住常见的使用模式：
   
   - **去重和唯一元素**: 如单一数字问题（异或运算），通过异或运算找出只出现一次的元素。
   - **状态标记**: 使用位运算可以高效地管理多个布尔值，如通过按位与或按位或合并多个标志位。
   - **优化算法**: 位运算有时可以取代较慢的算术运算（如左移代替乘法，右移代替除法）。

### 4. **练习与反复应用**

   虽然位运算很抽象，但通过不断的练习可以逐渐变得熟悉。
   
   比如，可以尝试做一些相关的 LeetCode 题目，或者在项目中找机会用位运算解决一些问题。这样可以加深对位运算的理解和记忆。

### 5. **记住一些常用模式**

   有些位运算的用法在问题中是非常常见的，可以把它们当作模板记住：

   - **检查奇偶**: `x & 1` 检查 `x` 是否为奇数。
   - **交换两个数**: `a = a ^ b; b = a ^ b; a = a ^ b;`
   - **找出二进制中最右侧的 1**: `x & -x`
   - **无符号右移**: `x >>> 1` 将 `x` 无符号右移一位。

* any list
{:toc}