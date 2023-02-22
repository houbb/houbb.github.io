---
layout: post
title: Tree-10-多路查找树 B* 树 及 java 实现
date:  2020-10-17 16:15:55 +0800
categories: [Data-Struct]
tags: [data-struct, java, sh]
published: true
---


# B* Tree

B* Tree 是 B+ Tree的变体，在 B+ Tree的非根和非叶子结点再增加指向兄弟的指针；

B* Tree定义了非叶子结点关键字个数至少为 `(2/3)*M`，即块的最低使用率为2/3（代替B+树的1/2）。

# 实际例子

给出了一个简单实例，如下图所示：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1201/203629_cbac4a2e_508704.png "屏幕截图.png")

B+ Tree的分裂：当一个结点满时，分配一个新的结点，并将原结点中1/2的数据复制到新结点，最后在父结点中增加新结点的指针；B+ Tree的分裂只影响原结点和父结点，而不会影响兄弟结点，所以它不需要指向兄弟的指针。

B* Tree的分裂：当一个结点满时，如果它的下一个兄弟结点未满，那么将一部分数据移到兄弟结点中，再在原结点插入关键字，最后修改父结点中兄弟结点的关键字（因为兄弟结点的关键字范围改变了）；如果兄弟也满了，则在原结点与兄弟结点之间增加新结点，并各复制1/3的数据到新结点，最后在父结点增加新结点的指针。

所以，**B* Tree分配新结点的概率比B+ Tree要低，空间使用率更高；**

# 参考资料

https://blog.csdn.net/csdnxingyuntian/article/details/57540650

* any list
{:toc}