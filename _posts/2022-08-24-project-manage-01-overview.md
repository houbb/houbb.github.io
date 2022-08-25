---
layout: post
title:  项目管理-前端项目如何保证项目质量？
date:  2022-08-24 09:22:02 +0800
categories: [Project]
tags: [project, web, sh]
published: true
---

# 如何保证前端项目代码质量


# 什么是代码本身的质量?

代码本身的质量: 包括复杂度, 重复率, 代码风格等。

复杂度: 项目代码量，模块大小，耦合度等重复率: 重复出现的代码区块占比，通常要求在5%以下(借助平台化工具如Sonar)代码风格: 代码风格是否统一(动态语言代码如JS, Python风格不受约束)

# 代码质量下降恶性循环

## 常见的代码质量下降的原因:

1. 破罐破摔: 在烂代码上迭代代码罪恶感比较小

2. 传染性: 不在意代码质量, 只关注业务的产出

3. 心有余而力不足

## 常见的导致恶性循环的场景:

### 业务压力太大

烂代码产生的常见原因是业务压力大，导致没有时间或意愿讲究代码质量。

因为向业务压力妥协而生产烂代码之后，开发效率会随之下降，进而导致业务压力更大，形成一种典型的恶性循环。

![业务压力太大](https://pic1.zhimg.com/80/v2-6b9952b7b92e6ce0935b157df4e70e00_720w.jpg)

### 通过增加人力解决业务压力

为了应对业务压力，常见的做法就是向项目中增加人力，但是单纯地增加人力的话，会因为风格不一致、沟通成本上升等原因导致烂代码更多。

![通过增加人力解决业务压力](https://pic1.zhimg.com/80/v2-746a06d4bdf744025dfe3f2178978a64_720w.jpg)

那么我们应该如何解决呢?

![how?](https://pic4.zhimg.com/80/v2-05904b9c9c8f16c64df14c49de6dedcf_720w.jpg)

这是一个长期坚持的过程。

# 代码质量管控四个阶段

## 规范化

建立代码规范与Code Review制度

[airbnb](https://github.com/airbnb/javascript)

[standard](https://github.com/standard/standard)

[node-style-guide](https://github.com/felixge/node-style-guide)

[google javascript style guide](https://google.github.io/styleguide/jsguide.html)

[google html/css style guide](https://google.github.io/styleguide/htmlcssguide.html)

[Vue风格指南](https://cn.vuejs.org/v2/style-guide/)

我觉得统一项目目录结构也是规范化的一种(比如我们用脚手架创建项目模板), 一个规范化的目录结构大大降低新人的上手成本。

## 自动化

使用工具(linters)自动检查代码质量。

![自动化](https://pic1.zhimg.com/80/v2-1ebc4dddff2431b0dbd7501465cdd354_720w.jpg)

## 流程化

将代码质量检查与代码流动过程绑定。

![流程化](https://pic2.zhimg.com/80/v2-a349e42c477019a6ad757bcf6a158c55_720w.png)

质量检查与代码流动绑定后的效果：

![效果](https://pic2.zhimg.com/80/v2-a2f7994262f8f57434e1099c467aabf1_720w.jpg)

备注:

1. 编辑时候: 通过编辑器插件, 实时查看质量检查

2. 可以利用CI(Jekins/Travis)把构建发布过程搬到线上, 先跑代码扫描, 测试代码等, 然后没有错误再进行build, build成功通过ssh推到服务器。


## 中心化

以团队整体为视角，集中管理代码规范，并实现质量状况透明化。

当团队规模越来越大，项目越来越多时，代码质量管控就会面临以下问题：

- 不同项目使用的代码规范不一样

- 部分项目由于放松要求，没有接入质量检查，或者存在大量未修复的缺陷

- 无法从团队整体层面上体现各个项目的质量状况对比

为了应对以上问题，需要建设中心化的代码质量管控体系，要点包括：

代码规范统一管理。通过脚手架命令垂直管理代码扫描配置规则集, 自动安装，不在本地写规则。一个团队、一类项目、一套规则。

## why

代码质量是团队技术水平和管理水平的直接体现。 

看代码的时间远远多于写代码的时间。

# how

## EditorConfig

EditorConfig在多人协作开发项目时候, 支持跨编辑器, IDE来支持维护一致的编码样式(文件格式)。

VSCode插件EditorConfig for VS Code提供一键生成.editorconfig。

查看实例。

## TypeScript

官网介绍。

## Git Hooks

Git能在特定的重要动作发生时触发自定义脚本。 

有两组这样的钩子：客户端的和服务器端的。 

客户端钩子由诸如提交和合并这样的操作所调用，而服务器端钩子作用于诸如接收被推送的提交这样的联网操作, 我们目前使用的大多数是客户端钩子。

通过husky集成git hooks, 如果对git想有更全面的理解推荐阅读GIt文档。

husky会安装一系列的git hook到项目的.git/hook目录中。

下面两张图分别对比没有安装husky与安装了husky的git目录区别:

当你用 git init 初始化一个新版本库时，Git 默认会在这个目录中放置一些示例脚本(.sample结尾的文件)。

### pre-commit

pre-commit 钩子在键入提交信息前运行。 它用于检查即将提交的快照，你可以利用该钩子，来检查代码风格是否一致（运行类似 lint 的程序。

lint-staged: 可以获取所有被提交的文件并执行配置好的任务命令,各种lint校验工具可以配置好lint-staged任务中。
    
prettier: 可以配置到lint-staged中, 实现自动格式化编码风格。

stylelint

eslint

tslint

eslint-plugin-vue: Vue.js官方推荐的lint工具

关于为什么选择prettier, 以及eslint 与prettier区别?。

关于prettier配置。 关于stylelint配置。 

关于eslint配置。

### commit-msg

commitlint。

commit-msg 可以用来在提交通过前验证项目状态或提交信息, 使用该钩子来核对提交信息是否遵循指定的模板。

关于git hooks在package.json配置:

# 测试

## unittest

[Jest](https://jestjs.io/)

[Mocha](https://mochajs.org/)

## e2e

[Nightwatch](http://nightwatchjs.org/)
      
[Cypress](https://www.cypress.io/)

## CHANGELOG

更新日志, standard-version,如果是工具类的话肯定需要自动生成CHANGELOG，以及自动发布脚本，后续我会分享一篇如何写一个开源的前端脚手架。

## Code Review

- 阻塞式

当我们提交代码时候，以PR方式 + 邀请指定相关人进行code review，只有当大家都通过后再有相关人员进行merge。

此外在正式发版前还需要进行线下评审。


# 小结

多思考。

# 参考资料

https://zhuanlan.zhihu.com/p/82546272

https://blog.csdn.net/qq_24073885/article/details/121916084

https://segmentfault.com/a/1190000022612208

http://www.javashuo.com/article/p-hwsjdjhx-da.html

http://www.javashuo.com/article/p-wrzomaxs-ha.html

https://www.infoq.cn/article/CcSVZrtPrycLIvVi61v7

https://www.cnblogs.com/zhouyangla/p/9660310.html

https://cloud.tencent.com/developer/news/674872

https://blog.csdn.net/iceggy/article/details/122496018

* any list
{:toc}