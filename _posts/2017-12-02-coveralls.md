---
layout: post
title:  Coveralls
date:  2017-12-02 22:54:35 +0800
categories: [CI]
tags: [ci, test]
published: true
---

# Coveralls

[Coveralls](https://coveralls.io/) DELIVER BETTER CODE.


> [前端开源项目持续集成三剑客](http://efe.baidu.com/blog/front-end-continuous-integration-tools/)

 
# Quick Start

- login 

[sign-up](https://coveralls.io/sign-up), 使用 github 登录。

直接会进行对应授权。


- add more repos

添加需要覆盖的代码项目。 [ADD SOME REPOS](https://coveralls.io/repos/new)


- add `.coveralls.yml`

如果使用 [travis-ci](https://houbb.github.io/2017/12/02/travis-ci)，则添加内容如下:

```
service_name: travis-ci
```

- pom.xml

制定一个插件用于生成对应的测试报告。

```xml
<!--mvn cobertura:cobertura coveralls:report -DrepoToken=yourcoverallsprojectrepositorytoken-->
<plugin>
    <groupId>org.eluder.coveralls</groupId>
    <artifactId>coveralls-maven-plugin</artifactId>
    <version>4.3.0</version>
</plugin>

<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>cobertura-maven-plugin</artifactId>
    <version>2.7</version>
    <configuration>
        <format>xml</format>
        <maxmem>256m</maxmem>
        <!-- aggregated reports for multi-module projects -->
        <aggregate>true</aggregate>
        <instrumentation>
            <excludes>
                <exclude>**/*Test.class</exclude>
                <exclude>**/HelpMojo.class</exclude>
                <exclude>**/*Vo.class</exclude>
            </excludes>
        </instrumentation>
    </configuration>
</plugin>
```

详情参考：

> [coveralls-maven-plugin](https://github.com/trautonen/coveralls-maven-plugin)

**注意**：不要将你的 repoToken 上传到 github，这样任何人都可以提交你的覆盖率。

你在本地执行

```
mvn cobertura:cobertura coveralls:report -DrepoToken=yourcoverallsprojectrepositorytoken
```

即可将测试报告上传到 [coveralls](coveralls)。

和 CI 集成上面也有说，但是尝试似乎没效果。在 `.travis.yml` 中添加。

```
after_success:
  - mvn clean cobertura:cobertura coveralls:report
```

- 添加对应的徽章

如：

```
[![Coverage Status](https://coveralls.io/repos/github/houbb/gen-maven-plugin/badge.svg?branch=master)](https://coveralls.io/github/houbb/gen-maven-plugin?branch=master)
```

[![Coverage Status](https://coveralls.io/repos/github/houbb/gen-maven-plugin/badge.svg?branch=master)](https://coveralls.io/github/houbb/gen-maven-plugin?branch=master)

* any list
{:toc}

