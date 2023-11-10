---
layout: post
title: ZooKeeper-04-java 例子
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# 一个简单的监视客户端

为了向您介绍ZooKeeper Java API，我们在这里开发了一个非常简单的监视客户端。 

该ZooKeeper客户端监视znode的更改并通过启动或停止程序来响应。


## 要求

客户有四个要求：

它作为参数：

ZooKeeper服务的地址

znode的名称-要监视的znode的名称

将输出写入的文件名

带有参数的可执行文件。

它获取与znode关联的数据并启动可执行文件。

如果znode更改，则客户端将重新获取内容并重新启动可执行文件。

如果znode消失，则客户端将杀死可执行文件。

# 程序设计

按照惯例，ZooKeeper应用程序分为两个单元，一个单元维护连接，另一个单元监视数据。 

在此应用程序中，名为Executor的类维护ZooKeeper连接，而名为DataMonitor的类监视ZooKeeper树中的数据。

另外，执行程序包含主线程并包含执行逻辑。 

它负责根据znode的状态，与用户进行的交互很少，以及与您作为参数传入的可执行程序之间的交互，以及示例（根据要求）关闭并重新启动的示例。


## maven 依赖

我们这里使用的是 zk 3.6.2，所以引入对应的 zk 依赖：

```xml
<dependency>
    <groupId>org.apache.zookeeper</groupId>
    <artifactId>zookeeper</artifactId>
    <version>3.6.2</version>
</dependency>
```

# 执行者类

Executor对象是示例应用程序的主要容器。 

如程序设计中所述，它同时包含ZooKeeper对象DataMonitor。


## 源码

```java
// from the Executor class...

public static void main(String[] args) {
    if (args.length < 4) {
        System.err
                .println("USAGE: Executor hostPort znode filename program [args ...]");
        System.exit(2);
    }
    String hostPort = args[0];
    String znode = args[1];
    String filename = args[2];
    String exec[] = new String[args.length - 3];
    System.arraycopy(args, 3, exec, 0, exec.length);
    try {
        new Executor(hostPort, znode, filename, exec).run();
    } catch (Exception e) {
        e.printStackTrace();
    }
}

public Executor(String hostPort, String znode, String filename,
        String exec[]) throws KeeperException, IOException {
    this.filename = filename;
    this.exec = exec;
    zk = new ZooKeeper(hostPort, 3000, this);
    dm = new DataMonitor(zk, znode, null, this);
}

public void run() {
    try {
        synchronized (this) {
            while (!dm.dead) {
                wait();
            }
        }
    } catch (InterruptedException e) {
    }
}
```

回忆执行器的工作是启动和停止您在命令行中输入名称的可执行文件。 

这样做是为了响应ZooKeeper对象触发的事件。 

如您在上面的代码中看到的，执行器将对自身的引用作为ZooKeeper构造函数中的Watcher参数传递。 

它还将对自身的引用作为DataMonitorListener参数传递给DataMonitor构造函数。 

根据执行者的定义，它实现以下两个接口：

```java
public class Executor implements Watcher, Runnable, DataMonitor.DataMonitorListener {
...
```

Watcher接口由ZooKeeper Java API定义。 

ZooKeeper使用它来通讯回其容器。

它仅支持一种方法process（），而ZooKeeper使用它来传达主线程可能感兴趣的通用事件，例如ZooKeeper连接的状态或ZooKeeper会话。 

在此示例中，执行程序仅将这些事件转发给DataMonitor，以决定如何处理它们。 

这样做只是为了说明这一点，按照惯例，Executor或某些类似于Executor的对象“拥有” ZooKeeper连接，但是可以将事件委托给其他事件给其他对象。 

它还将其用作触发监视事件的默认通道。

```java
public void process(WatchedEvent event) {
    dm.process(event);
}
```

另一方面，DataMonitorListener 接口不是ZooKeeper API的一部分。 

这是一个完全自定义的界面，专门为此示例应用程序设计。 

DataMonitor 对象使用它来通讯回其容器，该容器也是Executor对象。 

DataMonitorListener 接口如下所示：

```java
public interface DataMonitorListener {
    /**
    * The existence status of the node has changed.
    */
    void exists(byte data[]);

    /**
    * The ZooKeeper session is no longer valid.
    *
    * @param rc
    * the ZooKeeper reason code
    */
    void closing(int rc);
}
```

此接口在DataMonitor类中定义，并在Executor类中实现。 

调用Executor.exists（）时，Executor将根据要求决定是启动还是关闭。 

回想一下，当znode不再存在时，要求说杀死可执行文件。

调用Executor.closing（）时，Executor决定是否响应ZooKeeper连接永久消失而自行关闭。

您可能已经猜到了，DataMonitor是调用这些方法的对象，以响应ZooKeeper状态的变化。

这是Executor的DataMonitorListener.exists（）和DataMonitorListener.closing的实现：

```java
public void exists( byte[] data ) {
    if (data == null) {
        if (child != null) {
            System.out.println("Killing process");
            child.destroy();
            try {
                child.waitFor();
            } catch (InterruptedException e) {
           }
        }
        child = null;
    } else {
        if (child != null) {
            System.out.println("Stopping child");
            child.destroy();
            try {
               child.waitFor();
            } catch (InterruptedException e) {
            e.printStackTrace();
            }
        }
        try {
            FileOutputStream fos = new FileOutputStream(filename);
            fos.write(data);
            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            System.out.println("Starting child");
            child = Runtime.getRuntime().exec(exec);
            new StreamWriter(child.getInputStream(), System.out);
            new StreamWriter(child.getErrorStream(), System.err);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

public void closing(int rc) {
    synchronized (this) {
        notifyAll();
    }
}
```

# DataMonitor类

DataMonitor类具有ZooKeeper逻辑的内容。 

它主要是异步的和事件驱动的。 

DataMonitor通过以下方式在构造函数中启动：

```java
public DataMonitor(ZooKeeper zk, String znode, Watcher chainedWatcher,
        DataMonitorListener listener) {
    this.zk = zk;
    this.znode = znode;
    this.chainedWatcher = chainedWatcher;
    this.listener = listener;

    // Get things started by checking if the node exists. We are going
    // to be completely event driven
```

对ZooKeeper.exists（）的调用检查znode是否存在，设置监视器，并将对自身的引用（this）传递为完成回调对象。从这个意义上说，它开始了，因为真正的处理过程是在触发监视器时发生的。

- 笔记

不要将完成回调与监视回调混淆。当在服务器上完成监视操作（由ZooKeeper.exists（）完成）的异步设置时，将调用ZooKeeper.exists（）完成回调，该回调恰好是在DataMonitor对象中实现的StatCallback.processResult（）方法。

另一方面，监视器的触发将事件发送到Executor对象，因为Executor已注册为ZooKeeper对象的Watcher。

顺便说一句，您可能会注意到，DataMonitor也可以将自己注册为该特定监视事件的监视者。这是ZooKeeper 3.0.0（多个监视程序的支持）的新增功能。但是，在此示例中，DataMonitor不会注册为观察者。

当ZooKeeper.exists（）操作在服务器上完成时，ZooKeeper API在客户端上调用以下完成回调：

```java
public void processResult(int rc, String path, Object ctx, Stat stat) {
    boolean exists;
    switch (rc) {
    case Code.Ok:
        exists = true;
        break;
    case Code.NoNode:
        exists = false;
        break;
    case Code.SessionExpired:
    case Code.NoAuth:
        dead = true;
        listener.closing(rc);
        return;
    default:
        // Retry errors
        zk.exists(znode, true, this, null);
        return;
    }

    byte b[] = null;
    if (exists) {
        try {
            b = zk.getData(znode, false, null);
        } catch (KeeperException e) {
            // We don't need to worry about recovering now. The watch
            // callbacks will kick off any exception handling
            e.printStackTrace();
        } catch (InterruptedException e) {
            return;
        }
    }     
    if ((b == null && b != prevData)
        || (b != null && !Arrays.equals(prevData, b))) {
        listener.exists(b);</emphasis>
        prevData = b;
    }
}
```

该代码首先检查错误代码中是否存在znode，致命错误和可恢复错误。 

如果文件（或znode）存在，它将从znode获取数据，然后在状态更改后调用Executor的exist（）回调。 

请注意，它不必对getData调用进行任何异常处理，因为它可以监视任何可能导致错误的事件：如果节点在调用ZooKeeper.getData（）之前被删除，则是设置的监视事件 ZooKeeper.exists() 触发回调； 如果出现通信错误，则在恢复连接时将触发连接监视事件。

最后，请注意DataMonitor如何处理监视事件：

```java
public void process(WatchedEvent event) {
    String path = event.getPath();
    if (event.getType() == Event.EventType.None) {
        // We are are being told that the state of the
        // connection has changed
        switch (event.getState()) {
        case SyncConnected:
            // In this particular example we don't need to do anything
            // here - watches are automatically re-registered with
            // server and any watches triggered while the client was
            // disconnected will be delivered (in order of course)
            break;
        case Expired:
            // It's all over
            dead = true;
            listener.closing(KeeperException.Code.SessionExpired);
            break;
        }
    } else {
        if (path != null && path.equals(znode)) {
            // Something has changed on the node, let's find out
            zk.exists(znode, true, this, null);
        }
    }
    if (chainedWatcher != null) {
        chainedWatcher.process(event);
    }
}
```

如果客户端ZooKeeper库可以在会话期满（Expired事件）之前重新建立与ZooKeeper的通信通道（SyncConnected事件），则将使用服务器自动重建所有会话的监视器（监视器的自动重置是新的 ZooKeeper 3.0.0）。 

有关更多信息，请参见程序员指南中的ZooKeeper监视器。 

在此函数中，当DataMonitor获得znode事件时，它会调用ZooKeeper.exists（）来查找发生了什么更改。

# 完整的代码

## Executor.java

```java
/**
 * A simple example program to use DataMonitor to start and
 * stop executables based on a znode. The program watches the
 * specified znode and saves the data that corresponds to the
 * znode in the filesystem. It also starts the specified program
 * with the specified arguments when the znode exists and kills
 * the program if the znode goes away.
 */
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.apache.zookeeper.KeeperException;
import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;
import org.apache.zookeeper.ZooKeeper;

public class Executor
    implements Watcher, Runnable, DataMonitor.DataMonitorListener
{
    String znode;
    DataMonitor dm;
    ZooKeeper zk;
    String filename;
    String exec[];
    Process child;

    public Executor(String hostPort, String znode, String filename,
            String exec[]) throws KeeperException, IOException {
        this.filename = filename;
        this.exec = exec;
        zk = new ZooKeeper(hostPort, 3000, this);
        dm = new DataMonitor(zk, znode, null, this);
    }

    /**
     * @param args
     */
    public static void main(String[] args) {
        if (args.length < 4) {
            System.err
                    .println("USAGE: Executor hostPort znode filename program [args ...]");
            System.exit(2);
        }
        String hostPort = args[0];
        String znode = args[1];
        String filename = args[2];
        String exec[] = new String[args.length - 3];
        System.arraycopy(args, 3, exec, 0, exec.length);
        try {
            new Executor(hostPort, znode, filename, exec).run();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /***************************************************************************
     * We do process any events ourselves, we just need to forward them on.
     *
     * @see org.apache.zookeeper.Watcher#process(org.apache.zookeeper.proto.WatcherEvent)
     */
    public void process(WatchedEvent event) {
        dm.process(event);
    }

    public void run() {
        try {
            synchronized (this) {
                while (!dm.dead) {
                    wait();
                }
            }
        } catch (InterruptedException e) {
        }
    }

    public void closing(int rc) {
        synchronized (this) {
            notifyAll();
        }
    }

    static class StreamWriter extends Thread {
        OutputStream os;

        InputStream is;

        StreamWriter(InputStream is, OutputStream os) {
            this.is = is;
            this.os = os;
            start();
        }

        public void run() {
            byte b[] = new byte[80];
            int rc;
            try {
                while ((rc = is.read(b)) > 0) {
                    os.write(b, 0, rc);
                }
            } catch (IOException e) {
            }

        }
    }

    public void exists(byte[] data) {
        if (data == null) {
            if (child != null) {
                System.out.println("Killing process");
                child.destroy();
                try {
                    child.waitFor();
                } catch (InterruptedException e) {
                }
            }
            child = null;
        } else {
            if (child != null) {
                System.out.println("Stopping child");
                child.destroy();
                try {
                    child.waitFor();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            try {
                FileOutputStream fos = new FileOutputStream(filename);
                fos.write(data);
                fos.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
            try {
                System.out.println("Starting child");
                child = Runtime.getRuntime().exec(exec);
                new StreamWriter(child.getInputStream(), System.out);
                new StreamWriter(child.getErrorStream(), System.err);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

## DataMonitor.java

```java
/**
 * A simple class that monitors the data and existence of a ZooKeeper
 * node. It uses asynchronous ZooKeeper APIs.
 */
import java.util.Arrays;

import org.apache.zookeeper.KeeperException;
import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;
import org.apache.zookeeper.ZooKeeper;
import org.apache.zookeeper.AsyncCallback.StatCallback;
import org.apache.zookeeper.KeeperException.Code;
import org.apache.zookeeper.data.Stat;

public class DataMonitor implements Watcher, StatCallback {

    ZooKeeper zk;
    String znode;
    Watcher chainedWatcher;
    boolean dead;
    DataMonitorListener listener;
    byte prevData[];

    public DataMonitor(ZooKeeper zk, String znode, Watcher chainedWatcher,
            DataMonitorListener listener) {
        this.zk = zk;
        this.znode = znode;
        this.chainedWatcher = chainedWatcher;
        this.listener = listener;
        // Get things started by checking if the node exists. We are going
        // to be completely event driven
        zk.exists(znode, true, this, null);
    }

    /**
     * Other classes use the DataMonitor by implementing this method
     */
    public interface DataMonitorListener {
        /**
         * The existence status of the node has changed.
         */
        void exists(byte data[]);

        /**
         * The ZooKeeper session is no longer valid.
         *
         * @param rc
         *                the ZooKeeper reason code
         */
        void closing(int rc);
    }

    public void process(WatchedEvent event) {
        String path = event.getPath();
        if (event.getType() == Event.EventType.None) {
            // We are are being told that the state of the
            // connection has changed
            switch (event.getState()) {
            case SyncConnected:
                // In this particular example we don't need to do anything
                // here - watches are automatically re-registered with
                // server and any watches triggered while the client was
                // disconnected will be delivered (in order of course)
                break;
            case Expired:
                // It's all over
                dead = true;
                listener.closing(KeeperException.Code.SessionExpired);
                break;
            }
        } else {
            if (path != null && path.equals(znode)) {
                // Something has changed on the node, let's find out
                zk.exists(znode, true, this, null);
            }
        }
        if (chainedWatcher != null) {
            chainedWatcher.process(event);
        }
    }

    public void processResult(int rc, String path, Object ctx, Stat stat) {
        boolean exists;
        switch (rc) {
        case Code.Ok:
            exists = true;
            break;
        case Code.NoNode:
            exists = false;
            break;
        case Code.SessionExpired:
        case Code.NoAuth:
            dead = true;
            listener.closing(rc);
            return;
        default:
            // Retry errors
            zk.exists(znode, true, this, null);
            return;
        }

        byte b[] = null;
        if (exists) {
            try {
                b = zk.getData(znode, false, null);
            } catch (KeeperException e) {
                // We don't need to worry about recovering now. The watch
                // callbacks will kick off any exception handling
                e.printStackTrace();
            } catch (InterruptedException e) {
                return;
            }
        }
        if ((b == null && b != prevData)
                || (b != null && !Arrays.equals(prevData, b))) {
            listener.exists(b);
            prevData = b;
        }
    }
}
```

# 参考资料

https://zookeeper.apache.org/doc/r3.6.2/zookeeperStarted.html

[Java操作Zookeeper Maven](https://blog.csdn.net/humorchen99/article/details/110129352)

[https://mvnrepository.com/artifact/org.apache.zookeeper/zookeeper](https://mvnrepository.com/artifact/org.apache.zookeeper/zookeeper)

* any list
{:toc}