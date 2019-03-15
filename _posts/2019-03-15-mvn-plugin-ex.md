---
layout: post
title: Maven Plugin 异常
date:  2019-3-15 09:02:21 +0800
categories: [Exception]
tags: [exception, maven, mvn, sh]
published: true
---

# 情景引入

手写了一个插件，以前好好地，后来加了些功能，就无法启动了

## 报错信息

```
[ERROR] Failed to execute goal com.github.houbb:idoc-core:0.0.3-SNAPSHOT:idoc (default-cli) on project idoc-test: Execution default-cli of goal com.github.houbb:idoc-core:0.0.3-SNAPSHOT:idoc failed: An API incompatibility was encountered while executing com.github.houbb:idoc-core:0.0.3-SNAPSHOT:idoc: java.lang.ExceptionInInitializerError: null
[ERROR] -----------------------------------------------------
[ERROR] realm =    plugin>com.github.houbb:idoc-core:0.0.3-SNAPSHOT
.....
.....
.....
[ERROR] Number of foreign imports: 1
[ERROR] import: Entry[import  from realm ClassRealm[maven.api, parent: null]]
[ERROR] 
[ERROR] -----------------------------------------------------
[ERROR] : NullPointerException
[ERROR] -> [Help 1]
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR] 
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/PluginContainerException
```


# 分析过程

## 版本

一开始以为是版本问题

网上也查询了相关的资料，说是 maven-plugin 的依赖冲突。

排查了一遍，发现不是。

## 内部异常

后来想起，命令执行是可以 debug 的。

因为用的 idea，直接点击的，忘记了。

- 执行

```
mvn com.github.houbb:idoc-core:0.0.3-SNAPSHOT:idoc -e
```

可以查看到对应得异常信息。

后来发现是内部的异常导致的。

解决排查即可。

# 参考资料 



* any list
{:toc}