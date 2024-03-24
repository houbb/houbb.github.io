---
layout: post
title: APM 系统监控-Cat
date:  2016-12-16 22:01:33 +0800
categories: [APM]
tags: [apm, sh, monitor]
published: true
---

# Cat

[Cat](https://github.com/houbb/cat) 基于Java开发的实时应用监控平台，包括实时应用监控，业务监控


# 消息类型

CAT支持的监控消息类型包括：

- Transaction
    适合记录跨越系统边界的程序访问行为,比如远程调用，数据库调用，也适合执行时间较长的业务逻辑监控，Transaction用来记录一段代码的执行时间和次数。

- Event
    用来记录一件事发生的次数，比如记录系统异常，它和transaction相比缺少了时间的统计，开销比transaction要小。

- Heartbeat
    表示程序内定期产生的统计信息, 如CPU%, MEM%, 连接池状态, 系统负载等。

- Metric
    用于记录业务指标、指标可能包含对一个指标记录次数、记录平均值、记录总和，业务指标最低统计粒度为1分钟。

- Trace
    用于记录基本的trace信息，类似于log4j的info信息，这些信息仅用于查看一些相关信息


# 消息树

CAT监控系统将每次URL、Service的请求内部执行情况都封装为一个完整的消息树、消息树可能包括Transaction、Event、Heartbeat、Metric和Trace信息。

# 快速入门

## 1、 下载

```
$   git clone https://github.com/dianping/cat
```

## 2、 安装

```
$   mvn clean install -DskipTests
```

## 3、 配置 Cat 环境

```
$   mvn cat:install

[INFO] 准备 Cat 环境...
请输入 jdbc url:[jdbc:mysql://127.0.0.1:3306]jdbc:mysql://127.0.0.1:3306
请输入用户名:root
请输入密码:[]123456
[INFO] jdbc.url: jdbc:mysql://127.0.0.1:3306
[INFO] jdbc.user: root
[INFO] jdbc.password: 123456
[INFO] 连接数据库(jdbc:mysql://127.0.0.1:3306) ...
[INFO] 成功连接到数据库(jdbc:mysql://127.0.0.1:3306)
[INFO] 正在创建数据库(cat) ...
[INFO] 数据库(cat) 创建成功
[INFO] 正在创建数据表 ...
[INFO] 数据表创建成功
```

## 4、 权限配置

对 ```/data/appdatas/cat``` 和 ```/data/applogs/cat``` 进行权限设置

- **/data/appdatas/cat** 目录用于存放 Cat 主目录的配置文件
- **/data/applogs/cat** 目录用于存放 Cat 主目录的日志文件

<label class="label label-danger">错误</label>

```
[ERROR] 没有权限读写 /data/appdatas/cat，请手动创建此目录
```

创建并设置权限

```
$   sudo mkdir /data/appdatas/cat
$   sudo mkdir /data/applogs/cat
$   sudo chmod 777 /data/appdatas/cat
$   sudo chmod 777 /data/applogs/cat
```

## 5、 重新配置 Cat 环境

```
houbinbindeMacBook-Pro:cat houbinbin$ pwd
/Users/houbinbin/it/code/cat
[INFO] 准备 Cat 环境...
请输入 jdbc url:[jdbc:mysql://127.0.0.1:3306]jdbc:mysql://127.0.0.1:3306
请输入用户名:root
请输入密码:[]123456
[INFO] jdbc.url: jdbc:mysql://127.0.0.1:3306
[INFO] jdbc.user: root
[INFO] jdbc.password: 123456
[INFO] 连接数据库(jdbc:mysql://127.0.0.1:3306) ...
[INFO] 成功连接到数据库(jdbc:mysql://127.0.0.1:3306)
[INFO] 正在创建数据库(cat) ...
[INFO] 数据库 'cat' 已存在，先删除它...
[INFO] 数据库 'cat' 已删除
[INFO] 数据库(cat) 创建成功
[INFO] 正在创建数据表 ...
[INFO] 数据表创建成功
[INFO] 正在生成配置文件到 /data/appdatas/cat ...
[INFO] 配置文件生成成功
[INFO] 准备 Cat 环境 ... 完成
[INFO] 使用以下命令启动本地 Cat 服务器:
[INFO]    cd cat-home; mvn jetty:run
[INFO] 请在浏览器中打开 http://localhost:2281/cat
```

## 6、 运行 Cat

```
$ cd cat-home
$ mvn jetty:run
```

## 7、 访问

在浏览器中输入 [http://localhost:2281/cat](http://localhost:2281/cat)

默认用户名密码：

```
root/123456
```


# 部署埋点


注意!!!: 必须使用JDK1.7, JDK1.8 虽然可以跑。但是最后会报错。

再次提醒：如果安装了多个版本的jdk，编译前先将jdk版本切换到jdk 1.7(包括编译成功后，运行时也要jdk 1.7环境)　

> [支持JDK1.8](https://github.com/dianping/cat/issues/928)

文档见:  (【文档】-》【部署文档】)

```
http://localhost:2281/cat/r/home?op=view&docName=deploy
```

为了测试,暂时本地简单启动一个服务, 假设为我们的app(```localhost:18080```)(ps:后来发现8081和nexus冲突,就改了下端口。)。

1) 设置cat服务```/data/appdatas/cat/client.xml```

暂时本地做测试。不做集成。

```xml
<?xml version="1.0" encoding="utf-8"?>

<config mode="client" xmlns:xsi="http://www.w3.org/2001/XMLSchema" xsi:noNamespaceSchemaLocation="config.xsd">
        <servers>
                <!-- Local mode for development -->
                <server ip="127.0.0.1" port="2280" http-port="2281" />
        </servers>
</config>
```

2) 配置服务端的数据库配置```datasources.xml```，文件路径```/data/appdatas/cat/datasources.xml```,需要替换对应的线上配置

上面的对应**cat**服务数据库。下面的为我们的app数据库。

```xml
<?xml version="1.0" encoding="utf-8"?>

<data-sources>
        <data-source id="cat">
                <maximum-pool-size>3</maximum-pool-size>
                <connection-timeout>1s</connection-timeout>
                <idle-timeout>10m</idle-timeout>
                <statement-cache-size>1000</statement-cache-size>
                <properties>
                        <driver>com.mysql.jdbc.Driver</driver>
                        <url><![CDATA[jdbc:mysql://127.0.0.1:3306/cat]]></url>
                        <user>root</user>
                        <password>123456</password>
                        <connectionProperties><![CDATA[useUnicode=true&autoReconnect=true]]></connectionProperties>
                </properties>
        </data-source>
        <data-source id="app">
                <maximum-pool-size>3</maximum-pool-size>
                <connection-timeout>1s</connection-timeout>
                <idle-timeout>10m</idle-timeout>
                <statement-cache-size>1000</statement-cache-size>
                <properties>
                        <driver>com.mysql.jdbc.Driver</driver>
                        <url><![CDATA[jdbc:mysql://127.0.0.1:3306/blog]]></url>
                        <user>root</user>
                        <password>123456</password>
                        <connectionProperties><![CDATA[useUnicode=true&autoReconnect=true]]></connectionProperties>
                </properties>
        </data-source>
</data-sources>
```


3) 配置服务端的```server.xml```，文件路径```/data/appdatas/cat/server.xml```

简单配置如下:

```xml
<?xml version="1.0" encoding="utf-8"?>

<!-- Configuration for development environment-->
<config local-mode="false" hdfs-machine="false" job-machine="true" alert-machine="false">

        <storage  local-base-dir="/data/appdatas/cat/bucket/" max-hdfs-storage-time="15" local-report-storage-time="7" local-logivew-storage-time="7">

        </storage>

        <console default-domain="Cat" show-cat-domain="true">
                <remote-servers>127.0.0.1:2281</remote-servers>
        </console>

</config>
```


4) 路由配置, 默认用户 ```catadmin/catadmin```

```
http://127.0.0.1:2281/cat/s/config?op=routerConfigUpdate
```

默认进入【全局告警配置】-》【客户端路由】,修改内容如下:

```xml
<?xml version="1.0" encoding="utf-8"?>
<router-config backup-server="127.0.0.1" backup-server-port="2280">
   <default-server id="127.0.0.1" weight="1.0" port="2280" enable="true"/>
</router-config>
```

## 客户端集成

项目中需要引入 ```cat-client-XXX.jar``` and ```cat-core-XXX.jar```。这两个jar包如果想使用maven怎么得到呢?

- 本地使用: cat 项目直接 ```mvn clean install``` 会将 jar 安装到本地。

- 将cat视为自己的项目,直接打包到nexus上。

- 支持广泛使用: jar上传到 **nexus** 上。


blog 

pom.xml 添加:

```xml
<dependency>
  <groupId>com.dianping.cat</groupId>
  <artifactId>cat-core</artifactId>
  <version>1.4.0</version>
</dependency>

<dependency>
  <groupId>com.dianping.cat</groupId>
  <artifactId>cat-client</artifactId>
  <version>1.4.0</version>
</dependency>
```

1) Web.xml中新增filter

注：如果项目是对外不提供URL访问，比如GroupService，仅仅提供Pigeon服务，则不需要。

Filter放在url-rewrite-filter 之后的第一个，如果不是会导致URL的个数无限多，比如search/1/2,search/2/3等等，无法监控，后端存储压力也变大。

暂时跳过。

```xml
<filter>
    <filter-name>cat-filter</filter-name>
    <filter-class>com.dianping.cat.servlet.CatFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>cat-filter</filter-name>
    <url-pattern>/*</url-pattern>
    <dispatcher>REQUEST</dispatcher>
    <dispatcher>FORWARD</dispatcher>
</filter-mapping>
```


2) 设置domain (cat-core 1.1.3之后版本，优先读取A配置)

A) 在资源文件中新建app.properties文件

在resources资源文件META-INF下，注意是src/main/resources/META-INF/文件夹， 而不是webapps下的那个META-INF,添加app.properties，加上domain配置，如：

```
app.name=blog
```


B) 在资源文件中新建client.xml文件

在resources资源文件META-INF下，新建cat文件夹，注意是src/main/resources/META-INF/cat/client.xml文件， 而不是webapps下的那个META-INF,domain id表示项目名称此处为CMDB申请的名字，比如

```
<config mode="client">
    <domain id="tuangou-web"/>
</config>
```

3) /data/appdatas/cat/client.xml

```xml
<?xml version="1.0" encoding="utf-8"?>

<config mode="client" xmlns:xsi="http://www.w3.org/2001/XMLSchema" xsi:noNamespaceSchemaLocation="config.xsd">
        <servers>
                <!-- Local mode for development -->
                <server ip="127.0.0.1" port="2280" http-port="2281" />

                <domain id="blog" enabled="true"/>
        </servers>
</config>
```

4) 与 Log4j2 集成

log4j2.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="off" monitorInterval="1800">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS}  %-5level [%t] %logger{36}:%L - %msg%n"/>
        </Console>

        <!--cat log-->
        <appender name="CatAppender" class="com.dianping.cat.log4j.CatAppender"/>
    </Appenders>

    <Loggers>
        <Root level="INFO">
            <AppenderRef ref="CatAppender"/>
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

## 报错

启动后一直报错如下:

```
java.lang.RuntimeException: Unable to get instance of Logger, please make sure the environment was setup correctly!
    org.unidal.initialization.DefaultModuleContext.<init>(DefaultModuleContext.java:28)
    com.dianping.cat.Cat.initialize(Cat.java:91)
    com.dianping.cat.Cat.initialize(Cat.java:87)
    com.dianping.cat.Cat.checkAndInitialize(Cat.java:45)
    com.dianping.cat.Cat.getManager(Cat.java:72)
    com.dianping.cat.servlet.CatFilter$CatHandler$1.handle(CatFilter.java:104)
    com.dianping.cat.servlet.CatFilter$Context.handle(CatFilter.java:406)
    com.dianping.cat.servlet.CatFilter.doFilter(CatFilter.java:53)
root cause
```

根据如下可知,应该是```mvn-tomcat-plugin```造成的冲突,就改成了jetty插件。亲测可行。

> [ISSUE 699](https://github.com/dianping/cat/issues/699)

# 拓展阅读

[Prometheus-监控](https://houbb.github.io/2019/04/01/monitor-prometheus)

# 参考资料

> [cat zh_CN](http://www.icaijing.org/finance/article4761593/)

[blog](http://www.cnblogs.com/yjmyzz/p/dianping-cat-deploy-tutorial.html)

> [blog zh_CN](http://blog.csdn.net/ggjlvzjy/article/details/51908130)

> [blog zh_CN](http://www.2cto.com/os/201507/422030.html)

* any list
{:toc}