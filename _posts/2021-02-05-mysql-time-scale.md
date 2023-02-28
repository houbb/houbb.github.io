---
layout: post
title:  mysql 时间精度精确到毫秒实现方案
date:  2021-1-25 16:52:15 +0800
categories: [SQL]
tags: [sql, database, mysql, sh]
published: true
---

# 业务背景

有时候并发相对较高的时候，需要数据库的时间精确到毫秒才能更好的处理。


# 实现方式

修改 mysql 的字段从 datetime 到 datetime(3)，这个时候就会精确到毫秒。

默认值的话从 timstamp 也需要同步调整为 timstamp(3)。

# 解析方式


对应的代码一般时间都是 Date 类型，不过这样存在一个问题。

如果是 json 可能直接反序列化失败。

所以可以把对应的字段调整为 String，或者指定 `@JsonField(format='')` 指定对应的格式化。

# 注意点

经过实战，发现推送过来的字符串实际上是精确到 .SSSSSS 后面较多位的。

所以处理的时候建议采用字符串。

```java
if(str.length == 19) {
    str += ".000";
}

if(str.length >= 23) {
    str = str.substring(0,23);
}

// 创建为 date
Date date = DateUtil.parseDate(str, "yyyy-MM-dd HH:mm:ss.SSS");
return date.getTime();
```




# 参考资料



* any list
{:toc}