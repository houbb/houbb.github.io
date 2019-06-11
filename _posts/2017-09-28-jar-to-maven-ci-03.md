---
layout: post
title:  maven 发布到中央仓库之持续集成-03
date:  2017-09-28 18:52:13 +0800
categories: [Maven]
tags: [maven, bash, bat, sh]
published: true
---

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












 

