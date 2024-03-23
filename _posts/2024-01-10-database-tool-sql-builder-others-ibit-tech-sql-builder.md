---
layout: post
title: 数据库查询工具 sql builder-ibit-tech 入门介绍
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

# sql-builder

> https://github.com/ibit-tech/sql-builder

# sql-builder（2.x)

## 关于sql-builder

[sql-builder](https://github.com/ibit-tech/sql-builder)尝试使用java对象，通过`类SQL`的拼接方式，动态快速的生成SQL。

## 核心类说明


### 使用`SqlFactory` 构造Sql对象

```java
public class SqlFactory {

    /**
     * 构造函数
     */
    private SqlFactory() {
    }

    /**
     * 创建搜索
     *
     * @return 搜索sql
     */
    public static QuerySql createQuery() {
        return new QuerySqlImpl();
    }

    /**
     * 创建计数
     *
     * @return 计数sql
     */
    public static CountSql createCount() {
        return new CountSqlImpl();
    }

    /**
     * 创建删除
     *
     * @return 删除sql
     */
    public static DeleteSql createDelete() {
        return new DeleteSqlImpl();
    }

    /**
     * 创建插入
     *
     * @return 插入sql
     */
    public static InsertSql createInsert() {
        return new InsertSqlImpl();
    }

    /**
     * 创建更新
     *
     * @return 更新sql
     */
    public static UpdateSql createUpdate() {
        return new UpdateSqlImpl();
    }

}
```

### sql对象说明

| 接口 | 说明 |
| --- | --- | 
| QuerySql | 查询 |
| CountSql | 计数 |
| DeleteSql | 删除 |
| InsertSql | 插入 |
| UpdateSql | 更新 |

**说明**： 上述类都继承 `SqlSupport<T>`, 方法 PrepareStatement getPrepareStatement(); 返回的对应的预查询sql对象（包含预查询sql和对应参数列表）。

### `PrepareStatement` 说明

```java
public class PrepareStatement {

    /**
     * 预查询SQL
     */
    private String prepareSql;

    /**
     * 插入值列表
     */
    private List<ColumnValue> values;
    
    // 省略方法

}
```

**说明**: values 为 ColumnValue, 主要为了之后做字段加密解密预留的，知道对应列与相应的值。



## Sql构造示例

详细测试用例查看：`tech.ibit.sqlbuilder.SqlTest`

### select

```java
// 传入列
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name)
        )
        .from(UserProperties.TABLE);
assertPrepareStatementEquals("SELECT u.user_id, u.name FROM user u", sql.getPrepareStatement());

// 支持聚合函数
sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId.sum("user_id_sum"),
                        UserProperties.userId.avg("user_id_avg")
                )
        ).from(UserProperties.TABLE)
        .groupBy(UserProperties.userId);
assertPrepareStatementEquals(
        "SELECT SUM(u.user_id) AS user_id_sum, AVG(u.user_id) AS user_id_avg FROM user u GROUP BY u.user_id",
        sql.getPrepareStatement());

```

### select distinct

```java
QuerySql sql = SqlFactory.createQuery()
        .distinct()
        .column(UserProperties.email)
        .from(UserProperties.TABLE);
assertPrepareStatementEquals(
        "SELECT DISTINCT u.email FROM user u",
        sql.getPrepareStatement());
```

### select 传入类

```java
QuerySql sql = SqlFactory.createQuery()
        .columnPo(UserPo.class)
        .from(UserProperties.TABLE);

assertPrepareStatementEquals(
        "SELECT u.user_id, u.login_id, u.email, u.mobile_phone, u.type FROM user u",
        sql.getPrepareStatement());

```

### select distinct 传入类

```java
QuerySql sql = SqlFactory.createQuery()
        .distinct()
        .columnPo(UserPo.class)
        .from(UserProperties.TABLE).limit(1000);

assertPrepareStatementEquals(
        "SELECT DISTINCT u.user_id, u.login_id, u.email, u.mobile_phone, u.type FROM user u LIMIT ?, ?",
        Arrays.asList(
                getStartColumn().value(0),
                getLimitColumn().value(1000)
        ), sql.getPrepareStatement());
```

### count

```java
CountSql sql = SqlFactory.createCount()
        .from(UserProperties.TABLE);
assertPrepareStatementEquals("SELECT COUNT(*) FROM user u", sql.getPrepareStatement());
```

### count distinct

```java
// 传入单列
CountSql sql = SqlFactory.createCount()
        .distinct()
        .column(UserProperties.userId)
        .from(UserProperties.TABLE);
assertPrepareStatementEquals(
        "SELECT COUNT(DISTINCT u.user_id) FROM user u",
        sql.getPrepareStatement());

sql = SqlFactory.createCount()
        .distinct()
        .column(
                Arrays.asList(
                        UserProperties.name,
                        UserProperties.email
                )
        )
        .from(UserProperties.TABLE);
assertPrepareStatementEquals(
        "SELECT COUNT(DISTINCT u.name, u.email) FROM user u",
        sql.getPrepareStatement());

```

### count 聚合列 

```java
// 如果存在 group by，则 group by 列作为 distinct 列
Sql countSql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId.sum("user_id_sum"),
                        UserProperties.userId.avg("user_id_avg"))
        ).from(UserProperties.TABLE)
        .groupBy(UserProperties.userId).toCountSql();

assertPrepareStatementEquals(
        "SELECT COUNT(DISTINCT u.user_id) FROM user u",
        countSql.getPrepareStatement());


// 如果只存在聚合列，但是不存在 group by 则永远返回1
countSql = SqlFactory.createQuery()
        .column(
                Collections.singletonList(
                        UserProperties.userId.count("user_id_total")
                )
        ).from(UserProperties.TABLE).toCountSql();
assertPrepareStatementEquals(
        "SELECT COUNT(DISTINCT 1) FROM user u",
        countSql.getPrepareStatement());
```

### delete from（异常）

```java
// 删除操作必须包含where语句，不然这个操作很危险
DeleteSql sql = SqlFactory.createDelete()
        .deleteFrom(UserProperties.TABLE);
thrown.expect(RuntimeException.class);
thrown.expectMessage("Where cannot be empty when do deleting!");
sql.getPrepareStatement();
```

### delete from（单表删除）

```java
// 代码片段1：正常删除
DeleteSql sql = SqlFactory.createDelete()
        .deleteFrom(UserProperties.TABLE)
        .andWhere(UserProperties.userId.eq(1));
assertPrepareStatementEquals(
        "DELETE FROM user WHERE user_id = ?",
        Collections.singletonList(
                UserProperties.userId.value(1)
        ),
        sql.getPrepareStatement());
        
// 代码片段2：等价于代码片段1
sql = SqlFactory.createDelete()
        .deleteFrom(UserProperties.TABLE)
        .andWhere(UserProperties.userId.eq(1))
        .leftJoinOn(
                OrganizationProperties.TABLE,
                Arrays.asList(
                        UserProperties.orgId,
                        OrganizationProperties.orgId
                )
        );
assertPrepareStatementEquals(
        "DELETE u.* FROM user u LEFT JOIN organization o ON u.org_id = o.org_id WHERE u.user_id = ?",
        Collections.singletonList(
                UserProperties.userId.value(1)
        ),
        sql.getPrepareStatement());           
```

### delete from（多表删除）

```java
// 代码片段1：支持join on
DeleteSql sql = SqlFactory.createDelete()
        .deleteFrom(UserProperties.TABLE)
        .andWhere(UserProperties.userId.eq(1))
        .leftJoinOn(
                OrganizationProperties.TABLE,
                Arrays.asList(
                        UserProperties.orgId,
                        OrganizationProperties.orgId
                )
        );
assertPrepareStatementEquals(
        "DELETE u.* FROM user u LEFT JOIN organization o ON u.org_id = o.org_id WHERE u.user_id = ?",
        Collections.singletonList(
                UserProperties.userId.value(1)
        ),
        sql.getPrepareStatement()); 

// 代码片段2：支持多from
sql = SqlFactory.createDelete()
        .delete(UserProperties.TABLE)
        .from(
                Arrays.asList(
                        UserProperties.TABLE,
                        OrganizationProperties.TABLE
                )
        )
        .andWhere(OrganizationProperties.orgId.eq(UserProperties.orgId))
        .andWhere(UserProperties.userId.eq(1));
assertPrepareStatementEquals(
        "DELETE u.* FROM user u, organization o WHERE o.org_id = u.org_id AND u.user_id = ?",
        Collections.singletonList(
                UserProperties.userId.value(1)
        ),
        sql.getPrepareStatement());

```

### update（异常）

```java
// update操作必须包含where语句，不然这操作很危险
Sql sql = new Sql()
        .update(UserProperties.TABLE)
        .set(new ColumnValue(UserProperties.name, "IBIT"));
thrown.expect(RuntimeException.class);
thrown.expectMessage("Where cannot be empty when do updating!");
sql.getSqlParams();
```

### update（正常更新）

```java
UpdateSql sql = SqlFactory
        .createUpdate()
        .update(UserProperties.TABLE)
        .set(UserProperties.name.set("IBIT"))
        .andWhere(UserProperties.userId.eq(1));

assertPrepareStatementEquals(
        "UPDATE user u SET u.name = ? WHERE u.user_id = ?",
        Arrays.asList(
                UserProperties.name.value("IBIT"),
                UserProperties.userId.value(1)
        ),
        sql.getPrepareStatement());
```

### set

```java
InsertSql sql = SqlFactory
        .createInsert()
        .insert(UserProperties.TABLE)
        .values(
                Arrays.asList(
                        UserProperties.name.value("IBIT"),
                        UserProperties.loginId.value("188"),
                        UserProperties.avatarId.value(null)
                )
        );

assertPrepareStatementEquals(
        "INSERT INTO user(name, login_id, avatar_id) VALUES(?, ?, ?)",
        Arrays.asList(
                UserProperties.name.value("IBIT"),
                UserProperties.loginId.value("188"),
                UserProperties.avatarId.value(null)
        ),
        sql.getPrepareStatement());
```

### set 字段增长

```java
UpdateSql sql = SqlFactory.createUpdate()
        .update(UserProperties.TABLE)
        .set(UserProperties.loginTimes.increaseSet(2))
        .andWhere(UserProperties.userId.eq(1));
assertPrepareStatementEquals(
        "UPDATE user u SET u.login_times = u.login_times + ? WHERE u.user_id = ?",
        Arrays.asList(
                UserProperties.loginTimes.value(2),
                UserProperties.userId.value(1)
        ),
        sql.getPrepareStatement());
```


### set 字段递减

```java
UpdateSql sql = SqlFactory.createUpdate()
        .update(UserProperties.TABLE)
        .set(UserProperties.loginTimes.decreaseSet(2))
        .andWhere(UserProperties.userId.eq(1));
assertPrepareStatementEquals(
        "UPDATE user u SET u.login_times = u.login_times - ? WHERE u.user_id = ?",
        Arrays.asList(
                UserProperties.loginTimes.value(2),
                UserProperties.userId.value(1)
        ),
        sql.getPrepareStatement());
```

### insert into & values

```java
InsertSql sql = SqlFactory.createInsert()
        .insert(UserProperties.TABLE)
        .values(
                Arrays.asList(
                        UserProperties.name.value("IBIT"),
                        UserProperties.loginId.value("188"),
                        UserProperties.avatarId.value(null)
                )
        );

assertPrepareStatementEquals(
        "INSERT INTO user(name, login_id, avatar_id) VALUES(?, ?, ?)",
        Arrays.asList(
                UserProperties.name.value("IBIT"),
                UserProperties.loginId.value("188"),
                UserProperties.avatarId.value(null)
        ),
        sql.getPrepareStatement());
```

### insert on duplicate key 支持

```java
// on duplicate key update 支持
InsertSql sql = SqlFactory
        .createInsert()
        .insert(UserProperties.TABLE)
        .values(
                Arrays.asList(
                        UserProperties.name.value("IBIT"),
                        UserProperties.loginId.value("188"),
                        UserProperties.avatarId.value(null)
                )
        ).onDuplicateKeyUpdate(UserProperties.name.set("IBIT"));

assertPrepareStatementEquals(
        "INSERT INTO user(name, login_id, avatar_id) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE name = ?",
        Arrays.asList(
                UserProperties.name.value("IBIT"),
                UserProperties.loginId.value("188"),
                UserProperties.avatarId.value(null),
                UserProperties.name.value("IBIT")
        ),
        sql.getPrepareStatement());
```

### from

```java
// 单个from
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        ProjectProperties.projectId,
                        ProjectProperties.name
                )
        )
        .from(ProjectProperties.TABLE);
assertPrepareStatementEquals(
        "SELECT p.project_id, p.name FROM project p",
        sql.getPrepareStatement());

// 多个from    
sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name,
                        ProjectProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .from(ProjectProperties.TABLE)
        .andWhere(UserProperties.currentProjectId.eq(ProjectProperties.projectId));
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name, p.name FROM user u, project p WHERE u.current_project_id = p.project_id",
        sql.getPrepareStatement());
```

### join on(left, right, full, inner)

```java
// 代码片段1：join on
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId, 
                        UserProperties.name, 
                        ProjectProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .joinOn(
                ProjectProperties.TABLE, 
                Arrays.asList(
                        UserProperties.currentProjectId, 
                        ProjectProperties.projectId
                )
        );
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name, p.name FROM user u JOIN project p ON u.current_project_id = p.project_id", 
        sql.getPrepareStatement());

// 代码片段：left join on
sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId, 
                        UserProperties.name, 
                        ProjectProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .leftJoinOn(
                ProjectProperties.TABLE, 
                Arrays.asList(
                        UserProperties.currentProjectId, 
                        ProjectProperties.projectId
                )
        );
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name, p.name FROM user u LEFT JOIN project p ON u.current_project_id = p.project_id", 
        sql.getPrepareStatement());

// 省略其他join
```

### 复杂 join on(支持on后面增加条件，left, right, full, inner)

```java
// 代码片段1：on 列相等
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name,
                        ProjectProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .complexLeftJoinOn(
                ProjectProperties.TABLE,
                Collections.singletonList(
                        UserProperties.currentProjectId.eq(ProjectProperties.projectId)
                )
        );
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name, p.name FROM user u LEFT JOIN project p ON u.current_project_id = p.project_id",
        sql.getPrepareStatement());

// 代码片段2：on 条件语句
sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name,
                        ProjectProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .complexLeftJoinOn(
                ProjectProperties.TABLE,
                Arrays.asList(
                        UserProperties.currentProjectId.eq(ProjectProperties.projectId),
                        ProjectProperties.name.like("小%")
                )
        );
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name, p.name FROM user u LEFT JOIN project p ON u.current_project_id = p.project_id AND p.name LIKE ?",
        Collections.singletonList(
                ProjectProperties.name.value("小%")
        ),
        sql.getPrepareStatement());
        
// 省略其他join
...
```

### where（支持构造复杂的where语句）

```java
List<CriteriaItem> xiaoLikeItems = Arrays.asList(
        UserProperties.name.like("小%"),
        UserProperties.email.like("xiao%"));

CriteriaItem userIdItem = UserProperties.userId.gt(100);
CriteriaItem type1Item = UserProperties.type.eq(1);
CriteriaItem type2Item = UserProperties.type.eq(2);

QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .where(
                Criteria.ands(
                        Arrays.asList(
                                Criteria.ors(xiaoLikeItems),
                                userIdItem)
                )
        );
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name FROM user u WHERE (u.name LIKE ? OR u.email LIKE ?) AND u.user_id > ?",
        Arrays.asList(
                UserProperties.name.value("小%"),
                UserProperties.email.value("xiao%"),
                UserProperties.userId.value(100)
        ),
        sql.getPrepareStatement());


sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name
                )
        ).from(UserProperties.TABLE)
        .where(
                Criteria.ands(
                        Arrays.asList(
                                Criteria.ors(xiaoLikeItems),
                                Criteria.ors(Collections.singletonList(userIdItem))
                        )
                )
        );
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name FROM user u WHERE (u.name LIKE ? OR u.email LIKE ?) AND u.user_id > ?",
        Arrays.asList(
                UserProperties.name.value("小%"),
                UserProperties.email.value("xiao%"),
                UserProperties.userId.value(100)
        ),
        sql.getPrepareStatement());

sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name)
        )
        .from(UserProperties.TABLE)
        .where(
                Criteria.ors(Arrays.asList(
                        Criteria.ands(
                                Arrays.asList(
                                        Criteria.ands(
                                                Arrays.asList(
                                                        Criteria.ors(xiaoLikeItems),
                                                        Criteria.ors(Collections.singletonList(userIdItem)))
                                        ),
                                        type1Item)
                        ), type2Item))
        );
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name FROM user u WHERE (((u.name LIKE ? OR u.email LIKE ?) AND u.user_id > ?) AND u.type = ?) OR u.type = ?",
        Arrays.asList(
                UserProperties.name.value("小%"),
                UserProperties.email.value("xiao%"),
                UserProperties.userId.value(100),
                UserProperties.type.value(1),
                UserProperties.type.value(2)
        ),
        sql.getPrepareStatement());
```

### where and

```java
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .andWhere(UserProperties.userId.eq(1))
        .limit(1);

assertPrepareStatementEquals(
        "SELECT u.user_id, u.name FROM user u WHERE u.user_id = ? LIMIT ?, ?",
        Arrays.asList(
                UserProperties.userId.value(1),
                getStartColumn().value(0),
                getLimitColumn().value(1)
        ),
        sql.getPrepareStatement());

sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .andWhere(
                Criteria.ors(
                        Arrays.asList(
                                UserProperties.name.like("小%"),
                                UserProperties.email.like("xiao%"))
                )
        )
        .limit(1);

assertPrepareStatementEquals(
        "SELECT u.user_id, u.name FROM user u WHERE (u.name LIKE ? OR u.email LIKE ?) LIMIT ?, ?",
        Arrays.asList(
                UserProperties.name.value("小%"),
                UserProperties.email.value("xiao%"),
                getStartColumn().value(0),
                getLimitColumn().value(1)
        ),
        sql.getPrepareStatement());
```

### where or

```java
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .orWhere(UserProperties.userId.eq(1))
        .limit(1);
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name FROM user u WHERE u.user_id = ? LIMIT ?, ?",
        Arrays.asList(
                UserProperties.userId.value(1),
                getStartColumn().value(0),
                getLimitColumn().value(1)
        ),
        sql.getPrepareStatement());

sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name
                )
        ).from(UserProperties.TABLE)
        .orWhere(
                Criteria.ands(
                        Arrays.asList(
                                UserProperties.name.like("小%"),
                                UserProperties.email.like("xiao%")
                        )
                )
        )
        .limit(1);
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name FROM user u WHERE (u.name LIKE ? AND u.email LIKE ?) LIMIT ?, ?",
        Arrays.asList(
                UserProperties.name.value("小%"),
                UserProperties.email.value("xiao%"),
                getStartColumn().value(0),
                getLimitColumn().value(1)
        ),
        sql.getPrepareStatement());
```

### where 支持flag条件

```java
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .andWhere(UserProperties.userId.noFlgs(1));
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name FROM user u WHERE u.user_id & ? = 0",
        Collections.singletonList(
                UserProperties.userId.value(1)
        ),
        sql.getPrepareStatement());
        
// Column 还有 allFlgs(), anyFlgs()方法
...              
```

### order by

```java
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name,
                        ProjectProperties.name)
        )
        .from(UserProperties.TABLE)
        .leftJoinOn(
                ProjectProperties.TABLE,
                Arrays.asList(
                        UserProperties.currentProjectId,
                        ProjectProperties.projectId)
        )
        .orderBy(
                Arrays.asList(
                        ProjectProperties.projectId.orderBy(),
                        UserProperties.userId.orderBy(true)
                ))
        .limit(1000);
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name, p.name FROM user u LEFT JOIN project p ON u.current_project_id = p.project_id ORDER BY p.project_id, u.user_id DESC LIMIT ?, ?",
        Arrays.asList(
                getStartColumn().value(0),
                getLimitColumn().value(1000)
        ),
        sql.getPrepareStatement());
```

### 自定义order by（mysql语法）

```java
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name,
                        ProjectProperties.name)
        )
        .from(UserProperties.TABLE)
        .leftJoinOn(
                ProjectProperties.TABLE,
                Arrays.asList(
                        UserProperties.currentProjectId,
                        ProjectProperties.projectId
                )
        )
        .orderBy(
                Arrays.asList(
                        ProjectProperties.projectId.orderBy(),
                        UserProperties.userId.customerOrderBy(Arrays.asList(1, 2, 3), true)
                )
        );
assertPrepareStatementEquals(
        "SELECT u.user_id, u.name, p.name FROM user u LEFT JOIN project p ON u.current_project_id = p.project_id ORDER BY p.project_id"
                + ", FIELD(u.user_id, ?, ?, ?) DESC",
        Arrays.asList(
                UserProperties.userId.value(1),
                UserProperties.userId.value(2),
                UserProperties.userId.value(3)
        ),
        sql.getPrepareStatement());
```

### 聚合列 order by

```java
AggregateColumn minAge = UserProperties.age.min("min_age");
AggregateColumn maxAge = UserProperties.age.max("max_age");

QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        minAge,
                        maxAge,
                        UserProperties.gender
                ))
        .from(UserProperties.TABLE)
        .andWhere(UserProperties.age.egt(0))
        .groupBy(UserProperties.gender)
        .andHaving(
                minAge.egt(1)
        )
        .orderBy(
                Arrays.asList(
                        UserProperties.gender.orderBy(),
                        minAge.orderBy(true)
                )
        );
assertPrepareStatementEquals(
        "SELECT MIN(u.age) AS min_age, MAX(u.age) AS max_age, u.gender FROM user u WHERE u.age >= ? " +
                "GROUP BY u.gender HAVING min_age >= ? ORDER BY u.gender, min_age DESC",
        Arrays.asList(
                UserProperties.age.value(0),
                minAge.value(1)
        ),
        sql.getPrepareStatement());
```

### group by & having

```java
AggregateColumn minAge = UserProperties.age.min("min_age");
AggregateColumn maxAge = UserProperties.age.max("max_age");

QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        minAge,
                        maxAge,
                        UserProperties.gender
                ))
        .from(UserProperties.TABLE)
        .andWhere(UserProperties.age.egt(0))
        .groupBy(UserProperties.gender)
        .having(minAge.egt(1).and());
assertPrepareStatementEquals(
        "SELECT MIN(u.age) AS min_age, MAX(u.age) AS max_age, u.gender FROM user u WHERE u.age >= ? GROUP BY u.gender HAVING min_age >= ?",
        Arrays.asList(
                UserProperties.age.value(0),
                minAge.value(1)
        ),
        sql.getPrepareStatement());
```

### having and

```java
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        minAge,
                        maxAge,
                        UserProperties.gender
                ))
        .from(UserProperties.TABLE)
        .andWhere(UserProperties.age.egt(0))
        .groupBy(UserProperties.gender)
        .andHaving(
                Criteria.ors(
                        Arrays.asList(
                                minAge.egt(1),
                                maxAge.egt(2)
                        )
                )
        )
        .andHaving(
                Criteria.ors(
                        Arrays.asList(
                                minAge.egt(3),
                                maxAge.egt(4)
                        ))
        );
assertPrepareStatementEquals("SELECT MIN(u.age) AS min_age, MAX(u.age) AS max_age, u.gender FROM user u WHERE u.age >= ? GROUP BY u.gender "
                + "HAVING (min_age >= ? OR max_age >= ?) AND (min_age >= ? OR max_age >= ?)",
        Arrays.asList(
                UserProperties.age.value(0),
                minAge.value(1),
                maxAge.value(2),
                minAge.value(3),
                maxAge.value(4)
        ),
        sql.getPrepareStatement());
```

### having or

```java
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.age.min("min_age"),
                        UserProperties.age.max("max_age"),
                        UserProperties.gender
                ))
        .from(UserProperties.TABLE)
        .andWhere(UserProperties.age.egt(0))
        .groupBy(UserProperties.gender)
        .orHaving(
                Criteria.ands(
                        Arrays.asList(
                                minAge.egt(1),
                                maxAge.egt(2)
                        )
                )
        )
        .orHaving(
                Criteria.ands(
                        Arrays.asList(
                                minAge.egt(3),
                                maxAge.egt(4)
                        ))
        );
assertPrepareStatementEquals("SELECT MIN(u.age) AS min_age, MAX(u.age) AS max_age, u.gender FROM user u WHERE u.age >= ? GROUP BY u.gender "
                + "HAVING (min_age >= ? AND max_age >= ?) OR (min_age >= ? AND max_age >= ?)",
        Arrays.asList(
                UserProperties.age.value(0),
                minAge.value(1),
                maxAge.value(2),
                minAge.value(3),
                maxAge.value(4)
        ),
        sql.getPrepareStatement());

```

### limit

```java
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        UserProperties.name,
                        ProjectProperties.name
                )
        )
        .from(UserProperties.TABLE)
        .leftJoinOn(
                ProjectProperties.TABLE,
                Arrays.asList(
                        UserProperties.currentProjectId,
                        ProjectProperties.projectId
                )
        )
        .orderBy(
                Arrays.asList(
                        ProjectProperties.projectId.orderBy(),
                        UserProperties.userId.orderBy(true)
                )
        )
        .limit(10);
assertPrepareStatementEquals("SELECT u.user_id, u.name, p.name FROM user u LEFT JOIN project p ON u.current_project_id = p.project_id ORDER BY p.project_id"
                + ", u.user_id DESC LIMIT ?, ?",
        Arrays.asList(
                getStartColumn().value(0),
                getLimitColumn().value(10)
        ),
        sql.getPrepareStatement());
```

### 全文搜索

```java
// 查询列中有全文索引
FullTextColumn nameMatchScore = UserProperties.name.fullText("IBIT", "score");
QuerySql sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        nameMatchScore
                )
        )
        .from(UserProperties.TABLE)
        .andWhere(UserProperties.type.eq(1))
        .orderBy(nameMatchScore.orderBy());
assertPrepareStatementEquals(
        "SELECT u.user_id, MATCH(u.name) AGAINST(?) AS score FROM user u WHERE u.type = ? ORDER BY score",
        Arrays.asList(
                nameMatchScore.value(),
                UserProperties.type.value(1)
        ),
        sql.getPrepareStatement());

// boolean 模式
nameMatchScore = UserProperties.name.fullText("IBIT", FullTextModeEnum.BOOLEAN, "score");
sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        nameMatchScore
                )
        )
        .from(UserProperties.TABLE)
        .andWhere(UserProperties.type.eq(1))
        .orderBy(nameMatchScore.orderBy());
assertPrepareStatementEquals(
        "SELECT u.user_id, MATCH(u.name) AGAINST(? IN BOOLEAN MODE) AS score FROM user u WHERE u.type = ? ORDER BY score",
        Arrays.asList(
                nameMatchScore.value(),
                UserProperties.type.value(1)
        ),
        sql.getPrepareStatement());

// natural language模式
nameMatchScore = UserProperties.name.fullText("IBIT", FullTextModeEnum.NATURAL_LANGUAGE, "score");
sql = SqlFactory.createQuery()
        .column(
                Arrays.asList(
                        UserProperties.userId,
                        nameMatchScore
                )
        )
        .from(UserProperties.TABLE)
        .andWhere(UserProperties.type.eq(1))
        .orderBy(nameMatchScore.orderBy());
assertPrepareStatementEquals(
        "SELECT u.user_id, MATCH(u.name) AGAINST(? IN NATURAL LANGUAGE MODE) AS score FROM user u WHERE u.type = ? ORDER BY score",
        Arrays.asList(
                nameMatchScore.value(),
                UserProperties.type.value(1)
        ),
        sql.getPrepareStatement());
```

## 其他说明

`tech.ibit.sqlbuilder.Column`

```java
public class Column implements IColumn,
        IColumnCriteriaItemSupport,
        IColumnAggregateSupport,
        IColumnFullTextSupport,
        IColumnSetItemSupport,
        IColumnOrderBySupport,
        IColumnUniqueKeySupport {

     // 省略实现代码
     ...    
}
```

## 文档位置

[sql-builder 2.0 API](https://ibit.tech/apidocs/sql-builder/2.0/index.html)

实现了多个接口支持快速通过类创建`where语句`、`聚合函数`、`set语句`和`order by语句`。

## 相关maven依赖包

```xml
<dependency>
  <groupId>tech.ibit</groupId>
  <artifactId>sql-builder</artifactId>
  <version>2.x</version>
</dependency>
```

**注意**: 2.x 替换成对应的版本，目前是2.0


版权声明: [Apache 2](http://www.apache.org/licenses/LICENSE-2.0.txt)

# 参考资料

https://github.com/ibit-tech/sql-builder

* any list
{:toc}