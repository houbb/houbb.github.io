---
layout: post
title: Data Struct-TreeMap 排序的新姿势
date:  2019-3-28 09:47:51 +0800
categories: [Java]
tags: [java, data-struct, sh]
published: true
---

# 场景

自定的 filter 等常见实现，如果我们希望指定优先级顺序，一般会定义注解。

根据 `order()` 属性去指定相关的顺序。

## 问题

如果我们需要排序，怎么处理？

## 方法一、定义一个全新的对象

伪代码如下：

- 包含过滤器和顺序的对象

```java
class FilterBo {
    private Filter filter;
    private int order;
}
```

- 构建

```java
// 循环，直接判断
// 构建 FilterBo
// 存放满足条件的 FilterBo
List<FilterBo> filterBoList = XXX;

// 排序
Collections.sort(filterBoList);
```

- 获取

在使用的时候，用户不关心 order 属性，需要再次拆分成 Filter

```java
// 循环拆分
for(FilterBo bo : boList) {
    filterList.add(bo.getFilter());
}
```

### 思考

这是我以前经常用的一种方式，但是忽然觉得很麻烦。

主要有两点：

1. 新增了一个中间对象 FilterBo，仅仅是为了存放排序的 order 属性。

2. 对 Filter 进行封装和解封装，仅仅是为了排序。

## 方式二：利用 TreeMap 进行排序

想到一种方式，利用 TreeMap 里帮助我们完成排序。

- 构建

```java
Map<Integer, Filter> map = new TreeMap<>();

// 各种处理
map.put(order, filter);
```

- 获取

获取的时候不需要进行排序，因为 TreeMap  会默认按照 key 为我们排好序

```java
List<Filter> filterList = new ArrayList(map.values());
```


### 缺点

这里因为是基于 map，就必须保证 order 的唯一性。

因为这个是自己可以把控的，所以也可以接受。

# TreeMap

java中可以排序的工具类和接口共有五个SortedMap 、SortedSet、TreeMap 、TreeSet和Collections。

由于我要排序的是一系列model，所以，最后使用了TreeMap对象，而且TreeMap到最后的处理比较自由，可以直接返回TreeMap对象，也可以返回model的一个Collection对象。

# 快速入门

## 默认排序

- 测试代码

```java
import java.util.TreeMap;

/**
 * @author binbin.hou
 */
public class TreeMapSortTest {

    public static void main(String[] args) {
        TreeMap<String, String> map = new TreeMap<>();

        map.put("abcd", "abcd");
        map.put("Abc", "Abc");
        map.put("bbb", "bbb");
        map.put("BBBB", "BBBB");
        map.put("北京", "北京");
        map.put("中国", "中国");
        map.put("上海", "上海");
        map.put("厦门", "厦门");
        map.put("香港", "香港");
        map.put("碑海", "碑海");

        for (String string : map.values()) {
            System.out.println(string);
        }
    }
}
```

- 测试日志

```
Abc
BBBB
abcd
bbb
上海
中国
北京
厦门
碑海
香港
```

注意，这里的数字排序正常，而英文排序是区分大小写的，这个也是正常的，因为ASCII码中小写字母比大写字母靠后，中文排序则明显的不正确，碑和北明显应该在一起的，而且应该在最前面。

这个主要是java中使用中文编码GB2312或者JBK时，char型转换成int型得过程出现了比较大的偏差，很多文章介绍过了，大家可以去网上找一下，这里不多说了，直接寻找解决方案。

Java中之所以出现偏差，主要是compare方法的问题，所以这里自己实现Comparator接口，而国际化的问题，使用Collator类来解决。

## 自定义比较器

- 测试代码

使用自定义排序器

```java
TreeMap<String, String> map = new TreeMap<>(new Comparator<String>() {
    @Override
    public int compare(String o1, String o2) {
        Collator collator = Collator.getInstance();
        CollationKey key1 = collator.getCollationKey(o1);
        CollationKey key2 = collator.getCollationKey(o2);
        return key1.compareTo(key2);
    }
});
```

- 排序结果

```
Abc
abcd
bbb
BBBB
碑海
北京
上海
厦门
香港
中国
```

现在可以看到，排序已经完全符合我们的要求了。

## 反向排序

如果要反向排序也很容易，遍历的时候倒过来，或者你写两个Comparator的实现类，正向的排序就像我们前面所写的，反向排序就将return key1.compareTo(key2);

修改成return -key1.compareTo(key2);，加了个负号，这里你可以直接加个符号看看效果，结果我就不写了。

### descendingMap

参考的这篇文档说没有发现逆序，看了下源码。可以用如下的方式：

```java
// 逆序
Map<String, String> reverseMap = map.descendingMap();
for (String string : reverseMap.values()) {
    System.out.println(string);
}
```

### 其他的方式

你也可以直接利用 map.values() 创建一个链表，然后利用 List.reverse() 方法。

# 线程安全性

注意，TreeMap 不是线程安全的。


# 源码分析

jdk 版本如下：

```
java version "1.8.0_191"
```

## 简介

TreeMap是通过红黑树实现的，TreeMap存储的是key-value键值对，TreeMap的排序是基于对key的排序。

## 接口

```java
public class TreeMap<K,V>
    extends AbstractMap<K,V>
    implements NavigableMap<K,V>, Cloneable, java.io.Serializable
```

## 内部变量 

```java
/**
 * The comparator used to maintain order in this tree map, or
 * null if it uses the natural ordering of its keys.
 *
 * @serial
 */
private final Comparator<? super K> comparator;

private transient Entry<K,V> root;

/**
 * The number of entries in the tree
 */
private transient int size = 0;

/**
 * The number of structural modifications to the tree.
 */
private transient int modCount = 0;
```

## 构造器

主要几类：

1. 是否有比较器

2. 是否有初始值

```java
public TreeMap() {
    comparator = null;
}

public TreeMap(Comparator<? super K> comparator) {
    this.comparator = comparator;
}

public TreeMap(Map<? extends K, ? extends V> m) {
    comparator = null;
    putAll(m);
}

public TreeMap(SortedMap<K, ? extends V> m) {
    comparator = m.comparator();
    try {
        buildFromSorted(m.size(), m.entrySet().iterator(), null, null);
    } catch (java.io.IOException cannotHappen) {
    } catch (ClassNotFoundException cannotHappen) {
    }
}
```

### 内部方法

- putAll()

```java
public void putAll(Map<? extends K, ? extends V> map) {
    int mapSize = map.size();
    if (size==0 && mapSize!=0 && map instanceof SortedMap) {
        Comparator<?> c = ((SortedMap<?,?>)map).comparator();
        if (c == comparator || (c != null && c.equals(comparator))) {
            ++modCount;
            try {
                buildFromSorted(mapSize, map.entrySet().iterator(),
                                null, null);
            } catch (java.io.IOException cannotHappen) {
            } catch (ClassNotFoundException cannotHappen) {
            }
            return;
        }
    }
    super.putAll(map);
}
```

- buildFromSorted()

putAll() 和构造器中都用到了 buildFromSorted() 方法，实现如下：

```java
private void buildFromSorted(int size, Iterator<?> it,
                             java.io.ObjectInputStream str,
                             V defaultVal)
    throws  java.io.IOException, ClassNotFoundException {
    this.size = size;
    root = buildFromSorted(0, 0, size-1, computeRedLevel(size),
                           it, str, defaultVal);
}
```

- computeRedLevel()

计算应该在红黑树哪一层

```java
private static int computeRedLevel(int sz) {
    int level = 0;
    for (int m = sz - 1; m >= 0; m = m / 2 - 1)
        level++;
    return level;
}
```

- buildFromSorted(XXX)

要理解buildFromSorted，重点说明以下几点：

第一，buildFromSorted是通过递归将SortedMap中的元素逐个关联。

第二，buildFromSorted返回middle节点(中间节点)作为root。

第三，buildFromSorted添加到红黑树中时，只将level == redLevel的节点设为红色。

第level级节点，实际上是buildFromSorted转换成红黑树后的最底端(假设根节点在最上方)的节点；只将红黑树最底端的阶段着色为红色，其余都是黑色。

```java
private final Entry<K,V> buildFromSorted(int level, int lo, int hi,
                                         int redLevel,
                                         Iterator<?> it,
                                         java.io.ObjectInputStream str,
                                         V defaultVal)
    throws  java.io.IOException, ClassNotFoundException {
    if (hi < lo) return null;
    int mid = (lo + hi) >>> 1;
    Entry<K,V> left  = null;
    if (lo < mid)
        left = buildFromSorted(level+1, lo, mid - 1, redLevel,
                               it, str, defaultVal);
    // extract key and/or value from iterator or stream
    K key;
    V value;
    if (it != null) {
        if (defaultVal==null) {
            Map.Entry<?,?> entry = (Map.Entry<?,?>)it.next();
            key = (K)entry.getKey();
            value = (V)entry.getValue();
        } else {
            key = (K)it.next();
            value = defaultVal;
        }
    } else { // use stream
        key = (K) str.readObject();
        value = (defaultVal != null ? defaultVal : (V) str.readObject());
    }
    Entry<K,V> middle =  new Entry<>(key, value, null);
    // color nodes in non-full bottommost level red
    if (level == redLevel)
        middle.color = RED;
    if (left != null) {
        middle.left = left;
        left.parent = middle;
    }
    if (mid < hi) {
        Entry<K,V> right = buildFromSorted(level+1, mid+1, hi, redLevel,
                                           it, str, defaultVal);
        middle.right = right;
        right.parent = middle;
    }
    return middle;
}
```

## 基本查询方法

```java
// Query Operations
public int size() {
    return size;
}

public boolean containsKey(Object key) {
    return getEntry(key) != null;
}

public boolean containsValue(Object value) {
    for (Entry<K,V> e = getFirstEntry(); e != null; e = successor(e))
        if (valEquals(value, e.value))
            return true;
    return false;
}

public V get(Object key) {
    Entry<K,V> p = getEntry(key);
    return (p==null ? null : p.value);
}

public Comparator<? super K> comparator() {
    return comparator;
}

public K firstKey() {
    return key(getFirstEntry());
}

public K lastKey() {
    return key(getLastEntry());
}
```

# 拓展阅读

[除却 Comaprable/Comaprator，流式比较器 Ordering](https://houbb.github.io/2018/10/25/guava-group-sort)

[红黑树](https://houbb.github.io/2018/09/12/data-struct-red-black-tree)

# 参考资料

- oracle

https://docs.oracle.com/javase/7/docs/api/java/util/TreeMap.html

https://docs.oracle.com/javase/8/docs/api/java/util/TreeMap.html

- 使用

[java TreeMap用法](https://www.cnblogs.com/jixu8/p/5939533.html)

- 源码

[Java集合，TreeMap底层实现和原理 ](https://my.oschina.net/90888/blog/1626065)

[Java提高篇（二七）-----TreeMap](https://www.cnblogs.com/chenssy/p/3746600.html)

[Java 集合系列12之 TreeMap详细介绍(源码解析)和使用示例](https://www.cnblogs.com/skywang12345/p/3310928.html)

https://www.cnblogs.com/yueyanglou/p/5283915.html

* any list
{:toc}