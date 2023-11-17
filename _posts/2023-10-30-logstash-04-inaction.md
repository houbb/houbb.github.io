---
layout: post
title: logstash java 实现 hangout-04-logstash grok kv filters 解析实战笔记
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
---


# 实战笔记

## app.yml

解析的 yml 配置文件如下：

```yml
inputs:
  - Stdin:
      codec: plain
      hostname: true # if add hostname to event; default false
      type: stdin1

filters:
  - Filters:
      id: 'f1'
      if:
        - '<#if message??>true</#if>'  # 要求必须有信息
        - '<#if message?contains("mylogging=>")>true<#elseif message?contains("mylogging")>true</#if>' #要求必须包含 mylogging 关键词


      filters:
        - Add:
            fields:
              testField1: "xxxxxxxxxxxxxxxxxx" # 添加一个测试字段

  - Grok:
      match:
        - '^%{TIMESTAMP_ISO8601:time} \[%{DATA:kvsource}\] \[%{WORD:logLevel}\] \[%{DATA:className}\] -- %{GREEDYDATA:content}$'
      remove_fields: ['message'] # 移除 message 
      tag_on_failure: 'grokFail' # do not add tags; deafult "grokfail"

outputs:
  - Stdout: { }
```

## 对应的日志测试

我们输入一条日志：

```
2023-11-17 10:45:09.167 [app=test&tid=1313678624044a4a&sid=881dec04b6719878&sidParent=d1bc9674dabd9a84&entryPoint=com.ryo.Main#main] [INFO] [com.ryo.Main] -- mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{}
```

输出：

```
{hostname=d, @timestamp=2023-11-17T11:29:26.693+08:00, logLevel=INFO, className=com.ryo.Main, time=2023-11-17 10:45:09.167, kvsource=app=test&tid=1313678624044a4a&sid=881dec04b6719878&sidParent=d1bc9674dabd9a84&entryPoint=com.ryo.Main#main, type=stdin1, content=mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{}}
```

多出的哪些属性，主要是我们在 grok 中添加的。

## grok 基本处理 

match 中的核心一句：

```yml
- '^%{TIMESTAMP_ISO8601:time} \[%{DATA:kvsource}\] \[%{WORD:logLevel}\] \[%{DATA:className}\] -- %{GREEDYDATA:content}$'
```

这个语句是我们要求实现的：

```
2023-11-17 10:45:09.167 [app=test&tid=1&sid=1&sidParent=1&entryPoint=com.ryo.Main#main] [INFO] [com.ryo.Main] -- mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{}
```

如何通过logstash 的 grok 配置，要求如下：

```
1. 2023-11-17 10:45:09.167 解析为时间 time
2. [app=test&tid=1313678624044a4a&sid=881dec04b6719878&sidParent=d1bc9674dabd9a84&entryPoint=com.ryo.Main#main] 解析为 kvsource
3. [INFO] 解析为对应的日志级别 logLevel
4. [com.ryo.Main] 解析为 className
5. -- mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{} 解析为 content
```

最后的结果换行展示如下：

```
hostname=d 
@timestamp=2023-11-17T11:29:26.693+08:00 
logLevel=INFO 
className=com.ryo.Main 
time=2023-11-17 10:45:09.167 
kvsource=app=test&tid=1313678624044a4a&sid=881dec04b6719878&sidParent=d1bc9674dabd9a84&entryPoint=com.ryo.Main#main 
type=stdin1 
content=mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{}}
```


### Q: 解释一下 match 表达式

```yml
- '^%{TIMESTAMP_ISO8601:time} \[%{DATA:kvsource}\] \[%{WORD:logLevel}\] \[%{DATA:className}\] -- %{GREEDYDATA:content}$'
```

这个表达式具体什么意思？

这个 grok 表达式可以匹配以下格式的日志记录：

```
2023-11-17T13:42:24.109+08:00 [app=test, sidParent=35af473fb2fce1f2, entryPoint=com.ryo.Main#main, tid=4a523d52f312a3ed, sid=5d9d40f09f091b7a] [INFO] [com.ryo.Main] -- mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{"request":"request","response":"result"}
```

这个表达式首先使用  `TIMESTAMP_ISO8601`  正则表达式匹配时间字段，然后使用  `DATA`  正则表达式匹配 kvsource 字段，最后使用  `GREEDYDATA`  正则表达式匹配 content 字段。

1) `TIMESTAMP_ISO8601`  正则表达式可以匹配以下格式的日期时间字符串：

```
YYYY-MM-DDTHH:MM:SS.SSSZ
```

2)  `DATA`  正则表达式可以匹配以下格式的字符串： `[^\s]+`

3）`GREEDYDATA`  正则表达式可以匹配以下格式的字符串：`.*`

因此，这个 grok 表达式可以匹配所有格式为  `YYYY-MM-DDTHH:MM:SS.SSSZ [DATA] [WORD] [DATA] -- GREEDYDATA`  的日志记录。

4)  `WORD`  匹配一个单词，也就是一个由字母和数字组成的字符串。

在 logstash 中， `WORD`  通常用于匹配日志记录中的关键字。

例如，在上面提到的 grok 表达式中， `WORD`  匹配了  `INFO`  这个关键字。


### Q1: GREEDYDATA 和 DATA 什么区别？greeydata 是匹配后面的所有的意思吗？

`GREEDYDATA`  匹配后面的所有内容，而  `DATA`  匹配一个单词。
 
 例如，在上面提到的 grok 表达式中， `GREEDYDATA`  匹配了  `mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{"request":"request","response":"result"}`  这整个字符串，而  `DATA`  匹配了  `mylogging`  这个单词。

### Q2: \[%{DATA:kvsource}\] 两边为什么需要 \ 符号？

`\` 符号是转义符，它可以告诉 logstash 解析器，后面的字符是字符串而不是正则表达式。

例如，在上面提到的 grok 表达式中，\[%{DATA:kvsource}\] 表示匹配一个字符串，这个字符串的值是  `kvsource`  字段的值。

如果没有使用 \ 符号，logstash 解析器会将  `[%{DATA:kvsource}\]`  解释为一个正则表达式，这会导致日志记录无法正确解析。

### Q3: 中间的空格是任意数量吗？

`^%{TIMESTAMP_ISO8601:time} \[%{DATA:kvsource}\]$` 

这种写法 time 和 kvsource 之间的空格有数量限制吗？还是可以任意空格？

在上述的 grok 表达式中，time 和 kvsource 之间的空格是可以有任意数量的。

这意味着可以匹配任意数量的空格字符，包括零个空格字符、一个空格字符、多个连续空格字符等。

因此，该表达式可以匹配各种不同数量的空格字符。

ps: 我们可以实际测试一下，把输入的日志改成随便加几个空格？

```
2023-11-17 10:45:09.167       [app=test&tid=1&sid=1&sidParent=1&entryPoint=com.ryo.Main#main]    [INFO]     [com.ryo.Main] --    mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{}
```

对应的结果：

```
{hostname=d, @timestamp=2023-11-17T13:59:09.558+08:00, message=2023-11-17 10:45:09.167       [app=test&tid=1&sid=1&sidParent=1&entryPoint=com.ryo.Main#main]    [INFO]     [com.ryo.Main] --    mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{}, type=stdin1, logReqJson={}, tags=[grokFail]}
```

发现并不行，说明上面的回答是错的。

### Q4: 如何可以让每个之间的空格是任意数量？


1) 我们要知道任意空格的表达式怎么写？

要匹配任意位数的空格或制表符（tab），可以使用  `\s+` 。

这个正则表达式模式可以匹配一个或多个连续的空格或制表符。

例如，如果你想匹配任意数量的空格或制表符，可以使用  `\s+`  这个模式。

\s* 和 \s+ 都是匹配空白字符（空格、制表符、换行符等）的正则表达式模式。

但是，\s* 会匹配任意数量的空白字符，而 \s+ 只会匹配一个或多个空白字符。

2) 改写一下对应的 grok match 语句：

改成下面的样子：

```
- '^%{TIMESTAMP_ISO8601:time}\s*\[%{DATA:kvsource}\]\s*\[%{WORD:logLevel}\]\s*\[%{DATA:className}\]\s*-- %{GREEDYDATA:content}$'
```

然后再次用上面加了随意空格的输入测试，已经可以正确解析。

```
{hostname=d, @timestamp=2023-11-17T14:06:19.002+08:00, logLevel=INFO, logReqJson={}, className=com.ryo.Main, time=2023-11-17 10:45:09.167, kv={app=test, sidParent=1, entryPoint=com.ryo.Main#main, tid=1, sid=1}, type=stdin1, content=   mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{}, requestJson=xxxxxxxxxxxxxxxxxx}
```


## KV 内容的 split 拆分

`kvsource=app=test&tid=1313678624044a4a&sid=881dec04b6719878&sidParent=d1bc9674dabd9a84&entryPoint=com.ryo.Main#main` 

这个是一个通过 `&` 连接的 kv 信息，我们如何通过 hangout 内置组件拆分呢？

### 配置 

```yml
  - KV:
      # kvsource=app=test&tid=1313678624044a4a&sid=881dec04b6719878&sidParent=d1bc9674dabd9a84&entryPoint=com.ryo.Main#main
      source: kvsource # default message
      target: kv   # default null
      field_split: '&'  # default " "
      value_split: '='  # default "="
      trim: '\t\"'  #default null
      trimkey: '\"'  # default null
      tag_on_failure: "KVfail" # default "KVfail"
      remove_fields: [ 'kvsource' ]
```

### 测试效果

```
{hostname=d, testField1=xxxxxxxxxxxxxxxxxx, @timestamp=2023-11-17T11:49:33.885+08:00, logLevel=INFO, className=com.ryo.Main, time=2023-11-17 10:45:09.167, kv={app=test, sidParent=d1bc9674dabd9a84, entryPoint=com.ryo.Main#main, tid=1313678624044a4a, sid=881dec04b6719878}, type=stdin1, content=mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{}}
```

所有的信息都会被处理转换到 kv map 中。

## split 拿到最后一个 json

针对 

```
2023-11-17 13:41:50.620 [app=test&tid=4a523d52f312a3ed&sid=5d9d40f09f091b7a&sidParent=35af473fb2fce1f2&entryPoint=com.ryo.Main#main] [INFO] [com.ryo.Main] -- mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{"request":"request","response":"result"}
```

如何获取到最后的一个 json 信息？

### 配置

我们添加一个对应的 filters, 直接可以针对 split 然后处理：

```yml
  - Filters:
      id: 'f1'
      if:
        - '<#if message??>true</#if>'
        - '<#if message?contains("mylogging=>")>true<#elseif message?contains("mylogging")>true</#if>'
      filters:
        - Add:
            fields:
              logReqJson: '<#assign a=message?split("=>")>${a[2]}'
```

### 效果

```
hostname=d 
@timestamp=2023-11-17T13:42:24.109+08:00 
logLevel=INFO 
logReqJson={"request":"request","response":"result"} 
className=com.ryo.Main 
time=2023-11-17 13:41:50.620 
kv={app=test, sidParent=35af473fb2fce1f2, entryPoint=com.ryo.Main#main, tid=4a523d52f312a3ed, sid=5d9d40f09f091b7a} 
type=stdin1 
content=mylogging=>[SERVICE][cost=10 ms][com.ryo.Main#main-out]=>{"request":"request","response":"result"} 
requestJson=xxxxxxxxxxxxxxxxxx
```

# 参考资料

chat

* any list
{:toc}