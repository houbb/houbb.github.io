---
layout: post
title:  SOFABoot-07-版本查看
date:  2022-07-09 09:22:02 +0800
categories: [SOFA]
tags: [sofa, sofastack, sh]
published: true
---

## 前言

大家好，我是老马。

sofastack 其实出来很久了，第一次应该是在 2022 年左右开始关注，但是一直没有深入研究。

最近想学习一下 SOFA 对于生态的设计和思考。

## sofaboot 系列

[SOFABoot-00-sofaboot 概览](https://houbb.github.io/2022/07/09/sofastack-sofaboot-00-overview)

[SOFABoot-01-蚂蚁金服开源的 sofaboot 是什么黑科技？](https://houbb.github.io/2022/07/09/sofastack-sofaboot-01-intro)

[SOFABoot-02-模块化隔离方案](https://houbb.github.io/2022/07/09/sofastack-sofaboot-02-module-iosolation)

[SOFABoot-03-sofaboot 介绍](https://houbb.github.io/2022/07/09/sofastack-sofaboot-03-intro)

[SOFABoot-04-快速开始](https://houbb.github.io/2022/07/09/sofastack-sofaboot-04-quick-start)

[SOFABoot-05-依赖管理](https://houbb.github.io/2022/07/09/sofastack-sofaboot-05-depency-solve)

[SOFABoot-06-健康检查](https://houbb.github.io/2022/07/09/sofastack-sofaboot-06-health-check)

[SOFABoot-07-版本查看](https://houbb.github.io/2022/07/09/sofastack-sofaboot-07-version)

[SOFABoot-08-启动加速](https://houbb.github.io/2022/07/09/sofastack-sofaboot-08-speed-up)

[SOFABoot-09-模块隔离](https://houbb.github.io/2022/07/09/sofastack-sofaboot-09-module-isolation)

[SOFABoot-10-聊一聊 sofatboot 的十个问题](https://houbb.github.io/2022/07/09/sofastack-sofaboot-10-chat-10-q)

# 版本查看

通过 SOFABoot，我们可以直接在浏览器中就可以查看 SOFA 中间件的版本等详细信息。

# 引入 SOFABoot Infra 依赖

要在 SOFABoot 中直接通过浏览器查看 SOFA 中间件的版本信息，只需要在 Maven 依赖中增加如下的内容即可：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>infra-sofa-boot-starter</artifactId>
</dependency>
```

# 版本信息查看

在应用启动成功后，可以在浏览器中输入 http://localhost:8080/sofaboot/versions 查看 SOFA 中间件的版本信息，如：

```js
[
  {
    GroupId: "com.alipay.sofa",
    Doc-Url: "https://github.com/sofastack/sofa-boot",
    ArtifactId: "infra-sofa-boot-starter",
    Built-Time: "2018-04-05T20:55:22+0800",
    Commit-Time: "2018-04-05T20:54:26+0800",
    Commit-Id: "049bf890bb468aafe6a3e07b77df45c831076996",
    Version: "2.4.0"
  }
]
```

注: 在 SOFABoot 3.x 中调整了 endpoint 路径，sofaboot/versions 更改为 actuator/versions

# 备注

个人可以写一个 version 的小工具。

（1）统一探活

（2）版本号，最后的发布时间

（3）查看当前应用的一些基本依赖信息。

# 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

https://www.sofastack.tech/projects/sofa-boot/view-versions/

* any list
{:toc}