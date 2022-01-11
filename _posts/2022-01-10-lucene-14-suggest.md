---
layout: post
title: Lucene-14-suggest lucene 搜索之联想词提示之 suggest 原理和应用
date: 2022-01-10 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# InputIterator说明

## 联想词

lucene的联想词是在org.apache.lucene.search.suggest包下边，**提供了自动补全或者联想提示功能的支持**。

InputIterator 是一个支持枚举term,weight,payload三元组的供suggester使用的接口，目前仅支持AnalyzingSuggester,FuzzySuggester andAnalyzingInfixSuggester 三种suggester支持payloads；

## 接口

```java
/**
 * Interface for enumerating term,weight,payload triples for suggester consumption;
 * currently only {@link AnalyzingSuggester}, {@link
 * FuzzySuggester} and {@link AnalyzingInfixSuggester} support payloads.
 */
public interface InputIterator extends BytesRefIterator {

  /** A term's weight, higher numbers mean better suggestions. */
  // 权重
  public long weight();
  
  /** An arbitrary byte[] to record per suggestion.  See
   *  {@link LookupResult#payload} to retrieve the payload
   *  for each suggestion. */
   // 载荷信息
   // 每个suggestion对应的元数据的二进制表示，我们在传输对象的时候需要转换对象或对象的某个属性为BytesRef类型，相应的suggester调用lookup的时候会返回payloads信息；
  public BytesRef payload();

  /** Returns true if the iterator has payloads */
  // 是否包含载荷
  public boolean hasPayloads();
  
  /** 
   * A term's contexts context can be used to filter suggestions.
   * May return null, if suggest entries do not have any context
   * */
   // 上下文
   // 获取某个term的contexts,用来过滤suggest的内容，如果suggest的列表为空，返回null
  public Set<BytesRef> contexts();
  
  /** Returns true if the iterator has contexts */
  // 是否包含上下文
  public boolean hasContexts();
  
  /** Singleton InputIterator that iterates over 0 BytesRefs. */
  public static final InputIterator EMPTY = new InputIteratorWrapper(BytesRefIterator.EMPTY);
  
  /**
   * Wraps a BytesRefIterator as a suggester InputIterator, with all weights
   * set to <code>1</code> and carries no payload
   */
  public static class InputIteratorWrapper implements InputIterator {
    private final BytesRefIterator wrapped;
    
    /** 
     * Creates a new wrapper, wrapping the specified iterator and 
     * specifying a weight value of <code>1</code> for all terms 
     * and nullifies associated payloads.
     */
    public InputIteratorWrapper(BytesRefIterator wrapped) {
      this.wrapped = wrapped;
    }

    @Override
    public long weight() {
      return 1;
    }

    @Override
    public BytesRef next() throws IOException {
      return wrapped.next();
    }

    @Override
    public BytesRef payload() {
      return null;
    }

    @Override
    public boolean hasPayloads() {
      return false;
    }

    @Override
    public Set<BytesRef> contexts() {
      return null;
    }

    @Override
    public boolean hasContexts() {
      return false;
    }
  }
}
```

BytesRefIterator 对应的内容也比较简单：

```java
/**
 * A simple iterator interface for {@link BytesRef} iteration.
 */
public interface BytesRefIterator {

  /**
   * Increments the iteration to the next {@link BytesRef} in the iterator.
   * Returns the resulting {@link BytesRef} or <code>null</code> if the end of
   * the iterator is reached. The returned BytesRef may be re-used across calls
   * to next. After this method returns null, do not call it again: the results
   * are undefined.
   * 
   * @return the next {@link BytesRef} in the iterator or <code>null</code> if
   *         the end of the iterator is reached.
   * @throws IOException If there is a low-level I/O error.
   */
  public BytesRef next() throws IOException;
  
  /** Singleton BytesRefIterator that iterates over 0 BytesRefs. */
  public static final BytesRefIterator EMPTY = new BytesRefIterator() {

    @Override
    public BytesRef next() {
      return null;
    }
  };
}
```

ps: 其实这就是一个简单的 Iterator 接口，类似于 list 的迭代器接口。

## 实现类

InputIterator 的实现类有以下几种：

BufferedInputIterator：对二进制类型的输入进行轮询；

DocumentInputIterator：从索引中被store的field中轮询；

FileIterator：从文件中每次读出单行的数据轮询，以\t进行间隔（且\t的个数最多为2个）；

HighFrequencyIterator：从索引中被store的field轮询，忽略长度小于设定值的文本；

InputIteratorWrapper：遍历BytesRefIterator并且返回的内容不包含payload且weight均为1；

SortedInputIterator：二进制类型的输入轮询且按照指定的comparator算法进行排序；

# Suggester查询工具Lookup类说明

此类提供了字符串的联想查询功能

Lookup类提供了一个CharSequenceComparator，此comparator主要是用来对CharSequence进行排序，按字符顺序排序；

内置LookupResult，用于返回suggest的结果，同时也是按照CharSequenceComparator进行key的排序；

内置了LookupPriorityQueue，用以存储LookupResult;

## 方法

LookUp 提供的方法

build(Dictionary dict)  ： 从指定directory进行build;

load(InputStream input) ： 将InputStream转成DataInput并执行load(DataInput)方法；

store(OutputStream output) ： 将OutputStream转成DataOutput并执行store(DataOutput)方法；

getCount() ： 获取lookup的build的项的数量；

build(InputIterator inputIterator) ： 根据指定的InputIterator构建Lookup对象；

lookup(CharSequence key, boolean onlyMorePopular, int num) ：根据key查询可能的结果返回值为 `List<LookupResult>`;

# 代码实战

## maven 引入

```xml
<dependency>
    <groupId>org.apache.lucene</groupId>
    <artifactId>lucene-suggest</artifactId>
    <version>7.2.1</version>
</dependency>
<dependency>
    <groupId>org.apache.lucene</groupId>
    <artifactId>lucene-misc</artifactId>
    <version>7.2.1</version>
</dependency>
```

## 代码

### 实体类

```java
import java.io.Serializable;
import java.util.Arrays;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class Product implements Serializable {

    private String name;
    private String image;
    private String[] regions;
    private int numberSold;

    public Product(String name, String image, String[] regions, int numberSold) {
        this.name = name;
        this.image = image;
        this.regions = regions;
        this.numberSold = numberSold;
    }

    //getter setter toString

}
```

对应的迭代器：

实现 InputIterator 的所有接口。

```java
import org.apache.lucene.search.suggest.InputIterator;
import org.apache.lucene.util.BytesRef;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * 定义产品迭代器
 *
 * @author binbin.hou
 * @since 1.0.0
 */
public class ProductIterator implements InputIterator {

    private final Iterator<Product> productIterator;

    private Product currentProduct;

    ProductIterator(Iterator<Product> productIterator) {
        this.productIterator = productIterator;
    }

    @Override
    public boolean hasContexts() {
        return true;
    }

    /**
     * 是否有设置payload信息
     */
    @Override
    public boolean hasPayloads() {
        return true;
    }

    public Comparator<BytesRef> getComparator() {
        return null;
    }

    @Override
    public BytesRef next() {
        if (productIterator.hasNext()) {
            currentProduct = productIterator.next();
            try {
                return new BytesRef(currentProduct.getName().getBytes("UTF8"));
            } catch (UnsupportedEncodingException e) {
                throw new RuntimeException("Couldn't convert to UTF-8",e);
            }
        } else {
            return null;
        }
    }

    @Override
    public BytesRef payload() {
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream out = new ObjectOutputStream(bos);
            out.writeObject(currentProduct);
            out.close();
            return new BytesRef(bos.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Well that's unfortunate.");
        }
    }
    @Override
    public Set<BytesRef> contexts() {
        try {
            Set<BytesRef> regions = new HashSet<BytesRef>();
            for (String region : currentProduct.getRegions()) {
                regions.add(new BytesRef(region.getBytes("UTF8")));
            }
            return regions;
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Couldn't convert to UTF-8");
        }
    }


    @Override
    public long weight() {
        return currentProduct.getNumberSold();
    }

}
```

### 工具方法

定义 lookUp 查询方法：

```java
private static void lookup(AnalyzingInfixSuggester suggester, String name,
                           String region) throws IOException {
    HashSet<BytesRef> contexts = new HashSet<>();
    contexts.add(new BytesRef(region.getBytes("UTF8")));
    List<Lookup.LookupResult> results = suggester.lookup(name, contexts, 2, true, false);
    System.out.println("-- \"" + name + "\" (" + region + "):");
    for (Lookup.LookupResult result : results) {
        System.out.println(result.key);
        BytesRef bytesRef = result.payload;
        ObjectInputStream is = new ObjectInputStream(new ByteArrayInputStream(bytesRef.bytes));
        Product product = null;
        try {
            product = (Product)is.readObject();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        System.out.println("product-Name:" + product.getName());
        System.out.println("product-regions:" + product.getRegions());
        System.out.println("product-image:" + product.getImage());
        System.out.println("product-numberSold:" + product.getNumberSold());
    }
    System.out.println();
}
```

### 测试

测试代码如下：

```java
public static void main(String[] args) {
    try {
        Directory indexDir = FSDirectory.open(Paths.get("suggestPath"));
        StandardAnalyzer analyzer = new StandardAnalyzer();
        AnalyzingInfixSuggester suggester = new AnalyzingInfixSuggester(indexDir, analyzer);
        ArrayList<Product> products = new ArrayList<>();
        products.add(new Product("Electric Guitar",
                "http://images.example/electric-guitar.jpg", new String[] {
                "US", "CA" }, 100));
        products.add(new Product("Electric Train",
                "http://images.example/train.jpg", new String[] { "US",
                "CA" }, 100));
        products.add(new Product("Acoustic Guitar",
                "http://images.example/acoustic-guitar.jpg", new String[] {
                "US", "ZA" }, 80));
        products.add(new Product("Guarana Soda",
                "http://images.example/soda.jpg",
                new String[] { "ZA", "IE" }, 130));
        suggester.build(new ProductIterator(products.iterator()));
        lookup(suggester, "Gu", "US");
        lookup(suggester, "Gu", "ZA");
        lookup(suggester, "Gui", "CA");
        lookup(suggester, "Electric guit", "US");
        suggester.refresh();
    } catch (IOException e) {
        System.err.println("Error!");
    }
}
```

日志如下：

```
-- "Gu" (US):
Electric Guitar
product-Name:Electric Guitar
product-regions:[Ljava.lang.String;@1e730495
product-image:http://images.example/electric-guitar.jpg
product-numberSold:100
Acoustic Guitar
product-Name:Acoustic Guitar
product-regions:[Ljava.lang.String;@7d3a22a9
product-image:http://images.example/acoustic-guitar.jpg
product-numberSold:80

-- "Gu" (ZA):
Guarana Soda
product-Name:Guarana Soda
product-regions:[Ljava.lang.String;@1d082e88
product-image:http://images.example/soda.jpg
product-numberSold:130
Acoustic Guitar
product-Name:Acoustic Guitar
product-regions:[Ljava.lang.String;@60704c
product-image:http://images.example/acoustic-guitar.jpg
product-numberSold:80

-- "Gui" (CA):
Electric Guitar
product-Name:Electric Guitar
product-regions:[Ljava.lang.String;@6b19b79
product-image:http://images.example/electric-guitar.jpg
product-numberSold:100

-- "Electric guit" (US):
Electric Guitar
product-Name:Electric Guitar
product-regions:[Ljava.lang.String;@1a04f701
product-image:http://images.example/electric-guitar.jpg
product-numberSold:100
```

可以发现，这里会对内容自动补全，返回联想之后对应的结果。

# 参考资料

[一步一步跟我学习lucene（10）---lucene搜索之联想词提示之suggest原理和应用](https://blog.csdn.net/wuyinggui10000/article/details/45788251)

* any list
{:toc}