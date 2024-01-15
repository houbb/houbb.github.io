---
layout: post
title: database Jdbc-02-PreprareStatement & Statement
date:  2018-10-07 14:51:25 +0800
categories: [Database]
tags: [database, jdbc, sql, sh]
published: true
---

# 执行计划的区别

以Oracle为例吧

Statement为一条Sql语句生成执行计划，

如果要执行两条sql语句

```sql
select colume from table where colume=1;
select colume from table where colume=2;
```

会生成两个执行计划

一千个查询就生成一千个执行计划！

PreparedStatement用于使用绑定变量重用执行计划

```sql
select colume from table where colume=:x;
```

通过set不同数据只需要生成一次执行计划，可以重用

# PreparedStatement vs Statement

## 优点

在JDBC应用中,如果你已经是稍有水平开发者,你就应该始终以PreparedStatement代替Statement.也就是说,在任何时候都不要使用Statement.

基于以下的原因:

## 一.代码的可读性和可维护性.

虽然用PreparedStatement来代替Statement会使代码多出几行,但这样的代码无论从可读性还是可维护性上来说.

都比直接用Statement的代码高很多档次:

```java
stmt.executeUpdate("insertintotb_name(col1,col2,col2,col4)values('"+var1+"','"+var2+"',"+var3+",'"+var4+"')");

perstmt=con.prepareStatement("insertintotb_name(col1,col2,col2,col4)values(?,?,?,?)");
perstmt.setString(1,var1);
perstmt.setString(2,var2);
perstmt.setString(3,var3);
perstmt.setString(4,var4);
perstmt.executeUpdate();
```
不用我多说,对于第一种方法.别说其他人去读你的代码,就是你自己过一段时间再去读,都会觉得伤心.

## 二.PreparedStatement尽最大可能提高性能.

每一种数据库都会尽最大努力对预编译语句提供最大的性能优化.因为预编译语句有可能被重复调用.所以语句在被DB的编译器编译后的执行代码被缓存下来,那么下次调用时只要是相同的预编译语句就不需要编译,只要将参数直接传入编译过的语句执行代码中(相当于一个涵数)就会得到执行.这并不是说只有一个Connection中多次执行的预编译语句被缓存,而是对于整个DB中,只要预编译的语句语法和缓存中匹配.那么在任何时候就可以不需要再次编译而可以直接执行.而statement的语句中,即使是相同一操作,而由于每次操作的数据不同所以使整个语句相匹配的机会极小,几乎不太可能匹配.比如:

```sql
insert intot b_name(col1,col2)values('11','22');
insert intot b_name(col1,col2)values('11','23');
```

即使是相同操作但因为数据内容不一样,所以整个个语句本身不能匹配,没有缓存语句的意义.事实是没有数据库会对普通语句编译后的执行代码缓存.

当然并不是所有预编译语句都一定会被缓存,数据库本身会用一种策略,比如使用频度等因素来决定什么时候不再缓存已有的预编译结果.以保存有更多的空间存储新的预编译语句.

# 三.最重要的一点是极大地提高了安全性.

即使到目前为止,仍有一些人连基本的恶义SQL语法都不知道.

```java
String sql="select*fromtb_namewherename='"+varname+"'andpasswd='"+varpasswd+"'";
```

如果我们把['or'1'='1]作为varpasswd传入进来.用户名随意,看看会成为什么?

```sql
select*fromtb_name='随意'andpasswd=''or'1'='1';
```

因为'1'='1'肯定成立,所以可以任何通过验证.更有甚者:

把`[';droptabletb_name;]`作为varpasswd传入进来,则:

select*fromtb_name='随意'andpasswd='';droptabletb_name;

有些数据库是不会让你成功的,但也有很多数据库就可以使这些语句得到执行.

而如果你使用预编译语句.你传入的任何内容就不会和原来的语句发生任何匹配的关系.只要全使用预编译语句,你就用不着对传入的数据做任何过虑.

而如果使用普通的statement,有可能要对drop,;等做费尽心机的判断和过虑.

## 分情况使用Statement和PreparedStatement对象

JDBC驱动的最佳化是基于使用的是什么功能. 选择PreparedStatement还是Statement取决于你要怎么使用它们. 对于只执行一次的SQL语句选择Statement是最好的. 相反, 如果SQL语句被多次执行选用PreparedStatement是最好的.

PreparedStatement的第一次执行消耗是很高的. 它的性能体现在后面的重复执行. 使用PreparedStatement的方式来执行一个针对数据库表的查询. JDBC驱动会发送一个网络请求到数据解析和优化这个查询. 而执行时会产生另一个网络请求. 在JDBC驱动中，减少网络通讯是最终的目的. 如果我的程序在运行期间只需要一次请求, 那么就使用Statement. 对于Statement, 同一个查询只会产生一次网络到数据库的通讯.

对于使用PreparedStatement池的情况下,当使用PreparedStatement池时, 如果一个查询很特殊, 并且不太会再次执行到, 那么可以使用Statement. 如果一个查询很少会被执行,但连接池中的Statement池可能被再次执行, 那么请使用PreparedStatement. 在不是Statement池的同样情况下, 请使用Statement.

## PreparedStatement的Batch功能

Update大量的数据时, 先构建一个INSERT语句再多次的执行, 会导致很多次的网络连接.。要减少JDBC的调用次数改善性能, 可以使用PreparedStatement的AddBatch()方法一次性发送多个查询给数据库。

初始实现：

```java
PreparedStatement ps = conn.prepareStatement(  
   "INSERT into db_user values (?, ?, ?)");  
 
for (n = 0; n < 100; n++) {  
 
  ps.setString(name[n]);  
  ps.setLong(id[n]);  
  ps.setInt(salary[n]);  
  ps.executeUpdate();  
}  
```

```java
//使用Batch功能
PreparedStatement ps = conn.prepareStatement(  
   "INSERT into db_user values (?, ?, ?)");  
 
for (n = 0; n < 100; n++) {  
 
  ps.setString(username[n]);  
  ps.setString(password[n]);   
  ps.addBatch();  
}  
ps.executeBatch();
```

在初始实现中, PreparedStatement被用来多次执行INSERT语句。 

在这里，执行了100次INSERT操作， 共有101次网络往返。 

其中，1次往返是预储statement, 另外100次往返执行每个迭代。 

在改进实现中, 当在100次INSERT操作中使用addBatch()方法时, 只有两次网络往返。 

1次往返是预储statement, 另一次是执行batch命令。虽然Batch命令会用到更多的数据库的CPU周期， 但是通过减少网络往返，性能得到提高。 

记住，JDBC的性能最大的增进是减少JDBC驱动与数据库之间的网络通讯。

注：Oracel 10G的JDBC Driver限制最大Batch size是16383条，如果addBatch超过这个限制，那么executeBatch时就会出现“无效的批值”（Invalid Batch Value）异常。

因此在如果使用的是Oracle10G，在此bug减少前，Batch size需要控制在一定的限度。

# 参考资料 

[PreparedStatement和Statement区别详解](https://www.cnblogs.com/weiyi1314/p/6638483.html)

[JDBC中的Statement和PreparedStatement的区别](https://blog.csdn.net/qpzkobe/article/details/79283709)

* any list
{:toc}