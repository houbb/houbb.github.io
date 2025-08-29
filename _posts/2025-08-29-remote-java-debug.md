---
layout: post
title: java 如何实现远程 debug?
date: 2025-8-29 20:40:12 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 个人思考

技术有时候不是那么重要。

重要的是，这个技术可以解决什么问题？

解决用户什么痛点？

比如远程 debug 也许实现起来简单，但是开发每次测试环境查询问题很麻烦，发现没打印日志。

修改代码+编译发布+验证，可能要20分钟。

那么远程 debug 就可以解决这个问题。

类似的，也可以是阿里的 [Arthas-01-java 线上问题定位处理的终极利器](https://houbb.github.io/2023/10/21/jvm-arthas-01-overview)

# java 远程 debug

## 一、什么是远程 Debug？

远程 Debug（Remote Debugging）是指：
你在 本地 IDE（如 IntelliJ IDEA、Eclipse、VS Code） 上调试运行在 远程服务器（例如 Linux 上的 Tomcat、Java 服务、Docker 容器）中的 Java 应用。

调试时，你可以：

* 设置断点
* 单步执行（Step Over / Step Into）
* 查看变量值、调用栈
* 动态修改变量值（IDE 支持时）

它就像在本地调试一样，但目标程序跑在远程。

---

## 二、原理

远程调试依赖 Java Debug Wire Protocol (JDWP)。

流程是：

1. JVM 启动时加载调试代理（agent），监听一个端口。
2. IDE 作为调试客户端，连接到这个端口。
3. 通过 JDWP 协议，IDE 和 JVM 交换调试信息（断点、变量、堆栈）。

常见 JVM 选项：

```bash
-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
```

解释：

* `agentlib:jdwp` → 启动 JDWP 调试代理
* `transport=dt_socket` → 用 socket 作为传输方式
* `server=y` → JVM 作为调试服务器，等待 IDE 连接
* `suspend=n` → 是否挂起等待调试器（n 表示直接运行，y 表示等调试器连上才运行）
* `address=*:5005` → 调试端口，远程 IP 也能访问

---

## 三、启动方式

### 1. 命令行启动

如果你是自己运行 Java 程序，可以这样：

```bash
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 -jar myapp.jar
```

然后本地 IDE 配置连接 `远程IP:5005`。

---

### 2. Tomcat 等应用服务器

修改 `catalina.sh`（Linux）或 `catalina.bat`（Windows），在 `JAVA_OPTS` 中加入：

```bash
JAVA_OPTS="$JAVA_OPTS -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
```

重启 Tomcat 后，远程调试端口就开启了。

---

### 3. Docker 容器

如果服务跑在 Docker 里，需要：

1. 在 Dockerfile 或启动参数里加 JVM 调试参数。
2. 映射调试端口，例如：

   ```bash
   docker run -p 8080:8080 -p 5005:5005 myapp
   ```
3. 本地 IDE 连接 `宿主机IP:5005`。

---

## 四、IDE 配置

### IntelliJ IDEA

1. 打开 `Run → Edit Configurations`
2. 新建 `Remote JVM Debug` 配置
3. 填写：

   * Host: 远程服务器 IP
   * Port: 5005
4. 点击调试按钮（绿色小虫），就能连上远程 JVM。

### Eclipse

1. `Run → Debug Configurations`
2. 选择 `Remote Java Application`
3. 填入 Host + Port
4. Apply & Debug。

---

## 五、实战场景

### 场景 1：线上问题排查

* 临时在测试或预发布环境启用远程调试
* 用 IDE 连上去，直接在代码里断点调试

⚠️ 注意：不要在生产环境随便开远程调试，有安全风险（未授权的人也能连上），还可能阻塞业务线程。

---

### 场景 2：本地-远程联调

例如：

* 服务端在测试机
* 前端在本地调试
* 遇到后端逻辑问题，可以直接远程打断点跟踪。

---

## 六、安全问题

远程调试本质上是 JVM 暴露了一个 调试端口，如果不加限制：

* 任何人都能连上你的 JVM
* 甚至能执行代码（高危）

解决方法：

1. 不要在公网直接暴露 `5005` 端口
2. 配合 SSH 隧道 来转发：

   ```bash
   ssh -L 5005:localhost:5005 user@remote-server
   ```

   然后 IDE 只需连 `localhost:5005`。
3. 或者用内网 VPN。

---

## 七、总结

* 远程 Debug 原理：JVM 启动时加载 JDWP agent，IDE 通过 socket 连接调试。
* 配置步骤：JVM 启动参数 + IDE Remote Debug 配置。
* 场景：排查远程环境 bug、本地-远程联调。
* 注意：生产环境要注意安全和性能影响。


* any list
{:toc}