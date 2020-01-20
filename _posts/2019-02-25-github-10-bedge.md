---
layout: post
title: Github-10-徽章收集
date:  2019-2-25 14:33:11 +0800
categories: [Tool]
tags: [github, pic, sh]
published: true
---

# 常见徽章

- maven 版本

- 协议徽章

- Travis-CI 状态

- 测试覆盖率

- sonar 质量检测


# Travis-CI 状态报错

## 原始文件

```yml
language: java
jdk:
- oraclejdk8
install: mvn install -DskipTests=true -Dmaven.javadoc.skip=true
script: mvn test
after_success:
- mvn clean cobertura:cobertura coveralls:report
```

## 报错信息

```
Ignoring license option: BCL -- using GPLv2+CE by default
install-jdk.sh 2020-01-14
Expected feature release number in range of 9 to 15, but got: 8
The command "~/bin/install-jdk.sh --target "/home/travis/oraclejdk8" --workspace "/home/travis/.cache/install-jdk" --feature "8" --license "BCL"" failed and exited with 3 during .
```

## 修复方案

这里应该是 jdk8 的版权等问题导致的，直接修改使用 openjdk8 即可：

```yml
language: java
jdk:
- openjdk8
install: mvn install -DskipTests=true -Dmaven.javadoc.skip=true
script: mvn test
after_success:
- mvn clean cobertura:cobertura coveralls:report
```


# 参考资料

## 构建报错

[expected-feature-release-number-in-range-of-9-to-12-but-got-8-installing-oraclejdk8](https://travis-ci.community/t/expected-feature-release-number-in-range-of-9-to-12-but-got-8-installing-oraclejdk8/1345/8)


[Travis-CI构建Java项目:指定jdk为oraclejdk8时，发生错误分析及解决方案](https://blog.csdn.net/weixin_41287260/article/details/102505427)

[VScode Picgo](https://mp.weixin.qq.com/s/2HnFrcwxHr5g2VvRB2N_JQ)

* any list
{:toc}