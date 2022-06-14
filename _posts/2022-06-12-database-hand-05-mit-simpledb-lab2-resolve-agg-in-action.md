---
layout: post
title:  简易版数据库实现-04-MIT 6.830 SimpleDB Lab2 Aggregate 聚合实现
date:  2022-06-12 09:22:02 +0800
categories: [Database]
tags: [database, sh]
published: true
---

# Exercise2: Aggregates

介绍

```
一个额外的 SimpleDB 运算符使用 `GROUP BY` 子句实现基本 SQL 聚合。

您应该实现五个 SQL 聚合（`COUNT`、`SUM`、`AVG`、`MIN`、`MAX`）并支持分组。

您只需要支持单个字段的聚合，并按单个字段分组。

为了计算聚合，我们使用“聚合器（聚合器）”接口将新元组合并到聚合的现有计算中。

`Aggregator` 在构造过程中被告知它应该使用什么操作进行聚合。

随后，客户端代码应为子迭代器中的每个元组调用“Aggregator.mergeTupleIntoGroup()”。

合并所有元组后，客户端可以检索聚合结果的 OpIterator。

结果中的每个元组都是“（groupValue，aggregateValue）”形式的一对，除非分组依据字段的值是“Aggregator.NO_GROUPING”，在这种情况下，结果是“（aggregateValue）形式的单个元组`。

请注意，此实现需要与不同组的数量呈线性关系的空间。

就本实验而言，您无需担心组数超过可用内存的情况。
```

exerciese2要求我们实现各种聚合运算如count、sum、avg、min、max等，并且聚合器需要拥有分组聚合的功能。

如以下SQL语句：

```sql
SELECT SUM(fee) AS country_group_total_fee, country FROM member GROUP BY country
```

# Aggregator 

## 接口

其实接口本身的定义应该很简单：

```java
public interface Aggregator extends Serializable {
    
    /**
     * Merge a new tuple into the aggregate for a distinct group value;
     * creates a new group aggregate result if the group value has not yet
     * been encountered.
     *
     * @param tup the Tuple containing an aggregate field and a group-by field
     */
    void mergeTupleIntoGroup(Tuple tup);

    /**
     * Create a OpIterator over group aggregate results.
     * @see com.github.houbb.simpledb.learn.storage.row.TupleIterator for a possible helper
     */
    OpIterator iterator();

}
```

这里演示了常见的把接口当做常量定义的方式（不推荐的方式）：

```java
int NO_GROUPING = -1;

/**
 * SUM_COUNT and SC_AVG will
 * only be used in lab7, you are not required
 * to implement them until then.
 * */
enum Op implements Serializable {
    MIN, MAX, SUM, AVG, COUNT,
    /**
     * SUM_COUNT: compute sum and count simultaneously, will be
     * needed to compute distributed avg in lab7.
     * */
    SUM_COUNT,
    /**
     * SC_AVG: compute the avg of a set of SUM_COUNT tuples,
     * will be used to compute distributed avg in lab7.
     * */
    SC_AVG;
    /**
     * Interface to access operations by a string containing an integer
     * index for command-line convenience.
     *
     * @param s a string containing a valid integer Op index
     */
    public static Op getOp(String s) {
        return getOp(Integer.parseInt(s));
    }
    /**
     * Interface to access operations by integer value for command-line
     * convenience.
     *
     * @param i a valid integer Op index
     */
    public static Op getOp(int i) {
        return values()[i];
    }
    
    //toString()
}
```

## StringAggregator 

如果我们分组的是 string 类型的字段，那么是只支持 count 操作的

```sql
select count(*), add_date from user group by add_date;
```

### 属性

```java
public class StringAggregator implements Aggregator {

    // 分组的 map
    private Map<Field, Integer> groupMap;
    // Group by field
    private int gbField;
    private Type gbFieldType;
    // Aggregation field
    private int agField;
    // Aggregation operation
    private Op op;
    /**
     * 默认字段
     * ps: 这个名称是否会重复？还说 default 是 keyword？
     */
    private Field DEFAULT_FIELD = new StringField("Default", 10);
    /**
     * 行描述
     */
    private TupleDesc tupleDesc;
```

对应的构造器为：

```java
public StringAggregator(int gbField, Type gbFieldType,
                        int agField, Op what) {
    // 基本校验
    if(what != Op.COUNT) {
        throw new DbException("string field only support count");
    }

    this.gbField = gbField;
    this.gbFieldType = gbFieldType;
    this.agField = agField;
    // 确切的说，这里的 op 是固定的。
    this.op = what;
    this.groupMap = new HashMap<>();
}
```

### mergeTupleIntoGroup

```java
/**
 * Merge a new tuple into the aggregate, grouping as indicated in the constructor
 * @param tup the Tuple containing an aggregate field and a group-by field
 */
@Override
public void mergeTupleIntoGroup(Tuple tup) {
    //构建 desc
    if(this.tupleDesc == null) {
        //ps: 这里也有一个问题，每次的行内容是否可变，如果不变，则只需要初始化一次。
        this.initTupleDesc(tup.getTupleDesc());
    }

    final Field groupByField = tup.getField(this.gbField);
    final Field actualGbField = (this.gbField == NO_GROUPING ? DEFAULT_FIELD : groupByField);
    // 分组之后，直接根据符合条件的行累加次数即可。
    int times = this.groupMap.getOrDefault(actualGbField, 0) + 1;
    this.groupMap.put(actualGbField, times);
}
```

构造 TupleDesc 的方法如下：

```java
private void initTupleDesc(final TupleDesc tupleDesc) {
    // 什么情况下没有分组字段？纯粹是没有调用 group by 吗？
    if (this.gbField == NO_GROUPING) {
        Type[] types = new Type[]{Type.INT_TYPE};
        String[] names = new String[]{tupleDesc.getFieldName(this.gbField)};
        this.tupleDesc = new TupleDesc(types, names);
    } else {
        Type[] types = new Type[]{this.gbFieldType, Type.INT_TYPE};
        String[] names = new String[]{tupleDesc.getFieldName(this.gbField), tupleDesc.getFieldName(this.agField)};
        this.tupleDesc = new TupleDesc(types, names);
    }
}
```

### iterator

```java
@Override
public OpIterator iterator() {
    final List<Tuple> tupleList = new ArrayList<>();
    // 不做 group by  select count(*) from t?
    if(gbField == NO_GROUPING) {
        final Tuple tuple = new Tuple(this.tupleDesc);
        tuple.setField(0, new IntField(this.groupMap.get(DEFAULT_FIELD)));
        tupleList.add(tuple);
    } else {
        // 其实这里有一个问题，对于单字段的 group by，其实 groupMap 中应该也只有一个 key 才对。
        // 如果一次调用，group by 还不同，那么原来的 TupleDesc 构建一次就存在问题。
        this.groupMap.forEach((key, count)->{
            final Tuple tuple = new Tuple(this.tupleDesc);
            //key=分组的字段
            tuple.setField(0, key);
            //对应的个数
            tuple.setField(1, new IntField(count));
            tupleList.add(tuple);
        });
    }
    return new TupleIterator(this.tupleDesc, tupleList);
}
```

## IntegerAggregator

对于整数类型，我们支持 sum avg min max count

其中 `avg = sum / count;`

所以我们需要预处理统计 4 个值就可以了：sum count min max

### 属性

```java
// 分组的 map
private Map<Field, AggInfo> groupMap;
// Group by field
private int gbField;
private Type gbFieldType;
// Aggregation field
private int agField;
// Aggregation operation
private Op op;
/**
 * 默认字段
 * ps: 这个名称是否会重复？还说 default 是 keyword？
 */
private Field DEFAULT_FIELD = new StringField("Default", 10);
/**
 * 行描述
 */
private TupleDesc tupleDesc;
```

属性其实和字符串的聚合类似，AggInfo 的定义如下：

```java
private static class AggInfo {
    private int count = 0;
    //ps: sum 其实使用 long 或者 bigint 更加合理，此处暂时忽略
    private int sum = 0;
    private int min = Integer.MAX_VALUE;
    private int max = Integer.MIN_VALUE;
    
    //getter & setter
}
```

### mergeTupleIntoGroup

```java
/**
 * Merge a new tuple into the aggregate, grouping as indicated in the constructor
 * @param tup the Tuple containing an aggregate field and a group-by field
 */
@Override
public void mergeTupleIntoGroup(Tuple tup) {
    //构建 desc
    if(this.tupleDesc == null) {
        //ps: 这里也有一个问题，每次的行内容是否可变，如果不变，则只需要初始化一次。
        this.initTupleDesc(tup.getTupleDesc());
    }
    final Field groupByField = tup.getField(this.gbField);
    final Field actualGbField = (this.gbField == NO_GROUPING ? DEFAULT_FIELD : groupByField);
    // 根据 op 处理
    final IntField agField = (IntField) tup.getField(this.agField);
    final int agFieldVal = agField.getValue();
    AggInfo preInfo = this.groupMap.getOrDefault(actualGbField, new AggInfo());
    switch (op) {
        case MIN:
            preInfo.setMin(Math.min(preInfo.getMin(), agFieldVal));
            break;
        case MAX:
            preInfo.setMax(Math.max(preInfo.getMin(), agFieldVal));
            break;
        case COUNT:
            preInfo.setCount(preInfo.getCount()+1);
            break;
        case SUM:
            preInfo.setSum(preInfo.getSum() + agFieldVal);
        case AVG:
            preInfo.setCount(preInfo.getCount()+1);
            preInfo.setSum(preInfo.getSum() + agFieldVal);
            break;
    }
    // 更新
    groupMap.put(actualGbField, preInfo);
}
```

这里就是根据上面几种聚合函数，进行数的基本累加。

initTupleDesc 此处不再赘述。

### iterator

迭代和 String 聚合很像，但是需要对结果进行一点处理。

```java
@Override
public OpIterator iterator() {
    final List<Tuple> tupleList = new ArrayList<>();

    // 不做 group by  select count(*) from t?
    if(gbField == NO_GROUPING) {
        final Tuple tuple = new Tuple(this.tupleDesc);
        tuple.setField(0, new IntField(parseIntValue(DEFAULT_FIELD)));
        tupleList.add(tuple);
    } else {
        this.groupMap.forEach((key, count)->{
            final Tuple tuple = new Tuple(this.tupleDesc);
            tuple.setField(0, key);
            tuple.setField(1, new IntField(parseIntValue(key)));
            tupleList.add(tuple);
        });
    }

    return new TupleIterator(this.tupleDesc, tupleList);
}
```

主要就是一个 parseIntValue 方法：

```java
private int parseIntValue(Field aggField) {
    // key 是否存在的判断是多余的，本来就是以 key 作为条件循环。
    AggInfo aggInfo = groupMap.get(aggField);
    switch (op) {
        case MIN:
            return aggInfo.getMin();
        case MAX:
            return aggInfo.getMax();
        case COUNT:
            return aggInfo.getCount();
        case SUM:
            return aggInfo.getSum();
        case AVG:
            return aggInfo.getSum() / aggInfo.getCount();
    }
    return 0;
}
```

ps: 这里应该进一步的抽象，比如 number 类型，都可以支持对应的操作运算。

# Aggregate

## 说明

上面说到，AVG运算当需要获取聚合结果时，再进行计算返回，那么在哪里会来获取聚合结果呢？

在Aggregate中，因为Aggregate是真正暴露给外部执行SQL语句调用的，Aggregate会根据聚合字段的类型来选择具体的聚合器。

## 实现

### 属性

```java
/**
 * 聚合字段
 */
private final int agField;
/**
 * 分组字段
 */
private final int gbField;
/**
 * 分组字段类型
 */
private final Type gbFieldType;
/**
 * 聚合操作符
 */
private final Aggregator.Op op;
/**
 * 待处理信息
 */
private OpIterator child;
/**
 * 行描述
 */
private TupleDesc tupleDesc;
/**
 * 行迭代器
 */
private TupleIterator iterator;
```

对应的构造器如下：

```java
public Aggregate(OpIterator child, int agField, int gbField, Aggregator.Op aop) {
    this.agField = agField;
    this.gbField = gbField;
    this.op = aop;
    this.child = child;

    TupleDesc originTd = this.child.getTupleDesc();
    this.gbFieldType = (this.gbField == Aggregator.NO_GROUPING
            ? null : originTd.getFieldType(this.gbField));
}
```

ps: 没什么特别的，就是如果没有分组字段，则类型为 null 而已。

### open

```java
public void open() throws NoSuchElementException, DbException, TransactionAbortedException {
    super.open();
    this.child.open();

    TupleDesc originTd = this.child.getTupleDesc();
    // Build aggregator
    /**
     * 聚合实现
     */
    Aggregator aggregator;
    if (originTd.getFieldType(agField) == Type.INT_TYPE) {
        aggregator = new IntegerAggregator(this.gbField, this.gbFieldType, this.agField, this.op);
    } else {
        aggregator = new StringAggregator(this.gbField, this.gbFieldType, this.agField, this.op);
    }

    // Merge tuples into group
    while (this.child.hasNext()) {
        final Tuple tuple = this.child.next();
        aggregator.mergeTupleIntoGroup(tuple);
    }
    this.iterator = (TupleIterator) aggregator.iterator();
    this.iterator.open();
}
```

主要就是根据聚合的字段类型，选定对应的 aggregator 策略。

然后调用 `aggregator.mergeTupleIntoGroup(tuple);` 方法。

获取对应的 `aggregator.iterator();` 结果。

### getTupleDesc

这个方法也比较简单，和前面类似：

```java
public TupleDesc getTupleDesc() {
    if (this.tupleDesc != null) {
        return this.tupleDesc;
    }

    if (this.gbField == Aggregator.NO_GROUPING) {
        Type[] types = new Type[]{Type.INT_TYPE};
        String[] names = new String[]{this.aggregateFieldName()};
        this.tupleDesc = new TupleDesc(types, names);
    } else {
        Type[] types = new Type[]{this.gbFieldType, Type.INT_TYPE};
        String[] names = new String[]{this.groupFieldName(), this.aggregateFieldName()};
        this.tupleDesc = new TupleDesc(types, names);
    }

    return this.tupleDesc;
}
```

# 参考资料

https://github.com/CreatorsStack/CreatorDB/blob/master/document/lab2-resolve.md

* any list
{:toc}