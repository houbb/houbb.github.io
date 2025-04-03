---
layout: post
title: jvm-sandbox-01-quick start 快速入门实战
date:  2020-6-4 13:34:28 +0800
categories: [Jvm]
tags: [jvm, sandbox, aop, sh]
published: true
---


# java 程序准备

首先准备一个简单的 java web 程序。

> [springboot 入门例子](https://houbb.github.io/2017/12/19/spring-boot-01-hello)

## 打包

```
mvn clean package
```

然后把对应的 jar `springboot-hello-word-1.0-SNAPSHOT.jar` 上传到 linux 服务器。

## 启动

```
java -jar springboot-hello-word-1.0-SNAPSHOT.jar
```

启动报错 

```
No main manifest attribute, in XXX.jar
```

### 解决办法

修正一下 xml，添加一下 maven 编译插件

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version>
            <configuration>
                <source>1.8</source>
                <target>1.8</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <version>2.6.13</version>
            <configuration>
                <mainClass>com.github.houbb.SampleController</mainClass>
                <!--                    <skip>true</skip>-->
            </configuration>
            <executions>
                <execution>
                    <id>repackage</id>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

重新打包+上传+启动

正常启动

```
$ java -jar springboot-hello-word-1.0-SNAPSHOT.jar

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v1.5.9.RELEASE)

2025-04-03 13:21:16.582  INFO 14402 --- [           main] com.github.houbb.SampleController        : Starting SampleController v1.0-SNAPSHOT on PC-20230404XHIO with PID 14402 (/mnt/wsl/springboot-hello-word-1.0-SNAPSHOT.jar started by houbinbin in /mnt/wsl)
2025-04-03 13:21:16.588  INFO 14402 --- [           main] com.github.houbb.SampleController        : No active profile set, falling back to default profiles: default
2025-04-03 13:21:16.637  INFO 14402 --- [           main] ationConfigEmbeddedWebApplicationContext : Refreshing org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@156643d4: startup date [Thu Apr 03 13:21:16 CST 2025]; root of context hierarchy
2025-04-03 13:21:17.967  INFO 14402 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat initialized with port(s): 8080 (http)
2025-04-03 13:21:17.981  INFO 14402 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2025-04-03 13:21:17.982  INFO 14402 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet Engine: Apache Tomcat/8.5.23
2025-04-03 13:21:18.078  INFO 14402 --- [ost-startStop-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2025-04-03 13:21:18.078  INFO 14402 --- [ost-startStop-1] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 1447 ms
2025-04-03 13:21:18.213  INFO 14402 --- [ost-startStop-1] o.s.b.w.servlet.ServletRegistrationBean  : Mapping servlet: 'dispatcherServlet' to [/]
2025-04-03 13:21:18.216  INFO 14402 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'characterEncodingFilter' to: [/*]
2025-04-03 13:21:18.217  INFO 14402 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'hiddenHttpMethodFilter' to: [/*]
2025-04-03 13:21:18.217  INFO 14402 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'httpPutFormContentFilter' to: [/*]
2025-04-03 13:21:18.217  INFO 14402 --- [ost-startStop-1] o.s.b.w.servlet.FilterRegistrationBean   : Mapping filter: 'requestContextFilter' to: [/*]
2025-04-03 13:21:18.491  INFO 14402 --- [           main] s.w.s.m.m.a.RequestMappingHandlerAdapter : Looking for @ControllerAdvice: org.springframework.boot.context.embedded.AnnotationConfigEmbeddedWebApplicationContext@156643d4: startup date [Thu Apr 03 13:21:16 CST 2025]; root of context hierarchy
2025-04-03 13:21:18.569  INFO 14402 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/]}" onto java.lang.String com.github.houbb.SampleController.home()
2025-04-03 13:21:18.573  INFO 14402 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error],produces=[text/html]}" onto public org.springframework.web.servlet.ModelAndView org.springframework.boot.autoconfigure.web.BasicErrorController.errorHtml(javax.servlet.http.HttpServletRequest,javax.servlet.http.HttpServletResponse)
2025-04-03 13:21:18.574  INFO 14402 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/error]}" onto public org.springframework.http.ResponseEntity<java.util.Map<java.lang.String, java.lang.Object>> org.springframework.boot.autoconfigure.web.BasicErrorController.error(javax.servlet.http.HttpServletRequest)
2025-04-03 13:21:18.603  INFO 14402 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/webjars/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2025-04-03 13:21:18.603  INFO 14402 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2025-04-03 13:21:18.640  INFO 14402 --- [           main] o.s.w.s.handler.SimpleUrlHandlerMapping  : Mapped URL path [/**/favicon.ico] onto handler of type [class org.springframework.web.servlet.resource.ResourceHttpRequestHandler]
2025-04-03 13:21:18.796  INFO 14402 --- [           main] o.s.j.e.a.AnnotationMBeanExporter        : Registering beans for JMX exposure on startup
2025-04-03 13:21:18.871  INFO 14402 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 8080 (http)
2025-04-03 13:21:18.876  INFO 14402 --- [           main] com.github.houbb.SampleController        : Started SampleController in 2.719 seconds (JVM running for 3.609)
```

## 查看 pid

对应的 pid 为 14402

```
$ ps -ef | grep java
houbinb+   14402   11131 52 13:21 pts/2    00:00:22 java -jar springboot-hello-word-1.0-SNAPSHOT.jar
```



# 实战

## 下载 bin

```
# 下载最新版本的JVM-SANDBOX
wget https://github.com/alibaba/jvm-sandbox/wiki/upload/sandbox-stable-bin.zip

# 解压
unzip sandbox-stable-bin.zip
```

解压后如下：

```
bin/  cfg/  example/  install-local.sh*  lib/  module/  provider/  sandbox-module/
```

## 挂载目标JVM

```sh
# 进入沙箱执行脚本
cd sandbox/bin

# 目标JVM进程 14402
./sandbox.sh -p 14402
```

提示

```
$ ./sandbox.sh -p 14402
cat: /home/houbinbin/.sandbox.token: No such file or directory
                    NAMESPACE : default
                      VERSION : 1.4.0
                         MODE : ATTACH
                  SERVER_ADDR : 0.0.0.0
                  SERVER_PORT : 38365
               SERVER_CHARSET : UTF-8
               UNSAFE_SUPPORT : ENABLE
               NATIVE_SUPPORT : ENABLE
                 SANDBOX_HOME : /mnt/wsl/sandbox/bin/..
            SYSTEM_MODULE_LIB : /mnt/wsl/sandbox/bin/../module
              USER_MODULE_LIB : /mnt/wsl/sandbox/sandbox-module;/home/houbinbin/.sandbox-module
          SYSTEM_PROVIDER_LIB : /mnt/wsl/sandbox/bin/../provider
```

### 查看挂载模块

```
$ ./sandbox.sh -p 14402 -l
sandbox-info            ACTIVE          LOADED          0       0       0.0.4           luanjia@taobao.com
sandbox-module-mgr      ACTIVE          LOADED          0       0       0.0.2           luanjia@taobao.com
sandbox-control         ACTIVE          LOADED          0       0       0.0.3           luanjia@taobao.com
total=3
```

### 沙箱日志：~/logs/sandbox/sandbox.log

```
cat ~/logs/sandbox/sandbox.log
```

如下：

```
$ cat ~/logs/sandbox/sandbox.log
2025-04-03 13:24:34 default INFO
     ___     ____  __      ____    _    _   _ ____  ____   _____  __
    | \ \   / /  \/  |    / ___|  / \  | \ | |  _ \| __ ) / _ \ \/ /
 _  | |\ \ / /| |\/| |____\___ \ / _ \ |  \| | | | |  _ \| | | \  /
| |_| | \ V / | |  | |_____|__) / ___ \| |\  | |_| | |_) | |_| /  \
 \___/   \_/  |_|  |_|    |____/_/   \_\_| \_|____/|____/ \___/_/\_\
2025-04-03 13:24:34 default INFO  initializing logback success. file=/mnt/wsl/sandbox/bin/../cfg/sandbox-logback.xml;
2025-04-03 13:24:34 default INFO  initializing server. cfg=;mode=attach;sandbox_home=/mnt/wsl/sandbox/bin/..;user_module=/mnt/wsl/sandbox/sandbox-module\;~/.sandbox-module\;;cfg=/mnt/wsl/sandbox/bin/../cfg;provider=/mnt/wsl/sandbox/bin/../provider;namespace=default;server.ip=0.0.0.0;server.port=0;system_module=/mnt/wsl/sandbox/bin/../module;unsafe.enable=true;server.charset=UTF-8;
2025-04-03 13:24:34 default INFO  loading provider[com.alibaba.jvm.sandbox.provider.api.ModuleJarLoadingChain] was success from provider-jar[/mnt/wsl/sandbox/bin/../provider/sandbox-mgr-provider.jar], impl=com.alibaba.jvm.sandbox.provider.mgr.EmptyModuleJarLoadingChain
...
```

## 卸载沙箱

```
$ ./sandbox.sh -p 14402 -S
jvm-sandbox[default] shutdown finished.
```

# 个人收获

看完了入门，感觉好像没介绍功能。

觉得不知道如何使用。

# 参考资料

[jvm-sandbox 官方文档](https://github.com/alibaba/jvm-sandbox/wiki)

https://github.com/alibaba/jvm-sandbox/wiki/USER-QUICK-START

https://blog.csdn.net/m0_73381672/article/details/135891163

* any list
{:toc}