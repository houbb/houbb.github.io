---
layout: post
title: 轻松学习多线程 16-Active Object 模式
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# Active Object 模式

Active Object 模式是接受异步消息的主动对象

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| MakerClientThread.java | 构建客户端线程 |
| ActiveObjectFactory.java | |
| FutureResult.java | 未来的结果类 |
| SchedulerThread.java | 任务调度线程 |
| ActivationQueue.java | 队列 |
| ActiveObject.java | 主动对象 |
| RealResult.java | 真实结果 |
| MethodRequest.java | 方法请求 |
| DisplayStringRequest.java | 展现字符串的请求类 |
| Proxy.java | 代理 |
| Result.java | 结果 |
| MakeStringRequest.java | 构建字符串的请求 |
| Servant.java | 消费者 |
| DisplayClientThread.java | 展现客户端线程 |

## 定义


- MakerClientThread.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

import com.github.houbb.thread.learn.easy.learn.ThreadUtil;

public class MakerClientThread extends Thread {

    private final ActiveObject activeObject;

    private final char fillChar;

    public MakerClientThread(String name, ActiveObject activeObject) {
        super(name);
        this.activeObject = activeObject;
        this.fillChar = name.charAt(0);
    }

    @Override
    public void run() {
        int i = 0;
        while(true) {
            i++;
            Result<String> stringResult = activeObject.makeString(i, fillChar);
            ThreadUtil.sleep(10);
            String value = stringResult.getResultValue();
            System.out.println(Thread.currentThread().getName()+": " +value);
        }
    }

}

```


- ActiveObjectFactory.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public class ActiveObjectFactory {

    public static ActiveObject createActiveObject() {
        Servant servant = new Servant();
        ActivationQueue activationQueue = new ActivationQueue();
        SchedulerThread schedulerThread = new SchedulerThread(activationQueue);

        Proxy proxy = new Proxy(schedulerThread, servant);
        schedulerThread.start();
        return proxy;
    }

}

```


- FutureResult.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public class FutureResult<T> implements Result<T> {

    private boolean isReady = false;

    private Result<T> result;

    public synchronized void setResult(Result<T> result) {
        this.result = result;
        isReady = true;
        notifyAll();
    }

    @Override
    public synchronized T getResultValue() {
        while (!isReady) {
            try {
                wait();
            } catch (InterruptedException e) {
                //ignore
            }
        }

        return result.getResultValue();
    }

}

```


- SchedulerThread.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public class SchedulerThread extends Thread {

    private final ActivationQueue activationQueue;

    public SchedulerThread(ActivationQueue activationQueue) {
        this.activationQueue = activationQueue;
    }

    /**
     * 添加待执行的元素
     * @param methodRequest
     */
    public void invoke(MethodRequest methodRequest) {
        activationQueue.putRequest(methodRequest);
    }

    @Override
    public void run() {
        while(true) {
            MethodRequest request = activationQueue.takeRequest();
            request.execute();
        }
    }
}

```


- ActivationQueue.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public class ActivationQueue {

    /**
     * 最大请求限制
     */
    private static final int MAX_REQUEST_LIMIT = 100;
    /**
     * 总数
     */
    private int count;
    /**
     * 尾巴
     */
    private int tail;
    /**
     * 头
     */
    private int head;

    private MethodRequest[] methodRequestQueue;

    public ActivationQueue() {
        this.count = 0;
        this.head = 0;
        this.tail = 0;
        methodRequestQueue = new MethodRequest[MAX_REQUEST_LIMIT];
    }

    public synchronized void putRequest(MethodRequest methodRequest) {
        while(count >= MAX_REQUEST_LIMIT) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        methodRequestQueue[tail] = methodRequest;
        tail = (tail+1)%methodRequestQueue.length;
        count++;
        notifyAll();
    }

    public synchronized MethodRequest takeRequest() {
        while(count <= 0) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        MethodRequest methodRequest = methodRequestQueue[head];
        head = (head+1)%methodRequestQueue.length;
        count--;
        notifyAll();
        return methodRequest;
    }

}

```


- ActiveObject.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public interface ActiveObject {

    /**
     * 构建字符串
     * @param count
     * @param fillChar
     * @return
     */
    Result<String> makeString(int count, char fillChar);

    /**
     * 展现字符串
     * @param string
     */
    void display(String string);

}

```


- RealResult.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public class RealResult<T> implements Result<T> {

    private final T resultValue;

    public RealResult(T resultValue) {
        this.resultValue = resultValue;
    }

    @Override
    public T getResultValue() {
        return resultValue;
    }

}

```


- MethodRequest.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public abstract class MethodRequest<T> {

    protected final Servant servant;

    protected final FutureResult<T> futureResult;

    protected MethodRequest(Servant servant, FutureResult<T> futureResult) {
        this.servant = servant;
        this.futureResult = futureResult;
    }

    public abstract void execute();

}

```


- DisplayStringRequest.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public class DisplayStringRequest extends MethodRequest<Object> {


    private final String string;

    public DisplayStringRequest(Servant servant, String string) {
        super(servant, null);
        this.string = string;
    }

    @Override
    public void execute() {
        servant.display(string);
    }

}

```


- Proxy.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public class Proxy implements ActiveObject {

    private final SchedulerThread schedulerThread;

    private final Servant servant;

    public Proxy(SchedulerThread schedulerThread, Servant servant) {
        this.schedulerThread = schedulerThread;
        this.servant = servant;
    }

    @Override
    public Result<String> makeString(int count, char fillChar) {
        FutureResult<String> stringFutureResult = new FutureResult<>();
        MakeStringRequest request = new MakeStringRequest(servant, stringFutureResult, count, fillChar);
        schedulerThread.invoke(request);
        return stringFutureResult;
    }

    @Override
    public void display(String string) {
        schedulerThread.invoke(new DisplayStringRequest(servant, string));
    }

}

```


- Result.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public interface Result<T> {

    T getResultValue();

}

```


- MakeStringRequest.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public class MakeStringRequest extends MethodRequest<String> {

    private final int count;

    private final char fillChar;

    public MakeStringRequest(Servant servant, FutureResult<String> futureResult,
                             int count, char fillChar) {
        super(servant, futureResult);
        this.count = count;
        this.fillChar = fillChar;
    }

    @Override
    public void execute() {
        Result<String> stringResult = servant.makeString(count, fillChar);
        this.futureResult.setResult(stringResult);
    }

}

```


- Servant.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

import com.github.houbb.thread.learn.easy.learn.ThreadUtil;

import java.util.Arrays;

public class Servant implements ActiveObject {

    @Override
    public Result<String> makeString(int count, char fillChar) {
        char[] chars = new char[count];
        Arrays.fill(chars, fillChar);
        ThreadUtil.sleepRandom();
        return new RealResult<>(new String(chars));
    }

    @Override
    public void display(String string) {
        System.out.println("Display string: " + string);
        ThreadUtil.sleepRandom();
    }

}

```


- DisplayClientThread.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

import com.github.houbb.thread.learn.easy.learn.ThreadUtil;

public class DisplayClientThread extends Thread {

    private final ActiveObject activeObject;

    public DisplayClientThread(String name, ActiveObject activeObject) {
        super(name);
        this.activeObject = activeObject;
    }

    @Override
    public void run() {
        int i = 0;
        while(true) {
            i++;
            String string = Thread.currentThread().getName()+" - "+i;
            activeObject.display(string);
            ThreadUtil.sleep(20);
        }
    }

}

```


## 测试

- Main.java

```java
package com.github.houbb.thread.learn.easy.learn.activeObject;

public class Main {

    public static void main(String[] args) {
        ActiveObject activeObject = ActiveObjectFactory.createActiveObject();
        new MakerClientThread("AAAA", activeObject).start();
        new MakerClientThread("BBBB", activeObject).start();
        new DisplayClientThread("CCCC", activeObject).start();
    }

}

```

- 测试结果

```
AAAA: A
BBBB: B
Display string: CCCC - 1
Display string: CCCC - 2
Display string: CCCC - 3
AAAA: AA
Display string: CCCC - 4
Display string: CCCC - 5
Display string: CCCC - 6
BBBB: BB
Display string: CCCC - 7
Display string: CCCC - 8
Display string: CCCC - 9
```

# 实现方式

# UML & Code

## UML

![Active Object](https://img-blog.csdn.net/20180426202009445?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3J5bzEwNjA3MzI0OTY=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## Code

代码地址

> [Active Object](https://github.com/houbb/thread-learn/tree/master/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn//Users/houbinbin/IT/OTHER/thread-learn/easy-learn/src/main/java/com/github/houbb/thread/learn/easy/learn/activeObject)

# 系列导航

> [多线程系列导航](http://blog.csdn.net/ryo1060732496/article/details/79376415)

* any list
{:toc}