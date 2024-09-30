---
layout: post
title: leetcode 51 - 217. Contains Duplicate 存在重复元素 哈希？位运算？插入排序？
date:  2020-1-23 10:09:32 +0800 
categories: [Algorithm]
tags: [algorithm, leetcode, hash, bit, sort, sh]
published: true
---

# 题目：

给你一个整数数组 nums 。如果任一值在数组中出现 至少两次 ，返回 true ；如果数组中每个元素互不相同，返回 false 。
 

示例 1：

输入：nums = [1,2,3,1]
输出：true
示例 2：

输入：nums = [1,2,3,4]
输出：false
示例 3：

输入：nums = [1,1,1,3,3,4,3,2,4,2]
输出：true
 

提示：

1 <= nums.length <= 10^5
-10^9 <= nums[i] <= 10^9


# 思路1-hash

## 思路

直接通过 hashSet 保存。

## java 实现

```java
public boolean containsDuplicate(int[] nums) {
    final Set<Integer> hashSet = new HashSet<>();
    for(int num : nums) {
        if(hashSet.contains(num)) {
            return true;
        }
        hashSet.add(num);
    }
    return false;
}
```

## 效果

```
time: Beats 83.52%of users with Java
mem: Beats 61.13%of users with Java
```

# 思路2-位运算

## 思路

重复元素，一般都会采用位运算的方式。

但是自己对位运算一直不太数量。

## Q: 介绍一下位运算

位运算是一种在二进制数的位级别上进行操作的运算。它直接处理二进制数的每一位，而不考虑数值的整体。位运算常用于计算机底层的操作，例如处理图像、编码解码、密码学等领域。

常见的位运算符包括：

1. 与运算（AND）：用符号  `&`  表示，对两个操作数的每一位进行逻辑与操作，只有在两个位都为1时，结果位才为1。
2. 或运算（OR）：用符号  `|`  表示，对两个操作数的每一位进行逻辑或操作，只要两个位中有一个为1，结果位就为1。
3. 异或运算（XOR）：用符号  `^`  表示，对两个操作数的每一位进行逻辑异或操作，当两个位不同时，结果位为1。
4. 非运算（NOT）：用符号  `~`  表示，对操作数的每一位进行逻辑非操作，将每一位取反。

除了上述基本的位运算符，还有一些其他常见的位运算操作，例如：

1. 左移运算（<<）：将操作数的二进制表示向左移动指定的位数，右边空出的位用0填充。
2. 右移运算（>>）：将操作数的二进制表示向右移动指定的位数，左边空出的位用符号位（对于有符号数）或0填充。
3. 无符号右移运算（>>>）：将操作数的二进制表示向右移动指定的位数，左边空出的位用0填充，不考虑符号位。

位运算在处理二进制数据、位掩码、位标志等方面非常有用。

它们可以高效地进行位级别的操作，对于一些特定的问题和优化需求，位运算可以提供更快速和高效的解决方案。

## Q: 如何通过位运算，判断一个数字是否重复出现？java 实现

在Java中，可以使用位运算来判断一个数字是否重复出现。

下面是一个示例的Java代码实现：

```java
public class DuplicateChecker {
    public static boolean hasDuplicate(int[] nums) {
        int checker = 0;
        for (int num : nums) {
            int mask = 1 << num;
            if ((checker & mask) != 0) {
                return true; // 数字重复出现
            }
            checker |= mask;
        }
        return false; // 数字没有重复出现
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5, 5}; // 示例数组，包含重复数字5
        boolean hasDuplicate = hasDuplicate(nums);
        System.out.println("是否存在重复数字: " + hasDuplicate);
    }
}
```

当使用位运算来判断一个数字是否重复出现时，可以使用一个整数变量作为位掩码，表示数字的出现情况。

下面是算法的详细解释：

1. 创建一个整数变量  `checker` ，初始值为0，用于记录数字的出现情况。
2. 遍历给定的整数数组  `nums` ，对于数组中的每个数字  `num` ：
   a. 创建一个位掩码  `mask` ，通过将数字1左移  `num`  位得到。
   b. 使用位与运算符  `&`  将  `checker`  和  `mask`  进行位与运算。如果结果不为0，表示数字已经出现过，说明存在重复数字，返回  `true` 。
   c. 如果结果为0，表示数字尚未出现过，将  `mask`  和  `checker`  进行位或运算，将该数字添加到  `checker`  中。
3. 如果整个数组遍历完毕都没有找到重复数字，则返回  `false` 。

通过将数字的出现情况用位掩码进行记录，我们可以快速判断某个数字是否重复出现。位运算的效率很高，因为它直接在二进制位上进行操作，不需要对整个数值进行计算。

在示例代码中，我们使用  `checker`  变量作为位掩码，并对数组  `[1, 2, 3, 4, 5, 5]`  进行判断。遍历数组时，数字5出现两次，因此最终返回  `true`  表示存在重复数字。

希望这样的解释对你有帮助！如果你有任何其他问题，请随时提问。

### 疑问1: int mask = 1 << num; 这个在 num 很大的时候，不会很慢吗？

是的，当  `num`  很大时，执行  `1 << num`  可能会导致性能下降。

位移操作的时间复杂度与位移的位数成正比，因此当  `num`  值很大时，位移操作可能需要较长的时间。

为了解决这个问题，可以考虑使用位运算的优化技巧，例如使用位掩码数组来代替位移操作。具体步骤如下：

1. 创建一个长度为  `n`  的  `boolean`  数组  `maskArray` ，其中  `n`  是数字范围的上限（例如，如果数字范围是0到10000，则  `n`  可以是10001）。
2. 遍历给定的整数数组  `nums` ，对于数组中的每个数字  `num` ：
   a. 如果  `maskArray[num]`  的值为  `true` ，表示数字已经出现过，说明存在重复数字，返回  `true` 。
   b. 如果  `maskArray[num]`  的值为  `false` ，将其设置为  `true` ，表示数字已经出现过。
3. 如果整个数组遍历完毕都没有找到重复数字，则返回  `false` 。

使用位掩码数组的优化方法可以避免大位移操作的性能问题，因为数组的长度是固定的，并且直接通过索引访问元素，不需要进行位移计算。

请注意，在使用位掩码数组时，需要根据数字范围的上限来确定数组的长度。如果数字范围很大，可能需要更多的内存来存储位掩码数组。

### 疑问2：为什么 checker & mask 不等于0就能说明数字重复？详细解释一下

在这个位运算的实现中， `checker`  是一个用于记录数字出现情况的位掩码。

每个数字在  `checker`  中对应着一位。

当某个数字第一次出现时，将对应的位设为1，表示该数字已经出现过。

如果一个数字重复出现，那么对应的位在  `checker`  中会被重复设置为1。

当执行  `(checker & mask) != 0`  时，实际上是在检查  `checker`  与  `mask`  进行位与运算的结果是否不等于0。

如果结果不为0，说明  `checker`  和  `mask`  在对应的位上都为1，表示该数字已经出现过。

反之，如果结果为0，说明  `checker`  和  `mask`  在对应的位上至少有一个为0，表示该数字尚未出现过。

因此，当  `(checker & mask) != 0`  成立时，就可以确定数字已经重复出现，返回  `true` 。

否则，将该数字添加到  `checker`  中，并继续遍历数组。

这种方法利用位运算的特性，通过位与运算来判断数字是否重复出现，避免了使用额外的数据结构。

但请注意，这种方法对于数字范围有一定的限制，因为  `checker`  的位数应足够大以容纳数组中的最大数字。

## 问题

发现上面的解法，在 leetcode 后面会报错：

```
Wrong Answer
47 / 75 testcases passed

这个用例直接失败。
```

# 思路3-他山之石

## 大佬的解法

看了下第一名的解法，是一个插入排序。

算法如下：

```java
class Solution {
    public boolean containsDuplicate(int[] nums) {
        int j = 0;
        int current = 0;
        for(int i = 1; i < nums.length; i++){
            j = i - 1;
            current = nums[i];
            while(j>=0 && current < nums[j]){
                nums[j+1] = nums[j];
                j--;
            }
            if(j>=0 && current == nums[j]){
                return true;
            }
            nums[j+1] = current;
        }
        return false;
    }
}
```

解释：

这段代码实现了一种插入排序算法，并用于判断给定的整数数组是否包含重复元素。

算法的原理如下：

1. 首先，定义两个变量  `j`  和  `current` ， `j`  用于记录当前元素的前一个位置， `current`  用于存储当前元素的值。

2. 从数组的第二个元素开始，通过一个循环遍历数组。在每次迭代中，将当前元素的前一个位置保存在  `j`  中，将当前元素的值保存在  `current`  中。

3. 在内部的 while 循环中，将  `current`  与  `nums[j]`  进行比较。如果  `current`  小于  `nums[j]` ，则将  `nums[j]`  后移一个位置，即将  `nums[j]`  的值赋给  `nums[j+1]` ，并将  `j`  减少 1。

4. 当  `current`  不再小于  `nums[j]`  或者  `j`  已经小于 0 时，跳出 while 循环。

5. 如果  `j`  不小于 0 且  `current`  等于  `nums[j]` ，则表示当前元素与之前的某个元素相等，即存在重复元素，返回 true。

6. 将  `current`  放置在正确的位置，即将  `current`  赋值给  `nums[j+1]` 。

7. 重复上述步骤，直到遍历完整个数组。

8. 如果在整个遍历过程中没有找到重复元素，则返回 false。

该算法的核心思想是通过将当前元素插入到已排序的子数组中的正确位置，来逐步构建有序的数组。

如果在插入过程中发现当前元素与之前的某个元素相等，则表示存在重复元素。

最后，根据是否存在重复元素，返回相应的结果。

## Q: 详细介绍一下插入排序？

插入排序（Insertion Sort）是一种简单直观的排序算法，它通过构建有序序列，对未排序的元素逐个进行插入，从而达到排序的目的。

插入排序的基本思想是将一个元素插入到已排序序列的适当位置，使得插入后的序列仍然有序。

插入排序的步骤如下：

1. 首先，将数组分为已排序区间和未排序区间。初始时，已排序区间只包含第一个元素，而未排序区间包含剩余的元素。

2. 从未排序区间中取出第一个元素，将其与已排序区间的元素逐个比较，找到合适的位置插入。

3. 在已排序区间中，从右向左依次比较元素，直到找到一个小于或等于当前元素的位置。

4. 将当前元素插入到找到的位置后面，即将该位置后面的元素都向右移动一个位置。

5. 重复步骤2至4，直到未排序区间中的所有元素都被插入到已排序区间中。

6. 完成上述步骤后，数组中的元素就按照从小到大的顺序排列。

插入排序的特点是稳定且原地排序（不需要额外的存储空间），适用于小规模数据或部分有序的数据。

然而，对于大规模数据或逆序数据，插入排序的效率较低，时间复杂度为O(n^2)。

在实际应用中，插入排序常常被用作其他排序算法的优化部分，或者用于对小规模数据进行排序。

## Q: 插入排序去重为什么会比哈希更好？

插入排序判重的性能优势主要在于以下几个方面：

1. 原地排序：插入排序是一种原地排序算法，不需要额外的存储空间。相比之下，哈希表需要额外的存储空间来存储元素的哈希值和索引，这会增加空间复杂度。

2. 简单的比较操作：插入排序只需要进行简单的比较操作来找到插入位置，而哈希表需要进行哈希计算和哈希冲突解决等复杂操作。在比较次数上，插入排序通常比哈希表更少。

3. 适用于小规模数据：插入排序在处理小规模数据时效率较高，而哈希表在处理小规模数据时可能会有较高的空间开销和哈希冲突的问题。

然而，需要注意的是，插入排序的判重性能更好的前提是数据量较小且有序性较高。对于大规模数据或乱序数据，哈希表通常更适合进行判重操作，因为哈希表的查找操作具有常数时间复杂度。

在LeetCode等竞赛性编程环境中，由于数据规模通常较小，插入排序判重的性能可能会比哈希表更好。

但在实际应用中，根据具体的数据规模和数据特点选择合适的判重方法是更为重要的考虑因素。


## 实际测试

```java
class Solution {
    
   public boolean containsDuplicate(int[] nums) {
        int j = 0;
        int current = 0;

        for(int i = 1; i < nums.length; i++) {
            j = i-1;
            current = nums[i];

            // 和左边的相比，一直循环到对应的位置。这个性能其实比较差
            while (j >= 0 && current < nums[j]) {
                // 不断的把 j 的位置右边移动一位。类似于 array 中左边要插入一个元素，在挪动出一个位置。
                // 其他 java 中，类似于 Arrays.copy 的话，性能应该会更好。

                nums[j+1] = nums[j];
                j--;
            }

            // 如果 current 不是最小的，且元素重复？
            // 这里其实做了一个赋值。
            if(j >=0 && current == nums[j]) {
                return true;
            }

            // 插入新当前的元素
            nums[j+1] = current;
        }


        return false;
    }

}
```

效果：

```
time: Beats 99.97%of users with Java

mem: Beats 5.97%of users with Java
```

# 思路4-插入排序的优化（@老马原创）

## 想法

插入排序在寻找的时候，因为是有序的，所以能否采用二分法直接找到插入的位置？

然后是移动的时候，能否直接使用类似于 arraylist 中的 Arrays.copy 来优化，而不是一个个移动？

### step1-二分法找到插入位置

```java
   public boolean containsDuplicate(int[] nums) {
        int j = 0;
        int current = 0;

        for(int i = 1; i < nums.length; i++) {
            j = i-1;
            current = nums[i];

            // 这里改成二分法的实现
            while (j >= 0 && current < nums[j]) {
                nums[j+1] = nums[j];
                j--;
            }

            if(j >=0 && current == nums[j]) {
                return true;
            }

            nums[j+1] = current;
        }


        return false;
    }
```


二分法实现如下：

```java
public boolean containsDuplicate(int[] nums) {
    int current = 0;
    for (int i = 1; i < nums.length; i++) {
        current = nums[i];

        // 如果大于最大的，则不需要判断
        // 如果不添加剪枝，性能反而会下降。
        if(current > nums[i-1]) {
            continue;    
        }

        int low = 0;
        int high = i - 1;

        // 二分法查找插入位置
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (current < nums[mid]) {
                high = mid - 1;
            } else if (current > nums[mid]) {
                low = mid + 1;
            } else {
                return true; // 存在重复元素
            }
        }
        // 将元素插入到正确的位置
        for (int j = i; j > low; j--) {
            nums[j] = nums[j - 1];
        }
        nums[low] = current;
    }
    return false; // 不存在重复元素
}
```

这里应该需要剪枝，不然性能反而不好。

### step2-使用 Arrays.copy，而不是移动

```java
public boolean containsDuplicate(int[] nums) {
    int current = 0;
    for (int i = 1; i < nums.length; i++) {
        current = nums[i];

        if(current > nums[i-1]) {
            continue;    
        }
        int low = 0;
        int high = i - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (current < nums[mid]) {
                high = mid - 1;
            } else if (current > nums[mid]) {
                low = mid + 1;
            } else {
                return true;
            }
        }

        // 这里改成用 Arrays.copy，而不是逐个移动。
        for (int j = i; j > low; j--) {
            nums[j] = nums[j - 1];
        }
        nums[low] = current;
    }

    return false;
}
```

如下：

```java
public boolean containsDuplicate(int[] nums) {
    int current = 0;
    for (int i = 1; i < nums.length; i++) {
        current = nums[i];

        if(current > nums[i-1]) {
            continue;    
        }
        if(current == nums[i-1]) {
            return true;    
        }

        int low = 0;
        int high = i - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (current < nums[mid]) {
                high = mid - 1;
            } else if (current > nums[mid]) {
                low = mid + 1;
            } else {
                return true;
            }
        }

        // 使用 Arrays.copyOfRange 方法替代逐个移动
        if (i > low) {
            System.arraycopy(nums, low, nums, low + 1, i - low);
        }
        nums[low] = current;
    }

    return false;
}
```

不过最后的结果感觉一般，并没有超越原来的实现？

感觉这一题的测试案例还是不够彻底，如果数量足够多，二分法应该会明显优于逐个运算才对。

## 性能对比

如何证明性能存在差异呢？

我们来构造一组数据：

数据量足够大。10W 条数据。然后对比上面的算法和最初的算法差异。

### 数据构造

```java
public static int[] buildTestNums() {
    int size = 100000;
    int[] nums = new int[size+1];
    int ix = 0;
    for(int i = size; i >= 0; i--) {
        nums[ix++] = i;
    }
    return nums;
}
```

## 测试

```java
public static void main(String[] args) {
    int[] nums = buildTestNums();
    int[] nums2 = buildTestNums();

    // 原始解法1
    long start1 = System.currentTimeMillis();
    T217_ContainsDuplicateV3InsertSort insertSort = new T217_ContainsDuplicateV3InsertSort();
    insertSort.containsDuplicate(nums);
    long end1 = System.currentTimeMillis();
    System.out.println("1=" + (end1-start1));

    // 原始解法2
    long start2 = System.currentTimeMillis();
    T217_ContainsDuplicateV4InsertSortOptimize optimize = new T217_ContainsDuplicateV4InsertSortOptimize();
    optimize.containsDuplicate(nums2);
    long end2 = System.currentTimeMillis();
    System.out.println("2=" + (end2-start2));
}
```

耗时如下：

```
1=976
2=311
```

第二种算法一般而言还是比第一种好的，只是测试用例太少。完全无法体现。

其实更加离谱的还是 hash 的效率竟然不如这个，测试下来其实是比较好的，估计还是用例问题。

# 小结

最基本思路是通过哈希去重。

然后提升性能会想到位运算，但是没想到位运算其实并不是最优的解法。

最好的解法竟然是插入排序。

令人意外的是，二分查找竟然没有提升性能？

# 参考资料

https://leetcode.com/problems/contains-duplicate/submissions/

* any list
{:toc}