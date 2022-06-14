---
layout: post
title:  简易版数据库实现-04-MIT 6.830 SimpleDB Lab2 Filter OrderBy Join 实现
date:  2022-06-12 09:22:02 +0800
categories: [Database]
tags: [database, sh]
published: true
---

# Exercise1: Filter and Join

exercise1要求我们完成Filter和Join两种操作符，下面是相关描述：

- *Filter*: This operator only returns tuples that satisfy a `Predicate` that is specified as part of its constructor.
  Hence, it filters out any tuples that do not match the predicate.

- *Join*: This operator joins tuples from its two children according to a `JoinPredicate` that is passed in as part of
  its constructor. We only require a simple nested loops join, but you may explore more interesting join
  implementations. Describe your implementation in your lab writeup.

# Filter

Filter是SQL语句中where的基础，如 `select * from students where id > 2`, Filter 起到条件过滤的作用, 也即过滤出来所有满足 id > 2 的 tuple。

## 实现

首先我们基于 OpIterator 实现抽象类：

```java
public abstract class Operator implements OpIterator {

    /**
     * 下一行
     */
    private Tuple next = null;
    /**
     * 是否已打开
     */
    private boolean open = false;

    public boolean hasNext() throws DbException, TransactionAbortedException {
        if (!this.open)
            throw new IllegalStateException("Operator not yet open");

        if (next == null)
            next = fetchNext();
        return next != null;
    }

    public Tuple next() throws DbException, TransactionAbortedException, NoSuchElementException {
        if (next == null) {
            next = fetchNext();
            if (next == null)
                throw new NoSuchElementException();
        }

        Tuple result = next;
        next = null;
        return result;
    }

    protected abstract Tuple fetchNext() throws DbException, TransactionAbortedException;

    public void close() {
        // Ensures that a future call to next() will fail
        next = null;
        this.open = false;
    }

    public void open() throws DbException, TransactionAbortedException {
        this.open = true;
    }

    public abstract OpIterator[] getChildren();

    public abstract void setChildren(OpIterator[] children);

}
```

这样 Filter 就可以在这个基础上实现，fetchNext() 的实现如下：

```java
// 找到 child 节点中，满足 predicate 条件的元素返回
@Override
protected Tuple fetchNext() throws DbException, TransactionAbortedException {
    while (this.child.hasNext()) {
        Tuple tuple = child.next();

        //? 其实这里不一定非要判断为非 null
        // 比如我要查找的就是 IsNull 的元素呢
        if(tuple != null
            && this.predicate.filter(tuple)) {
            return tuple;
        }
    }

    return null;
}
```

predicate.filter 比较方法实现如下：

```java
/**
 * Compares the field number of t specified in the constructor to the
 * operand field specified in the constructor using the operator specific in
 * the constructor.
 *
 * The comparison can be made through Field's compare method.
 *
 * @param t The tuple to compare against
 * @return true if the comparison is true, false otherwise.
 */
public boolean filter(Tuple t) {
    final Field field1 = t.getField(this.field);
    final Field field2 = this.operand;

    return field1.compare(this.op, field2);
}
```

实际上调用的是 Field 的 compare 方法。

比如 IntField 的信息如下：

```java
public boolean compare(Op op, Field field) {
    IntField intField = (IntField) field;

    switch (op) {
        case EQUALS:
        case LIKE:
            return value == intField.value;
        case NOT_EQUALS:
            return value != intField.value;
        case GREATER_THAN:
            return value > intField.value;
        case GREATER_THAN_OR_EQ:
            return value >= intField.value;
        case LESS_THAN:
            return value < intField.value;
        case LESS_THAN_OR_EQ:
            return value <= intField.value;
    }

    return false;
}
```

## OrderBy 排序实现

排序的原理：把所有的行放在列表中，根据排序的字段，进行排序。然后遍历返回即可。

基础属性如下：

```java
/**
 * 子节点
 */
private OpIterator child;
/**
 * 子节点-行列表
 */
private List<Tuple> childTupleList;
/**
 * 迭代器
 */
private Iterator<Tuple> iterator;
/**
 * 行描述
 */
private final TupleDesc tupleDesc;
/**
 * 排序的字段下标
 */
private final int orderByFieldIndex;
/**
 * 正序还是倒叙
 */
private final boolean asc;
```

构造器如下：

```java
public OrderBy(OpIterator child, int orderByFieldIndex, boolean asc) {
    this.child = child;
    this.tupleDesc = child.getTupleDesc();
    this.orderByFieldIndex = orderByFieldIndex;
    this.asc = asc;
}
```

open() 的方法，会进行初始化：

```java
@Override
public void open() throws DbException, TransactionAbortedException {
    // 打开执行的逻辑
    child.open();

    // 遍历初始化所有的元素
    childTupleList = new ArrayList<>();
    while (child.hasNext()) {
        childTupleList.add(child.next());
    }

    // 排序
    childTupleList.sort(new Comparator<Tuple>() {
        @Override
        public int compare(Tuple o1, Tuple o2) {
            Field field1 = o1.getField(orderByFieldIndex);
            Field field2 = o2.getField(orderByFieldIndex);
            // 二者相等
            if(field1.compare(Op.EQUALS, field2)) {
                return 0;
            }
            // 大于
            if(field1.compare(Op.GREATER_THAN, field2)) {
                return asc ? 1 : -1;
            }
            // 小于
            return asc ? -1 : 1;
        }
    });

    // 初始化迭代器
    this.iterator = childTupleList.iterator();
    super.open();
}
```

close() 比较简单，就是将迭代器置为 null：

```java
@Override
public void close() {
    super.close();
    this.iterator = null;
}
```

fetchNext() 实现如下：

```java
@Override
protected Tuple fetchNext() throws DbException, TransactionAbortedException {
    // filter 需要满足条件，这里只需要把排序后的元素输出即可。
    // iterator 会在 close 之后被设置为 null
    if(iterator != null
        && iterator.hasNext()) {
        return iterator.next();
    }

    return null;
}
```

# Join 实现

## 描述

理解了上面Filter与Predicate的关系以及OrderBy的实现思路，来做Join和JoinPredicate就会容易一点点了。

Join是连接查询实现的基本操作符，我们在MySQL中会区分内连接和外连接，我们这里只实现内连接。

```sql
select a.*,b.* from a inner join b on a.id=b.id
```

## Join 实现

JOIN 基本属性：

```java
public class Join extends Operator {

    /**
     * Iterator for the left(outer) relation to join
     */
    private OpIterator child1;
    /**
     * Iterator for the right(inner) relation to join
     */
    private OpIterator child2;

    /**
     * 行迭代器
     */
    private TupleIterator tupleIterator;
    /**
     * 行描述
     */
    private TupleDesc tupleDesc;

    /**
     * join 条件
     */
    private JoinPredicate joinPredicate;
    /**
     * join 策略
     */
    private JoinStrategy joinStrategy;
}
```

构造器

```java
// 根据 child1+child2 构造完整的 td
public Join(JoinPredicate joinPredicate,
            OpIterator child1, OpIterator child2) {
    this.joinPredicate = joinPredicate;
    this.child1 = child1;
    this.child2 = child2;

    List<TupleDesc.TDItem> itemList1 = child1.getTupleDesc().getDescList();
    List<TupleDesc.TDItem> itemList2 = child2.getTupleDesc().getDescList();
    List<TupleDesc.TDItem> allItemList = new ArrayList<>();
    allItemList.addAll(itemList1);
    allItemList.addAll(itemList2);
    this.tupleDesc = new TupleDesc(allItemList);
}
```

对应的 open/close/rewind

```java
@Override
public void open() throws DbException, TransactionAbortedException {
    //ps: 这种迭代，导致看起来很绕。。
    this.child1.open();
    this.child2.open();
    super.open();
    // 指定策略，这个接口设计不合理，导致无法主动指定？
    this.joinStrategy = new NestedLoopJoin(child1, child2, tupleDesc, joinPredicate);
    this.tupleIterator = this.joinStrategy.doJoin();
    this.tupleIterator.open();
}

@Override
public void close() {
    this.tupleIterator.close();
    this.joinStrategy.close();
    this.child2.close();
    this.child1.close();
    super.close();
}

@Override
public void rewind() throws DbException, TransactionAbortedException {
    this.close();
    this.open();
}
```

fetchNext 实现如下：

```java
@Override
protected Tuple fetchNext() throws DbException, TransactionAbortedException {
    // 直接迭代元素即可
    if (tupleIterator != null
        && tupleIterator.hasNext()) {
        return tupleIterator.next();
    }
    return null;
}
```

## TupleIterator 行内容迭代器

对 Tuple 行内容迭代的一层封装。
 
```java
public class TupleIterator implements OpIterator {

    /**
     * 内部迭代器
     */
    private Iterator<Tuple> innerIter;

    /**
     * 行描述
     */
    private final TupleDesc tupleDesc;
    /**
     * 行迭代器
     */
    private final Iterable<Tuple> tupleIterable;

    public TupleIterator(TupleDesc tupleDesc, Iterable<Tuple> tupleIterable) {
        this.tupleDesc = tupleDesc;
        this.tupleIterable = tupleIterable;
    }

}
```

## JoinPredicate 条件

只是对 Tuple 之间比较的一层封装。

我们通过制定的 index 字段进行比较。

ps: 这里可以发现，封装了一堆东西，导致理解变得复杂。

```java
/**
 * Apply the predicate to the two specified tuples. The comparison can be
 * made through Field's compare method.
 *
 * @return true if the tuples satisfy the predicate.
 */
public boolean filter(Tuple t1, Tuple t2) {
    // some code goes here
    Field field1 = t1.getField(this.field1);
    Field field2 = t2.getField(this.field2);
    return field1.compare(this.op, field2);
}
```

## JoinStrategy 策略

抽象父类，实现了最基础的方法。

```java
/**
 * 将两个 tuple 合并为一个
 * @param tuple1 第一个
 * @param tuple2 第二个
 * @param td 描述
 * @return 结果
 */
protected Tuple mergeTuple(final Tuple tuple1, final Tuple tuple2, final TupleDesc td) {
    final Tuple tuple = new Tuple(td);
    //1. 加入 t1
    int nums1 = tuple1.getTupleDesc().getDescList().size();
    for(int i = 0; i < nums1; i++) {
        tuple.setField(i, tuple1.getField(i));
    }
    //2. 加入 t2
    int nums2 = tuple2.getTupleDesc().getDescList().size();
    for(int j = 0; j < nums2; j++) {
        tuple.setField(j+nums1, tuple1.getField(j));
    }
    return tuple;
}

/**
 * 将 child 中的元素列表，放入到 tuples 数组中。
 * @param child 待获取的迭代器
 * @param tuples 数组
 * @return 数量
 * @throws Exception ex
 */
protected int fetchTuples(final OpIterator child, final Tuple[] tuples) throws Exception {
    // 使用 List 可能更加简单。使用的场景比较固定，使用数组也不错。
    int count = 0;
    //1. 清空原始数组
    Arrays.fill(tuples, null);
    // 是否需要判断 tuples.length ?
    while (child.hasNext()) {
        Tuple tuple = child.next();
        tuples[count++] = tuple;
    }
    return count;
}
```

### NestedLoopJoin

这是一个双层的嵌套循环，性能比较差。

```java
// 性能最差的 O(N^2) 的迭代
@Override
public TupleIterator doJoin() {
    List<Tuple> tupleList = new ArrayList<>();
    child1.rewind();
    while (child1.hasNext()) {
        Tuple tuple1 = child1.next();
        // 遍历 child2，匹配
        child2.rewind();
        while (child2.hasNext()) {
           Tuple tuple2 = child2.next();
           if(this.joinPredicate.filter(tuple1, tuple2)) {
                Tuple mergeTuple = mergeTuple(tuple1, tuple2, tupleDesc);
                tupleList.add(mergeTuple);
           }
        }
    }
    // 返回迭代结果
    return new TupleIterator(this.tupleDesc, tupleList);
}
```

如何优化呢？

### SortMergeJoin

主要分为几个步骤:

- 构建两个 block 缓冲块

- 对于 输入源 child1, 利用 block1 缓冲其每一个 block, 然会遍历 child2 的每一个 block, 进行 sortMergeJoin:

    - 先对两个 block 进行排序

    - 然后利用双指针算法, 进行匹配输出即可

ps: 最核心的就是 `mergeJoin()` 方法。排序后有助于提升匹配的性能。说白了就是 sort+binarySearch？

```java
/**
 * 排序合并
 *
 * @author binbin.hou
 * @since 1.1.0
 */
public class SortMergeJoin extends JoinStrategy {

    private final int     blockCacheSize = 131072 * 5;
    private Tuple[]       block1;
    private Tuple[]       block2;

    private JoinPredicate lt;
    private JoinPredicate eq;

    public SortMergeJoin(final OpIterator child1, final OpIterator child2, final TupleDesc td,
                         final JoinPredicate joinPredicate) {
        super(child1, child2, td, joinPredicate);
        final int tuple1Num = this.blockCacheSize / child1.getTupleDesc().getSize();
        final int tuple2Num = this.blockCacheSize / child2.getTupleDesc().getSize();

        // build cache block
        this.block1 = new Tuple[tuple1Num];
        this.block2 = new Tuple[tuple2Num];

        final int field1 = this.joinPredicate.getField1();
        final int field2 = this.joinPredicate.getField2();
        this.lt = new JoinPredicate(field1, Op.LESS_THAN, field2);
        this.eq = new JoinPredicate(field1, Op.EQUALS, field2);
    }

    @Override
    public TupleIterator doJoin() {
        final List<Tuple> tupleList = new ArrayList<>();

        // fetch child1
        try {
            child1.rewind();
            while (child1.hasNext()) {
                int end1 = fetchTuples(child1, block1);
                // Fetch each block of child2, and do merge join
                child2.rewind();
                while (child2.hasNext()) {
                    int end2 = fetchTuples(child2, block2);
                    mergeJoin(tupleList, end1, end2);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error happen when sort merge join:" + e.getMessage());
        }
        Arrays.fill(this.block1, null);
        Arrays.fill(this.block2, null);
        return new TupleIterator(this.tupleDesc, tupleList);
    }

    private void mergeJoin(final List<Tuple> tupleList, int end1, int end2) {
        // 1.Sort each block
        final int field1 = this.joinPredicate.getField1();
        final int field2 = this.joinPredicate.getField2();
        sortTuples(block1, end1, field1);
        sortTuples(block2, end2, field2);

        // 2.Join
        int index1 = 0, index2 = 0;
        final Op op = this.joinPredicate.getOp();
        switch (op) {
            case EQUALS: {
                while (index1 < end1 && index2 < end2) {
                    final Tuple lTuple = this.block1[index1];
                    final Tuple rTuple = this.block2[index2];
                    if (eq.filter(lTuple, rTuple)) {
                        // If equal , we should find the right boundary that equal to lTuple in block1 and rTuple in block2
                        final JoinPredicate eq1 = new JoinPredicate(field1, Op.EQUALS, field1);
                        final JoinPredicate eq2 = new JoinPredicate(field2, Op.EQUALS, field2);
                        int begin1 = index1 + 1, begin2 = index2 + 1;
                        while (begin1 < end1 && eq1.filter(lTuple, this.block1[begin1]))
                            begin1++;
                        while (begin2 < end2 && eq2.filter(rTuple, this.block2[begin2]))
                            begin2++;
                        for (int i = index1; i < begin1; i++) {
                            for (int j = index2; j < begin2; j++) {
                                tupleList.add(mergeTuple(this.block1[i], this.block2[j], this.tupleDesc));
                            }
                        }
                        index1 = begin1;
                        index2 = begin2;
                    } else if (lt.filter(lTuple, rTuple)) {
                        index1++;
                    } else {
                        index2++;
                    }
                }
                return;
            }
            case LESS_THAN:
            case LESS_THAN_OR_EQ: {
                while (index1 < end1) {
                    final Tuple lTuple = this.block1[index1++];
                    while (index2 < end2 && !this.joinPredicate.filter(lTuple, this.block2[index2]))
                        index2++;
                    while (index2 < end2) {
                        final Tuple rTuple = this.block2[index2++];
                        tupleList.add(mergeTuple(lTuple, rTuple, this.tupleDesc));
                    }
                }
                return;
            }
            case GREATER_THAN:
            case GREATER_THAN_OR_EQ: {
                while (index1 < end1) {
                    final Tuple lTuple = this.block1[index1++];
                    while (index2 < end2 && this.joinPredicate.filter(lTuple, this.block2[index2]))
                        index2++;
                    for (int i = 0; i < index2; i++) {
                        final Tuple rTuple = this.block2[i];
                        tupleList.add(mergeTuple(lTuple, rTuple, this.tupleDesc));
                    }
                }
            }
        }
    }

    private void sortTuples(final Tuple[] tuples, int field, int len) {
        final JoinPredicate lt = new JoinPredicate(field, Op.LESS_THAN, field);
        final JoinPredicate gt = new JoinPredicate(field, Op.GREATER_THAN, field);
        Arrays.sort(tuples, 0, len, (o1, o2) -> {
            if (lt.filter(o1, o2)) {
                return -1;
            }
            if (gt.filter(o1, o2)) {
                return 1;
            }
            return 0;
        });
    }

    @Override
    public void close() {
        this.block1 = null;
        this.block2 = null;
    }

}
```

### Hash-join

如果是相等的情况，可以采用 Hash 保留对应的 field.key。values 就是一个列表。

使用 Map 将时间复杂度降低为 O(1)。

不过应用场景比较低，其实也满足，因为日常开发中使用 join 基本也都是 a.id=b.id 的场景。

# 参考资料

https://github.com/CreatorsStack/CreatorDB/blob/master/document/lab2-resolve.md

* any list
{:toc}