---
layout: post 
title: 编程面试大学 
date: 2026-05-06 21:01:55 +0800
categories: [AI]
tags: [ai, context]
published: true
---


# 编程面试大学

最初我创建这个项目是为了列一个成为软件工程师的简短学习任务清单，但它逐渐发展成了你今天看到的这个庞大列表。

按照这份学习计划完成后，我被亚马逊聘为软件开发工程师！

你可能不需要像我学那么多。无论如何，你需要的一切都在这里。

我每天学习 8-12 小时，持续了几个月。这是我的故事：[我为什么为谷歌面试全职自学了 8 个月](https://medium.freecodecamp.org/why-i-studied-full-time-for-8-months-for-a-google-interview-cc662ce9bb13)

请注意：你不需要像我学那么多。我在很多不需要知道的东西上浪费了大量时间。下面会有更多相关说明。我会帮你达成目标，而不浪费你宝贵的时间。

这里列出的内容将帮助你为几乎任何软件公司的技术面试做好充分准备，包括巨头：亚马逊、Facebook、谷歌和微软。

祝你好运！

## 这是什么？

这是我为进入大公司成为软件工程师而制定的多个月学习计划。

**必备条件：**
- 少许编程经验（变量、循环、方法/函数等）
- 耐心
- 时间

请注意，这是一个面向**软件工程**的学习计划，而非前端工程或全栈开发。那些职业路径有其他非常好的路线图和课程（更多信息请参见 https://roadmap.sh/）。

大学计算机科学课程需要学习很多内容，但掌握 75% 左右就足以应对面试了，这正是我在这里涵盖的内容。如需完整的计算机科学自学课程，我的学习计划中的资源已包含在 Kamran Ahmed 的计算机科学路线图中：https://roadmap.sh/computer-science

## 目录

### 学习计划

### 学习主题

- 算法复杂度 / 大 O 表示法 / 渐近分析
- 数据结构
- 更多知识
- 树
  - 树 - 简介
  - 二叉搜索树 (BST)
  - 堆 / 优先队列 / 二叉堆
  - 平衡搜索树（一般概念，不需细节）
  - 遍历：前序、中序、后序、广度优先、深度优先
- 排序
  - 选择排序
  - 插入排序
  - 堆排序
  - 快速排序
  - 归并排序
- 图
  - 有向图
  - 无向图
  - 邻接矩阵
  - 邻接表
  - 遍历：广度优先、深度优先
- 甚至更多知识
- 最终复习

### 获取工作

---------------- 以下所有内容均为可选 ----------------

### 可选的额外主题与资源

## 为什么要使用它？

如果你想在大公司担任软件工程师，这些都是你必须了解的知识。

如果你像我一样没有拿到计算机科学学位，这份计划会帮你补上短板，节省你四年的生命。

当我开始这个项目时，我连栈和堆都分不清，不了解大 O 表示法，对树或如何遍历图一无所知。如果要我写一个排序算法，那肯定会很糟糕。我过去用过的每种数据结构都是语言内置的，我完全不知道它们在底层是如何工作的。我从不需要管理内存，除非运行的程序出现“内存不足”错误，然后我得找一个变通方法。我使用过多维数组和成千上万个关联数组，但从未从头创建过数据结构。

这是一个很长的计划。可能需要花费你数月时间。如果你对其中很多内容已经很熟悉，那会快得多。

## 如何使用它

下面的内容是一个大纲，你应该从上到下依次处理这些项目。

我使用 GitHub 的特殊 Markdown 风格，包括任务列表来跟踪进度。

### 如果你不想使用 git

在页面顶部附近点击 “Code” 按钮，然后点击 “Download ZIP”。解压文件，你就可以使用文本文件了。

如果你在支持 Markdown 的代码编辑器中打开，你会看到格式很漂亮。

### 如果你熟悉 git

创建一个新分支，以便你可以像这样勾选项目，只需在方括号中填入 x 即可： [x]

1. 复刻 GitHub 仓库：点击 Fork 按钮。
2. 克隆到本地仓库：
   ```bash
   git clone https://github.com/<你的GitHub用户名>/coding-interview-university.git
   cd coding-interview-university
   git remote add upstream https://github.com/jwasham/coding-interview-university.git
   git remote set-url --push upstream DISABLE
   ```
3. 完成更改后，将所有框标记为 X：
   ```bash
   git commit -am "标记了个人进度"
   git pull upstream main  # 使你的复刻与原始仓库保持同步
   git push # 只推送到你的复刻
   ```

## 不要觉得自己不够聪明

- 成功的软件工程师都很聪明，但他们中的许多人都有一种不安全感和觉得自己不够聪明。
- 以下视频可能帮助你克服这种不安全感：

## 关于视频资源的一点说明

有些视频只能通过注册 Coursera 或 EdX 课程才能观看，这些被称为 MOOC（大规模开放在线课程）。有时课程没有开课，你需要等几个月，因此你无法访问。

如果能将这些在线课程资源替换为免费且始终可用的公共资源（如 YouTube 视频，最好是大学讲座），那就太好了，这样你就可以随时学习，而不仅仅是在特定在线课程开课时。

## 选择一门编程语言

你需要为编码面试选择一门编程语言，但你也需要找到一门可以用来学习计算机科学概念的语言。

最好使用同一种语言，这样你只需要精通一门。

### 对于本学习计划

在我执行学习计划时，我大部分使用了两种语言：C 和 Python。

- **C**：非常底层的语言。允许你处理指针和内存分配/释放，这样你能从骨子里感受数据结构和算法。在像 Python 或 Java 这样的高级语言中，这些细节对你来说是隐藏的。在日常工作中，这很棒，但当你学习这些底层数据结构是如何构建时，贴近底层的感觉很好。
  - C 无处不在。你在学习过程中会看到书籍、讲座、视频等各种地方都有 C 的例子。
  - 《C 程序设计语言（第 2 版）》：这是一本很薄的书，但它能让你很好地掌握 C 语言，稍微练习一下，你很快就能熟练起来。理解 C 有助于你理解程序和内存是如何工作的。
  - 你不需要深入阅读这本书（甚至不需要读完）。只要达到能舒服地读写 C 语言的程度就行。

- **Python**：现代且非常富有表现力，我学习它是因为它超级有用，也让我能在面试中写更少的代码。

这是我的偏好。当然，你可以做你喜欢的选择。

你可能不需要，但这里有一些学习新语言的网站：

### 对于你的编码面试

你可以使用你习惯的语言来完成面试中的编码部分，但对于大公司来说，以下这些是稳妥的选择：
- C++
- Java
- Python

你也可以使用这些，但请先阅读相关资料，可能有一些注意事项：
- JavaScript
- Ruby

这是我写的一篇关于为面试选择语言的文章：[为编码面试选择一门语言](https://startupnextdoor.com/important-pick-one-language-for-the-coding-interview/)。这是原文：[为面试选择一门编程语言](https://www.byte-by-byte.com/choose-programming-language/)。

你需要非常熟悉这门语言并且知识渊博。

阅读更多关于选择的讨论：

## 数据结构和算法书籍

这本书将为你奠定计算机科学的基础。

只需选择一本，使用你感觉舒服的语言。你将进行大量的阅读和编码。

### Python
- **《编码面试模式：搞定你的下一次编码面试》 (主要推荐)**
  - 面试官真正在寻找什么以及为什么的圈内人视角。
  - 101 个真实的编码面试问题及详细解答。
  - 直观的解释，引导你像在现场面试中一样解决每个问题。
  - 超过 1000 幅图表来说明关键概念和模式。

### C
- **《C 语言算法（第 1-5 部分，捆绑版）第 3 版》**
  - 基础、数据结构、排序、搜索和图算法

### Java
选择其一：
- **Goodrich, Tamassia, Goldwasser**
- **Sedgewick and Wayne**

### C++
选择其一：
- **《C++ 数据结构与算法（第 4 版）》**
- **《算法设计手册》**

## 面试准备书籍

以下是推荐用来补充学习的一些书籍。

- **《程序员面试金典》（第 6 版）**
  - C++ 和 Java 中的题解
  - 这是《破解面试》的一个很好的热身
  - 难度不大。大多数问题可能比你在面试中看到的要容易（据我所读）

- **《编程面试题解》**
  - Java 中的题解
  - 来自《程序员面试金典》的补充读物

### 如果你有大量额外时间：

选择其一：
- **《算法设计手册》（Skiena）**
- **《算法导论》（CLRS）**

## 不要犯我的错误

这份清单在几个月里不断增长，是的，它失控了。

以下是我犯的一些错误，这样你就能有更好的体验，并节省数月时间。

### 1. 你不会记住所有东西

我看了数小时的视频，做了大量笔记，但几个月后很多东西我都忘了。我花了 3 天时间复习笔记并制作闪卡以便回顾。我并不需要所有这些知识。

请阅读以下内容，以免重蹈我的覆辙：

### 2. 使用闪卡

为了解决这个问题，我建了一个小的闪卡网站，可以添加两种类型的闪卡：通用和代码。每张卡片有不同的格式。我制作了一个移动优先的网站，这样我可以在手机或平板电脑上随时随地复习。

为你自己免费制作一个：

**我不推荐**使用我的闪卡。数量太多，而且大部分是你不需要的琐碎知识。

但如果你不想听我的，这里是它们的位置：https://github.com/jwasham/computer-science-flash-cards
注意：我的闪卡数据库大约有 1800 张卡片。记住，我做得过火了，卡片涵盖了从汇编语言和 Python 琐事到机器学习和统计学的所有内容。对于面试所需来说，这太多了。

关于闪卡的说明：第一次你认出答案时，不要把它标记为已知。你需要多次看到同一张卡片并正确回答，才能真正记住它。重复会将知识更深入地植入你的大脑。

**Anki** 是我闪卡网站的一个替代方案，已被多次推荐给我。它使用重复系统来帮助你记忆。它用户友好，可在所有平台上使用，并有云同步系统。在 iOS 上收费 25 美元，但在其他平台上免费。

我的 Anki 格式闪卡数据库：https://ankiweb.net/shared/info/25173560（感谢 @xiewenya）。

一些学生提到有空白格式问题，可以通过以下方式解决：打开牌组，编辑卡片，点击“卡片”，选择“样式”单选按钮，然后在卡片类中添加 `white-space: pre;`。

### 3. 在学习的同时做编码面试题

**这非常重要。**

在你学习数据结构和**算法**的同时，开始做编码面试题。

你需要应用你正在学习的东西来解决问题，否则你会忘记的。我犯过这个错误。

一旦你学了一个主题，并感觉对它有点熟悉了，例如链表：
1. 打开一本编码面试书（或下面列出的编码问题网站）
2. 做 2 到 3 道与链表相关的问题。
3. 继续下一个学习主题。
4. 稍后，回头再做 2 到 3 道链表问题。
5. 对你学习的每个新主题都这样做。

在处理这些问题的过程中持续做题，而不是之后。

你被雇佣不是因为你拥有的知识，而是因为你如何应用知识。

下面列出了很多相关资源。继续前进。

### 4. 专注

有很多干扰会占用宝贵的时间。专注和集中注意力很难。放点纯音乐，你就能更好地集中注意力了。

## 你不会看到的内容

以下是流行的技术，但不属于本学习计划的一部分：
- JavaScript
- HTML, CSS, 以及其他前端技术
- SQL

## 每日计划

本课程涵盖很多科目。每个科目可能需要你几天，甚至一周或更长时间。这取决于你的日程安排。

每天，选择列表中的下一个主题，观看一些关于该主题的视频，然后用你为这门课程选择的语言编写该数据结构或算法的一个实现。

你可以在这里看到我的代码：https://github.com/jwasham/study

你不需要记住每个算法。只需要你能理解到足以编写自己的实现。

## 编码问题练习
**为什么这里会出现这个？我还没准备好面试。**

为什么你需要练习编程问题：
- 问题识别，以及正确的数据结构和算法适合的位置
- 收集问题的需求
- 像在面试中那样，边说边解题
- 在白板或纸上编码，而不是电脑上
- 为你的解法得出时间和空间复杂度（见下面的 Big-O）
- 测试你的解法

这里有一个关于在面试中进行有条理、互动式问题解决的精彩介绍。你也可以从编程面试书籍中学到这一点，但我发现这个非常出色：[算法设计画布](http://www.hiredintech.com/algorithm-design/)。

在白板或纸上写代码，而不是电脑上。用一些样例输入进行测试。然后在电脑上输入并测试。

如果你家里没有白板，去艺术用品店买一个大号的绘画本。你可以坐在沙发上练习。这是我的“沙发白板”。我在照片中加了笔以显示比例。如果你用笔，你会希望它能擦掉。很快就会变得一团糟。我用铅笔和橡皮。

编码问题练习不是为了记住编程问题的答案。

## 编码问题

不要忘记这里有你关键的编码面试书籍。

**解决问题的方法：**

**编码面试题视频：**
- [IDeserve](https://www.youtube.com/channel/UCMNkvKnD3mo3Jj9eTwJllWw) (88 个视频)
- [Tushar Roy](https://www.youtube.com/user/tusharroy2525/playlists) (5 个播放列表)
  - 对解题过程演示非常棒
- [Nick White - LeetCode 题解](https://www.youtube.com/playlist?list=PLU_sdQYzUj2keVENTP0a5rdykRSgg9Wp-) (187 个视频)
  - 对题解和代码有很好的解释
  - 可以在短时间内看多个
- [FisherCoder - LeetCode 题解](https://youtube.com/FisherCoder)

**挑战/练习网站：**
- [LeetCode](https://leetcode.com/)
  - 我最喜欢的编程问题网站。在你可能准备的 1-2 个月里，订阅费是值得的。
  - 参见上面的 Nick White 和 FisherCoder 视频，了解代码演示。
- [HackerRank](https://www.hackerrank.com/)
- [TopCoder](https://www.topcoder.com/)
- [Codeforces](https://codeforces.com/)
- [Codility](https://codility.com/programmers/)
- [Geeks for Geeks](https://practice.geeksforgeeks.org/explore/?page=1)
- [AlgoExpert](https://www.algoexpert.io/product)
  - 由 Google 工程师创建，这也是磨练技能的绝佳资源。
- [Project Euler](https://projecteuler.net/)
  - 非常侧重于数学，不太适合编码面试

## 让我们开始吧

好了，说得够多了，开始学习吧！

但别忘了在学习的同时，做上面提到的编码问题！

## 算法复杂度 / 大 O 表示法 / 渐近分析

- 这里没有什么需要实现的，你只需观看视频和做笔记！耶！
- 这里有很多视频。看到你理解为止。你随时可以回来复习。
- 如果你不理解其背后的所有数学，不要担心。
- 你只需要理解如何用大 O 符号表达算法的复杂度。
- [哈佛 CS50 - 渐近表示法](https://www.youtube.com/watch?v=iOq5kSKqeR4) (视频)
- [大 O 符号（一般快速教程）](https://www.youtube.com/watch?v=V6mKVRU1evU) (视频)
- [大 O 符号（以及 Omega 和 Theta）- 最佳数学解释](https://www.youtube.com/watch?v=ei-A_wy5Yxw&index=2&list=PL1BaGV1cIH4UhkL8a9bJGG356EVJCMoL8) (视频)
- [Skiena](https://www.youtube.com/watch?v=gSyDMtdPNpU&index=2&list=PLOtl7M3yp-DX6ic0HGT0PUX_wiNmkWkXx) (视频)
- [UC Berkeley 大 O 符号](https://archive.org/details/ucberkeley_webcast_VIS4YDpuP98) (视频)
- [摊销分析](https://www.youtube.com/watch?v=E3-VIl2w3W4&list=PL1BaGV1cIH4UhkL8a9bJGG356EVJCMoL8) (视频)
- [TopCoder（包含递推关系和主定理）](https://www.topcoder.com/community/data-science/data-science-tutorials/computational-complexity-section-1/)
- [Cheat sheet](http://bigocheatsheet.com/)
- [复习] [18 分钟内分析算法（播放列表）](https://www.youtube.com/playlist?list=PL9xmBV_5YoZMxejj8FH5iQHLQ-L3AhFKa) (视频)

好了，这就够了。

当你阅读《程序员面试金典》时，有一章是关于这个的，在章节末尾有一个测验，看你是否能识别不同算法的时间复杂度。这是一个超级棒的复习和测试。

## 数据结构

### 数组

- 关于数组：
  - [数组 (视频)](https://www.coursera.org/lecture/data-structures/arrays-OsBSF)
  - [基础数组 (视频)](https://archive.org/details/0102WhatYouShouldKnow/02_04-basicArrays.mp4)
  - [多维数组 (视频)](https://archive.org/details/0102WhatYouShouldKnow/02_05-multidimensionalArrays.mp4)
  - [动态数组 (视频)](https://www.coursera.org/lecture/data-structures/dynamic-arrays-EwbnV)
  - [锯齿数组 (视频)](https://www.youtube.com/watch?v=1jtrQqYpt7g)
  - [调整数组大小 (视频)](https://www.coursera.org/lecture/data-structures/resizable-arrays-OOCB8)
  - [为什么从 0 开始索引 (视频)](https://www.youtube.com/watch?v=iO9usk7G14Q)
- 实现一个向量（可变数组，自动调整大小）：
  - 练习使用数组和指针，以及使用指针数学跳到索引，而不是使用索引。
  - 新的原始数据数组，带有分配的内存。
    - 可以在底层分配 int 数组，只是不使用其特性。
    - 从 16 开始，如果起始数字更大，使用 2 的幂 - 16, 32, 64, 128。
  - `size()` - 元素个数
  - `capacity()` - 能容纳的元素个数
  - `is_empty()`
  - `at(index)` - 返回给定索引处的元素，如果索引越界则崩溃
  - `push(item)`
  - `insert(index, item)` - 在索引处插入元素，将该索引处的值和后面的元素右移
  - `prepend(item)` - 可以使用上面的 insert 在索引 0 处插入
  - `pop()` - 从末尾删除，返回值
  - `delete(index)` - 删除索引处的元素，将所有后面的元素左移
  - `remove(item)` - 查找值并删除包含该值的索引（即使值出现在多个位置）
  - `find(item)` - 查找值并返回第一个具有该值的索引，未找到返回 -1
  - `resize(new_capacity)` // 私有函数
    - 当达到容量时，将容量调整为原来的两倍
    - 当弹出一个元素时，如果大小是容量的 1/4，则将容量调整为一半
  - 时间复杂度
    - 在末尾添加/删除是 O(1)（为更多空间分配内存是摊销的），索引或更新是 O(1)
    - 在其他位置插入/删除是 O(n)
  - 空间复杂度
    - 在内存中是连续的，所以临近性有助于性能
    - 所需空间 = （数组容量，它 >= n）* 元素大小，但即使容量是 2n，仍然是 O(n)

### 链表

- 简介：
  - [链表 (视频)](https://www.coursera.org/lecture/data-structures/singly-linked-lists-kHhgK)
  - [CS 61B：链表 (视频)](https://archive.org/details/ucberkeley_webcast_sTci98W7x1Y)
  - [C 代码 (视频)](https://www.youtube.com/watch?v=VoQytaFJ6lA) - 不是整个视频，只是关于 Node 结构和内存分配的部分
  - [链表与数组对比](https://www.coursera.org/lecture/data-structures/arrays-vs-linked-lists-jOUru)
  - [为什么你应该避免链表 (视频)](https://www.youtube.com/watch?v=YQs6IC-vgmo)
  - 要点：你需要了解指针到指针的知识：（当你传递一个指针给一个函数，该函数可能改变该指针指向的地址时）这个页面只是为了让你理解指针到指针。我不推荐这种列表遍历风格。因为过于取巧，可读性和可维护性会受到影响。
  - 实现（我做了有尾指针和没有尾指针的版本）：
    - `size()` - 返回列表中元素个数
    - `empty()` - 如果为空返回 true
    - `value_at(index)` - 返回第 n 个元素的值（第一个从 0 开始）
    - `push_front(value)` - 在列表前面添加一个元素
    - `pop_front()` - 删除前面的元素并返回其值
    - `push_back(value)` - 在末尾添加一个元素
    - `pop_back()` - 删除末尾元素并返回其值
    - `front()` - 获取前面元素的值
    - `back()` - 获取末尾元素的值
    - `insert(index, value)` - 在索引处插入值，因此该索引处现有的元素被新元素指向
    - `erase(index)` - 删除给定索引处的节点
    - `value_n_from_end(n)` - 返回从链表末尾数第 n 个节点的值
    - `reverse()` - 反转链表
    - `remove_value(value)` - 删除链表中第一个具有该值的元素
- 双向链表
  - [描述 (视频)](https://www.coursera.org/lecture/data-structures/doubly-linked-lists-jpGKD)
  - 不需要实现

### 栈

- [栈 (视频)](https://www.coursera.org/lecture/data-structures/stacks-UdKzQ)
- [复习] [3 分钟搞懂栈 (视频)](https://www.youtube.com/watch?v=KcT3aVgrrpU)
- 不会实现。用数组实现是微不足道的。

### 队列

- [队列 (视频)](https://www.coursera.org/lecture/data-structures/queues-EShpq)
- [环形缓冲区/先进先出]
- [复习] [3 分钟搞懂队列 (视频)](https://www.youtube.com/watch?v=D6gu-_tmEpQ)
- 使用链表实现，带有尾指针：
  - `enqueue(value)` - 在尾部位置添加值
  - `dequeue()` - 返回值并删除最近最少添加的元素（头部）
  - `empty()`
- 使用固定大小的数组实现：
  - `enqueue(value)` - 在可用存储的末尾添加元素
  - `dequeue()` - 返回值并删除最近最少添加的元素
  - `empty()`
  - `full()`
- 成本：
  - 一个糟糕的实现，如果在头部入队并在尾部出队，使用链表将是 O(n)，因为你需要找到倒数第二个元素，导致每次出队都需要完整遍历
  - `enqueue`: O(1)（摊销，链表和数组[探查]）
  - `dequeue`: O(1)（链表和数组）
  - `empty`: O(1)（链表和数组）

### 哈希表

**视频：**
- [Hashing 哈希表](https://www.coursera.org/lecture/data-structures/hashing-OhM8f)
- [哈希函数 (视频)](https://www.coursera.org/lecture/data-structures/hash-functions-r1ZWZ)
- [哈希表 vs 平衡树 (视频)](https://www.coursera.org/lecture/data-structures/哈希表-vs-balanced-trees-9Gn8V) - 英文原链接建议视频标题和ID用英文

**在线课程：**
- [哈希表理解 (视频)](https://www.youtube.com/watch?v=shs0KM3wKv8)
- [哈希表 (视频)](https://www.youtube.com/watch?v=KyUTuwz_b7Q)

**实现一个使用线性探测的数组：**
- `hash(k, m)` - m 是哈希表的大小
- `add(key, value)` - 如果键已存在，更新值
- `exists(key)`
- `get(key)`
- `remove(key)`

## 更多知识

### 二分搜索

- [二分搜索 (视频)](https://www.youtube.com/watch?v=D5SrAga1pno)
- [二分搜索 (视频)](https://www.khanacademy.org/computing/computer-science/algorithms/binary-search/a/binary-search)
- [详解](https://www.topcoder.com/community/data-science/data-science-tutorials/binary-search/)
- [蓝图](https://leetcode.com/discuss/general-discussion/786126/Python-Powerful-Ultimate-Binary-Search-Template.-Solved-many-problems)
- [复习] [4 分钟搞懂二分搜索 (视频)](https://www.youtube.com/watch?v=fDKIpRe8GW4)
- 实现：
  - 二分搜索（在排序的整数数组上）
  - 使用递归的二分搜索

### 位运算

- [位运算作弊表](https://github.com/jwasham/coding-interview-university/blob/main/extras/cheat%20sheets/bit-cheat-sheet.pdf) - 你应该知道从 (2^1 到 2^16 以及 2^32) 的许多 2 的幂
- 真正理解如何用以下运算符操作位： &, |, ^, ~, >>, <<
  - [2 的补码和 1 的补码](https://en.wikipedia.org/wiki/Two%27s_complement)
  - [计算置位的位数](https://en.wikipedia.org/wiki/Hamming_weight)
  - [交换数值](https://en.wikipedia.org/wiki/XOR_swap_algorithm)
  - [绝对值](https://stackoverflow.com/questions/12035277/absolute-value-of-a-number-using-bitwise-operators)

## 树

### 树 - 简介

- [树简介 (视频)](https://www.coursera.org/lecture/data-structures/trees-95qda)
- [树的遍历 (视频)](https://www.coursera.org/lecture/data-structures/tree-traversal-fr56b)
- [广度优先搜索和深度优先搜索 (视频)](https://www.coursera.org/lecture/data-structures/breadth-first-search-eJ18V)
  - BFS 笔记：
    - 层序遍历（BFS，使用队列）
    - 时间复杂度：O(n)
    - 空间复杂度：最好：O(1)，最坏：O(n/2)=O(n)
  - DFS 笔记：
    - 时间复杂度：O(n)
    - 空间复杂度：最好：O(log n) - 树的平均高度，最坏：O(n)
    - 中序遍历（DFS：左，自身，右）
    - 后序遍历（DFS：左，右，自身）
    - 前序遍历（DFS：自身，左，右）
- [复习] [4 分钟搞懂广度优先搜索 (视频)](https://www.youtube.com/watch?v=HZ5YTanv5QE)
- [复习] [4 分钟搞懂深度优先搜索 (视频)](https://www.youtube.com/watch?v=Urx87-NMm6c)
- [复习] [11 分钟搞懂树的遍历（播放列表）](https://www.youtube.com/playlist?list=PL9xmBV_5YoZO1JC2RgEi04nLy6D-rHk6b) (视频)

### 二叉搜索树 (BST)

- [二叉搜索树复习 (视频)](https://www.youtube.com/watch?v=x6At0nzX92o&index=1&list=PLA5Lqm4uh9Bbq-E0ZnqTIa8LRaL77ica6) - 备选
- [二叉搜索树简介 (视频)](https://www.coursera.org/lecture/data-structures/introduction-2BnSv)
- [MIT 二叉搜索树 (视频)](https://www.youtube.com/watch?v=76dhtgZt38A&ab_channel=MITopenCourseware)
- [C/C++ 实现：](https://www.coursera.org/lecture/data-structures/binary-search-tree-implementation-c-4fGbk)
- 实现：
  - `insert` // 将值插入树中
  - `get_node_count` // 获取存储的值的数量
  - `print_values` // 打印树中的值，从小到大
  - `delete_tree`
  - `is_in_tree` // 如果给定值存在于树中则返回 true
  - `get_height` // 返回节点高度（单个节点的高度为 1）
  - `get_min` // 返回树中存储的最小值
  - `get_max` // 返回树中存储的最大值
  - `is_binary_search_tree`
  - `delete_value`
  - `get_successor` // 返回树中给定值之后的下一个更大值，如果没有则返回 -1

### 堆 / 优先队列 / 二叉堆

- 可视化为树，但通常是线性存储（数组，链表）
- [堆简介 (视频)](https://www.coursera.org/lecture/data-structures/introduction-2BnSv)
- [二叉树 (视频)](https://www.coursera.org/lecture/data-structures/binary-trees-2BnSv) - 实际内容从 5:40 开始？ - 标题和 ID 一致？
- [树的高度注意事项 (视频)](https://www.coursera.org/lecture/data-structures/tree-height-2BnSv)
- [基本操作 (视频)](https://www.coursera.org/lecture/data-structures/basic-operations-2BnSv)
- [完全二叉树 (视频)](https://www.coursera.org/lecture/data-structures/complete-binary-trees-2BnSv)
- [伪代码 (视频)](https://www.coursera.org/lecture/data-structures/pseudocode-2BnSv)
- [堆排序 - 跳至开头 (视频)](https://youtu.be/odNJmw5TOEE?list=PLFDnELG9dpVxQCxuD-9BSy2E7BWY3t5Sm&t=3291)
- [堆排序 (视频)](https://www.coursera.org/lecture/data-structures/heap-sort-hSzMO)
- [构建一个堆 (视频)](https://www.coursera.org/lecture/data-structures/building-a-heap-2BnSv)
- [MIT 6.006 算法导论：二叉堆 (视频)](https://www.youtube.com/watch?v=HqPJF2L5h9U)
- [CS 61B 讲座 24：优先队列 (视频)](https://archive.org/details/ucberkeley_webcast_yIUFT6AKBGE)
- [线性时间 BuildHeap（最大堆）](https://www.youtube.com/watch?v=MiyLo8adrWw)
- [复习] [13 分钟搞懂堆（播放列表）](https://www.youtube.com/playlist?list=PL9xmBV_5YoZNsyqgPW-DNwUeT3F8PMW85) (视频)
- 实现一个最大堆：
  - `insert`
  - `sift_up` - 用于插入
  - `get_max` - 返回最大值，不移除它
  - `get_size()` - 返回存储的元素个数
  - `is_empty()` - 如果堆不含元素则返回 true
  - `extract_max` - 返回最大值并将其移除
  - `sift_down` - 用于 extract_max
  - `remove(x)` - 移除索引 x 处的元素
  - `heapify` - 从元素数组创建堆，用于 heap_sort
  - `heap_sort()` - 获取一个未排序的数组，并使用最大堆或最小堆将其原地转换为排序数组

## 排序

**笔记：**
- 实现排序并了解每种排序的最佳/最差情况、平均复杂度：
  - 不要用冒泡排序 - 它太糟糕了 - O(n^2)，除非 n <= 16
- 排序算法的**稳定性**（“快速排序稳定吗？”）
- 哪些算法可以用于链表？哪些用于数组？哪些两者都可以？
  - 我不推荐对链表进行排序，但归并排序是可行的。
  - [链表的归并排序](http://www.geeksforgeeks.org/merge-sort-for-linked-list/)

对于堆排序，请参阅上面的堆数据结构。堆排序很棒，**但不稳定**。

[UC Berkeley 排序算法 (视频)](https://archive.org/details/ucberkeley_webcast_EeQ8pwjQxTM)

[归并排序代码](https://www.geeksforgeeks.org/merge-sort/)

[快速排序代码](https://www.geeksforgeeks.org/quick-sort/)

实现：
- 归并排序：平均和最差情况 O(n log n)
- 快速排序：平均情况 O(n log n)
- 选择排序和插入排序的平均和最差情况都是 O(n^2)
- 对于堆排序，请参阅上面的堆数据结构

虽然不是必需的，但我推荐它们：
- [冒泡排序](https://www.geeksforgeeks.org/bubble-sort/)
- [基数排序](https://www.geeksforgeeks.org/radix-sort/)
- [计数排序](https://www.geeksforgeeks.org/counting-sort/)

作为总结，这是 [15 种排序算法的可视化表示](https://www.youtube.com/watch?v=kPRA0W1kECg)。如果你需要关于这个主题的更多细节，请参见“关于某些主题的附加细节”中的“[排序](#排序)”部分。

## 图

图可以用来表示计算机科学中的许多问题，所以这一节比较长，就像树和排序一样。

**笔记：**
- 在内存中表示图有 4 种基本方式：
  - 对象和指针
  - 邻接矩阵
  - 邻接表
  - 邻接映射
- 熟悉每种表示方式及其优缺点
- BFS 和 DFS - 了解它们的计算复杂度、权衡以及在真实代码中如何实现
- 当被问到一个问题时，首先寻找基于图的解决方案，如果没有再考虑其他。

**MIT 课程 (视频)：**
- [6.006 算法导论：广度优先搜索 (视频)](https://www.youtube.com/watch?v=s-CYnVz-uh4&list=PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb&index=13)
- [6.006 算法导论：深度优先搜索 (视频)](https://www.youtube.com/watch?v=AfSk24VFS4o&list=PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb&index=14)
- [6.006 算法导论：拓扑排序 (视频)](https://www.youtube.com/watch?v=AfSk24VFS4o&list=PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb&index=14)

**Skiena 讲座 - 很好的介绍：**
- [CSE373 2020 - 讲座 10 - 图简介 (视频)](https://www.youtube.com/watch?v=zxJX0kW15hY&list=PLOtl7M3yp-DX6ic0HGT0PUX_wiNmkWkXx&index=10)
- [CSE373 2020 - 讲座 11 - 图遍历 (视频)](https://www.youtube.com/watch?v=W51-PEItGSo&list=PLOtl7M3yp-DX6ic0HGT0PUX_wiNmkWkXx&index=11)
- [CSE373 2020 - 讲座 12 - 广度优先搜索 (视频)](https://www.youtube.com/watch?v=oK1mIfjxr28&list=PL

# 参考资料

* any list
{:toc}