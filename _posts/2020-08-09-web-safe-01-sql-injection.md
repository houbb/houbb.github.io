---
layout: post
title:  web 安全系列-01-SQL injection SQL 注入
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sql, sf]
published: true
---

# Sql 注入是什么？

SQL注入（英语：SQL injection），也称SQL注入或SQL注码，是发生于应用程序与数据库层的安全漏洞。

简而言之，是在输入的字符串之中注入SQL指令，在设计不良的程序当中忽略了字符检查，那么这些注入进去的恶意指令就会被数据库服务器误认为是正常的SQL指令而运行，因此遭到破坏或是入侵。

# Sql 注入产生原因及威胁：

## 产生的原因

在应用程序中若有下列状况，则可能应用程序正暴露在SQL Injection的高风险情况下：

1. 在应用程序中使用字符串联结方式或联合查询方式组合SQL指令。

2. 在应用程序链接数据库时使用权限过大的账户（例如很多开发人员都喜欢用最高权限的系统管理员账户（如常见的root，sa等）连接数据库）。

3. 在数据库中开放了不必要但权力过大的功能（例如在Microsoft SQL Server数据库中的xp_cmdshell延伸存储程序或是OLE Automation存储程序等）

4. 太过于信任用户所输入的数据，未限制输入的特殊字符，以及未对用户输入的数据做潜在指令的检查。

## 原理

1. SQL命令可查询、插入、更新、删除等，命令的串接。而以分号字符为不同命令的区别。（原本的作用是用于SubQuery或作为查询、插入、更新、删除……等的条件式）

2. SQL命令对于传入的字符串参数是用单引号字符所包起来。（但连续2个单引号字符，在SQL数据库中，则视为字符串中的一个单引号字符）

3. SQL命令中，可以注入注解（连续2个减号字符 `--` 后的文字为注解，或 `/**/` 所包起来的文字为注解）

4. 因此，如果在组合SQL的命令字符串时，未针对单引号字符作转义处理的话，将导致该字符变量在填入命令字符串时，被恶意窜改原本的SQL语法的作用。

## 威胁

Sql 注入带来的威胁主要有如下几点

1. 猜解后台数据库，这是利用最多的方式，盗取网站的敏感信息。

2. 绕过认证，列如绕过验证登录网站后台。

3. 注入可以借助数据库的存储过程进行提权等操作

## 可能造成的伤害

- 数据表中的数据外泄，例如企业及个人机密数据，账户数据，密码等。

- 数据结构被黑客探知，得以做进一步攻击（例如SELECT * FROM sys.tables）。

- 数据库服务器被攻击，系统管理员账户被窜改（例如ALTER LOGIN sa WITH PASSWORD='xxxxxx'）。

- 获取系统较高权限后，有可能得以在网页加入恶意链接、恶意代码以及Phishing等。

- 经由数据库服务器提供的操作系统支持，让黑客得以修改或控制操作系统（例如xp_cmdshell "net stop iisadmin"可停止服务器的IIS服务）。

- 黑客经由上传php简单的指令至对方之主机内，PHP之强大系统命令，可以让黑客进行全面控制系统(例如:php一句话木马)。

- 破坏硬盘数据，瘫痪全系统（例如xp_cmdshell "FORMAT C:"）。

- 获取系统最高权限后，可针对企业内部的任一管理系统做大规模破坏，甚至让其企业倒闭。

- 企业网站主页被窜改，门面尽失。

## 避免方法

- 在设计应用程序时，完全使用参数化查询（Parameterized Query）来设计数据访问功能。

- 在组合SQL字符串时，先针对所传入的参数加入其他字符（将单引号字符前加上转义字符）。

- 如果使用PHP开发网页程序的话，需加入转义字符之功能（自动将所有的网页传入参数，将单引号字符前加上转义字符）。

- 使用php开发，可写入html特殊函数，可正确阻挡XSS攻击。

- 其他，使用其他更安全的方式连接SQL数据库。例如已修正过SQL注入问题的数据库连接组件，例如ASP.NET的SqlDataSource对象或是 LINQ to SQL。

- 使用SQL防注入系统。

- 增强WAF的防御力

# 简单的例子

登录验证 SQL 如下：

```sql
strSQL = "SELECT * FROM users WHERE (name = '" + userName + "') and (pw = '"+ passWord +"');"
```

恶意填入：

```sql
userName = "1' OR '1'='1";
```

与

```sql
passWord = "1' OR '1'='1";
```

原本的 SQL 就变成了：

```sql
strSQL = "SELECT * FROM users WHERE (name = '1' OR '1'='1') and (pw = '1' OR '1'='1');"
```

也就是实际上运行的SQL命令会变成下面这样的

```sql
strSQL = "SELECT * FROM users;"
```

因此达到无账号密码，亦可登录网站。所以SQL注入被俗称为黑客的填空游戏。


# 个人的一些思路

（1）SQL 的预编译，就是使用 preparestatement。这个后面详细展开

（2）参数校验，针对用户输入，进行严格的参数校验。前端+后端

（3）特殊字符过滤。针对 `--` `/**/` `'` 这些字符，提前做好转义处理。

（4）安全信息加密。数据库中的敏感信息一定要加密，且不要直接使用 md5 这种，存在彩虹表。使用 salt + 加密的方式。

（5）减少用户输入，这是最简单有效的一点。能不让用户输入的地方，就不让用户输入。

下面我们针对 mybatis 的防注入，以及 druid 的防注入展开学习一下，这2个基本是工作中最常用的 2 个工具。

# Mybatis 防SQL注入

MyBatis框架作为一款半自动化的持久层框架，其SQL语句都要我们自己手动编写，这个时候当然需要防止SQL注入。

## mysql 的预编译处理

其实，MyBatis的SQL是一个具有“输入+输出”的功能，类似于函数的结构，如下：

```xml
<select id="getBlogById" resultType="Blog" parameterType="int">

        SELECT id,title,author,content

        FROM blog

        WHERE id=#{id}

</select>
```

这里，parameterType表示了输入的参数类型，resultType表示了输出的参数类型。回应上文，如果我们想防止SQL注入，理所当然地要在输入参数上下功夫。

上面代码中黄色高亮即输入参数在SQL中拼接的部分，传入参数后，打印出执行的SQL语句，会看到SQL是这样的：

```sql
SELECT id,title,author,content FROM blog WHERE id = ?
```

不管输入什么参数，打印出的SQL都是这样的。

这是因为MyBatis启用了预编译功能，在SQL执行前，会先将上面的SQL发送给数据库进行编译；执行时，直接使用编译好的SQL，替换占位符 `?` 就可以了。

因为SQL注入只能对编译过程起作用，所以这样的方式就很好地避免了SQL注入的问题。

## 底层实现原理

MyBatis是如何做到SQL预编译的呢？

其实在框架底层，是JDBC中的PreparedStatement类在起作用，PreparedStatement是我们很熟悉的Statement的子类，它的对象包含了编译好的SQL语句。

这种“准备好”的方式不仅能提高安全性，而且在多次执行同一个SQL时，能够提高效率。

原因是SQL已编译好，再次执行时无需再编译。

## mybatis 需要注意的地方

话说回来，是否我们使用MyBatis就一定可以防止SQL注入呢？

当然不是，请看下面的代码：

```xml
<select id="getBlogById" resultType="Blog" parameterType="int">

         SELECT id,title,author,content

         FROM blog

        WHERE id=${id}

</select>
```

仔细观察，内联参数的格式由 `#{xxx}` 变为了 `${xxx}`。

如果我们给参数“id”赋值为“3”，将SQL打印出来是这样的：

```sql
SELECT id,title,author,content FROM blog WHERE id = 3
```

显然，这样是无法阻止SQL注入的。在MyBatis中，`${xxx}`这样格式的参数会直接参与SQL编译，从而不能避免注入攻击。

但涉及到动态表名和列名时，只能使用`${xxx}`这样的参数格式。（比如说 order by id desc，排序经常会使用这种方式）

所以，这样的参数需要我们在代码中手工进行处理来防止注入。

## 结论

在编写MyBatis的映射语句时，尽量采用 `#{xxx}` 这样的格式。若不得不使用 `${xxx}` 这样的参数，要手工地做好过滤工作，来防止SQL注入攻击。

至于怎么防止，此处不再详细讨论。

你可以控制这部分用户无法输入，或者进行长度判断，特殊字符转义，提前添加 `1=1` 的过滤等。

# Druid 的防止注入方式

阿里的 druid 工具其实内置了防止 SQL 注入方式：

```xml
<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
    <!-- 数据源驱动类可不写，Druid默认会自动根据URL识别DriverClass -->
    <property name="driverClassName" value="${jdbc.driver}" />
    
    <!-- 基本属性 url、user、password -->
    <property name="url" value="${jdbc.url}" />
    <property name="username" value="${jdbc.username}" />
    <property name="password" value="${jdbc.password}" />
    <!-- 配置初始化大小、最小、最大 -->
    <property name="initialSize" value="${jdbc.initialSize}" />
    <property name="minIdle" value="${jdbc.minIdle}" />
    <property name="maxActive" value="${jdbc.maxActive}" />
    <!-- 配置获取连接等待超时的时间 -->
    <property name="maxWait" value="${jdbc.maxWait}" />
    <!-- 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒 -->
    <property name="timeBetweenEvictionRunsMillis" value="${jdbc.timeBetweenEvictionRunsMillis}" />
    <!-- 配置一个连接在池中最小生存的时间，单位是毫秒 -->
    <property name="minEvictableIdleTimeMillis" value="${jdbc.minEvictableIdleTimeMillis}" />
    <property name="validationQuery" value="${jdbc.testSql}" />
    <property name="testWhileIdle" value="true" />
    <property name="testOnBorrow" value="false" />
    <property name="testOnReturn" value="false" />
    <!-- 打开PSCache，并且指定每个连接上PSCache的大小 -->
    <property name="poolPreparedStatements" value="true" />
    <property name="maxPoolPreparedStatementPerConnectionSize" value="20" />
    <!-- 配置监控统计拦截的filters,和防sql注入 -->
    <property name="filters" value="stat,wall" />
</bean>
```

就是 filters 中可以指定。

这里其实我们可以参考阿里的工具实现原理，定制属于自己的防止注入手段。

# 拓展阅读

[web 安全系列]()

# 参考资料

[wiki](https://zh.wikipedia.org/wiki/SQL%E6%B3%A8%E5%85%A5)

[sql注入基础原理（超详细）](https://www.jianshu.com/p/078df7a35671)

[MyBatis以及Druid 防止sql注入攻击](https://blog.csdn.net/xiaolong2230/article/details/97274869)

[SQL注入基础整理及Tricks总结](https://www.anquanke.com/post/id/205376)

* any list
{:toc}