---
layout: post
title: Apache Calcite 如何基于 calcite 自定义实现一个数据库-51-支持过滤的简单 csv 数据库
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 思路

直接参考 calcite csv 模块的代码，实现一个最简单版本的 csv database.

# 官方过滤的例子

官方的例子看了下应该只是支持 2 个

AND 和 EUQALS

- CsvFilterableTable.java

```java
private static boolean addFilter(RexNode filter, @Nullable Object[] filterValues) {
    if (filter.isA(SqlKind.AND)) {
        // We cannot refine(remove) the operands of AND,
        // it will cause o.a.c.i.TableScanNode.createFilterable filters check failed.
      ((RexCall) filter).getOperands().forEach(subFilter -> addFilter(subFilter, filterValues));
    } else if (filter.isA(SqlKind.EQUALS)) {
      final RexCall call = (RexCall) filter;
      RexNode left = call.getOperands().get(0);
      if (left.isA(SqlKind.CAST)) {
        left = ((RexCall) left).operands.get(0);
      }
      final RexNode right = call.getOperands().get(1);
      if (left instanceof RexInputRef
          && right instanceof RexLiteral) {
        final int index = ((RexInputRef) left).getIndex();
        if (filterValues[index] == null) {
          filterValues[index] = ((RexLiteral) right).getValue2().toString();
          return true;
        }
      }
    }
    return false;
  }
```

和原来的 scan 对比，这里多了后面的 `List<RexNode> filters` 参数。

这里应该就是 where 后面的条件参数。

# 自定义 filterable table

和原来的 scannable table 类似。

我们需要在 csv 遍历的时候，加一下我们的过滤器。

## scan 原来的样子

```java
@Override
    public Enumerable<Object[]> scan(DataContext root, List<RexNode> list) {
        JavaTypeFactory typeFactory = root.getTypeFactory();
        final List<RelDataType> fieldTypes = getFieldTypes(typeFactory);
        final List<Integer> fields = ImmutableIntList.identity(fieldTypes.size());

        // 这个做什么的？
        final AtomicBoolean cancelFlag = DataContext.Variable.CANCEL_FLAG.get(root);

        // 构建一个遍历结果
        List<String> dataLines = FileUtil.readAllLines(csvFile, charset, 1, Integer.MAX_VALUE, false);

        // TODO: 添加过滤

        return new CsvEnumerable(dataLines, fieldTypes);
    }
```

## 添加过滤条件

代码调整如下：

```java
    @Override
    public Enumerable<Object[]> scan(DataContext root, List<RexNode> list) {
        JavaTypeFactory typeFactory = root.getTypeFactory();
        final List<RelDataType> fieldTypes = getFieldTypes(typeFactory);
        final List<Integer> fields = ImmutableIntList.identity(fieldTypes.size());

        // 这个做什么的？
        final AtomicBoolean cancelFlag = DataContext.Variable.CANCEL_FLAG.get(root);

        // 构建一个遍历结果
        List<String> dataLines = FileUtil.readAllLines(csvFile, charset, 1, Integer.MAX_VALUE, false);

        // TODO: 添加过滤
        Map<String, List<String>> conditionMap = new HashMap<>();
        for(RexNode rexNode : list) {
            addFilter(rexNode, conditionMap);
        }

        return new CsvEnumerable(dataLines, fieldTypes, conditionMap);
    }
```

官方例子原始的 RexNode 实现，使用的是数组。

实际上只是做了简单的事情，存储对应的 index 下面要 equals 过滤的词而已。

我们这里直接使用 Map 来存储，效果类似。

### addFilter

addFilter 的实现如下：

```java
    //key 字段名称
    // value 是一个list，可能这样写 where name='A' and name='B'。虽然比较傻，但是支持。
    private static void addFilter(RexNode filter, final Map<String, List<String>> conditionMap) {
        if (filter.isA(SqlKind.AND)) {
            // We cannot refine(remove) the operands of AND,
            // it will cause o.a.c.i.TableScanNode.createFilterable filters check failed.
            // 递归
            ((RexCall) filter).getOperands().forEach(subFilter -> addFilter(subFilter, conditionMap));
        } else if (filter.isA(SqlKind.EQUALS)) {
            final RexCall call = (RexCall) filter;
            RexNode left = call.getOperands().get(0);
            if (left.isA(SqlKind.CAST)) {
                left = ((RexCall) left).operands.get(0);
            }
            final RexNode right = call.getOperands().get(1);
            if (left instanceof RexInputRef
                    && right instanceof RexLiteral) {
                final String leftName = ((RexInputRef)left).getName();
                String rightValue = ((RexLiteral) right).getValue2().toString();

                List<String> conditonList = conditionMap.getOrDefault(leftName, new ArrayList<>());
                conditonList.add(rightValue);

                conditionMap.put(leftName, conditonList);
            }
        }
    }
```

### CsvEnumerable 枚举类

添加 conditionMap，我们需要在在遍历的时候，做一下数据的过滤处理。

```java
package com.github.houbb.calcite.adaptor.csv;

import com.github.houbb.heaven.util.util.MapUtil;
import org.apache.calcite.linq4j.AbstractEnumerable;
import org.apache.calcite.linq4j.Enumerator;
import org.apache.calcite.rel.type.RelDataType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * csv 数据库
 *
 * @since 0.1.0
 */
public class CsvEnumerable extends AbstractEnumerable<Object[]> {

    /**
     * csv 文件
     */
    private final List<String> dataLines;

    private final List<RelDataType> fieldTypes;

    private int index = 0;

    /**
     * @since v0.2.0 条件 map
     */
    private final Map<Integer, List<String>> conditionMap;

    /**
     * 当前行信息
     * @since 0.2.0
     */
    private Object[] currentRow;

    public CsvEnumerable(List<String> allLines, List<RelDataType> fieldTypes) {
        this(allLines, fieldTypes, new HashMap<>());
    }

    public CsvEnumerable(List<String> allLines, List<RelDataType> fieldTypes,
                         final Map<Integer, List<String>> conditionMap) {
        this.dataLines = allLines;
        this.fieldTypes = fieldTypes;
        index = 0;
        this.conditionMap = conditionMap;
    }

    private Object[] buildRowDataArray(String rowLine) {
        Object[] dataArray = new Object[fieldTypes.size()];

        // 逗号拆分
        String[] datas = rowLine.split(",");
        int index = 0;
        for(String data : datas) {
            // 根据类别转换处理，此处省略。
            dataArray[index++] = data;
        }
        return dataArray;
    }

    @Override
    public Enumerator<Object[]> enumerator() {
        return new Enumerator<Object[]>() {
            @Override
            public Object[] current() {
                return currentRow;
            }

            @Override
            public boolean moveNext() {
                if(index >= dataLines.size()) {
                    return false;
                }

                // 根据 match 匹配
                boolean match = false;
                while (index < dataLines.size()) {
                    match = isMatchFilter();

                    index++;
                    if(match) {
                        // 满足，则跳过循环
                        break;
                    }
                }

                return match;
            }

            @Override
            public void reset() {
                index = 0;
            }

            @Override
            public void close() {
                // 这个是什么概念？
                // 我们一次读取完成的，暂时不需要考虑。
                // 如果是文件流，这里需要做流的关闭
            }
        };
    }

    private boolean isMatchFilter() {
        String currentLine = dataLines.get(index);
        currentRow = buildRowDataArray(currentLine);

        if(MapUtil.isEmpty(conditionMap)) {
            return true;
        }
        // 条件判断
        for(Map.Entry<Integer, List<String>> entry : conditionMap.entrySet()) {
            Integer index = entry.getKey();
            List<String> expectEqualValues = entry.getValue();

            // 判断是否全部满足
            String realValue = String.valueOf(currentRow[index]);
            for(String expectValue : expectEqualValues) {
                if(!expectValue.equals(realValue)) {
                    return false;
                }
            }
        }

        return true;

    }

}
```

主要是加了个 isMatchFilter 的过滤。

## 测试

```java
        // 5.执行SQL查询，通过SQL方式访问csv文件
        String sql = "select * from csv.depts where name='Fred'";
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery(sql);
```

文本数据：

```
EMPNO:long,NAME:string,DEPTNO:int,GENDER:string,CITY:string,EMPID:int,AGE:int,SLACKER:boolean,MANAGER:boolean,JOINEDAT:date
100,Fred,10,,,30,25,true,false,1996-08-03
110,Eric,20,M,San Francisco,3,80,,false,2001-01-01
110,John,40,M,Vancouver,2,,false,true,2002-05-03
120,Wilma,20,F,,1,5,,true,2005-09-07
130,Alice,40,F,Vancouver,2,,false,true,2007-01-01
```

测试结果

```
Number of columns: 10
empno: 100
name: Fred
deptno: 10
gender: 
city: 
empid: 30
age: 25
slacker: true
manager: false
joinedat: 1996-08-03
```

# 小结

整体而言，filter 相对而言会麻烦一点。

整体思路就是解析 RexNode，然后存储所有的条件。在遍历数据的时候，进行统一的过滤。

# 参考资料

[10分钟教你写一个数据库](https://cloud.tencent.com/developer/article/2186646)

* any list
{:toc}