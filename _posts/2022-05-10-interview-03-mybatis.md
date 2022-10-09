---
layout: post
title:  mybatis 常见面试题汇总
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, mybatis, sh]
published: true
---

# 系列目录

[spring 常见面试题](https://houbb.github.io/2022/05/10/interview-01-spring)

[spring-boot 常见面试题](https://houbb.github.io/2022/05/10/interview-02-springboot)

[redis 常见面试题](https://houbb.github.io/2022/05/10/interview-04-redis)

[mysql 常见面试题](https://houbb.github.io/2022/05/10/interview-05-mysql)

[mq 常见面试题](https://houbb.github.io/2022/05/10/interview-07-mq)

[rpc/dubbo 常见面试题](https://houbb.github.io/2022/05/10/interview-06-dubbo)

[ZooKeeper 面试题](https://houbb.github.io/2022/05/10/interview-08-zookeeper)

[JVM 常见面试题之双亲委派](https://houbb.github.io/2022/05/10/interview-09-jvm-classloader)

[JVM 常见面试题之 GC 垃圾回收](https://houbb.github.io/2022/05/10/interview-09-jvm-gc)

[JVM 常见面试题之 java 内存结构](https://houbb.github.io/2022/05/10/interview-09-jvm-struct)

[JVM 常见面试题之 java 内存结构2](https://houbb.github.io/2022/05/10/interview-11-java-jvm)

[【面试】mybatis 常见面试题汇总](https://houbb.github.io/2022/05/10/interview-03-mybatis)

[面试官：你们项目中是怎么做防重复提交的？](https://houbb.github.io/2022/05/10/interview-10-repeat)

[java 基础之 event 事件机制](https://houbb.github.io/2022/05/10/interview-11-java-basic-event)

[Reflection-01-java 反射机制](https://houbb.github.io/2018/07/01/reflection-01-overview)

[distributed 分布式相关专题汇总](https://houbb.github.io/2022/05/10/interview-11-java-distribute)

[web 常见面试题](https://houbb.github.io/2022/05/10/interview-11-java-web)

[其他常见面试题](https://houbb.github.io/2022/05/10/interview-12-other)

# 前言

大家好，我是老马。

Mybatis 使我们日常开发中常用的框持久层框架。

面试中自然出现频率也比较高，对常见问题进行整理，便于平时查阅收藏。

## 拓展阅读

[从代码生成说起，带你深入理解 mybatis generator 源码](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247485332&idx=1&sn=836008cb6404bd2bef70244e3dbb500e)

[low-code 低代码平台 java 代码自动一键生成工具](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247485204&idx=1&sn=c55880f35bdd2ce6396dd0965fd57705)

[分布式 id snowflake 雪花算法](https://houbb.github.io/2018/09/05/distributed-id-04-snowflake-04)

手写 mybatis 源码系列：

[从零开始手写 mybatis（一）MVP 版本](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484118&idx=1&sn=8582084fe71785ba0de3d7ae45baa4ad)

[从零开始手写 mybatis（二）mybatis interceptor 插件机制详解](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484124&idx=1&sn=0547e9a6535c1de74fe570a1ed1f9099)

[从零开始手写 mybatis（三）jdbc pool 从零实现数据库连接池](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484130&idx=1&sn=0819286a310c9d1f77e57c28ca454925)

[从零开始手写 mybatis（四）mybatis 事务管理机制详解](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484164&idx=1&sn=5db2738c0c15c8bd5b67674ccfbb7b3d)

[从零开始手写 mybatis（五）mybatis 与 spring 整合原理详解](https://mp.weixin.qq.com/s?__biz=MzUyNjE3OTAyMw==&mid=2247484204&idx=1&sn=b9f6bfa1ec7fa42180956bcfe4386eeb)

# JDBC 有几个步骤？

JDBC 大致可以分为六个步骤：

1. 加载驱动程序

2. 获得数据库连接

3. 创建一个 Statement 对象

4. 操作数据库，实现增删改查

5. 获取结果集

6. 关闭资源

# mybatis 是什么？

MyBatis 是一款优秀的持久层框架，它支持自定义 SQL、存储过程以及高级映射。

MyBatis 免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作。

MyBatis 可以通过简单的 XML 或注解来配置和映射原始类型、接口和 Java POJO（Plain Old Java Objects，普通老式 Java 对象）为数据库中的记录。

# 什么是 ORM?

全称为 Object Relational Mapping。对象-映射-关系型数据库。

对象关系映射(简称 ORM，或 O/RM，或 O/R mapping)，用于实现面向对象编程语言里不同类型系统的数据之间的转换。

简单的说，ORM 是通过使用描述对象和数据库之间映射的元数据，将程序中的对象与关系数据库相互映射。

ORM 提供了实现持久化层的另一种模式，它采用映射元数据来描述对象关系的映射，使得 ORM 中间件能在任何一个应用的业务逻辑层和数据库层之间充当桥梁。

# 说说 ORM 的优缺点

## 优点

1.提高了开发效率。

由于 ORM 可以自动对 Entity 对象与数据库中的 Table 进行字段与属性的映射，所以我们实际可能已经不需要一个专用的、庞大的数据访问层。

2.ORM 提供了对数据库的映射，不用 sql 直接编码，能够像操作对象一样从数据库获取数据。

## 缺点

「缺点」牺牲程序的执行效率和会固定思维模式，降低了开发的灵活性。

从系统结构上来看，采用 ORM 的系统一般都是多层系统，系统的层次多了，效率就会降低。

ORM 是一种完全的面向对象的做法，而面向对象的做法也会对性能产生一定的影响。

在我们开发系统时，一般都有性能问题。性能问题主要产生在算法不正确和与数据库不正确的使用上。

ORM 所生成的代码一般不太可能写出很高效的算法，在数据库应用上更有可能会被误用，主要体现在对持久对象的提取和和数据的加工处理上，如果用上了 ORM,程序员很有可能将全部的数据提取到内存对象中，然后再进行过滤和加工处理，这样就容易产生性能问题。

在对对象做持久化时，ORM 一般会持久化所有的属性，有时，这是不希望的。

但 ORM 是一种工具，工具确实能解决一些重复，简单的劳动。这是不可否认的。

但我们不能指望工具能一劳永逸的解决所有问题，有些问题还是需要特殊处理的，但需要特殊处理的部分对绝大多数的系统，应该是很少的。

# 说说 Mybaits 的优缺点

## 优点

① 基于 SQL 语句编程，相当灵活，不会对应用程序或者数据库的现有设计造成任何影响，SQL 写在 XML 里，解除 sql 与程序代码的耦合，便于统一管理；提供 XML 标签，支持编写动态 SQL 语句，并可重用。
② 与 JDBC 相比，减少了 50%以上的代码量，消除了 JDBC 大量冗余的代码，不需要手动开关连接；
③ 很好的与各种数据库兼容（因为 MyBatis 使用 JDBC 来连接数据库，所以只要 JDBC 支持的数据库 MyBatis 都支持）。
④ 能够与 Spring 很好的集成；
⑤ 提供映射标签，支持对象与数据库的 ORM 字段关系映射；提供对象关系映射标签，支持对象关系组件维护。

## 缺点

① SQL 语句的编写工作量较大，尤其当字段多、关联表多时，对开发人员编写 SQL 语句的功底有一定要求。

② SQL 语句依赖于数据库，导致数据库移植性差，不能随意更换数据库。

MyBatis 框架适用场合：

（1）MyBatis 专注于 SQL 本身，是一个足够灵活的 DAO 层解决方案。

（2）对性能的要求很高，或者需求变化较多的项目，如互联网项目，MyBatis 将是不错的选择。

# 为什么说 Mybatis 是半自动 ORM 映射工具？

Hibernate 属于全自动 ORM 映射工具，使用 Hibernate 查询关联对象或者关联集合对象时，可以根据对象关系模型直接获取，所以它是全自动的。

而 Mybatis 在查询关联对象或关联集合对象时，需要手动编写 sql 来完成，所以，称之为半自动 ORM 映射工具。

（2）Mybatis 直接编写原生态 sql，可以严格控制 sql 执行性能，灵活度高，非常适合对关系数据模型要求不高的软件开发，因为这类软件需求变化频繁，一但需求变化要求迅速输出成果。但是灵活的前提是 mybatis 无法做到数据库无关性，如果需要实现支持多种数据库的软件，则需要自定义多套 sql 映射文件，工作量大。

（3）Hibernate 对象/关系映射能力强，数据库无关性好，对于关系模型要求高的软件，如果用 hibernate 开发可以节省很多代码，提高效率。

其实关于常见 ORM 框架还设有 Spring 的 JPA，后期的面试可能会更倾向于问 JPA 和 Mybatis 的区别了。希望大家留意点。

# 传统JDBC开发存在的问题

频繁创建数据库连接对象、释放，容易造成系统资源浪费，影响系统性能。

可以使用连接池解决这个问题。

但是使用jdbc需要自己实现连接池。sql语句定义、参数设置、结果集处理存在硬编码。

实际项目中sql语句变化的可能性较大，一旦发生变化，需要修改java代码，系统需要重新编译，重新发布。不好维护。

使用preparedStatement向占有位符号传参数存在硬编码，因为sql语句的where条件不一定，可能多也可能少，修改sql还要修改代码，系统不易维护。

结果集处理存在重复代码，处理麻烦。如果可以映射成Java对象会比较方便。

# JDBC编程有哪些不足之处，MyBatis是如何解决这些问题的？

1、数据库链接创建、释放频繁造成系统资源浪费从而影响系统性能，如果使用数据库连接池可解决此问题。

解决：在mybatis-config.xml中配置数据链接池，使用连接池管理数据库连接。

2、Sql语句写在代码中造成代码不易维护，实际应用sql变化的可能较大，sql变动需要改变java代码。

解决：将Sql语句配置在XXXXmapper.xml文件中与java代码分离。

3、向sql语句传参数麻烦，因为sql语句的where条件不一定，可能多也可能少，占位符需要和参数一一对应。

解决：Mybatis自动将java对象映射至sql语句。

4、对结果集解析麻烦，sql变化导致解析代码变化，且解析前需要遍历，如果能将数据库记录封装成pojo对象解析比较方便。

解决：Mybatis自动将sql执行结果映射至java对象。

# MyBatis与Hibernate有哪些不同？

Mybatis和hibernate不同，它不完全是一个ORM框架，因为MyBatis需要程序员自己编写Sql语句，不过mybatis可以通过XML或注解方式灵活配置要运行的sql语句，并将java对象和sql语句映射生成最终执行的sql，最后将sql执行的结果再映射生成java对象。

Mybatis学习门槛低，简单易学，程序员直接编写原生态sql，可严格控制sql执行性能，灵活度高，非常适合对关系数据模型要求不高的软件开发，例如互联网软件、企业运营类软件等，因为这类软件需求变化频繁，一但需求变化要求成果输出迅速。但是灵活的前提是mybatis无法做到数据库无关性，如果需要实现支持多种数据库的软件则需要自定义多套sql映射文件，工作量大。

Hibernate对象/关系映射能力强，数据库无关性好，对于关系模型要求高的软件（例如需求固定的定制化软件）如果用hibernate开发可以节省很多代码，提高效率。

但是Hibernate的缺点是学习门槛高，要精通门槛更高，而且怎么设计O/R映射，在性能和对象模型之间如何权衡，以及怎样用好Hibernate需要具有很强的经验和能力才行。

总之，按照用户的需求在有限的资源环境下只要能做出维护性、扩展性良好的软件架构都是好架构，所以框架只有适合才是最好。

# Mybatis比IBatis比较大的几个改进是什么?

Mybatis比IBatis比较大的几个改进是什么

a.有接口绑定,包括注解绑定sql和xml绑定Sql

b.动态sql由原来的节点配置变成OGNL表达式

c. 在一对一,一对多的时候引进了association,在一对多的时候引入了collection节点,不过都是在resultMap里面配置

# 请说说MyBatis的工作原理

## 流程图

![流程图](https://img-blog.csdnimg.cn/20210426203923381.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2NtbTA0MDE=,size_16,color_FFFFFF,t_70)

在学习 MyBatis 程序之前，需要了解一下 MyBatis 工作原理，以便于理解程序。

1）读取 MyBatis 配置文件：mybatis-config.xml 为 MyBatis 的全局配置文件，配置了 MyBatis 的运行环境等信息，例如数据库连接信息。

2）加载映射文件。映射文件即 SQL 映射文件，该文件中配置了操作数据库的 SQL 语句，需要在 MyBatis 配置文件 mybatis-config.xml 中加载。

mybatis-config.xml 文件可以加载多个映射文件，每个文件对应数据库中的一张表。

3）构造会话工厂：通过 MyBatis 的环境等配置信息构建会话工厂 SqlSessionFactory。

4）创建会话对象：由会话工厂创建 SqlSession 对象，该对象中包含了执行 SQL 语句的所有方法。

5）Executor 执行器：MyBatis 底层定义了一个 Executor 接口来操作数据库，它将根据 SqlSession 传递的参数动态地生成需要执行的 SQL 语句，同时负责查询缓存的维护。

6）MappedStatement 对象：在 Executor 接口的执行方法中有一个 MappedStatement 类型的参数，该参数是对映射信息的封装，用于存储要映射的 SQL 语句的 id、参数等信息。

7）输入参数映射：输入参数类型可以是 Map、List 等集合类型，也可以是基本数据类型和 POJO 类型。输入参数映射过程类似于 JDBC 对 preparedStatement 对象设置参数的过程。

8）输出结果映射：输出结果类型可以是 Map、 List 等集合类型，也可以是基本数据类型和 POJO 类型。输出结果映射过程类似于 JDBC 对结果集的解析过程。

# MyBatis 的功能架构是怎样的

![mybatis struct](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/2/1709b4c6ad32ecf4~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)

我们把Mybatis的功能架构分为三层：

API接口层：提供给外部使用的接口API，开发人员通过这些本地API来操纵数据库。接口层一接收到调用请求就会调用数据处理层来完成具体的数据处理。

数据处理层：负责具体的SQL查找、SQL解析、SQL执行和执行结果映射处理等。它主要的目的是根据调用的请求完成一次数据库操作。

基础支撑层：负责最基础的功能支撑，包括连接管理、事务管理、配置加载和缓存处理，这些都是共用的东西，将他们抽取出来作为最基础的组件。为上层的数据处理层提供最基础的支撑。

# 分页

## Mybatis 是如何进行分页的？

Mybatis 使用 RowBounds 对象进行分页，它是针对 ResultSet 结果集执行的内存分页，而非物理分页，先把数据都查出来，然后再做分页。

可以在 sql 内直接书写带有物理分页的参数来完成物理分页功能，也可以使用分页插件来完成物理分页。

## 分页插件的基本原理是什么？

分页插件的基本原理是使用 Mybatis 提供的插件接口，实现自定义插件，在插件的拦截方法内拦截待执行的 sql，然后重写 sql（SQL 拼接 limit），根据 dialect 方言，添加对应的物理分页语句和物理分页参数，用到了技术 JDK 动态代理，用到了责任链设计模式。

## 简述 Mybatis 的插件运行原理？

Mybatis 仅可以编写针对 ParameterHandler、ResultSetHandler、StatementHandler、Executor 这 4 种接口的插件，Mybatis 使用 JDK 的动态代理，为需要拦截的接口生成代理对象以实现接口方法拦截功能，每当执行这 4 种接口对象的方法时，就会进入拦截方法，具体就是 InvocationHandler 的 invoke()方法，当然，只会拦截那些你指定需要拦截的方法。

# 如何编写一个插件？

编写插件：实现 Mybatis 的 Interceptor 接口并复写 intercept()方法，然后再给插件编写注解，指定要拦截哪一个接口的哪些方法即可，最后在配置文件中配置你编写的插件。

推荐：[建议收藏，mybatis插件原理详解](https://mp.weixin.qq.com/s?__biz=MzU4MDM3MDgyMA==&mid=2247495157&idx=1&sn=1543a04ff3c6100661ed4b5819a65581&chksm=fd55451eca22cc085056e4578378a9a42735ba325af88682864cfce85cb67c0365cf4aa44044&scene=21#wechat_redirect)


# Mybatis 动态 sql 有什么用？

Mybatis 动态 sql 可以在 Xml 映射文件内，以标签的形式编写动态 sql，执行原理是根据表达式的值完成逻辑判断 并动态调整 sql 的功能。

Mybatis 提供了 9 种动态 sql 标签：`trim | where | set | foreach | if | choose | when | otherwise | bind`。

# Xml 映射文件中有哪些标签？

除了常见的 `select|insert|updae|delete` 标签之外，还有：

`<resultMap>、<parameterMap>、<sql>、<include>、<selectKey>`，加上动态 sql 的 9 个标签，其中 `<sql>` 为 sql 片段标签，通过 `<include>` 标签引入 sql 片段，`<selectKey>` 为不支持自增的主键生成策略标签。


# DAO 接口

## mapper.xml 文件对应的 Dao 接口原理是？

简单说：使用了 JDK 动态代理和反射，把接口和 xml 绑定在一起而搞定的。

## Dao 接口里的方法，参数不同时能重载吗？

不能重载。

Dao接口，就是人们常说的Mapper接口，接口的全限名，就是映射文件中的namespace的值，接口的方法名，就是映射文件中MappedStatement的id值，接口方法内的参数，就是传递给sql的参数。

Mapper接口是没有实现类的，当调用接口方法时，接口全限名+方法名拼接字符串作为key值，可唯一定位一个MappedStatement，

举例：com.mybatis3.mappers.StudentDao.findStudentById，可以唯一找到namespace为com.mybatis3.mappers.StudentDao下面id = findStudentById的MappedStatement。

在Mybatis中，每一个`<select>、<insert>、<update>、<delete>`标签，都会被解析为一个MappedStatement对象。

Dao接口里的方法，是不能重载的，因为是全限名+方法名的保存和寻找策略。

Dao接口的工作原理**是JDK动态代理，Mybatis运行时会使用JDK动态代理为Dao接口生成代理proxy对象，代理对象proxy会拦截接口方法，转而执行MappedStatement所代表的sql，然后将sql执行结果返回**。

## 什么是MyBatis的接口绑定？

有哪些实现方式？

接口绑定，就是在MyBatis中任意定义接口，然后把接口里面的方法和SQL语句绑定，我们直接调用接口方法就可以，这样比起原来了SqlSession提供的方法我们可以有更加灵活的选择和设置。

接口绑定有两种实现方式通过注解绑定，就是在接口的方法上面加上 @Select、@Update等注解，里面包含Sql语句来绑定；通过xml里面写SQL来绑定， 在这种情况下，要指定xml映射文件里面的namespace必须为接口的全路径名。

当Sql语句比较简单时候，用注解绑定， 当SQL语句比较复杂时候，用xml绑定，一般用xml绑定的比较多。

## 使用MyBatis的mapper接口调用时有哪些要求？

1、Mapper接口方法名和mapper.xml中定义的每个sql的id相同。

2、Mapper接口方法的输入参数类型和mapper.xml中定义的每个sql 的parameterType的类型相同。

3、Mapper接口方法的输出参数类型和mapper.xml中定义的每个sql的resultType的类型相同。

4、Mapper.xml文件中的namespace即是mapper接口的类路径。

# 延迟加载

## Mybatis 是否支持延迟加载？

Mybatis 仅支持 association 关联对象和 collection 关联集合对象的延迟加载，association 指的就是一对一，collection 指的就是一对多查询。

在 Mybatis 配置文件中，可以配置是否启用延迟加载lazyLoadingEnabled=true|false。

## 延迟加载的基本原理是什么？

延迟加载的基本原理是，使用 CGLIB 创建目标对象的代理对象，当调用目标方法时，进入拦截器方法。

比如调用a.getB().getName()，拦截器 invoke()方法发现 a.getB()是 null 值，那么就会单独发送事先保存好的查询关联 B 对象的 sql，把 B 查询上来，然后调用a.setB(b)，于是 a 的对象 b 属性就有值了，接着完成a.getB().getName()方法的调用。

当然了，不光是 Mybatis，几乎所有的包括 Hibernate，支持延迟加载的原理都是一样的。

# #{}和 ${}的区别是什么？

`${}` 是字符串替换，`#{}` 是预处理；

Mybatis 在处理时，就是把{}直接替换成变量的值。而 Mybatis 在处理 #{}时，会对 sql 语句进行预处理，将 sql 中的 #{}替换为?号，调用 PreparedStatement 的 set 方法来赋值；

使用 `#{}` 可以有效的防止 SQL 注入，提高系统安全性。

ps: order by 排序，一般使用 `${}`。此时最好固定输入，避免注入问题。

# Mybatis能执行一对一、一对多的关联查询吗？

都有哪些实现方式，以及它们之间的区别。

答：能，Mybatis不仅可以执行一对一、一对多的关联查询，还可以执行多对一，多对多的关联查询，多对一查询，其实就是一对一查询，只需要把selectOne()修改为selectList()即可；多对多查询，其实就是一对多查询，只需要把selectOne()修改为selectList()即可。

关联对象查询，有两种实现方式，一种是单独发送一个sql去查询关联对象，赋给主对象，然后返回主对象。

另一种是使用嵌套查询，嵌套查询的含义为使用join查询，一部分列是A对象的属性值，另外一部分列是关联对象B的属性值，好处是只发一个sql查询，就可以把主对象和其关联对象查出来。

那么问题来了，join查询出来100条记录，如何确定主对象是5个，而不是100个？

其去重复的原理是 `<resultMap>` 标签内的 `<id>` 子标签，指定了唯一确定一条记录的id列，Mybatis根据 `<id>` 列值来完成100条记录的去重复功能，`<id>` 可以有多个，代表了联合主键的语意。

同样主对象的关联对象，也是根据这个原理去重复的，尽管一般情况下，只有主对象会有重复记录，关联对象一般不会重复。

## 实现原理

在MyBatis中，使用association标签来解决一对一的关联查询。association标签可用的属性有：（1）property：对象属性的名称（2）javaType：对象属性的类型（3） column：对应的外键字段名称（4）select：使用另一个查询封装的结果。

在MyBatis中，使用collection标签来解决一对多的关联查询。collection标签可用的属性有：（1）property：指的是集合属性的值（2）ofType：指的是集合中元素的类型（3）column：所对应的外键字段名称（4）select：使用另一个查询封装的结果。

## 1v1 例子

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.wind.repository.StudentRepository">
 
    <resultMap id="studentMap" type="com.wind.entity.StudentEntity">
        <result column="Id" property="id"/>
        <result column="Name" property="name"/>
        <result column="ClassId" property="classId"/>
        <result column="Status" property="status"/>
        <result column="AddTime" property="addTime"/>
        <result column="UpdateTime" property="updateTime"/>
    </resultMap>
 
    <resultMap id="studentMap2" type="com.wind.entity.StudentEntity">
        <result column="Id" property="id"/>
        <result column="Name" property="name"/>
        <result column="ClassId" property="classId"/>
        <result column="Status" property="status"/>
        <result column="AddTime" property="addTime"/>
        <result column="UpdateTime" property="updateTime"/>
        <association property="classEntity" javaType="classEntity">
            <id column="cId" property="id"/>
            <result column="cClassName" property="className"/>
            <result column="cStatus" property="status"/>
        </association>
    </resultMap>
 
    <sql id="sql_select">
        select Id, Name, ClassId, Status, AddTime, UpdateTime from RUN_Student
    </sql>
 
    <select id="queryStudent" parameterType="int" resultMap="studentMap">
        <include refid="sql_select"/>
        where id = #{id} and status = 1
    </select>
 
    <select id="queryStudentWithClass" parameterType="int" resultMap="studentMap2">
        select r.Id, r.Name, r.ClassId, r.Status, r.AddTime, r.UpdateTime, c.id as cid, c.ClassName as cClassName, c.Status as cStatus
        from RUN_Student r join RUN_Class c on r.classId = c.id
        where r.id = #{id}
    </select>

</mapper>
```

## 1vN

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.wind.repository.ClassRepository">
 
    <resultMap id="classStudentMap" type="com.wind.entity.ClassEntity">
        <result column="Id" property="id"/>
        <result column="ClassName" property="className"/>
        <result column="Status" property="status"/>
        <result column="AddTime" property="addTime"/>
        <result column="UpdateTime" property="updateTime"/>
        <collection property="studentEntities" ofType="com.wind.entity.StudentEntity">
            <result column="sId" property="id"/>
            <result column="sName" property="name"/>
            <result column="sClassId" property="classId"/>
            <result column="sStatus" property="status"/>
            <result column="sAddTime" property="addTime"/>
            <result column="sUpdateTime" property="updateTime"/>
        </collection>
    </resultMap>
 
    <sql id="sql_select_join_student">
        select c.Id, c.ClassName, c.Status, c.AddTime, c.UpdateTime,
        s.Id as sId, s.Name as sName, s.ClassId as sClassId, s.Status as sStatus, s.AddTime as sAddTime, s.UpdateTime as sUpdateTime
        from RUN_Class c join RUN_Student s on c.Id =  s.classId
    </sql>
 
    <select id="queryClassByClassId" parameterType="int" resultMap="classStudentMap">
        <include refid="sql_select_join_student"/>
        where c.id = #{id} and c.status = 1 and s.status =1
    </select>
 
</mapper>
```

# Mybatis是否可以映射Enum枚举类？

答：Mybatis可以映射枚举类，不单可以映射枚举类，Mybatis可以映射任何对象到表的一列上。

映射方式为自定义一个TypeHandler，实现TypeHandler的setParameter()和getResult()接口方法。

TypeHandler有两个作用，一是完成从javaType至jdbcType的转换，二是完成jdbcType至javaType的转换，体现为setParameter()和getResult()两个方法，分别代表设置sql问号占位符参数和获取列查询结果。

# Mybatis映射文件中，如果A标签通过include引用了B标签的内容，请问，B标签能否定义在A标签的后面，还是说必须定义在A标签的前面？

答：虽然Mybatis解析Xml映射文件是按照顺序解析的，但是，被引用的B标签依然可以定义在任何地方，Mybatis都可以正确识别。

原理是，Mybatis解析A标签，发现A标签引用了B标签，但是B标签尚未解析到，尚不存在，此时，Mybatis会将A标签标记为未解析状态，然后继续解析余下的标签，包含B标签，待所有标签解析完毕，Mybatis会重新解析那些被标记为未解析的标签，此时再解析A标签时，B标签已经存在，A标签也就可以正常解析完成了。


# 主键

## 如何获取自动生成的(主)键值?

如何获取自动生成的(主)键值?

如果我们一般插入数据的话，如果我们想要知道刚刚插入的数据的主键是多少，我们可以通过以下的方式来获取

需求：

user对象插入到数据库后，新记录的主键要通过user对象返回，通过user获取主键值。

解决思路：

通过LAST_INSERT_ID()获取刚插入记录的自增主键值，在insert语句执行后，执行select LAST_INSERT_ID()就可以获取自增主键。

mysql:

```xml
<insert id="insertUser" parameterType="cn.itcast.mybatis.po.User">
    <selectKey keyProperty="id" order="AFTER" resultType="int">
        select LAST_INSERT_ID()
    </selectKey>
    INSERT INTO USER(username,birthday,sex,address) VALUES(#{username},#{birthday},#{sex},#{address})
</insert>
```

oracle:

实现思路：

先查询序列得到主键，将主键设置到user对象中，将user对象插入数据库。

```xml
<!-- oracle
在执行insert之前执行select 序列.nextval() from dual取出序列最大值，将值设置到user对象 的id属性
 -->
<insert id="insertUser" parameterType="cn.itcast.mybatis.po.User">
    <selectKey keyProperty="id" order="BEFORE" resultType="int">
        select 序列.nextval() from dual
    </selectKey>
    INSERT INTO USER(id,username,birthday,sex,address) VALUES( 序列.nextval(),#{username},#{birthday},#{sex},#{address})
</insert> 
```


## Mybatis 执行批量插入，能返回数据库主键列表吗？

1、对于支持生成自增主键的数据库：增加 useGenerateKeys 和 keyProperty ，`<insert>` 标签属性。

2、不支持生成自增主键的数据库：使用 `<selectKey>`。

方式：

```xml
<insert id="insertAuthor" useGeneratedKeys="true"
    keyProperty="id">
  insert into Author (username, password, email, bio) values
  <foreach item="item" collection="list" separator=",">
    (#{item.username}, #{item.password}, #{item.email}, #{item.bio})
  </foreach>
</insert>
```

注意 Mybatis 的版本，官方在这个 3.3.1 版本中加入了批量新增返回主键 id 的功能 。

# 不同的 Xml 映射文件，id 是否可以重复？

不同的 Xml 映射文件，如果配置了 namespace，那么 id 可以重复；如果没有配置 namespace，那么 id 不能重复；毕竟 namespace 不是必须的，只是最佳实践而已。

原因就是 namespace+id 是作为 `Map<String, MappedStatement>` 的 key 使用的，如果没有 namespace，就剩下 id，那么，id 重复会导致数据互相覆盖。

有了 namespace，自然 id 就可以重复，namespace 不同，namespace+id 自然也就不同。

# Mybatis 中 Executor 执行器的区别是？

Mybatis 有三种基本的 Executor 执行器，「SimpleExecutor、ReuseExecutor、BatchExecutor。」

SimpleExecutor：每执行一次 update 或 select，就开启一个 Statement 对象，用完立刻关闭 Statement 对象。

ReuseExecutor：执行 update 或 select，以 sql 作为 key 查找 Statement 对象，存在就使用，不存在就创建，用完后，不关闭 Statement 对象，而是放置于 `Map<String, Statement>` 内，供下一次使用。简言之，就是重复使用 Statement 对象。

BatchExecutor：执行 update（没有 select，JDBC 批处理不支持 select），将所有 sql 都添加到批处理中（addBatch()），等待统一执行（executeBatch()），它缓存了多个 Statement 对象，每个 Statement 对象都是 addBatch()完毕后，等待逐一执行 executeBatch()批处理。与 JDBC 批处理相同。

作用范围：Executor 的这些特点，都严格限制在 SqlSession 生命周期范围内。

# Mybatis 全局配置文件中有哪些标签？

```
configuration 配置

properties 属性:可以加载

properties 配置文件的信息

settings 设置：可以设置 mybatis 的全局属性

typeAliases 类型命名

typeHandlers 类型处理器

objectFactory 对象工厂

plugins 插件

environments 环境

environment 环境变量

transactionManager 事务管理器

dataSource 数据源

mappers 映射器
```

# 当实体类中的属性名和表中的字段名不一样时怎么办 ？

第 1 种：通过在查询的 sql 语句中定义字段名的别名，让字段名的别名和实体类的属性名一致。

```xml
<select id="selectById" resultMap="User">
    select id, name as userName, pwd as password from m_user
    <where>
        <if test="id != null">
            id = #{id}
        </if>
    </where>
</select>
```

第 2 种：通过 `<resultMap>` 来映射字段名和实体类属性名的一一对应的关系。

第 3 种：使用注解时候，使用 Result，和第二种类似。

# 在mapper中如何传递多个参数?

在mapper中如何传递多个参数?

## 第一种：使用占位符的思想

- 在映射文件中使用 `#{0}`, `#{1}` 代表传递进来的第几个参数。如果使用的是JDK8的话，那么会有Bug。

- 使用 `@Param` 注解:来命名参数

（1）#{0}, #{1}方式

```xml
//对应的xml,#{0}代表接收的是dao层中的第一个参数，#{1}代表dao层中第二参数，更多参数一致往后加即可。
<select id="selectUser"resultMap="BaseResultMap">  
    select *  fromuser_user_t   whereuser_name = #{0} anduser_area=#{1}  
</select>  
```

（2）`@Param` 注解方式

```java
public interface usermapper { 
 User selectuser(@param(“username”) string username, @param(“hashedpassword”) string hashedpassword); 
}
```

对应的 xml

```xml
<select id=”selectuser” resulttype=”user”> 
     select id, username, hashedpassword 
     from some_table 
     where username = #{username} 
     and hashedpassword = #{hashedpassword} 
</select>
```

## 第二种：使用 Map 集合作为参数来装载

```java
try{
    //映射文件的命名空间.SQL片段的ID，就可以调用对应的映射文件中的SQL
    /**
     * 由于我们的参数超过了两个，而方法中只有一个Object参数收集
     * 因此我们使用Map集合来装载我们的参数
     */
    Map<String, Object> map = new HashMap();
    map.put("start", start);
    map.put("end", end);
    return sqlSession.selectList("StudentID.pagination", map);
}catch(Exception e){
    e.printStackTrace();
    sqlSession.rollback();
    throw e;
}finally{
    MybatisUtil.closeSqlSession();
}
```

对应的 xml

```xml
<!--分页查询-->
<select id="pagination" parameterType="map" resultMap="studentMap">
    /*根据key自动找到对应Map集合的value*/
    select * from students limit #{start},#{end};
</select>
```

# 模糊查询 like 语句该怎么写?

第 1 种：在 Java 代码中添加 sql 通配符。

```java
String wildcardname = "%smi%";
list<name> names = mapper.selectlike(wildcardname);
```

对应的 xml

```xml
<select id="selectlike">
select * from foo where bar like #{value}
</select>
```

第 2 种：在 sql 语句中拼接通配符，会引起 sql 注入

```java
String wildcardname = "smi";
list<name> names = mapper.selectlike(wildcardname);
```

对应的 xml

```xml
<select id="selectlike">
select * from foo where bar like "%"#{value}"%"
</select>
```

# Mybatis 构建步骤？

整体步骤：

![整体步骤](https://static001.geekbang.org/infoq/f3/f390e2bd5151231990afe75eaf523df0.png)

# 简述一下 Mybatis 的手动编程步骤？

创建 SqlSessionFactory

通过 SqlSessionFactory 创建 SqlSession

通过 sqlsession 执行数据库操作

调用 session.commit() 提交事务

调用 session.close() 关闭会话

# 缓存

Mybatis 的一级、二级缓存

![缓存](https://img-blog.csdnimg.cn/20201226221756636.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2NtbTA0MDE=,size_16,color_FFFFFF,t_70)

（1）在MyBatis中，有一级缓存和二级缓存之分。默认情况下，它的一级缓存是打开的，而且不能关闭；二级缓存是关闭的，如果想要使用的话，需要手动开启，做一些配置就行。

（2）一级缓存是SqlSession级别的缓存，一个sqlSession对象代表着我们的程序和数据库的一次会话。当MyBatis第一次发出一个SQL查询的时候，SQL的查询结果首先会写入SqlSession的一级缓存中，缓存使用的数据结构是一个HashMap，HashMap的key=MapperID+offset+limit+Sql+所有的入参，HashMap的value=查询结果；然后再把查询结果返回给用户。当同一个SqlSession再次发出同样的SQL查询的时候，就会直接从一级缓存中取出数据，这在一定程度上提高了查询效率。但是，需要注意的是，如果在两次查询中出现了DML SQL（insert、delete、update），则本SqlSession的一级缓存就会被清空，下次再去查询的时候，就会直接从数据库中查询。另外，一级缓存中最多可以缓存1024个SQL的key引用查询结果。
二级缓存是Mapper级别的缓存，可以跨SqlSession对象，不同的SqlSession对象是可以共享的。因为MyBatis是面向Mapper接口编程的，一般情况下，一张表对应于一个Mapper映射文件，一个Mapper映射文件又对应于一个Mapper接口，在一个Mapper映射文件中我们

（3）通常会设置一个namespace属性，这个namespace属性就标识了这个Mapper接口，所以，MyBatis是以命名空间为单位创建二级缓存的。二级缓存，它也是一个HashMap的数据结构，key=MapperID+offset+limit+Sql+所有的入参，value=查询结果。如果开启了二级缓存，那么缓存的查询顺序是怎样的呢？是这样的，所有的SQL查询都会首先看一下是否命中了二级缓存，如果命中了则直接从二级缓存中取出结果并返回；如果没命中，再去看一下是否命中了一级缓存，如果命中了则直接从一级缓存中取出结果，如果还是没命中，则再去查询数据库。对于查询结果，也是先写入一级缓存、再写入二级缓存、最后再返回给用户的这样一个流程。

（4）同时，MyBatis主要是做ORM的，对于缓存它并没有花费十足的精力，所以，它还提供了一些缓存接口以供第三方使用，用来提高缓存性能，比如常用的是EnCache缓存框架，它是一个纯Java的进程内缓存框架，性能很高。

（5）对于MyBatis的缓存更新机制，当某一个作用域（一级缓存 sqlSession；二级缓存namespace）的进行了写操作后，也就是 insert、delete、update 等DML操作，默认情况下，该作用域下的所有select查询缓存都将被清除，并重新更新；如果开启了二级缓存，则只根据配置判断是否刷新。

# 参考资料

https://xie.infoq.cn/article/fde8156a2d5c52ccc1530e404

https://juejin.cn/post/6844904079827664903

http://www.4k8k.xyz/article/cmm0401/116171937

https://www.cnblogs.com/guobaoqing/p/14467094.html

https://www.songbingjia.com/tech/show-1302696.html

https://www.javabugs.com/article/476

https://blog.51cto.com/laoshifu/5070495

* any list
{:toc}