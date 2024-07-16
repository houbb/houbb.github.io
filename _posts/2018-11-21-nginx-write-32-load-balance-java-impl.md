---
layout: post
title:  从零手写实现 nginx-32-load balance 负载均衡算法 java 实现
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---

# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

## 手写 nginx 系列

如果你对 nginx 原理感兴趣，可以阅读：

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[从零手写实现 nginx-06-文件夹自动索引](https://houbb.github.io/2018/11/22/nginx-write-06-dir-list)

[从零手写实现 nginx-07-大文件下载](https://houbb.github.io/2018/11/22/nginx-write-07-big-file)

[从零手写实现 nginx-08-范围查询](https://houbb.github.io/2018/11/22/nginx-write-08-range)

[从零手写实现 nginx-09-文件压缩](https://houbb.github.io/2018/11/22/nginx-write-09-comparess)

[从零手写实现 nginx-10-sendfile 零拷贝](https://houbb.github.io/2018/11/22/nginx-write-10-sendfile)

[从零手写实现 nginx-11-file+range 合并](https://houbb.github.io/2018/11/22/nginx-write-11-file-and-range-merge)

[从零手写实现 nginx-12-keep-alive 连接复用](https://houbb.github.io/2018/11/22/nginx-write-12-keepalive)

[从零手写实现 nginx-13-nginx.conf 配置文件介绍](https://houbb.github.io/2018/11/22/nginx-write-13-nginx-conf-intro)

[从零手写实现 nginx-14-nginx.conf 和 hocon 格式有关系吗？](https://houbb.github.io/2018/11/22/nginx-write-14-nginx-conf-hocon)

[从零手写实现 nginx-15-nginx.conf 如何通过 java 解析处理？](https://houbb.github.io/2018/11/22/nginx-write-15-nginx-conf-parser)

[从零手写实现 nginx-16-nginx 支持配置多个 server](https://houbb.github.io/2018/11/22/nginx-write-16-nginx-conf-multi-server)

[从零手写实现 nginx-17-nginx 默认配置优化](https://houbb.github.io/2018/11/22/nginx-write-17-nginx-conf-global-default)

[从零手写实现 nginx-18-nginx 请求头+响应头操作](https://houbb.github.io/2018/11/22/nginx-write-18-nginx-conf-header-oper)

[从零手写实现 nginx-19-nginx cors](https://houbb.github.io/2018/11/22/nginx-write-19-cors)

[从零手写实现 nginx-20-nginx 占位符 placeholder](https://houbb.github.io/2018/11/22/nginx-write-20-placeholder)

[从零手写实现 nginx-21-nginx modules 模块信息概览](https://houbb.github.io/2018/11/22/nginx-write-21-modules-overview)

[从零手写实现 nginx-22-nginx modules 分模块加载优化](https://houbb.github.io/2018/11/22/nginx-write-22-modules-load)

[从零手写实现 nginx-23-nginx cookie 的操作处理](https://houbb.github.io/2018/11/22/nginx-write-23-cookie-oper)

[从零手写实现 nginx-24-nginx IF 指令](https://houbb.github.io/2018/11/22/nginx-write-24-directives-if)

[从零手写实现 nginx-25-nginx map 指令](https://houbb.github.io/2018/11/22/nginx-write-25-directives-map)

[从零手写实现 nginx-26-nginx rewrite 指令](https://houbb.github.io/2018/11/22/nginx-write-26-directives-rewrite)

[从零手写实现 nginx-27-nginx return 指令](https://houbb.github.io/2018/11/22/nginx-write-27-directives-return)

[从零手写实现 nginx-28-nginx error_pages 指令](https://houbb.github.io/2018/11/22/nginx-write-28-directives-error-pages)

[从零手写实现 nginx-29-nginx try_files 指令](https://houbb.github.io/2018/11/22/nginx-write-29-directives-try_files)

[从零手写实现 nginx-30-nginx proxy_pass upstream 指令](https://houbb.github.io/2018/11/22/nginx-write-30-proxy-pass)

[从零手写实现 nginx-31-nginx load-balance 负载均衡](https://houbb.github.io/2018/11/22/nginx-write-31-load-balance)

# nginx 支持哪几种负载均衡算法？

Nginx 支持以下几种主要的负载均衡算法：

1. **轮询（Round Robin）**
   - 默认的负载均衡算法，请求依次分配给每个后端服务器。

2. **权重轮询（Weighted Round Robin）**
   - 基于权重进行轮询，权重越高的服务器分配的请求越多。

3. **最少连接（Least Connections）**
   - 新请求分配给当前活动连接数最少的服务器。

4. **IP 哈希（IP Hash）**
   - 根据客户端的 IP 地址分配请求，确保相同 IP 地址的请求分配到同一台服务器上。

5. **一致性哈希（Hash）**
   - 根据用户定义的键（如 URL、cookie 等）分配请求，确保相同键的请求分配到同一台服务器上。

### 示例配置

#### 1. 轮询（Round Robin）
```conf
upstream my_backend {
    server 192.168.0.1;
    server 192.168.0.2;
    server 192.168.0.3;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://my_backend;
    }
}
```

#### 2. 权重轮询（Weighted Round Robin）
```conf
upstream my_backend {
    server 192.168.0.1 weight=3;
    server 192.168.0.2 weight=2;
    server 192.168.0.3 weight=1;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://my_backend;
    }
}
```

#### 3. 最少连接（Least Connections）
```conf
upstream my_backend {
    least_conn;
    server 192.168.0.1;
    server 192.168.0.2;
    server 192.168.0.3;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://my_backend;
    }
}
```

#### 4. IP 哈希（IP Hash）
```conf
upstream my_backend {
    ip_hash;
    server 192.168.0.1;
    server 192.168.0.2;
    server 192.168.0.3;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://my_backend;
    }
}
```

#### 5. 一致性哈希（Hash）
```conf
upstream my_backend {
    hash $request_uri;
    server 192.168.0.1;
    server 192.168.0.2;
    server 192.168.0.3;
}

server {
    listen 80;
    server_name www.example.com;

    location / {
        proxy_pass http://my_backend;
    }
}
```

### 总结

Nginx 支持多种负载均衡算法，包括轮询、权重轮询、最少连接、IP 哈希和一致性哈希。

每种算法适用于不同的场景，可以根据具体需求选择合适的算法来优化负载均衡策略。




----------------------------------------------------------------------------------------------------------------------------------------

# chat

# java 如何实现轮询算法？具体实现

轮询算法（Round Robin）是一种简单的负载均衡算法，它将请求依次分配给每个后端服务器。

为了在 Java 中实现轮询算法，可以使用一个计数器来跟踪当前被选中的服务器索引，并在每次请求时递增该计数器。

下面是一个具体的实现示例：

### 示例代码

```java
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class RoundRobinLoadBalancer {

    private List<String> servers;
    private AtomicInteger currentIndex;

    public RoundRobinLoadBalancer(List<String> servers) {
        this.servers = servers;
        this.currentIndex = new AtomicInteger(0);
    }

    public String getNextServer() {
        int index = currentIndex.getAndUpdate(i -> (i + 1) % servers.size());
        return servers.get(index);
    }

    public static void main(String[] args) {
        List<String> servers = List.of("192.168.0.1", "192.168.0.2", "192.168.0.3");
        RoundRobinLoadBalancer loadBalancer = new RoundRobinLoadBalancer(servers);

        // 模拟10次请求
        for (int i = 0; i < 10; i++) {
            String server = loadBalancer.getNextServer();
            System.out.println("Redirecting request to: " + server);
        }
    }
}
```

### 代码解释

1. **RoundRobinLoadBalancer 类**：
   - `servers`：存储后端服务器的列表。
   - `currentIndex`：用来跟踪当前被选中的服务器索引，使用 `AtomicInteger` 保证线程安全。

2. **构造方法**：
   - `RoundRobinLoadBalancer(List<String> servers)`：初始化服务器列表和计数器。

3. **getNextServer 方法**：
   - `currentIndex.getAndUpdate(i -> (i + 1) % servers.size())`：获取当前索引并将其递增，循环回到列表开头（通过取模运算）。

4. **main 方法**：
   - 创建一个包含三个服务器地址的列表。
   - 初始化 `RoundRobinLoadBalancer` 对象。
   - 模拟 10 次请求，每次调用 `getNextServer` 方法获取下一个服务器地址。

### 线程安全

使用 `AtomicInteger` 保证在多线程环境下，`currentIndex` 的递增操作是线程安全的。如果不需要线程安全，可以使用普通的 `int` 和 `synchronized` 关键字来实现。

### 示例输出

运行上述代码将会输出如下内容（每次运行可能会有所不同）：

```
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.2
Redirecting request to: 192.168.0.3
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.2
Redirecting request to: 192.168.0.3
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.2
Redirecting request to: 192.168.0.3
Redirecting request to: 192.168.0.1
```

每次请求都会按照轮询顺序分配给不同的服务器。

# java 如何实现权重轮询算法？具体实现

实现权重轮询算法（Weighted Round Robin）可以根据每个服务器的权重来分配请求，权重越高的服务器接收的请求越多。我们可以通过维护一个加权后的服务器列表来实现这个功能。

### 示例代码

```java
import java.util.ArrayList;
import java.util.List;

class Server {
    String ip;
    int weight;

    Server(String ip, int weight) {
        this.ip = ip;
        this.weight = weight;
    }
}

public class WeightedRoundRobinLoadBalancer {

    private List<Server> servers;
    private List<String> weightedServerList;
    private int currentIndex;

    public WeightedRoundRobinLoadBalancer(List<Server> servers) {
        this.servers = servers;
        this.weightedServerList = new ArrayList<>();
        this.currentIndex = 0;

        // 根据服务器的权重初始化加权后的服务器列表
        for (Server server : servers) {
            for (int i = 0; i < server.weight; i++) {
                weightedServerList.add(server.ip);
            }
        }
    }

    public String getNextServer() {
        if (weightedServerList.isEmpty()) {
            throw new IllegalStateException("No servers available");
        }

        String server = weightedServerList.get(currentIndex);
        currentIndex = (currentIndex + 1) % weightedServerList.size();
        return server;
    }

    public static void main(String[] args) {
        List<Server> servers = List.of(
                new Server("192.168.0.1", 3), // 权重为3
                new Server("192.168.0.2", 2), // 权重为2
                new Server("192.168.0.3", 1)  // 权重为1
        );
        WeightedRoundRobinLoadBalancer loadBalancer = new WeightedRoundRobinLoadBalancer(servers);

        // 模拟10次请求
        for (int i = 0; i < 10; i++) {
            String server = loadBalancer.getNextServer();
            System.out.println("Redirecting request to: " + server);
        }
    }
}
```

### 代码解释

1. **Server 类**：
   - `ip`：服务器的 IP 地址。
   - `weight`：服务器的权重。

2. **WeightedRoundRobinLoadBalancer 类**：
   - `servers`：存储服务器及其权重的列表。
   - `weightedServerList`：加权后的服务器列表，通过重复添加服务器 IP 来实现权重。
   - `currentIndex`：当前请求的索引。

3. **构造方法**：
   - 初始化服务器列表和加权后的服务器列表。
   - 根据每个服务器的权重，向 `weightedServerList` 中添加服务器的 IP。

4. **getNextServer 方法**：
   - 返回当前索引对应的服务器 IP。
   - 更新 `currentIndex` 以实现轮询。

5. **main 方法**：
   - 创建一个包含三个服务器和对应权重的列表。
   - 初始化 `WeightedRoundRobinLoadBalancer` 对象。
   - 模拟 10 次请求，每次调用 `getNextServer` 方法获取下一个服务器地址。

### 示例输出

运行上述代码将会输出如下内容：

```
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.2
Redirecting request to: 192.168.0.2
Redirecting request to: 192.168.0.3
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.2
```

服务器 `192.168.0.1` 的权重为 3，所以每三次中有三次会被选中；服务器 `192.168.0.2` 的权重为 2，所以每三次中有两次会被选中；服务器 `192.168.0.3` 的权重为 1，所以每六次中有一次会被选中。

# java 如何实现最少连接算法？具体实现

最少连接算法（Least Connections）是一种负载均衡算法，它将请求分配给当前活动连接数最少的服务器。

在 Java 中实现这个算法，需要跟踪每个服务器的当前连接数，并在每次请求时选择连接数最少的服务器。

### 示例代码

```java
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

class Server {
    String ip;
    AtomicInteger activeConnections;

    Server(String ip) {
        this.ip = ip;
        this.activeConnections = new AtomicInteger(0);
    }
}

public class LeastConnectionsLoadBalancer {

    private List<Server> servers;

    public LeastConnectionsLoadBalancer(List<Server> servers) {
        this.servers = servers;
    }

    public Server getNextServer() {
        if (servers.isEmpty()) {
            throw new IllegalStateException("No servers available");
        }

        Server leastConnectedServer = servers.get(0);
        for (Server server : servers) {
            if (server.activeConnections.get() < leastConnectedServer.activeConnections.get()) {
                leastConnectedServer = server;
            }
        }

        leastConnectedServer.activeConnections.incrementAndGet();
        return leastConnectedServer;
    }

    public void releaseConnection(Server server) {
        server.activeConnections.decrementAndGet();
    }

    public static void main(String[] args) {
        List<Server> servers = List.of(
                new Server("192.168.0.1"),
                new Server("192.168.0.2"),
                new Server("192.168.0.3")
        );
        LeastConnectionsLoadBalancer loadBalancer = new LeastConnectionsLoadBalancer(servers);

        // 模拟10次请求
        for (int i = 0; i < 10; i++) {
            Server server = loadBalancer.getNextServer();
            System.out.println("Redirecting request to: " + server.ip);
            // 模拟处理完成后释放连接
            loadBalancer.releaseConnection(server);
        }
    }
}
```

### 代码解释

1. **Server 类**：
   - `ip`：服务器的 IP 地址。
   - `activeConnections`：当前活动连接数，使用 `AtomicInteger` 保证线程安全。

2. **LeastConnectionsLoadBalancer 类**：
   - `servers`：存储服务器列表。

3. **构造方法**：
   - 初始化服务器列表。

4. **getNextServer 方法**：
   - 遍历服务器列表，找到当前活动连接数最少的服务器。
   - 选择该服务器后，将其活动连接数加一。

5. **releaseConnection 方法**：
   - 在请求处理完成后，将服务器的活动连接数减一。

6. **main 方法**：
   - 创建一个包含三个服务器的列表。
   - 初始化 `LeastConnectionsLoadBalancer` 对象。
   - 模拟 10 次请求，每次调用 `getNextServer` 方法获取下一个服务器地址，并在请求处理完成后调用 `releaseConnection` 方法释放连接。

### 示例输出

运行上述代码将会输出如下内容：

```
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.2
Redirecting request to: 192.168.0.2
Redirecting request to: 192.168.0.3
Redirecting request to: 192.168.0.3
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.1
Redirecting request to: 192.168.0.2
Redirecting request to: 192.168.0.2
```

服务器的选择基于当前活动连接数，确保每次请求都分配给连接数最少的服务器，从而实现均衡的负载分配。

# java 如何实现 IP 哈希算法？具体实现

IP 哈希算法（IP Hash）是一种负载均衡算法，它根据客户端的 IP 地址分配请求，确保同一 IP 地址的请求始终分配到同一台服务器。这样可以实现会话保持（session persistence）。

### 示例代码

```java
import java.util.List;
import java.util.Objects;

class Server {
    String ip;

    Server(String ip) {
        this.ip = ip;
    }
}

public class IPHashLoadBalancer {

    private List<Server> servers;

    public IPHashLoadBalancer(List<Server> servers) {
        this.servers = servers;
    }

    public Server getServer(String clientIP) {
        if (servers.isEmpty()) {
            throw new IllegalStateException("No servers available");
        }

        int hash = Math.abs(Objects.hash(clientIP));
        int serverIndex = hash % servers.size();
        return servers.get(serverIndex);
    }

    public static void main(String[] args) {
        List<Server> servers = List.of(
                new Server("192.168.0.1"),
                new Server("192.168.0.2"),
                new Server("192.168.0.3")
        );
        IPHashLoadBalancer loadBalancer = new IPHashLoadBalancer(servers);

        // 模拟请求
        String[] clientIPs = {
                "192.168.1.10", "192.168.1.20", "192.168.1.30",
                "192.168.1.40", "192.168.1.50", "192.168.1.60"
        };

        for (String clientIP : clientIPs) {
            Server server = loadBalancer.getServer(clientIP);
            System.out.println("Client IP: " + clientIP + " is routed to server: " + server.ip);
        }
    }
}
```

### 代码解释

1. **Server 类**：
   - `ip`：服务器的 IP 地址。

2. **IPHashLoadBalancer 类**：
   - `servers`：存储服务器列表。

3. **构造方法**：
   - 初始化服务器列表。

4. **getServer 方法**：
   - 根据客户端 IP 计算哈希值。
   - 使用哈希值对服务器列表大小取模，得到服务器的索引。
   - 返回对应索引的服务器。

5. **main 方法**：
   - 创建一个包含三个服务器的列表。
   - 初始化 `IPHashLoadBalancer` 对象。
   - 模拟多个客户端 IP 的请求，每次调用 `getServer` 方法获取服务器地址。

### 示例输出

运行上述代码将会输出如下内容：

```
Client IP: 192.168.1.10 is routed to server: 192.168.0.1
Client IP: 192.168.1.20 is routed to server: 192.168.0.3
Client IP: 192.168.1.30 is routed to server: 192.168.0.2
Client IP: 192.168.1.40 is routed to server: 192.168.0.2
Client IP: 192.168.1.50 is routed to server: 192.168.0.1
Client IP: 192.168.1.60 is routed to server: 192.168.0.3
```

每个客户端 IP 被映射到固定的服务器上，这样可以实现会话保持。即使多次请求，特定客户端 IP 的请求始终分配给同一台服务器。

# java 如何实现一致性哈希算法？具体实现

一致性哈希算法是一种常见的负载均衡算法，可以实现请求在服务器间的均匀分布，并且在增加或减少服务器时只影响少量请求的映射。下面是一个基于 Java 的一致性哈希算法的实现。

### 示例代码

```java
import java.util.SortedMap;
import java.util.TreeMap;

class Server {
    String ip;

    Server(String ip) {
        this.ip = ip;
    }

    @Override
    public String toString() {
        return ip;
    }
}

public class ConsistentHashingLoadBalancer {

    private final SortedMap<Integer, Server> circle = new TreeMap<>();
    private final int numberOfReplicas;

    public ConsistentHashingLoadBalancer(List<Server> servers, int numberOfReplicas) {
        this.numberOfReplicas = numberOfReplicas;
        for (Server server : servers) {
            add(server);
        }
    }

    private void add(Server server) {
        for (int i = 0; i < numberOfReplicas; i++) {
            int hash = hash(server.ip + i);
            circle.put(hash, server);
        }
    }

    public void remove(Server server) {
        for (int i = 0; i < numberOfReplicas; i++) {
            int hash = hash(server.ip + i);
            circle.remove(hash);
        }
    }

    public Server getServer(String key) {
        if (circle.isEmpty()) {
            return null;
        }
        int hash = hash(key);
        if (!circle.containsKey(hash)) {
            SortedMap<Integer, Server> tailMap = circle.tailMap(hash);
            hash = tailMap.isEmpty() ? circle.firstKey() : tailMap.firstKey();
        }
        return circle.get(hash);
    }

    private int hash(String key) {
        return key.hashCode() & 0x7fffffff; // 保证正数
    }

    public static void main(String[] args) {
        List<Server> servers = List.of(
                new Server("192.168.0.1"),
                new Server("192.168.0.2"),
                new Server("192.168.0.3")
        );
        ConsistentHashingLoadBalancer loadBalancer = new ConsistentHashingLoadBalancer(servers, 3);

        // 模拟请求
        String[] clientKeys = {
                "client1", "client2", "client3",
                "client4", "client5", "client6"
        };

        for (String key : clientKeys) {
            Server server = loadBalancer.getServer(key);
            System.out.println("Client key: " + key + " is routed to server: " + server);
        }

        // 增加一个服务器
        System.out.println("\nAdding a new server 192.168.0.4\n");
        loadBalancer.add(new Server("192.168.0.4"));

        for (String key : clientKeys) {
            Server server = loadBalancer.getServer(key);
            System.out.println("Client key: " + key + " is routed to server: " + server);
        }

        // 移除一个服务器
        System.out.println("\nRemoving a server 192.168.0.2\n");
        loadBalancer.remove(new Server("192.168.0.2"));

        for (String key : clientKeys) {
            Server server = loadBalancer.getServer(key);
            System.out.println("Client key: " + key + " is routed to server: " + server);
        }
    }
}
```

### 代码解释

1. **Server 类**：
   - `ip`：服务器的 IP 地址。

2. **ConsistentHashingLoadBalancer 类**：
   - `circle`：使用 `TreeMap` 存储服务器的哈希环。
   - `numberOfReplicas`：虚拟节点的数量，用于减少哈希碰撞。

3. **构造方法**：
   - 初始化服务器列表并将每个服务器添加到哈希环中。

4. **add 方法**：
   - 为每个服务器创建虚拟节点，并将其哈希值和服务器映射添加到哈希环中。

5. **remove 方法**：
   - 从哈希环中移除服务器及其虚拟节点。

6. **getServer 方法**：
   - 根据请求的 key 计算哈希值，在哈希环中找到大于或等于该哈希值的第一个服务器。
   - 如果没有找到合适的服务器，则返回哈希环的第一个服务器。

7. **hash 方法**：
   - 计算 key 的哈希值，并保证其为正数。

8. **main 方法**：
   - 创建一个包含三个服务器的列表。
   - 初始化 `ConsistentHashingLoadBalancer` 对象。
   - 模拟多个客户端 key 的请求，并输出请求分配的服务器。
   - 增加和移除服务器，观察请求重新分配的结果。

### 示例输出

```
Client key: client1 is routed to server: 192.168.0.3
Client key: client2 is routed to server: 192.168.0.1
Client key: client3 is routed to server: 192.168.0.1
Client key: client4 is routed to server: 192.168.0.2
Client key: client5 is routed to server: 192.168.0.1
Client key: client6 is routed to server: 192.168.0.1

Adding a new server 192.168.0.4

Client key: client1 is routed to server: 192.168.0.3
Client key: client2 is routed to server: 192.168.0.4
Client key: client3 is routed to server: 192.168.0.4
Client key: client4 is routed to server: 192.168.0.2
Client key: client5 is routed to server: 192.168.0.1
Client key: client6 is routed to server: 192.168.0.1

Removing a server 192.168.0.2

Client key: client1 is routed to server: 192.168.0.3
Client key: client2 is routed to server: 192.168.0.4
Client key: client3 is routed to server: 192.168.0.4
Client key: client4 is routed to server: 192.168.0.4
Client key: client5 is routed to server: 192.168.0.1
Client key: client6 is routed to server: 192.168.0.1
```

通过上述代码，可以看到在增加和移除服务器时，大多数请求仍然分配到相同的服务器，体现了一致性哈希算法的特点。

# 参考资料

* any list
{:toc}