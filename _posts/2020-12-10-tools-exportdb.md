---
layout: post
title: java 如何从零实现一个数据库差异对比工具？
date:  2020-10-17 16:15:55 +0800
categories: [Tool]
tags: [tool, database, java, sh]
published: true
---

# 对比数据的痛苦

不知道你是否也像我一样，在快乐编写代码的时候，必须进行一些数据库的数据对比工作。

诚然，一般的数据差异，比如是每一行的内容不同，市场上有比较成熟的 compare2 等对比工具。

但是如果是对比数据的每一列是否相同，这个就会变得比较麻烦。

![对比](https://p6-tt-ipv6.byteimg.com/origin/pgc-image/cc2e1352b3d44313a9aa12059a0f6367)

## v1.0 纯人工对比

我们在做一些数据迁移等功能时，经常需要对比数据是否正确，最常见的方法就是人工一列一列的对比。

一开始老马也是这么和同事对的，对了几天之后感觉效率实在是低，而且还容易看花眼。

于是我就是琢磨，这个东西用程序对比应该会简单很多。

## v2.0 半人工对比

说干就干，我花半天时间实现了一个基于 jsqlparser 可以解析类似于 `insert into xxx (xx, xx, xx) values (xx, xx, xx);` 的工具类。

然后对比 2 边的数据，这下对于一张表上百个字段的对比，一些变得快了许多，准确率也高了很多。

不要问我为什么会有上百个字段，这都是历史沉淀下来的瑰宝。。。

ps: insert into 语句是否通过数据库连接工具手工导出的。

后来又发现另一个问题：表太多，如果想换一个数据对比，我手工导出一遍又要花费数十分钟的时间，关键是重复且枯燥。

![枯燥](https://p6-tt-ipv6.byteimg.com/origin/pgc-image/bc93f2923ff2420da9d340994e92e8da)

既然重复，那么可以使用程序实现吗？

## v3.0 对比基本自动化

于是我下班后熬夜实现了这个版本： java 程序实现了数据的导出持久化，然后进行修改前后的差异对比。

下面我分享一下自己的思路，以及核心源码，文末有下载福利。

希望对你工作和学习提供帮助。

# 整体理念

我希望这个工具是 MVP 的理念，由简单到复杂，后期逐渐丰富特性。

要有可拓展性，目前支持 mysql/oracle/sql server 等主流数据库，用户可以定制化开发。

尽可能少的依赖，使用原生的 jdbc，不需要引入 mybatis 等框架。

## 核心依赖

下面列举一下我用到的核心依赖：

fastjson 用于数据持久化为 json

mysql-connector-java 数据库连接驱动

jsqlparser 辅助工具，解析 sql 使用，非必须

## 实现思路

1. 根据指定的 jdbc 连接信息，自动选择对应的 jdbc 实现。

2. 执行对应的 sql，将结果解析为 map，进行 JSON 持久化

3. 对持久化的 json 进行差异对比，展现出差异结果

有了这个思路，一切就会变得朴实无华。

当然在此之前，需要我们把代码实现出来，下面进入写BUG环节：

![写BUG](https://p1-tt-ipv6.byteimg.com/origin/pgc-image/fb147e8a0fed40fd9450d83572ab21e2)

# jdbc 实现

## 核心接口

考虑到后期不同数据库实现，我们统一定义一个查询接口

```java
/**
 * JDBC 访问层
 * @author 老马啸西风
 * @date 2017/8/1
 */
public interface JdbcMapper {

    /**
     * 执行查询语句
     * @param querySql
     * @return
     */
    ResultSet query(String querySql);

}
```

## 抽象实现

这里提供了基本的抽象实现。

子类只需要实现对应的连接获取信息即可。

```java
public abstract class AbstractJdbcMapper implements JdbcMapper {

    protected JdbcVo jdbcVo;

    public AbstractJdbcMapper(JdbcVo jdbcVo) {
        this.jdbcVo = jdbcVo;
    }

    /**
     * 获取数据库连接
     * @return
     */
    protected abstract Connection getConnection();

    @Override
    public ResultSet query(String querySql) {
        ResultSet rs = null;
        Connection connection = getConnection();
        try {
            Statement stmt = null;
            stmt = connection.createStatement();
            rs = stmt.executeQuery(querySql);
        } catch (Exception e) {
            System.out.println("SQL: " + querySql);
            throw new ExportdbException(e);
        }
        return rs;
    }

}
```

### JdbcVo 连接信息

这个对象主要是数据库连接信息对象：

```java
public class JdbcVo {

    /**
     * 驱动类名称
     */
    private String driverClassName;

    /**
     * 数据库链接
     */
    private String url;

    /**
     * 用户名称
     */
    private String username;

    /**
     * 密码
     */
    private String password;

    //getter & setter
}
```

## mysql 实现

此处以 mysql 为例：

```java
import com.github.houbb.exportdb.dto.JdbcVo;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * mysql 实现
 * @author 老马啸西风
 * @date 2017/8/1
 */
public class MySqlJdbcMapper extends AbstractJdbcMapper {

    public MySqlJdbcMapper(JdbcVo jdbcVo) {
        super(jdbcVo);
    }

    @Override
    protected Connection getConnection() {
        try {
            Class.forName(jdbcVo.getDriverClassName());
            return DriverManager.getConnection(jdbcVo.getUrl(),
                    jdbcVo.getUsername(),
                    jdbcVo.getPassword());
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

这里主要是对连接的初始化，连接不同的数据库，都需要引入对应的数据源。

# 行数据导出实现

下面是导出的核心实现：

## 接口定义

```java
public interface IExportdb {

    /**
     * 查询
     * @param context 上下文
     * @param sql sql
     * @return 结果
     * @since 0.0.1
     */
    QueryResultVo query(final ExportdbContext context, final String sql);

}
```

这里指定了需要执行的 sql。

context 中为了便于后期拓展，目前只有 JdbcMapper。

返回的就是 QueryResultVo，就是查询结果，定义如下：

```java
public class QueryResultVo {
    /**
     * 表名称
     */
    private String tableName;

    /**
     * 数据库名称
     *
     * @since 0.0.2
     */
    private String databaseName;

    /**
     * 结果集合
     */
    private List<Map<String, Object>> resultMaps;

    /**
     * 执行的 sql
     */
    private String sql;

    //getter & setter
}
```

## 默认实现

默认的导出实现如下：

```java
import com.github.houbb.exportdb.core.ExportdbContext;
import com.github.houbb.exportdb.core.IExportdb;
import com.github.houbb.exportdb.dal.JdbcMapper;
import com.github.houbb.exportdb.dto.QueryResultVo;
import com.github.houbb.exportdb.exception.ExportdbException;
import com.github.houbb.heaven.util.lang.StringUtil;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.insert.Insert;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * @author binbin.hou
 * @since 0.0.1
 */
public class Exportdb implements IExportdb {

    @Override
    public QueryResultVo query(ExportdbContext context, String sql) {
        try {
            final JdbcMapper jdbcMapper = context.jdbcMapper();

            ResultSet resultSet = jdbcMapper.query(sql);
            List<Map<String, Object>> maps = new ArrayList<>();

            String tableName = null;
            while (resultSet.next()) {
                final ResultSetMetaData metaData = resultSet.getMetaData();
                // 设置表名称
                if(tableName == null) {
                    tableName = metaData.getTableName(1);
                }

                Map<String, Object> map = new LinkedHashMap<>();
                // 为空直接返回，大于1则报错
                // 列数的总数
                int columnCount = metaData.getColumnCount();

                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = resultSet.getObject(columnName);

                    map.put(columnName, value);
                }

                maps.add(map);
            }

            if(StringUtil.isEmptyTrim(tableName)) {
                Statement statement = CCJSqlParserUtil.parse(sql);
                Select select = (Select)statement;
                PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
                tableName = plainSelect.getFromItem().toString();
            }

            return QueryResultVo.newInstance().tableName(tableName)
                    .databaseName("")
                    .sql(sql)
                    .resultMaps(maps);
        } catch (SQLException | JSQLParserException throwables) {
            throw new ExportdbException(throwables);
        }
    }
}
```

其实实现非常简单，我们主要讲一下两点：

（1）表名称

mysql 经测试可以通过如下方式获取:

```java
resultSet.getMetaData();
tableName = metaData.getTableName(1);
```

oracle 我在测试的时候，发现无法获取。所以是借助 sqlparser 解析我们的查询语句得到的。

暂时主要是支持查询，所以这里写的有些固定了，后续可以优化一下。

```java
if(StringUtil.isEmptyTrim(tableName)) {
    Statement statement = CCJSqlParserUtil.parse(sql);
    Select select = (Select)statement;
    PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
    tableName = plainSelect.getFromItem().toString();
}
```

（2）列信息

每一个查询，可能都对应多条记录。

我们看一下每一条记录的构建：

```java
while (resultSet.next()) {
    final ResultSetMetaData metaData = resultSet.getMetaData();
    Map<String, Object> map = new LinkedHashMap<>();
    // 为空直接返回，大于1则报错
    // 列数的总数
    int columnCount = metaData.getColumnCount();
    for (int i = 1; i <= columnCount; i++) {
        String columnName = metaData.getColumnName(i);
        Object value = resultSet.getObject(columnName);
        map.put(columnName, value);
    }
    maps.add(map);
}
```

这个经常写 jdbc 的小伙伴也一定不陌生。

你说现在都用 mybatis 了，谁还写 jdbc 啊，这么 low。

那么，你自己手写一个 mybatis，这些也是必会的。

> [从零开始手写 mybatis（一）MVP 版本 ](https://mp.weixin.qq.com/s/8eF7oFxgLsilqLYGOVtkGg)

# 差异对比

## 导出的使用

我们可以把一行数据导出，可以在修改前后分别导出。

如果是导出到不同的库，不同的表，那么就进行不同库表之间的导出。

导出结果之后，就需要进行对比了。

## 对比实现

### 接口定义

对于导出结果的处理，你可以根据自己的实际情况自行选择。

比如导出为 csv/json/insert 等，对比差异也可以按照自己的需求定制。

```java
public interface IQueryResultHandler {

    /**
     * 结果处理类
     * @param queryResultVo 查询结果
     */
    void handler(final QueryResultVo queryResultVo);

}
```

### 持久化

此处介绍一种比较简单实用的方式：json 持久化。

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.github.houbb.exportdb.dto.QueryResultVo;
import com.github.houbb.exportdb.support.result.IQueryResultHandler;
import com.github.houbb.heaven.util.io.FileUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author 老马啸西风
 * @since 0.0.1
 */
public class FileJsonQueryResultHandler implements IQueryResultHandler {

    /**
     * 默认的文件输出路径
     *
     * 根据操作系统，自动设置
     * @since 0.0.1
     */
    private final String dir;

    public FileJsonQueryResultHandler(String dir) {
        this.dir = dir;
    }

    public FileJsonQueryResultHandler() {
        this("D:\\exportdb\\");
    }

    /**
     * 结果处理类
     *
     * @param queryResultVo 查询结果
     */
    @Override
    public void handler(final QueryResultVo queryResultVo) {
        String path = dir+queryResultVo.tableName()+".edb";
        System.out.println("文件路径: " + path);

        List<Map<String, Object>> list = queryResultVo.resultMaps();
        List<String> lines = new ArrayList<>(list.size()+1);

        lines.add("-- "+queryResultVo.sql());
        for(Map<String, Object> map : list) {
            lines.add(JSON.toJSONString(map, SerializerFeature.WriteMapNullValue));
        }

        FileUtil.write(path, lines);
    }

}
```

我们将行数据持久化到文件中，注意这里指定了 `JSON.toJSONString(map, SerializerFeature.WriteMapNullValue)`；

这样可以让 null 字段也输出，更加方便对比。

## 文件差异对比实现

上面我们假设将文件输出到 2 个文件，下面指定文件路径就可以进行对比了：

```java
/**
 * 差异对比
 * @param oldPath 原始路径
 * @param newPath 新的路径
 */
public static void differ(final String oldPath, final String newPath) {
    List<String> oldLines = FileUtil.readAllLines(oldPath);
    List<String> newLines = FileUtil.readAllLines(newPath);
    System.out.println(FileUtil.getFileName(oldPath)+" 对比开始---------------");
    for(int i = 0; i < oldLines.size(); i++) {
        String oldL = oldLines.get(i);
        String newL = newLines.get(i);
        if(oldL.startsWith("--")) {
            continue;
        }
        System.out.println("第 " + (i+1) +" 行对比: ");
        differMaps(oldL, newL);
    }
    System.out.println(FileUtil.getFileName(oldPath)+" 对比结束---------------");
    System.out.println();
}

private static void differMaps(final String oldMap, final String newMap) {
    Map<String, Object> om = JSON.parseObject(oldMap);
    Map<String, Object> nm = JSON.parseObject(newMap);
    for(Map.Entry<String, Object> entry : om.entrySet()) {
        String key = entry.getKey();
        Object oldV = om.get(key);
        Object newV = nm.get(key);
        // 跳过 null 的对比
        if(oldV == null && newV == null) {
            continue;
        }
        if(!ObjectUtil.isEquals(oldV, newV)) {
            System.out.println("差异列：" + key +", 旧值：" + oldV + ", 新值：" + newV);
        }
    }
}
```

这里将差异内容，直接 console 控台输出。

## 文件夹

当然，我们也可以对比两个文件夹下的内容。

实现如下：

```java
public static void differDir(final String oldDir, final String newDir) {
    File[] oldFiles = new File(oldDir).listFiles();

    for(File file : oldFiles) {
        String fileName = file.getName();
        String aop = file.getAbsolutePath();
        String anp = newDir+fileName;
        differ(aop, anp);
    }
}
```

# 引导类

## 便利性

上面我们把核心实现都搞定了，但是用户使用起来还是不够方便。因为配置等不够优雅。

所以我们引入引导类，帮助用户快速使用：

```java
/**
 * @author 老马啸西风
 * @since 0.0.1
 */
public class ExportdbBs {

    private ExportdbBs(){}

    /**
     * 导出实现
     * @since 0.0.1
     */
    private final IExportdb exportdb = new Exportdb();

    /**
     * 驱动类名称
     */
    private String driverName = DriverNameConstant.MYSQL;

    /**
     * 数据库链接
     */
    private String url = "jdbc:mysql://localhost:3306/test";

    /**
     * 用户名称
     */
    private String username = "root";

    /**
     * 密码
     */
    private String password = "123456";


    public static ExportdbBs newInstance() {
        return new ExportdbBs();
    }

    public ExportdbBs driverName(String driverName) {
        this.driverName = driverName;
        return this;
    }

    public ExportdbBs url(String url) {
        this.url = url;
        return this;
    }

    public ExportdbBs username(String username) {
        this.username = username;
        return this;
    }

    public ExportdbBs password(String password) {
        this.password = password;
        return this;
    }

    /**
     * 查询
     * @param sql sql
     * @return 结果
     * @since 0.0.1
     */
    public QueryResultVo query(final String sql) {
        //1. 构建 vo
        JdbcVo jdbcVo = new JdbcVo(driverName, url, username, password);

        //2. 获取 mapper
        final JdbcMapper jdbcMapper = getJdbcMapper(jdbcVo);

        //3. 构建上下文
        final ExportdbContext context = ExportdbContext.newInstance().jdbcMapper(jdbcMapper);
        return this.exportdb.query(context, sql);
    }

    /**
     * 查询并且处理
     * @param queryResultHandler 查询结果处理器
     * @param sql sql
     * @since 0.0.1
     */
    public void queryAndHandle(final IQueryResultHandler queryResultHandler,
                               final String sql, final String... otherSqls) {
        QueryResultVo queryResultVo = this.query(sql);
        queryResultHandler.handler(queryResultVo);

        // 同理处理其他的 sql
        for(String os : otherSqls) {
            QueryResultVo vo = this.query(os);
            queryResultHandler.handler(vo);
        }
    }

    /**
     * 查询并且处理
     * @param queryResultHandler 查询结果处理器
     * @param sqlList sql 列表
     * @since 0.0.2
     */
    public void queryAndHandle(final IQueryResultHandler queryResultHandler,
                               List<String> sqlList) {
        // 同理处理其他的 sql
        for(String sql : sqlList) {
            System.out.println("开始执行：" + sql);
            QueryResultVo vo = this.query(sql);
            queryResultHandler.handler(vo);
        }
    }

    private JdbcMapper getJdbcMapper(JdbcVo jdbcVo) {
        if(DriverNameConstant.MYSQL.equalsIgnoreCase(driverName)) {
            return new MySqlJdbcMapper(jdbcVo);
        }
        if(DriverNameConstant.ORACLE.equalsIgnoreCase(driverName)) {
            return new OracleJdbcMapper(jdbcVo);
        }
        if(DriverNameConstant.SQL_SERVER.equalsIgnoreCase(driverName)) {
            return new SqlServerJdbcMapper(jdbcVo);
        }

        throw new UnsupportedOperationException();
    }

}
```

这里为用户提供了 mysql 最基本的配置，以及常用的查询处理方法。

## 测试

下面我们来看一下测试的效果：

### 直接查询

```java
QueryResultVo resultVo = ExportdbBs.newInstance().query("select * from user;");
System.out.println(resultVo);
```

### 查询并处理

```java
final String sql = "select * from user;";
final IQueryResultHandler handler = new FileJsonQueryResultHandler();
ExportdbBs.newInstance().queryAndHandle(handler, sql);
```

两次导出可以指定文件路径，比如分别是：

`D:\exportdb\old\` 和 `D:\exportdb\new\`

### 针对两次结果对比

```java
final String oldP = "D:\\exportdb\\old\\";
final String newP = "D:\\exportdb\\new\\";

CompareUtil.differDir(oldP, newP);
```

差异结果就会被输出到控台。

![结果](https://p9-tt-ipv6.byteimg.com/origin/pgc-image/4c9ec56bd29b4777af3c454bdaf97f10)

一切顺利，不过革命尚未成功，同学仍需加班呀~~~

# 不足之处

这是一个 v0.0.1 版本，还有很多不足。

比如:

- 导出为 csv

- 导出为 insert/update 语句 

- 导出的文件名称自定义策略

- 可以指定多个 sql 是否生成在同一个文件中

- 导出路径根据操作系统，自动变更

- 更加便于使用，比如页面指定数据源+sql，页面显示对应差异结果。

不过也基本可用，符合我们最初的设想。

# 小结

不知道你平时又是如何对比数据的呢？

如果你需要这个工具，可以关注【老马啸西风】，后台回复【对比】即可。

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位**极客**的点赞收藏转发，是老马持续写作的最大动力！

* any list
{:toc}