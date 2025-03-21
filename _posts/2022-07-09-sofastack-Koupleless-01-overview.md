---
layout: post
title: Koupleless 是一种模块化的 Serverless 技术解决方案
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, SOFAActs, test, sh]
published: true
---

# 1.1 简介与适用场景

## 什么是 Koupleless

Koupleless 是一种模块化的 Serverless 技术解决方案，它能让普通应用以比较低的代价演进为 Serverless 研发模式，让代码与资源解耦，轻松独立维护，与此同时支持秒级构建部署、合并部署、动态伸缩等能力为用户提供极致的研发运维体验，最终帮助企业实现降本增效。

随着各行各业的信息化数字化转型，企业面临越来越多的研发效率、协作效率、资源成本和服务治理痛点，接下来带领大家逐一体验这些痛点，以及它们在 Koupleless 中是如何被解决的。

---

## 适用场景

### 痛点 1：应用构建发布慢或者 SDK 升级繁琐

- **传统问题**：  
  应用镜像化构建需 3-5 分钟，单机代码发布到启动需 3-5 分钟，开发者每次验证或上线需等待 **6-10 分钟**。SDK 升级需修改所有应用代码并重新构建发布，流程繁琐。  
- **Koupleless 方案**：  
  使用 **通用基座** 与配套工具，将应用切分为 **基座**（沉淀公共 SDK）和 **模块**（业务代码包）。基座升级对业务无感，模块热部署实现 **10 秒级构建发布** 和 **公共 SDK 升级无感**。  
  ![应用构建发布速度](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/671/1694592240984-8ea49823-ebd0-4bb7-909c-380f0439382b.png)

---

### 痛点 2：长尾应用资源与维护成本高

- **传统问题**：  
  企业 80% 的长尾应用 CPU 使用率低于 10%，造成 **资源浪费**。  
- **Koupleless 方案**：  
  通过 **合并部署** 将多个应用合并到同一基座，复用基座内存（Metaspace 和 Heap），构建产物从数百 MB 瘦身至几十 MB，提升 CPU 使用率。  
  ![应用机器成本](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/671/1694593117757-d2932c29-c4c2-4ecc-9a41-59a750d53823.png)

---

### 痛点 3：企业研发协作效率低

- **传统问题**：  
  多人协作需统一时间窗口迭代开发，存在需求等待、环境抢占、迭代冲突等问题。  
- **Koupleless 方案**：  
  将应用拆分为 **基座** 和多个独立 **模块**，模块可并行开发与热部署，单次构建+发布从 **6-10 分钟缩短至十秒级**。  
  ![协作效率低](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/671/1694594675815-3037ffe1-2048-4c86-bc50-456697b197d5.png)

---

### 痛点 4：难以沉淀业务资产提高中台效率

- **传统问题**：  
  中台应用拆分独立部署带来高昂资源成本和运维负担。  
- **Koupleless 方案**：  
  基座沉淀业务资产（API/SPI 定义、公共逻辑），模块直接调用基座能力，单次构建+发布缩短至 **30 秒内**。  
  ![提高中台效率](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/671/1694601773808-b25f5beb-a4e4-4d93-ba55-6f61bf0377bc.png)

---

### 痛点 5：微服务演进成本高

- **应用生命周期**：  
  - **初创期**：采用单体架构。  
  - **增长期**：拆分为基座与模块，提升协作效率。  
  - **成熟期**：模块拆分为独立应用。  
  - **长尾期**：模块合并部署实现降本增效。  
  ![微服务演进成本](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/671/1694602307402-510d44ec-314c-44c4-96d8-bb978dd027ff.png)

# 1.2 行业背景

## 应用研发与微服务存在的问题

应用架构从单体应用发展到微服务，结合软件工程从瀑布模式到当前的 DevOps 模式的发展，解决了可扩展、分布式、分工协作等问题，为企业提供较好的敏捷性与执行效率，带来了明显的价值。但该模式发展至今，虽然解决了一些问题，也有微服务的一些问题慢慢暴露出来，在当前已经得到持续关注：

### 基础设施复杂

#### 认知负载高

当前业务要完成一个需求，背后实际上有非常多的依赖、组件和平台在提供各种各样的能力，只要这些业务以下的某一个组件出现异常被业务感知到，都会对业务研发人员带来较大认知负担和对应恢复的时间成本。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695086284703-13a90661-9735-4daa-a7ec-dfc3a28ca2bd.png#clientId=ue95e757a-3cd6-4&from=paste&height=260&id=ubf4cf860&originHeight=942&originWidth=1738&originalType=binary&ratio=2&rotation=0&showTitle=false&size=404365&status=done&style=none&taskId=udcdc41a4-9949-4f53-98ca-e722e63bfc8&title=&width=479 )
![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695086591548-8ac5f4b6-b5e2-4ba4-aa1e-35ff6816634a.png#clientId=ue95e757a-3cd6-4&from=paste&height=200&id=ub7a3e5b4&originHeight=596&originWidth=582&originalType=binary&ratio=2&rotation=0&showTitle=false&size=415294&status=done&style=none&taskId=u6e187ff5-dade-4172-83e4-38a90d4ad38&title=&width=195 )
基础设施复杂、异常种类繁多

#### 运维负担重

业务包含的各个依赖也会不断迭代升级，例如框架、中间件、各种 sdk 等，在遇到

- 重要功能版本发布
- 修复紧急 bug
- 遇到重大安全漏洞
等情况时，这些依赖的新版本就需要业务尽可能快的完成升级，这造成了两方面的问题：

##### 对于业务研发人员

这些依赖的升级如果只是一次两次那么就不算是问题，但是一个业务应用背后依赖的框架、中间件与各类 sdk 是很多的，每一个依赖发布这些升级都需要业务同学来操作，这么多个依赖的话长期上就会对业务研发同学来说是不小的运维负担。另外这里也需要注意到业务公共层对业务开发者来说也是不小的负担。

##### 对于基础设施人员

类似的对于各个依赖的开发人员自身，每发布一个这样的新版本，需要尽可能快的让使用的业务应用完成升级。但是业务研发人员更关注业务需求交付，想要推动业务研发人员快速完成升级是不太现实的，特别是在研发人员较多的企业里。

#### 启动慢

每个业务应用启动过程都需要涉及较多过程，造成一个功能验证需要花费较长等待时间。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695088271232-52d649a0-0e21-46b3-aaf4-43d0d908d279.png#clientId=ue95e757a-3cd6-4&from=paste&height=83&id=uf009ae3a&originHeight=180&originWidth=1234&originalType=binary&ratio=2&rotation=0&showTitle=false&size=52685&status=done&style=none&taskId=u56e65597-48ba-47f8-b8b6-c69a8ceebf3&title=&width=570 )
#### 发布效率低

由于上面提到的启动慢、异常多的问题，在发布上线过程中需要较长时间，出现异常导致卡单需要恢复处理。发布过程中除了平台异常外，机器异常发生的概率会随着机器数量的增多而增多，假如一台机器正常完成发布（不发生异常）的概率是 99.9%，也就是一次性成功率为 99.9%，那么100台则是 90%，1000台则降低到了只有 36.7%，所以对于机器较多的应用发布上线会经常遇到卡单的问题，这些都需要研发人员介入处理，导致效率低。

### 协作与资源成本高

#### 单体应用/大应用过大

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695109775918-de436da0-8187-45a8-a30a-62177a55181e.png#clientId=u02591eed-2e18-4&from=paste&height=106&id=u28baf164&originHeight=304&originWidth=1412&originalType=binary&ratio=2&rotation=0&showTitle=false&size=97660&status=done&style=none&taskId=u468dfc48-8b76-484e-abb6-36aed56dfd8&title=&width=494 )
##### 多人协作阻塞

业务不断发展，应用会不断变大，这主要体现在开发人员不断增多，出现多人协作阻塞问题。

##### 变更影响面大，风险高

业务不断发展，线上流量不断增大，机器数量也不断增多，但当前一个变更可能影响全部代码和机器流量，变更影响面大风险高。

#### 小应用过多

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695111071288-b27e64a3-ff6f-4457-9353-5a4b337faccf.png#clientId=u02591eed-2e18-4&from=paste&height=110&id=ua230cdfe&originHeight=302&originWidth=1404&originalType=binary&ratio=2&rotation=0&showTitle=false&size=76471&status=done&style=none&taskId=ua211c1f6-fe53-43fa-8be8-7da9a92e8cb&title=&width=512 )
在微服务发展过程中，随着时间的推移，例如部分应用拆分过多、某些业务萎缩、组织架构调整等，都会出现线上小应用或者长尾应用不断积累，数量越来越多，像蚂蚁过去3年应用数量增长了 3倍。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695111122234-8a85eee7-bdf5-40c6-85e2-5955413f9c7d.png#clientId=u02591eed-2e18-4&from=paste&height=177&id=uf7c75dd0&originHeight=1182&originWidth=1538&originalType=binary&ratio=2&rotation=0&showTitle=false&size=140920&status=done&style=none&taskId=uaadf29d5-7052-4316-9073-5ce5a4f92d4&title=&width=230 )
##### 资源成本高

这些应用每个机房都需要几台机器，但其实流量也不大，cpu 使用率很低，造成资源浪费。

##### 长期维护成本

这些应用同样需要人员来维度，例如升级 SDK，修复安全漏洞等，长期维护成本高。

#### 问题必然性

微服务系统是个生态，在一个公司内发展演进几年后，参考28定律，少数的大应用占有大量的流量，不可避免的会出现大应用过大和小应用过多的问题。然而大应用多大算大，小应用多少算多，这没有定义的标准，所以这类问题造成的研发人员的痛点是隐匿的，没有痛到一定程度是较难引起公司管理层面的关注和行动。

### 如何合理拆分微服务

微服务如何合理拆分始终是个老大难的问题，合理拆分始终没有清晰的标准，这也是为何会存在上述的大应用过大、小应用过多问题的原因。而这些问题背后的根因是**业务与组织灵活，与微服务拆分的成本高，两者的敏捷度不一致** 。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695113016136-8d591312-1300-496e-9df8-a5ed1a49abe4.png#clientId=u02591eed-2e18-4&from=paste&height=201&id=u7ce79cce&originHeight=554&originWidth=1222&originalType=binary&ratio=2&rotation=0&showTitle=false&size=182342&status=done&style=none&taskId=uf3c867d4-2d82-4922-a6d9-6572ca3a1f7&title=&width=443 )
业务发展灵活，组织架构也在不断调整，而微服务拆分需要机器与长期维护的成本，两者的敏捷度不一致，导致容易出现未拆或过度拆分问题，从而出现大应用过大和小应用过多问题。这类问题不从根本上解决，会导致微服务应用治理过一波之后还会再次出现问题，导致研发同学始终处于低效的痛苦与治理的痛苦循环中。

### 不同体量企业面对的问题

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695131026232-1e25044b-d0d4-4a58-9d03-ef665365fbc6.png#clientId=ucec7e736-7c4f-4&from=paste&height=511&id=uc85ea670&originHeight=1022&originWidth=3766&originalType=binary&ratio=2&rotation=0&showTitle=false&size=244352&status=done&style=none&taskId=u18416169-fc43-47a4-8486-9e5e328552c&title=&width=1883 )
### 行业尝试的解法

当前行业里也有很多不错的思路和项目在尝试解决这些问题，例如服务网格、应用运行时、平台工程，Spring Modulith、Google ServiceWeaver，有一定的效果，但也存在一定的局限性：

- 从业务研发人员角度看，只屏蔽部分基础设施，未屏蔽业务公共部分
- 只解决其中部分问题
- 存量应用接入改造成本高
Koupleless 的目的是为了解决这些问题而不断演进出来的一套研发框架与平台能力。

# 1.3.1 架构原理

## 模块化应用架构

为了解决这些问题，我们对应用同时做了横向和纵向的拆分。首先第一步纵向拆分：把应用拆分成**基座** 和**业务** 两层，这两层分别对应两层的组织分工。基座小组与传统应用一样，负责机器维护、通用逻辑沉淀、业务架构治理，并为业务提供运行资源和环境。通过关注点分离的方式为业务屏蔽业务以下所有基础设施，聚焦在业务自身上。第二部我们将业务进行横向切分出多个模块，多个模块之间独立并行迭代互不影响，同时模块由于不包含基座部分，构建产物非常轻量，启动逻辑也只包含业务本身，所以启动快，具备秒级的验证能力，让模块开发得到极致的提效。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695131313965-18385213-eded-4a6b-b554-db5312fa2c9d.png#clientId=ua84a92a5-30aa-4&from=paste&height=431&id=udb6b29d5&originHeight=862&originWidth=3448&originalType=binary&ratio=2&rotation=0&showTitle=false&size=192627&status=done&style=none&taskId=u9a114a24-0887-48d9-87b2-57d3e15eb80&title=&width=1724)
拆分之前，每个开发者可能感知从框架到中间件到业务公共部分到业务自身所有代码和逻辑，拆分后，团队的协作分工发生相应改变，研发人员分工出两种角色，基座和模块开发者，模块开发者不关心资源与容量，享受秒级部署验证能力，聚焦在业务逻辑自身上。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695131554610-ef5c4a2f-0080-45eb-8fed-55fdf5d827f9.png#clientId=ua84a92a5-30aa-4&from=paste&height=459&id=u7227f759&originHeight=918&originWidth=3714&originalType=binary&ratio=2&rotation=0&showTitle=false&size=309179&status=done&style=none&taskId=u12307968-2a79-4f77-9c78-e976399c60e&title=&width=1857)
这里要重点看下我们是如何做这些纵向和横向切分的，切分是为了隔离，隔离是为了能够独立迭代、剥离不必要的依赖，然而如果只是隔离是没有共享相当于只是换了个部署的位置而已，很难有好的效果。所以我们除了隔离还有共享能力，所以这里需要聚焦在隔离与共享上来理解模块化架构背后的原理。

### 模块的定义

在这之前先看下这里的模块是什么？模块是通过原来应用减去基座部分得到的，这里的减法是通过设置模块里依赖的 scope 为 provided 实现的，

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695132446404-0571be28-5cdf-452e-90f5-001a4209c750.png#clientId=u177778f7-e9cd-4&from=paste&height=142&id=ud796498d&originHeight=516&originWidth=1834&originalType=binary&ratio=2&rotation=0&showTitle=false&size=108247&status=done&style=none&taskId=u8201db6e-cf5e-4fbd-ab24-6a0223e1709&title=&width=506)
![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695132481921-6fb1c3da-0de3-46ce-bf8e-cc645f63157c.png#clientId=u177778f7-e9cd-4&from=paste&height=187&id=u31cba15e&originHeight=524&originWidth=1026&originalType=binary&ratio=2&rotation=0&showTitle=false&size=205261&status=done&style=none&taskId=u2c981d7a-dfff-43c6-b6c6-5c6a5701d2b&title=&width=367)
一个模块可以由这三点定义：

- SpringBoot 打包生成的 jar 包
- 一个模块： 一个 SpringContext + 一个 ClassLoader
- 热部署（升级的时候不需要启动进程）
### 模块的隔离与共享

模块通过 ClassLoader 隔离配置和代码，SpringContext 隔离 Bean 和服务，可以通过调用 Spring ApplicationContext 的start close 方法来动态启动和关闭服务。通过 SOFAArk 来共享模块和基座的配置和代码 Class，通过 SpringContext Manager 来共享多模块间的 Bean 和服务。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695132610081-3efe470f-5c65-4d46-b4e4-1ecb15c8d789.png#clientId=u771aab18-101c-4&from=paste&height=313&id=u4c63a679&originHeight=972&originWidth=1334&originalType=binary&ratio=2&rotation=0&showTitle=false&size=160772&status=done&style=none&taskId=uafe9a1eb-025c-4e1e-9316-35b8bd32b96&title=&width=429)
并且在 JVM 内通过

- Ark Container 提供多 ClassLoader 运行环境
- Arklet 来管理模块生命周期
- Framework Adapter 将 SpringBoot 生命周期与模块生命周期关联起来
- SOFAArk 默认委托加载机制，打通模块与基座类委托加载
- SpringContext Manager 提供 Bean 与服务发现调用机制
- 基座本质也是模块，拥有独立的 SpringContext 和 ClassLoader
![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695139080634-1669ea76-c486-47fc-ac4f-5900833896b9.png#clientId=u71a0730f-fb54-4&from=paste&height=275&id=u1cf30803&originHeight=722&originWidth=1428&originalType=binary&ratio=2&rotation=0&showTitle=false&size=198221&status=done&style=none&taskId=u88cd7c27-4850-4b02-9c6f-504b4456a94&title=&width=544)
但是在 Java 领域模块化技术已经发展了20年了，为什么这里的模块化技术能够在蚂蚁内部规模化落地，这里的核心原因是

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695139240123-37a5b5e7-38ee-4b33-b84b-4d58e8b9f371.png#clientId=u71a0730f-fb54-4&from=paste&height=596&id=u7b5e0183&originHeight=1192&originWidth=2954&originalType=binary&ratio=2&rotation=0&showTitle=false&size=587199&status=done&style=none&taskId=uc2ceea08-092e-4bfd-9566-d97ab3d3b74&title=&width=1477)
基于 SOFAArk 和 SpringContext Manager 的多模块能力，提供了低成本的使用方式。

#### 隔离方面

对于其他的模块化技术，从隔离角度来看，JPMS 和 Spring Modulith 的隔离是通过自定义的规则来做限制的，Spring Modulith 还需要在单元测试里执行 verify 来做校验，隔离能力比较弱且一定程度上是比较 tricky 的，对于存量应用使用来说也是有不小改造成本的，甚至说是存量应用无法改造。而 SOFAArk 和 OSGI 一样采用 ClassLoader 和 SpringContext 的方式进行配置与代码、bean与服务的隔离，对原生应用的启动模式完全保持一致。

#### 共享方面

SOFAArk 的隔离方式和 OSGI 是一致的，但是在共享方面 OSGI 和 JPMS、Spring Modulith 一样都需要在源模块和目标模块间定义导入导出列表或其他配置，这造成业务使用模块需要强感知和理解多模块的技术，使用成本是比较高的，而 SOFAArk 则定义了默认的类委托加载机制，和跨模块的 Bean 和服务发现机制，让业务不用改造的情况下能够使用多模块的能力。这里额外提下，为什么基于 SOFAArk 的多模块化技术能提供这些默认的能力，而做到低成本的使用呢？这里主要的原因是因为我们对模块做了角色的区分，区分出了基座与模块，在这个核心原因基础上也对低成本使用这块比较重视，做了重要的设计考量和取舍。具体有哪些设计和取舍，可以查看技术实现文章。

### 模块间通信

模块间通信主要依托 SpringContext Manager 的 Bean 与服务发现调用机制提供基础能力，!

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695171905613-2546f555-ff25-4a58-81aa-02d77bfb2b1d.png#clientId=ud7a2066a-ba29-4&from=paste&height=307&id=uc8826222&originHeight=724&originWidth=1048&originalType=binary&ratio=2&rotation=0&showTitle=false&size=202275&status=done&style=none&taskId=u537670c5-c728-487a-9710-80986ce8532&title=&width=444)
### 模块的可演进

回顾背景里提到的几大问题，可以看到通过模块化架构的隔离与共享能力，可以解决掉基础设施复杂、多人协作阻塞、资源与长期维护成本高的问题，但还有微服务拆分与业务敏捷度不一致的问题未解决。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695175219841-965cd163-a4bd-4cd0-b828-c620b29c0ffc.png#clientId=uaaa65411-0843-4&from=paste&height=185&id=ua68375b7&originHeight=894&originWidth=2906&originalType=binary&ratio=2&rotation=0&showTitle=false&size=417377&status=done&style=none&taskId=ud94c9602-7cd1-4bcb-8654-39fe8938d37&title=&width=602)
在这里我们通过降低微服务拆分的成本来解决，那么怎么降低微服务拆分成本呢？这里主要是在单体架构和微服务架构之间增加模块化架构

- 模块不占资源所以拆分没有资源成本
- 模块不包含业务公共部分和框架、中间件部分，所以模块没有长期的 sdk 升级维护成本
- 模块自身也是 SpringBoot，我们提供工具辅助单体应用低成本拆分成模块应用
- 模块具备灵活部署能力，可以合并部署在一个 JVM 内，也可拆除独立部署，这样模块可以按需低成本演进成微服务或回退会单体应用模式
![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695175141130-d3b55e17-70c3-4e7c-aeef-2e071f89ada8.png#clientId=uaaa65411-0843-4&from=paste&height=316&id=u589ef06e&originHeight=632&originWidth=3642&originalType=binary&ratio=2&rotation=0&showTitle=false&size=139102&status=done&style=none&taskId=uf9f96d68-7456-4af5-951e-d9351092988&title=&width=1821)
图中的箭头是双向的，如果当前微服务拆分过多，也可以将多个微服务低成本改造成模块合并部署在一个 JVM 内。所以这里的本质是通过在单体架构和微服务架构之间增加一个可以双向过渡的模块化架构，降低改造成本的同时，也让开发者可以根据业务发展按需演进或回退。这样可以把微服务的这几个问题解决掉

### 模块化架构的优势

模块化架构的优势主要集中在这四点：快、省、灵活部署、可演进，

与传统应用对比数据如下，可以看到在研发阶段、部署阶段、运行阶段都得到了10倍以上的提升效果。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695180250909-f5eca1b3-c416-4bac-9732-549a9bed8b87.png#clientId=ueb39d37f-ca7b-4&from=paste&height=261&id=u8907b613&originHeight=522&originWidth=2838&originalType=binary&ratio=2&rotation=0&showTitle=false&size=219589&status=done&style=none&taskId=ua4b2bd1b-a75f-4945-abce-68826a43377&title=&width=1419)
## 平台架构

只有应用架构还不够，需要从研发阶段到运维阶段到运行阶段都提供完整的配套能力，才能让模块化应用架构的优势真正触达到研发人员。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695182073971-12b14861-b6fa-470c-a140-737d40ff0b3e.png#clientId=u9014394b-3a6a-4&from=paste&height=192&id=ub53430b2&originHeight=384&originWidth=1720&originalType=binary&ratio=2&rotation=0&showTitle=false&size=79335&status=done&style=none&taskId=u1eb2a897-c2ca-437f-8d56-7067be175e2&title=&width=860)
在研发阶段，需要提供基座接入能力，模块创建能力，更重要的是模块的本地快速构建与联调能力；在运维阶段，提供快速的模块发布能力，在模块发布基础上提供 A/B 测试和秒级扩缩容能力；在运行阶段，提供模块的可靠性能力，模块可观测、流量精细化控制、调度和伸缩能力。

![](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/149473/1695182125970-f9529014-0386-4922-b8eb-5d0c82a7e5d8.png#clientId=u9014394b-3a6a-4&from=paste&height=370&id=uf365ffd8&originHeight=740&originWidth=2096&originalType=binary&ratio=2&rotation=0&showTitle=false&size=242246&status=done&style=none&taskId=uf07de18d-931e-4ffd-9540-d4be10de3e7&title=&width=1048)
组件视图

在整个平台里，需要四个组件：

- 研发工具 Arkctl, 提供模块创建、快速联调测试等能力
- 运行组件 SOFAArk, Arklet，提供模块运维、模块生命周期管理，多模块运行环境
- 控制面组件 ModuleController
- ModuleDeployment 提供模块发布与运维能力
- ModuleScheduler 提供模块调度能力
- ModuleScaler 提供模块伸缩能力





# 参考资料

https://koupleless.io/docs/introduction/intro-and-scenario/

* any list
{:toc}