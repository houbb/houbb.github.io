---
layout: post
title: CentOS7 war 包部署到 tomcat 中
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, tomcat, sh]
published: true
---

# 背景

CentOS7 tomcat 部署 war 包，记录一下。

# 应用打包

## 应用 pom 调整

将打包方式修改为war

```xml
<packaging>war</packaging>
```

如果不改，默认是 `*.jar`，虽然 springboot 可以直接运行。

## 移除 tomcat 依赖

移除tomcat依赖或者将tomcat依赖scope改为provide

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

或者

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <version>${spring-boot.version}</version>
    <scope>provided</scope>
</dependency>
```

这里选择第 2 种，第一种会导致 tomcat 相关类缺失，编译过不去。

## 实现配置方法

继承org.springframework.boot.web.servlet.support.SpringBootServletInitializer，实现configure方法：

- 为什么继承该类，SpringBootServletInitializer源码注释：

```
Note that a WebApplicationInitializer is only needed if you are building a war file and deploying it. If you prefer to run an embedded web server then you won't need this at all.
```

注意，如果您正在构建WAR文件并部署它，则需要WebApplicationInitializer。

如果你喜欢运行一个嵌入式Web服务器，那么你根本不需要这个。

启动类代码：

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 实现方式 1：启动类继承SpringBootServletInitializer实现configure

```java
@SpringBootApplication
public class Application extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(Application.class);
    }
}
```

### 实现方式2：新增加一个类继承SpringBootServletInitializer实现configure

```java
public class ServletInitializer extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        //此处的Application.class为带有@SpringBootApplication注解的启动类
        return builder.sources(Application.class);
    }

}
```

此处选择方案1，直接一点。

### 注意事项

使用外部Tomcat部署访问的时候，application.properties(或者application.yml)中配置的

```
server.port=
server.servlet.context-path=
```

将失效，请使用tomcat的端口，tomcat，webapps下项目名进行访问。

为了防止应用上下文所导致的项目访问资源加载不到的问题，建议pom.xml文件中 `<build></build>`标签下添加 `<finalName></finalName>` 标签：

```xml
<build>
    <!-- 应与application.properties(或application.yml)中context-path保持一致 -->
    <finalName>war包名称</finalName>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

## maven 执行

java 应用执行 maven 打包命令：

```
$  mvn clean install
```

### 打包报错

Maven打包web项目报错：

```
webxml attribute is required (or pre-existing WEB-INF/web.xml if executing in update)
```

- 原因分析

web项目下缺少WEB-INF/web.xml

当是在servlet 3.0之后，对于web.xml文件本身是可选的

- 解决方案

（1）在pom.xml文件中定义一个参数配置

```xml
<properties>
    <failOnMissingWebXml>false</failOnMissingWebXml>
</properties>
```

（2）更新maven-war-plugin的版本

```xml
<plugin>
  <artifactId>maven-war-plugin</artifactId>
  <version>3.0.0</version>
</plugin>
```

（3）创建文件

在webapp目录下创建WEB-INF/web.xml

此处选择方案1。

### 获取 war 包

可以在 target 下，找到指定的 war 包。



# 上传到 tomcat 服务器

## 本地文件上传到服务器

打开本地命令行，cd到待传文件所在的路径：

执行命令：

```
scp  test.war   root@xxx.xxx.xx.xxx:/root/tool/tomcat/apache-tomcat-8.5.70/webapps
```

意思是将本地的 `test.war` 文件上传到远程服务器的 `/root/tool/tomcat/apache-tomcat-8.5.70/webapps` 目录下。

将war包放到tomcat webapps目录下就好了，tomcat会自动解压。

## 配置

### 端口号

打开 `/root/tool/tomcat/apache-tomcat-8.5.70/conf/server.xml` 文件, 将 `<Connector port="8080" protocol="HTTP/1.1 ...>`"将这里的8080改成80，这样的话就可以直接输入域名来访问网站了（不用加端口号了）。

另外如果项目中有存在汉字的url需要加一个属性 URIEncoding="utf-8"。

完整的是这样的：

```xml
<Connector port="80" protocol="HTTP/1.1"
               connectionTimeout="20000"
                URIEncoding="utf-8"
               redirectPort="8443" />
```

ps: 本地的 80 端口估计被占用，程序起不来。

### HOST 与 Context

继续在server.xml中配置

找到Host标签，大概长这样：

```xml
<Host name="localhost" appBase="webapps" unpackWARs="true" autoDeploy="true">
        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log." suffix=".txt"
               pattern="%h %l %u %t "%r" %s %b" />
      </Host>
```

这个不用动，参考一下就行。

在下边新加一个 Host 大概是这样：

```xml
<Host name="echo-blog.xyz" appBase="webapps" unpackWARs="true" autoDeploy="true">
    <Context path="" docBase="blog" debug="0" privileged="true"/> 
    <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
        prefix="localhost_access_log" suffix=".txt"
        pattern="%h %l %u %t &quot;%r&quot; %s %b" />
</Host>
```

其中docBase是你的war文件名，如这里是 blog（对应 blog.war）

echo-blog.xyz 是你的域名，context里的path设置为空，就是访问时，域名或不用在加任何东西（如有需要可以设置）

域名相关的饿东西，下一节进行尝试。

## 重新启动 tomcat

```
./shutdown.sh
./start.sh
```

# 启动失败的问题

## 启动失败

发现启动没有发现，虽然日志成功，但是实际上是启动失败了。

报错如下：

```
 Caused by: java.net.BindException: Address already in use
                at sun.nio.ch.Net.bind0(Native Method)
                at sun.nio.ch.Net.bind(Net.java:461)
                at sun.nio.ch.Net.bind(Net.java:453)
                at sun.nio.ch.ServerSocketChannelImpl.bind(ServerSocketChannelImpl.java:222)
                at sun.nio.ch.ServerSocketAdaptor.bind(ServerSocketAdaptor.java:85)
                at org.apache.tomcat.util.net.NioEndpoint.bind(NioEndpoint.java:221)
                at org.apache.tomcat.util.net.AbstractEndpoint.init(AbstractEndpoint.java:1147)
                at org.apache.tomcat.util.net.AbstractJsseEndpoint.init(AbstractJsseEndpoint.java:222)
                at org.apache.coyote.AbstractProtocol.init(AbstractProtocol.java:599)
                at org.apache.coyote.http11.AbstractHttp11Protocol.init(AbstractHttp11Protocol.java:80)
                at org.apache.catalina.connector.Connector.initInternal(Connector.java:1074)
```

端口占用异常。

## 查看占用的 pid

```
1.先用 ps -ef | grep 8080(某个进程)，可以查看某个进程的pid。

2.再用 netstat -anp | grep pid 号，可以查看到该进程占用的端口号!
```

### 查看端口号

- lsof -i:端口号

```
lsof -i:8080
```

报错：

```
-bash: lsof: command not found
```

进行安装：

```
yum install lsof -y
```

然后很神奇的发现 8080 端口，并没有被占用。

### 查看 tomcat 运行状态

```
[root@vultr bin]# ps -ef | grep tomcat
root     22348     1  3 04:52 pts/0    00:00:43 /usr/bin/java -Djava.util.logging.config.file=/root/tool/tomcat/apache-tomcat-8.5.70/conf/logging.properties ...

root     22557     1  6 05:04 pts/0    00:00:41 /usr/bin/java -Djava.util.logging.config.file=/root/tool/tomcat/apache-tomcat-8.5.70/conf/logging.properties ...
root     22663  1461  0 05:15 pts/0    00:00:00 grep --color=auto tomcat
```

可以看到，tomcat 进程确实在运行。

### netstat -tunlp|grep 端口号

查看 pid

查看一下对应的端口：

```
netstat -anp | grep 22348
netstat -anp | grep 22557
```

先杀掉，

```
kill -9 22348
kill -9 22557
```

# jvm 参数问题

## 默认的配置问题

很多同学刚开始做项目买了最低配置，但有时运行软件好几个，服务器就趴下来，以我的经验可以这么搞，尽量运行必须要用的软件，2G内存能干什么，所以还可以优化软件本身，让启动时尽可能少占用内存空间，等用户上来再升级配置也不迟。

tomcat7默认内存配置，启动后，大约会占四百多M内存，如果是java程序又比较大，可能会出现以下问题：

java.lang.OutOfMemoryError: Java heap space ----JVM Heap(堆)溢出

java.lang.OutOfMemoryError: PermGen space ---- PermGen space溢出。

java.lang.StackOverflowError ---- 栈溢出

解决办法：

修改 `tomcat/bin/catalina.sh`

位置 cygwin=false 前。

要添加在tomcat 的bin 下catalina.sh 里，位置cygwin=false前 。

（其实就是注释下的第一句话）

注意引号要带上。

```
# OS specific support.  $var _must_ be set to either true or false.
JAVA_OPTS="-Xmx512M -Xms512M -Xmn192M -XX:MaxMetaspaceSize=64M -XX:MetaspaceSize=64M -XX:+UseSerialGC"
cygwin=false
```

https://opts.console.heapdump.cn/result/generate/3M0Y6

## 参数说明

JVM参数说明：

```
-server：一定要作为第一个参数，在多个CUP时性能佳

-Xms：java Heap初始化大小。默认物理内存的1/64

-Xmx:java Heap最大值。建议平均物理内存的一般。不可超过物理内存。

-XX：PermSize：设定内存的永久保存区初始化大小，缺省为64M

-XX：MaxPermSize：设定内存的永久保存区最大大小，缺省委64M、

-XX：SurvivorRatio=2:生还者池的大小，默认是2，如果垃圾回收变成了瓶颈，您可以尝试定值生成池设置

-XX：NewSize：新生成的池初始化大小，缺省为2M。

-XX：MaxNewSize：新生成的池最大大小。缺省为32M。
```


# 参考资料

[SPRINGBOOT-把WEB项目打成WAR包部署到外部TOMCAT](https://www.cnblogs.com/lichangyunnianxue/p/9729395.html)

[maven 打包报错](https://blog.csdn.net/weixin_41699562/article/details/99302298)

[本地文件上传到Linux服务器的几种方法](https://blog.csdn.net/weixin_34270865/article/details/92937089)

[本地文件上传centos服务器](https://blog.csdn.net/jason_jiahongfei/article/details/117756105)

[Tomcat部署java web项目,war包方式](https://www.jianshu.com/p/e48ae3b99573)

https://www.cnblogs.com/java-zhao/p/5829598.html

[Centos7-低配情况下 Tomcat jvm内存溢出优化配置及JVM参数说明](https://www.cnblogs.com/XMYG/p/14640749.html)

[centos中修改tomcat中JVM非堆内存默认配置解决内存溢出](https://www.cnblogs.com/dion-90/articles/8651493.html)

https://blog.csdn.net/wxmiy/article/details/88893053

* any list
{:toc}