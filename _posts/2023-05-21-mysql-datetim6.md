---
layout: post
title: mysql datetime(6) 介绍
date:  2023-05-21 +0800
categories: [SQL]
tags: [sql, mysql, sh]
published: true
---

今天看到项目中建表语句用到了 datetime(6)，以前没有使用过，这里记录一下。

# datetime(6)

datetime 支持的范围是 1000-01-01 00:00:00.000000 到 9999-12-31 23:59:59.999999。

datetime(n) 表示秒后面的6位微妙，保留/展示最高n位。

千万不要使用 timestamp 类型，因为它支持的时间范围是 1970-01-01 00:00:01.000000 到 2038-01-19 03:14:07.999999。范围太小了。

datetime 的取值可以是 0000-00-00 00:00:00，这个值不在其支持范围内，可以理解为和字符串类型字段的空字符串类似，代表一个空时间，但又与 null 不同。

# mysql 的几种日期区别

在mysql中表示日期时间的类型有 date、time、year、datetime、timstamp五种，列表如下：

![日期](https://img-blog.csdnimg.cn/83a9f34c4e8a4b679b63910ccbd3a1fa.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAamFja2xldHRlcg==,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1. datetime和date的取值范围

mysql文档中声明了date和datetime的取值范围是 '1000-01-01' to '9999-12-31'和'1000-01-01 00:00:00' to '9999-12-31 23:59:59'，但也声明存储更早的时间或许可以，但不保证一定正确，如下：

需要注意的是，timestamp和year却是严格按照mysql指定的范围检查的，比如：我们不能将’1001’插入到year中，也不能将’0001-01-01 00:00:00’插入到timestamp中。

## 2. datetime、time和timestamp支持毫秒

可以使用datetime(f)、time(f)、timestamp(f)定义列，f取值范围是0-6，默认是0。

比如：当我们定义列类型datetime(6)时可以保存'2022-02-11 01:02:03.123456'，查询的结果显示：2022-02-11 01:02:03.123456

注意：虽然我们将'2022-02-11 01:02:03.123456'插入到datetime(0)不会报错，但mysql会丢弃掉毫秒部分。

## 3. 关于时区（datetime和timestamp的不同点之一）

mysql中不存储时区信息，但我们可以给mysql实例设一个整体的时区，也可以跟随服务器时区（默认就是跟随服务器时区）。

如：select @@time_zone输出：SYSTEM，表示跟随系统时区。

另外，我们可以在插入数据时指定时区信息，如：

```sql
insert into test(t_datetime) values('2022-02-11 08:30:01+08:00')
```

当我们将指定时区的数据（如：北京时区'2022-02-11 08:30:01'）插入到mysql的datetime
时，如果mysql使用的时区也是北京时区那么直接存进去，如果是其他时区，比如：+09:00，那么mysql将它转换时区再存进去（转成：'2022-02-11 09:30:01'）
这样下次查询的时候将会得到'2022-02-11 09:30:01'。

另外，mysql存取timestamp和datetime的规则是不一样的：

- datetime

mysql存数据到datetime时候，最多将指定了时区的数据转换到mysql使用的时区后再存储进去，取得时候就原封不动取出来。

- timestamp

mysql存数据的时候，将数据先转换成UTC时间，当取出的时候再转换成mysql使用的时区。

## 4. 关于datetime和timestamp的自动更新
在mysql中，datetime和timestamp可以在定义时指定它自动更新机制。

不过，这种自动更新机制受参数@@explicit_defaults_for_timestamp影响。

当@@explicit_defaults_for_timestamp值为0的时候，timestamp列类型可以自动更新（新增和更新时），否则，timestamp列类型不会自动更新。

所以，为了兼容不同的模式，推荐使用下面的写法保持一致性：

```sql
create table test(
	t_timestamp  timestamp(3) default current_timestamp(3) on update current_timestamp(3),
	t_datetime	datetime(3) default current_timestamp(3) on update current_timestamp(3),
	name varchar(50)
)
```

## 5. 关于日期时间的零值

mysql中允许插入 “0000-00-00 01:02:03” 这样的日期值，但是这样的值其实是无意义的。

时间部分为0好理解，但日期怎么可能为0呢？对于此c#是直接报错的：

mysql中也允许通过修改配置阻止这种数据插入，涉及到mysql的模式参数：NO_ZERO_DATE、NO_ZERO_IN_DATE，以及是否是严格模式，可参考：《mysql：5.1.11 Server SQL Modes》

话说回来，不管mysql中是否允许0000-00-00 00:00:00这种数据，我们在用程序查询的时候得能读取出来吧？看下图：

这里注意：如果我们使用 AllowZeroDateTime=True

而不是ConvertZeroDateTime=True，那么读取数据也不会报错，但会得到一个 MySqlConnector.MySqlDateTime结构体（里面记录的时间是’0000-00-00 00:00:00’），如果后续需要将它转成DateTime的话还是很麻烦，所以建议直接使用ConvertZeroDateTime=True。

## 6. 关于time类型的范围

从上面的介绍中可以看出time的范围并不是00:00:00 - 23:59:59，而是'-838:59:59.000000' to '838:59:59.000000'。

这让人难理解，但mysql文档的解释是time还要考虑存储一个时间段！引用《剑雨》中转轮王的一句话吐槽下：

“你要练变戏法就变戏法，练武功就练武功，你总是喜欢它们混为一谈，能活到今天，也算件奇事啊。”

不管怎么说吧，mysql这么设计了，我们在程序中想办法兼容吧，不过好在 MySqlConnector中读取后就是TimeSpan，所以我们在c#中记得用TimeSpan去接收就行了。

# 参考资料

https://blog.csdn.net/weixin_29062255/article/details/113350050

https://blog.csdn.net/u010476739/article/details/122886095

* any list
{:toc}