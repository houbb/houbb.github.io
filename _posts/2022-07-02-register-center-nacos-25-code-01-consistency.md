---
layout: post
title:  分布式注册中心 nacos-25-Nacos Consistency Protocols 一致性协议 
date:  2022-07-02 09:22:02 +0800
categories: [Distributed]
tags: [distributed, register-center, sofa, sh]
published: true
---


# 为什么 Nacos 需要一致性协议

Nacos 在开源支持就定下了一个目标，尽可能的减少用户部署以及运维成本，做到用户只需要一个程序包，就可以快速以单机模式启动 Nacos 或者以集群模式启动 Nacos。

而 Nacos 是一个需要存储数据的一个组件，因此，为了实现这个目标，就需要在 Nacos 内部实现数据存储。

单机下其实问题不大，简单的内嵌关系型数据库即可；但是集群模式下，就需要考虑如何保障各个节点之间的数据一致性以及数据同步，而要解决这个问题，就不得不引入共识算法，通过算法来保障各个节点之间的数据的一致性。

# 为什么 Nacos 选择了 Raft 以及 Distro

为什么 Nacos 会在单个集群中同时运行 CP 协议以及 AP 协议呢？

这其实要从 Nacos 的场景出发的：Nacos 是一个集服务注册发现以及配置管理于一体的组件，因此对于集群下，各个节点之间的数据一致性保障问题，需要拆分成两个方面

## 从服务注册发现来看

服务发现注册中心，在当前微服务体系下，是十分重要的组件，服务之间感知对方服务的当前可正常提供服务的实例信息，必须从服务发现注册中心进行获取，因此对于服务注册发现中心组件的可用性，提出了很高的要求，需要在任何场景下，尽最大可能保证服务注册发现能力可以对外提供服务；同时 Nacos 的服务注册发现设计，采取了心跳可自动完成服务数据补偿的机制。如果数据丢失的话，是可以通过该机制快速弥补数据丢失。

因此，为了满足服务发现注册中心的可用性，强一致性的共识算法这里就不太合适了，因为强一致性共识算法能否对外提供服务是有要求的，如果当前集群可用的节点数没有过半的话，整个算法直接“罢工”，而最终一致共识算法的话，更多保障服务的可用性，并且能够保证在一定的时间内各个节点之间的数据能够达成一致。

上述的都是针对于Nacos服务发现注册中的非持久化服务而言（即需要客户端上报心跳进行服务实例续约）。而对于Nacos服务发现注册中的持久化服务，因为所有的数据都是直接使用调用Nacos服务端直接创建，因此需要由Nacos保障数据在各个节点之间的强一致性，故而针对此类型的服务数据，选择了强一致性共识算法来保障数据的一致性。

## 从配置管理来看

配置数据，是直接在 Nacos 服务端进行创建并进行管理的，必须保证大部分的节点都保存了此配置数据才能认为配置被成功保存了，否则就会丢失配置的变更，如果出现这种情况，问题是很严重的，如果是发布重要配置变更出现了丢失变更动作的情况，那多半就要引起严重的现网故障了，因此对于配置数据的管理，是必须要求集群中大部分的节点是强一致的，而这里的话只能使用强一致性共识算法。

## 为什么是 Raft 和 Distro 呢

对于强一致性共识算法，当前工业生产中，最多使用的就是 Raft 协议，Raft 协议更容易让人理解，并且有很多成熟的工业算法实现，比如蚂蚁金服的 JRaft、Zookeeper 的 ZAB、Consul 的 Raft、百度的 braft、Apache Ratis；因为Nacos是Java技术栈，因此只能在 JRaft、ZAB、Apache Ratis 中选择，但是 ZAB 因为和Zookeeper 强绑定，再加上希望可以和 Raft 算法库的支持团队随时沟通交流，因此选择了 JRaft，选择 JRaft 也是因为 JRaft 支持多 RaftGroup，为 Nacos 后面的多数据分片带来了可能。

而 Distro 协议是阿里巴巴自研的一个最终一致性协议，而最终一致性协议有很多，比如 Gossip、Eureka 内的数据同步算法。

而 Distro 算法是集 Gossip 以及 Eureka 协议的优点并加以优化而出来的，对于原生的Gossip，由于随机选取发送消息的节点，也就不可避免的存在消息重复发送给同一节点的情况，增加了网络的传输的压力，也给消息节点带来额外的处理负载，而 Distro 算法引入了权威 Server 的概念，每个节点负责一部分数据以及将自己的数据同步给其他节点，有效的降低了消息冗余的问题。

# 早期的 Nacos 一致性协议

我们先来看看早期的Naocs版本的架构

![一致性协议](https://cdn.nlark.com/yuque/0/2021/png/333972/1638032950966-f3114b8f-4f03-485b-8bcc-2c0a78bb7562.png#clientId=u0ac0f36f-1570-4&from=drop&id=u9b0d0285&originHeight=288&originWidth=501&originalType=binary&ratio=1&rotation=0&showTitle=false&size=12835&status=done&style=none&taskId=ue2ca64cf-6afa-4dbf-8c0c-69191ee3445&title=)

在早期的 Nacos 架构中，服务注册和配置管理一致性协议是分开的，没有下沉到 Nacos 的内核模块作为通用能力演进，服务发现模块一致性协议的实现和服务注册发现模块的逻辑强耦合在一起，并且充斥着服务注册发现的一些概念。

这使得 Nacos 的服务注册发现模块的逻辑变得复杂且难以维护，耦合了一致性协议层的数据状态，难以做到计算存储彻底分离，以及对计算层的无限水平扩容能力也有一定的影响。

因此为了解决这个问题，必然需要对 Nacos 的一致性协议做抽象以及下沉，使其成为 Core 模块的能力，彻底让服务注册发现模块只充当计算能力，同时为配置模块去外部数据库存储打下了架构基础。

# 当前 Nacos 的一致性协议层

正如前面所说，在当前的 Nacos 内核中，我们已经做到了将一致性协议的能力，完全下沉到了内核模块作为Nacos 的核心能力，很好的服务于服务注册发现模块以及配置管理模块，我们来看看当前 Nacos 的架构。

![一致性协议层](https://cdn.nlark.com/yuque/0/2021/png/333972/1638333831256-55ae4e8b-f999-4519-be14-b497ed9f6ed1.png#clientId=uac96e40b-b093-4&from=drop&id=ub9dfdcfd&originHeight=566&originWidth=683&originalType=binary&ratio=1&rotation=0&showTitle=false&size=33979&status=done&style=none&taskId=u1cb29c0c-abf1-46d7-9467-74fda69e8a1&title=)

可以发现，在新的 Nacos 架构中，已经完成了将一致性协议从原先的服务注册发现模块下沉到了内核模块当中，并且尽可能的提供了统一的抽象接口，使得上层的服务注册发现模块以及配置管理模块，不再需要耦合任何一致性语义，解耦抽象分层后，每个模块能快速演进，并且性能和可用性都大幅提升。

# Nacos 如何做到一致性协议下沉的

既然 Nacos 已经做到了将 AP、CP 协议下沉到了内核模块，而且尽可能的保持了一样的使用体验。

那么这个一致性协议下沉，Nacos 是如何做到的呢？

## 一致性协议抽象

其实，一致性协议，就是用来保证数据一致的，而数据的产生，必然有一个写入的动作；

同时还要能够读数据，并且保证读数据的动作以及得到的数据结果，并且能够得到一致性协议的保障。

因此，一致性协议最最基础的两个方法，就是写动作和读动作

```java
public interface ConsistencyProtocol<T extends Config, P extends RequestProcessor> extends CommandOperations {

    ...

    /**
     * Obtain data according to the request.
     *
     * @param request request
     * @return data {@link Response}
     * @throws Exception {@link Exception}
     */
    Response getData(ReadRequest request) throws Exception;

    /**
     * Data operation, returning submission results synchronously.
     *
     * @param request {@link com.alibaba.nacos.consistency.entity.WriteRequest}
     * @return submit operation result {@link Response}
     * @throws Exception {@link Exception}
     */
    Response write(WriteRequest request) throws Exception;

    ...

}
```

任何使用一致性协议的，都只需要使用 getData 以及 write 方法即可。

同时，一致性协议已经被抽象在了consistency 的包中，Nacos 对于 AP、CP 的一致性协议接口使用抽象都在里面，并且在实现具体的一致性协议时，采用了插件可插拔的形式，进一步将一致性协议具体实现逻辑和服务注册发现、配置管理两个模块达到解耦的目的。

```java
public class ProtocolManager extends MemberChangeListener implements DisposableBean {

    ...
    private void initAPProtocol() {
        ApplicationUtils.getBeanIfExist(APProtocol.class, protocol -> {
            Class configType = ClassUtils.resolveGenericType(protocol.getClass());
            Config config = (Config) ApplicationUtils.getBean(configType);
            injectMembers4AP(config);
            protocol.init((config));
            ProtocolManager.this.apProtocol = protocol;
        });
    }

    private void initCPProtocol() {
        ApplicationUtils.getBeanIfExist(CPProtocol.class, protocol -> {
            Class configType = ClassUtils.resolveGenericType(protocol.getClass());
            Config config = (Config) ApplicationUtils.getBean(configType);
            injectMembers4CP(config);
            protocol.init((config));
            ProtocolManager.this.cpProtocol = protocol;
        });
    }
    ...
}
```

其实，仅做完一致性协议抽象是不够的，如果只做到这里，那么服务注册发现以及配置管理，还是需要依赖一致性协议的接口，在两个计算模块中耦合了带状态的接口；并且，虽然做了比较高度的一致性协议抽象，服务模块以及配置模块却依然还是要在自己的代码模块中去显示的处理一致性协议的读写请求逻辑，以及需要自己去实现一个对接一致性协议的存储，这其实是不好的，服务发现以及配置模块，更多应该专注于数据的使用以及计算，而非数据怎么存储、怎么保障数据一致性，数据存储以及多节点一致的问题应该交由存储层来保证。

为了进一步降低一致性协议出现在服务注册发现以及配置管理两个模块的频次以及尽可能让一致性协议只在内核模块中感知，Nacos这里又做了另一份工作——数据存储抽象。

# 数据存储抽象

正如前面所说，一致性协议，就是用来保证数据一致的，如果利用一致性协议实现一个存储，那么服务模块以及配置模块，就由原来的依赖一致性协议接口转变为了依赖存储接口，而存储接口后面的具体实现，就比一致性协议要丰富得多了，并且服务模块以及配置模块也无需为直接依赖一致性协议而承担多余的编码工作（快照、状态机实现、数据同步）。

使得这两个模块可以更加的专注自己的核心逻辑。对于数据抽象，这里仅以服务注册发现模块为例

```java
public interface KvStorage {

    enum KvType {
        /**
         * Local file storage.
         */
        File,

        /**
         * Local memory storage.
         */
        Memory,

        /**
         * LSMTree storage.
         */
        LSMTree,

        AP,

        CP,
    }

    // 获取一个数据
    byte[] get(byte[] key) throws KvStorageException;
    // 存入一个数据
    void put(byte[] key, byte[] value) throws KvStorageException;
    // 删除一个数据
    void delete(byte[] key) throws KvStorageException;

    ...

}
```

由于 Nacos 的服务模块存储，更多的都是根据单个或者多个唯一key去执行点查的操作，因此 Key-Value 类型的存储接口最适合不过。而 Key-Value 的存储接口定义好之后，其实就是这个 KVStore 的具体实现了。可以直接将 KVStore 的实现对接 Redis，也可以直接对接 DB ，或者直接根据 Nacos 内核模块的一致性协议，再此基础之上，实现一个内存或者持久化的分布式强（弱）一致性 KV。

通过功能边界将 Nacos 进一步分离为计算逻辑层和存储逻辑层，计算层和存储层之间的交互仅通过一层薄薄的数据操作胶水代码，这样就在单个Nacos 进程里面实现了计算和存储二者逻辑的彻底分离。

![胶水](https://cdn.nlark.com/yuque/0/2021/png/333972/1638940665214-23dd180d-6135-4d8c-91f7-a2441e5f31db.png#clientId=ueac03b41-8936-4&from=drop&id=udffea15a&originHeight=745&originWidth=918&originalType=binary&ratio=1&rotation=0&showTitle=false&size=73142&status=done&style=none&taskId=ufffe9a28-3def-487e-8f4e-45fb5cbfd40&title=)

同时，针对存储层，进一步实现插件化的设计，对于中小公司且有运维成本要求的话，可以直接使用 Nacos 自带的内嵌分布式存储组件来部署一套 Nacos 集群，而如果服务实例数据以及配置数据的量级很大的话，并且本身有一套比较好的 Paas 层服务，那么完全可以复用已有的存储组件，实现 Nacos 的计算层与存储层彻底分离。


# chat

## 详细介绍一下一致性协议

一致性协议（Consistency Protocols）是一类用于在分布式系统中协调多个节点状态的协议，其核心目标是在分布式环境中实现数据的一致性。

以下是对一致性协议的详细介绍，包括其背景、分类、常见协议及应用场景。

---

## **一、一致性协议的背景**

在分布式系统中，数据可能存储在多个节点上，每个节点可以独立处理请求。为了保证分布式系统在故障或并发操作的情况下仍然具有一致的状态，需要一种机制来协调节点间的数据操作。

这种机制就是一致性协议。

一致性协议的主要挑战包括：
1. **网络延迟和分区**：分布式系统中，网络可能导致信息传递延迟，甚至部分节点失联。
2. **节点失效**：节点可能由于硬件或软件故障宕机，无法响应。
3. **并发操作**：多个客户端可能同时对同一数据发起修改请求。

---

## **二、一致性的类型**

在讨论一致性协议之前，了解一致性的不同层次非常重要。分布式系统中常见的一致性类型包括：

### **1. 强一致性（Strong Consistency）**
每次操作后，所有节点的状态对外完全一致，即读操作总是返回最新的写结果。实现强一致性通常需要牺牲一定的可用性或性能。

### **2. 弱一致性（Weak Consistency）**
系统允许数据在短时间内不同步，读操作可能返回旧数据，最终在某个时间点达成一致（即最终一致性）。

### **3. 因果一致性（Causal Consistency）**
若操作间存在因果关系（如一个写操作影响了另一个读操作），则这些操作会按照因果顺序被执行。

### **4. 最终一致性（Eventual Consistency）**
系统保证在没有新的更新操作时，所有副本最终会达到一致状态。

---

## **三、常见的一致性协议**

以下是分布式系统中常见的一致性协议及其特点：

### **1. Paxos**
- **特点**：
  - 保证强一致性。
  - 适用于需要容错的分布式系统。
  - 主要依赖选主机制，决定提议（Proposal）的唯一性。
- **优点**：
  - 容错性高，能够应对部分节点故障。
- **缺点**：
  - 实现复杂，性能较低，尤其是在节点间通信延迟较大的场景。
- **应用**：
  - Google Chubby、Zookeeper（ZAB协议是其变种）。

---

### **2. Raft**
- **特点**：
  - 是一种简化版的 Paxos，设计更加易于理解和实现。
  - 使用选主机制，Leader 负责协调所有操作。
- **优点**：
  - 更易实现和调试，提供一致性、日志复制等功能。
  - 读操作可以通过 Leader 提供较高性能。
- **缺点**：
  - 对 Leader 节点依赖较大，Leader 故障会影响性能。
- **应用**：
  - Etcd、Consul 等。

---

### **3. Two-Phase Commit（2PC）**
- **特点**：
  - 两阶段提交协议：准备阶段（Prepare）和提交阶段（Commit）。
  - 在所有参与者（节点）同意后才提交事务。
- **优点**：
  - 实现简单，适用于分布式事务。
- **缺点**：
  - 容错性差，单点故障可能导致资源锁死。
- **应用**：
  - 传统的分布式数据库和事务管理器。

---

### **4. Three-Phase Commit（3PC）**
- **特点**：
  - 在 2PC 的基础上增加预提交阶段，降低阻塞的可能性。
- **优点**：
  - 减少了单点故障的影响。
- **缺点**：
  - 通信成本较高，性能开销大。
- **应用**：
  - 分布式事务中对容错要求较高的场景。

---

### **5. Gossip 协议**
- **特点**：
  - 基于类似病毒传播的机制，用于节点间交换状态信息。
  - 不保证强一致性，适合最终一致性场景。
- **优点**：
  - 通信开销小，扩展性强。
- **缺点**：
  - 一致性收敛速度取决于网络规模和延迟。
- **应用**：
  - DynamoDB、Cassandra。

---

## **四、一致性协议的应用场景**

### **1. 分布式数据库**
- **强一致性**：
  - Google Spanner、TiDB 等。
  - 使用 Paxos 或 Raft 保障数据的高一致性。
- **最终一致性**：
  - DynamoDB、Cassandra 等。
  - 使用 Gossip 协议和冲突解决机制。

### **2. 分布式锁**
- 使用一致性协议（如 Raft）保证锁服务的高可用性和数据一致性。
- 典型应用：Zookeeper（ZAB协议）、Etcd。

### **3. 分布式事务**
- **金融系统**：需要 2PC/3PC 保证事务的一致性。
- **微服务架构**：通过 Saga 或 TCC（Try-Confirm-Cancel）替代传统协议。

### **4. 分布式缓存**
- Redis 集群使用 Gossip 协议在节点间传播元数据。

---

## **五、一致性协议的权衡（CAP理论）**
根据 CAP 理论（Consistency, Availability, Partition tolerance）：
- 一个分布式系统无法同时保证一致性（C）、可用性（A）和分区容错性（P）。
- 实际系统通常在一致性和可用性之间做权衡：
  - 强一致性系统倾向于牺牲可用性。
  - 最终一致性系统倾向于牺牲部分强一致性。

---

通过合理选择一致性协议，分布式系统可以在性能、一致性和容错性之间找到平衡，以满足具体的业务需求。







# 参考资料

https://nacos.io/docs/ebook/agxdnq/

* any list
{:toc}