---
layout: post
title:  windows 命令行设置 
date:  2022-07-08 09:22:02 +0800
categories: [DEV]
tags: [dev, sh]
published: true
---


# windows 设置 java_home


## windows

```
set JAVA_HOME=D:\Program Files\Java\jdk1.8.0_192\
set PATH=%JAVA_HOME%\bin;%PATH%
```

注意这里没有引号。
这样就不需要在我的电脑属性中修改java_home了，以及重启命令行了。
对于程序会用到多个jre 会比较有用。


## 设置 maven

```
set MAVEN_HOME=D:\tool\maven\apache-maven-3.5.4\
set PATH=%MAVEN_HOME%\bin;%PATH%
```

## linux

linux 修改 JAVA_HOME如下
export JAVA_HOME=jrepath
export PATH=$JAVA_HOME\bin;$PATH

如果需要永久修改 则 在.bashrc文件中加入上面的两句话就可以了。


ps： 这种命令设置应该只是临时的。

# 参考资料

https://www.cnblogs.com/wxiaona/p/5867685.html

[国内有哪些比较好的 CDN？](https://www.zhihu.com/question/20536932)

* any list
{:toc}