---
layout: post
title: Mybatis PageHelper
date:  2018-10-27 06:41:12 +0800
categories: [Mybatis]
tags: [mybatis, java, sf]
published: true
excerpt:  Mybatis 分页插件 PageHelper
---

# Mybatis PageHelper

[MyBatis 分页插件 PageHelper](https://pagehelper.github.io/)

如果你也在用 MyBatis，建议尝试该分页插件，这一定是最方便使用的分页插件。分页插件支持任何复杂的单表、多表分页。

## 特性

### 物理分页

支持常见的 12 种数据库。

Oracle,MySql,MariaDB,SQLite,DB2,PostgreSQL,SqlServer 等

### 支持多种分页方式

支持常见的RowBounds(PageRowBounds)，
PageHelper.startPage 方法调用，
Mapper 接口参数调用

### QueryInterceptor 规范

使用 QueryInterceptor 规范，开发插件更轻松。


# 快速开始

## maven 导入

```xml
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper</artifactId>
    <version>最新版本</version>
</dependency>
```

## 配置拦截器

特别注意，新版拦截器是 `com.github.pagehelper.PageInterceptor`。 

`com.github.pagehelper.PageHelper` 现在是一个特殊的 dialect 实现类，是分页插件的默认实现类，提供了和以前相同的用法。

### mybatis 配置

```xml
<!--
    plugins在配置文件中的位置必须符合要求，否则会报错，顺序如下:
    properties?, settings?,
    typeAliases?, typeHandlers?,
    objectFactory?,objectWrapperFactory?,
    plugins?,
    environments?, databaseIdProvider?, mappers?
-->
<plugins>
    <!-- com.github.pagehelper为PageHelper类所在包名 -->
    <plugin interceptor="com.github.pagehelper.PageInterceptor">
        <!-- 使用下面的方式配置参数，后面会有所有的参数介绍 -->
        <property name="param1" value="value1"/>
	</plugin>
</plugins>
```

### spring 配置

使用 spring 的属性配置方式，可以使用 plugins 属性像下面这样配置：

```xml
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
  <!-- 注意其他配置 -->
  <property name="plugins">
    <array>
      <bean class="com.github.pagehelper.PageInterceptor">
        <property name="properties">
          <!--使用下面的方式配置参数，一行配置一个 -->
          <value>
            params=value1
          </value>
        </property>
      </bean>
    </array>
  </property>
</bean>
```

# 常见使用方式

```java
//第一种，RowBounds方式的调用
List<Country> list = sqlSession.selectList("x.y.selectIf", null, new RowBounds(0, 10));

//第二种，Mapper接口方式的调用，推荐这种使用方式。
PageHelper.startPage(1, 10);
List<Country> list = countryMapper.selectIf(1);

//第三种，Mapper接口方式的调用，推荐这种使用方式。
PageHelper.offsetPage(1, 10);
List<Country> list = countryMapper.selectIf(1);

//第四种，参数方法调用
//存在以下 Mapper 接口方法，你不需要在 xml 处理后两个参数
public interface CountryMapper {
    List<Country> selectByPageNumSize(
            @Param("user") User user,
            @Param("pageNum") int pageNum,
            @Param("pageSize") int pageSize);
}
//配置supportMethodsArguments=true
//在代码中直接调用：
List<Country> list = countryMapper.selectByPageNumSize(user, 1, 10);

//第五种，参数对象
//如果 pageNum 和 pageSize 存在于 User 对象中，只要参数有值，也会被分页
//有如下 User 对象
public class User {
    //其他fields
    //下面两个参数名和 params 配置的名字一致
    private Integer pageNum;
    private Integer pageSize;
}
//存在以下 Mapper 接口方法，你不需要在 xml 处理后两个参数
public interface CountryMapper {
    List<Country> selectByPageNumSize(User user);
}
//当 user 中的 pageNum!= null && pageSize!= null 时，会自动分页
List<Country> list = countryMapper.selectByPageNumSize(user);

//第六种，ISelect 接口方式
//jdk6,7用法，创建接口
Page<Country> page = PageHelper.startPage(1, 10).doSelectPage(new ISelect() {
    @Override
    public void doSelect() {
        countryMapper.selectGroupBy();
    }
});
//jdk8 lambda用法
Page<Country> page = PageHelper.startPage(1, 10).doSelectPage(()-> countryMapper.selectGroupBy());

//也可以直接返回PageInfo，注意doSelectPageInfo方法和doSelectPage
pageInfo = PageHelper.startPage(1, 10).doSelectPageInfo(new ISelect() {
    @Override
    public void doSelect() {
        countryMapper.selectGroupBy();
    }
});
//对应的lambda用法
pageInfo = PageHelper.startPage(1, 10).doSelectPageInfo(() -> countryMapper.selectGroupBy());

//count查询，返回一个查询语句的count数
long total = PageHelper.count(new ISelect() {
    @Override
    public void doSelect() {
        countryMapper.selectLike(country);
    }
});
//lambda
total = PageHelper.count(()->countryMapper.selectLike(country));
```

# 注意事项

## PageHelper.startPage方法重要提示

只有紧跟在PageHelper.startPage方法后的第一个Mybatis的查询（Select）方法会被分页。

## 请不要配置多个分页插件

请不要在系统中配置多个分页插件(使用Spring时,mybatis-config.xml和Spring`<bean>`配置方式，请选择其中一种，不要同时配置多个分页插件)！

## 分页插件不支持带有for update语句的分页

对于带有for update的sql，会抛出运行时异常，对于这样的sql建议手动分页，毕竟这样的sql需要重视。

## 分页插件不支持嵌套结果映射

由于嵌套结果方式会导致结果集被折叠，因此分页查询的结果在折叠后总数会减少，所以无法保证分页结果数量正确。

# 什么时候会导致不安全的分页？

PageHelper 方法使用了静态的 ThreadLocal 参数，分页参数和线程是绑定的。

只要你可以保证在 PageHelper 方法调用后紧跟 MyBatis 查询方法，这就是安全的。因为 PageHelper 在 finally 代码段中自动清除了 ThreadLocal 存储的对象。

如果代码在进入 Executor 前发生异常，就会导致线程不可用，这属于人为的 Bug（例如接口方法和 XML 中的不匹配，导致找不到 MappedStatement 时）， 这种情况由于线程不可用，也不会导致 ThreadLocal 参数被错误的使用。

## 错误写法

但是如果你写出下面这样的代码，就是不安全的用法：

```java
PageHelper.startPage(1, 10);
List<Country> list;
if(param1 != null){
    list = countryMapper.selectIf(param1);
} else {
    list = new ArrayList<Country>();
}
```

这种情况下由于 param1 存在 null 的情况，就会导致 PageHelper 生产了一个分页参数，但是没有被消费，这个参数就会一直保留在这个线程上。当这个线程再次被使用时，就可能导致不该分页的方法去消费这个分页参数，这就产生了莫名其妙的分页。

## 正确写法

上面这个代码，应该写成下面这个样子：

```java
List<Country> list;
if(param1 != null){
    PageHelper.startPage(1, 10);
    list = countryMapper.selectIf(param1);
} else {
    list = new ArrayList<Country>();
}
```

# 实现原理

实现拦截器，对 sql 添加分页处理。

# 个人启发

## 偷懒

如果一个勤勉的人，也不会去思考去实现一个分页插件。

## 偷懒的代价

要知道原理。

而且数据库类型众多，想实现一个通用的插件并不容易。

所以就需要良好的接口设计+开源。

# 参考资料

[如何使用分页插件](https://pagehelper.github.io/docs/howtouse/)

[QueryInterceptor 规范](https://pagehelper.github.io/docs/interceptor/)

- 实现原理

https://blog.csdn.net/jaryle/article/details/52315565

https://blog.csdn.net/chenbaige/article/details/72084481

https://blog.csdn.net/yangjiachang1203/article/details/52639800

* any list
{:toc}