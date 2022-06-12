---
layout: post
title:  简易版数据库实现-02-MIT 6.830 SimpleDB lab1 存储模型
date:  2022-06-12 09:22:02 +0800
categories: [Database]
tags: [database, sh]
published: true
---

# 1.Intro

lab1实现数据库基本的存储逻辑结构，具体包括：Tuple,TupleDesc,HeapPage,HeapFile,SeqScan, BufferPool等。

Tuple和TupleDesc是数据库表的最基本元素了。

Tuple就是一个若干个Field的，TupleDesc则是一个表的meta-data，包括每列的field name和type。

HeapPage和HeapFile都分别是Page和DbFile interface的实现

BufferPool是用来做缓存的，getPage会优先从这里拿，如果没有，才会调用File的readPage去从文件中读取对应page，disk中读入的page会缓存在其中。

SeqScan用来遍历一个table的所有tuple，包装了HeapFile的iterator。

画了个大概的关系图：

![大概的关系图](https://camo.githubusercontent.com/79c0b2c1661180bc3ce37fe0f2a44450e4118d55f0f4c126b38fad344c444650/68747470733a2f2f67697465652e636f6d2f7a697375752f6d79706963747572652f7261772f6d61737465722f35393764623635653935663330333166336564333966383338316437626362662e706e67)


# 2.SimpleDB Architecture and Implementation Guide

## 2.1. The Database Class

Database类提供了database中要用到的静态全局对象。

其中，包括了访问catalog(database中所有表的集合)、buffer pool(现在驻留在内存中所有数据库文件页的集合)以及log file的方法。

在这个lab中不需要关心log file。

## 2.2. Fields and Tuples

数据库中，行被称为记录(record)或元组(Tuple),列称为字段(Field)或属性(attribute)。

tuples在SimpleDB中十分基础，是一组Field对象的集合，Field是不同数据类型(e.g.,integer,string)实现的接口，Tuple对象是由底层访问方法(e.g.,heap files,B trees)创建的，Tuple也有类型type（或称为组织结构schema），称为_tuple descriptor_，是TypleDesc对象，这个对象包括了Type对象的集合。

### Exercise 1

```
Implement the skeleton methods in:

src/simpledb/TupleDesc.java
src/simpledb/Tuple.java
At this point, your code should pass the unit tests TupleTest and TupleDescTest. 

At this point, modifyRecordId() should fail because you havn't implemented it yet.
```

TupleDesc主要定义了Tuple结构，这里是一个TDItem类型的数组，一个TDItem对象包括fieldType和fieldName两个属性，通过这两个属性描述数据库的行。

### 列信息定义

为了便于大家理解，我们从底往上实现。

首先是最底层的字段类型：

```java
public interface FieldType {

    /**
     * @return the number of bytes required to store a field of this type.
     */
    int getLen();

    /**
     * @return a Field object of the same type as this object that has contents
     *   read from the specified DataInputStream.
     * @param dis The input stream to read from
     * @throws ParseException if the data read from the input stream is not
     *   of the appropriate type.
     */
    Field parse(DataInputStream dis) throws ParseException;

}
```

ps: 这个接口定义的不够干净，将转换为字段和字段类型耦合在了一起。

字段 Field 定义如下：

```java
public interface Field extends Serializable {

    /**
     * Write the bytes representing this field to the specified
     * DataOutputStream.
     * @see DataOutputStream
     * @param dos The DataOutputStream to write to.
     */
    void serialize(DataOutputStream dos) throws IOException;

    /**
     * Returns the type of this field
     * @return type of this field
     */
    FieldType getType();

    /**
     * Compare the value of this field object to the passed in value.
     * @param op The operator
     * @param value The value to compare this Field to
     * @return Whether or not the comparison yields true.
     */
    boolean compare(Op op, Field value);

}
```

其中 Op 是一些常见的比较符号枚举：

```java
public enum Op {
    EQUALS("=","等于"),
    GREATER_THAN(">", "大于"),
    LESS_THAN("<", "小于"),
    LESS_THAN_OR_EQ("<=", "小于等于"),
    GREATER_THAN_OR_EQ(">=", "大于等于"),
    LIKE("LIKE", "模糊匹配"),
    NOT_EQUALS("!=", "不等于")
    ;


    private final String code;
    private final String desc;

    //TODO...
}
```

### 行信息定义

首先是对行内容的描述信息：

```java
/**
 * 定义行的结构信息
 *
 * 1. 有哪些 field（列） 组成
 * 2. fieldNum 列总数，一个内部属性
 *
 * @author binbin.hou
 * @since 1.0.0
 */
public class TupleDesc {

    /**
     * 描述列表
     */
    private List<TDItem> descList;

    /**
     * 字段总数（这个冗余的多余？）
     */
    private int fieldNum;

    // getter setter
    // 构造器等

}
```

其中 TDItem 就是一个简单的字段描述信息内部类：

```java
/**
 * A help class to facilitate organizing the information of each field
 * */
private static class TDItem implements Serializable {
    /**
     * The type of the field
     */
    public final FieldType fieldType;

    /**
     * The name of the field
     */
    public String fieldName;

    public TDItem(FieldType fieldType, String fieldName) {
        this.fieldType = fieldType;
        this.fieldName = fieldName;
    }
}
```

行就是一个由基础的描述信息，和对应的行内容组成：

```java
public class Tuple {

    /**
     * 行描述
     */
    private TupleDesc tupleDesc;
    /**
     * 字段数组
     */
    private Field[] fields;
    /**
     * 记录标识
     */
    private RecordId recordId;

    /**
     * Create a new tuple with the specified schema (type).
     *
     * @param td the schema of this tuple. It must be a valid TupleDesc
     *           instance with at least one field.
     */
    public Tuple(TupleDesc td) {
        this.tupleDesc = td;
        this.fields = new Field[this.tupleDesc.getFieldNum()];
    }

    // getter/setter 方法

}
```

## 2.3. Catalog

catalog 类描述的是数据库实例。

包含了数据库现有的表信息以及表的 schema 信息。

现在需要实现添加新表的功能，以及从特定的表中提取信息。

提取信息时通过表对应的TupleDesc对象决定操作的字段类型和数量。

在整个 SimpleDb 中, CataLog 是全局唯一的，可以通过方法 Database.getCatalog() 获得，global buffer pool可以通过方法 Database.getBufferPool() 获得。

![catalog](https://camo.githubusercontent.com/79c3ddf94692e9d02ccd475e3f73d60ead055384f0401aa209be41bd3791e5ef/68747470733a2f2f63797a626c6f672e6f73732d636e2d6265696a696e672e616c6979756e63732e636f6d2f363833306c6162316578322e706e67)

- Exercise 2

```
Implement the skeleton methods in:

src/simpledb/Catalog.java

At this point, your code should pass the unit tests in CatalogTest.
```

实现：

```java
public final class Catalog {

    /**
     * key: tableId
     * value: 表信息
     */
    private final Map<Integer, TableInfo> tableIdInfoMap = new HashMap<>();

    /**
     * key: tableId
     * value: tableName
     */
    private final Map<String, Integer> tableNameIdMap = new HashMap<>();

    /**
     * 清空
     */
    public void clear() {
        tableIdInfoMap.clear();
        tableNameIdMap.clear();
    }

    /**
     * 添加表
     * @param dbFile 文件
     * @param tableName 表名称
     */
    public void addTable(DbFile dbFile, String tableName) {
        int tableId = dbFile.getId();
        String pkName = "";
        TableInfo tableInfo = new TableInfo(tableId, tableName, dbFile, pkName);

        tableIdInfoMap.put(tableId, tableInfo);
        tableNameIdMap.put(tableName, tableId);
    }

    
    //others...

}
```

# 2.4. BufferPool

buffer pool（在 SimpleDB 中是 BufferPool 类）也是全局唯一的, 负责将最近访问过的 page 缓存下来。

所有的读写操作通过buffer pool读写硬盘上不同文件，BufferPool里的 numPages 参数确定了读取的固定页数，我们可以直接搭配 Lru 最近未使用算法, 来实现 BufferPool.

此外, Database类提供了一个静态方法Database.getBufferPool()，返回整个SimpleDB进程的BufferPool实例引用。

- Exercise 3

```
Implement the getPage() method in:

src/simpledb/BufferPool.java

We have not provided unit tests for BufferPool. The functionality you implemented will be tested in the implementation of HeapFile below. 

You should use the DbFile.readPage method to access pages of a DbFile.
```

## 缓存整体实现

```java
public class BufferPool implements IBufferPool {

    /**
     * 默认最大大小
     */
    private static final int DEFAULT_MAX_SIZE = 50;

    /**
     * 缓存
     */
    private final ICache<PageId, Page> cache;

    public BufferPool(int size) {
        this.cache = new LruCache<>(size);
    }

    public BufferPool() {
        this(DEFAULT_MAX_SIZE);
    }

    @Override
    public Page getPage(TransactionId tid, PageId pid, Permissions perm) {
        //1. 事务加锁判断

        //2. 从缓存中获取
        Page page = cache.get(pid);
        if(page != null) {
            return page;
        }

        //3. 从磁盘获取
        Page loadPage = this.loadPage(pid);
        if(loadPage != null) {
            // 缓存的驱除，应该交给缓存自身去处理。
            // 但是这里涉及到 page 的脏页问题，导致 cache 无法直接清理
            if(cache.isFull()) {
                evictPage();
            }

            cache.put(pid, loadPage);
        }

        return loadPage;
    }

    /** Remove the specific page id from the buffer pool.
     Needed by the recovery manager to ensure that the
     buffer pool doesn't keep a rolled back page in its
     cache.

     Also used by B+ tree files to ensure that deleted pages
     are removed from the cache so they can be reused safely
     */
    public synchronized void discardPage(PageId pid) {
        // some code goes here
        // not necessary for lab1
        this.cache.remove(pid);
    }

    /**
     * Discards a page from the buffer pool.
     * Flushes the page to disk to ensure dirty pages are updated on disk.
     */
    private synchronized void evictPage() throws DbException {
        // some code goes here
        // not necessary for lab1
        final Iterator<Page> pageIterator = this.cache.reverseIterator();
        while (pageIterator.hasNext()) {
            final Page page = pageIterator.next();
            if (page.isDirty() == null) {
                discardPage(page.getId());
                return;
            }
        }

        // 缓存已经满了，但是数据都在使用中！
        throw new DbException("All pages are dirty in buffer pool");
    }

    /**
     * 从磁盘中加载页
     * @param pid 标识
     * @return 结果
     * @throws DbException
     */
    private Page loadPage(final PageId pid) throws DbException {
        final DbFile dbFile = Database.getCatalog().getDatabaseFile(pid.getTableId());
        return dbFile.readPage(pid);
    }

}
```

其中 LRU map 是一个基于最近使用的驱除缓存实现。

# 2.5. HeapFile access method

access method 提供了硬盘读写数据的方式, 包括heap files和B-trees 的读写，在这里，只需要实现heap file访问方法。

HeapFile对象包含一组“物理页”，每一个页大小固定，大小由 BufferPool.DEFAULT_PAGE_SIZE 定义，页内存储行数据。

在SimpleDB中，数据库中每一个表对应一个HeapFile对象，HeapFile中每一页包含很多个slot，每个slot是留给一行的位置。

除了这些slots，每个物理页包含一个header，heade是每个tuple slot的bitmap。

如果bitmap中对应的某个tuple的bit是1，则这个tuple是有效的，否则无效（被删除或者没被初始化）。

HeapFile对象中的物理页的类型是HeapPage，物理页是缓存在buffer pool中，通过HeapFile类读写。

## 计算每页所需tuple数量：

SimpleDB 将堆文件存储在磁盘上的格式与它们存储在内存中的格式大致相同。

每个文件由磁盘上连续排列的页面数据组成。

每个页面由一个或多个表示标题的字节组成，后面是实际页面内容的 `_page size_` 字节。

每个元组的内容需要 `_tuple size_ * 8` 位，标题需要 1 位。

因此，可以容纳在单个页面中的元组数为：

```
_tuples per page_ = floor((_page size_ * 8) / (_tuple size_ * 8 + 1))
```

## 计算header所需byte数量

```
headerBytes = celing(tuplesPerPage / 8)
```

提示：所有的java虚拟机都是 [big-endian](http://en.wikipedia.org/wiki/Endianness)。

大端模式是指数据的低位保存在内存的高地址中，而数据的高位保存在内存的低地址中。
小端模式是指数据的低位保存在内存的低地址中，而数据的高位保存在内存的高地址中。

## 练习 4

- Exercise 4

```
Implement the skeleton methods in:

src/simpledb/HeapPageId.java
src/simpledb/RecordID.java
src/simpledb/HeapPage.java

Although you will not use them directly in Lab 1, we ask you to implement getNumEmptySlots() and isSlotUsed() in HeapPage. 

These require pushing around bits in the page header. 

You may find it helpful to look at the other methods that have been provided in HeapPage or in src/simpledb/HeapFileEncoder.java to understand the layout of pages.

You will also need to implement an Iterator over the tuples in the page, which may involve an auxiliary class or data structure.

At this point, your code should pass the unit tests in HeapPageIdTest, RecordIDTest, and HeapPageReadTest.

After you have implemented HeapPage, you will write methods for HeapFile in this lab to calculate the number of pages in a file and to read a page from the file. 

You will then be able to fetch tuples from a file stored on disk.
```

### HeapPageId.java

```java
public class HeapPageId implements PageId {

    /**
     * The table that is being referenced
     */
    private final int tableId;

    /**
     * The page number in that table.
     */
    private final int pageNum;

    public HeapPageId(int tableId, int pageNum) {
        this.tableId = tableId;
        this.pageNum = pageNum;
    }

    /**
     * Return a representation of this object as an array of integers, for writing to disk.
     *
     * Size of returned array must contain number of integers that corresponds to number of args to one of the
     * constructors.
     */
    public int[] serialize() {
        return new int[]{tableId, pageNum};
    }

    //getter
}
```

### RecordId

```java
public class RecordId {

    /**
     * the pageid of the page on which the tuple resides
     */
    private final PageId pageId;

    /**
     * the tuple number within the page.
     */
    private final int tupleNum;

    public RecordId(PageId pageId, int tupleNum) {
        this.pageId = pageId;
        this.tupleNum = tupleNum;
    }

    //getter
}
```

### HeapPage

HeapPage 代码如下, 主要是要理解 header 和 slot 的对应关系:

```java
/**
 * Returns the number of empty slots on this page.
 */
public int getNumEmptySlots() {
    // some code goes here
    int emptyNum = 0;
    for (int i = 0; i < getNumTuples(); i++) {
        if (!isSlotUsed(i)) {
            emptyNum++;
        }
    }
    return emptyNum;
}

/**
 * Returns true if associated slot on this page is filled.
 */
public boolean isSlotUsed(int i) {
    // some code goes here
    // For Example, byte = 11110111 and posIndex = 3 -> we want 0
    int byteIndex = i / 8;
    int posIndex = i % 8;
    byte target = this.header[byteIndex];
    return (byte) (target << (7 - posIndex)) < 0;
}

/**
 * Abstraction to fill or clear a slot on this page.
 */
private void markSlotUsed(int i, boolean value) {
    // some code goes here
    // not necessary for lab1
    int byteIndex = i / 8;
    int posIndex = i % 8;
    byte v = (byte) (1 << posIndex);
    byte headByte = this.header[byteIndex];
    this.header[byteIndex] = value ? (byte) (headByte | v) : (byte) (headByte & ~v);
}
```

## Exercise 5

```
Implement the skeleton methods in:

src/simpledb/HeapFile.java

To read a page from disk, you will first need to calculate the correct offset in the file. 

Hint: you will need random access to the file in order to read and write pages at arbitrary offsets. 

You should not call BufferPool methods when reading a page from disk.

You will also need to implement the HeapFile.iterator() method, which should iterate through through the tuples of each page in the HeapFile. 

The iterator must use the BufferPool.getPage() method to access pages in the HeapFile. 

This method loads the page into the buffer pool and will eventually be used (in a later lab) to implement locking-based concurrency control and recovery. 

Do not load the entire table into memory on the open() call -- this will cause an out of memory error for very large tables.

At this point, your code should pass the unit tests in HeapFileReadTest.
```

### 实现

HeapFile.java代码如下：

想要 readPage from file, 我们可以利用 java 的 randomAccessFile 来达到这个目的

randomAccessFile 支持随机 seek() 的功能:

```java
public Page readPage(PageId pid) {
    // some code goes here
    final int pos = BufferPool.getPageSize() * pid.getPageNumber();
    byte[] pageData = new byte[BufferPool.getPageSize()];
    try {
        this.randomAccessFile.seek(pos);
        this.randomAccessFile.read(pageData, 0, pageData.length);
        final HeapPage heapPage = new HeapPage((HeapPageId) pid, pageData);
        return heapPage;
    } 
    return null;
}
```

# Operators

数据库Operators(操作符)负责查询语句的实际执行。

在SimpleDB中，Operators是基于 volcano 实现的, 每个 operator 都需要实现 next() 方法

SimpleDP 和程序交互的过程中，现在root operator上调用getNext，之后在子节点上继续调用getNext，一直下去，直到leaf operators 被调用。

他们从硬盘上读取tuples，并在树结构上传递。

如图所示:

![Operators](https://camo.githubusercontent.com/bf00339e4b788b3bbd6ff2f8019313372cc9443954584a2d46aff46bc87b4041/68747470733a2f2f67697465652e636f6d2f7a697375752f6d79706963747572652f7261772f6d61737465722f323238323335372d32303231303232383230303031303432392d313436323238383535362e706e67)

这个lab中，只需要实现一个SimpleDB operator, 也即 seqScan

## Exercise 6.

```
Implement the skeleton methods in:

src/simpledb/SeqScan.java

This operator sequentially scans all of the tuples from the pages of the table specified by the tableid in the constructor. 

This operator should access tuples through the DbFile.iterator() method.

At this point, you should be able to complete the ScanTest system test. Good work!

You will fill in other operators in subsequent labs.
```

## SeqScan.java

代码如下：

```java
public SeqScan(TransactionId tid, int tableid, String tableAlias) {
    // some code goes here
    this.tid = tid;
    this.tableId = tableid;
    this.tableAlias = tableAlias;
    // db file 的 iterator, 可以遍历 file 的每个 page
    this.dbFileIterator = Database.getCatalog().getDatabaseFile(tableid).iterator(tid);
}

public SeqScan(TransactionId tid, int tableId) {
    this(tid, tableId, Database.getCatalog().getTableName(tableId));
}

public void open() throws DbException, TransactionAbortedException {
    // some code goes here
    this.dbFileIterator.open();
}

public boolean hasNext() throws TransactionAbortedException, DbException {
    // some code goes here
    return this.dbFileIterator.hasNext();
}

public Tuple next() throws NoSuchElementException, TransactionAbortedException, DbException {
    // some code goes here
    final Tuple next = this.dbFileIterator.next();
    final Tuple result = new Tuple(getTupleDesc());
    for (int i = 0; i < next.getTupleDesc().numFields(); i++) {
        result.setField(i, next.getField(i));
        result.setRecordId(next.getRecordId());
    }
    return result;
}
```

# 简单查询使用

这一小节是要说明怎么综合上面的部分，执行一次简单的查询。

假如有一个数据文件"some_data_file.txt"，内容如下：

```
1,1,1
2,2,2 
3,4,4
```

可以将它转换成SimpleDB可以查询的二进制文件，转换格式为java `-jar dist/simpledb.jar convert some_data_file.dat 3`。其中参数3是告诉转换器输入有3列。

下列代码实现了对文件的简单查询，效果等同于SQL语句的 `SELECT * FROM some_data_file`。

## 数据处理

命令行的语句，其实就是把普通文本，处理成为 HeapFile 内容格式。

命令行等价于：

```java
public static void main(String[] args) throws IOException {
    String source = "D:\\github\\simpledb-learn\\src\\test\\resources\\some_data_file.txt";
    String target = "D:\\github\\simpledb-learn\\src\\test\\resources\\some_data_file.dat";

    convert(source, target, 3);
}

private static void convert(String source, String target, int numOfAttributes) throws IOException {
    File sourceTxtFile = new File(source);
    File targetDatFile = new File(target);
    Type[] ts = new Type[numOfAttributes];
    char fieldSeparator = ',';
    for (int i = 0; i < numOfAttributes; i++)
        ts[i] = Type.INT_TYPE;
    HeapFileEncoder.convert(sourceTxtFile, targetDatFile, BufferPool.getPageSize(), numOfAttributes,
            ts, fieldSeparator);
}
```

## 测试代码

```java
public static void main(String[] args) {
    // construct a 3-column table schema
    Type[] types = new Type[]{ Type.INT_TYPE, Type.INT_TYPE, Type.INT_TYPE };
    String[] names = new String[]{ "field0", "field1", "field2" };
    TupleDesc descriptor = new TupleDesc(types, names);

    // create the table, associate it with some_data_file.dat
    // and tell the catalog about the schema of this table.
    String filePath = "D:\\github\\simpledb-learn\\src\\test\\resources\\some_data_file.dat";
    HeapFile table = new HeapFile(new File(filePath), descriptor);
    Database.getCatalog().addTable(table, "test");
    // construct the query: we use a simple SeqScan, which spoonfeeds
    // tuples via its iterator.
    TransactionId tid = new TransactionId();
    SeqScan f = new SeqScan(tid, table.getId());

    try {
        // and run it
        f.open();
        while (f.hasNext()) {
            Tuple tup = f.next();
            System.out.println(tup);
        }
        f.close();

        // 事务结束
        Database.getBufferPool().transactionComplete(tid);
    } catch (Exception e) {
        System.out.println ("Exception : " + e);
    }
}
```


输出如下：

```
Tuple{tupleDesc=TupleDesc{descList=[TDItem{type=INT_TYPE, fieldName='test.field0'}, TDItem{type=INT_TYPE, fieldName='test.field1'}, TDItem{type=INT_TYPE, fieldName='test.field2'}]}, fields=[IntField{value=1}, IntField{value=1}, IntField{value=1}], recordId=RecordId{pageId=HeapPageId{tableId=-2124859658, pageNum=0}, tupleNum=0}}

Tuple{tupleDesc=TupleDesc{descList=[TDItem{type=INT_TYPE, fieldName='test.field0'}, TDItem{type=INT_TYPE, fieldName='test.field1'}, TDItem{type=INT_TYPE, fieldName='test.field2'}]}, fields=[IntField{value=2}, IntField{value=2}, IntField{value=2}], recordId=RecordId{pageId=HeapPageId{tableId=-2124859658, pageNum=0}, tupleNum=1}}

Tuple{tupleDesc=TupleDesc{descList=[TDItem{type=INT_TYPE, fieldName='test.field0'}, TDItem{type=INT_TYPE, fieldName='test.field1'}, TDItem{type=INT_TYPE, fieldName='test.field2'}]}, fields=[IntField{value=3}, IntField{value=4}, IntField{value=4}], recordId=RecordId{pageId=HeapPageId{tableId=-2124859658, pageNum=0}, tupleNum=2}}
```


# 参考资料

https://github.com/CreatorsStack/CreatorDB/blob/master/document/lab1-resolve.md

* any list
{:toc}