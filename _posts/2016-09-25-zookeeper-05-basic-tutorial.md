---
layout: post
title: ZooKeeper-05-基本使用例子
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# 介绍

在本教程中，我们展示了使用ZooKeeper的屏障和生产者－消费者队列的简单实现。 

我们将各自的类称为Barrier和Queue。

这些示例假定您有至少一台ZooKeeper服务器正在运行。

这两个原语都使用以下通用代码摘录：

```java
static ZooKeeper zk = null;
static Integer mutex;

String root;

SyncPrimitive(String address) {
    if(zk == null){
        try {
            System.out.println("Starting ZK:");
            zk = new ZooKeeper(address, 3000, this);
            mutex = new Integer(-1);
            System.out.println("Finished starting ZK: " + zk);
        } catch (IOException e) {
            System.out.println(e.toString());
            zk = null;
        }
    }
}

synchronized public void process(WatchedEvent event) {
    synchronized (mutex) {
        mutex.notify();
    }
}
```

这两个类都扩展了SyncPrimitive。这样，我们将执行SyncPrimitive构造函数中所有原语通用的步骤。

为了使示例简单，我们在首次实例化障碍对象或队列对象时创建了ZooKeeper对象，并声明了一个静态变量作为对该对象的引用。 

Barrier和Queue的后续实例将检查ZooKeeper对象是否存在。另外，我们可以让应用程序创建一个ZooKeeper对象，并将其传递给Barrier和Queue的构造函数。

我们使用process（）方法来处理由于监视而触发的通知。

在下面的讨论中，我们介绍设置手表的代码。监视是一种内部结构，可让ZooKeeper通知客户端对节点的更改。

例如，如果一个客户端正在等待其他客户端离开障碍，则它可以设置监视并等待对特定节点的修改，这可以表明这是等待的结束。

一旦我们仔细研究了这些例子，这一点就很清楚了。

# Barriers（屏障）

是使一组进程能够同步计算开始和结束的原语。此实现的总体思想是拥有一个屏障节点，该屏障节点的目的是成为各个过程节点的父级。

假设我们将障碍节点称为“/b1”。

然后，每个进程“p”创建一个节点“/b1/p”。一旦足够的进程创建了它们相应的节点，加入的进程就可以开始计算。

在此示例中，每个进程实例化一个Barrier对象，并且其构造函数采用以下参数：

- ZooKeeper服务器的地址（例如，“zoo1.foo.com:2181”）

- ZooKeeper上的障碍节点的路径（例如“/b1”）

- 流程组的大小

Barrier的构造函数将Zookeeper服务器的地址传递给父类的构造函数。

如果不存在，则父类创建一个ZooKeeper实例。

然后，屏障的构造函数在ZooKeeper上创建一个屏障节点，该屏障节点是所有流程节点的父节点，我们将其称为root（注意：这不是ZooKeeper的根“/”）。

```java
/**
 * Barrier constructor
 *
 * @param address
 * @param root
 * @param size
 */
Barrier(String address, String root, int size) {
    super(address);
    this.root = root;
    this.size = size;
    // Create barrier node
    if (zk != null) {
        try {
            Stat s = zk.exists(root, false);
            if (s == null) {
                zk.create(root, new byte[0], Ids.OPEN_ACL_UNSAFE,
                        CreateMode.PERSISTENT);
            }
        } catch (KeeperException e) {
            System.out
                    .println("Keeper exception when instantiating queue: "
                            + e.toString());
        } catch (InterruptedException e) {
            System.out.println("Interrupted exception");
        }
    }

    // My node name
    try {
        name = new String(InetAddress.getLocalHost().getCanonicalHostName().toString());
    } catch (UnknownHostException e) {
        System.out.println(e.toString());
    }
}
```

要进入障碍，一个过程调用enter（）。 

该过程使用其主机名形成节点名称，从而在根目录下创建一个节点来表示该节点。 

然后，它等待直到足够多的进程进入障碍为止。 

进程通过使用“ getChildren（）”检查根节点具有的子代数来完成此操作，并在通知不足时等待通知。 

为了在根节点发生更改时接收通知，进程必须设置一个监视，并通过调用“ getChildren（）”来进行监视。 

在代码中，我们有“ getChildren（）”有两个参数。 

第一个声明要读取的节点，第二个声明布尔标志，使进程可以设置监视。 

在代码中标记为true。

```java
/**
 * Join barrier
 *
 * @return
 * @throws KeeperException
 * @throws InterruptedException
 */
boolean enter() throws KeeperException, InterruptedException{
    zk.create(root + "/" + name, new byte[0], Ids.OPEN_ACL_UNSAFE,
            CreateMode.EPHEMERAL_SEQUENTIAL);
    while (true) {
        synchronized (mutex) {
            List<String> list = zk.getChildren(root, true);

            if (list.size() < size) {
                mutex.wait();
            } else {
                return true;
            }
        }
    }
}
```

请注意，enter（）同时抛出KeeperException和InterruptedException，因此应用程序有责任捕获和处理此类异常。

一旦计算完成，进程将调用leave（）离开障碍。 

首先，它删除其对应的节点，然后获取根节点的子节点。 

如果至少有一个孩子，则它等待通知（注意：注意，对getChildren（）的调用的第二个参数为true，这意味着ZooKeeper必须在根节点上设置监视）。 

收到通知后，它将再次检查根节点是否有任何子节点。

```java
/**
 * Wait until all reach barrier
 *
 * @return
 * @throws KeeperException
 * @throws InterruptedException
 */
boolean leave() throws KeeperException, InterruptedException {
    zk.delete(root + "/" + name, 0);
    while (true) {
        synchronized (mutex) {
            List<String> list = zk.getChildren(root, true);
                if (list.size() > 0) {
                    mutex.wait();
                } else {
                    return true;
                }
            }
        }
    }
}
```

# 生产者-消费者队列

生产者－消费者队列是一种分布式的数据结构，进程组用于生成和消费项目。 

生产者流程创建新元素并将其添加到队列中。 

使用者流程从列表中删除元素，然后进行处理。 

在此实现中，元素是简单的整数。 

队列由根节点表示，并且要向队列中添加元素，生产者进程将创建一个新节点，即根节点的子节点。

以下代码摘录对应于对象的构造函数。 

与屏障对象一样，它首先调用父类SyncPrimitive的构造函数，该类将创建ZooKeeper对象（如果不存在）。 

然后，它验证队列的根节点是否存在，并创建是否存在。

```java
/**
 * Constructor of producer-consumer queue
 *
 * @param address
 * @param name
 */
Queue(String address, String name) {
    super(address);
    this.root = name;
    // Create ZK node name
    if (zk != null) {
        try {
            Stat s = zk.exists(root, false);
            if (s == null) {
                zk.create(root, new byte[0], Ids.OPEN_ACL_UNSAFE,
                        CreateMode.PERSISTENT);
            }
        } catch (KeeperException e) {
            System.out
                    .println("Keeper exception when instantiating queue: "
                            + e.toString());
        } catch (InterruptedException e) {
            System.out.println("Interrupted exception");
        }
    }
}
```

生产者进程调用“produce（）”以将元素添加到队列中，并传递一个整数作为参数。 

要将元素添加到队列，该方法使用“ create（）”创建一个新节点，并使用SEQUENCE标志指示ZooKeeper附加与根节点关联的定序器计数器的值。 

这样，我们对队列的元素施加了总顺序，从而保证了队列中最早的元素是消耗的下一个元素。

```java
/**
 * Add element to the queue.
 *
 * @param i
 * @return
 */
boolean produce(int i) throws KeeperException, InterruptedException{
    ByteBuffer b = ByteBuffer.allocate(4);
    byte[] value;

    // Add child with value i
    b.putInt(i);
    value = b.array();
    zk.create(root + "/element", value, Ids.OPEN_ACL_UNSAFE,
                CreateMode.PERSISTENT_SEQUENTIAL);

    return true;
}
```

为了使用元素，消费者进程获取根节点的子节点，读取计数器值最小的节点，然后返回该元素。

请注意，如果存在冲突，则两个竞争过程之一将无法删除该节点，并且delete操作将引发异常。

调用getChildren（）将按字典顺序返回子级列表。 

由于字典顺序不一定遵循计数器值的数字顺序，因此我们需要确定哪个元素最小。

为了确定哪个计数器值最小，我们遍历列表，并从每个列表中删除前缀“element”。

```java
/**
 * Remove first element from the queue.
 *
 * @return
 * @throws KeeperException
 * @throws InterruptedException
 */
int consume() throws KeeperException, InterruptedException{
    int retvalue = -1;
    Stat stat = null;

    // Get the first element available
    while (true) {
        synchronized (mutex) {
            List<String> list = zk.getChildren(root, true);
            if (list.size() == 0) {
                System.out.println("Going to wait");
                mutex.wait();
            } else {
                Integer min = new Integer(list.get(0).substring(7));
                for(String s : list){
                    Integer tempValue = new Integer(s.substring(7));
                    //System.out.println("Temporary value: " + tempValue);
                    if(tempValue < min) min = tempValue;
                }
                System.out.println("Temporary value: " + root + "/element" + min);
                byte[] b = zk.getData(root + "/element" + min,
                            false, stat);
                zk.delete(root + "/element" + min, 0);
                ByteBuffer buffer = ByteBuffer.wrap(b);
                retvalue = buffer.getInt();

                return retvalue;
                }
            }
        }
    }
}
```

# 完整的例子

在以下部分中，您可以找到一个完整的命令行应用程序来演示上述食谱。 

使用以下命令运行它。

```
ZOOBINDIR="[path_to_distro]/bin"
. "$ZOOBINDIR"/zkEnv.sh
java SyncPrimitive [Test Type] [ZK server] [No of elements] [Client type]
```

## Queue test

开始生成 100 个元素

```
java SyncPrimitive qTest localhost 100 p
```

开始消费 100 个元素

```
java SyncPrimitive qTest localhost 100 c
```

## 屏障测试

与2名参与者共同发起障碍（您要加入的参与者的次数是您的两倍）

```
java SyncPrimitive bTest localhost 2
```

## 源码

- SyncPrimitive.Java

```java
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.Random;

import org.apache.zookeeper.CreateMode;
import org.apache.zookeeper.KeeperException;
import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;
import org.apache.zookeeper.ZooKeeper;
import org.apache.zookeeper.ZooDefs.Ids;
import org.apache.zookeeper.data.Stat;

public class SyncPrimitive implements Watcher {

    static ZooKeeper zk = null;
    static Integer mutex;
    String root;

    SyncPrimitive(String address) {
        if(zk == null){
            try {
                System.out.println("Starting ZK:");
                zk = new ZooKeeper(address, 3000, this);
                mutex = new Integer(-1);
                System.out.println("Finished starting ZK: " + zk);
            } catch (IOException e) {
                System.out.println(e.toString());
                zk = null;
            }
        }
        //else mutex = new Integer(-1);
    }

    synchronized public void process(WatchedEvent event) {
        synchronized (mutex) {
            //System.out.println("Process: " + event.getType());
            mutex.notify();
        }
    }

    /**
     * Barrier
     */
    static public class Barrier extends SyncPrimitive {
        int size;
        String name;

        /**
         * Barrier constructor
         *
         * @param address
         * @param root
         * @param size
         */
        Barrier(String address, String root, int size) {
            super(address);
            this.root = root;
            this.size = size;

            // Create barrier node
            if (zk != null) {
                try {
                    Stat s = zk.exists(root, false);
                    if (s == null) {
                        zk.create(root, new byte[0], Ids.OPEN_ACL_UNSAFE,
                                CreateMode.PERSISTENT);
                    }
                } catch (KeeperException e) {
                    System.out
                            .println("Keeper exception when instantiating queue: "
                                    + e.toString());
                } catch (InterruptedException e) {
                    System.out.println("Interrupted exception");
                }
            }

            // My node name
            try {
                name = new String(InetAddress.getLocalHost().getCanonicalHostName().toString());
            } catch (UnknownHostException e) {
                System.out.println(e.toString());
            }

        }

        /**
         * Join barrier
         *
         * @return
         * @throws KeeperException
         * @throws InterruptedException
         */

        boolean enter() throws KeeperException, InterruptedException{
            zk.create(root + "/" + name, new byte[0], Ids.OPEN_ACL_UNSAFE,
                    CreateMode.EPHEMERAL_SEQUENTIAL);
            while (true) {
                synchronized (mutex) {
                    List<String> list = zk.getChildren(root, true);

                    if (list.size() < size) {
                        mutex.wait();
                    } else {
                        return true;
                    }
                }
            }
        }

        /**
         * Wait until all reach barrier
         *
         * @return
         * @throws KeeperException
         * @throws InterruptedException
         */
        boolean leave() throws KeeperException, InterruptedException{
            zk.delete(root + "/" + name, 0);
            while (true) {
                synchronized (mutex) {
                    List<String> list = zk.getChildren(root, true);
                        if (list.size() > 0) {
                            mutex.wait();
                        } else {
                            return true;
                        }
                    }
                }
            }
        }

    /**
     * Producer-Consumer queue
     */
    static public class Queue extends SyncPrimitive {

        /**
         * Constructor of producer-consumer queue
         *
         * @param address
         * @param name
         */
        Queue(String address, String name) {
            super(address);
            this.root = name;
            // Create ZK node name
            if (zk != null) {
                try {
                    Stat s = zk.exists(root, false);
                    if (s == null) {
                        zk.create(root, new byte[0], Ids.OPEN_ACL_UNSAFE,
                                CreateMode.PERSISTENT);
                    }
                } catch (KeeperException e) {
                    System.out
                            .println("Keeper exception when instantiating queue: "
                                    + e.toString());
                } catch (InterruptedException e) {
                    System.out.println("Interrupted exception");
                }
            }
        }

        /**
         * Add element to the queue.
         *
         * @param i
         * @return
         */

        boolean produce(int i) throws KeeperException, InterruptedException{
            ByteBuffer b = ByteBuffer.allocate(4);
            byte[] value;

            // Add child with value i
            b.putInt(i);
            value = b.array();
            zk.create(root + "/element", value, Ids.OPEN_ACL_UNSAFE,
                        CreateMode.PERSISTENT_SEQUENTIAL);

            return true;
        }

        /**
         * Remove first element from the queue.
         *
         * @return
         * @throws KeeperException
         * @throws InterruptedException
         */
        int consume() throws KeeperException, InterruptedException{
            int retvalue = -1;
            Stat stat = null;

            // Get the first element available
            while (true) {
                synchronized (mutex) {
                    List<String> list = zk.getChildren(root, true);
                    if (list.size() == 0) {
                        System.out.println("Going to wait");
                        mutex.wait();
                    } else {
                        Integer min = new Integer(list.get(0).substring(7));
                        String minNode = list.get(0);
                        for(String s : list){
                            Integer tempValue = new Integer(s.substring(7));
                            //System.out.println("Temporary value: " + tempValue);
                            if(tempValue < min) {
                                min = tempValue;
                                minNode = s;
                            }
                        }
                        System.out.println("Temporary value: " + root + "/" + minNode);
                        byte[] b = zk.getData(root + "/" + minNode,
                        false, stat);
                        zk.delete(root + "/" + minNode, 0);
                        ByteBuffer buffer = ByteBuffer.wrap(b);
                        retvalue = buffer.getInt();

                        return retvalue;
                    }
                }
            }
        }
    }

    public static void main(String args[]) {
        if (args[0].equals("qTest"))
            queueTest(args);
        else
            barrierTest(args);
    }

    public static void queueTest(String args[]) {
        Queue q = new Queue(args[1], "/app1");

        System.out.println("Input: " + args[1]);
        int i;
        Integer max = new Integer(args[2]);

        if (args[3].equals("p")) {
            System.out.println("Producer");
            for (i = 0; i < max; i++)
                try{
                    q.produce(10 + i);
                } catch (KeeperException e){

                } catch (InterruptedException e){

                }
        } else {
            System.out.println("Consumer");

            for (i = 0; i < max; i++) {
                try{
                    int r = q.consume();
                    System.out.println("Item: " + r);
                } catch (KeeperException e){
                    i--;
                } catch (InterruptedException e){
                }
            }
        }
    }

    public static void barrierTest(String args[]) {
        Barrier b = new Barrier(args[1], "/b1", new Integer(args[2]));
        try{
            boolean flag = b.enter();
            System.out.println("Entered barrier: " + args[2]);
            if(!flag) System.out.println("Error when entering the barrier");
        } catch (KeeperException e){
        } catch (InterruptedException e){
        }

        // Generate random integer
        Random rand = new Random();
        int r = rand.nextInt(100);
        // Loop for rand iterations
        for (int i = 0; i < r; i++) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
            }
        }
        try{
            b.leave();
        } catch (KeeperException e){

        } catch (InterruptedException e){

        }
        System.out.println("Left barrier");
    }
}
```

# 参考资料

https://zookeeper.apache.org/doc/r3.6.2/zookeeperTutorial.html

* any list
{:toc}