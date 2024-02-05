---
layout: post
title: Apache Calcite 源码分析-03-calcite driver
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 回顾

我们上一节看了 calcite 的 DriverManager，本节重点看一下 calcite org.apache.calcite.jdbc.Driver

# 源码

## 基础属性

```java
public class Driver extends UnregisteredDriver {
    // 驱动前缀
    public static final String CONNECT_STRING_PREFIX = "jdbc:calcite:";
    // 构造器
    final Function0<CalcitePrepare> prepareFactory = this.createPrepareFactory();

    public Driver() {
    }
```

## 基本方法

```java
// 创建属性工厂
    protected Function0<CalcitePrepare> createPrepareFactory() {
        return CalcitePrepare.DEFAULT_FACTORY;
    }


// 链接前缀
    protected String getConnectStringPrefix() {
        return "jdbc:calcite:";
    }

// 获取工厂类
    protected String getFactoryClassName(UnregisteredDriver.JdbcVersion jdbcVersion) {
        switch (jdbcVersion) {
            case JDBC_30:
            case JDBC_40:
                throw new IllegalArgumentException("JDBC version not supported: " + jdbcVersion);
            case JDBC_41:
            default:
                return "org.apache.calcite.jdbc.CalciteJdbc41Factory";
        }
    }

    protected DriverVersion createDriverVersion() {
        return DriverVersion.load(Driver.class, "org-apache-calcite-jdbc.properties", "Calcite JDBC Driver", "unknown version", "Calcite", "unknown version");
    }
```

## 核心方法

```java
    protected Handler createHandler() {
        return new HandlerImpl() {
            public void onConnectionInit(AvaticaConnection connection_) throws SQLException {
                // 链接初始化
                CalciteConnectionImpl connection = (CalciteConnectionImpl)connection_;
                super.onConnectionInit(connection);


                String model = this.model(connection);
                if (model != null) {
                    try {
                        new ModelHandler(connection, model);
                    } catch (IOException var5) {
                        throw new SQLException(var5);
                    }
                }

                connection.init();
            }

// 模型的初始化
            String model(CalciteConnectionImpl connection) {
                String model = connection.config().model();
                if (model != null) {
                    return model;
                } else {
                    // 工厂
                    SchemaFactory schemaFactory = (SchemaFactory)connection.config().schemaFactory(SchemaFactory.class, (Object)null);
                    Properties info = connection.getProperties();
                    String schemaName = (String)Util.first(connection.config().schema(), "adhoc");
                    if (schemaFactory == null) {
                        JsonSchema.Type schemaType = connection.config().schemaType();
                        if (schemaType != null) {
                            switch (schemaType) {
                                case JDBC:
                                    schemaFactory = Factory.INSTANCE;
                                    break;
                                case MAP:
                                    schemaFactory = org.apache.calcite.schema.impl.AbstractSchema.Factory.INSTANCE;
                            }
                        }
                    }

                    if (schemaFactory != null) {
                        JsonBuilder json = new JsonBuilder();
                        Map<String, Object> root = json.map();
                        root.put("version", "1.0");
                        root.put("defaultSchema", schemaName);
                        List<Object> schemaList = json.list();
                        root.put("schemas", schemaList);
                        Map<String, Object> schema = json.map();
                        schemaList.add(schema);
                        schema.put("type", "custom");
                        schema.put("name", schemaName);
                        schema.put("factory", schemaFactory.getClass().getName());
                        Map<String, Object> operandMap = json.map();
                        schema.put("operand", operandMap);
                        Iterator var11 = Util.toMap(info).entrySet().iterator();

                        while(var11.hasNext()) {
                            Map.Entry<String, String> entry = (Map.Entry)var11.next();
                            if (((String)entry.getKey()).startsWith("schema.")) {
                                operandMap.put(((String)entry.getKey()).substring("schema.".length()), entry.getValue());
                            }
                        }

                        return "inline:" + json.toJsonString(root);
                    } else {
                        return null;
                    }
                }
            }
        };
    }
```


## 基本方法

```java
protected Collection<ConnectionProperty> getConnectionProperties() {
        List<ConnectionProperty> list = new ArrayList();
        Collections.addAll(list, BuiltInConnectionProperty.values());
        Collections.addAll(list, CalciteConnectionProperty.values());
        return list;
    }

    public Meta createMeta(AvaticaConnection connection) {
        return new CalciteMetaImpl((CalciteConnectionImpl)connection);
    }
```

## 获取链接

```java
    CalciteConnection connect(CalciteSchema rootSchema, JavaTypeFactory typeFactory) {
        return (CalciteConnection)((CalciteFactory)this.factory).newConnection(this, this.factory, "jdbc:calcite:", new Properties(), rootSchema, typeFactory);
    }

    CalciteConnection connect(CalciteSchema rootSchema, JavaTypeFactory typeFactory, Properties properties) {
        return (CalciteConnection)((CalciteFactory)this.factory).newConnection(this, this.factory, "jdbc:calcite:", properties, rootSchema, typeFactory);
    }
```

# UnregisteredDriver

## 属性

```java
public abstract class UnregisteredDriver implements Driver {
    final DriverVersion version = this.createDriverVersion();
    protected final AvaticaFactory factory = this.createFactory();
    public final Handler handler = this.createHandler();

    protected UnregisteredDriver() {
    }
```

## 获取链接

```java
    public Connection connect(String url, Properties info) throws SQLException {
        // 是否支持的 url 类型
        if (!this.acceptsURL(url)) {
            return null;
        } else {
            // 获取链接前缀
            String prefix = this.getConnectStringPrefix();
            assert url.startsWith(prefix);

            String urlSuffix = url.substring(prefix.length());

            // 构建属性
            Properties info2 = ConnectStringParser.parse(urlSuffix, info);

            // 构建链接
            AvaticaConnection connection = this.factory.newConnection(this, this.factory, url, info2);
            this.handler.onConnectionInit(connection);
            return connection;
        }
    }
```

## AvaticaJdbc41Factory.newConnection

```java
public AvaticaConnection newConnection(
      UnregisteredDriver driver,
      AvaticaFactory factory,
      String url,
      Properties info) {
		// 创建了:AvaticaJdbc41Connection(是java.sql.Connection的实现)包裹:Driver/AvaticaFactory/url/{ model = "/model.json" }
    return new AvaticaJdbc41Connection(driver, factory, url, info);
}
```

# 小结

1. DriverManager.getConnection 首先会委托给对应的 driver 实现类

2. 实际底层对应的是 AvaticaJdbc41Factory 类,去创建一个: java.sql.Connection 的实现类(AvaticaJdbc41Connection)

# 参考资料

https://www.lixin.help/2021/04/11/Calcite-Driver-Register.html

* any list
{:toc}