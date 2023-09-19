---
layout: post
title: cat monitor-02-分布式监控 CAT埋点
date: 2023-09-19 21:01:55 +0800
categories: [Monitor]
tags: [monitor, sh]
published: true
---


# 埋点

在理解什么是埋点之前，首先需要了解一些基础知识：（以下摘自：http://www.chinawebanalytics.cn/auto-event-tracking-good-bad-ugly/）

我们能够监测网站上用户的行为，或者app上用户的行为，都需要在网站的每一页或者app中加上一些程序代码（基础代码）。

这样的程序代码，在网站上叫监测代码，在app中叫SDK（Software Development Kit）。

但是你要想收集到所有用户行为的数据，光有基础代码是不够的，总有一些特殊的用户操作行为是不能靠基础代码捕获的。

这一类基础代码不能捕获的用户操作行为，最典型的，是被称为event（事件）的一类行为。

至于什么是event（事件），在网页上，是那些非http类型的交互：JavaScript的、Flash的、Silverlight的、AJAX的、各种页面插件的交互等等；而在app上，则包含用户点击在内的所有交互。

你可以直接理解一个规律，那就是凡是遵守http协议的交互（最典型的就是网页的链接），皆是可以由基础监测代码直接监测到数据的，但非http类型的用户交互，基础监测代码都无能为力。

app上的所有可点击交互都是event，因为app不遵循http协议，所以基础监测代码对它们都无效。

如果每一个需要我们监测的event都被称为一个“监测点”，那么可以想象，网页上的监测点不会很多（因为大部分都是http互动，所以基础代码能搞定），而app上则布满了监测点。

## 什么是埋点？

埋点是数据领域的专业术语，它的学名叫事件追踪，对应的英文是Event Tracking。它主要是针对特定用户行为或事件进行捕获、处理和发送的相关技术及其实施过程。

根据上面所说，为了收集到监测点上的用户互动行为数据，我们可以在这些监测点上部署专用的事件监测代码（即event tracking code），这些代码需要手工一个一个地添加在想要获取数据的监测点上，这个过程被形象地称为埋点。

### 分类

埋点分为前端埋点和后端埋点：

前端（客户端）：在Web页面/App的源码里面添加行为上报的代码，当用户的行为满足某一个条件时，这些代码就会被执行，向服务器上报行为数据。

网站：目前主流的网站分析工具都是在网站上加一小段JavaScript代码，以此方式来收集数据，这种方法被称为页面标记法。以Google Analytics为例，在网站上加上GA基础代码后，用户来到这个网站，将会加载analytics.js 这个脚本文件，当用户浏览器发生相应的事件时，GA代码立即响应，携带着用户浏览器等信息一并以type为pageview 的http 请求发送到GA 的收数服务器，这样GA 服务器就收到一条记录了用户浏览了该property ID对应站点的一条日志。

APP：在APP或者界面初始化的时候，初始化第三方数据分析服务商的SDK，然后在某个事件发生时就调用SDK里面相应的数据发送接口发送数据。例如，我们想统计APP里面某个按钮的点击次数，则在APP的某个按钮被点击时，可以在这个按钮对应的 OnClick 函数里面调用SDK提供的数据发送接口来发送数据。

后端（服务器端）：开发人员在监测点植入统计代码。

前端埋点和后端埋点的区别：https://www.jianshu.com/p/15b1ffeb9724。

### 优缺点

埋点优点：可以精准控制，设置自定义属性、自定义事件，传递比较丰富的数据到服务端。

埋点缺点：1，每一个控件的埋点都需要添加相应的代码，不仅工作量大，而且限定了必须是技术人员才能完成；2，每一次更新埋点方案，都必须改代码，然后通过各个应用市场进行分发，并且总会有相当多数量的用户不喜欢更新APP，这样埋点代码也就得不到更新了；3，所有前端埋点方案都会面临,数据传输时效性和可靠性的问题，这个问题只能通过在后端收集数据来解决。


## 什么是无埋点？

无埋点无差别地记录用户在前端页面上的行为，对应的英文是Codeless Tracking。

无埋点并不是说不要添加代码，而是不需要开发人员添加额外代码。无论是埋点的方法，还是不埋点的方法，都必须要添加基础代码。

无埋点直接对页面中所有的用户行为进行监听，因此即使你不需要监测某个部分，它也仍然会将这部分的用户行为数据和对应发生的信息全收录下来。

网站：在head里面插入了一个新的script标签，异步去下载真正的核心SDK代码下来工作。所以并不是基础代码可以根据配置上报行为，而是基础代码会下载一段“更大”的SDK核心代码，这段代码才是SDK真正的功能实现。

APP：在APP里嵌入SDK，SDK利用CSS选择器技术和监听控件的事件触发技术，会把用户的行为数据尽可能的采集下来。

### 优缺点

无埋点优点：1，技术成本低，对用户非常友好，不需要重新部署，配置完成就可以生效；2，数据可以“回溯”。

无埋点缺点：1，上报的数据量比埋点大很多，里面可能很多是没有价值的数据；2，不能灵活地自定义属性；3，传输时效性和数据可靠性欠佳；4，由于所有的控件事件都全部搜集，会给服务器和网络传输带来更大的负载。

## 什么是可视化埋点？

可视化埋点，即可视化事件监测部署，指通过可视化工具快速配置采集节点（圈点），在前端自动解析配置，并根据配置上传埋点数据。

可视化埋点和无埋点非常相似，两者的区别在于：可视化埋点先通过界面配置哪些控件的操作数据需要收集，而无埋点则是先尽可能收集所有的控件的操作数据，然后再通过界面配置哪些数据需要在系统里面进行分析。

在Web页面/App的界面上进行圈选，配置需要监测界面上哪一个元素，然后保存这个配置，当App启动时会从后台服务器获得产品/运营预先圈选好的配置，然后根据这份配置查找并监测App界面上的元素，当某一个元素满足条件时，就会上报行为数据到后台服务器。

### 优缺点

可视化埋点优点：方便产品和运营直接在页面上进行圈选所需的部分。


## 总结：

| 埋点	| 无埋点 | 	可视化埋点 |
|:---|:---|:---|
| 前端+后端	            | 前端	| 前端 |
| 基础代码+事件监测代码	| 基础代码	| 基础代码+可视化工具 |

此外，现在很多地方对埋点的叫法都不一样，因此在这里把可能的叫法都列举一下，以免搞混：

埋点---代码埋点，手动埋点

无埋点---全埋点，无痕埋点

可视化埋点---可视化无痕埋点

# cat 埋点

接下来我们介绍一下 CAT 中如何埋点。

# 1、配置/data/appdatas/cat/client.xml

说明：

client.xml是配置CAT服务端地址的，这样监控数据才能发送到服务端。

如果该配置文件不存在，（就算配置了后面的配置项）CAT监控不会启用，会打印出warn级别的日志：

```
CAT Monitor Disabled: CAT client configuration file does not exist!
```

## LINUX环境下：


创建目录，并分配权限：

```
[root@tjy ~]# mkdir -p /data/appdatas/cat
[root@tjy ~]# chmod 777 /data/ -R
```

配置client.xml文件：

```
[root@tjy ~]# ll /data/appdatas/cat/client.xml 
-rw-r--r-- 1 root root 360 7月  26 16:06 /data/appdatas/cat/client.xml
[root@tjy ~]#
[root@tjy ~]# cat !$
cat /data/appdatas/cat/client.xml
```

- client.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<config mode="client" xmlns:xsi="http://www.w3.org/2001/XMLSchema" xsi:noNamespaceSchemaLocation="config.xsd">
    <servers>
        <server ip="cat.xxx.cn" port="2250" http-port="8250"/>
        <server ip="cat.xxx.cn" port="2251" http-port="8251"/>
        <server ip="cat.xxx.cn" port="2252" http-port="8252"/>
    </servers>
</config>
```

## WINDOWS环境下：

同样的，在程序运行盘下创建盘下的/data/appdatas/cat目录，目录中配置client.xml。

注意：如果tomcat安装D盘，eclipse安装F盘，在eclipse中用tomcat运行程序，应该创建F:/data/appdatas/cat
    
配置可以加入CAT的开关，用于关闭CAT消息发送,将enabled改为false，如下表示将gc-pay这个项目关闭：

```xml
  <config mode="client">
    <servers>
        <server ip="cat.xxx.cn" port="2250" http-port="8250"/>
        <server ip="cat.xxx.cn" port="2251" http-port="8251"/>
        <server ip="cat.xxx.cn" port="2252" http-port="8252"/>
    </servers>
    <domain id="gc-pay" enabled="false"/>
</config>   
```

# 2、pom.xml引入CAT客户端SDK依赖

```xml
<dependency>
  <groupId>com.tjy</groupId>
  <artifactId>my-cat-client</artifactId>
  <version>1.1.0</version>
</dependency>
```

# 3、配置domain

说明：
            也就是应用的名称，当有监控数据上传到CAT后，一会就可以在CAT页面上看到该名称的应用。
            当在CAT页面选择该应用后，就可以看到该应用所有服务实例的监控数据。
            因为跟踪ID的前缀就是配置的domain。
    
配置：

在项目工程里resources资源文件META-INF下，注意是 `src/main/resources/META-INF/` 文件夹，而不是webapps下的那个META-INF，添加app.properties文件；

app.properties文件里配置domain，如：

```
app.name=my-project-name
```

# 4、开启CAT监控–@EnableCatClient

在Spring容器能扫描到的地方配置注解 `@EnableCatClient`，开启CAT监控。

如Spring Boot程序，可以在如下配置：

```java
@SpringBootApplication
@EnableCatClient
public class ServiceRibbonApplication {
    ......
}
```

CAT监控延时初始化说明：

@EnableCatClient 默认禁用CAT监控延时初始化，即在程序启动时初始化。

因为延时初始化可能会在第一次监控请求时触发初始化，导致该请求响应时间大大增加。
                
建议保持默认禁用该功能。

如果启用请配置：`@EnableCatClient(lazyInit=true)`


# 5、跨服务全链路跟踪功能

@EnableCatClient开启CAT监控后，会有跨服务全链路跟踪功能。

暂时支持该功能的通信组件如下：

Spring Cloud Ribbon、Spring Cloud Feign（不兼容Sleuth）、Dubbo RPC

# 6、Servlet容器HTTP访问监控功能

@EnableCatClient开启CAT监控后，默认启用对Servlet容器（Tomcat）的HTTP URL访问监控功能。

用来记录外部的URL访问。
        
禁用配置：

建议默认开启该功能。

如果没有用到Servlet容器（如tomcat）运行应用程序，或应用程序对外不提供URL访问，可以禁用该功能，只需要配置：

```java
@EnableCatClient(enableCatFilter=false)
```

# 7、方法调用监控

`@EnableCatClient` 开启CAT监控后，可以用以下两种方法来指定需要监控的方法调用。

## 7-1、包路径方法监控

@EnableCatClient 提供 methodMonitorPackages参数来设置包路径方法监控。

可设置多个包路径，如：

```java
@EnableCatClient(methodMonitorPackages={"com.tjy.test.web", "com.tjy.test.service"})
```
                        
"com.tjy.test.web"和"com.tjy.test.service"包路径及其子包路径中的所有公开(public)方法将获得监控。
                        
默认值为一个无效的包路径，即默认不设置的情况下，不监控任何方法。

另外，方法调用异常时，仅记录异常状态（名称），不记录详细的异常信息。

如果需要记录异常堆栈信息，可以用下面的注解方法监控。

## 7-2、注解方法监控

@CatMethodMonitor 注解可标识指定目标方法进行监控。

@CatMethodMonitor可以标注在实现类上，或实现类的方法上；暂时不支持标注在接口及其方法上的监控。
                
@CatMethodMonitor有一个参数isRecordException，用来指示是否记录方法抛出的异常堆栈信息。

默认仅记录异常状态（名称），不记录详细的异常信息。

如果不配置Servlet容器HTTP访问监控功能的情况下，建议在外部访问的Controller层启用该参数，以记录抛出的异常堆栈信息：

```java
@CatMethodMonitor(isRecordException=true)
```

# 8、SQL执行监控

从my-cat-client V1.0.0版本开始支持Mybatis3执行SQL（时间、异常）情况的监控。

只要配置提供的Mybtis插件：

```java
com.tjy.monitor.catclient.mybatis.CatMybatisSqlMonitorPlugin
```

## 配置参考：

1、Spring Boot方式（Java配置）

推荐使用这种集成方式：Spring Boot + Mybatis + Druid(数据库连接池)

注意：这种方式必须引用mybatis-spring-boot-starter，才能使用下面的配置类直接返回插件拦截器，否则不生效。

这种方式可以不用配置Mybitas SqlSessionFactory；

也可以不配置DataSource，但建议另外引用配置Druid。

配置类：

```java
@Configuration
public class CatMonitorConfiguration {
    @Bean
     public Interceptor paginationInterceptor() {
          CatMybatisSqlMonitorPlugin plugin = new CatMybatisSqlMonitorPlugin();
          return plugin;
     }
}               
```

2、XML文件（mybatis-conf.xml）配置方式

```xml
<!-- CAT监控插件 -->
<plugins>
  <plugin interceptor="com.tjy.monitor.catclient.mybatis.CatMybatisSqlMonitorPlugin">
  </plugin>
</plugins>     
```

3、Mybitas SqlSessionFactory配置方式

如果没有mybatis-conf.xml配置文件，可以把插件配置到Mybitas SqlSessionFactory里。

XML配置如下：

```xml
<!-- 配置mybitas SqlSessionFactory Bean -->
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
    ......(dataSource配置等等)
    <!-- CAT监控插件 -->
    <property name="plugins">
        <array>
            <bean class="com.tjy.monitor.catclient.mybatis.CatMybatisSqlMonitorPlugin">
            </bean>
        </array>
    </property>
</bean>
```                  

Java配置如下：

```java
@Bean
public SqlSessionFactoryBean createSqlSessionFactory() {
    SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
    ......(dataSource配置等等)
    // CAT监控插件
    Interceptor[] plugins = { new CatMybatisSqlMonitorPlugin() };
    sqlSessionFactoryBean.setPlugins( plugins );
    return sqlSessionFactoryBean;
}
```

# 9、配置日志框架

CAT支持Log4j、Log4j2、Logback的集成。

属于可选功能，即对logger.xxx()有效，不影响CAT埋点API。
        
功能说明：

1、仅上传包含异常的ERROR级别日志

ERROR级别，且需要包含异常堆栈信息，即Throwable对象，否则CAT不上传；

如这API打印的错误信息：

```java
org.slf4j.Logger.error(String msg, Throwable t)                
```          

2、在一个messageTree内部，cat内部会针对同样的异常，如果连续调用两次logError(e)，仅仅会上报第一份exception。

注意框架打印了一个Exception，如果业务包装此异常为 `new BizException(e)`，这样仍旧算两次异常，上报两份。        
                    
测试：

如下在启动时打印日志测试：

```java
logger.error("produce-01 error test...", new RuntimeException("need ThrowableInformation"));
Cat.getManager().setTraceMode(true);
logger.info("produce-01 starting...");
```
                    
CAT页面会看到如下信息

```
t10:19:26.145    System    MergeTree
E10:19:26.145    RuntimeException    java.lang.RuntimeException    ERROR    produce-01 error test... java.lang.RuntimeException: need ThrowableInformation
AT com.test.producer.Produce1.main(Produce1.java:19)
T10:19:26.155    System    MergeTree         10ms
```                            

## 9-1、Log4j集成

说明：cat-client提供继承了Log4j.AppenderSkeleton的CatAppender，用来监控上传程序中log4j打印的日志。
            
配置：            

在Log4j的配置文件中配置CatAppender；
                    
如上面说明中，没有开启traceMode的情况下，只记录包含异常堆栈信息的ERROR级别日志；

这样的话，建议在Root节点中添加此Appendar，业务程序的所有异常都通过记录到CAT中，方便看到业务程序的问题。
                    
如果需要info/warn级别的日志（开启traceMode），或需要控制ERROR日志；

可自定义细粒度控制，把catAppender添加到具体路径即可，下面只作参考。

```xml
<appender name="catAppender" class="com.dianping.cat.log4j.CatAppender"></appender>
                            
<!--细粒度控制包的日志级别(参考) -->
<logger name="com.test" additivity="false">
    <level value="debug" />
    <appender-ref ref="log.console" />
    <appender-ref ref="catAppender" />
</logger>

<!--全局日志(参考) -->
<root>
    <level value="info" />
    <appender-ref ref="log.console" />
    <appender-ref ref="catAppender"/>
</root>     
```

properties文件配置方式：

```properties
log4j.appender.catAppender = com.dianping.cat.log4j.CatAppender

#参考
log4j.logger.com.tjy.service = info,catAppender 
```

## 9-2、Logback集成

说明：

cat-client 2.0.0版本并没有支持，需要用master代码来编译；

但现在master代码的CatLogbackAppender，和log4j的CatAppender行为不一致（行为是指上面的"说明"）。

所以，应该使用我们自己封装的SDK（gc-cat-client） 里的CatLogbackAppender，以获得一致的行为，类名如下：

```java
com.tjy.monitor.catclient.logback.CatLogbackAppender
```     

配置：有关说明同log4j。

xml文件配置方式：

```xml
<appender name="CatAppender" class="com.tjy.monitor.catclient.logback.CatLogbackAppender"></appender>

<root level="info">
    <appender-ref ref="CatAppender" />
</root>
```
                        
# 10、页面配置

对项目进行了以上配置，部署（测试）后就会有监控数据上传到我们的CAT服务器集群。

这时需要对CAT服务页面上进行一些配置，以便我们能看到自己项目的监控数据、报表。
        
访问地址：

实时：http://192.168.1.52:8888/cat/r/t
文档：http://192.168.1.52:8888/cat/r/home
配置（帐号/密码都为admin）：http://192.168.1.52:8888/cat/s/config
全局报表：http://192.168.1.52:8888/cat/r/overload

## 10-1、“项目基本信息”配置

前面"配置domain"也说过，当项目刚开始接入有监控数据上传到CAT后，会在CAT“项目基本信息”配置页面上看到该名称的应用。

s“项目基本信息”配置页面配置页面：http://192.168.1.52:8888/cat/s/config?op=projects

注意：

直接在搜索框输入配置的项目domain的前面几个字符，应该可以在下拉框看到完整的项目domain，直接选择就可以了。

如果下拉框没有出现项目domain，说明接入配置有问题。

如下图所示：

![config](https://img-blog.csdnimg.cn/20190906152209910.png)

“项目基本信息”配置可以按页面上的说明填写，后期也可以更改的。        

## 10-2、“项目分组配置”配置

这里需要添加配置好的项目，否则在后面的“应用监控配置”-》“业务监控配置”页面就没无法选择自己的项目进行配置了。

## 10-3、其他配置

其他配置就看着配置吧，不太重要。
        
页面配置好后，进入实时数据页面：http://192.168.1.52:8888/cat/r/t

点击最上面的“全部”按键，出现的下拉框就会看到配置的所有项目。（也可以在输入框直接输入项目名称）

如下图所示：

![other config](https://img-blog.csdnimg.cn/20190906152226967.png)

当在选择自己的项目后，就可以看到该项目所有服务实例的监控数据了。

# 参考资料

https://blog.csdn.net/tjiyu/article/details/100579884

https://www.cnblogs.com/HuZihu/p/11446571.html

http://www.chinawebanalytics.cn/auto-event-tracking-good-bad-ugly/

* any list
{:toc}