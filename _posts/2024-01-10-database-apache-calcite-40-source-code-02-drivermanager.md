---
layout: post
title: Apache Calcite 源码分析-01-DriverManager 源码浅析
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 源码应该怎么阅读？

直接根据例子，找到核心的类。

## 回归入门回顾

我们看一下 csv 的入门例子：

```java
    public static void main(String[] args) throws Exception {
        // 0.获取csv文件的路径，注意获取到文件所在上层路径就可以了
        String path = "D:\\github\\calcite-learn\\calcite-learn-basic\\src\\main\\resources\\csv\\";

        // 1.构建CsvSchema对象，在Calcite中，不同数据源对应不同Schema，比如CsvSchema、DruidSchema、ElasticsearchSchema等
        CsvSchema csvSchema = new CsvSchema(new File(path), CsvTable.Flavor.SCANNABLE);

        // 2.构建Connection
        // 2.1 设置连接参数
        Properties info = new Properties();
        // 不区分sql大小写
        info.setProperty("caseSensitive", "false");

        // 2.2 获取标准的JDBC Connection
        Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
        // 2.3 获取Calcite封装的Connection
        CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);

        // 3.构建RootSchema，在Calcite中，RootSchema是所有数据源schema的parent，多个不同数据源schema可以挂在同一个RootSchema下
        // 以实现查询不同数据源的目的
        SchemaPlus rootSchema = calciteConnection.getRootSchema();

        // 4.将不同数据源schema挂载到RootSchema，这里添加CsvSchema
        rootSchema.add("csv", csvSchema);

        // 5.执行SQL查询，通过SQL方式访问csv文件
        String sql = "select * from csv.depts";
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery(sql);

        // 6.遍历打印查询结果集
        printResultSet(resultSet);
    }
```

这里面除却属性配置，最主要的就是 CsvSchema/DriverManager

# DriverManager 源码

TODO...


# 参考资料

https://www.lixin.help/2021/04/11/Calcite-Driver-Register.html

* any list
{:toc}