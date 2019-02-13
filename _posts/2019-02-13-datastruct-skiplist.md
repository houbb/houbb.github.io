---
layout: post
title: 跳跃表(SkipList)
date:  2019-2-13 09:11:35 +0800
categories: [Data-Struct]
tags: [data-struct, index, sh]
published: true
excerpt: 跳跃表(SkipList)
---

# 什么是跳跃表

```
Skip lists are a data structure that can be used in place of balanced trees. Skip lists use probabilistic balancing rather than strictly enforced balancing and as a result the algorithms for insertion and deletion in skip lists are much simpler and significantly faster than equivalent algorithms for balanced trees.
```

跳表是平衡树的一种替代的数据结构，但是和红黑树不相同的是，跳表对于树的平衡的实现是基于一种随机化的算法的，这样也就是说跳表的插入和删除的工作是比较简单的。

可以达到读取/修改的复杂度为：O(log(n))，线性的。

## 作者

跳表是由William Pugh发明。他在 Communications of the ACM June 1990, 33(6) 668-676 发表了Skip lists: a probabilistic alternative to balanced trees，在该论文中详细解释了跳表的数据结构和插入删除操作。

William Pugh同时还是FindBug（没有使用过，这是一款java的静态代码分析工具，直接对java 的字节码进行分析，能够找出java字节码中潜在很多错误。）作者之一。现在是University of Maryland, College Park（马里兰大学伯克分校，位于马里兰州，全美大学排名在五六十名左右的样子）大学的一名教授。他和他的学生所作的研究深入的影响了java语言中内存池实现。

## 为什么需要？

性能比较好。

实现相对于红黑树比较简单。

# 数据结构

![Skip_list.svg.png](https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Skip_list.svg/600px-Skip_list.svg.png)

## 结构

从图中可以看到， 跳跃表主要由以下部分构成：

表头（head）：负责维护跳跃表的节点指针。

跳跃表节点：保存着元素值，以及多个层。

层：保存着指向其他元素的指针。高层的指针越过的元素数量大于等于低层的指针，为了提高查找的效率，程序总是从高层先开始访问，然后随着元素值范围的缩小，慢慢降低层次。

表尾：全部由 NULL 组成，表示跳跃表的末尾。

因为跳跃表的定义可以在任何一本算法或数据结构的书中找到， 所以本章不介绍跳跃表的具体实现方式或者具体的算法， 而只介绍跳跃表在 Redis 的应用、核心数据结构和 API 。

# C 实现过程

## 定义节点

```c
//每个节点的数据结构
typedef  struct nodeStructure  
{  
    int key;    
    int value;  
    struct nodeStructure *forward[1];  
}nodeStructure;  

//跳跃表的数据结构
typedef  struct skiplist  
{  
    int level;  
    nodeStructure *header;  
}skiplist;  
```

## 节点的创建

```
nodeStructure* createNode(int level,int key,int value)  
{  
 
  nodeStructure *ns=(nodeStructure *)malloc(sizeof(nodeStructure)+level*sizeof(nodeStructure*));    
 
   ns->key=key;    
   ns->value=value;    
   return ns;    
}
```

## 列表的初始化

列表的初始化需要初始化头部，并使头部每层（根据事先定义的MAX_LEVEL）指向末尾（NULL）。

```c
skiplist* createSkiplist()  
{  
   skiplist *sl=(skiplist *)malloc(sizeof(skiplist));    
   sl->level=0;    
   sl->header=createNode(MAX_LEVEL-1,0,0);    
   for(int i=0;i<MAX_LEVEL;i++)    
   {    
       sl->header->forward[i]=NULL;    
   }  
   return sl;  
}
```

## 插入元素

插入元素的时候元素所占有的层数完全是随机的，通过随机算法产生

```c
int randomLevel()    
{  
    int k=1;  
    while (rand()%2)    
        k++;    
    k=(k<MAX_LEVEL)?k:MAX_LEVEL;  
    return k;    
}  
```

跳表的插入需要三个步骤，第一步需要查找到在每层待插入位置，然后需要随机产生一个层数，最后就是从高层至下插入，插入时算法和普通链表的插入完全相同。

```c
bool insert(skiplist *sl,int key,int value)  
{  
    nodeStructure *update[MAX_LEVEL];  
    nodeStructure *p, *q = NULL;  
    p=sl->header;  
    int k=sl->level;  
  
    //从最高层往下查找需要插入的位置  
    //填充update  
    for(int i=k-1; i >= 0; i--){  
        while((q=p->forward[i])&&(q->key<key))  
        {  
            p=q;  
        }  
        update[i]=p;  
    }  
  
    //不能插入相同的key  
    if(q&&q->key==key)  
    {  
        return false;  
    }  
 
    //产生一个随机层数K  
    //新建一个待插入节点q  
    //一层一层插入  
    k=randomLevel();  
    //更新跳表的level  
    if(k>(sl->level))  
    {  
        for(int i=sl->level; i < k; i++){  
            update[i] = sl->header;  
        }  
        sl->level=k;  
    }  
  
    q=createNode(k,key,value); 
    //逐层更新节点的指针，和普通列表插入一样  
    for(int i=0;i<k;i++)  
    {  
        q->forward[i]=update[i]->forward[i];  
        update[i]->forward[i]=q;  
    }  
    return true;  
}  
```

## 删除节点

删除节点操作和插入差不多，找到每层需要删除的位置，删除时和操作普通链表完全一样。不过需要注意的是，如果该节点的level是最大的，则需要更新跳表的level。

```
bool deleteSL(skiplist *sl,int key)  
{  

   nodeStructure *update[MAX_LEVEL];   
   nodeStructure *p,*q=NULL;  
   p=sl->header;  
 
   //从最高层开始搜  
   int k=sl->level;  
   for(int i=k-1; i >= 0; i--){  
       while((q=p->forward[i])&&(q->key<key))  
       {  
           p=q;  
       }  
       update[i]=p;  
   }  
 
   if(q&&q->key==key)  
   {  
       //逐层删除，和普通列表删除一样  
       for(int i=0; i<sl->level; i++){    
           if(update[i]->forward[i]==q){    
               update[i]->forward[i]=q->forward[i];    
           }  
       }   
       free(q);  
       //如果删除的是最大层的节点，那么需要重新维护跳表的  
       for(int i=sl->level-1; i >= 0; i--){    
           if(sl->header->forward[i]==NULL){    
               sl->level--;    
           }    
       }    
       return true;  
   }  
   else  
       return false;  
}  
```

## 查找

跳表的优点就是查找比普通链表快，当然查找操作已经包含在在插入和删除过程，实现起来比较简单。

```c
int search(skiplist *sl,int key)  
{  
    nodeStructure *p,*q=NULL;  
    p=sl->header;  
    //从最高层开始搜  
    int k=sl->level;  
    for(int i=k-1; i >= 0; i--){  
        while((q=p->forward[i])&&(q->key<=key))  
        {  
            if(q->key==key)  
            {  
                return q->value;  
            }  
            p=q;  
        }  
    }  
    return NULL;  
}
```

# 索引

今天想说一说搜索引擎或者数据库中索引（主要是倒排索引）的字典结构，一个好的高效的字典结构直接影响到索引的效果，而索引的构建其实并不是完全追求速度，还有磁盘空间，内存空间等各个因素，所以在一个索引系统中，需要权衡各个关系，找到一种适合你当前业务的数据结构进行存储。这样才能发挥索引最大的能效，一般情况下，对于索引来说（主要是倒排索引）的字典来说，有**跳跃表，B+树，前缀树，后缀树，自动状态机，哈希表**这么几种数据结构，其实只要是一个快速的查找型的数据结构就可以用来做索引的字典。


# Java 实现版本

```java
/***************************  SkipList.java  *********************/

import java.util.Random;

public class SkipList<T extends Comparable<? super T>> {
    private int maxLevel;
    private SkipListNode<T>[] root;
    private int[] powers;
    private Random rd = new Random();
    SkipList() {
        this(4);
    }
    SkipList(int i) {
        maxLevel = i;
        root = new SkipListNode[maxLevel];
        powers = new int[maxLevel];
        for (int j = 0; j < maxLevel; j++)
            root[j] = null;
        choosePowers();
    }
    public boolean isEmpty() {
        return root[0] == null;
    }
    public void choosePowers() {
        powers[maxLevel-1] = (2 << (maxLevel-1)) - 1;    // 2^maxLevel - 1
        for (int i = maxLevel - 2, j = 0; i >= 0; i--, j++)
           powers[i] = powers[i+1] - (2 << j);           // 2^(j+1)
    }
    public int chooseLevel() {
        int i, r = Math.abs(rd.nextInt()) % powers[maxLevel-1] + 1;
        for (i = 1; i < maxLevel; i++)
            if (r < powers[i])
                return i-1; // return a level < the highest level;
        return i-1;         // return the highest level;
    }
    // make sure (with isEmpty()) that search() is called for a nonempty list;
    public T search(T key) { 
        int lvl;
        SkipListNode<T> prev, curr;            // find the highest nonnull
        for (lvl = maxLevel-1; lvl >= 0 && root[lvl] == null; lvl--); // level;
        prev = curr = root[lvl];
        while (true) {
            if (key.equals(curr.key))          // success if equal;
                 return curr.key;
            else if (key.compareTo(curr.key) < 0) { // if smaller, go down,
                 if (lvl == 0)                 // if possible
                      return null;      
                 else if (curr == root[lvl])   // by one level
                      curr = root[--lvl];      // starting from the
                 else curr = prev.next[--lvl]; // predecessor which
            }                                  // can be the root;
            else {                             // if greater,
                 prev = curr;                  // go to the next
                 if (curr.next[lvl] != null)   // non-null node
                      curr = curr.next[lvl];   // on the same level
                 else {                        // or to a list on a lower level;
                      for (lvl--; lvl >= 0 && curr.next[lvl] == null; lvl--);
                      if (lvl >= 0)
                           curr = curr.next[lvl];
                      else return null;
                 }
            }
        }
    }
    public void insert(T key) {
        SkipListNode<T>[] curr = new SkipListNode[maxLevel];
        SkipListNode<T>[] prev = new SkipListNode[maxLevel];
        SkipListNode<T> newNode;
        int lvl, i;
        curr[maxLevel-1] = root[maxLevel-1];
        prev[maxLevel-1] = null;
        for (lvl = maxLevel - 1; lvl >= 0; lvl--) {
            while (curr[lvl] != null && curr[lvl].key.compareTo(key) < 0) { 
                prev[lvl] = curr[lvl];           // go to the next
                curr[lvl] = curr[lvl].next[lvl]; // if smaller;
            }
            if (curr[lvl] != null && key.equals(curr[lvl].key)) // don't 
                return;                          // include duplicates;
            if (lvl > 0)                         // go one level down
                if (prev[lvl] == null) {         // if not the lowest
                      curr[lvl-1] = root[lvl-1]; // level, using a link
                      prev[lvl-1] = null;        // either from the root
                }
                else {                           // or from the predecessor;
                     curr[lvl-1] = prev[lvl].next[lvl-1];
                     prev[lvl-1] = prev[lvl];
                }
        }
        lvl = chooseLevel();                // generate randomly level 
        newNode = new SkipListNode<T>(key,lvl+1); // for newNode;
        for (i = 0; i <= lvl; i++) {        // initialize next fields of
            newNode.next[i] = curr[i];      // newNode and reset to newNode
            if (prev[i] == null)            // either fields of the root
                 root[i] = newNode;         // or next fields of newNode's
            else prev[i].next[i] = newNode; // predecessors;
        }
    }
}
```

# 拓展阅读

[红黑树](https://houbb.github.io/2018/09/12/data-struct-red-black-tree)

[B+ Tree](https://houbb.github.io/2018/09/12/b-tree)

[Hash 算法](https://houbb.github.io/2018/05/30/hash)

TODO：自动状态机==》索引

# 参考资料 

https://en.wikipedia.org/wiki/Skip_list

[跳表SkipList](http://www.cnblogs.com/xuqiang/archive/2011/05/22/2053516.html)

https://segmentfault.com/a/1190000009546008

[跳跃表C实现](https://www.jianshu.com/p/1ff0db20ec58)

[Redis 跳跃表](https://redisbook.readthedocs.io/en/latest/internal-datastruct/skiplist.html)

https://zhuanlan.zhihu.com/p/26499803

http://www.cppblog.com/superKiki/archive/2010/10/18/130328.html

[java 实现](http://www.cnblogs.com/acfox/p/3688607.html)

https://blog.csdn.net/qq575787460/article/details/16371287

http://www.cnblogs.com/thrillerz/p/4505550.html

- 状态自动机

[字符串匹配算法之：有限状态自动机](https://blog.csdn.net/tyler_download/article/details/52549315)

* any list
{:toc}