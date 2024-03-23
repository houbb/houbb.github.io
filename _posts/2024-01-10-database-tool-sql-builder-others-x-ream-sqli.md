---
layout: post
title: 数据库查询工具 sql builder-x-ream sqli 入门介绍
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, orm, jdbc, sql-budiler, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

[ORM-01-Hibernate、MyBatis、EclipseLink、Spring Data JPA、TopLink、ActiveJDBC、Querydsl 和 JOOQ 对比](https://houbb.github.io/2016/05/21/orm-01-overview)

[ORM-02-Hibernate 对象关系映射（ORM）框架](https://houbb.github.io/2016/05/21/orm-02-hibernate)

[ORM-02-JPA Java Persistence API 入门介绍](https://houbb.github.io/2016/05/21/orm-03-jpa)

[orm-04-Spring Data JPA 入门介绍](https://houbb.github.io/2016/05/21/orm-04-spring-data-jpa)

[ORM-05-javalite activejdbc](https://houbb.github.io/2016/05/21/orm-05-javalite-activejdbc)

[ORM-06-jooq 入门介绍](https://houbb.github.io/2016/05/21/orm-06-jooq)

[ORM-07-querydsl 入门介绍](https://houbb.github.io/2016/05/21/orm-07-querydsl)

[ORM-08-EclipseLink 入门介绍](https://houbb.github.io/2016/05/21/orm-08-EclipseLink)

[ORM-09-TopLink](https://houbb.github.io/2016/05/21/orm-09-Toplink)

# 前言

自己通过 jdbc 实现了一个 数据库查询工具，不过后来想拓展查询功能时，总觉得不够尽兴。

所以在想能不能把 SQL 的构建单独抽离出来。

这里整理学习下其他的组件。

# x-ream/sqli

## 拼接要求

不支持原生的SQL拼接, 仅仅支持以类名和属性名的形式拼接，首字母小写

## 应用场景

对性能没极致要求, 不需要强大的复杂的方案来解决性能，却需要复杂的查询。支持clickhouse风格的JOIN SUB(...)拼接。整合了基于redis.multiGet的二级缓存，缓存支持用户过滤。适合快速开发。默认过滤掉值为null的条件(如果需要null, 可以{builder.x("name is null")})。 对于多个表的连表查询，如果只查出主表ID(其他结果分阶段in查询，支持二级缓存), SQLI将优化连表语句，满足绝大部分需求: 连表仅仅因为条件来自于多个表。 很少情况下，如果必须用LEFT JOIN ON AND (mroe condition) 查询，可以关闭默认的优化{builder.withoutOptimization()}，当然还有其他场景需要关闭。

## Mapper设计

映射前, 没SQL Parser

如果某个属性名和某个类名(首字母小写后)相同, 它们的mapping值必须相同, 建议java实体类里不出现某个属性名=某个类名(首字母小写后), 启动时检查, 遇到则抛出NotSupportedException


表名的别名不能是某个类名(首字母小写后)，运行时遇到则抛出NotSupportedException

## 应用于当前的框架

如果正在使用Spring框架, 可以直接使用io.xream.x7项目, 或按照x7项目的结构整合进当前的框架

如果只使用SQLI的SQL拼接构建接口, 只需要引入sqli/sqli-builder即可

如果不使用Spring或不使用Spring-JdbcTemplate, 需要实现{io.xream.sqli.spi.JdbcHelper}接口, 参照x7/x7-repo/spring-jdbc-template-plus




# sqli-repo

## 使用方法

sqli仅仅是SQL的编程接口,需要整合到已有的框架或项目中,

在io.xream.x7项目里实现了和Spring-Boot/Spring-JdbcTemplate的整合

```java
@EnableX7Repostory  // code at x7/x7-spring-boot-starter
public class App{
    main() 
    ....
}
```

maven 引入：

```xml
<dependency>
     <groupId>io.xream.x7</groupId>
     <artifactId>x7-spring-boot-starter</artifactId>
     ....
</dependency>
```

更多代码片段:

```java
@Repository
public interface FooRepository extends BaseRepository<Foo> {}
@Repository
public interface BarRepository extends RepositoryX {}

@X.Mapping("t_foo")//默认是foo
public class Foo {
    @X.Key //不指定主键的情况下，不支持根据get(id),remove(id)
    private Long id;
    @X.Mapping("full_name") //默认是fullName
    private String fullName;
}

@Service
public class FooServiceImpl implements FooService {

    @Autowired
    private FooRepository fooRepository;
    @Autowired
    private FooFindRepository fooFindRepository;
    
    // 临时表, 原生SQL, 则直接注入, 不支持代理
    @Autowired
    private TemporaryRepository temporaryRepository;
    @Autowired
    private NativeRepository nativeRepository;
```

# API

## BaseRepository API

```
1. in(property, inList) //in查询, 例如: 页面上需要的主表ID或记录已经查出后，补充查询其他表的文本说明数据时使用
2. find(q) //标准拼接查询，返回对象形式记录，返回分页对象
3. list(q) //标准拼接查询，返回对象形式记录，不返回分页对象
4. get(Id) //根据主键查询记录
5. getOne(q) //数据库只有一条记录时，就返回那条记录
6. creaet(Object) //插入一条, 不支持返回自增键, 框架自带ID生成器
7. createOrReplace(Object) //插入或替换一条
8. createBatch(List<Object>) //批量插入
9. refresh( qr) //根据主键更新
10. refreshUnSafe( qr)//不根据主键更新
11. remove(Id)//根据主键删除
12. removeRefreshCreate(RemoveRefreshCreate<T>) //编辑页面列表时写数据库
```

## RepositoryX API

```
13. find(xq) //标准拼接查询，返回Map形式记录，返回分页对象
14. list(xq) //标准拼接查询，返回Map形式记录，不返回分页对象
15. listPlainValue(Class<K>, qx)//返回没有key的单列数据列表 (结果优化1)
16. findToHandle(xq, RowHandler<Map<String,Object>>) //流处理API
```


## QueryBuilder拼接API

```
QB // 返回q, 查出对象形式记录
QB.X //xq, 查出Map形式记录，支持连表查询
QrB //构建要更新的字段和条件
```
    
代码片段:

```java
{
    QB qb = QB.of(Order.class); 
    qb.eq("userId",obj.getUserId()).eq("status","PAID");
    Q q = qb.build();
    orderRepository.find(q);
}

{
    QB.X qbx =  QB.x();
    qbx.resultKey("o.id");
    qbx.eq("o.status","PAID");
    qbx.and(sub -> sub.gt("o.createAt",obj.getStartTime()).lt("o.createAt",obj.getEndTime()));
    qbx.or(sub -> sub.eq("o.test",obj.getTest()).or().eq("i.test",obj.getTest()));
    qbx.from("FROM order o INNER JOIN orderItem i ON i.orderId = o.id");
    qbx.paged(obj);
    Q.X xq = qbx.build();
    orderRepository.find(xq);
}

{
    orderRepository.refresh(
        QrB.of(Order.class).refresh("status","PAYING").eq("id",1).eq("status","UN_PAID").build()
    );
}
```
        
    
## 条件构建API  (QB | QB.X)

```
1. or(sub) // or(sql)
2. or() // OR
3. eq // = (eq, 以及其它的API, 值为null，不会被拼接到SQL)
4. ne // !=
5. gt // >
6. gte // >=
7. lt // <
8. lte // <=
9. like //like %xxx%, if likeLeftRight => xxx, likeLeft => xxx%, then like => %xxx%
10. likeLeft // like xxx%
11. notLike // not like %xxx%
12. in // in
13. nin // not in
14. isNull // is null
15. nonNull // is not null
16. x // 简单的手写sql片段， 例如 x("foo.amount = bar.price * bar.qty") , x("item.quantity = 0")
17. sub(sql, sub) //
18. and(sub)
```


## MAP查询结果构建API  (QB.X)

```
19. distinct //去重
20. reduce //归并计算
        // .reduce(ReduceType.SUM, "dogTest.petId") 
        // .reduce(ReduceType.SUM, "dogTest.petId", Having.of(Op.GT, 1))
        //含Having接口 (仅仅在reduc查询后,有限支持Having)
21. groupBy //分组
22. select //指定返回列
23. selectWithFunc //返回列函数支持
        // .selectWithFunc(ResultKeyAlia.of("o","at"),"FFF(o.createAt, ?)", 100000) 
24. resultWithDottedKey //连表查询返回非JSON格式数据,map的key包含"."  (结果优化2)
```

## 连表构建API  (QB.X)

```
25. from(joinSql) //简单的连表SQL，不支持LEFT JOIN  ON 多条件; 多条件，请用API[28]
26. fromBuilder.of(Order.class,"o") //连表里的主表, API: .fromX(FromX fromX)
27. fromBuilder.JOIN(LEFT).of(OrderItem.class,"i")
                                  .on("i.orderId = o.id", 
28                  on -> on.gt(...)) //LEFT JOIN等, 更多条件
29. fromBuilder.sub(....,"i").JOIN("ANY INNER JOIN").on(....) //fluent构建连表sql
```
       
    
## 分页及排序API  (QB | QB.X)

```
30. sort("o.id", Direction.DESC)
31. paged(pb -> pb.ignoreTotalRows().page(1).rows(10).last(10000)) //设置last(long),会忽略page(int); 
```

## 更新构建API  ( qr)

```
32. refresh
```     

# 框架优化

froms/fromBuilder

如果条件和返回都不包括sourceScript里的连表，框架会优化移除连接（但目标连接表有用时，中间表不会被移除）。
关闭优化: qb.withoutOptimization()

in 每500个条件会切割出一次in查询
        
## 不支持项

union // 过于复杂

# 参考资料


* any list
{:toc}