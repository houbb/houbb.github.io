---
layout: post
title: ZooKeeper-24-ZooKeeper 原理之客户端 client
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---


# 客户端

客户端是开发人员使用ZooKeeper最主要的途径，因此我们有必要对ZooKeeper客户端的内部原理进行详细讲解。

ZooKeeper的客户端主要由以下几个核心组件组成。

- ZooKeeper实例：客户端的入口。

- ClientWatchManager：客户端Watcher管理器。

- HostProvider：客户端地址列表管理器。

- ClientCnxn：客户端核心线程，其内部又包含两个线程，即 SendThread 和EventThread。前者是一个 I/O 线程，主要负责 ZooKeeper 客户端和服务端之间的网络I/O通信；后者是一个事件线程，主要负
责对服务端事件进行处理。

客户端整体结构如图7-17所示。

ZooKeeper客户端的初始化与启动环节，实际上就是ZooKeeper对象的实例化过程，因此我们首先来看下ZooKeeper客户端的构造方法：

关于 ZooKeeper 构造方法的参数说明，在 5.3.1 节中已经做了详细的解释，这里不再赘述。客户端的整个初始化和启动过程大体可以分为以下3个步骤。

1. 设置默认Watcher。

2. 设置ZooKeeper服务器地址列表。

3. 创建ClientCnxn。

如果在 ZooKeeper 的构造方法中传入一个 Watcher 对象的话，那么 ZooKeeper 就会将这个Watcher对象保存在ZKWatchManager的defaultWatcher中，作为整个客户端会话期间的默认 Watcher。

关于 Watcher的更多详细讲解，已经在 7.1.4节中做了详细说明。

# 一次会话的创建过程

为了帮助读者更好地了解ZooKeeper客户端的工作原理，我们首先从一次客户端会话的创建过程讲起，从而先对ZooKeeper的客户端及其几个重要组件之间的协作关系有一个宏观上的了解，如图 7-18 所示是客户端一次会话创建的基本过程。

在这个流程图中，所有以白色作为底色的框图流程可以看作是第一阶段，我们称之为初始化阶段；以斜线底纹表示的流程是第二阶段，称之为会话创建阶段；以点状底纹表示的则是客户端在接收到服务端响应后的对应处理，称之为响应处理阶段。

## 初始化阶段

1.初始化ZooKeeper对象。

通过调用ZooKeeper的构造方法来实例化一个ZooKeeper对象，在初始化过程中，会创建一个客户端的Watcher管理器：ClientWatchManager。

2.设置会话默认Watcher。

如果在构造方法中传入了一个 Watcher 对象，那么客户端会将这个对象作为默认Watcher保存在ClientWatchManager中。

3.构造ZooKeeper服务器地址列表管理器：HostProvider。

对于构造方法中传入的服务器地址，客户端会将其存放在服务器地址列表管理器HostProvider中。

4.创建并初始化客户端网络连接器：ClientCnxn。

ZooKeeper 客户端首先会创建一个网络连接器 ClientCnxn，用来管理客户端与服务器的网络交互。另外，客户端在创建ClientCnxn的同时，还会初始化客户端两个核心队列 outgoingQueue 和 pendingQueue，分别作为客户端的请求发送队列和服务端响应的等待队列。

在后面的章节中我们也会讲到，ClientCnxn 连接器的底层 I/O 处理器是ClientCnxnSocket，因此在这一步中，客户端还会同时创建 ClientCnxnSocket处理器。

![初始化阶段](https://img-blog.csdnimg.cn/d029e1fff14947aeadbb61a522bf45f7.png)

图7-18.ZooKeeper客户端一次会话的创建过程

## 5.初始化SendThread和EventThread。

客户端会创建两个核心网络线程SendThread和EventThread，前者用于管理客户端和服务端之间的所有网络 I/O，后者则用于进行客户端的事件处理。同时，客户端还会将ClientCnxnSocket分配给SendThread作为底层网络I/O处理器，并初始化EventThread的待处理事件队列waitingEvents，用于存放所有等待被客户端处理的事件。

------------------------------ 会话创建阶段

## 6.启动SendThread和EventThread

SendThread首先会判断当前客户端的状态，进行一系列清理性工作，为客户端发送“会话创建”请求做准备。

## 7.获取一个服务器地址。

在开始创建TCP连接之前，SendThread首先需要获取一个ZooKeeper服务器的目标地址，这通常是从 HostProvider 中随机获取出一个地址，然后委托给ClientCnxnSocket去创建与ZooKeeper服务器之间的TCP连接。

## 8.创建TCP连接。

获取到一个服务器地址后，ClientCnxnSocket负责和服务器创建一个TCP长连接。

## 9.构造ConnectRequest请求。

在TCP连接创建完毕后，可能有的读者会认为，这样是否就说明已经和ZooKeeper服务器完成连接了呢？其实不然，步骤8只是纯粹地从网络TCP层面完成了客户端与服务端之间的Socket连接，但远未完成ZooKeeper客户端的会话创建。

SendThread会负责根据当前客户端的实际设置，构造出一个ConnectRequest请求，该请求代表了客户端试图与服务器创建一个会话。同时，ZooKeeper 客户端还会进一步将该请求包装成网络 I/O 层的 Packet 对象，放入请求发送队列outgoingQueue中去。

## 10.发送请求

当客户端请求准备完毕后，就可以开始向服务端发送请求了。ClientCnxnSocket 负责从outgoingQueue中取出一个待发送的Packet对象，将其序列化成ByteBuffer后，向服务端进行发送。

------------------------------ 响应处理阶段

## 11.接收服务端响应。

ClientCnxnSocket 接收到服务端的响应后，会首先判断当前的客户端状态是否是“已初始化”，如果尚未完成初始化，那么就认为该响应一定是会话创建请求的响应，直接交由readConnectResult方法来处理该响应。

## 12.处理Response。
ClientCnxnSocket 会对接收到的服务端响应进行反序列化，得到 Connect Response对象，并从中获取到ZooKeeper服务端分配的会话sessionId。

## 13.连接成功。

连接成功后，一方面需要通知SendThread线程，进一步对客户端进行会话参数的设置，包括 readTimeout 和 connectTimeout 等，并更新客户端状态；

另一方面，需要通知地址管理器HostProvider当前成功连接的服务器地址。

## 14.生成事件：SyncConnected-None。

为了能够让上层应用感知到会话的成功创建，SendThread 会生成一个事件SyncConnected-None，代表客户端与服务器会话创建成功，并将该事件传递给EventThread线程。

## 15.查询Watcher。

EventThread线程收到事件后，会从ClientWatchManager管理器中查询出对应的 Watcher，针对 SyncConnected-None 事件，那么就直接找出步骤 2 中存储的默认Watcher，然后将其放到 EventThread 的waitingEvents队列中去。

## 16.处理事件

EventThread 不断地从 waitingEvents队列中取出待处理的 Watcher对象，然后直接调用该对象的process接口方法，以达到触发Watcher的目的。

至此，ZooKeeper 客户端完整的一次会话创建过程已经全部完成了。上面讲解的这 16个步骤虽然都是比较粗略的说明，但也能帮助我们对ZooKeeper客户端整个会话的创建过程有一个很好的理解。

另外，通过对客户端一次会话的创建过程的讲解，相信读者对地址列表管理器、ClientCnxn和ClientCnxnSocket等这些ZooKeeper客户端的核心组件及其之间的关系和协作过程也有了一个大体上的认识。

本节余下部分将重点从这些组件展开来进一步讲解ZooKeeper客户端的技术内幕。

# 服务器地址列表

在使用ZooKeeper构造方法时，用户传入的ZooKeeper服务器地址列表，即connectString参数，通常是这样一个使用英文状态逗号分隔的多个IP地址和端口的字符串：

```
192.168.0.1:2181,192.168.0.1:2181,192.168.0.1:2181
```

从这个地址串中我们可以看出，ZooKeeper 客户端允许我们将服务器的所有地址都配置在一个字符串上，于是一个问题就来了：ZooKeeper 客户端在连接服务器的过程中，是如何从这个服务器列表中选择服务器机器的呢？

是按序访问，还是随机访问呢？

ZooKeeper 客户端内部在接收到这个服务器地址列表后，会将其首先放入一个ConnectStringParser对象中封装起来。

ConnectStringParser是一个服务器地址列表的解析器，该类的基本结构如下：

```java
public final class ConnectStringParser {
    String chrootPath;

    ArrayList<InetSocketAddress> serverAddress = new ArrayList<InetSocketAddress>;
}
```

onnectStringParser解析器将会对传入的connectString做两个主要处理：解析chrootPath；保存服务器地址列表。

## Chroot：客户端隔离命名空间

在 3.2.0 及其之后版本的 ZooKeeper 中，添加了“Chroot”特性[3]，该特性允许每个客户端为自己设置一个命名空间（Namespace）。

如果一个ZooKeeper客户端设置了Chroot，那么该客户端对服务器的任何操作，都将会被限制在其自己的命名空间下。

举个例子来说，如果我们希望为应用 X 分配/apps/X下的所有子节点，那么该应用可以将其所有ZooKeeper客户端的Chroot设置为/apps/X的。

一旦设置了Chroot之后，那么对这个客户端来说，所有的节点路径都以/apps/X为根节点，它和 ZooKeeper 发起的所有请求中相关的节点路径，都将是一个相对路径——相对于/apps/X的路径。

例如通过ZooKeeper 客户端 API 创建节点/test_chroot，那么实际上在服务端被创建的节点是/apps/X/test_chroot。

通过设置Chroot，我们能够将一个客户端应用与ZooKeeper服务端的一棵子树相对应，在那些多个应用共用一个ZooKeeper集群的场景下，这对于实现不同应用之间的相互隔离非常有帮助。

客户端可以通过在connectString中添加后缀的方式来设置Chroot，如下所示：

```
192.168.0.1:2181,192.168.0.1:2181,192.168.0.1:2181/apps/X
```

将这样一个connectString传入客户端的ConnectStringParser后就能够解析出Chroot并保存在chrootPath属性中。

## HostProvider：地址列表管理器

在ConnectStringParser解析器中会对服务器地址做一个简单的处理，并将服务器地址和相应的端口封装成一个 InetSocketAddress 对象，以 ArrayList 形式保存在 ConnectStringParser.serverAddresses 属性中。然后，经过处理的地址列表会被进一步封装到StaticHostProvider类中。

在讲解StaticHostProvider之前，我们首先来看其对应的接口：HostProvider。

HostProvider类定义了一个客户端的服务器地址管理器：

```java
public interface HostProvider {

    public InetSocketAddress next(long spinDelay);

    public void onConnected();

}
```

ZooKeeper规定，任何对于该接口的实现必须满足以下3点，这里简称为“HostProvider三要素”。

1） next（）方法必须要有合法的返回值

ZooKeeper规定，凡是对该方法的调用，必须要返回一个合法的InetSocketAddress对象。也就是说，不能返回null或其他不合法的Inet SocketAddress。

2） next（）方法必须返回已解析的InetSocketAddress对象。

在上面我们已经提到，服务器的地址列表已经被保存在 ConnectString Parser.serverAddresses 中，但是需要注意的一点是，此时里面存放的都是没有被解析的InetSocketAddress。

在进一步传递到HostProvider 后，HostProvider需要负责来对这个InetSocketAddress列表进行解析，不一定是在 next（）方法中来解析，但是无论如何，最终在 next（）方法中返回的必须是已被解析的InetSocketAddress对象。

3） size（）方法不能返回0。

ZooKeeper规定了该方法不能返回0，也就是说，HostProvider中必须至少有一个服务器地址。

## StaticHostProvider

接下来我们看看 ZooKeeper 客户端中对 HostProvider 的默认实现：StaticHost Provider，其数据结构如图7-19所示。

### 解析服务器地址

针对 ConnectStringParser.serverAddresses 集合中那些没有被解析的服务器地址，StaticHostProvider 首先会对这些地址逐个进行解析，然后再放入serverAddresses集合中去。

同时，使用Collections工具类的shuffle方法来将这个服务器地址列表进行随机的打散。

### 获取可用的服务器地址

通过调用 StaticHostProvider 的 next（）方法，能够从 StaticHostProvider中获取一个可用的服务器地址。这个 next（）方法并非简单地从 serverAddresses中依次获取一个服务器地址，而是先将随机打散后的服务器地址列表拼装成一个环形循环队列，如图 7-20 所示。

注意，这个随机过程是一次性的，也就是说，之后的使用过程中一直是按照这样的顺序来获取服务器地址的。

举个例子来说，假如客户端传入这样一个地址列表：“host1，host2，host3，host4，host5”。经过一轮随机打散后，可能的一种顺序变成了“host2，host4，host1，host5，host3”，并且形成了图7-20所示的循环队列。

此外，HostProvider还会为该循环队列创建两个游标：currentIndex 和 lastIndex。currentIndex 表示循环队列中当前遍历到的那个元素位置，lastIndex 则表示当前正在使用的服务器地址位置。

初始化的时候，currentIndex和lastIndex的值都为-1。

在每次尝试获取一个服务器地址的时候，都会首先将 currentIndex 游标向前移动 1位，如果发现游标移动超过了整个地址列表的长度，那么就重置为 0，回到开始的位置重新开始，这样一来，就实现了循环队列。

当然，对于那些服务器地址列表提供得比较少的场景，StaticHostProvider中做了一个小技巧，就是如果发现当前游标的位置和上次已经使用过的地址位置一样，即当 currentIndex 和 lastIndex 游标值相同时，就进行spinDelay毫秒时间的等待。

总的来说，StaticHostProvider 就是不断地从图 7-20 所示的环形地址列表队列中去获取一个地址，整个过程非常类似于“Round Robin”的调度策略。

### 对HostProvider的几个设想

StaticHostProvider只是ZooKeeper官方提供的对于地址列表管理器的默认实现方式，也是最通用和最简单的一种实现方式。读者如果有需要的话，完全可以在满足上面提到的“HostProvider三要素”的前提下，实现自己的服务器地址列表管理器。

1）配置文件方式

在ZooKeeper默认的实现方式中，是通过在构造方法中传入服务器地址列表的方式来实现地址列表的设置，但其实通常开发人员更习惯于将例如 IP 地址这样的配置信息保存在一个单独的配置文件中统一管理起来。

针对这样的需求，我们可以自己实现一个 HostProvider，通过在应用启动的时候加载这个配置文件来实现对服务器地址列表的获取。

2）动态变更的地址列表管理器

在ZooKeeper的使用过程中，我们会碰到这样的问题：ZooKeeper服务器集群的整体迁移或个别机器的变更，会导致大批客户端应用也跟着一起进行变更。

出现这个尴尬局面的本质原因是因为我们将一些可能会动态变更的IP地址写死在程序中了。

因此，实现动态变更的地址列表管理器，对于提升ZooKeeper客户端用户使用体验非常重要。

为了解决这个问题，最简单的一种方式就是实现这样一个 HostProvider：地址列表管理器能够定时从 DNS 或一个配置管理中心上解析出 ZooKeeper 服务器地址列表，如果这个地址列表变更了，那么就同时更新到 serverAddresses 集合中去，这样在下次需要获取服务器地址（即调用next（）方法）的时候，就自然而然使用了新的服务器地址，随着时间推移，慢慢地就能够在保证客户端透明的情况下实现ZooKeeper服务器机器的变更。

3）实现同机房优先策略

随着业务增长，系统规模不断扩大，我们对于服务器机房的需求也日益旺盛。

同时，随着系统稳定性和系统容灾等问题越来越被重视，很多互联网公司会出现多个机房，甚至是异地机房。

多机房，在提高系统稳定性和容灾能力的同时，也给我们带来了一个新的困扰：如何解决不同机房之间的延时。

我们以目前主流的采用光电波传输的网络带宽架构（光纤中光速大约为 20 万公里每秒，千兆带宽）为例，对于杭州和北京之间相隔1500公里的两个机房计算其网络延时：

（1500×2）/（20×104）=15（毫秒）

需要注意的是，这个 15 毫秒仅仅是一个理论上的最小值，在实际的情况中，我们的网络线路并不能实现直线铺设，同时信号的干扰、光电信号的转换以及自身的容错修复对网络通信都会有不小的影响，导致了在实际情况中，两个机房之间可能达到30～40毫秒，甚至更大的延时。

所以在目前大规模的分布式系统设计中，我们开始考虑引入“同机房优先”的策略。

所谓的“同机房优先”是指服务的消费者优先消费同一个机房中提供的服务。

举个例子来说，一个服务F在杭州机房和北京机房中都有部署，那么对于杭州机房中的服务消费者，会优先调用杭州机房中的服务，对于北京机房的客户端也一样。

对于ZooKeeper集群来说，为了达到容灾要求，通常会将集群中的机器分开部署在多个机房中，因此同样面临上述网络延时问题。

对于这种情况，就可以实现一个能够优先和同机房ZooKeeper服务器创建会话的HostProvider。

# ClientCnxn：网络I/O

ClientCnxn是ZooKeeper客户端的核心工作类，负责维护客户端与服务端之间的网络连接并进行一系列网络通信。

在7.3.1节中，我们已经看到ClientCnxn在一次会话创建过程中的工作机制，现在我们再来看看ClientCnxn内部的工作原理。

## Packet

Packet 是 ClientCnxn 内部定义的一个对协议层的封装，作为 ZooKeeper 中请求与响应的载体，其数据结构如图7-21所示。

Packet 中包含了最基本的请求头（requestHeader）、响应头（replyHeader）、请求体（request）、响应体（response）、节点路径（clientPath/serverPath）和注册的Watcher（watchRegistration）等信息。

针对Packet中这么多的属性，读者可能会疑惑它们是否都会在客户端和服务端之间进行网络传输？

答案是否定的。

Packet的createBB（）方法负责对Packet对象进行序列化，最终生成可用于底层网络传输的 ByteBuffer 对象。

在这个过程中，只会将requestHeader、request 和 readOnly 三个属性进行序列化，其余属性都保存在客户端的上下文中，不会进行与服务端之间的网络传输。

outgoingQueue和pendingQueue

ClientCnxn中，有两个比较核心的队列outgoingQueue和pendingQueue，分别代表客户端的请求发送队列和服务端响应的等待队列。

Outgoing队列是一个请求发送队列，专门用于存储那些需要发送到服务端的 Packet 集合。Pending 队列是为了存储那些已经从客户端发送到服务端的，但是需要等待服务端响应的Packet集合。

ClientCnxnSocket：底层Socket通信层

ClientCnxnSocket定义了底层 Socket通信的接口。

在 ZooKeeper 3.4.0以前的版本中，客户端的这个底层通信层并没有被独立出来，而是混合在了ClientCnxn代码中。

但后来为了使客户端代码结构更为清晰，同时也是为了便于对底层 Socket 层进行扩展（例如使用 Netty 来实现），因此从 3.4.0 版本开始，抽取出了这个接口类。

在使用ZooKeeper客户端的时候，可以通过在zookeeper.clientCnxnSocket这个系统变量中配置ClientCnxnSocket实现类的全类名，以指定底层Socket通信层的自定义实现，例如，-Dzookeeper.clientCnxnSocket=org.apache.zookeeper.ClientCnxnSocketNIO。

在ZooKeeper中，其默认的实现是ClientCnxnSocketNIO。该实现类使用Java原生的NIO接口，其核心是doIO逻辑，主要负责对请求的发送和响应接收过程。

## 请求发送

在正常情况下（即客户端与服务端之间的 TCP 连接正常且会话有效的情况下），会从outgoingQueue队列中提取出一个可发送的Packet对象，同时生成一个客户端请求序号 XID 并将其设置到 Packet 请求头中去，然后将其序列化后进行发送。这里提到了“获取一个可发送的 Packet 对象”，那么什么样的 Packet 是可发送的呢？

在outgoingQueue队列中的Packet整体上是按照先进先出的顺序被处理的，但是如果检测到客户端与服务端之间正在处理 SASL 权限的话，那么那些不含请求头（requestHeader）的Packet（例如会话创建请求）是可以被发送的，其余的都无法被发送。

请求发送完毕后，会立即将该Packet保存到pendingQueue队列中，以便等待服务端响应返回后进行相应的处理

## 响应接收

客户端获取到来自服务端的完整响应数据后，根据不同的客户端请求类型，会进行不同的处理。

· 如果检测到当前客户端还尚未进行初始化，那么说明当前客户端与服务端之间正在进行会话创建，那么就直接将接收到的 ByteBuffer（incomingBuffer）序列化成ConnectResponse对象。

· 如果当前客户端已经处于正常的会话周期，并且接收到的服务端响应是一个事件，那么ZooKeeper客户端会将接收到的ByteBuffer（incomingBuffer）序列化成WatcherEvent对象，并将该事件放入待处理队列中。

· 如果是一个常规的请求响应（指的是Create、GetData和Exist等操作请求），那么会从pendingQueue队列中取出一个Packet来进行相应的处理。ZooKeeper客户端首先会通过检验服务端响应中包含的 XID 值来确保请求处理的顺序性，然后再将接收到的ByteBuffer（incomingBuffer）序列化成相应的Response对象。

最后，会在finishPacket方法中处理Watcher注册等逻辑。

### SendThread

SendThread 是客户端 ClientCnxn内部一个核心的 I/O调度线程，用于管理客户端和服务端之间的所有网络 I/O 操作。

在 ZooKeeper 客户端的实际运行过程中，一方面，SendThread维护了客户端与服务端之间的会话生命周期，其通过在一定的周期频率内向服务端发送一个PING包来实现心跳检测。同时，在会话周期内，如果客户端与服务端之间出现TCP连接断开的情况，那么就会自动且透明化地完成重连操作。

另一方面，SendThread管理了客户端所有的请求发送和响应接收操作，其将上层客户端API操作转换成相应的请求协议并发送到服务端，并完成对同步调用的返回和异步调用的回调。同时，SendThread 还负责将来自服务端的事件传递给 EventThread 去处理。

### EventThread

EventThread 是客户端 ClientCnxn 内部的另一个核心线程，负责客户端的事件处理，并触发客户端注册的Watcher监听。

EventThread中有一个waitingEvents队列，用于临时存放那些需要被触发的Object，包括那些客户端注册的Watcher和异步接口中注册的回调器AsyncCallback。

同时，EventThread会不断地从waitingEvents这个队列中取出 Object，识别出其具体类型（Watcher 或者 AsyncCallback），并分别调用process和processResult接口方法来实现对事件的触发和回调。

# 参考资料

分布式一致性原理与实践

* any list
{:toc}
