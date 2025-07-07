---
layout: post
title:  maven 发布到中央仓库之持续集成-03
date:  2017-09-28 18:52:13 +0800
categories: [Maven]
tags: [maven, bash, bat, sh]
published: true
---

# maven 系列

[maven-01-发布到中央仓库概览](https://houbb.github.io/2017/09/28/jar-to-maven-01-overview)

[maven-02-发布到中央仓库常用脚本](https://houbb.github.io/2017/09/28/jar-to-maven-02-script)

[maven-03-发布到中央仓库之持续集成](https://houbb.github.io/2017/09/28/jar-to-maven-03-ci)

[maven-04-发布到中央仓库之 Ignore Licence](https://houbb.github.io/2017/09/28/jar-to-maven-04-ignore-licence)

[maven-05-maven 配置进阶学习](https://houbb.github.io/2017/09/28/jar-to-maven-05-maven-advanced)

[maven-06-maven 中央仓库 OSSRH 停止服务，Central Publishing Portal 迁移实战](https://houbb.github.io/2017/09/28/jar-to-maven-06-end-of-life)

# 常见网站

说明：如何进行项目的持续集成+测试覆盖率

## Travis-CI

[https://www.travis-ci.org](https://www.travis-ci.org) 直接添加此项目

## Coveralls

- 添加项目

[https://coveralls.io/repos/new](https://coveralls.io/repos/new) 直接添加项目

- 生成密匙

```
travis encrypt COVERALLS_TOKEN=${your_repo_token}
```

- 添加到文件 

```
travis encrypt COVERALLS_TOKEN=${your_repo_token} --add
```

# 常见脚本

## .coveralls.yml

```yml
service_name: travis-ci
```

## .travis.yml

```
language: java
jdk:
- oraclejdk7
install: mvn install -DskipTests=true -Dmaven.javadoc.skip=true
script: mvn test
after_success:
- mvn clean cobertura:cobertura coveralls:report
```

* any list
{:toc}












 

