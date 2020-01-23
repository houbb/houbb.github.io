---
layout: post
title: 利用有向无环图（DAG）进行任务调度 
date:  2020-1-23 10:09:32 +0800
categories: [Data-Struct]
tags: [data-struct, dag, schedule, sh]
published: true
---

# 定时任务

定时任务是软件开发中经常遇到的问题。

简单的定时任务只需要在固定时间触发它的执行就可以了。

但是对于复杂的定时任务，可能是由多个任务组成一个任务组，它们之间存在依赖关系，一个任务执行的条件，必须是它的前置任务已经执行成功（或者没有前置任务），它才可以执行。

例如下面这幅图：

![image](https://user-images.githubusercontent.com/18375710/72712952-12404300-3ba7-11ea-86f6-9a6610c616dd.png)

图中任务的依赖关系为：

任务1：依赖2，5

任务2：依赖3，4

任务3：无依赖

任务4：无依赖

任务5：无依赖

任务6：依赖2

这个任务关系图其实就是“有向无环图”（简称DAG）这种数据结构。

图是由一系列顶点和连接顶点的边组成的数据结构。它分为有向图和无向图。

有向图的边是有方向的，即A->B这条边和B->A是两条不同的边，而无向图中，A->B和B->A是共用一条边的。基于这种数据结构，我们可以用图的顶点表示一个任务，而图的边表示任务之间的依赖关系，就可以基于有向无环图来实现任务调度。

本文基于有向无环图实现了一个简单的任务调度系统的demo。


# 代码实现

## 定义接口

```java
public interface Executor {
    boolean execute();
}
```

这个接口代表一个可执行的任务，execute代表任务的执行。

## 定义一个Executor接口的实现Task

```java
public class Task implements Executor{
    private Long id;
    private String name;
    private int state;
 
    public Task(Long id, String name, int state) {
        this.id = id;
        this.name = name;
        this.state = state;
    }
 
    public boolean execute() {
        System.out.println("Task id: [" + id + "], " + "task name: [" + name +"] is running");
        state = 1;
        return true;
    }
 
    public boolean hasExecuted() {
        return state == 1;
    }
}
```

id：任务id

name：任务名

state：任务状态，简化为0：未执行，1：已执行

hasExecuted：返回任务是否已执行

## 任务图

```java
public class Digraph {

    private Set<Task> tasks;

    private Map<Task, Set<Task>> map;
 
    public Digraph() {
        this.tasks = new HashSet<Task>();
        this.map = new HashMap<Task, Set<Task>>();
    }
 
    public void addEdge(Task task, Task prev) {
        if (!tasks.contains(task) || !tasks.contains(prev)) {
            throw new IllegalArgumentException();
        }
        Set<Task> prevs = map.get(task);
        if (prevs == null) {
            prevs = new HashSet<Task>();
            map.put(task, prevs);
        }
        if (prevs.contains(prev)) {
            throw new IllegalArgumentException();
        }
        prevs.add(prev);
    }
 
    public void addTask(Task task) {
        if (tasks.contains(task)) {
            throw new IllegalArgumentException();
        }
        tasks.add(task);
    }
 
    public void remove(Task task) {
        if (!tasks.contains(task)) {
            return;
        }
        if (map.containsKey(task)) {
            map.remove(task);
        }
        for (Set<Task> set : map.values()) {
            if (set.contains(task)) {
                set.remove(task);
            }
        }
    }
 
    public Set<Task> getTasks() {
        return tasks;
    }
 
    public void setTasks(Set<Task> tasks) {
        this.tasks = tasks;
    }
 
    public Map<Task, Set<Task>> getMap() {
        return map;
    }
 
    public void setMap(Map<Task, Set<Task>> map) {
        this.map = map;
    }
}
```

这个类使用了邻接表来表示有向无环图。

tasks是顶点集合，也就是任务集合。

map是任务依赖关系集合。key是一个任务，value是它的前置任务集合。

一个任务执行的前提是它在map中没有以它作为key的entry，或者是它的前置任务集合中的任务都是已执行的状态。

## 调度器

```java
public class Scheduler {

    public void schedule(Digraph digraph) {
        while (true) {
            List<Task> todo = new ArrayList<Task>();
            for (Task task : digraph.getTasks()) {
                if (!task.hasExecuted()) {
                    Set<Task> prevs = digraph.getMap().get(task);
                    if (prevs != null && !prevs.isEmpty()) {
                        boolean toAdd = true;
                        for (Task task1 : prevs) {
                            if (!task1.hasExecuted()) {
                                toAdd = false;
                                break;
                            }
                        }
                        if (toAdd) {
                            todo.add(task);
                        }
                    } else {
                        todo.add(task);
                    }
                }
            }
            if (!todo.isEmpty()) {
                for (Task task : todo) {
                    if (!task.execute()) {
                        throw new RuntimeException();
                    }
                }
            } else {
                break;
            }
        }
    }
 
    public static void main(String[] args) {
        Digraph digraph = new Digraph();
        Task task1 = new Task(1L, "task1", 0);
        Task task2 = new Task(2L, "task2", 0);
        Task task3 = new Task(3L, "task3", 0);
        Task task4 = new Task(4L, "task4", 0);
        Task task5 = new Task(5L, "task5", 0);
        Task task6 = new Task(6L, "task6", 0);
        digraph.addTask(task1);
        digraph.addTask(task2);
        digraph.addTask(task3);
        digraph.addTask(task4);
        digraph.addTask(task5);
        digraph.addTask(task6);
        digraph.addEdge(task1, task2);
        digraph.addEdge(task1, task5);
        digraph.addEdge(task6, task2);
        digraph.addEdge(task2, task3);
        digraph.addEdge(task2, task4);
        Scheduler scheduler = new Scheduler();
        scheduler.schedule(digraph);
    }
}
```

调度器的实现比较简单，就是遍历任务集合，找出待执行的任务集合，放到一个List中，再串行执行（若考虑性能，可优化为并行执行）。

若List为空，说明所有任务都已执行，则这一次任务调度结束。

# 参考资料

[基于有向无环图（DAG）的任务调度Demo](https://blog.csdn.net/dbqb007/article/details/89042984)

[Spark的有向无环图DAG(代码及图解)](https://blog.csdn.net/silentwolfyh/article/details/53996845)

* any list
{:toc}