---
layout: post
title:  For Better Code
date:  2018-1-9 10:30:26 +0800
categories: [Project]
tags: [project, stay hungry]
published: true
---

# 追求代码质量

> [追求代码质量](https://www.ibm.com/developerworks/cn/java/j-cq/)


# 不要被覆盖报告所迷惑

> [不要被覆盖报告所迷惑](https://www.ibm.com/developerworks/cn/java/j-cq01316/)

个人觉得这个更像是清单报告，而不是什么质量保证。

- 覆盖率

100% 的测试覆盖率，也无法保证没有 BUG，只能说是更少的 BUG。


# FIT

> [决心采用 FIT](https://www.ibm.com/developerworks/cn/java/j-cq02286/)

[FIT](http://fit.c2.com/) 是一个测试平台，
可以帮助需求编写人员和把需求变成可执行代码的人员之间的沟通。

FIT 的优美之处在于，它让组织的消费者或业务端能够尽早参与测试过程（例如，在开发期间）。

JUnit 的力量在于编码过程中的单元测试，而 FIT 是更高层次的测试工具，用来判断规划的需求实现的正确性。


# 监视圈复杂度

> [监视圈复杂度](https://www.ibm.com/developerworks/cn/java/j-cq03316/index.html?ca=drs-)


## 概念

**监视圈复杂度**是在我前面提到的那些研究期间开创的，它可以精确地测量路径复杂度。

通过利用某一方法路由不同的路径，这一基于整数的度量可适当地描述方法复杂度。

实际上，过去几年的各种研究已经确定：圈复杂度（或 CC）大于 10 的方法存在很大的出错风险。

因为 CC 通过某一方法来表示路径，这是用来确定某一方法到达 100% 的覆盖率将需要多少测试用例的一个好方法。

## 分而治之

在面对指示高圈复杂度值的报告时，第一个行动是检验所有相应测试的存在。

如果存在一些测试，测试的数量是多少？

除了极少数代码库以外，几乎所有代码库实际上都有多个测试用例用于某个方法（实际上，为一个方法编写如此多的测试用例可能会花费很长时间）。

但即使是很小的一点进步，它也是减少方法中存在缺陷风险的一个伟大开始。


# 软件架构的代码质量

> [软件架构的代码质量](https://www.ibm.com/developerworks/cn/java/j-cq04256/index.html)

## 传入耦合( CA )

![2018-01-09-better-code-ComponentDiagram-excep.png](https://raw.githubusercontent.com/houbb/resource/master/img/project/better-code/2018-01-09-better-code-ComponentDiagram-excep.png)

如图所示，exception 包具有一个值为 4 的传入耦合（或者叫做 Ca），这并非是件坏事。

异常层次结构很少会出现很大的改变。监视 exception 包的传入耦合是个好主意，然而，由于彻底改变了这个包中的行为或契约，所以将引起它的四个依赖包全都出现连锁反应。

## 传出耦合( CE )

![2018-01-09-better-code-ComponentDiagram-efferentcoup.png](https://raw.githubusercontent.com/houbb/resource/master/img/project/better-code/2018-01-09-better-code-ComponentDiagram-efferentcoup.png)

`com.acme.ascp.dao` 包完全是具体的；因此它的抽象性为 0。

这表示其传出耦合包含 `com.acme.ascp.dao` 的组件自己会变得脆弱，因为 `com.acme.ascp.dao` 包与 3 个附加的包具有传出耦合。

如果它们中的一个（比如说 `com.acme.ascp.util`）发生更改，将会在 `com.acme.ascp.dao` 中发生连锁反应。

因为 dao 无法通过接口或抽象类隐藏注入细节，所以任何更改都可能影响它的依赖组件。




* any list
{:toc}

