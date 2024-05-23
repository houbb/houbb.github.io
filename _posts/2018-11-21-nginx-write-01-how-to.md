---
layout: post
title:  如何手写实现 nginx-01-nginx 的核心能力
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
published: true
---


# chat

## 给一份 nginx 的基本配置，及对应的配置说明。说明注释直接加在文件中。

当然可以，下面是一个基本的Nginx配置文件示例，以及配置说明：

```nginx
# Nginx配置文件通常命名为nginx.conf，位于/etc/nginx/目录下

# 定义全局块，配置一些影响Nginx服务器整体运行的指令
user nginx;  # 运行Nginx进程的用户
worker_processes auto;  # 定义Nginx进程数，通常设置为与CPU核心数相同
error_log /var/log/nginx/error.log warn;  # 定义错误日志的存放路径和记录级别
pid /var/run/nginx.pid;  # 定义Nginx进程PID文件的存放路径

# 定义events块，设置与客户端连接相关的参数
events {
    worker_connections 1024;  # 每个worker进程的最大连接数
}

# 定义http块，设置与HTTP服务相关的参数
http {
    include       mime.types;  # 包含MIME类型的配置文件
    default_type  application/octet-stream;  # 默认的MIME类型

    # 日志文件配置
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;

    # 发送文件和目录的配置
    sendfile        on;  # 开启高效文件传输模式
    tcp_nopush     on;  # 防止网络拥塞
    tcp_nodelay    on;  # 防止网络延迟

    # 定义keepalive超时时间
    keepalive_timeout  65;

    # gzip压缩设置
    gzip  on;  # 开启gzip压缩
    gzip_types  text/plain application/xml application/xhtml+xml text/css application/javascript;

    # 包含默认的服务器配置
    include /etc/nginx/conf.d/*.conf;  # 包含默认的服务器配置文件
    include /etc/nginx/sites-enabled/*;  # 包含启用的站点配置文件
}

# 定义服务器块，配置特定服务器的参数
server {
    listen       80;  # 监听80端口
    server_name  localhost;  # 定义服务器的域名

    # 定义服务器的根目录
    root   /usr/share/nginx/html;
    index  index.html index.htm;

    # 定义location块，设置请求的处理规则
    location / {
        # 处理对根目录的请求
        try_files $uri $uri/ =404;  # 尝试提供请求的文件，如果不存在则返回404错误
    }

    # 配置重定向
    location /oldpath {
        rewrite ^ http://www.example.com/newpath? permanent;  # 永久重定向
    }

    # 配置静态文件的处理
    location ~* \.(jpg|jpeg|png|gif|ico)$ {
        expires 30d;  # 设置静态文件的过期时间为30天
    }

    # 配置SSL重定向
    location ~ /.well-known/acme-challenge {
        allow all;  # 允许所有IP访问这个路径
    }

    # 配置SSL
    # 注意：以下配置需要SSL证书文件和密钥文件
    server {
        listen 443 ssl;
        server_name www.example.com;

        ssl_certificate /path/to/your/certificate.pem;  # SSL证书文件路径
        ssl_certificate_key /path/to/your/private.key;  # SSL密钥文件路径

        # SSL配置
        ssl_session_timeout 5m;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers 'HIGH:!aNULL:!MD5 or HIGH:!aNULL:!MD5:!3DES';
        ssl_prefer_server_ciphers on;

        location / {
            # 处理HTTPS请求
        }
    }
}
```

请注意，这只是一个示例配置文件，实际使用时需要根据你的具体需求进行调整。例如，你可能需要配置SSL证书、设置不同的日志文件路径、调整文件传输和压缩设置等。此外，还需要确保所有文件路径和域名与你的实际环境相匹配。

## nginx 最核心的能力是什么？给出对应的配置文件

Nginx 最核心的能力是其高性能的HTTP服务器和反向代理功能。

作为HTTP服务器，Nginx 可以处理静态文件的请求并提供高效的文件传输。

作为反向代理服务器，Nginx 可以将请求转发到后端的多个服务器上，从而实现负载均衡和提高网站的可用性。

以下是Nginx作为HTTP服务器和反向代理服务器的基本配置文件示例：

```nginx
# nginx.conf

# 用户和组
user nginx;

# 主进程PID文件
pid /var/run/nginx.pid;

# 事件模块配置
events {
    worker_connections 1024;  # 每个工作进程的最大连接数
}

# HTTP模块配置
http {
    include mime.types;  # 文件扩展名与MIME类型的映射表
    default_type application/octet-stream;

    # 日志文件配置
    log_format main '$http_x_forwarded_for - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent"';
    access_log /var/log/nginx/access.log main;

    # 文件传输设置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # Keepalive超时设置
    keepalive_timeout 65;

    # 静态文件缓存设置
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 包含默认服务器配置
    include /etc/nginx/conf.d/*.conf;

    # 定义服务器块
    server {
        # 监听端口
        listen 80;

        # 服务器名称
        server_name example.com www.example.com;

        # 根目录设置
        root /usr/share/nginx/html;

        # 默认页面索引
        index index.html index.htm;

        # 静态文件处理
        location / {
            try_files $uri $uri/ =404;
        }

        # 反向代理配置
        location /proxy/ {
            # 将请求转发到后端服务器
            proxy_pass http://backend_server;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

在这个配置文件中，我们定义了一个监听80端口的服务器，它将处理对`example.com`和`www.example.com`的请求。

服务器的根目录设置为`/usr/share/nginx/html`，这意味着所有静态文件的请求都将从这个目录中提供。

此外，我们还定义了一个`/proxy/`路径的location块，它将作为反向代理，将请求转发到配置好的后端服务器（`http://backend_server`）。这里的`proxy_pass`指令指定了后端服务器的地址，而`proxy_set_header`指令用于设置HTTP头部，确保后端服务器能够接收到原始的客户端信息。

请根据你的实际需求调整配置文件中的服务器名称、根目录、后端服务器地址等参数。

## nginx 作为 http 服务，是不是和 tomcat 处理静态文件类似

是的，Nginx 作为 HTTP 服务时，处理静态文件的方式与 Tomcat 有相似之处，但也存在一些差异。两者都可以作为 Web 服务器来提供静态文件的访问，例如 HTML、CSS、JavaScript 文件以及图片等。

**相似之处：**
1. **静态文件服务**：Nginx 和 Tomcat 都能够直接提供静态文件的访问服务。
2. **配置简便**：两者都可以通过简单的配置来指定静态文件的存放目录，并对外提供服务。
3. **性能优化**：它们都支持对静态文件的传输进行优化，比如启用压缩、设置缓存等。

**差异之处：**
1. **核心功能**：Nginx 主要是一个高性能的 HTTP 和反向代理服务器，而 Tomcat 是一个 Java Servlet 容器和 Web 服务器，主要用于运行 Java Web 应用。
2. **性能特点**：Nginx 以其轻量级和高并发处理能力著称，通常用于处理静态资源和作为反向代理服务器，而 Tomcat 更擅长于运行动态的 Java Web 应用。
3. **配置复杂度**：Nginx 的配置相对简洁，而 Tomcat 由于其 Java Servlet 容器的特性，配置可能更为复杂一些。
4. **扩展性**：Tomcat 可以很容易地与 Java 生态系统中的其他组件集成，而 Nginx 则可以通过模块扩展其功能，例如使用第三方模块来增加额外的功能。
5. **用途**：Nginx 通常用于前端的负载均衡和静态资源服务，而 Tomcat 则更多地用于后端，处理动态内容的生成。

在实际应用中，Nginx 和 Tomcat 经常一起使用，Nginx 作为前端服务器处理静态资源和反向代理请求，而 Tomcat 作为后端服务器处理动态内容的生成。

这种组合可以充分利用 Nginx 的高并发处理能力和 Tomcat 的 Java Web 应用处理能力。

## 给出 nginx 作为 http 服务器最简单常用的配置

Nginx 作为 HTTP 服务器最简单常用的配置通常涉及以下几个方面：

1. **定义服务器监听的端口**（通常是80端口，用于HTTP）。
2. **设置服务器的域名**。
3. **指定静态文件的根目录**。
4. **配置日志文件的存放路径**。

以下是一个最基本的 Nginx 配置示例：

```nginx
# nginx.conf

# 定义运行Nginx的用户和组
user nginx;

# 主进程的PID文件存放位置
pid /var/run/nginx.pid;

# 事件模块配置
events {
    worker_connections 1024;  # 每个工作进程的最大连接数
}

# HTTP模块配置
http {
    include /etc/nginx/mime.types;  # MIME类型配置文件
    default_type application/octet-stream;  # 默认的MIME类型

    # 访问日志配置
    access_log /var/log/nginx/access.log;  # 访问日志文件路径
    # 错误日志配置
    error_log /var/log/nginx/error.log;  # 错误日志文件路径

    # 文件传输设置
    sendfile on;  # 开启高效文件传输
    tcp_nopush on;  # 防止网络拥塞

    # Keepalive超时设置
    keepalive_timeout 65;

    # 定义服务器块
    server {
        listen 80;  # 监听80端口
        server_name example.com;  # 服务器域名

        # 静态文件的根目录
        root /usr/share/nginx/html;  # 静态文件存放的根目录
        index index.html index.htm;  # 默认首页

        # 定义location块，处理对根目录的请求
        location / {
            try_files $uri $uri/ =404;  # 尝试提供请求的文件，如果不存在则404
        }
    }
}
```

这个配置文件定义了一个监听80端口的HTTP服务器，它将响应对 `example.com` 的请求，并从 `/usr/share/nginx/html` 目录提供静态文件。所有的访问日志将被记录到 `/var/log/nginx/access.log`，错误日志将被记录到 `/var/log/nginx/error.log`。

这是一个非常基础的配置，适合用于部署简单的静态网站。根据你的具体需求，可能还需要添加更多的配置，比如SSL配置、反向代理设置、静态文件缓存策略等。

## 给出 nginx 作为反向代理时，最简单常用的配置文件

Nginx 作为反向代理时，其配置文件会包含一个或多个 `server` 块，用于定义如何处理客户端的请求并将其转发到后端服务器。以下是一个最简单常用的 Nginx 反向代理配置示例：

```nginx
# nginx.conf

# 定义运行Nginx的用户和组
user nginx;

# 主进程的PID文件存放位置
pid /var/run/nginx.pid;

# 事件模块配置
events {
    worker_connections 1024;  # 每个工作进程的最大连接数
}

# HTTP模块配置
http {
    include /etc/nginx/mime.types;  # MIME类型配置文件
    default_type application/octet-stream;  # 默认的MIME类型

    # 访问日志配置
    access_log /var/log/nginx/access.log;  # 访问日志文件路径
    # 错误日志配置
    error_log /var/log/nginx/error.log;  # 错误日志文件路径

    # 文件传输设置
    sendfile on;  # 开启高效文件传输
    tcp_nopush on;  # 防止网络拥塞

    # Keepalive超时设置
    keepalive_timeout 65;

    # 定义服务器块
    server {
        listen 80;  # 监听80端口
        server_name proxy.example.com;  # 反向代理服务器的域名

        # 配置反向代理
        location / {
            # 将请求转发到后端服务器
            proxy_pass http://backend_server;  # 后端服务器的地址

            # 转发头部
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # 连接设置
            proxy_connect_timeout 90;
            proxy_send_timeout 90;
            proxy_read_timeout 90;
            proxy_buffer_size 4k;

            # 其他代理设置
            proxy_redirect off;
        }
    }
}
```

在这个配置文件中，我们定义了一个监听80端口的服务器，它将响应对 `proxy.example.com` 的请求。

所有的请求都会被转发到配置的后端服务器（`http://backend_server`），这里的 `backend_server` 需要替换为实际的后端服务器地址。

反向代理配置中，`proxy_pass` 指令用于指定请求转发的目标地址，而 `proxy_set_header` 指令用于设置转发请求时所需的HTTP头部，确保后端服务器能够接收到正确的客户端信息。

请注意，根据你的实际需求，可能还需要调整超时设置、缓冲区大小、连接重试等参数。

此外，如果你的后端服务器需要身份验证或者有特殊的连接要求，可能还需要添加额外的配置指令。

# 如果是 java 语言，如何实现一个类似于 nginx 的简单的 http 服务器？

使用 Java 语言实现一个简单的 HTTP 服务器可以通过多种方式完成，其中一种简单方法是使用 Java 的 `ServerSocket` 类来监听 HTTP 请求，并使用 `Socket` 来处理每个客户端的连接。以下是一个简单的示例，它实现了一个基本的 HTTP 服务器，可以响应静态文件的请求：

```java
import java.io.*;
import java.net.*;
import java.nio.file.*;

public class SimpleHttpServer {
    public static void main(String[] args) throws IOException {
        int port = 8080; // 服务器监听的端口号
        ServerSocket serverSocket = new ServerSocket(port);
        System.out.println("Listening on port " + port);

        while (true) {
            Socket socket = serverSocket.accept();
            System.out.println("Accepted connection from " + socket.getRemoteSocketAddress());
            handleClient(socket);
        }
    }

    private static void handleClient(Socket socket) {
        try {
            InputStream input = socket.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(input));
            String header = reader.readLine();
            String[] parts = header.split(" ");
            String method = parts[0];
            String path = parts[1];
            String protocol = parts[2];

            // 只处理GET请求
            if ("GET".equalsIgnoreCase(method)) {
                File file = new File("webroot" + path);
                if (file.exists()) {
                    byte[] fileContent = Files.readAllBytes(file.toPath());
                    sendResponse(socket, 200, "OK", fileContent);
                } else {
                    sendResponse(socket, 404, "Not Found", "File not found.".getBytes());
                }
            } else {
                sendResponse(socket, 405, "Method Not Allowed", "Method not allowed.".getBytes());
            }
        } catch (IOException e) {
            try {
                sendResponse(socket, 500, "Internal Server Error", "Internal server error.".getBytes());
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        } finally {
            try {
                socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private static void sendResponse(Socket socket, int statusCode, String statusMessage, byte[] content) throws IOException {
        OutputStream output = socket.getOutputStream();
        PrintWriter writer = new PrintWriter(output, true);

        // 发送HTTP响应头
        writer.println("HTTP/1.1 " + statusCode + " " + statusMessage);
        writer.println("Content-Type: text/plain");
        writer.println("Content-Length: " + content.length);
        writer.println("Connection: close");
        writer.println();

        // 发送HTTP响应体
        output.write(content);
        output.flush();
    }
}
```

这个示例中的 `SimpleHttpServer` 类创建了一个服务器，它监听指定的端口（默认为8080）。当客户端连接时，服务器接受连接并调用 `handleClient` 方法来处理客户端请求。

`handleClient` 方法解析HTTP请求，检查请求方法是否为GET，并尝试找到对应的文件。如果文件存在，服务器将发送200状态码和文件内容作为响应；如果文件不存在，则发送404状态码和错误消息。

`sendResponse` 方法用于构建HTTP响应并发送到客户端。它发送HTTP响应头，包括状态码、状态消息、内容类型、内容长度和连接状态，然后发送响应体（文件内容或错误消息）。

请注意，这个示例非常基础，没有实现许多HTTP服务器的常见功能，比如多线程处理、持久连接、MIME类型识别、查询字符串解析、路径规范化等。

在实际应用中，你可能需要使用更高级的库或框架，如Netty、Jetty或Spring Boot来构建HTTP服务器，这些框架提供了更丰富的功能和更好的性能。


# 如果是 java 语言，如何实现一个类似于 nginx 的反向代理？

在 Java 中实现一个类似于 Nginx 的反向代理服务器涉及到监听客户端的 HTTP 请求，然后转发这些请求到后端服务器，并最终将响应返回给原始客户端。

以下是一个简单的 Java 反向代理服务器的实现示例，它使用了 Java 的 `ServerSocket` 来监听传入的连接，并使用 `HttpURLConnection` 来与后端服务器通信。

```java
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

public class SimpleReverseProxy {
    public static void main(String[] args) throws IOException {
        int port = 8080; // 反向代理服务器监听的端口号
        String targetHost = "http://backend.example.com"; // 后端服务器的地址
        int targetPort = 80; // 后端服务器监听的端口号

        ServerSocket serverSocket = new ServerSocket(port);
        System.out.println("Reverse proxy listening on port " + port);

        while (true) {
            Socket socket = serverSocket.accept();
            System.out.println("Accepted connection from " + socket.getRemoteSocketAddress());
            new Thread(() -> handleClient(socket, targetHost, targetPort)).start();
        }
    }

    private static void handleClient(Socket socket, String targetHost, int targetPort) {
        try {
            InputStream input = socket.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(input));

            // 读取请求行
            String requestLine = reader.readLine();
            String[] requestParts = requestLine.split(" ");
            String method = requestParts[0];
            String path = requestParts[1];
            String httpVersion = requestParts[2];

            // 构造对后端服务器的请求
            URL url = new URL(targetHost + path);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod(method);
            connection.setDoOutput(true);

            // 复制请求头到后端服务器
            ((HttpRequest) connection).getHeaderFields().forEach((key, value) -> {
                if (!key.equalsIgnoreCase("host")) {
                    connection.setRequestProperty(key, value.isEmpty() ? null : value.get(0));
                }
            });

            // 发送请求到后端服务器
            connection.connect();
            OutputStream output = connection.getOutputStream();
            reader.lines().forEach(line -> output.write((line + "\r\n").getBytes(StandardCharsets.UTF_8)));
            output.write("\r\n".getBytes(StandardCharsets.UTF_8));
            output.flush();

            // 读取后端服务器的响应
            BufferedReader responseReader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String line;
            PrintWriter writer = new PrintWriter(socket.getOutputStream(), true);

            // 发送响应头
            while ((line = responseReader.readLine()) != null) {
                writer.println(line);
            }

            // 发送响应体
            InputStream responseStream = connection.getInputStream();
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = responseStream.read(buffer)) != -1) {
                socket.getOutputStream().write(buffer, 0, bytesRead);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

这个示例中的 `SimpleReverseProxy` 类创建了一个反向代理服务器，它监听指定的端口（默认为8080）。当客户端连接时，服务器接受连接并在一个新线程中调用 `handleClient` 方法来处理客户端请求。

`handleClient` 方法读取客户端的请求行，然后构造一个对后端服务器的请求。它复制了原始请求的请求头到后端服务器的请求中（除了 `Host` 头，因为它需要指向后端服务器）。然后，它将原始请求的请求体转发到后端服务器，并读取后端服务器的响应，最后将响应转发回原始客户端。

请注意，这个示例是非常基础的，它没有实现许多高级功能，如SSL/TLS支持、连接池、负载均衡、缓存、错误处理等。

在生产环境中，你可能需要使用更高级的库或框架，如Netty、Jetty、Spring Framework等，来构建功能更全面、性能更优的反向代理服务器。

# 参考资料

[nginx 一把梭！（超详细讲解+实操）](https://juejin.cn/post/7306041273822527514)

> [一个简单的Nginx入门案例](一个简单的Nginx入门案例)

https://juejin.cn/post/7293176193322729510

* any list
{:toc}