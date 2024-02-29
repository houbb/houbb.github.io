---
layout: post
title: Mybatis 入门介绍
date:  2016-07-27 10:40:05 16:09:17 +0800
categories: [SQL]
tags: [mybatis, database]
published: true
---

# MyBatis

MyBatis是一个一流的持久化框架，支持自定义SQL、存储过程和高级映射。

MyBatis几乎消除了所有的JDBC代码，手动设置参数和检索结果的步骤。

MyBatis可以使用简单的XML或注解进行配置，将基本类型、Map接口和Java POJO（普通的Java对象）映射到数据库记录。

> [mybatis](http://blog.mybatis.org/)

> [mybatis doc](http://www.mybatis.org/mybatis-3/)

> [tools](http://mybatis.tk/)

## 简单介绍

MyBatis（原名为iBatis）是一款Java持久层框架，它提供了一种简单而灵活的方式来访问数据库。

MyBatis的目标是通过消除冗余的JDBC代码，使开发人员能够更专注于SQL语句和结果映射。

以下是一些关键的特点和概念，帮助你更好地理解MyBatis：

1. SQL映射：MyBatis使用XML或注解方式将SQL语句与Java方法进行映射。在XML文件中，你可以编写SQL语句，并指定参数和结果的映射关系。

2. 参数映射：MyBatis支持多种参数映射方式，包括位置参数、命名参数和自定义类型处理器。这使得你可以灵活地将Java对象作为参数传递给SQL语句。

3. 结果映射：MyBatis可以将SQL查询的结果映射为Java对象。你可以定义映射规则，将查询结果中的列与Java对象的属性进行对应。

4. 动态SQL：MyBatis提供了强大的动态SQL功能，可以根据条件来动态地生成SQL语句。你可以使用条件判断、循环和片段等功能来构建灵活的SQL语句。

5. 事务支持：MyBatis可以管理数据库事务，你可以通过配置文件或编程方式来控制事务的提交和回滚。

6. 插件机制：MyBatis提供了插件机制，可以通过自定义插件来扩展框架的功能。你可以在SQL语句执行前后进行拦截和修改，实现日志记录、性能监控等功能。

使用MyBatis的流程通常包括以下步骤：

1. 配置数据源：在配置文件中指定数据库连接信息，包括数据库类型、URL、用户名和密码等。

2. 定义SQL映射：使用XML文件或注解方式定义SQL语句和参数、结果的映射关系。

3. 编写Java代码：编写Java代码，调用MyBatis提供的API来执行SQL语句。你可以使用会话（SqlSession）来执行增删改查操作。

4. 执行SQL语句：通过调用相应的方法来执行SQL语句，并获取结果。

MyBatis是一款功能强大而灵活的持久层框架，它能够有效地简化数据库访问的开发工作。

它已经在许多Java项目中得到广泛应用，成为了Java开发人员的首选之一。

## mybatis 与 hibernate 的对比表格

下面是MyBatis和Hibernate的对比表格，以便更好地理解它们之间的区别：

| 特性                 | MyBatis                             | Hibernate                        |
|---------------------|-------------------------------------|----------------------------------|
| 数据库支持            | 支持多种关系型数据库                          | 支持多种关系型数据库                   |
| SQL控制              | 提供灵活的SQL控制，开发者手动编写和管理SQL语句        | 自动创建和管理SQL语句，更面向对象的方式    |
| 对象关系映射（ORM）     | 较弱的ORM支持，需要手动处理对象和数据库表之间的映射关系 | 强大的ORM支持，自动处理对象和数据库表之间的映射关系 |
| 存储过程和函数支持       | 提供良好的存储过程和函数支持                      | 提供有限的存储过程和函数支持                 |
| 缓存机制              | 提供一级缓存和二级缓存                         | 提供一级缓存和二级缓存                    |
| 查询性能              | 查询性能较高，可以优化SQL语句                     | 查询性能较低，Hibernate会自动生成复杂的查询语句   |
| 灵活性               | 更灵活，可以直接编写SQL语句                       | 较少灵活，需要按照Hibernate的规范进行操作       |
| 学习曲线              | 相对较低，容易上手                              | 相对较高，需要掌握更多的概念和API             |

需要注意的是，MyBatis和Hibernate都是优秀的持久层框架，每个框架在不同的场景和需求下有其适用性。

MyBatis更适合对SQL语句的控制要求较高的项目，而Hibernate则更适合那些希望通过ORM来简化数据访问的项目。


# Hello World

- mybatis.jar & mysql-connector-java.jar

```xml
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>${mybatis.version}</version>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>${mysql.version}</version>
</dependency>
```

- MyBatisUtil.java

```java
public class MyBatisUtil {
    private MyBatisUtil(){}
    private static SqlSessionFactory sqlSessionFactory = null;

    static {
        try {
            sqlSessionFactory = new SqlSessionFactoryBuilder().build(
                    Resources.getResourceAsStream("mybatis-config.xml"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static SqlSessionFactory getSqlSessionFactory() {
        return sqlSessionFactory;
    }
}
```

- mybatis-config.xml & jdbc.properties

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <!-- 引入配置信息文件 -->
    <properties resource="jdbc.properties" />

    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${driver}"/>
                <property name="url" value="${url}"/>
                <property name="username" value="${user}"/>
                <property name="password" value="${password}"/>
            </dataSource>
        </environment>
    </environments>

    <mappers>
        <mapper resource="com/ryo/mapper/UserMapper.xml"/>
    </mappers>
</configuration>
```

```properties
driver=com.mysql.jdbc.Driver
url=jdbc:mysql://127.0.0.1:3306/mybatis?useUnicode=true&characterEncoding=utf8
user=root
password=
```

- UserMapper.java & UserMapper.xml

```java
public interface UserMapper {
    User selectUser(Long id);
}
```

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.ryo.mapper.UserMapper">

    <!--定义所有列,方便使用,一般应该避免使用*-->
    <sql id="columns"> id,username,password,createdOn</sql>

    <!--id 对应方法名称-->
    <select id="selectUser" parameterType="java.lang.Long" resultType="com.ryo.domain.User">
        SELECT
        <include refid="columns"/>
        FROM User WHERE id = #{id}
    </select>
</mapper>
```

- sql & domain

```sql
CREATE TABLE user (
  id        BIGINT(20) PRIMARY KEY AUTO_INCREMENT NOT NULL
  COMMENT '主键, 自增',
  username  VARCHAR(64)                           NOT NULL
  COMMENT '用户名',
  password  VARCHAR(128)                          NOT NULL
  COMMENT '密码',
  createdOn DATETIME                              NOT NULL
  COMMENT '创建时间',

  UNIQUE INDEX `username_UNIQUE` (`username`)
)
  COMMENT '用户表';

INSERT INTO `user` (username, password, createdOn) VALUES (
  'ryo', '123456', '2016-07-28 14:32:30'
);
```

```java
public class User implements Serializable {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    private Date createdOn;

    //getter & setter

    //toString()
}
```

- UserMapperTest.java & result

```java
public class UserMapperTest {
    private SqlSessionFactory sqlSessionFactory = MyBatisUtil.getSqlSessionFactory();

    @Test
    public void testSelectUser() throws IOException {
        UserMapper userMapper = sqlSessionFactory.openSession().getMapper(UserMapper.class);
        System.out.println(userMapper.selectUser(1L));
    }
}
```

```
User{id=1, username='ryo', password='123456', createdOn=Thu Jul 28 14:32:30 CST 2016}

Process finished with exit code 0
```

> File strut

![files](https://raw.githubusercontent.com/houbb/resource/master/img/2016-07-31-mybatis.png)


# Tips

## key has list

- *key.java

```java
public class Key {

  private String username;

  private List<Integer> ids;

  //getter & setter
}
```

- *mapper.xml

```sql
SELECT * FROM tableName
WHERE username = #{username}
<if test="orderStatusList != null and orderStatusList.size > 0">
  AND id in
  <foreach item="item" index="index" collection="ids" open="(" separator="," close=")">
	#{item}
  </foreach>
</if>
```

> Tips

If we have this case:

- StudentDto.java

```
public class StudentDto {
    private Long id;
    private String name;
}
```

We want to query student that matches (id=1 and name="001") OR (id=2 and name="002")...

- *Key.java

```
public class Key {
    private int age;
    private List<StudentDto> studentDtoList;
}
```

- *Mapper.xml

```
<select id="query" parameterType="Key" resultMap="BaseResultMap">
    SELECT * FROM table 
    WHERE age=#{age}
    <if test="studentDtoList != null and studentDtoList.size > 0">
        AND
        <foreach item="item" index="index" collection="studentDtoList" open="(" separator=" OR " close=")">
          (
          id=#{item.id,jdbcType=INTEGER} and
          name=#{item.name,jdbcType=CHAR}
          )
        </foreach>
    </if>
    
    
</select>
```


## result has list;

- We have a ```classroom``` & ```student``` table simple like this

```sql
classroom(
id, name
);

student(
id, classroom_id, name
);
```

- the model of student is:

```java
public class Student {
    private Long id;
    private Long classroomId;
    private String name;
}
```

- the result we want may like this:

```java
public class Result {
    private Long id;  //classroom id;
    private String name; //classroom name
    private List<Student> studentList;
}
```

- the resultMap should be:

```sql
<resultMap id="Result" type="Result">
	<id column="id" property="id" jdbcType="BIGINT"/>
	<result column="name" property="name" jdbcType="CHAR"/>

	<collection property="studentList" ofType="Student">
		<id column="student_id" property="id" jdbcType="BIGINT"/>
		<result column="classroom_id" property="classroomId" jdbcType="BIGINT"/>
		<result column="student_name" property="name" jdbcType="INTEGER"/>
	</collection>
</resultMap>
```

- the query sql:

```sql
SELECT c.id, c.name,
	s.id AS  student_id,
	s.classroom_id AS classroom_id,
	s.name AS student_name
FROM classroom AS c
LEFT JOIN student ON c.id = s.classroom_id
```

<label class="label label-error">Error</label>

> return null from a method with a primitive return type

You have two ways to solve this:
 
- Change the result type from primitive to object;

- Use ```IFNULL``` of MySQL, like [this](http://houseyoung.cn/?p=73):

```mysql
SELECT IFNULL(MAX(name),0) AS name FROM user WHERE id = #{id}
```

> diff between ```#{field}``` and ```${field}```

You use ```order by #{field}/${field}```
 
- #{field}

If set field="create_time DESC", the result is:

```
order by create_time DESC ASC
```

- ${field}

If set field="create_time DESC", the result is:

```sql
order by create_time ASC
```

# Error

<label class="label label-danger">NoClassDefFoundError</label>

java.lang.NoClassDefFoundError: org/apache/ibatis/cursor/Cursor

- why

jar 包版本冲突

- solve

注意 ```mybatis-spring.jar``` 对应的 ```mybatis.jar``` 和 ```spring-*.jar```  版本。


# 多个入参

- UserMapper.java

```java
package com.ryo.mybatis.demo.spring.mapper;

import com.ryo.mybatis.demo.spring.model.User;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface UserMapper extends MyMapper<User> {


    List<User> selectByMultiParamOne(String username, String password);

    /**
     * 推荐使用这一种方案
     * @param username  用户名
     * @param password  密码
     * @return
     */
    List<User> selectByMultiParamTwo(@Param("username") String username, @Param("password") String password);

    /**
     * 封装成一个 map 或者封装成一个对象，类似
     * @param map
     * @return
     */
    List<User> selectByMultiParamThree(Map<String, String> map);

}
```

- UserMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.ryo.mybatis.demo.spring.mapper.UserMapper" >
  <resultMap id="BaseResultMap" type="com.ryo.mybatis.demo.spring.model.User" >
    <!--
      WARNING - @mbggenerated
    -->
    <id column="id" property="id" jdbcType="BIGINT" />
    <result column="username" property="username" jdbcType="VARCHAR" />
    <result column="password" property="password" jdbcType="VARCHAR" />
    <result column="created_time" property="createdTime" jdbcType="TIMESTAMP" />
    <result column="updated_time" property="updatedTime" jdbcType="TIMESTAMP" />
  </resultMap>

  <select id="selectByMultiParamOne" resultMap="BaseResultMap">
    SELECT id FROM user WHERE username=#{0} and password=#{1}
  </select>

  <select id="selectByMultiParamTwo" resultMap="BaseResultMap">
    SELECT id FROM user WHERE username=#{username} and password=#{password}
  </select>

  <select id="selectByMultiParamThree" resultMap="BaseResultMap">
    SELECT id FROM user WHERE username=#{username} and password=#{password}
  </select>

</mapper>
```

- UserMapperTest.java

```java
@ContextConfiguration(locations = {"classpath:applicationContext-datasource.xml"})
@RunWith(SpringJUnit4ClassRunner.class)
public class UserMapperTest {

  @Autowired
  private UserMapper userMapper;

  @Test
  public void queryTest() {
    userMapper.selectAll();
  }

  //[User(id=1, username=null, password=null, createdTime=null, updatedTime=null)]
  @Test
  public void selectByMultiParamOneTest() {
    List<User> userList = userMapper.selectByMultiParamOne("ryo", "123456");
    System.out.println(userList);
  }

  @Test
  public void selectByMultiParamTwoTest() {
    List<User> userList = userMapper.selectByMultiParamTwo("ryo", "123456");
    System.out.println(userList);
  }

  @Test
  public void selectByMultiParamThreeTest() {
    Map<String, String> map = new HashMap<>();
    map.put("username", "ryo");
    map.put("password", "123456");
    List<User> userList = userMapper.selectByMultiParamThree(map);
    System.out.println(userList);
  }

}
```

# 查询游标

- 用于存储游标的 po

```java
public class UserPo() {

    private int id;

    private String name;
}
```

## 数据库 db

- 存储过程

```sql
SP.selectUserList(id IN NUMNER(21))
```
假设有一段存储过程，返回上述类型的游标。

当然，是可以做映射的。(和表字段感觉类似)

```sql
Id NUMBER(21, 0)

Name VARCHAR(32)
```

- service 层使用 

```java
@Override
public List<UserPo> selectUserList(Long id) {
    Map<String, Object> map = new HashMap<>();
    map.put("id", id);
    userMapper.selectUserListCursor(map);
    Object object = map.get("result");
    return (List<UserPo>) map.get("result");
}
```

## mapper

- UserMapper.java

```java
void selectUserListCursor(Map<String, Object> map);
```

- UserMapper.xml

```xml
<resultMap id="selectUserListCursorMap"
               type="com.github.houbb.po.UserPo">
    <result column="Id" property="id"/>
    <result column="Name" property="name"/>
</resultMap>

<select id="selectUserListCursor" parameterType="java.util.Map" statementType="CALLABLE">
    {#{result, mode=OUT, jdbcType=CURSOR, resultMap=selectUserListCursorMap} = call SP.selectUserList(#{id,jdbcType=INTEGER,mode=IN})}
</select>
```

# `$` & `#` 


## `${}`

1、 `$` 将传入的数据直接显示生成在sql中。

如：order by $user_id$，如果传入的值是 111, 那么解析成 sql 时的值为order by user_id, 如果传入的值是id，则解析成的sql为order by id.

2、 `$` 方式一般用于传入数据库对象，例如传入表名.

3、 MyBatis 排序时使用 `order by` 动态参数时需要注意，用 `$` 而不是 `#`

## `#{}`

1、 `#` 将传入的数据都当成一个字符串，会对自动传入的数据加一个双引号。

如：order by #user_id#，如果传入的值是111,那么解析成sql时的值为order by "111", 如果传入的值是id，则解析成的sql为order by "id".

2、 可以防止 SQL 注入

3、 尽量使用这个方式

> [mybatis中的#{}和${}区别](https://blog.csdn.net/u013552450/article/details/72528498/)

# resultType & resultMap

## 简单的不同点

说说不同点吧,resultType 和restltMap

restulyType:

1.对应的是java对象中的属性，大小写不敏感，

2.如果放的是java.lang.Map,key是查询语句的列名，value是查询的值，大小写敏感

3.resultMap:指的是定义好了的id的，是定义好的resyltType的引用

注意：用resultType的时候，要保证结果集的列名与java对象的属性相同，而resultMap则不用，而且resultMap可以用typeHander转换

4.

type:java 对象对应的类，

id:在本文件要唯一

column :数据库的列名或别名，

property:对应java对象的属性，

jdbcType:java.sql.Types

查询语句中，resultMap

属性指向上面那个属性的标签的id，parameterType:参数类型，只能传一个参数，如果有多个参数要封装，如封装成一个类，要写包名加类名，基本数据类型则可以省略

5.一对1、一对多时，若有表的字段相同必须写别名，不然查询结果无法正常映射，出现某属性为空或者返回的结果与想象中的不同，而这往往是没有报错的。

6.若有意外中的错误，反复检查以上几点，和认真核查自己的sql语句，mapper.xml文件是否配置正确。

另外还有resultMap 元素，它是 MyBatis 中最重要最强大的元素，它能提供级联查询，缓存等功能

> [mybatis中resultType和resultMap使用时的区别](https://blog.csdn.net/leo3070/article/details/77899574/)

## 二级缓存

正如大多数持久层框架一样，MyBatis 同样提供了一级缓存和二级缓存的支持

1. 一级缓存: 基于 PerpetualCache 的 HashMap 本地缓存，其存储作用域为 Session，当 Session flush 或 close 之后，该Session中的所有 Cache 就将清空。

2. 二级缓存与一级缓存其机制相同，默认也是采用 PerpetualCache，HashMap存储，不同在于其存储作用域为 Mapper(Namespace)，并且可自定义存储源，如 Ehcache。

3. 对于缓存数据更新机制，当某一个作用域(一级缓存Session/二级缓存Namespaces)的进行了 C/U/D 操作后，默认该作用域下所有 select 中的缓存将被clear。

## 二级缓存补充说明

1. 映射语句文件中的所有select语句将会被缓存。

2. 映射语句文件中的所有insert，update和delete语句会刷新缓存。

3. 缓存会使用Least Recently Used（LRU，最近最少使用的）算法来收回。

4. 缓存会根据指定的时间间隔来刷新。

5. 缓存会存储 1024 个对象

> [Mapper XML Files](http://www.mybatis.org/mybatis-3/sqlmap-xml.html)

> [MyBatis缓存介绍](http://www.mybatis.org/mybatis-3/sqlmap-xml.html#cache)

# mapper.java 和 mapper.xml 关联

> [Mapper接口与mapper.xml文件绑定](https://blog.csdn.net/qq_28334711/article/details/65446594)

> [Mybatis配置和接口映射原理](https://blog.csdn.net/birthmarkqiqi/article/details/68939535)

# 学习资料

学习MyBatis的一些官方和非官方资源的网址：

1. MyBatis官方网站：https://mybatis.org/
   这是MyBatis官方网站，提供了MyBatis的官方文档、示例代码、最新版本下载等资源。

2. MyBatis GitHub仓库：https://github.com/mybatis/mybatis-3
   MyBatis的GitHub仓库是MyBatis的开源代码仓库，你可以查看最新的源代码、提交问题和贡献代码。

3. MyBatis官方文档：https://mybatis.org/mybatis-3/zh/index.html
   MyBatis官方文档提供了详细的教程、指南和API文档，适合从入门到进阶学习。

4. MyBatis中文社区：https://mybatis.cn/
   这是MyBatis的中文社区，提供了丰富的学习资源、技术讨论和问题解答。

5. MyBatis专栏 - 掘金：https://juejin.cn/column/6962380810828476430
   这是一个MyBatis的专栏，其中包含了许多优质的MyBatis文章，适合深入学习和实践。

6. MyBatis教程 - 菜鸟教程：https://www.runoob.com/mybatis/mybatis-tutorial.html
   菜鸟教程提供了简单易懂的MyBatis教程，适合初学者入门学习。

这些资源可以帮助你系统地学习MyBatis框架，从基础知识到高级技巧。你可以根据自己的需求和学习进度选择适合的资源进行学习。

* any list
{:toc}









