---
layout: post
title: Lucene-10-lucene 的索引构建原理
date: 2022-01-10 21:01:55 +0800
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# lucene创建索引的原理

## IndexWriter的addDocument方法详解

今天看了IndexWriter类的addDocument方法，IndexWriter对此方法的说明如下：

```
将文档添加到此索引。
 
请注意，如果遇到异常（例如磁盘已满），则索引将保持一致，但可能尚未添加此文档。

此外，即使使用复合文件（当合并部分成功时），索引也可能有一个非复合格式的段。

此方法定期将待处理文档刷新到目录（见上文），并且还根据正在使用的 MergePolicy 定期触发索引中的段合并。

合并暂时占用目录中的空间。当没有针对索引打开阅读器/搜索器时，所需的空间量最多是所有要合并的段大小的 1 倍，当针对索引打开阅读器/搜索器时，需要合并的所有段的大小最多是 2 倍（请参阅forceMerge(int) 了解详细信息）。执行的原始合并操作的顺序由合并策略控制。

请注意，文档中的每个术语不能超过 MAX_TERM_LENGTH（以字节为单位），否则将引发 IllegalArgumentException。
```

## 源码分析

ps: 源码版本 v7.2.1

addDocument 实现如下：

```java
public long addDocument(Iterable<? extends IndexableField> doc) throws IOException {
    return this.updateDocument((Term)null, doc);
}
```

对应的是 update 方法：

```java
//通过首先删除包含术语的文档然后添加新文档来更新文档。
//删除然后添加是原子的，正如读者在同一索引上看到的那样（刷新可能仅在添加之后发生）。
public long updateDocument(Term term, Iterable<? extends IndexableField> doc) throws IOException {
    // 确认 IndexWriter 处于 open 状态
    ensureOpen();
    try {
      boolean success = false;
      try {
        // 更新，并且返回对应的 seqNo  
        long seqNo = docWriter.updateDocument(doc, analyzer, term);
        if (seqNo < 0) {
          seqNo = - seqNo;
          processEvents(true, false);
        }
        success = true;
        return seqNo;
      } finally {
        if (!success) {
          if (infoStream.isEnabled("IW")) {
            infoStream.message("IW", "hit exception updating document");
          }
        }
      }
    } catch (AbortingException | VirtualMachineError tragedy) {
      tragicEvent(tragedy, "updateDocument");

      // dead code but javac disagrees:
      return -1;
    }
  }
```

通过注释可知：updateDocument是先从索引中删除包含相同term的document然后重新添加document到索引中；


其中 `long seqNo = docWriter.updateDocument(doc, analyzer, term);` 是核心代码，实现如下：

此操作需要确保IndexWriter没有被关闭，其实现是先有DocumentsWriter类的updateDocument方法判断，这里先判断将根据term找到对应的document，并先放到待删除的document队列中，然后从队列中读取document，再将要flush的documents写入磁盘，同时更新flush队列中的索引状态；

```java
long updateDocument(final Iterable<? extends IndexableField> doc, final Analyzer analyzer, final Term delTerm) throws IOException, AbortingException {
  boolean hasEvents = preUpdate();
  final ThreadState perThread = flushControl.obtainAndLock();
  final DocumentsWriterPerThread flushingDWPT;
  long seqNo;
  try {
    // This must happen after we've pulled the ThreadState because IW.close
    // waits for all ThreadStates to be released:
    ensureOpen();
    ensureInitialized(perThread);
    assert perThread.isInitialized();
    final DocumentsWriterPerThread dwpt = perThread.dwpt;

    // 返回此 {@link DocumentsWriterPerThread} 中 RAM 常驻文档的数量
    final int dwptNumDocs = dwpt.getNumDocsInRAM();
    try {
      seqNo = dwpt.updateDocument(doc, analyzer, delTerm); 
    } catch (AbortingException ae) {
      flushControl.doOnAbort(perThread);
      dwpt.abort();
      throw ae;
    } finally {
      // We don't know whether the document actually
      // counted as being indexed, so we must subtract here to
      // accumulate our separate counter:
      // 这里是 Atomic 的原子操作
      numDocsInRAM.addAndGet(dwpt.getNumDocsInRAM() - dwptNumDocs);
    }
    final boolean isUpdate = delTerm != null;
    flushingDWPT = flushControl.doAfterDocument(perThread, isUpdate);
    assert seqNo > perThread.lastSeqNo: "seqNo=" + seqNo + " lastSeqNo=" + perThread.lastSeqNo;
    perThread.lastSeqNo = seqNo;
  } finally {
    perThreadPool.release(perThread);
  }
  if (postUpdate(flushingDWPT, hasEvents)) {
    seqNo = -seqNo;
  }
  
  return seqNo;
}
```

在此期间有一个ThreadState类型的读写锁，lucene判断ThreadState的状态，如果此锁被激活，从内存中获取document并更新到索引文件且重置内存中索引的数量和状态，最后释放相关的资源。

我们静下心来一点点看：

- preUpdate 更新之前

这里实际上会做一下循环等待，直到 flush 对应的等待线程，和排队的数据全部处理完成。

```java
private boolean preUpdate() throws IOException, AbortingException {
  ensureOpen();
  boolean hasEvents = false;
  if (flushControl.anyStalledThreads() || flushControl.numQueuedFlushes() > 0) {
    // Help out flushing any queued DWPTs so we can un-stall:
    // 帮助刷新任何排队的 DWPT，以便我们可以取消停止
    do {
      // Try pick up pending threads here if possible
      // 如果可能，请尝试在此处提取待处理的线程
      DocumentsWriterPerThread flushingDWPT;
      while ((flushingDWPT = flushControl.nextPendingFlush()) != null) {
        // Don't push the delete here since the update could fail!
        // 不要在此处推送删除，因为更新可能会失败！
        hasEvents |= doFlush(flushingDWPT);
      }
      
      flushControl.waitIfStalled(); // block if stalled
    } while (flushControl.numQueuedFlushes() != 0); // still queued DWPTs try help flushing
  }
  return hasEvents;
}
```

- flushControl.obtainAndLock()  获取锁

```java
ThreadState obtainAndLock() {
  final ThreadState perThread = perThreadPool.getAndLock(Thread.currentThread(), documentsWriter);
  boolean success = false;
  try {
    if (perThread.isInitialized() && perThread.dwpt.deleteQueue != documentsWriter.deleteQueue) {
      // There is a flush-all in process and this DWPT is
      // now stale -- enroll it for flush and try for
      // another DWPT:
      // 有一个flush-all正在进行，这个DWPT现在已经过时了——注册它进行flush并尝试另一个DWPT：
      addFlushableState(perThread);
    }
    success = true;
    // simply return the ThreadState even in a flush all case sine we already hold the lock
    // 只需在所有情况下都返回 ThreadState，因为我们已经持有锁
    return perThread;
  } finally {
    if (!success) { // make sure we unlock if this fails
      perThreadPool.release(perThread);
    }
  }
}
```

- dwpt.updateDocument(doc, analyzer, delTerm);  核心的更新逻辑

```java
public long updateDocuments(Iterable<? extends Iterable<? extends IndexableField>> docs, Analyzer analyzer, Term delTerm) throws IOException, AbortingException {
    testPoint("DocumentsWriterPerThread addDocuments start");
    assert deleteQueue != null;
    docState.analyzer = analyzer;
    if (INFO_VERBOSE && infoStream.isEnabled("DWPT")) {
      infoStream.message("DWPT", Thread.currentThread().getName() + " update delTerm=" + delTerm + " docID=" + docState.docID + " seg=" + segmentInfo.name);
    }
    int docCount = 0;
    boolean allDocsIndexed = false;
    try {
      // 迭代所有的 Field
      for(Iterable<? extends IndexableField> doc : docs) {
        // Even on exception, the document is still added (but marked
        // deleted), so we don't need to un-reserve at that point.
        // Aborting exceptions will actually "lose" more than one
        // document, so the counter will be "wrong" in that case, but
        // it's very hard to fix (we can't easily distinguish aborting
        // vs non-aborting exceptions):
        reserveOneDoc();
        docState.doc = doc;
        docState.docID = numDocsInRAM;
        docCount++;

        boolean success = false;
        try {
          consumer.processDocument();
          success = true;
        } finally {
          if (!success) {
            // Incr here because finishDocument will not
            // be called (because an exc is being thrown):
            numDocsInRAM++;
          }
        }

        // 这里为什么使用 ++ 呢？++并不是一个原子操作。
        numDocsInRAM++;
      }
      allDocsIndexed = true;

      // Apply delTerm only after all indexing has
      // succeeded, but apply it only to docs prior to when
      // this batch started:
      long seqNo;
      if (delTerm != null) {
        seqNo = deleteQueue.add(delTerm, deleteSlice);
        assert deleteSlice.isTailItem(delTerm) : "expected the delete term as the tail item";
        deleteSlice.apply(pendingUpdates, numDocsInRAM-docCount);
        return seqNo;
      } else {
        seqNo = deleteQueue.updateSlice(deleteSlice);
        if (seqNo < 0) {
          seqNo = -seqNo;
          deleteSlice.apply(pendingUpdates, numDocsInRAM-docCount);
        } else {
          deleteSlice.reset();
        }
      }

      return seqNo;

    } finally {
      if (!allDocsIndexed && !aborted) {
        // the iterator threw an exception that is not aborting 
        // go and mark all docs from this block as deleted
        int docID = numDocsInRAM-1;
        final int endDocID = docID - docCount;
        while (docID > endDocID) {
          deleteDocID(docID);
          docID--;
        }
      }
      docState.clear();
    }
  }
```


# 索引创建之多线程优化

前面了解到lucene在索引创建的时候一个IndexWriter获取到一个读写锁，这样势在lucene创建大数据量的索引的时候，执行效率低下的问题；

lucene索引的建立，跟以下几点关联很大；

1）磁盘空间大小，这个直接影响索引的建立，甚至会造成索引写入提示完成，但是没有同步的问题；

2）索引合并策略的选择，这个类似于sql里边的批量操作，批量操作的数量过多直接影响执行效率，对于lucene来讲，索引合并前是将document放在内存中，因此选择合适的合并策略也可以提升索引的效率；

3）唯一索引对应的term的选择，lucene索引的创建过程中是先从索引中删除包含相同term的document然后重新添加document到索引中，这里如果term对应的document过多，会占用磁盘IO，同时造成IndexWriter的写锁占用时间延长，相应的执行效率低下

综上所述，索引优化要保证磁盘空间，同时在term选择上可以以ID等标识来确保唯一性，这样第一条和第三条的风险就规避了；

本文旨在对合并策略和采用多线程创建的方式提高索引的效率；

多线程创建索引，我这边还设计了多目录索引创建，这样避免了同一目录数据量过大索引块合并和索引块重新申请；

废话不多说，这里附上代码，代码示例是读取lucene官网下载并解压的文件夹并给文件信息索引起来

## 代码

### 核心实现

- FileBean.java

首先定义FileBean来存储文件信息

```java
public class FileBean {

    //路径
    private String path;
    //修改时间
    private Long modified;
    //内容
    private String content;

    public String getPath() {
        return path;
    }

    //Getter & Setter & ToString

}
```

- BaseIndex.java

核心实现的父类。

```java
import org.apache.lucene.index.IndexWriter;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CountDownLatch;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public abstract class BaseIndex<T> implements Runnable{
    /**
     * 索引编写器
     */
    private IndexWriter writer;

    /**
     * 主线程
     */
    private final CountDownLatch countDownLatch1;
    /**
     *工作线程
     */
    private final CountDownLatch countDownLatch2;
    /**
     * 对象列表
     */
    private List<T> list;
    public BaseIndex(IndexWriter writer,CountDownLatch countDownLatch1, CountDownLatch countDownLatch2,
                     List<T> list){
        super();
        this.writer = writer;
        this.countDownLatch1 = countDownLatch1;
        this.countDownLatch2 = countDownLatch2;
        this.list = list;
    }
    public BaseIndex(String parentIndexPath, int subIndex,
                     CountDownLatch countDownLatch1, CountDownLatch countDownLatch2,
                     List<T> list) {
        super();
        /**
         * 父级索引路径
         */
        int subIndex1 = subIndex;
        try {
            //多目录索引创建
            File file = new File(parentIndexPath+"/index"+subIndex);
            if(!file.exists()){
                file.mkdir();
            }
            this.writer = IndexUtil.getIndexWriter(parentIndexPath+"/index"+subIndex, true);
        } catch (IOException e) {
            e.printStackTrace();
        };
        this.countDownLatch1 = countDownLatch1;
        this.countDownLatch2 = countDownLatch2;
        this.list = list;
    }
    public BaseIndex(String path,CountDownLatch countDownLatch1, CountDownLatch countDownLatch2,
                     List<T> list) {
        super();
        try {
            //单目录索引创建
            File file = new File(path);
            if(!file.exists()){
                file.mkdir();
            }
            this.writer = IndexUtil.getIndexWriter(path,true);
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        };
        this.countDownLatch1 = countDownLatch1;
        this.countDownLatch2 = countDownLatch2;
        this.list = list;
    }

    /**创建索引
     * @param writer
     * @throws Exception
     */
    public abstract void indexDoc(IndexWriter writer,T t) throws Exception;

    /**批量索引创建
     * @param writer
     * @param t
     * @throws Exception
     */
    public void indexDocs(IndexWriter writer,List<T> t) throws Exception{
        for (T t2 : t) {
            indexDoc(writer,t2);
        }
    }

    @Override
    public void run() {
        try {
            countDownLatch1.await();
            System.out.println(writer);
            indexDocs(writer,list);
        } catch (Exception e) {
            e.printStackTrace();
        } finally{
            // 数量-1
            countDownLatch2.countDown();
            try {
                writer.commit();
                writer.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }
}
```

- FileBeanIndex.java

核心实现类：

```java
import org.apache.lucene.document.*;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;

import java.util.List;
import java.util.concurrent.CountDownLatch;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class FileBeanIndex extends BaseIndex<FileBean> {

    public FileBeanIndex(IndexWriter writer, CountDownLatch countDownLatch1,
                         CountDownLatch countDownLatch2, List<FileBean> list) {
        super(writer, countDownLatch1, countDownLatch2, list);
    }
    public FileBeanIndex(String parentIndexPath, int subIndex, CountDownLatch countDownLatch1,
                         CountDownLatch countDownLatch2, List<FileBean> list) {
        super(parentIndexPath, subIndex, countDownLatch1, countDownLatch2, list);
    }
    @Override
    public void indexDoc(IndexWriter writer, FileBean t) throws Exception {
        Document doc = new Document();
        System.out.println(t.getPath());
        doc.add(new StringField("path", t.getPath(), Field.Store.YES));
        doc.add(new LongPoint("modified", t.getModified()));
        doc.add(new TextField("content", t.getContent(), Field.Store.YES));
        if (writer.getConfig().getOpenMode() == IndexWriterConfig.OpenMode.CREATE){
            writer.addDocument(doc);
        }else{
            writer.updateDocument(new Term("path", t.getPath()), doc);
        }
    }
}
```

### 工具类

涉及到两个工具类如下：

- IndexUtil.java

根据指定的路径，创建对应的 IndexWriter

```java
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.LogByteSizeMergePolicy;
import org.apache.lucene.index.LogMergePolicy;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;

import java.io.IOException;
import java.nio.file.Paths;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class IndexUtil {

    /**创建索引写入器
     * @param indexPath
     * @param create
     * @return
     * @throws IOException
     */
    public static IndexWriter getIndexWriter(String indexPath,boolean create) throws IOException {
        Directory dir = FSDirectory.open(Paths.get(indexPath));
        Analyzer analyzer = new StandardAnalyzer();
        IndexWriterConfig iwc = new IndexWriterConfig(analyzer);
        LogMergePolicy mergePolicy = new LogByteSizeMergePolicy();
        //设置segment添加文档(Document)时的合并频率          //值较小,建立索引的速度就较慢          //值较大,建立索引的速度就较快,>10适合批量建立索引
        mergePolicy.setMergeFactor(50);
        //设置segment最大合并文档(Document)数
        //值较小有利于追加索引的速度
        //值较大,适合批量建立索引和更快的搜索
        mergePolicy.setMaxMergeDocs(5000);
        if (create){
            iwc.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
        }else {
            iwc.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
        }
        return new IndexWriter(dir, iwc);
    }

}
```

- LuceneFileUtil.java

获取指定路径下的所有文件信息。

```java
package com.github.houbb.lucene.learn.chap04;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.LinkedList;
import java.util.List;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class LuceneFileUtil {

    /**读取文件信息和下属文件夹
     * @param folder 文件夹
     * @return 文件信息
     * @throws IOException 异常
     */
    public static List<FileBean> getFolderFiles(String folder) throws IOException {
        List<FileBean> fileBeans = new LinkedList<FileBean>();
        File file = new File(folder);
        if(file.isDirectory()){
            File[] files = file.listFiles();
            if(files != null){
                for (File file2 : files) {
                    fileBeans.addAll(getFolderFiles(file2.getAbsolutePath()));
                }
            }
        }else{
            FileBean bean = new FileBean();
            bean.setPath(file.getAbsolutePath());
            bean.setModified(file.lastModified());
            bean.setContent(new String(Files.readAllBytes(Paths.get(folder))));
            fileBeans.add(bean);
        }
        return fileBeans;
    }

}
```

### 测试代码

测试实现如下：

```java
public static void main(String[] args) {
    try {
        //1. 获取指定文件夹下所有文件信息
        List<FileBean> fileBeans = LuceneFileUtil.getFolderFiles("D:\\gitee2\\lucene-learn");

        //2. 根据数量，构建对应的主线程+工作线程池数量
        int totalCount = fileBeans.size();
        int perThreadCount = 100;
        System.out.println("查询到的数据总数是"+fileBeans.size());
        int threadCount = totalCount/perThreadCount + (totalCount%perThreadCount == 0 ? 0 : 1);
        ExecutorService pool = Executors.newFixedThreadPool(threadCount);
        CountDownLatch countDownLatch1 = new CountDownLatch(1);
        CountDownLatch countDownLatch2 = new CountDownLatch(threadCount);
        System.out.println(fileBeans.size());

        //3. 通过 subList，多线程执行 
        for(int i = 0; i < threadCount; i++) {
            int start = i*perThreadCount;
            int end = Math.min((i + 1) * perThreadCount, totalCount);
            List<FileBean> subList = fileBeans.subList(start, end);
            Runnable runnable = new FileBeanIndex("index",i, countDownLatch1, countDownLatch2, subList);
            //子线程交给线程池管理
            pool.execute(runnable);
        }

        //4.1 主线程 countDown，此时子线程可以 await 将被唤醒。（子线程等待也可以移除）
        countDownLatch1.countDown();
        System.out.println("开始创建索引");
        //4.2 等待所有子线程都完成，每一个子线程都会进行一次 countDown
        countDownLatch2.await();
        //线程全部完成工作
        System.out.println("所有线程都创建索引完毕");
        //释放线程池资源
        pool.shutdown();
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

# 参考资料

[一步一步跟我学习lucene（5）---lucene的索引构建原理](https://blog.csdn.net/wuyinggui10000/article/details/45625351)

* any list
{:toc}