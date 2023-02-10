---
layout: post
title: 优先级队列与堆排序 PriorityQueue & heap sort
date: 2019-1-4 15:24:22 +0800
categories: [Althgorim]
tags: [althgorim, sh]
published: true
---

# 优先级队列

不同于先进先出队列，其对每一个元素指定了优先级，一般情况下，出队时，优先级越高的元素越先出队。

# 问题

## 题目

实现一个优先级队列，此队列具有enqueue（val，prior）和dequeue（）两种操作，分别代表入队和出队。

其中enqueue（val，prior）第一个参数val为值，第二个参数prior为优先级（prior越大，优先级越高），优先级越高越先出队

dequeue（）出队操作，每调用一次从队列中找到一个优先级最高的元素出队，并返回此元素的值（val）

要求：在O（logn）时间复杂度内完成两种操作

## 初步思路

最简单的思路，直接使用数组或者链表，存储数据，顺序遍历整个列表。

这种查询时间复杂度为 O(n)，也是最容易想到的。

## 进一步优化

看到 O(logn) 其实我们的第一感觉应该是**树**。

当然这个问题考察的说白了就是二叉树。


## 二叉堆的概念

此题的关键点在于是否能够想到二叉堆（普及一下二叉堆，二叉堆将数组维护成了逻辑上的完全二叉树，但其本质上（存储结构）是数组，这一点要注意），如果能想到这一点那么这道面试题就成功一半了，因为利用二叉堆我们就可以在O（logn）复杂度内实现入队出队操作（前面介绍了通过链表的方式可以使入队操作在O（1）时间内完成，而通过二叉堆需要O（logn）完成，表面上似乎复杂度升高了，但是我们将入队和出队操作结合起来看，那么整体效率还是二叉堆方式效率更高）。

那么二叉堆为何如此神通广大呢？其实，熟悉堆排序的朋友对二叉堆应该不会陌生，下面我就对二叉堆是如何降低复杂度做个介绍（以大顶堆为例）。

### 入队

首先，在入队时，先将元素放在最后一个位置上，然后比较此元素与其父元素优先级的大小，若此元素优先级较大，则需上浮，直到根节点为止（注：二叉堆的存储结构是一个数组，下面的图左边是数组，即二叉堆的实际存储结构，右边是此数组对应的完全二叉树，方便讲解上浮下沉操作）。

下面以图的方式说明具体上浮过程（假设分别入队了1，2，3，4，数字代表优先级，构建的是大顶堆）：

![入队](https://mmbiz.qpic.cn/mmbiz_png/amA0eOhORREsE3pHiaWxY506qRJjEl7wRKaGgbobUkd2CI4faGWkO9p0mYStHoaMJDspF2RpHfYXVJFMs5eyVGQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 出队

然后是出队操作，假设我们在上述的4入队之后进行了一次出队操作，那么优先级最高的4（即数组的第一个元素）将被移出队列。

但是，具体的移除操作并不是将第一个元素4删除这么简单，我们需要重新调整数组为大顶堆，具体分为三步：

第一步：将第一个元素与最后一个元素交换（目的：这样就可以在不影响其他元素的情况下把元素4删除了，方便后续重新调整为大顶堆，若不交换直接删除4，则后续重新调整为大顶堆时较麻烦）；

![出队-01](https://mmbiz.qpic.cn/mmbiz_png/amA0eOhORREsE3pHiaWxY506qRJjEl7wRvYz6kWJcuWF2L9atUSiag1hGX1poHdKrKFIPentoGcOicWu3sibDQK09w/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


第二步：现在可以将4删除了；

![出队-02](https://mmbiz.qpic.cn/mmbiz_png/amA0eOhORREsE3pHiaWxY506qRJjEl7wR6FutHZCT2PNic51riaIm41GibC8vGeLUQtRBJntabDwzm4khTBlXyqVeQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

第三步：重新调整数组为大顶堆，注：此时需要对根节点（数组中的第一个元素）实施下沉操作，一直下沉到叶节点为止，在下沉过程中，根节点要与左右孩子中较大的一个交换，这样才能调整为大顶堆；

![出队-03](https://mmbiz.qpic.cn/mmbiz_png/amA0eOhORREsE3pHiaWxY506qRJjEl7wRx7SezowJZibibZXu3o89JDUVKbdoRI9Uicic8b9sdsGwPEwACMDjicQG2Hg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

如图，大顶堆又形成了。接下来，就可以继续对队列实施入队出队操作了。

我们发现入队出队的时间都用在了将数组调整成大顶堆上了，其时间复杂度为二叉堆的高度，即O（logn）。


# 源码实现

```js
class PriorityQueue {
    constructor() {
        //数组，入队的元素保存在这里，
        //每进行一次入队或出队操作，都需重新调整数组为大顶堆
        this.arr = [];
    }

    //入队
    enqueue(val, prior) {
        this.arr.push({
            val: val,
            prior: prior
        });
        let cur = this.arr.length - 1;
        let temp = this.arr[cur];
        //对刚入队的那个元素实施上浮操作，即重新调整数组为大顶堆
        for(let i = Math.floor((cur - 1) / 2); i >= 0; i = Math.floor((i - 1) / 2)) {
            if(temp.prior > this.arr[i].prior) {
                this.arr[cur] = this.arr[i];
                cur = i;
            } else break;
        }
        this.arr[cur] = temp;
    }

    //出队
    dequeue() {
        if(this.arr.length === 0) throw new Error("队列为空，不能出队");
        //大顶堆保证了第一个元素的优先级永远最高，是要出队的元素

        //将第一个元素的值缓存，以便返回
        let res = this.arr[0].val;

        //用队尾元素元素覆盖第一个元素
        this.arr[0] = this.arr[this.arr.length - 1];

        //将队列长度-1
        this.arr.length -= 1;

        //重新调整队列为大顶堆
        let cur = 0,
            len = this.arr.length;
        let temp = this.arr[0];
        for(let i = 2 * cur + 1; i < len; i = 2 * cur + 1) {
            if(i + 1 < len && this.arr[i].prior < this.arr[i + 1].prior)
                i++;
            if(temp.prior < this.arr[i].prior) {
                this.arr[cur] = this.arr[i];
                cur = i;
            } else break;
        }
        this.arr[cur] = temp;

        //返回结果
        return res;
    }
}

let p = new PriorityQueue();
p.enqueue(5, 6);
p.enqueue(2, 100);
p.enqueue(90, 1);

console.log(p.dequeue());//2
console.log(p.dequeue());//5
console.log(p.dequeue());//90
```




# 参考资料

[优先级队列](https://mp.weixin.qq.com/s/bDZmhx2LtXFI03vjEAPeAA)

* any list
{:toc}