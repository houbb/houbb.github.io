---
layout: post
title: ZooKeeper-19-api 使用
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# ZK 的启动

具体参考 [zk 入门]()

## 启动路径

```
$ pwd
D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin

$ zkServer
```

启动日志如下：

```
2021-03-14 16:15:58,039 [myid:] - INFO  [main:QuorumPeerConfig@174] - Reading configuration from: D:\tools\zookeeper\apache-zookeeper-3.6.2-bin\bin\..\conf\zoo.cfg
2021-03-14 16:15:58,100 [myid:] - INFO  [main:QuorumPeerConfig@460] - clientPortAddress is 0.0.0.0:2181
...
2021-03-14 16:15:58,566 [myid:] - INFO  [main:Log@169] - Logging initialized @939ms to org.eclipse.jetty.util.log.Slf4jLog
...
2021-03-14 16:15:59,215 [myid:] - INFO  [main:RequestThrottler@74] - zookeeper.request_throttler.shutdownTimeout = 10000
2021-03-14 16:15:59,250 [myid:] - INFO  [main:ContainerManager@83] - Using checkIntervalMs=60000 maxPerMinute=10000 maxNeverUsedIntervalMs=0
2021-03-14 16:15:59,253 [myid:] - INFO  [main:ZKAuditProvider@42] - ZooKeeper audit is disabled.
```

# 建⽴ZooKeeper会话

ZooKeeper的API围绕ZooKeeper的句柄（handle）⽽构建，每个API调
⽤都需要传递这个句柄。这个句柄代表与ZooKeeper之间的⼀个会话。在图
3-1中，与ZooKeeper服务器已经建⽴的⼀个会话如果断开，这个会话就会
迁移到另⼀台ZooKeeper服务器上。只要会话还存活着，这个句柄就仍然有
效，ZooKeeper客户端库会持续保持这个活跃连接，以保证与ZooKeeper服
务器之间的会话存活。如果句柄关闭，ZooKeeper客户端库会告知
ZooKeeper服务器终⽌这个会话。如果ZooKeeper发现客户端已经死掉，就
会使这个会话⽆效。如果客户端之后尝试重新连接到ZooKeeper服务器，使
⽤之前⽆效会话对应的那个句柄进⾏连接，那么ZooKeeper服务器会通知客
户端库，这个会话已失效，使⽤这个句柄进⾏的任何操作都会返回错误。

![输入图片说明](https://images.gitee.com/uploads/images/2021/0314/160830_0dd0c9fd_508704.png "屏幕截图.png")

## maven 依赖

首先我们需要引入对应的 maven jar。

```xml
<dependency>
    <groupId>org.apache.zookeeper</groupId>
    <artifactId>zookeeper</artifactId>
    <version>3.6.2</version>
</dependency>
```

## 创建 zk 客户端

```java
ZooKeeper zooKeeper = new ZooKeeper(connectString, sessionTimeout, watcher);
```

只有三个参数，比较简单。

- connectString

包含主机名和ZooKeeper服务器的端⼜。我们之前通过zkCli连接
ZooKeeper服务时，已经列出过这些服务器。

- sessionTimeout

以毫秒为单位，表⽰ZooKeeper等待客户端通信的最长时间，之后会声
明会话已死亡。⽬前我们使⽤15000，即15秒。这就是说如果ZooKeeper与
客户端有15秒的时间⽆法进⾏通信，ZooKeeper就会终⽌客户端的会话。需
要注意，这个值⽐较⾼，但对于我们后续的实验会⾮常有⽤。ZooKeeper会
话⼀般设置超时时间为5~10秒。

- watcher

⽤于接收会话事件的⼀个对象，这个对象需要我们⾃⼰创建。因为
Wacher定义为接⼜，所以我们需要⾃⼰实现⼀个类，然后初始化这个类的
实例并传⼊ZooKeeper的构造函数中。客户端使⽤Watcher接⼜来监控与
ZooKeeper之间会话的健康情况。与ZooKeeper服务器之间建⽴或失去连接时就会产⽣事件。它们同样还能⽤于监控ZooKeeper数据的变化。最终，如
果与ZooKeeper的会话过期，也会通过Watcher接⼜传递事件来通知客户端
的应⽤。

## 自定义 watcher

我们直接实现以下 Watcher 接口。

```java
package com.github.houbb.zk.learn.api;

import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;
import org.apache.zookeeper.ZooKeeper;

import java.io.IOException;

public class MasterWatcher implements Watcher {
    ZooKeeper zk;
    String hostPort;
    MasterWatcher(String hostPort) {
        this.hostPort = hostPort;
    }
    void startZK() throws IOException {
        zk = new ZooKeeper(hostPort, 15000, this);
    }
    public void process(WatchedEvent e) {
        System.out.println(e);
    }

    public static void main(String args[])
            throws Exception {
        MasterWatcher m = new MasterWatcher("127.0.0.1:2181");
        m.startZK();
        // wait for a bit
        Thread.sleep(60000);
    }
}
```

测试日志如下：

```
log4j:WARN No appenders could be found for logger (org.apache.zookeeper.ZooKeeper).
log4j:WARN Please initialize the log4j system properly.
log4j:WARN See http://logging.apache.org/log4j/1.2/faq.html#noconfig for more info.
WatchedEvent state:SyncConnected type:None path:null
```

## 日志的配置

这里可以发现，我们的日志没有配置好，所以很多日志信息看不到。

看了一下 zk 使用的是 slf4j，所以我们这里使用自己喜欢的日志框架即可。

这里，我选择的是 slf4j+logback，记录如下：

```xml
<properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
    <logback.version>1.1.7</logback.version>
    <slf4j.version>1.7.21</slf4j.version>
</properties>
<dependencies>
    <dependency>
        <groupId>org.apache.zookeeper</groupId>
        <artifactId>zookeeper</artifactId>
        <version>3.6.2</version>
        <exclusions>
            <exclusion>
                <groupId>log4j</groupId>
                <artifactId>log4j</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-log4j12</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>${slf4j.version}</version>
        <scope>compile</scope>
    </dependency>
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-core</artifactId>
        <version>${logback.version}</version>
    </dependency>
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>${logback.version}</version>
    </dependency>
</dependencies>
```

zookeeper 会默认引入 log4j 和 slf4j-log4j12，这会导致我们无法记载到我们想要的 logback 配置，所以进行排除。

- logback.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</Pattern>
        </layout>
    </appender>

    <logger name="com.github.houbb.zk.learn" level="DEBUG"/>

    <root level="INFO">
        <appender-ref ref="STDOUT" />
    </root>

</configuration>
```

## 启动日志

我们重新请求：

```
17:11:14,231 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Could NOT find resource [logback.groovy]
17:11:14,232 |-INFO in ch.qos.logback.classic.LoggerContext[default] - Could NOT find resource [logback-test.xml]
...

...
...

17:11:14.615 [main] INFO  org.apache.zookeeper.ZooKeeper - Initiating client connection, connectString=127.0.0.1:2181 sessionTimeout=15000 watcher=com.github.houbb.zk.learn.api.MasterWatcher@61443d8f
17:11:14.632 [main] INFO  org.apache.zookeeper.common.X509Util - Setting -D jdk.tls.rejectClientInitiatedRenegotiation=true to disable client-initiated TLS renegotiation
17:11:14.985 [main] INFO  o.apache.zookeeper.ClientCnxnSocket - jute.maxbuffer value is 1048575 Bytes
17:11:14.999 [main] INFO  org.apache.zookeeper.ClientCnxn - zookeeper.request.timeout value is 0. feature enabled=false
17:11:15.011 [main-SendThread(127.0.0.1:2181)] INFO  org.apache.zookeeper.ClientCnxn - Opening socket connection to server ieonline.microsoft.com/127.0.0.1:2181.
17:11:15.011 [main-SendThread(127.0.0.1:2181)] INFO  org.apache.zookeeper.ClientCnxn - SASL config status: Will not attempt to authenticate using SASL (unknown error)
17:11:15.013 [main-SendThread(127.0.0.1:2181)] INFO  org.apache.zookeeper.ClientCnxn - Socket connection established, initiating session, client: /127.0.0.1:52530, server: ieonline.microsoft.com/127.0.0.1:2181
17:11:15.027 [main-SendThread(127.0.0.1:2181)] INFO  org.apache.zookeeper.ClientCnxn - Session establishment complete on server ieonline.microsoft.com/127.0.0.1:2181, session id = 0x1000015b7390004, negotiated timeout = 15000
WatchedEvent state:SyncConnected type:None path:null
```

可以看到详细的启动日志信息。

## 应用的关闭

当Master结束时，最好的⽅式是使会话⽴即消失。这可以通过
ZooKeeper.close（）⽅法来结束。⼀旦调⽤close⽅法后，ZooKeeper对象实
例所表⽰的会话就会被销毁。

我们调整一下 main 方法：

```java
void stopZK() throws InterruptedException {
    zk.close();
}

public static void main(String args[])
        throws Exception {
    MasterWatcher m = new MasterWatcher("127.0.0.1:2181");
    m.startZK();
    // wait for a bit
    Thread.sleep(10000);
    // close
    m.stopZK();
}
```

关闭的日志如下：

```
17:18:41.135 [main-SendThread(127.0.0.1:2181)] WARN  org.apache.zookeeper.ClientCnxn - An exception was thrown while closing send thread for session 0x1000015b7390008.
org.apache.zookeeper.ClientCnxn$EndOfStreamException: Unable to read additional data from server sessionid 0x1000015b7390008, likely server has closed socket
	at org.apache.zookeeper.ClientCnxnSocketNIO.doIO(ClientCnxnSocketNIO.java:77)
	at org.apache.zookeeper.ClientCnxnSocketNIO.doTransport(ClientCnxnSocketNIO.java:350)
	at org.apache.zookeeper.ClientCnxn$SendThread.run(ClientCnxn.java:1275)
WatchedEvent state:Closed type:None path:null
17:18:41.241 [main] INFO  org.apache.zookeeper.ZooKeeper - Session: 0x1000015b7390008 closed
17:18:41.241 [main-EventThread] INFO  org.apache.zookeeper.ClientCnxn - EventThread shut down for session: 0x1000015b7390008
```


# 获取管理权

现在我们有了会话，我们的Master程序需要获得管理权，虽然现在我
们只有⼀个主节点，但我们还是要⼩⼼仔细。我们需要运⾏多个进程，以
便在活动主节点发⽣故障后，可以有进程接替主节点。
为了确保同⼀时间只有⼀个主节点进程出于活动状态，我们使⽤
ZooKeeper来实现简单的群⾸选举算法（在2.4.1节中所描述的）。这个算法
中，所有潜在的主节点进程尝试创建/master节点，但只有⼀个成功，这个
成功的进程成为主节点。
常量ZooDefs.Ids.OPEN_ACL_UNSAFE为所有⼈提供了所有权限（正
如其名所显⽰的，这个ACL策略在不可信的环境下使⽤是⾮常不安全
的）。
ZooKeeper通过插件式的认证⽅法提供了每个节点的ACL策略功能，因
此，如果我们需要，就可以限制某个⽤户对某个znode节点的哪些权限，但
对于这个简单的例⼦，我们继续使⽤OPEN_ACL_UNSAFE策略。当然，我
们希望在主节点死掉后/master节点会消失。正如我们在2.1.2节中所提到的
持久性和临时性znode节点，我们可以使⽤ZooKeeper的临时性znode节点来
达到我们的⽬的。我们将定义⼀个EPHEMERAL的znode节点，当创建它的
会话关闭或⽆效时，ZooKeeper会⾃动检测到，并删除这个节点。

## 添加实现

```java
void runForMaster() throws KeeperException, InterruptedException {
    Random random = ThreadLocalRandom.current();
    // 唯一标识
    String serverId = Integer.toHexString(random.nextInt());
    zk.create("/master",
            serverId.getBytes(),
            ZooDefs.Ids.OPEN_ACL_UNSAFE,
            CreateMode.EPHEMERAL);
}
```

然⽽，我们这样做还不够，create⽅法会抛出两种异常：
KeeperException和InterruptedException。我们需要确保我们处理了这两种异
常，特别是ConnectionLossException（KeeperException异常的⼦类）和
InterruptedException。对于其他异常，我们可以忽略并继续执⾏，但对于这
两种异常，create⽅法可能已经成功了，所以如果我们作为主节点就需要捕
获并处理它们。

ConnectionLossException异常发⽣于客户端与ZooKeeper服务端失去连接时。⼀般常常由于⽹络原因导致，如⽹络分区或ZooKeeper服务器故障。
当这个异常发⽣时，客户端并不知道是在ZooKeeper服务器处理前丢失了请
求消息，还是在处理后客户端未收到响应消息。如我们之前所描述的，
ZooKeeper的客户端库将会为后续请求重新建⽴连接，但进程必须知道⼀个
未决请求是否已经处理了还是需要再次发送请求。
InterruptedException异常源于客户端线程调⽤了Thread.interrupt，通常
这是因为应⽤程序部分关闭，但还在被其他相关应⽤的⽅法使⽤。从字⾯
来看这个异常，进程会中断本地客户端的请求处理的过程，并使该请求处
于未知状态。
这两种请求都会导致正常请求处理过程的中断，开发者不能假设处理
过程中的请求的状态。当我们处理这些异常时，开发者在处理前必须知道
系统的状态。如果发⽣群⾸选举，在我们没有确认情况之前，我们不希望
确定主节点。如果create执⾏成功了，活动主节点死掉以前，没有任何进程
能够成为主节点，如果活动主节点还不知道⾃⼰已经获得了管理权，不会
有任何进程成为主节点进程。
当处理ConnectionLossException异常时，我们需要找出那个进程创建
的/master节点，如果进程是⾃⼰，就开始成为群⾸⾓⾊。

我们通过getData
⽅法来处理：

```java
byte[] getData(
String path,
bool watch,
Stat stat)
```

- path

类似其他ZooKeeper⽅法⼀样，第⼀个参数为我们想要获取数据的
znode节点路径。

- watch

表⽰我们是否想要监听后续的数据变更。如果设置为true，我们就可
以通过我们创建ZooKeeper句柄时所设置的Watcher对象得到事件，同时另
⼀个版本的⽅法提供了以Watcher对象为⼊参，通过这个传⼊的对象来接收
变更的事件。我们在后续章节再讨论如何监视变更情况，现在我们设置这
个参数为false，因为我们现在我们只想知道当前的数据是什么。

- stat

最后⼀个参数类型Stat结构，getData⽅法会填充znode节点的元数据信
息。

- 返回值

⽅法返回成功（没有抛出异常），就会得到znode节点数据的字节数
组。

让我们按以下代码段来修改代码，在runForMaster⽅法中引⼊异常处
理：

```java
// 生成唯一标识
String serverId = Integer.toString(ThreadLocalRandom.current().nextInt());
boolean isLeader = false;
// returns true if there is a master
boolean checkMaster() {
    while (true) {
        try {
            Stat stat = new Stat();
            // 获取 master 节点信息，来确认 master 节点。
            byte[] data = zk.getData("/master", false, stat);
            // 如果和当前的标识一致，则说明当前对象为 master 节点。
            isLeader = new String(data).equals(serverId);
            return true;
        } catch (KeeperException.NoNodeException e) {
            // no master, so try create again
            return false;
        } catch (InterruptedException | KeeperException e) {
            e.printStackTrace();
        }
    }
}

// 中断异常，直接向外抛出。
void runForMaster() throws InterruptedException {
    while (true) {
        try {
            zk.create("/master", serverId.getBytes(),
                    ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL);
            isLeader = true;
            break;
        } catch (KeeperException.NodeExistsException e) {
            isLeader = false;
            break;
        } catch (KeeperException e) {
            // 处理 ConnectionLossException 异常
            e.printStackTrace();
        }
        // 检查活动主节点是否存在，如果不存在就重试。
        if (checkMaster()) {
            break;
        }
    }
}
```


在这个例⼦中，我们简单地传递InterruptedException给调⽤者，即向上
传递异常。不过，在Java中没有明确的指导⽅针告诉我们如何处理线程中
断，甚⾄没有告诉我们这个中断代表什么。有些时候，中断⽤于通知线程
现在要退出了，需要进⾏清理操作，另外的情况，中断⽤于获得⼀个线程
的控制权，应⽤的执⾏还将继续。
InterruptedException异常的处理依赖于程序的上下⽂环境，如果向上抛
出InterruptedException异常，最终关闭zk句柄，我们可以抛出异常到调⽤栈
顶，当句柄关闭时就可以清理所有⼀切。如果zk句柄未关闭，在重新抛出
异常前，我们需要弄清楚⾃⼰是不是主节点，或者继续异步执⾏后续操
作。后者情况⾮常棘⼿，需要我们仔细设计并妥善处理。


### main 方法

```java
public static void main(String args[])
        throws Exception {
    MasterWatcher m = new MasterWatcher("127.0.0.1:2181");
    m.startZK();

    // 调用我们之前实现的runForMaster函数，当前进程成为主节点或另⼀进程成为主节点后返回。
    m.runForMaster();

    if(m.isLeader) {
        System.out.println("I'm the leader!");
    } else {
        System.out.println("I'm not the leader!");
    }
    // wait for a bit
    Thread.sleep(10000);
    // close
    m.stopZK();
}
```

日志如下：

```
WatchedEvent state:SyncConnected type:None path:null
I'm the leader!
WatchedEvent state:Closed type:None path:null
18:13:50.073 [main] INFO  org.apache.zookeeper.ZooKeeper - Session: 0x1000015b7390009 closed
18:13:50.074 [main-EventThread] INFO  org.apache.zookeeper.ClientCnxn - EventThread shut down for session: 0x1000015b7390009
```

因为我们并没有直接处理InterruptedException异常，如果发⽣该异常，
我们的进程将会简单地退出，主节点也不会在退出前进⾏其他操作。在下
⼀章，主节点开始管理系统队列中的任务，但现在我们先继续完善其他组
件。


# 异步获取管理权

ZooKeeper中，所有同步调⽤⽅法都有对应的异步调⽤⽅法。通过异步
调⽤，我们可以在单线程中同时进⾏多个调⽤，同时也可以简化我们的实
现⽅式。让我们回顾管理权的例⼦，修改为异步调⽤的⽅式。

以下为ZooKeeper.create⽅法的异步调⽤版本：

```java
void create(String path,byte[] data,
List<ACL> acl,
CreateMode createMode,      //①
AsyncCallback.StringCallback cb,  //①
Object ctx) //②
```

create⽅法的异步⽅法与同步⽅法⾮常相似，仅仅多了两个参数：
①提供回调⽅法的对象。
②用户指定上下⽂信息（回调⽅法调用是传⼊的对象实例）。

该⽅法调⽤后通常在create请求发送到服务端之前就会⽴即返回。回调
对象通过传⼊的上下⽂参数来获取数据，当从服务器接收到create请求的结
果时，上下⽂参数就会通过回调对象提供给应⽤程序。
注意，该create⽅法不会抛出异常，我们可以简化处理，因为调⽤返回
前并不会等待create命令完成，所以我们⽆需关⼼InterruptedException异
常；同时因请求的所有错误信息通过回调对象会第⼀个返回，所以我们也
⽆需关⼼KeeperException异常。

## 异步回调


回调对象实现只有⼀个⽅法的StringCallback接⼜：

```java
@InterfaceAudience.Public
interface StringCallback extends AsyncCallback {
    void processResult(int rc, String path, Object ctx, String name);
}
```

异步⽅法调⽤会简单化队列对ZooKeeper服务器的请求，并在另⼀个线
程中传输请求。当接收到响应信息，这些请求就会在⼀个专⽤回调线程中
被处理。为了保持顺序，只会有⼀个单独的线程按照接收顺序处理响应
包。

processResult各个参数的含义如下：

- rc

返回调⽤的结构，返回OK或与KeeperException异常对应的编码值。

- path

我们传给create的path参数值。

- ctx

我们传给create的上下⽂参数。

- name

创建的znode节点名称。

⽬前，调⽤成功后，path和name的值⼀样，但是，如果采⽤
CreateMode.SEQUENTIAL模式，这两个参数值就不会相等。

## 注意：回调函数处理

因为只有⼀个单独的线程处理所有回调调用，如果回调函数阻塞，所有后续回调调用都会被阻塞，也就是说，⼀般不要在回调函数中集中操作
或阻塞操作。有时，在回调函数中调用同步⽅法是合法的，但⼀般还是避免这样做，以便后续回调调用可以快速被处理。

## 异步实现

我们把前面的 runForMaster 调整如下：

```java
void runForMaster() {
    zk.create("/master", serverId.getBytes(),
            ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL,
            masterCreateCallback, null);
}
```

其中 masterCreateCallback 回调实现如下：

```java
// 定义回调函数
AsyncCallback.StringCallback masterCreateCallback = new AsyncCallback.StringCallback() {
    @Override
    public void processResult(int rc, String path, Object ctx, String name) {
        // 我们从rc参数中获得create请求的结果，并将其转换为Code枚举类型。rc如果不为0，则对应KeeperException异常。
        switch(KeeperException.Code.get(rc)) {
            //如果因连接丢失导致create请求失败，我们会得到
            //CONNECTIONLOSS编码的结果，⽽不是ConnectionLossException异常。
            //当连接丢失时，我们需要检查系统当前的状态，并判断我们需要如何恢
            //复，我们将会在我们后面实现的checkMaster⽅法中进⾏处理。
            case CONNECTIONLOSS:
                checkMaster();
                return;
                //我们现在成为群首，我们先简单地赋值isLeader为true
            case OK:
                isLeader = true;
                break;
            default:
                // 其他情况，我们并未成为群首。
                isLeader = false;
        }
        System.out.println("I'm " + (isLeader ? "" : "not ") +
                "the leader");
    }
};
```

### checkMaster()

checkMaster 的实现入下：

```java
void checkMaster() {
    zk.getData("/master", false, masterCheckCallback, null);
}

AsyncCallback.DataCallback masterCheckCallback = new AsyncCallback.DataCallback() {
    public void processResult(int rc, String path, Object ctx, byte[] data,
                              Stat stat) {
        switch(KeeperException.Code.get(rc)) {
            case CONNECTIONLOSS:
                checkMaster();
                return;
            case NONODE:
                runForMaster();
                return;
        }
    }
};
```

### 测试

```java
public static void main(String[] args)
        throws Exception {
    AysncMasterWatcher m = new AysncMasterWatcher("127.0.0.1:2181");
    m.startZK();
    m.runForMaster();
    // wait for a bit
    Thread.sleep(10000);
    // close
    m.stopZK();
}
```

日志如下：

```
WatchedEvent state:SyncConnected type:None path:null
I'm the leader
WatchedEvent state:Closed type:None path:null
18:31:35.163 [main] INFO  org.apache.zookeeper.ZooKeeper - Session: 0x1000015b739000b closed
18:31:35.163 [main-EventThread] INFO  org.apache.zookeeper.ClientCnxn - EventThread shut down for session: 0x1000015b739000b
```

此时，同步的版本看起来⽐异步版本实现起来更简单，但在下⼀章我
们会看到，应⽤程序常常由异步变化通知所驱动，因此最终以异步⽅式构
建系统，反⽽使代码更简单。同时，异步调⽤不会阻塞应⽤程序，这样其他事务可以继续进⾏，甚⾄是提交新的ZooKeeper操作。


# 设置元数据

我们将使⽤异步API⽅法来设置元数据路径。我们的主从模型设计依
赖三个⽬录：/tasks、/assign和/workers，我们可以在系统启动前通过某些
系统配置来创建所有⽬录，或者通过在主节点程序每次启动时都创建这些
⽬录。以下代码段会创建这些路径，例⼦中除了连接丢失错误的处理外没
有其他错误处理：

## 实现

```java
public void bootstrap() {
    //①我们没有数据存⼊这些znode节点，所以只传⼊空的字节数组。
    createParent("/workers", new byte[0]);//①
    createParent("/assign", new byte[0]);
    createParent("/tasks", new byte[0]);
    createParent("/status", new byte[0]);
}
void createParent(String path, byte[] data) {
    zk.create(path,
            data,
            ZooDefs.Ids.OPEN_ACL_UNSAFE,
            CreateMode.PERSISTENT,
            createParentCallback,
            data);//②
}
AsyncCallback.StringCallback createParentCallback = new AsyncCallback.StringCallback() {
    public void processResult(int rc, String path, Object ctx, String name) {
        switch (KeeperException.Code.get(rc)) {
            case CONNECTIONLOSS:
                createParent(path, (byte[]) ctx);//③
                break;
            case OK:
                LOG.info("Parent created");
                break;
            case NODEEXISTS:
                LOG.warn("Parent already registered: " + path);
                break;
            default:
                LOG.error("Something went wrong: ",
                        KeeperException.create(KeeperException.Code.get(rc), path));
        }
    }
};
```

其中 LOG 我们直接使用 

```java
private static final Logger LOG = LoggerFactory.getLogger(AysncMasterWatcher.class);
```

从本例中，你会注意到znode节点与⽂件（⼀个包含数据的znode节
点）和⽬录（含有⼦节点的znode节点）没有什么区别，每个znode节点可
以具备以上两个特点。

# 参考资料

《Zookeeper分布式过程协同技术详解》

* any list
{:toc}
