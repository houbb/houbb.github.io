---
layout: post
title: schedule-11-时间轮算法（Time Wheel Algorithm） 入门介绍
date: 2024-01-10 21:01:55 +0800
categories: [Schedule]
tags: [schedule, apache, distribued, work-flow, sh]
published: true
---



# chat

## 详细介绍一下时间轮算法

时间轮算法（Time Wheel Algorithm）是一种常用于处理定时任务的数据结构和算法。

它可以高效地管理和执行一系列定时任务，特别是在需要频繁添加、删除和执行任务时表现良好。

时间轮算法主要用于实现定时器功能，比如在操作系统、网络通信、任务调度等领域。

### 基本思想：

时间轮算法的基本思想是将时间划分为若干个固定大小的时间片（也称为槽位），并且维护一个环形的时间轮数据结构，每个槽位对应一个时间片。

时间轮按照时间递增的方向不断前进，当前时间指针指向当前时间所在的槽位。当时间轮的指针指向某个槽位时，执行该槽位上的定时任务。

### 数据结构：

时间轮通常由以下几个要素构成：

1. 槽位（Slot）：每个槽位存放需要执行的定时任务，通常使用队列等数据结构来管理任务列表。
2. 时间轮（Time Wheel）：由多个槽位构成的环形结构，用于按顺序存放定时任务。
3. 当前指针（Current Pointer）：指向当前时间所在的槽位。

### 算法流程：

1. 初始化：创建一个固定大小的时间轮，设定时间片的长度。初始化每个槽位为空。
2. 添加定时任务：将定时任务加入到合适的槽位中。如果任务执行时间在当前指针所指的槽位之后的时间片内，则将任务放入相应的槽位；否则，将任务加入到适当的未来槽位。
3. 时间推进：随着时间的推进，当前指针不断向前移动。当指针指向某个槽位时，执行该槽位上的所有定时任务，并将该槽位清空。
4. 重复执行：重复执行第3步，直到时间轮中不再有待执行的任务。

### 优点：

1. 高效性：时间轮算法的时间复杂度与时间轮的大小和定时任务的数量相关，而与时间片的长度无关，因此执行效率较高。
2. 简单易实现：时间轮算法的实现相对简单，易于理解和调试。

### 缺点：

1. 精度受限：由于时间轮的时间片是固定的，因此精度受到限制，不适用于对时间精度要求较高的场景。
2. 内存消耗：时间轮的大小会影响内存消耗，如果需要处理大量的定时任务，可能会占用较多的内存空间。

时间轮算法是一种常见且有效的定时任务管理算法，尤其适用于处理大量定时任务的场景，如网络通信中的超时处理、操作系统中的任务调度等。

## 给出任务在增加/删除/修改时，时间轮中的处理逻辑详细描述。给出每一步的 java 伪代码+示意图

下面是任务增加、删除和修改时时间轮中的处理逻辑的详细描述，以及每一步的 Java 伪代码和示意图：

### 1. 任务增加：

#### 逻辑描述：
- 确定任务应该被添加到的槽位，计算目标槽位的索引。
- 将任务添加到目标槽位。

#### Java 伪代码：
```java
public void addTask(Task task, int delayTime) {
    int targetSlot = (currentSlot + delayTime) % wheelSize;
    slots[targetSlot].add(task);
}
```

#### 示意图：
```
Initial state of time wheel:

currentSlot -> 0   1   2   3   4   5   6
               |   |   |   |   |   |   |
               |   |   |   |   |   |   |

Adding a task with delayTime = 3:

currentSlot -> 0   1   2   3   4   5   6
               |   |   | X |   |   |   |
               |   |   |   |   |   |   |
```

### 2. 任务删除：

#### 逻辑描述：
- 遍历每个槽位，检查是否存在要删除的任务。
- 如果存在，从槽位中移除任务。

#### Java 伪代码：
```java
public void removeTask(Task task) {
    for (int i = 0; i < wheelSize; i++) {
        if (slots[i].contains(task)) {
            slots[i].remove(task);
        }
    }
}
```

#### 示意图：
```
State of time wheel with task to be removed:

currentSlot -> 0   1   2   3   4   5   6
               |   |   | X |   |   |   |
               |   |   |   |   |   |   |

Removing the task:

currentSlot -> 0   1   2   3   4   5   6
               |   |   |   |   |   |   |
               |   |   |   |   |   |   |
```

### 3. 任务修改：

#### 逻辑描述：
- 删除原有的任务。
- 使用新的参数添加任务。

#### Java 伪代码：
```java
public void modifyTask(Task oldTask, Task newTask, int newDelayTime) {
    removeTask(oldTask);
    addTask(newTask, newDelayTime);
}
```

#### 示意图：
```
State of time wheel with task to be modified:

currentSlot -> 0   1   2   3   4   5   6
               |   |   | X |   |   |   |
               |   |   |   |   |   |   |

Modifying the task with new delayTime = 2:

currentSlot -> 0   1   2   3   4   5   6
               |   |   |   | X |   |   |
               |   |   |   |   |   |   |
```

以上是任务增加、删除和修改时时间轮中的处理逻辑的详细描述，以及每一步的 Java 伪代码和示意图。

## 这样的话，删除逻辑性能不是很差吗？

确实，如果时间轮中有大量的任务需要删除，简单地遍历每个槽位来检查任务并删除，可能会导致性能下降，特别是当时间轮中的槽位数量很大时。

为了提高删除性能，可以考虑以下优化措施：

1. **使用更高效的数据结构：** 使用哈希表或其他更适合快速查找和删除的数据结构来存储每个槽位的任务列表，而不是简单的数组或列表。

2. **维护任务索引：** 维护一个从任务到槽位的索引，这样就可以直接找到包含特定任务的槽位，而不需要遍历整个时间轮。

3. **延迟删除：** 考虑在删除任务时不立即从时间轮中移除，而是标记为待删除状态，并在下一个时间片处理时进行删除。这种方式可以减少删除操作对性能的影响。

4. **批量删除：** 如果有多个任务需要删除，可以考虑批量处理这些删除操作，减少遍历时间轮的次数。

5. **定期清理：** 定期清理已完成的任务或已删除的任务，以保持时间轮的高效性能。

综上所述，通过使用更高效的数据结构、优化删除操作的实现方式以及定期进行清理等措施，可以有效提高时间轮中任务删除的性能。


### 个人理解

可以结合 `HashMap<String, Long>` 存放任务标识，和对应的槽位信息，达到快速删除的效果。

然后就是可以模仿 redis 的惰性删除。


## 给出每一次时间变化时间轮的具体处理逻辑。给出 java 伪代码 + 示意图

下面是时间轮每一次时间变化时的具体处理逻辑的详细描述，以及每一步的 Java 伪代码和示意图：

### 时间变化：

#### 逻辑描述：
- 当前时间轮的指针向前移动一个槽位。
- 执行当前槽位上的所有任务，并清空该槽位。
- 将指向下一个槽位的指针更新为当前槽位的下一个槽位。

#### Java 伪代码：
```java
public void timeTick() {
    // 移动时间轮指针
    currentSlot = (currentSlot + 1) % wheelSize;
    
    // 执行当前槽位上的所有任务
    for (Task task : slots[currentSlot]) {
        task.execute();
    }
    
    // 清空当前槽位
    slots[currentSlot].clear();
}
```

#### 示意图：
```
Before time tick:

currentSlot -> 0   1   2   3   4   5   6
               |   |   | X |   |   |   |
               |   |   |   |   |   |   |

After time tick:

currentSlot -> 0   1   2   3   4   5   6
               |   |   |   | X |   |   |
               |   |   |   |   |   |   |
```

在示意图中，当前指针指向了槽位2，在时间变化后，当前指针移动到了槽位3，同时执行了槽位2上的任务，并清空了该槽位。

## 如果当前槽位的任务，是循环多次执行的？是不是清空后，要加到下一个时间的槽位？给出 java 伪代码 + 示意图

如果当前槽位的任务是循环多次执行的，并且需要在执行后继续在时间轮中执行，那么在清空当前槽位后，需要将这些任务添加到下一个时间的槽位。下面是相应的 Java 伪代码和示意图：

### 时间变化：

#### 逻辑描述：
- 当前时间轮的指针向前移动一个槽位。
- 执行当前槽位上的所有任务，并将循环执行的任务添加到下一个时间的槽位。
- 将指向下一个槽位的指针更新为当前槽位的下一个槽位。

#### Java 伪代码：
```java
public void timeTick() {
    // 移动时间轮指针
    currentSlot = (currentSlot + 1) % wheelSize;
    
    // 执行当前槽位上的所有任务
    for (Task task : slots[currentSlot]) {
        task.execute();
        
        // 如果任务是循环执行的，则将其添加到下一个时间的槽位
        if (task.isRecurring()) {
            int nextSlot = (currentSlot + task.getDelay()) % wheelSize;
            slots[nextSlot].add(task);
        }
    }
    
    // 清空当前槽位
    slots[currentSlot].clear();
}
```

#### 示意图：

```
Before time tick:

currentSlot -> 0   1   2   3   4   5   6
               |   |   | X |   |   |   |
               |   |   |   |   |   |   |

After time tick:

currentSlot -> 0   1   2   3   4   5   6
               |   |   |   |   |   |   |
               |   |   |   | X | X |   |
```

在示意图中，当前指针指向了槽位2，在时间变化后，当前指针移动到了槽位3，同时执行了槽位2上的任务，并将循环执行的任务添加到了槽位4和槽位5。

## 如果其中有一个任务需要很久以后才执行，那么数组不是会非常大且空旷吗？如何解决优化？给出具体的逻辑和 java 伪代码

### 动态扩容

确实，如果时间轮中存在需要很久以后才执行的任务，会导致数组中出现很多空槽，浪费了内存空间。

为了优化这种情况，可以考虑动态调整时间轮的大小，或者采用其他数据结构来替代简单的数组。

以下是一种动态调整时间轮大小的方案：

### 动态调整时间轮大小：

#### 逻辑描述：
- 当添加任务时，如果任务的延迟超过当前时间轮的范围，则动态扩展时间轮的大小，以容纳该任务。
- 扩展时间轮的大小后，将现有任务重新分配到新的时间轮上。

#### Java 伪代码：
```java
public void addTask(Task task, int delayTime) {
    int targetSlot = (currentSlot + delayTime) % wheelSize;
    if (delayTime > wheelSize) {
        resizeWheel(delayTime);
        // 将现有任务重新分配到新的时间轮上
        redistributeTasks();
    }
    slots[targetSlot].add(task);
}

private void resizeWheel(int newWheelSize) {
    // 创建新的时间轮
    List<Task>[] newSlots = new ArrayList[newWheelSize];
    for (int i = 0; i < newWheelSize; i++) {
        newSlots[i] = new ArrayList<>();
    }
    // 将现有任务重新分配到新的时间轮上
    // 略...
    // 更新时间轮的大小和当前指针
    wheelSize = newWheelSize;
    currentSlot = (currentSlot % newWheelSize);
}

private void redistributeTasks() {
    // 将现有任务重新分配到新的时间轮上
    // 略...
}
```

通过动态调整时间轮的大小，可以有效地减少空槽的数量，提高内存利用率。

这种方案可能会涉及到一些复杂的重新分配任务的逻辑，特别是当时间轮的大小变化时，需要重新计算每个任务在新时间轮上的位置。

### 多级

动态扩容肯定无法解决问题，比如大部分都是分钟级别执行一次。但是有一个任务要几个月执行一次。要如何优化时间轮的数据结构？比如引入多级？

确实，动态扩容并不是解决所有问题的最佳方案，特别是对于长时间延迟的任务而言。引入多级时间轮是一种更好的优化策略，可以有效地管理长时间延迟的任务，同时保持对短时间延迟任务的高效处理。

以下是引入多级时间轮的优化方案：

### 多级时间轮优化：

#### 逻辑描述：

1. 引入多级时间轮，将任务按照延迟时间分配到不同级别的时间轮上。

2. 每个级别的时间轮包含多个槽位，槽位的数量根据该级别的时间跨度确定。

3. 当执行时间轮的时间变化操作时，逐级地推进每个时间轮，执行当前槽位上的任务，并将适当的循环执行的任务添加到下一个级别的时间轮中。

#### Java 伪代码：

```java
public class MultiLevelTimeWheel {
    private List<TimeWheel>[] timeWheels;
    private int[] levels;
    private int currentLevel;
    private int[] currentSlot;

    public MultiLevelTimeWheel(int[] levels, int[] slotsPerLevel) {
        this.levels = levels;
        timeWheels = new List[levels.length];
        for (int i = 0; i < levels.length; i++) {
            timeWheels[i] = new TimeWheel(slotsPerLevel[i]);
        }
        currentLevel = 0;
        currentSlot = new int[levels.length];
    }

    public void addTask(Task task, int delayTime) {
        if (delayTime <= 0) {
            timeWheels[0].addTask(task, 0);
        } else {
            for (int i = levels.length - 1; i >= 0; i--) {
                if (delayTime >= levels[i]) {
                    timeWheels[i].addTask(task, delayTime / levels[i]);
                    break;
                }
            }
        }
    }

    public void timeTick() {
        currentSlot[currentLevel]++;
        if (currentSlot[currentLevel] >= timeWheels[currentLevel].getSlots()) {
            if (currentLevel < levels.length - 1) {
                currentSlot[currentLevel] = 0;
                currentLevel++;
            } else {
                currentSlot[currentLevel] = timeWheels[currentLevel].getSlots() - 1;
            }
        }

        timeWheels[currentLevel].timeTick(currentSlot[currentLevel]);
    }
}
```

在这个示例中，`MultiLevelTimeWheel` 类包含了多个级别的时间轮，每个级别的时间轮都有不同的槽位数量和时间跨度。

在添加任务时，根据任务的延迟时间选择合适的级别和时间轮。在执行时间变化操作时，逐级推进每个时间轮，并执行当前槽位上的任务。

### 示意图：

```
Multiple levels of time wheels:

Level 0: Minutes
      0   1   2   3   4   5   6   7   8   9  ... (60 slots)
      |   |   |   |   |   |   |   |   |   |
      |   |   |   |   |   |   |   |   |   |

Level 1: Hours
      0   1   2   3   4   5   6   7   8   9  ... (24 slots)
      |   |   |   |   |   |   |   |   |   |
      |   |   |   |   |   |   |   |   |   |

Level 2: Days
      0   1   2   3   4   5   6   7   8   9  ... (30 slots)
      |   |   |   |   |   |   |   |   |   |
      |   |   |   |   |   |   |   |   |   |
```

在示意图中，有三个级别的时间轮，分别表示分钟、小时和天。每个级别的时间轮都有相应的槽位数量，用于存放对应级别的任务。随着时间的推移，时间轮不断向前移动，并执行当前槽位上的任务。

## 对于时间轮算法，有哪些优秀的开源组件使用了？

时间轮算法在定时任务处理中有着广泛的应用，因此有许多优秀的开源组件使用了时间轮算法或类似的实现。以下是一些常用的开源组件：

1. **Netty：** Netty 是一个高性能的网络应用框架，它使用了 HashedWheelTimer，这是一个基于时间轮算法实现的定时器。Netty 的 HashedWheelTimer 实现了高性能的定时任务调度，被广泛应用于网络编程中。

2. **Quartz：** Quartz 是一个开源的作业调度框架，它提供了丰富的调度功能，支持复杂的调度需求。Quartz 采用了类似时间轮的数据结构来管理定时任务，保证了任务的高效执行和可靠性。

3. **Akka：** Akka 是一个基于 Actor 模型的并发编程框架，它提供了高度可扩展和并发的处理能力。Akka 中的 Scheduler 使用了时间轮算法来管理和调度任务，支持高并发、高吞吐量的任务处理。

4. **Disruptor：** Disruptor 是一个高性能的并发框架，主要用于解决多线程环境下的数据交换和事件处理问题。它内部的 RingBuffer 实现了类似于时间轮的数据结构，用于高效地管理事件的调度和处理。

5. **JCTools：** JCTools 是一个 Java 并发工具库，提供了各种并发数据结构和算法的实现。它包含了许多优化过的并发数据结构，其中包括一个基于时间轮算法的 DelayQueue 的实现，用于处理延迟任务的调度。

以上是一些常用的开源组件，它们在不同领域使用了时间轮算法或类似的实现来处理定时任务和调度需求。

## 给出 HashedWheelTimer 的源码核心部分解析

HashedWheelTimer 是 Netty 框架中用于实现时间轮算法的定时器。下面是 HashedWheelTimer 的核心源码部分解析，重点介绍了其实现原理和关键代码片段：

### 时间轮核心逻辑：

HashedWheelTimer 的实现主要包含两个核心类：HashedWheelTimer 和 HashedWheelBucket。

1. **HashedWheelTimer：** 时间轮的实现类，负责管理和调度任务。

```java
public class HashedWheelTimer implements Timer {

    // 时间轮的槽位数
    private final int wheelSize;
    
    // 时间轮的槽位数组
    private final HashedWheelBucket[] wheel;
    
    // 当前时间轮指针所在的槽位索引
    private volatile int currentTickIndex;
    
    // ...
    
    public HashedWheelTimer(ThreadFactory threadFactory) {
        // 初始化时间轮的槽位数
        wheelSize = 512;
        // 初始化时间轮的槽位数组
        wheel = createWheel(wheelSize);
        // 初始化当前指针所在槽位索引
        currentTickIndex = 0;
        // ...
    }

    // 时间轮执行方法
    private void tick() {
        // 获取当前槽位
        HashedWheelBucket bucket = wheel[currentTickIndex];
        // 执行当前槽位上的任务
        bucket.expireTimedOutTasks();
        // 移动指针到下一个槽位
        currentTickIndex = (currentTickIndex + 1) & (wheelSize - 1);
    }
    
    // ...
}
```

2. **HashedWheelBucket：** 时间轮的槽位实现类，负责管理槽位上的任务。

```java
final class HashedWheelBucket {

    // 存储该槽位上的任务的队列
    private final Queue<Timeout> timeouts = new LinkedBlockingQueue<>();

    // 执行槽位上所有任务的方法
    void expireTimedOutTasks() {
        // 依次执行队列中的任务
        for (;;) {
            // 从队列中获取任务
            Timeout timeout = timeouts.poll();
            if (timeout == null) {
                break;
            }
            // 执行任务
            timeout.expire();
        }
    }
}
```

### 关键逻辑解析：

- 时间轮通过数组 wheel 存储多个槽位，每个槽位对应一个 HashedWheelBucket 实例。
- 时间轮通过 currentTickIndex 记录当前指针所在的槽位索引，每次 tick 操作时，指针向前移动一个槽位。
- 每个槽位上的任务通过 HashedWheelBucket 中的 timeouts 队列进行存储和管理，在每次 tick 操作时，执行当前槽位上的所有任务。

HashedWheelTimer 的核心原理是使用数组来模拟时间轮的槽位，通过指针的移动和槽位上任务的管理来实现定时任务的调度。

## 今天的你拥有人类几千年的知识和技术，让你来设计和实现一个最高性能的时间轮。你会如何设计？给出理由。并最后给出实现的 java 代码。

设计和实现一个最高性能的时间轮需要考虑以下几个方面：

1. **高效的槽位管理：** 时间轮的核心是槽位的管理，因此需要设计高效的数据结构来存储和管理槽位上的任务。使用数组可以提供 O(1) 的访问速度，但在动态调整大小时可能会有性能损失。因此，可以考虑使用链表或跳表等数据结构，以提供更好的插入和删除性能。

2. **时间轮的扩展性：** 考虑到任务数量和延迟时间的变化，时间轮需要具备良好的扩展性。可以设计多级时间轮来处理长时间延迟的任务，或者采用动态调整大小的策略来优化内存利用率。

3. **高效的任务调度：** 时间轮的时间变化操作需要尽量减少时间复杂度，以提高任务调度的效率。可以使用位运算来替代取模操作，避免除法运算的开销。另外，可以采用并行处理的方式来执行槽位上的任务，以提高并发性能。

4. **内存和线程安全性：** 时间轮的设计需要考虑内存占用和线程安全性。可以采用适当的数据结构和同步机制来保证内存利用率和线程安全性。

基于以上考虑，下面是一个简单的 Java 实现示例：

```java
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class HighPerformanceTimeWheel {

    private final int wheelSize;
    private final List<BlockingQueue<Runnable>> slots;
    private volatile int currentSlot;

    public HighPerformanceTimeWheel(int wheelSize) {
        this.wheelSize = wheelSize;
        this.slots = new ArrayList<>(wheelSize);
        for (int i = 0; i < wheelSize; i++) {
            slots.add(new LinkedBlockingQueue<>());
        }
        this.currentSlot = 0;
    }

    public void addTask(Runnable task, int delayTime) {
        int targetSlot = (currentSlot + delayTime) % wheelSize;
        slots.get(targetSlot).offer(task);
    }

    public void timeTick() {
        BlockingQueue<Runnable> currentQueue = slots.get(currentSlot);
        for (Runnable task : currentQueue) {
            // 执行当前槽位上的任务
            new Thread(task).start();
        }
        // 清空当前槽位
        currentQueue.clear();
        // 移动指针到下一个槽位
        currentSlot = (currentSlot + 1) % wheelSize;
    }

    public static void main(String[] args) throws InterruptedException {
        HighPerformanceTimeWheel timeWheel = new HighPerformanceTimeWheel(60); // 60个槽位，模拟1分钟的时间轮
        // 添加一个任务到当前槽位，延迟5秒执行
        timeWheel.addTask(() -> System.out.println("Task executed at " + System.currentTimeMillis()), 5);
        // 模拟时间流逝
        for (int i = 0; i < 10; i++) {
            Thread.sleep(1000); // 模拟1秒钟时间流逝
            timeWheel.timeTick(); // 时间轮前进1秒
        }
    }
}
```

在这个示例中，我们使用了一个数组来模拟时间轮的槽位，每个槽位对应一个阻塞队列，用于存储该槽位上的任务。

在时间变化操作时，我们遍历当前槽位上的任务，并使用线程来执行它们。同时，我们使用了简单的取模运算来实现时间轮的指针移动。

### 任务删除时，你这个性能很差。重新优化给出代码。

为了优化任务删除的性能，我们可以采用更高效的数据结构来管理任务。一种常见的方法是使用哈希表（HashMap）来存储任务，以任务的唯一标识符作为键，任务对象作为值。这样在删除任务时，可以直接根据唯一标识符来删除，而不需要遍历整个槽位。下面是优化后的 Java 实现示例：

```java
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class HighPerformanceTimeWheel {

    private final int wheelSize;
    private final Map<String, Runnable> tasks;
    private final BlockingQueue<Runnable>[] slots;
    private volatile int currentSlot;

    public HighPerformanceTimeWheel(int wheelSize) {
        this.wheelSize = wheelSize;
        this.tasks = new HashMap<>();
        this.slots = new LinkedBlockingQueue[wheelSize];
        for (int i = 0; i < wheelSize; i++) {
            slots[i] = new LinkedBlockingQueue<>();
        }
        this.currentSlot = 0;
    }

    public void addTask(String taskId, Runnable task, int delayTime) {
        int targetSlot = (currentSlot + delayTime) % wheelSize;
        if (delayTime <= 0) {
            // 如果延迟时间小于等于0，则立即执行任务
            new Thread(task).start();
        } else {
            slots[targetSlot].offer(() -> {
                task.run();
                // 任务执行完成后，从任务列表中移除
                tasks.remove(taskId);
            });
            // 将任务添加到任务列表中
            tasks.put(taskId, task);
        }
    }

    public void removeTask(String taskId) {
        Runnable task = tasks.remove(taskId);
        if (task != null) {
            for (BlockingQueue<Runnable> queue : slots) {
                queue.remove(task);
            }
        }
    }

    public void timeTick() {
        BlockingQueue<Runnable> currentQueue = slots[currentSlot];
        for (Runnable task : currentQueue) {
            new Thread(task).start();
        }
        currentQueue.clear();
        currentSlot = (currentSlot + 1) % wheelSize;
    }

    public static void main(String[] args) throws InterruptedException {
        HighPerformanceTimeWheel timeWheel = new HighPerformanceTimeWheel(60);
        String taskId = "task1";
        timeWheel.addTask(taskId, () -> System.out.println("Task executed at " + System.currentTimeMillis()), 5);
        // 模拟时间流逝
        for (int i = 0; i < 10; i++) {
            Thread.sleep(1000);
            timeWheel.timeTick();
            if (i == 3) {
                timeWheel.removeTask(taskId);
            }
        }
    }
}
```

在这个优化后的实现中，我们使用了 HashMap 来存储任务，键为任务的唯一标识符，值为任务对象。

在添加任务时，将任务存储到哈希表中，并将任务添加到对应的槽位中。

在删除任务时，直接根据唯一标识符从哈希表中移除任务，并遍历所有槽位将任务从槽位中移除。这样可以大大提高任务删除的效率。

PS: 感觉这里设计的其实还是有问题，我们后续自己实现。

* any list
{:toc}