---
layout: post
title: sort-10-bigfile sort 大文件外部排序
date:  2016-07-14 17:22:22 +0800
categories: [Algorithm]
tags: [sort]
published: true
---

# 排序系列

[sort-00-排序算法汇总](https://houbb.github.io/2016/07/14/sort-00-overview-sort)

[sort-01-bubble sort 冒泡排序算法详解](https://houbb.github.io/2016/07/14/sort-01-bubble-sort)

[sort-02-QuickSort 快速排序到底快在哪里？](https://houbb.github.io/2016/07/14/sort-02-quick-sort)

[sort-03-SelectSort 选择排序算法详解](https://houbb.github.io/2016/07/14/sort-03-select-sort)

[sort-04-heap sort 堆排序算法详解](https://houbb.github.io/2016/07/14/sort-04-heap-sort)

[sort-05-insert sort 插入排序算法详解](https://houbb.github.io/2016/07/14/sort-05-insert-sort)

[sort-06-shell sort 希尔排序算法详解](https://houbb.github.io/2016/07/14/sort-06-shell-sort)

[sort-07-merge sort 归并排序](https://houbb.github.io/2016/07/14/sort-07-merge-sort)

[sort-08-counting sort 计数排序](https://houbb.github.io/2016/07/14/sort-08-counting-sort)

[sort-09-bucket sort 桶排序](https://houbb.github.io/2016/07/14/sort-09-bucket-sort)

[sort-10-bigfile 大文件外部排序](https://houbb.github.io/2016/07/14/sort-10-bigfile-sort)



# 大文件排序

基于文件拆分的排序方法通常涉及将大文件分割成多个小部分，然后对这些小部分分别进行排序，最后再将排序后的小部分合并为一个有序的整体。

这种方法特别适合于处理不能一次性加载到内存中的大文件。

1. **拆分文件**：首先，把大文件分割成多个小文件。这就像是把一本厚厚的电话号码本拆分成几个小册子，每个小册子包含一部分电话号码。

2. **独立排序**：接着，对每个小文件进行单独的排序处理。由于每个小文件的大小都比原始大文件小，因此可以采用任何适合的排序算法（如快速排序、归并排序等）来完成排序。这一步骤就像是给每个小册子里的电话号码排序。

3. **合并排序**：各个小文件排序完成后，就需要将它们合并回一个大的有序文件。这个过程需要仔细处理，以确保合并后的文件是有序的。这就像是把几个按姓氏排序好的小册子合并回一本按姓氏排序的大电话号码本。

4. **优化合并**：在合并过程中，可以使用归并排序的策略，即每次取每个小文件的首条记录比较，将最小的记录写入结果文件，并从该记录所在的小文件中取出下一个记录继续比较，重复此过程直到所有小文件都被遍历完毕。

这种基于文件拆分的排序方式非常适合处理大规模数据集，因为它可以有效地利用内存和磁盘空间，减少单个排序算法在处理大型数据集时可能遇到的性能瓶颈。

同时，它也适用于分布式计算环境，因为每个小文件的排序可以独立进行，甚至可以并行处理以加快排序速度。

在实际应用中，这种方法的一个典型实现是外部排序，它广泛用于数据库管理和文件系统，以处理存储在磁盘上的大规模数据集。

# 复杂度

这个核心思想还是归并排序。

## 归并排序（Merge Sort）

**时间复杂度：O(n log n)**

归并排序是一种分治算法，它将文件分成两半，递归地对这两半进行排序，然后将排序好的两半合并。

整个过程中，每个元素都会被合并一次，而合并过程是线性的，所以总的时间复杂度是O(n log n)。

**空间复杂度：O(n)**

归并排序需要额外的空间来存储合并过程中的临时数组。

在最坏的情况下，这个额外空间的大小与原始文件的大小相同，因此空间复杂度是O(n)。

## 合并过程

在基于文件拆分排序的场景中，合并过程通常是归并排序的一部分，其时间复杂度是O(n)，因为每个元素都会被访问一次。

但是，如果合并过程涉及到从磁盘读取数据，那么实际的时间复杂度将受到磁盘I/O操作的影响，这可能会大大增加算法的总运行时间。

# 核心实现

```java
package com.github.houbb.sort.core.api.file;

import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.heaven.util.io.FileUtil;
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.sort.api.IFileSort;
import com.github.houbb.sort.core.exception.SortException;

import java.io.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
public class BigFileSort implements IFileSort {

    // 基础属性省略...

    /**
     * 排序
     * @param sourceFile 原始文件
     * @param targetFile 目标文件
     * @since 0.1.0
     */
    @Override
    public void sort(String sourceFile,
                     String targetFile) {
        //...

        //2. 文件拆分
        splitSourceFile(sourceFile);

        //3. 合并文件
        mergeFiles(0, sourceFile, targetFile);

        //...
    }


    /**
     * 合并文件
     * @param level 层级
     * @param sourceFile 原始文件
     * @param targetFile 目标文件
     */
    private void mergeFiles(int level,
                            String sourceFile,
                            String targetFile) {
        try {
            final String tempDirPath = getSourceTempDir(sourceFile);

            // 临时文件夹
            File tempDir = new File(tempDirPath);
            File[] files = tempDir.listFiles();
            if (files.length <= 1) {
                // 复制到结果文件
                copyFile(files[0], targetFile);
                files[0].delete();
                return;
            }

            int index = 0;
            int nextLevel = level+1;
            //  2 2合并，并将文件之后放在下一个 level
            int i = 0;
            for (i = 0; i < files.length - 1; i += 2) {
                String fileName = tempDirPath + "tmp_" + nextLevel + "_" + index++;
                mergeTwoFiles(fileName, files[i], files[i + 1]);
                files[i].delete();
                files[i + 1].delete();
            }
            // 还剩一个单独的，修改名称直接放在下一个 level
            if (i == files.length - 1) {
                copyFile(files[i], tempDirPath + "tmp_" + nextLevel + "_" + index++);
                files[i].delete();
            }

            // 递归处理
            mergeFiles(level+1, sourceFile, targetFile);
        } catch (IOException e) {
            throw new SortException(e);
        }
    }


    // 这里的 copy 可以简化为 rename，更加简单。性能更好
    private void copyFile(File file, String fileName) throws IOException {
        File file1 = new File(fileName);
        BufferedReader reader1 = new BufferedReader(new FileReader(file));
        BufferedWriter writer = new BufferedWriter(new FileWriter(file1));
        String n1 = reader1.readLine();
        while (n1 != null){
            writer.write(n1);
            writer.newLine();
            n1 = reader1.readLine();
        }
        reader1.close();
        writer.close();
    }

    private void mergeTwoFiles(String fileName, File file1, File file2) throws IOException {
        File file = new File(fileName);
        BufferedReader reader1 = new BufferedReader(new FileReader(file1));
        BufferedReader reader2 = new BufferedReader(new FileReader(file2));
        BufferedWriter writer = new BufferedWriter(new FileWriter(file));
        String n1 = reader1.readLine();
        String n2 = reader2.readLine();
        // 按照大小顺序合并写入
        while (n1 != null && n2 != null){
            if (n1.compareTo(n2) <= 0) {
                writer.write(n1);
                writer.newLine();
                n1 = reader1.readLine();
            }else{
                writer.write(n2);
                writer.newLine();
                n2 = reader2.readLine();
            }
        }
        while (n1 != null){
            writer.write(n1);
            writer.newLine();
            n1 = reader1.readLine();
        }
        while (n2 != null){
            writer.write(n2);
            writer.newLine();
            n2 = reader2.readLine();
        }
        reader1.close();
        reader2.close();
        writer.close();
    }

    /**
     * 对原始文件进行拆分
     * @param sourceFilePath 源文件
     */
    private void splitSourceFile(String sourceFilePath) {
        try {
            final String tempDirName = getSourceTempDir(sourceFilePath);

            BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(sourceFilePath)));
            int i = 0;
            int count = 0;
            String num = "";
            List<String> list = new ArrayList<>();
            while ( (num = br.readLine()) != null){
                list.add(num);
                count++;
                if (count == limitLines){
                    String filePath = tempDirName + "tmp_0_" + i++;
                    Collections.sort(list);
                    FileUtil.write(filePath, list);
                    list.clear();
                    count = 0;
                }
            }

            // 如果不为空的话
            if(CollectionUtil.isNotEmpty(list)) {
                String filePath = tempDirName + "tmp_0_" + i++;
                Collections.sort(list);
                FileUtil.write(filePath, list);
                list.clear();
            }

            br.close();
        } catch (Exception e) {
            throw new SortException(e);
        }
    }

}
```

# 总结

这就像是我们在整理一个超级大的图书馆，但是这个图书馆的书太多了，我们不能一次性把所有的书都搬到桌子上来排序，所以我们得用一些特别的方法。

### 1. 分而治之

这个方法的核心思想是把大问题分解成小问题。

对于图书馆来说，就是把一大堆书分成几小堆，每堆书都比原来的大堆容易处理。在计算机世界里，我们会把一个大文件分割成多个小文件。

### 2. 各个击破

接下来，我们就对这些小堆的书一本本地进行排序。

因为每堆书都不大，我们可以直接用桌子上的空间来帮助排序，这就像是使用内存来对小文件进行排序。

### 3. 合并同类项

当所有小堆的书都排好序之后，我们就需要把这些小堆再次合并成大堆，但是要保持它们是有序的。这个过程就像是把排好序的小文件合并成一个有序的大文件。

### 磁盘I/O

因为书（文件）太多，我们不能全部放在桌子上（内存），所以需要不断地在书架（磁盘）和桌子（内存）之间搬动。

这个搬动的过程是很慢的，所以我们要尽量减少搬动的次数。

# 开源地址

为了便于大家学习，上面的排序已经开源，开源地址：

> [https://github.com/houbb/sort](https://github.com/houbb/sort)

欢迎大家 fork/star，鼓励一下作者~~

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

# 参考资料

[【排序】图解桶排序](https://blog.csdn.net/qq_27124771/article/details/87651495)

* any list
{:toc}