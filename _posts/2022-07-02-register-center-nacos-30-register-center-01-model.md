---
layout: post
title:  分布式注册中心 nacos-30-Nacos 注册中心服务数据模型
date:  2022-07-02 09:22:02 +0800
categories: [Distributed]
tags: [distributed, register-center, sofa, sh]
published: true
---


# Nacos 注册中心服务数据模型

在上文 Nacos 注册中心的设计原理中，简要介绍了服务发现的背景、业界对动态服务发现的解决方案及 Nacos 针对动态服务发现的总体设计思路，让读者对服务发现及 Nacos 的注册中心有了一个框架性的了解。

从本文开始，本书将展开介绍 Nacos 注册中心中的各种技术概念、细节及设计，帮助读者更好地理解 Nacos 注册中心。

本节将较为详尽的展开介绍 Nacos 注册中心中的服务数据模型内容。

主要会为读者详细介绍 Nacos2.0 版本中注册中心所涉及到的数据模型、各个数据模型的含义及各个数据模型的生命周期，并介绍 Nacos2.0 版本和Nacos1.0 版本中，服务数据模型的差异点。

# 服务（Service）和服务实例（Instance）

在生活中，我们被各式各样的服务包围，例如：如果生病了会到医院找医生诊断、如果网购遇到了问题会找客服咨询，医生提供了诊断服务，客服提供了咨询服务，这位为你诊断病症的医生和为你解答问题的客服，都是该服务的具体提供者。

在程序世界中也存在类似的情形，例如：在使用支付宝进行付款的时候，或许会要求你先登陆，验证你的身份信息，最后才能进行支付。而这其中，可能涉及到了支付服务，登陆服务，信息验证服务等等。而这些，都离不开服务的发现。

在服务发现领域中，服务指的是由应用程序提供的一个或一组软件功能的一种抽象概念（例如上述例子的登陆或支付）。它和应用有所不同，应用的范围更广，和服务属于包含关系，即一个应用可能会提供多个服务。为了能够更细粒度地区分和控制服务，Nacos 选择服务作为注册中心的最基本概念。

而服务实例（以下简称实例）是某个服务的具体提供能力的节点，一个实例仅从属于一个服务，而一个服务可以包含一个或多个实例。在许多场景下，实例又被称为服务提供者（Provider），而使用该服务的实例被称为服务消费者（Consumer）。

# 定义服务

在 Nacos 中，服务的定义包括以下几个内容：

命名空间（Namespace）：Nacos 数据模型中最顶层、也是包含范围最广的概念，用于在类似环境或租户等需要强制隔离的场景中定义。Nacos 的服务也需要使用命名空间来进行隔离。

分组（Group）：Nacos 数据模型中次于命名空间的一种隔离概念，区别于命名空间的强制隔离属性，分组属于一个弱隔离概念，主要用于逻辑区分一些服务使用场景或不同应用的同名服务，最常用的情况主要是同一个服务的测试分组和生产分组、或者将应用名作为分组以防止不同应用提供的服务重名。

服务名（Name）：该服务实际的名字，一般用于描述该服务提供了某种功能或能力。

```
Services
- Namespace
- Group
- Name
```

之所以 Nacos 将服务的定义拆分为命名空间、分组和服务名，除了方便隔离使用场景外，还有方便用户发现唯一服务的优点。在注册中心的实际使用场景上，同个公司的不同开发者可能会开发出类似作用的服务，如果仅仅使用服务名来做服务的定义和表示，容易在一些通用服务上出现冲突，比如登陆服务等。

通常推荐使用由运行环境作为命名空间、应用名作为分组和服务功能作为服务名的组合来确保该服务的天然唯一性，当然使用者可以忽略命名空间和分组，仅使用服务名作为服务唯一标示，这就需要使用者在定义服务名时额外增加自己的规则来确保在使用中能够唯一定位到该服务而不会发现到错误的服务上。

# 服务元数据

服务的定义只是为服务设置了一些基本的信息，用于描述服务以及方便快速的找到服务，而服务的元数据是进一步定义了 Nacos 中服务的细节属性和描述信息。主要包含：

健康保护阈值（ProtectThreshold）：为了防止因过多实例故障，导致所有流量全部流入剩余实例，继而造成流量压力将剩余实例被压垮形成的雪崩效应。应将健康保护阈值定义为一个 0 到 1 之间的浮点数。当域名健康实例数占总服务实例数的比例小于该值时，无论实例是否健康，都会将这个实例返回给客户端。这样做虽然损失了一部分流量，但是保证了集群中剩余健康实例能正常工作。

实例选择器（Selector）：用于在获取服务下的实例列表时，过滤和筛选实例。该选择器也被称为路由器，目前Nacos支持通过将实例的部分信息存储在外部元数据管理 CMDB 中，并在发现服务时使用 CMDB 中存储的元数据标签来进行筛选的能力。

拓展数据(extendData)：用于用户在注册实例时自定义扩展的元数据内容，形式为 K-V 。可以在服务中拓展服务的元数据信息，方便用户实现自己的自定义逻辑。

```
Services
- Namespace
- Group
- Name
```

对应的：

```
ProtectThreshold
Selector
extendData
```

# 定义实例

由于服务实例是具体提供服务的节点，因此 Nacos 在设计实例的定义时，主要需要存储该实例的一些网络相关的基础信息，主要包含以下内容：

网络IP地址：该实例的 IP 地址，在 Nacos2.0 版本后支持设置为域名。

网络端口：该实例的端口信息。

健康状态（Healthy）：用于表示该实例是否为健康状态，会在 Nacos 中通过健康检查的手段进行维护，具体内容将在Nacos 健康检查机制章节中详细说明。

集群（Cluster）：用于标示该实例归属于哪个逻辑集群，有关于集群的相关内容，将在后文详细说明。

拓展数据(extendData)：用于用户自定义扩展的元数据内容，形式为K-V。可以在实例中拓展该实例的元数据信息，方便用户实现自己的自定义逻辑和标示该实例。

# 实例元数据

和服务元数据不同，实例的元数据主要作用于实例运维相关的数据信息。主要包含：

权重（Weight）：实例级别的配置。权重为浮点数，范围为 0-10000。权重越大，分配给该实例的流量越大。

上线状态（Enabled）：标记该实例是否接受流量，优先级大于权重和健康状态。用于运维人员在不变动实例本身的情况下，快速地手动将某个实例从服务中移除。

拓展数据(extendData)：不同于实例定义中的拓展数据，这个拓展数据是给予运维人员在不变动实例本身的情况下，快速地修改和新增实例的扩展数据，从而达到运维实例的作用。

在 Nacos2.0 版本中，实例数据被拆分为实例定义和实例元数据，主要是因为这两类数据其实是同一个实例的两种不同场景：开发运行场景及运维场景。对于上下线及权重这种属性，一般认为在实例已经在运行时，需要运维人员手动修改和维护的数据，而 IP，端口和集群等信息，一般情况下在实例启动并注册后，则不会在进行变更。将这两部分数据合并后，就能够得到实例的完整信息，也是 Nacos1.0 版本中的实例数据结构。

同时在 Nacos2.0 版本中，定义实例的这部分数据，会受到持久化属性的的影响，而实例元数据部分，则一定会进行持久化；这是因为运维操作需要保证操作的原子性，不能够因为外部环境的影响而导致操作被重置，例如在Nacos1.0 版本中，运维人员因为实例所处的网络存在问题，操作一个实例下线以此摘除流量，但是同样因为网络问题，该实例与 Nacos 的通信也受到影响，导致实例注销后重新注册，这可能导致上线状态被重新注册而覆盖，失去了运维人员操作的优先级。

当然，这部分元数据也不应该无限制的存储下去，如果实例确实已经移除，元数据也应该移除，为此，在 Nacos 2.0 版本后，通过该接口更新的元数据会在对应实例删除后，依旧存在一段时间，如果在此期间实例重新注册，该元数据依旧生效；您可以通过 nacos.naming.clean.expired-metadata.expired-time 及nacos.naming.clean.expired-metadata.interval 对记忆时间进行修改。

![实例](https://cdn.nlark.com/yuque/0/2021/png/1577777/1638846519571-5a29e022-78fe-4dd2-97c7-ed81fafb2602.png#clientId=u6ac76210-5298-4&from=paste&height=231&id=u5180b838&originHeight=402&originWidth=750&originalType=binary&ratio=1&rotation=0&showTitle=false&size=106718&status=done&style=none&taskId=u13f7e197-8cab-4e04-b859-a089216418b&title=&width=431)

图3 实例


# 持久化属性

如Nacos 注册中心的设计原理文中所述，Nacos 提供两种类型的服务：持久化服务和非持久化服务，分别给类DNS 的基础的服务组件场景和上层实际业务服务场景使用。为了标示该服务是哪种类型的服务，需要在创建服务时选择服务的持久化属性。考虑到目前大多数使用动态服务发现的场景为非持久化服务的类型（如Spring Cloud，Dubbo，Service Mesh等），Nacos 将缺省值设置为了非持久化服务。

在 Nacos2.0 版本后，持久化属性的定义被抽象到服务中，一个服务只能被定义成持久化服务或非持久化服务，一旦定义完成，在服务生命周期结束之前，无法更改其持久化属性。

持久化属性将会影响服务及实例的数据是否会被 Nacos 进行持久化存储，设置为持久化之后，实例将不会再被自动移除，需要使用者手动移除实例。

# 集群（Cluster）

集群是 Nacos 中一组服务实例的一个逻辑抽象的概念，它介于服务和实例之间，是一部分服务属性的下沉和实例属性的抽象。

## 定义集群

在 Nacos 中，集群中主要保存了有关健康检查的一些信息和数据：

健康检查类型（HealthCheckType）：使用哪种类型的健康检查方式，目前支持：TCP，HTTP，MySQL；设置为NONE可以关闭健康检查。

健康检查端口（HealthCheckPort）：设置用于健康检查的端口。

是否使用实例端口进行健康检查（UseInstancePort）：如果使用实例端口进行健康检查，将会使用实例定义中的网络端口进行健康检查，而不再使用上述设置的健康检查端口进行。

拓展数据(extendData)：用于用户自定义扩展的元数据内容，形式为 K-V 。可以自定义扩展该集群的元数据信息，方便用户实现自己的自定义逻辑和标示该集群。

![定义集群](https://cdn.nlark.com/yuque/0/2021/png/1577777/1638847339361-ea04e5c2-8f81-40e5-8f20-812ba91c61a3.png#clientId=u6ac76210-5298-4&from=paste&height=889&id=Hayms&originHeight=889&originWidth=1496&originalType=binary&ratio=1&rotation=0&showTitle=false&size=374380&status=done&style=none&taskId=u08d53b02-3215-4bc8-b296-7e0ac0c291b&title=&width=1496)


# 生命周期

在注册中心中，实例数据都和服务实例的状态绑定，因此服务实例的状态直接决定了注册中心中实例数据的生命周期。而服务作为实例的聚合抽象，生命周期也会由服务实例的状态来决定。

## 服务的生命周期

服务的生命周期相对比较简单，是从用户向注册中心发起服务注册的请求开始。在Nacos中，发起服务注册有两种方式，一种是直接创建服务，一种是注册实例时自动创建服务；前者可以让发起者在创建时期就制定一部分服务的元数据信息，而后者只会使用默认的元数据创建服务。

在生命周期期间，用户可以向服务中新增，删除服务实例，同时也能够对服务的元数据进行修改。

当用户主动发起删除服务的请求或一定时间内服务下没有实例（无论健康与否）后，服务才结束其生命周期，等待下一次的创建。

## 实例的生命周期

实例的生命周期开始于注册实例的请求。但是根据不同的持久化属性，实例后续的生命周期有一定的不同。

持久化的实例，会通过健康检查的状态维护健康状态，但是不会自动的终止该实例的生命周期；在生命周期结束之前，持久化实例均可以被修改数据，甚至主动修改其健康状态。唯一终止持久化实例生命周期的方式就是注销实例的请求。

而非持久化的实例，会根据版本的不同，采用不同的方式维持健康状态：如果是 Nacos1.0 的版本，会通过定时的心跳请求来进行续约，当超过一定时间内没有心跳进行续约时，该非持久化实例则终止生命周期；如果是Nacos2.0 的版本，会通过 gRPC 的长连接来维持状态，当连接发生中断时，该非持久化实例则终止生命周期。当然，非持久化实例也可以通过注销实例的请求，主动终止其生命周期，但是由于长连接和心跳续约的存在，可能导致前一个实例数据的生命周期刚被终止移除，立刻又因为心跳和长连接的补偿请求，再次开启实例的生命周期，给人一种注销失败的假象。

## 集群的生命周期

集群的生命周期则相对复杂，由于集群作为服务和实例的一个中间层，因此集群的生命周期与实例和服务的生命周期均有关。

集群的生命周期开始与该集群第一个实例的生命周期同时开始，因为一个实例必定归属于一个集群，哪怕是默认的集群，因此当第一个实例的生命周期开始时，也就是集群生命周期的开始；

当一个集群下不存在实例时，集群的生命周期也不会立刻结束，而是会等到这个服务的生命周期结束时，才会一起结束生命周期。

## 元数据的生命周期

由于元数据的其对应的数据模型是紧密关联的，所以元数据的生命周期基本和对应的数据模型保持一致。

但是也如前文所说，元数据通常为运维人员的主动操作的数据，会被 Nacos 进行一段时间内的记忆，因此元数据的生命周期的终止相比对应的数据要滞后；若这滞后期间内，对应的数据又重新开始生命周期，则该元数据的生命周期将被立刻重置，不再终止。

![元数据的生命周期](https://cdn.nlark.com/yuque/0/2021/png/1577777/1638848975726-3870ca8b-146f-4fc6-9445-3437d3da21c4.png#clientId=u600ab42f-509e-4&from=paste&height=996&id=u96da299a&originHeight=996&originWidth=1768&originalType=binary&ratio=1&rotation=0&showTitle=false&size=377209&status=done&style=none&taskId=u50df20fd-e9c1-441e-9e8a-936bfeaceb1&title=&width=1768)

图5 各数据的生命周期图

# 小结

本文主要介绍了 Nacos 注册中心中的服务数据模型及其生命周期。

作为 Nacos 注册中心的内容核心，正确理解服务、实例及集群中的数据内容，以及他们之间的关系；知晓各个数据的生命周期，才能够理解 Nacos 注册中心的工作原理和工作流程。

在本文中，多次提到了生命周期的健康状态及维护健康状态的健康检查机制，这就是接下来的章节需要详细介绍的内容。

# 参考资料

https://nacos.io/docs/ebook/knk2h0/

* any list
{:toc}