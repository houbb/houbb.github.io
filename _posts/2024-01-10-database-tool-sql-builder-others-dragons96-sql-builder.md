---
layout: post
title: 数据库查询工具 sql builder-dragons96 sql-builder 入门介绍 对其他组件的兼容性不错
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

# dragons96/sql-builder

https://github.com/dragons96/sql-builder

PS：整体而言，感觉这个设计的挺不错的。兼容的方式够多。

## SqlBuilder 一个简单易用的SQL建造器

### 功能简介

- 1. 支持增删改查sql建造, 支持构建预编译sql(Ps: jdbc集成方式均为预编译sql防止sql注入).

- 2. 强大的查询builder, 支持多表, 联表, 别名, 嵌套查询, 逻辑优先级等多种常见语法支持.

- 3. 面向对象思维, 除了基础查询传参方式外, 还支持map条件, criteria条件, 对于in, between and 等多值参数语法支持数组, 集合传参, 在criteria下还支持集合属性映射, 值映射
等功能.(例: Conditions.whereIn("a", 1, 2, 3 ,4) 等同于 Conditions.whereIn("a", Arrays.asList(1, 2, 3, 4))) (PS: 使用Map条件时, 若value为数组则必须使用对象类型数组例如new Integer[]{}, 而不能使用基础类型数组new int[]{})

- 4. 支持动态查询条件, 仅在条件成立时会生成对应sql片段, 支持Supplier接口提供具体值.(例: `Conditions.whereIn(true, "b", 1, 2).andEq(false, "a", () -> 5))`

- 5. SpringBoot JdbcTemplate, Mybatis-Plus无缝集成, 无需修改代码即可轻松使用。(Ps: Mybatis-Plus集成支持联表查询, 推荐使用BaseMapper#selectMaps方法获取联表数- 

- 6. 支持类似Mybatis-Plus语法的 lambda 表达式条件查询，(例: `Conditions.whereGe(User::getId, 3).andLike(User::getUsername, "dra"))`

### 使用方式

##### maven 引入配置

```xml
<dependency>
    <groupId>io.github.dragons96</groupId>
    <artifactId>sql-builder</artifactId>
    <version>0.0.5.3</version>
</dependency>
```

### 3分钟上手教程

##### 构建 DQL SQL

```java
import club.kingon.sql.builder.SqlBuilder;
import club.kingon.sql.builder.annotation.Table;
import club.kingon.sql.builder.entry.Alias;
import club.kingon.sql.builder.entry.Column;
import club.kingon.sql.builder.enums.Operator;

@Table("user")
class User {

    private String id;

    @club.kingon.sql.builder.annotation.Column("name")
    private String username;

    public String getUsername() {
        return username;
    }

    public String getId() {
        return id;
    }
}

class Example {
    public static void main(String[] args) {
        // 简单查询 "select * from table_a where column1 = 'aaa'"
        String sql1 = SqlBuilder.selectAll().from("table_a").where("column1 = 'aaa'").build();

        // 别名查询 "select column1 as c1, column2 as c2 from table_a as tba"
        String sql2 = SqlBuilder.select(Alias.of("column1", "c1"), Alias.of("column2", "c2")).from(Alias.of("table_a", "tba")).build();

        // 多表条件查询 "select tba.*, tbb.* from table_a as tba, table_b as tbb where tba.column3 = tbb.column3"
        String sql3 = SqlBuilder.select("tba.*", "tbb.*").from(Alias.of("table_a", "tba"), Alias.of("table_b", "tbb")).whereColumn("tba.column3", Operator.EQ, "tbb.column3").build();

        // 字段关联
        String sqlc = SqlBuilder.selectAll().from("table_a")
            .whereEq("column1", Column.as("column2"))
            .orEq("column1", Column.as("column2"))
            .andEq("column1", Column.as("column2"))
            .build();

        // 条件查询风格, 可根据个人习惯选择风格()
        String sql = SqlBuilder
            .selectAll()
            .from(Alias.of("table_a", "t1"))
            .where("column1 >= 3").and("column2 = 's'") // 方式一: 条件sql编写
            .or("column1", Operator.GE, 3).and("column2", Operator.EQ, "s") // 方式二: 完全参数形式编写
            .orGe("column1", 3).andEq("column2", "s")  // 方式二简写
            .or("column1 >= ?", 3).and("column2 = ?", "s") // 方式三: 模板传参形式编写, 模板传参形式值类型传入 "?" 符,  不支持字段名
            .build();

        // 使用Supplier增强条件, 防止入参处理中出现异常
        String text = null;
        String sqls = SqlBuilder
            .selectAll()
            .from("table_a")
            .where(text != null, "column1", Operator.IN, () -> text.split(",")) // 若直接填写 text.split(",") 将会抛出空指针异常
            .and(text == null, "column2", Operator.EQ, "text")
            .build();

        // 排序 "select * from table_a order by column1 asc, column2 asc, column3 desc, column4 desc"
        String sql5 = SqlBuilder.selectAll().from("table_a").orderByAsc("column1", "column2").addDesc("column3", "column4").build();

        // 限制数量 "select * from table_a limit 0, 10"
        String sql6 = SqlBuilder.selectAll().from("table_a").limit(0, 10).build();

        // 联表查询 "SELECT t1.*, t2.*, t3.*, t4.* FROM table_a as t1 JOIN table_b as t2 ON t1.column3 = t2.column3 LEFT JOIN table_c as t3 ON t1.column4 = t3.column4 RIGHT JOIN table_d as t4 ON t1.column5 = t4.column5"
        String sql7 = SqlBuilder.select("t1.*", "t2.*", "t3.*", "t4.*")
            .from(Alias.of("table_a", "t1"))
            .join(Alias.of("table_b", "t2"))
            .on("t1.column3", Operator.EQ, Column.as("t2.column3"))
            .leftJoin(Alias.of("table_c", "t3"))
            .on("t1.column4", Operator.EQ, Column.as("t3.column4"))
            .rightJoin(Alias.of("table_d", "t4"))
            .on("t1.column5", Operator.EQ, Column.as("t4.column5"))
            .build();

        // 嵌套查询 "SELECT * FROM (SELECT t1.* FROM table_a JOIN table_b ON table_a.column1 = table_b.column1 LIMIT 100) as t1 WHERE column7 BETWEEN 3 AND 10"
        String sql8 = SqlBuilder.selectAll()
            .from(
                Alias.of(
                    SqlBuilder.select("table_a.*")
                        .from("table_a")
                        .join("table_b")
                        .on("table_a.column1", Operator.EQ, Column.as("table_b.column1"))
                        .limit(100)
                    , "t1")
            ).where("column7", Operator.BETWEEN_AND, 3, 10)
            .build();

        // 2022-03-10 lambda表达式支持
        // select name from user where id >= 3 and name like '%dragons%'
        String sql10 = SqlBuilder.select(User::getUsername)
                .from(User.class)
                .whereGe(User::getId, 3)
                .andLike(User::getUsername, "dragons")
                .build();

        // 进阶内容
        // 条件优先级调整查询 "SELECT * FROM table_a, t1 WHERE column1 = 'aa' AND (column2 = 'cc' OR column7 > 10)"
        // 这里若直接连写默认and优先级会高于or, 若要提高or的优先级需要使用使用Conditions工具类生成中间条件
        String sql4 = SqlBuilder.selectAll()
            .from("table_a", "t1")
            .where("column1", Operator.EQ, "aa")
            .and(Conditions.where("column2", Operator.EQ, "cc").or("column7", Operator.GT, 10))
            .build();

        // 动态条件查询, 仅支持条件, 排序(业务场景通常筛选项为filter或sort)
        // "SELECT * FROM table_a as t1 WHERE t1.column3 = 'cc' ORDER BY t1.column7 DESC"
        String sql9 = SqlBuilder.selectAll()
            .from(Alias.of("table_a", "t1"))
            .where(false, "t1.column1 = 'aa'")
            .or(true, "t1.column3", Operator.EQ, "cc")
            .orderByAsc(false, "t1.column5")
            .addDesc(true, "t1.column7")
            .build();
    }
}
```

##### 构建 DML SQL

```java
import club.kingon.sql.builder.SqlBuilder;
import club.kingon.sql.builder.annotation.Primary;
import club.kingon.sql.builder.enums.Operator;

@Table("good")
class Goods {
    @Primary
    @Column("goods_id")
    private Integer id;

    @Column("goods_name")
    private String name;

    private Long price;

    /**
     * 映射 first_category字段
     */
    private String firstCategory;

    public Goods() {
    }

    public Goods(String name, Long price, String firstCategory) {
        this.name = name;
        this.price = price;
        this.firstCategory = firstCategory;
    }
}

class Example {
    public static void main(String[] args) {
        // 插入
        // 默认全部字段插入 "insert into table_a values('c1', 'c2'), ('cc1', 'cc2')"
        String sql1 = SqlBuilder.insertInto("table_a").values().addValue("c1", "c2").addValue("cc1", "cc2").build();

        // 指定插入字段 "insert into table_a(column1, column2) values('c1', 'c2'), ('cc1', 'cc2')"
        String sql2 = SqlBuilder.insertInto("table_a", "column1", "column2").values().addValue("cc1", "cc2").addValue("c1", "c2").build();

        // 指定插入字段 "insert ignore table_a(column1, column2) values('c1', 'c2'), ('cc1', 'cc2')"
        String sql3 = SqlBuilder.insertIgnore("table_a", "column1", "column2").values().addValue("cc1", "cc2").addValue("c1", "c2").build();

        // 指定插入字段 "replace into table_a(column1, column2) values('c1', 'c2'), ('cc1', 'cc2')"
        String sql4 = SqlBuilder.replaceInto("table_a", "column1", "column2").values().addValue("cc1", "cc2").addValue("c1", "c2").build();

        // 2021-12-07 更新, 支持model插入字段 "INSERT INTO good(price, goods_name, first_category, goods_id) VALUES(2300, 'name1', '手机', null)"
        String sqlm1 = SqlBuilder.insertInto(new Goods("name1", 2300L, "手机"))
            // 支持duplicate
//            .onDuplicateKeyUpdateColumn("goods_name")
            .build();

        // 修改
        // 纯sql条件 "update table_a set column1 = '3' where column2 = 'cc1'"
        String sql5 = SqlBuilder.update("table_a").set("column1 = '3'").where("column2 = 'cc1'").build();

        // 参数sql条件 "update table_a set column1 = '3' where column2 = 'cc1'" 
        String sql6 = SqlBuilder.update("table_a").set("column1", "3").where("column2", Operator.EQ, "cc1").build();

        // update from 语法 update table_a set table_a.column3 = table_b.column3 from table_b where table_a.column1 = table_b.column1
        String sql7 = SqlBuilder.update("table_a").setColumn("table_a.column3", "table_b.column3")
            .from("table_b").whereColumn("table_a.column1", Operator.EQ, "table_b.column1").build();

        // 2021-12-07 更新, 支持model更新字段 "UPDATE good SET goods_name = 'name1' WHERE goods_id = 1"
        // 主键id不为null则以主键id为基准查询，否则需自行添加额外判断条件
        String sqlm2 = SqlBuilder.update(new Goods(1, "name1", null, null))
            // 支持多条件查询
//            .and(...)
            .build();

        // 删除
        // "delete from table_a where column4 in ('a', 'b', 'c', 'd')"
        String sql8 = SqlBuilder.delete("table_a").where("column4", Operator.IN, "a", "b", "c", "d").build();
    }
}
```


### 拓展:
1. 条件查询默认按照条件优先级(and > or), 若希望优先级从左往右顺序执行, 可修改GlobalConfig.CONDITION_PRIORITY为ConditionPriority.LEFT_TO_RIGHT, 例如:

```java
import club.kingon.sql.builder.config.ConditionPriority;
import club.kingon.sql.builder.config.GlobalConfig;

public class Test {
    public static void main(String[] args) {
        // 直接运行生成的sql: a = 1 OR b IN (1, 2, 3) AND c LIKE '%xxx%'
        // 在数据库引擎中将会先执行 b in (1, 2, 3) and c like '%xxx%', 再将结果 or a = 1
        System.out.println(Conditions.whereEq("a", 1).orIn("b", 1, 2, 3).andLRlike("c", "xxx").build());

        // 若希望sql能够按照书写逻辑从左往右执行, 可配置如下代码
        GlobalConfig.CONDITION_PRIORITY = ConditionPriority.LEFT_TO_RIGHT;
        // 最终生成的sql: (a = 1 OR b IN (1, 2, 3)) AND c LIKE '%xxx%'
        // 该项可根据个人风格配置
        System.out.println(Conditions.whereEq("a", 1).orIn("b", 1, 2, 3).andLRlike("c", "xxx").build());
    }
}
```

### Mybatis-Plus 集成
#### 将QueryWrapper换至SimpleSqlBuilderQueryWrapper使用即可

1. 编写实体类
```java
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("xxx")
public class Item {

    private String category;

    private String goodsId;

    private String goodsName;
}

```
2. 编写dao层接口

```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

@Mapper
public interface ItemMapper extends BaseMapper<Item> {
}
```
3. 编写控制器测试

```java

import club.kingon.sql.builder.Conditions;
import club.kingon.sql.builder.enums.Operator;
import club.kingon.sql.builder.spring.QuerySqlBuilder;
import club.kingon.sql.builder.spring.mybatisplus.query.MybatisQuerySqlBuilder;
import club.kingon.sql.builder.spring.mybatisplus.wrapper.SimpleSqlBuilderQueryWrapper;
import com.example.dao.ItemMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @Autowired
    private ItemMapper mapper;

    @GetMapping("/xxx")
    public List<Item> items() {
        return mapper.selectList(new SimpleSqlBuilderQueryWrapper<Item>(
            MybatisQuerySqlBuilder.I
                .where(Item::getGoodsId, Operator.IN, 1, 2, 3, 4)
                .orderByAsc("goods_id")
                .limit(0, 10)
        ));
    }
}
```

4.(拓展) mp 支持联表查询示例

```java
import club.kingon.sql.builder.config.GlobalConfig;
import club.kingon.sql.builder.entry.Alias;
import club.kingon.sql.builder.entry.Column;
import club.kingon.sql.builder.spring.mybatisplus.query.MybatisQuerySqlBuilder;
import club.kingon.sql.builder.spring.mybatisplus.util.ConversionHelper;
import club.kingon.sql.builder.spring.mybatisplus.wrapper.SimpleSqlBuilderQueryWrapper;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

// 实体
@Data
@TableName("user")
class User {
    private Integer id;

    private String name;

    @TableField(exist = false)
    private List<Address> addressList;
}

@Data
@TableName("address")
class Address {
    private Integer id;

    private Integer userId;

    private String place;
}

// mapper
public interface UserMapper extends BaseMapper<User> {

}

@RestController
public class TestController {

    @Autowired
    private UserMapper userMapper;

    static {
        // 提前开启lambda表达式表名模式
        GlobalConfig.OPEN_LAMBDA_TABLE_NAME_MODE = true;
    }

    /* 查询用户及用户下的所有地址 */
    public List<User> getUserAndOrders(Integer id) {
        // select user.id, user.name, address.id as address_id, place from user left join address on user.id = address.user_id where user.id >= #{id}
        List<Map<String, Object>> maps = userMapper.selectMaps(new SimpleSqlBuilderQueryWrapper<User>(
            MybatisQuerySqlBuilder.I
                .leftJoin(Address.class)
                .onEq(User::getId, Column.as(Address::getUserId))
                .whereGe(id != null, User::getId, id)
        ).select(User.class).select(Alias(Address::getId, "address_id")).select(Address::getPlace));
        // 使用转换工具转换为聚合对象
        // 由于user表字段未存在别名，可直接使用User.class装载, 若User存在字段别名, 则应使用Function装载
        List<User> users = ConversionHelper.mapToBeanMany(maps, User.class, User::getAddressList, map -> {
            Address a = new Address();
            a.setId((Integer)map.get("address_id"));
            a.setPlace((String)map.get("place"));
            return a;
        });
        return users;
    }
}
```

### 集成 Spring JdbcTemplate(Mybatis 也可使用 JdbcTemplate 处理), 以商品查询为例 (仅简单使用示例， 具体业务实现可自行封装集成)

```java
import club.kingon.sql.builder.FromSqlBuilder;
import club.kingon.sql.builder.SqlBuilder;
import club.kingon.sql.builder.enums.Operator;
import club.kingon.sql.builder.spring.util.MapperUtils;
import club.kingon.sql.builder.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * 商品信息
 */
class Goods {
    /**
     * 设置mysql字段映射
     */
    @Column("id")
    private Integer goodsId;

    private String goodsName;

    private BigDecimal price;

    /** 0:无效, 1:有效 **/
    private Integer status;
    // 省略getter setter
}

/**
 * 商品服务demo
 */
@Service
public class GoodsService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final static FromSqlBuilder PREFIX_BUILDER = SqlBuilder.selectAll().from("goods_tb");

    /**
     * 分页查询
     */
    public List<Goods> select(int pageNo, int pageSize) {
        return jdbcTemplate.query(
            PREFIX_BUILDER
                .limit((pageNo - 1) * pageSize, pageSize)
                .build()
            , MapperUtils.getMapper(Goods.class));
    }

    /**
     * 分页查询有效商品
     */
    public List<Goods> selectEffect(int pageNo, int pageSize) {
        return jdbcTemplate.query(
            PREFIX_BUILDER
                .where("status", Operator.EQ, 1)
                .limit((pageNo - 1) * pageSize, pageSize)
                .build()
            , MapperUtils.getMapper(Goods.class));
    }

    /**
     * 分页商品名搜索有效商品
     */
    public List<Goods> selectEffectByName(String likeGoodsName, int pageNo, int pageSize) {
        return jdbcTemplate.query(
            PREFIX_BUILDER
                .where("status", Operator.EQ, 1)
                .and("goods_name", Operator.LRLIKE, likeGoodsName)
                .limit((pageNo - 1) * pageSize, pageSize)
                .build()
            , MapperUtils.getMapper(Goods.class));
    }
}
```

##### 2022-11-18 新增in, not in语法自动抹除空列表

```java

import club.kingon.sql.builder.SqlBuilder;

import java.util.Arrays;

class Example {
    public static void main(String[] args) {
        // 修改前: select * from table_a where a in () and b = 1
        // 修改后: select * from table_a where b = 1
        SqlBuilder.selectAll().from("table_a").whereIn("a", Arrays.asList()).andEq("b", 1);
    }
}
```

##### 2022-03-22 新增mybatis-plus联表maps转换javabean辅助工具ConversionHelper类

##### 2022-03-11 支持sql严格模式及Lambda字段组合表名查询(联表场景)

```java
import club.kingon.sql.builder.LMDFunction;
import club.kingon.sql.builder.SqlBuilder;
import club.kingon.sql.builder.config.GlobalConfig;

@Table("users")
class User {
    @Column("name")
    private String username;

    private Long id;

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }
}

public class Test {
    public static void main(String[] args) {
        // 开启Lambda表名字段查询模式
        GlobalConfig.OPEN_LAMBDA_TABLE_NAME_MODE = true;
        // select users.name from users where users.id > 1 
        System.out.println(
            SqlBuilder.select(User::getUsername)
                .from(User.class)
                .whereGt(User::getId, 1)
                .build()
        );
        // 开启SQL严格模式
        GlobalConfig.OPEN_STRICT_MODE = true;
        // select `users`.`name` from `users` where `users`.`id` > 1
        System.out.println(
            SqlBuilder.select(User::getUsername)
                .from(User.class)
                .whereGt(User::getId, 1)
                .build()
        );
    }
}
```

##### 2022-03-10 支持Lambda表达式条件查询支持

```java
import club.kingon.sql.builder.LMDFunction;
import club.kingon.sql.builder.SqlBuilder;
import club.kingon.sql.builder.annotation.Column;
import club.kingon.sql.builder.annotation.Table;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;

@Table("users")
class User {
    @Column("name")
    private String username;

    private Long id;

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }
}

public class Test {
    public static void main(String[] args) {
        // select * from users where name like '%dragons%' and id >= 3
        System.out.println(
            SqlBuilder.selectAll()
                .from(User.class)
                .whereLike(User::getUsername, "dragons")
                .andGe(User::getId, 3)
                .build()
        );
    }
}
```


##### 2022-03-09 增强查询对象, 支持动态字段支持


```java
package club.kingon.sql.builder.example;

import club.kingon.sql.builder.SqlBuilder;
import club.kingon.sql.builder.annotation.Query;
import club.kingon.sql.builder.enums.Operator;

import java.util.Arrays;
import java.util.List;

class Tag {
    private String type;
    private List<Object> values;
    public Tag(String type, List<Object> values) {
        this.type = type;
        this.values = values;
    }

    public String getType() {
        return type;
    }
}

class TagQueryCriteria {
    @Query(value = "${type}", type = Operator.IN, attr = "values")
    private List<Tag> tags;
    public TagQueryCriteria(List<Tag> tags) {
        this.tags = tags;
    }
}

/**
 * @author dragons
 * @date 2022/3/9 12:22
 */
public class SimpleQuerySql4 {
    public static void main(String[] args) {
        // select * from table_a where id in (4, 5) and cat in ("7", "8")
        System.out.println(SqlBuilder.selectAll()
            .from("table_a")
            .where(new TagQueryCriteria(Arrays.asList(
                new Tag("id", Arrays.asList(4, 5)),
                new Tag("cat", Arrays.asList("7", "8"))
            )))
            .build()
        );
    }
}
```

##### 2022-01-20 新增预编译SQL支持

```java
class Example {
    public static void main(String[] args) {
        SQLBuilder builder = SQLBuilder
            .select("t1.*", "t2.*")
            .from("t1")
            .join("t2")
            .on("t1.a = t2.a")
            .where("t1.b", Operator.GE, 10)
            .or("t2.b", Operator.LE, 5)
            .or(Conditions.where("t1.c", Operator.IN, 3, 4, 5).and("t2.c", Operator.BETWEEN_AND, 5, 10))
            .and("t1.b", Operator.LRLIKE, 1)
            .groupBy("t1.z")
            .having("count(1)", Operator.GE, 100)
            .orderBy("t1.z", Order.ASC)
            .limit(10, 100);
        // 获取完整SQL 
        // SELECT t1.*, t2.* FROM t1 JOIN t2 ON t1.a = t2.a WHERE (t1.b >= 10 OR t2.b <= 5 OR (t1.c IN (3, 4, 5) AND t2.c BETWEEN 5 AND 10)) AND t1.b LIKE '%1%' GROUP BY t1.z HAVING count(1) >= 100 ORDER BY t1.z ASC LIMIT 10, 100
        System.out.println(builder.build());
        // 获取预编译SQL
        // SELECT t1.*, t2.* FROM t1 JOIN t2 ON t1.a = t2.a WHERE (t1.b >= ? OR t2.b <= ? OR (t1.c IN (?, ?, ?) AND t2.c BETWEEN ? AND ?)) AND t1.b LIKE ? GROUP BY t1.z HAVING count(1) >= ? ORDER BY t1.z ASC LIMIT ?, ?
        System.out.println(builder.precompileSql());
        // 获取预编译SQL参数
        // [10, 5, 3, 4, 5, 5, 10, %1%, 100, 10, 100]
        System.out.println(Arrays.toString(builder.precompileArgs()));
    }
}
```

##### 2021-12-09 新增Model支持

```java

import club.kingon.sql.builder.SqlBuilder;
import club.kingon.sql.builder.annotation.Column;
import club.kingon.sql.builder.annotation.Primary;
import club.kingon.sql.builder.annotation.Query;
import club.kingon.sql.builder.enums.Operator;

import java.util.Arrays;

class Example {
    public static void main(String[] args) {
        System.out.println(
            // SqlBuilder.model(Class) => SqlBuilder.select(...).from(...)
            // 查询商品表中价格大于等于10，且状态为1,2,3的商品名称带有手机的商品
            // select id, goods_name, status from goods_tb where price >= 10 and goods_name like '%手机%' and status in (1, 2, 3)
            SqlBuilder.model(Goods.class)
                .where("price >= 10")
                .and(new GoodsCriteria(null, "手机", Arrays.asList(1, 2, 3)))
                .build()
        );
    }
}

@Table("goods_tb")
class Goods {
    @Primary
    @Column("goods_id")
    private Integer id;
    /**
     * 默认映射 goods_name
     */
    private String goodsName;

    private Integer status;
}

class GoodsCriteria {
    /**
     * goods_id 精确查询
     */
    @Query(value = "goods_id", type = Operator.EQ)
    private Integer goodsIdEq;
    /**
     * goods_name 模糊查询
     */
    @Query(value = "goods_name", type = Operator.LRLIKE)
    private String goodsNameLRLike;
    /**
     * in 查询
     */
    @Query(value = "status", type = Operator.IN)
    private List<Integer> statusIn;

    public GoodsCriteria(Integer goodsIdEq, String goodsNameLRLike, List<Integer> statusIn) {
        this.goodsIdEq = goodsIdEq;
        this.goodsNameLRLike = goodsNameLRLike;
        this.statusIn = statusIn;
    }
}
```

# 参考资料


* any list
{:toc}