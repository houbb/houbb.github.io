---
layout: post
title:  简易版数据库实现-04-MIT 6.830 SimpleDB Lab2 HeapFile 文件操作实现
date:  2022-06-12 09:22:02 +0800
categories: [Database]
tags: [database, sh]
published: true
---

# ## Exercise3: HeapFile Mutability

为了在 Exercise4 中实现 insert 和 delete operator, 我们需要先实现 heapFile insert / delete

讲义介绍：

```
现在，我们将开始实现支持修改表的方法。

我们从单个页面和文件的级别开始。

有两组主要的操作：添加元组和删除元组。

**删除元组：** 要删除元组，您需要实现 `deleteTuple`。

元组包含 `RecordIDs`，它允许您找到它们所在的页面，因此这应该像定位元组所属的页面并适当地修改页面的标题一样简单。

**添加元组：** `HeapFile.java` 中的 `insertTuple` 方法负责将元组添加到堆文件中。

要将新元组添加到 HeapFile，您必须找到具有空槽的页面。

如果 HeapFile 中不存在此类页面，则需要创建一个新页面并将其附加到磁盘上的物理文件中。

您需要确保元组中的 RecordID 已正确更新。
```

需要实现的内容：

```
Implement the remaining skeleton methods in:

- src/java/simpledb/storage/HeapPage.java
- src/java/simpledb/storage/HeapFile.java
  (Note that you do not necessarily need to implement writePage at this point).

- src/java/simpledb/storage/BufferPool.java:
    - insertTuple()
    - deleteTuple()
```

简单来说，exercise3 需要我们实现 HeapPage、HeapFile、BufferPool 的插入元组和删除元组的方法。

##  BufferPool

### insertTuple

```java
/**
 * Add a tuple to the specified table on behalf of transaction tid.  Will
 * acquire a write lock on the page the tuple is added to and any other
 * pages that are updated (Lock acquisition is not needed for lab2).
 * May block if the lock(s) cannot be acquired.
 *
 * Marks any pages that were dirtied by the operation as dirty by calling
 * their markDirty bit, and adds versions of any pages that have
 * been dirtied to the cache (replacing any existing versions of those pages) so
 * that future requests see up-to-date pages.
 *
 * @param tid the transaction adding the tuple
 * @param tableId the table to add the tuple to
 * @param t the tuple to add
 * @since lab2
 */
public void insertTuple(TransactionId tid, int tableId, Tuple t) throws DbException, IOException,
        TransactionAbortedException {
    final DbFile table = Database.getCatalog().getDatabaseFile(tableId);
    final List<Page> dirtyPages = table.insertTuple(tid, t);
    // 将也标记为脏页，并且更新 cache 信息
    for (final Page page : dirtyPages) {
        page.markDirty(true, tid);
        this.cache.put(page.getId(), page);
    }
}
```

底层调用的还是 DbFile.insertTuple，我们后续实现。

### deleteTuple

类似:

```java
/**
 * Remove the specified tuple from the buffer pool.
 * Will acquire a write lock on the page the tuple is removed from and any
 * other pages that are updated. May block if the lock(s) cannot be acquired.
 *
 * Marks any pages that were dirtied by the operation as dirty by calling
 * their markDirty bit, and adds versions of any pages that have
 * been dirtied to the cache (replacing any existing versions of those pages) so
 * that future requests see up-to-date pages.
 *
 * @param tid the transaction deleting the tuple.
 * @param t the tuple to delete
 * @since lab2
 */
public void deleteTuple(TransactionId tid, Tuple t) throws DbException, IOException, TransactionAbortedException {
    int tableId = t.getRecordId().getPageId().getTableId();
    DbFile table = Database.getCatalog().getDatabaseFile(tableId);
    final List<Page> dirtyPages = table.deleteTuple(tid, t);
    for (final Page page : dirtyPages) {
        page.markDirty(true, tid);
        this.cache.put(page.getId(), page);
    }
}
```

## DbFile

### insert 方法

```java
public List<Page> insertTuple(TransactionId tid, Tuple t) throws DbException, IOException, TransactionAbortedException {
    final ArrayList<Page> dirtyPageList = new ArrayList<>();

    // 如果当前页存在空槽，直接插入
    for (int i = 0; i < this.numPages(); i++) {
        final HeapPage page = (HeapPage) Database.getBufferPool().getPage(tid, new HeapPageId(getId(), i), Permissions.READ_WRITE);
        if (page != null && page.getNumEmptySlots() > 0) {
            page.insertTuple(t);
            page.markDirty(true, tid);
            dirtyPageList.add(page);
            break;
        }
    }
    
    // That means all pages are full, we should create a new page
    if (dirtyPageList.size() == 0) {
        final HeapPageId heapPageId = new HeapPageId(getId(), this.numPages());
        HeapPage newPage = new HeapPage(heapPageId, HeapPage.createEmptyPageData());
        writePage(newPage);
        // Through buffer pool to get newPage
        newPage = (HeapPage) Database.getBufferPool().getPage(tid, heapPageId, Permissions.READ_WRITE);
        newPage.insertTuple(t);
        newPage.markDirty(true, tid);
        dirtyPageList.add(newPage);
    }
    return dirtyPageList;
}
```

整体实现不难，有空槽就插入；没有则创建一个新的 page 页，插入。

底层还是调用 `page.insertTuple(t);`，有点像俄罗斯套娃。

不过维度不同，上面 BufferPool 是缓存，这里是文件对于页的抽象封装。实际上就是 page 的变化。

### delete 方法

```java
/**
 * 删除
 * @since lab2
 */
public List<Page> deleteTuple(TransactionId tid, Tuple t) throws DbException, IOException, TransactionAbortedException {
    final ArrayList<Page> dirtyPageList = new ArrayList<>();
    final RecordId recordId = t.getRecordId();
    final PageId pageId = recordId.getPageId();
    final HeapPage page = (HeapPage) Database.getBufferPool().getPage(tid, pageId, Permissions.READ_WRITE);

    if (page != null && page.isSlotUsed(recordId.getTupleNum())) {
        page.deleteTuple(t);
        dirtyPageList.add(page);
    }

    return dirtyPageList;
}
```

相对比较简单，就是找到指定使用的信息，删除。

## Page

### insert

```java
/**
 * Adds the specified tuple to the page;  the tuple should be updated to reflect
 *  that it is now stored on this page.
 * @throws DbException if the page is full (no empty slots) or tupledesc is mismatch.
 * @param t The tuple to add.
 * @since lab2
 */
public void insertTuple(Tuple t) throws DbException {
    // not necessary for lab1
    if (!t.getTupleDesc().equals(this.td)) {
        throw new DbException("Tuple desc is not match");
    }

    for (int i = 0; i < getNumTuples(); i++) {
        if (!isSlotUsed(i)) {
            markSlotUsed(i, true);
            t.setRecordId(new RecordId(this.pid, i));
            this.tuples[i] = t;
            return;
        }
    }

    throw new DbException("The page is full");
}
```

遍历当前 page 的所有空槽，如果发现空的，直接插入。

ps: 这里很明显可以作为一个优化，将 page 的槽分成 usedSlots 和 unUsedSlots，而不是这样 O(N) 的遍历。

### delete

```java
/**
 * Delete the specified tuple from the page; the corresponding header bit should be updated to reflect
 *   that it is no longer stored on any page.
 * @throws DbException if this tuple is not on this page, or tuple slot is
 *         already empty.
 * @param t The tuple to delete
 * @since lab2
 */
public void deleteTuple(Tuple t) throws DbException {
    final RecordId recordId = t.getRecordId();
    final HeapPageId pageId = (HeapPageId) recordId.getPageId();
    final int tn = recordId.getTupleNum();

    if (!pageId.equals(this.pid)) {
        throw new DbException("Page id not match");
    }
    if (!isSlotUsed(tn)) {
        throw new DbException("Slot is not used");
    }

    markSlotUsed(tn, false);
    this.tuples[tn] = null;
}
```

删除元素前做了一些基本校验。

这里维护了 tuple 行信息，和 slot 之间的映射关系，便于快速发现。

删除后更新使用状态，并且将槽置为空。

# Exercise4:Insertion and deletion

## 说明

exercise4要求我们实现 Insertion and deletion 两个操作符，实际上就是两个迭代器，实现方式与exercise1相似，将传入的数据源进行处理，并返回处理结果，而处理并返回结果一般都是写在fetchNext中。

这里的处理结果元组，只有一个字段，那就是插入或删除影响的行数，与MySQL相似。

具体实现插入和删除，需要调用我们exercise3实现的插入删除元组相关方法。

## Insertion

### 属性

```java
public class Insert extends Operator {

    /**
     * 事务标识
     */
    private final TransactionId tid;
    /**
     * 表标识
     */
    private final int tableId;
    /**
     * 插入结果描述
     */
    private final TupleDesc tupleDesc;
    /**
     * 待插入数据
     */
    private OpIterator child;
    /**
     * 是否已处理？
     */
    private boolean isFetched;
```

构造器：

```java
public Insert(TransactionId t, OpIterator child, int tableId) throws DbException {
    this.tid = t;
    this.child = child;
    this.tableId = tableId;
    final Type[] types = new Type[]{Type.INT_TYPE};
    this.tupleDesc = new TupleDesc(types);
}
```

### fetchNext

主要看一下这个方法：

```java
protected Tuple fetchNext() throws TransactionAbortedException, DbException {
    int cnt = 0;

    // 遍历当前行，调用插入方法。    
    while (this.child.hasNext()) {
        final Tuple next = this.child.next();
        try {
            Database.getBufferPool().insertTuple(this.tid, this.tableId, next);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error happen when insert tuple:" + e.getMessage());
        }
        cnt++;
    }

    if (cnt == 0 && isFetched) {
        return null;
    }
    isFetched = true;

    // 返回插入的行数
    final Tuple result = new Tuple(this.tupleDesc);
    result.setField(0, new IntField(cnt));
    return result;
}
```

## delete

delete 实现和 insert 基本一样。

```java
protected Tuple fetchNext() throws TransactionAbortedException, DbException {
    int cnt = 0;
    while (this.child.hasNext()) {
        final Tuple next = this.child.next();
        try {
            Database.getBufferPool().deleteTuple(this.tid, next);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error happen when insert tuple:" + e.getMessage());
        }
        cnt++;
    }
    if (cnt == 0 && isFetched) {
        return null;
    }
    isFetched = true;
    final Tuple result = new Tuple(this.tupleDesc);
    result.setField(0, new IntField(cnt));
    return result;
}
```

只是迭代时，调用的是删除方法而已：`Database.getBufferPool().deleteTuple(this.tid, next);`。

# 小结

这一节可以为是俄罗斯套娃值娃中娃。

insert => BufferPool => DBFile => Page

之所以绕了这么远，本质上在于 insert 是对于数据的抽象; 

BufferPool 是对于缓存的抽象。（不考虑性能，可以移除）

DBFile 和 table 一一映射，是对 page 的抽象。

Page 才是和磁盘的真实交互。

# 参考资料

https://github.com/CreatorsStack/CreatorDB/blob/master/document/lab2-resolve.md

* any list
{:toc}