---
layout: post
title: Lucene-22-lucene增量更新和NRT(near-real-time)Query近实时查询
date: 2022-01-10 21:01:55 +0800
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# 增量更新的必要性

有时候我们创建完索引之后，数据源可能有更新的内容，而我们又想像数据库那样能直接体现在查询中，这里就是我们所说的增量索引。

对于这样的需求我们怎么来实现呢？

lucene内部是没有提供这种增量索引的实现的；

这里我们一般可能会想到，将之前的索引全部删除，然后进行索引的重建。对于这种做法，如果数据源的条数不是特别大的情况下倒还可以，如果数据源的条数特别大的话，势必会造成查询数据耗时，同时索引的构建也是比较耗时的，几相叠加，势必可能造成查询的时候数据缺失的情况，这势必严重影响用户的体验；

## 常见方式

比较常见的增量索引的实现是：

1) 设置一个定时器，定时从数据源中读取比现有索引文件中新的内容或是数据源中带有更新标示的数据。

2) 对数据转换成需要的document并进行索引

这样做较以上的那种全删除索引然后重建的好处在于：

- 数据源查询扫描的数据量小

- 相应的更新索引的条数也少，减少了大量的IndexWriter的commit和close这些耗时操作

以上解决了增量的问题，但是实时性的问题还是存在的：索引的变更只有在IndexWriter的commit执行之后才可以体现出来。

那么我们怎样对实时性有个提升呢，大家都知道lucene索引可以以文件索引和内存索引两种方式存在，相较于文件索引，内存索引的执行效率要高于文件索引的构建，因为文件索引是要频繁的IO操作的；结合以上的考虑，我们采用文件索引+内存索引的形式来进行

## 增量更新

lucene的增量更新；其实现机制如下：

1) 定时任务扫描数据源的变更

2) 对获得的数据源列表放在内存中

3) 内存中的document达到数量限制的时候，以队列的方式删除内存中的索引，并将之添加到文件索引

4) 查询的时候采用文件+内存索引联合查询的方式以达到NRT效果

# 实现方式

## 定时任务调度器

java内置了TimerTask，此类是可以提供定时任务的，但是有一点就是TimerTask的任务是无状态的，我们还需要对任务进行并行的设置；了解到quartz任务调度框架提供了有状态的任务StatefulJob，即在本次调度任务没有执行完毕时，下次任务不会执行；

常见的我们启动一个quartz任务的方式如下：

```java
Date runTime = DateBuilder.evenSecondDate(new Date());
StdSchedulerFactory sf = new StdSchedulerFactory();
Scheduler scheduler = sf.getScheduler();
JobDetail job = JobBuilder.newJob(XXX.class).build();
Trigger trigger = TriggerBuilder.newTrigger().startAt(runTime).withSchedule(SimpleScheduleBuilder.simpleSchedule().withIntervalInSeconds(3).repeatForever()).forJob(job).build();

scheduler.scheduleJob(job, trigger);
   
scheduler.start();
```

以上我们是设置了每三秒执行一次定时任务，而任务类是XXX

## 任务类通用方法

这里我定义了一个XXX的父类，其定义如下：

```java
import java.util.List;
import java.util.TimerTask;
 
import org.apache.lucene.store.RAMDirectory;
import org.quartz.Job;
import org.quartz.StatefulJob;
 
/**有状态的任务：串行执行，即不允许上次执行没有完成即开始本次如果需要并行给接口改为Job即可
 * @author lenovo
 *
 */
public abstract class BaseInCreasementIndex implements StatefulJob {
	/**
	 * 内存索引
	 */
	private RAMDirectory ramDirectory;
	public BaseInCreasementIndex() {
	}
	public BaseInCreasementIndex(RAMDirectory ramDirectory) {
		super();
		this.ramDirectory = ramDirectory;
	}
	
	/**更新索引
	 * @throws Exception
	 */
	public abstract void updateIndexData() throws Exception;
	/**消费数据
	 * @param list
	 */
	public abstract void consume(List list) throws Exception;
}
```

任务类相关实现,以下方法是获取待添加索引的数据源 XXXInCreasementIndex

```java
@Override
public void execute(JobExecutionContext context) throws JobExecutionException {
	try {
		XXXInCreasementIndex index = new XXXInCreasementIndex(Constants.XXX_INDEX_PATH, XXXDao.getInstance(), RamDirectoryControl.getRAMDireactory());
		index.updateIndexData();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
}

@Override
public void updateIndexData() throws Exception {
	int maxBeanID = SearchUtil.getLastIndexBeanID();
	System.out.println(maxBeanID);
	List<XXX> sources = XXXDao.getListInfoBefore(maxBeanID);、、
	if (sources != null && sources.size() > 0) {
		this.consume(sources);
	}
}
```

这里，XXX代表我们要获取数据的实体类对象

consume方法主要是做两件事：

1) 数据存放到内存索引

2) 判断内存索引数量，超出限制的话以队列方式取出超出的数量，并将之存放到文件索引

```java
@Override
public void consume(List list) throws Exception {
	IndexWriter writer = RamDirectoryControl.getRAMIndexWriter();
	RamDirectoryControl.consume(writer,list);
}
```

## 内存索引控制器

首先我们对内存索引的IndexWriter进行初始化，在初始化的时候需要注意先执行一次commit，否则会提示no segments的异常

```java
private static IndexWriter ramIndexWriter;
private static RAMDirectory directory;

static{
	directory = new RAMDirectory();
	try {
		ramIndexWriter = getRAMIndexWriter();
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
}

public static RAMDirectory getRAMDireactory(){
	return directory;
}

public static IndexSearcher getIndexSearcher() throws IOException{
	IndexReader reader = null;
	IndexSearcher searcher = null;
	try {
		reader = DirectoryReader.open(directory);
	} catch (IOException e) {
		e.printStackTrace();
	}
	searcher =  new IndexSearcher(reader);
	return searcher;
}

/**单例模式获取ramIndexWriter
 * @return
 * @throws Exception 
 */
public static IndexWriter getRAMIndexWriter() throws Exception{
		if(ramIndexWriter == null){
			synchronized (IndexWriter.class) {
				Analyzer analyzer = new IKAnalyzer();
				IndexWriterConfig iwConfig = new IndexWriterConfig(analyzer);   
			    iwConfig.setOpenMode(OpenMode.CREATE_OR_APPEND);  
				try {
					ramIndexWriter = new IndexWriter(directory, iwConfig);
					ramIndexWriter.commit();
					ramIndexWriter.close();
					iwConfig = new IndexWriterConfig(analyzer);   
				    iwConfig.setOpenMode(OpenMode.CREATE_OR_APPEND);  
					ramIndexWriter = new IndexWriter(directory, iwConfig);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
	
	return ramIndexWriter;
}
```

定义一个获取内存索引中数据条数的方法

```java
/**
 * 根据查询器、查询条件、每页数、排序条件进行查询
 * @param query 查询条件
 * @param first 起始值
 * @param max 最大值
 * @param sort 排序条件
 * @return
 */
public static TopDocs getScoreDocsByPerPageAndSortField(IndexSearcher searcher,Query query, int first,int max, Sort sort){
	try {
		if(query == null){
			System.out.println(" Query is null return null ");
			return null;
		}
		TopFieldCollector collector = null;
		if(sort != null){
			collector = TopFieldCollector.create(sort, first+max, false, false, false);
		}else{
			SortField[] sortField = new SortField[1];
			sortField[0] = new SortField("createTime",SortField.Type.STRING,true);
			Sort defaultSort = new Sort(sortField);
			collector = TopFieldCollector.create(defaultSort,first+max, false, false, false);
		}
		searcher.search(query, collector);
		return collector.topDocs(first, max);
	} catch (IOException e) {
		// TODO Auto-generated catch block
	}
	return null;
}
```

此方法返回结果为TopDocs，我们根据TopDocs的totalHits来获取内存索引中的数据条数，以此来鉴别内存占用，防止内存溢出。

consume 方法的实现如下：

```java
/**
 * 消费数据
 * @param docs 
 * @param listSize 
 * @param writer
 * @param list
 * @throws Exception 
 */
public static void consume(IndexWriter writer, List list) throws Exception {
	Query query = new MatchAllDocsQuery();
	IndexSearcher searcher = getIndexSearcher();
	System.out.println(directory);
	TopDocs topDocs = getScoreDocsByPerPageAndSortField(searcher,query, 1, 1, null);
	int currentTotal = topDocs.totalHits;
	if(currentTotal+list.size() > Constants.XXX_RAM_LIMIT){
		//超出内存限制
		int pulCount = Constants.XXX_RAM_LIMIT - currentTotal;
		List<Document> docs = new LinkedList<Document>();
		
		if(pulCount <= 0){
			//直接处理集合的内容
			TopDocs allDocs = SearchUtil.getScoreDocsByPerPageAndSortField(searcher, query, 0,currentTotal, null);
			ScoreDoc[] scores = allDocs.scoreDocs;
			for(int i = 0 ;i < scores.length ; i ++){
				//取出内存中的数据
				Document doc1 = searcher.doc(scores[i].doc);
				Integer pollId = Integer.parseInt(doc1.get("id"));
				Document doc = delDocumentFromRAMDirectory(pollId);
				if(doc != null){
					XXX carSource = (XXX) BeanTransferUtil.doc2Bean(doc, XXX.class);
					Document doc2 = carSource2Document(carSource);
					if(doc2 != null){
						docs.add(doc2);
					}
				}
			}
			addDocumentToFSDirectory(docs);
			writer = getRAMIndexWriter();
			consume(writer, list);
		}else{
			//先取出未达到内存的部分
			List subProcessList = list.subList(0, pulCount);
			consume(writer, subProcessList);
			List leaveList = list.subList(pulCount, list.size());
			consume(writer, leaveList);
		}
	}else{//未超出限制，直接存放到内存
		int listSize = list.size();
		if(listSize > 0){
			//存放到内存

		}
	}
	
}
```

上边的逻辑为：

1）根据getScoreDocsByPerPageAndSortField获取当前内存中的数据条数

2）根据内存中数据数量A和本次获取的数据源的总数B和内存中限制的数量C进行比较

3）如果A+B<=C则未超出内存索引的限制，所有数据均存放到内存

4）反之，判断当前内存中的数据是否已经达到限制，如果已经超出，则直接处理取出内存中的内容，然后回调此方法。

5）如果未达到限制，先取出未达到限制的部分，然后对剩余的进行回调。

这里我们的BeanTransferUtil是根据document转换成对应的bean的方法，此处用到了反射和commons-beanutils.jar

```java
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
 
import org.apache.commons.beanutils.BeanUtils;
import org.apache.lucene.document.Document;
 
 
public class BeanTransferUtil {
 
	public static Object doc2Bean(Document doc, Class clazz) {
		try {
			Object obj = clazz.newInstance();
			Field[] fields = clazz.getDeclaredFields();
			for (Field field : fields) {
				field.setAccessible(true);
				String fieldName = field.getName();
				BeanUtils.setProperty(obj, fieldName, doc.get(fieldName));
			}
			return obj;
		} catch (InstantiationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InvocationTargetException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
}
```

从内存索引中读取索引的方法如下：

```java
/**
 * 从内存索引中删除指定的doc
 * @param pollId
 * @throws IOException 
 */
private static Document delDocumentFromRAMDirectory(Integer pollId) throws IOException {
	Document doc = null;
	Query query = SearchUtil.getQuery("id", "int", pollId+"", false);
	IndexSearcher searcher = getIndexSearcher();
	try {
		TopDocs queryDoc = SearchUtil.getScoreDocsByPerPageAndSortField(searcher, query, 0, 1, null);
		ScoreDoc[] docs = queryDoc.scoreDocs;
		System.out.println(docs.length);
		if(docs.length > 0){
			doc = searcher.doc(docs[0].doc);
			System.out.println(doc);
			ramIndexWriter.deleteDocuments(query);
			ramIndexWriter.commit();
		}
		return doc;
	} catch (IOException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
	return null;
}
```

此处是根据id来读取内存索引中的内容，然后将它转换成document同时删除内存中的对应记录。

# NRT近实时查询的实现

对于上边的索引我们要采用适当的查询方法，这里查询时候为了达到近实时的效果，需要将内存索引添加到查询的范围中，即IndexReader中。

这里的IndexSearcher的获取方法如下：

```java
/**
 * 多目录多线程查询
 * @param parentPath 父级索引目录
 * @param service 多线程查询
 * @param isAddRamDirectory 是否增加内存索引查询
 * @return
 * @throws IOException
 */
public static IndexSearcher getMultiSearcher(String parentPath,ExecutorService service, boolean isAddRamDirectory) throws IOException{
	File file = new File(parentPath);
	File[] files = file.listFiles();

	IndexReader[] readers = null;
	if(!isAddRamDirectory){
		readers = new IndexReader[files.length];
	}else{
		readers = new IndexReader[files.length+1];
	}
	for (int i = 0 ; i < files.length ; i ++) {
		readers[i] = DirectoryReader.open(FSDirectory.open(Paths.get(files[i].getPath(), new String[0])));
	}
	if(isAddRamDirectory){
		readers[files.length] = DirectoryReader.open(RamDirectoryControl.getRAMDireactory());
	}
	
	MultiReader multiReader = new MultiReader(readers);
	IndexSearcher searcher = new IndexSearcher(multiReader,service);
	return searcher;
}
```

如此，我们就可以在查询的时候既从文件索引中读取，也从内存索引中检索数据了；

# 参考资料

[一步一步跟我学习lucene（19）---lucene增量更新和NRT(near-real-time)Query近实时查询](https://blog.csdn.net/wuyinggui10000/article/details/46382111)

* any list
{:toc}