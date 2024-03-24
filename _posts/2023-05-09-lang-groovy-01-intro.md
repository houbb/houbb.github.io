---
layout: post
title: grovvy-00-intro 入门介绍 
date:  2023-05-09 +0800
categories: [Lang]
tags: [grovvy, lang, sh]
published: true
---

# Groovy

[Apache Groovy](http://groovy-lang.org/) is a powerful, optionally typed and dynamic language, with static-typing and static
compilation capabilities, for the Java platform aimed at improving developer productivity thanks to a concise, familiar and easy to learn syntax.

# Install Groovy

[blog zh_CN](http://www.jianshu.com/p/94aabdfcdfc5)


- Install in Mac


```
$ brew install groovy
```

如下

```
Updating Homebrew...
==> Using the sandbox
==> Downloading https://dl.bintray.com/groovy/maven/apache-groovy-binary-2.4.8.zip
######################################################################## 100.0%
==> Caveats
You should set GROOVY_HOME:
  export GROOVY_HOME=/usr/local/opt/groovy/libexec
==> Summary
🍺  /usr/local/Cellar/groovy/2.4.8: 64 files, 27.6M, built in 5 minutes 54 seconds
```


- Test version

```
$ groovy -verson

Groovy Version: 2.4.8 JVM: 1.8.0_91 Vendor: Oracle Corporation OS: Mac OS X
```



# Quick Start


- Create new Project

选择 groovy sdk 如下：

可以使用 ```cmd+shift+g``` 输入 ```/usr/local/opt/groovy/libexec``` 直接打开SDK的文件。如下：

![groovy sdk](https://raw.githubusercontent.com/houbb/resource/master/img/groovy/2017-03-01-groovy-sdk.png)



- Hello World

注意： 

1. groovy 不用以分号结尾。所以换行会导致代码解析不同。

```groovy
package com.ryo.groovy.learn.hello

/**
 * Created by houbinbin on 17/3/1.
 */
class HelloWorld {

    static void main(args){
        println "Hello World!"
    }

}
```


run result

```
Hello World!

Process finished with exit code 0
```





* any list
{:toc}