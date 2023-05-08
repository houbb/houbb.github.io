---
layout: post
title: spring StopWatch 更加优雅的耗时统计工具使用入门及源码浅析
date:  2023-05-09 +0800
categories: [Tool]
tags: [tool, spring, sh]
published: true
---

# 说明

针对一些耗时的操作，我们经常需要统计其耗时，便于后期优化等。

一般常见的做法是使用 System.currentTimeMills() 然后计算。

针对耗时，其实 spring 提供了更加简单易用的方法。

# StopWatch 使用

```java
StopWatch stopWatch = new StopWatch();

stopWatch.start();

// 模拟耗时的操作
Thread.sleep(10);

stopWatch.stop();

long timeCost = stopWatch.getTotalTimeMillis();
System.out.println("Total time cost: " + timeCost);
```

# 源码

## spring 版本

V4.3.15 RELEASE

## 属性

```java
    /**
	 * Identifier of this stop watch.
	 * Handy when we have output from multiple stop watches
	 * and need to distinguish between them in log or console output.
	 */
	private final String id;

	private boolean keepTaskList = true;

	private final List<TaskInfo> taskList = new LinkedList<TaskInfo>();

	/** Start time of the current task */
	private long startTimeMillis;

	/** Is the stop watch currently running? */
	private boolean running;

	/** Name of the current task */
	private String currentTaskName;

	private TaskInfo lastTaskInfo;

	private int taskCount;

	/** Total running time */
	private long totalTimeMillis;
```

## 构造器

```java
    /**
	 * Construct a new stop watch. Does not start any task.
	 */
	public StopWatch() {
		this("");
	}

	/**
	 * Construct a new stop watch with the given id.
	 * Does not start any task.
	 * @param id identifier for this stop watch.
	 * Handy when we have output from multiple stop watches
	 * and need to distinguish between them.
	 */
	public StopWatch(String id) {
		this.id = id;
	}
```

## 任务的状态变化

### start

```java
    /**
	 * Start an unnamed task. The results are undefined if {@link #stop()}
	 * or timing methods are called without invoking this method.
	 * @see #stop()
	 */
	public void start() throws IllegalStateException {
		start("");
	}

	/**
	 * Start a named task. The results are undefined if {@link #stop()}
	 * or timing methods are called without invoking this method.
	 * @param taskName the name of the task to start
	 * @see #stop()
	 */
	public void start(String taskName) throws IllegalStateException {
		if (this.running) {
			throw new IllegalStateException("Can't start StopWatch: it's already running");
		}
		this.running = true;
		this.currentTaskName = taskName;
		this.startTimeMillis = System.currentTimeMillis();
	}
```

### stop

```java
    /**
	 * Stop the current task. The results are undefined if timing
	 * methods are called without invoking at least one pair
	 * {@code start()} / {@code stop()} methods.
	 * @see #start()
	 */
	public void stop() throws IllegalStateException {
		if (!this.running) {
			throw new IllegalStateException("Can't stop StopWatch: it's not running");
		}
		long lastTime = System.currentTimeMillis() - this.startTimeMillis;
		this.totalTimeMillis += lastTime;
		this.lastTaskInfo = new TaskInfo(this.currentTaskName, lastTime);
		if (this.keepTaskList) {
			this.taskList.add(lastTaskInfo);
		}
		++this.taskCount;
		this.running = false;
		this.currentTaskName = null;
	}
```

## 基本属性的获取

```java
    /**
	 * Return the total time in milliseconds for all tasks.
	 */
	public long getTotalTimeMillis() {
		return this.totalTimeMillis;
	}

	/**
	 * Return the total time in seconds for all tasks.
	 */
	public double getTotalTimeSeconds() {
		return this.totalTimeMillis / 1000.0;
	}

	/**
	 * Return the number of tasks timed.
	 */
	public int getTaskCount() {
		return this.taskCount;
	}

	/**
	 * Return an array of the data for tasks performed.
	 */
	public TaskInfo[] getTaskInfo() {
		if (!this.keepTaskList) {
			throw new UnsupportedOperationException("Task info is not being kept!");
		}
		return this.taskList.toArray(new TaskInfo[this.taskList.size()]);
	}
```

# 小结

实现起来还是不难，主要是对于场景方法封装的思想。

# 参考资料

http://yann.lecun.com/exdb/mnist/

* any list
{:toc}