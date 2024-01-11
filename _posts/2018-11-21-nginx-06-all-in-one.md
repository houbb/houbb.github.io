---
layout: post
title:  Nginx-6-nginx 汇总入门介绍
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

# 前言

nginx作为当今火爆的、高性能的http及反向代理服务，不管前端还是后端，都需要全面去了解，学习，实操。

一句话：搞懂nginx如何使用以及工作逻辑对于程序员来说是必不可少的！

我们看看本文的大纲 先了解一下本文都讲了哪些东西，大纲如下：

- nginx介绍

- nginx安装

- nginx目录一览

- nginx.conf文件解读

- location路由匹配规则

- 反向代理

- 负载均衡

- 动静分离

- 跨域

- 缓存

- 黑白名单

- nginx限流

- https配置

- 压缩

- 其他一些常用指令与说明

- 重试策略

- 最后总结

# ubuntu 中如何安装 nginx

[Nginx-02-Nginx Ubuntu 安装](https://houbb.github.io/2018/11/22/nginx-02-install-ubuntu-02)

# 1、nginx 介绍

为了有一个全面的认知，接下来我们先来看看nginx的架构以及一些特点。

## 1.1、nginx 特点

- 处理响应请求快（异步非阻塞I/O，零拷贝，mmap，缓存机制）

- 扩展性好（模块化设计）

- 内存消耗低（异步非阻塞，多阶段处理）

- 具有很高的可靠性（无数次的生产验证，很多头部公司都在用）

- 热部署

- 高并发连接（事件驱动模型，多进程机制）

- 自由的BSD许可协议（可以自己修改代码后发布，包容性极强）

## 1.2、nginx 架构

![nginx 架构](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2db0016998d447f1bf0c657454180238~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=1986&h=1182&s=483033&e=png&b=f4f4f4)

从上边这张图，我们可以一览nginx的架构设计，首先我们可以直观得出nginx的几大特点：

### 1.2.1 事件驱动&异步非阻塞：

本质来说，事件驱动是一种思想（事实上它不仅仅局限于编程） ，事件驱动思想是实现 异步非阻塞特性 的一个重要手段。

对于web服务器来说，造成性能拉胯不支持高并发的常见原因就是由于使用了传统的I/O模型造成在内核没有可读/可写事件（或者说没有数据可供用户进程读写）时，用户线程 一直在等待（其他事情啥也干不了就是干等等待内核上的数据可读/可写），这样的话其实是一个线程（ps:线程在Linux系统也是进程）对应一个请求，请求是无限的，而线程是有限的从而也就形成了并发瓶颈。

而大佬们为了解决此类问题，运用了事件驱动思想来对传统I/O模型做个改造，即在客户端发起请求后，用户线程不再阻塞等待内核数据就绪，而是立即返回（可以去执行其他业务逻辑或者继续处理其他请求）。当内核的I/O操作完成后，内核系统会向用户线程发送一个事件通知，用户线程才来处理这个读/写操作，之后拿到数据再做些其他业务后响应给客户端，从而完成一次客户端请求的处理。

事件驱动的I/O模型中，程序不必阻塞等待I/O操作的完成，也无需为每个请求创建一个线程，从而提高了系统的并发处理能力和响应速度。

事件驱动型的I/O模型通常也被被称为I/O多路复用，即这种模型可以在一个线程中，处理多个连接（复用就是指多个连接复用一个线程，多路也即所谓的 多个连接），通过这种方式避免了线程间切换的开销，同时也使得用户线程不再被阻塞，提高了系统的性能和可靠性。

nginx支持事件驱动是因为他利用了操作系统提供的I/O多路复用接口，如Linux系统中，常用的I/O多路复用接口有select/poll，epoll。

这些接口可以监视多个文件描述符的状态变化，当文件描述符可读或可写时，就会向用户线程发送一个事件通知。用户线程通过事件处理机制（读取/写入数据）来处理这个事件，之后进行对应的业务逻辑完了进行响应。

简单一句话概括： 事件驱动机制就是指当有读/写/连接事件就绪时 再去做读/写/接受连接这些事情，而不是一直在那里傻傻的等，也正应了他的名词： 【事件驱动！】，基于事件驱动思想设计的多路复用I/O（如select/poll，epoll），相对于传统I/O模型，达到了异步非阻塞的效果！

既然提到了select/poll,epoll 那么我们就简单说一下（注意我这里是简单描述，后续有时间会对相关知识点从源码层面做个系统的整理和图解）：

select： 将已连接的 Socket 都放到一个文件描述符集合，然后用户态调用 select 函数将文件描述符集合拷贝到内核里，让内核来检查是否有网络事件产生，检查的方式很粗暴，就是通过遍历文件描述符集合的方式，当检查到有事件产生后，将此 Socket 标记为可读或可写， 接着再把整个文件描述符集合拷贝回用户态里，然后用户态还需要再通过遍历的方法找到可读或可写的 Socket，然后再对其处理。
poll： poll函数的话其实和select大差不差，唯一区别可能就是socket列表的结构有所不同，不再受FD_SETSIZE的限制。这里就不多说了。

epoll： epoll在前边两者的基础上做了很大的优化，select/poll都需要遍历整个socket列表，当检测到传入的socket可读/可写时，则copy socket列表给用户空间，用户态仍然需要遍历（因为内核copy给用户态的是整个socket列表），而epoll则是通过红黑树结构将需要监控的socket插入到进去，然后当有socket可读时会通过回调机制来将其添加到可读列表中，然后内核将可读列表copy给用户态即可(据说此处使用了mmap这里我们不去验证探究，后续写相关文章时在深究吧)，整个过程少了无效的遍历以及不用copy整个socket集合。

### 1.2.2 多进程机制：

另外可以得知nginx有两种类型的进程，一种是Master主进程，一种是Worker工作进程。

主进程主要负责3项工作：加载配置、启动工作进程及非停升级。另外work进程是主进程启动后，fork而来的。

假设 Nginx fork了多个(具体在于你的配置)Worker进程，并且在Master进程中通过 socket 套接字监听（listen）80端口。

然后每个worker进程都可以去 accept 这个监听的 socket。 

当一个连接进来后，所有Worker进程，都会收到消息，但是只有一个Worker进程可以 accept 这个连接，其它的则 accept 失败，Nginx 保证只有一个Worker去accept的方式就是加锁（accept_mutex）。

有了锁之后，在同一时刻，就只会有一个Worker进程去 accpet 连接，在 Worker 进程拿到 Http 请求后，就开始按照worker进程内的预置模块去处理该 Http 请求，最后返回响应结果并断开连接。其实如果熟悉reactor模型你会发现，nginx的设计有reactor的影子，只不过reactor的主reactor是会负责accept的，而nginx的主进程（对应主reactor） 是不会去accept的，而是交给了worker进程来处理。
worker进程除了accept连接之外，还会执行：网络读写、存储读写、内容传输、以及请求分发等等。

而其代码的模块化设计，也使得我们可以根据需要对功能模块 进行适当的选择和修改，编译成符合特定需要/业务的服务器

### 1.2.3 proxy cache（服务端缓存）：

proxy cache 主要实现 nginx 服务器对客户端数据请求的快速响应。

nginx 服务器在接收到被代理服务器的响应数据之后，一方面将数据传递给客户端，另一方面根据proxy cache的配置将这些数据缓存到本地硬盘上。

当客户端再次访问相同的数据时，nginx服务器直接从硬盘检索到相应的数据返回给用户，从而减少与被代理服务器交互的时间。

在缓存数据时，运用了零拷贝以及mmap技术，使得数据copy性能大幅提升。

### 1.2.4 反向代理：

nginx的强大之处其中一个就是他的反向代理，通过反向代理，可以隐藏真正的服务，增加其安全性，同时便于统一管理处理请求，另外可以很容易的做个负载均衡，更好的面对高并发的场景。

## 1.3、nginx模块

nginx服务器由n多个模块组成，每个模块就是一个功能，某个模块只负责自身的功能，所以说对于 “高内聚，低耦合“ 的编程规则，在nginx身上可谓体现的淋漓尽致。

nginx模块示意图如下：

![module](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9abd5af68a4f4581b34e14af6810e3a7~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=1306&h=928&s=154272&e=png&b=f8f6f2)

核心模块 ：是nginx 服务器正常运行必不可少的模块，提供错误日志记录、配置文件解析、事件驱动机制、进程管理等核心功能

标准HTTP模块 ：提供 HTTP 协议解析相关的功能，如：端口配置、网页编码设置、HTTP 响应头设置等

可选HTTP模块 ：主要用于扩展标准的 HTTP 功能，让nginx能处理一些特殊的服务，如：Flash 多媒体传输、解析 GeoIP 请求、SSL 支持等

邮件服务模块 ：主要用于支持 nginx  的邮件服务，包括对 POP3 协议、IMAP 协议和 SMTP 协议的支持

第三方模块 ：是为了扩展 Nginx 服务器应用，完成开发者自定义功能，如：Json 支持、Lua 支持等

## 1.4、nginx 常见应用场景

nginx常用场景挺多的，比如：

反向代理
负载均衡
缓存
限流
黑/白名单
静态资源服务
动静分离
防盗链
跨域
高可用
.......

其中我认为 最最 基础的也是应用最多的就是 反向代理，这里我们画个图简单看下什么是反向代理

（ps：其他的那些使用场景，我们先不做展开，放到下边一个个哔哔。）

所谓反向代理，其实很好理解就是代理的服务端（与之对应的正向代理一般代理的是客户端），nginx反向代理如下示意：

![reverse proxy](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12feb26340c74998bd7917f1a21d83fa~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=1906&h=1212&s=132766&e=png&b=fdfdfd)


# nginx目录一览

我们使用 tree /usr/local/nginx/ -L 2 命令查看一下nginx的目录，对其结构有个初步的认识：

```
[root@localhost /]# tree  /usr/local/nginx/  -L 2
/usr/local/nginx/
├── conf                        #存放一系列配置文件的目录
│   ├── fastcgi.conf           #fastcgi程序相关配置文件
│   ├── fastcgi.conf.default   #fastcgi程序相关配置文件备份
│   ├── fastcgi_params         #fastcgi程序参数文件
│   ├── fastcgi_params.default #fastcgi程序参数文件备份
│   ├── koi-utf           #编码映射文件
│   ├── koi-win           #编码映射文件
│   ├── mime.types        #媒体类型控制文件
│   ├── mime.types.default#媒体类型控制文件备份
│   ├── nginx.conf        #主配置文件
│   ├── nginx.conf.default#主配置文件备份
│   ├── scgi_params      #scgi程序相关配置文件
│   ├── scgi_params.default #scgi程序相关配置文件备份
│   ├── uwsgi_params       #uwsgi程序相关配置文件
│   ├── uwsgi_params.default#uwsgi程序相关配置文件备份
│   └── win-utf          #编码映射文件
├── html                 #存放网页文档
│   ├── 50x.html         #错误页码显示网页文件
│   └── index.html       #网页的首页文件
├── logs                 #存放nginx的日志文件
├── nginx-1.23.0.tar.gz # 我把压缩包下载到url/local/nginx/目录了，不用管这个
├── sbin                #存放启动程序
│   ├── nginx           #nginx启动程序
│   └── nginx.old       
```

从输出可以看到nginx分的很清晰，有配置目录，html目录，log目录，启动程序目录。

关于目录的一点小说明： 

上边的仅仅是nginx的主目录，事实上，生效的主配置文件一定是 /usr/local/nginx/conf.conf ？

这不一定，而是取决于你启动nginx时候有没有指定nginx.conf，实际使用中我发现我机器上有好几个地方都存在nginx.conf文件，使用 locate nginx.conf 看一下 如下图所示：

```
$   locate nginx.conf
```

# 4、nginx.conf文件 解读

首先我们要知道nginx.conf文件是由一个一个的指令块组成的，nginx用{}标识一个指令块，指令块中再设置具体的指令(注意 指令必须以 ; 号结尾)，指令块有全局块，events块，http块，server块和location块 以及 upstream块。

精简后的结构如下：

```
全局模块
event模块
http模块
    upstream模块
    
    server模块
        location块
        location块
        ....
    server模块
        location块
        location块
        ...
    ....    
```

各模块的功能作用如下描述：

全局模块： 配置影响nginx全局的指令，比如运行nginx的用户名，nginx进程pid存放路径，日志存放路径，配置文件引入，worker进程数等。

events块： 配置影响nginx服务器或与用户的网络连接。比如每个进程的最大连接数，选取哪种事件驱动模型（select/poll epoll或者是其他等等nginx支持的）来处理连接请求，是否允许同时接受多个网路连接，开启多个网络连接序列化等。

http块： 可以嵌套多个server，配置代理，缓存，日志格式定义等绝大多数功能和第三方模块的配置。如文件引入，mime-type定义，日志自定义，是否使用sendfile传输文件，连接超时时间，单连接请求数等。

server块： 配置虚拟主机的相关参数比如域名端口等等，一个http中可以有多个server。

location块： 配置url路由规则

upstream块： 配置上游服务器的地址以及负载均衡策略和重试策略等等

下面看下nginx.conf长啥样并对一些指令做个解释：

```conf
# 注意：有些指令是可以在不同指令块使用的（需要时可以去官网看看对应指令的作用域）。我这里只是演示
# 这里我以/usr/local/nginx/conf/nginx.conf文件为例

[root@localhost /usr/local/nginx]# cat /usr/local/nginx/conf/nginx.conf

#user  nobody; # 指定Nginx Worker进程运行用户以及用户组，默认由nobody账号运行
worker_processes  1;  # 指定工作进程的个数，默认是1个。具体可以根据服务器cpu数量进行设置， 比如cpu有4个，可以设置为4。如果不知道cpu的数量，可以设置为auto。 nginx会自动判断服务器的cpu个数，并设置相应的进程数
#error_log  logs/error.log;  # 用来定义全局错误日志文件输出路径，这个设置也可以放入http块，server块，日志输出级别有debug、info、notice、warn、error、crit可供选择，其中，debug输出日志最为最详细，而crit输出日志最少。
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info; # 指定error日志位置和日志级别
#pid        logs/nginx.pid;  # 用来指定进程pid的存储文件位置

events {
    accept_mutex on;   # 设置网路连接序列化，防止惊群现象发生，默认为on
    
    # Nginx支持的工作模式有select、poll、kqueue、epoll、rtsig和/dev/poll，其中select和poll都是标准的工作模式，kqueue和epoll是高效的工作模式，不同的是epoll用在Linux平台上，而kqueue用在BSD系统中，对于Linux系统，epoll工作模式是首选
    use epoll;
    
    # 用于定义Nginx每个工作进程的最大连接数，默认是1024。最大客户端连接数由worker_processes和worker_connections决定，即Max_client=worker_processes*worker_connections在作为反向代理时，max_clients变为：max_clients = worker_processes *worker_connections/4。进程的最大连接数受Linux系统进程的最大打开文件数限制，在执行操作系统命令“ulimit -n 65536”后worker_connections的设置才能生效
    worker_connections  1024; 
}

# 对HTTP服务器相关属性的配置如下
http {
    include       mime.types; # 引入文件类型映射文件 
    default_type  application/octet-stream; # 如果没有找到指定的文件类型映射 使用默认配置 
    # 设置日志打印格式
    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';
    # 
    #access_log  logs/access.log  main; # 设置日志输出路径以及 日志级别
    sendfile        on; # 开启零拷贝 省去了内核到用户态的两次copy故在文件传输时性能会有很大提升
    #tcp_nopush     on; # 数据包会累计到一定大小之后才会发送，减小了额外开销，提高网络效率
    keepalive_timeout  65; # 设置nginx服务器与客户端会话的超时时间。超过这个时间之后服务器会关闭该连接，客户端再次发起请求，则需要再次进行三次握手。
    #gzip  on; # 开启压缩功能，减少文件传输大小，节省带宽。
    sendfile_max_chunk 100k; #每个进程每次调用传输数量不能大于设定的值，默认为0，即不设上限。
    
    # 配置你的上游服务（即被nginx代理的后端服务）的ip和端口/域名
    upstream backend_server { 
        server 172.30.128.65:8080;
        server 172.30.128.65:8081 backup; #备机
    }

    server {
        listen       80; #nginx服务器监听的端口
        server_name  localhost; #监听的地址 nginx服务器域名/ip 多个使用英文逗号分割
        #access_log  logs/host.access.log  main; # 设置日志输出路径以及 级别，会覆盖http指令块的access_log配置
        
        # location用于定义请求匹配规则。 以下是实际使用中常见的3中配置（即分为：首页，静态，动态三种）
       
        # 第一种：直接匹配网站根目录，通过域名访问网站首页比较频繁，使用这个会加速处理，一般这个规则配成网站首页，假设此时我们的网站首页文件就是： usr/local/nginx/html/index.html
        location = / {  
            root   html; # 静态资源文件的根目录 比如我的是 /usr/local/nginx/html/
            index  index.html index.htm; # 静态资源文件名称 比如：网站首页html文件
        }
        # 第二种：静态资源匹配（静态文件修改少访问频繁，可以直接放到nginx或者统一放到文件服务器，减少后端服务的压力），假设把静态文件我们这里放到了 usr/local/nginx/webroot/static/目录下
        location ^~ /static/ {
            alias /webroot/static/; 访问 ip:80/static/xxx.jpg后，将会去获取/url/local/nginx/webroot/static/xxx.jpg 文件并响应
        }
        # 第二种的另外一种方式：拦截所有 后缀名是gif,jpg,jpeg,png,css.js,ico这些 类静态的的请求，让他们都去直接访问静态文件目录即可
        location ~* \.(gif|jpg|jpeg|png|css|js|ico)$ {
            root /webroot/static/;
        }
        # 第三种：用来拦截非首页、非静态资源的动态数据请求，并转发到后端应用服务器 
        location / {
            proxy_pass http://backend_server; #请求转向 upstream是backend_server 指令块所定义的服务器列表
            deny 192.168.3.29; #拒绝的ip （黑名单）
            allow 192.168.5.10; #允许的ip（白名单）
        }
        
        # 定义错误返回的页面，凡是状态码是 500 502 503 504 总之50开头的都会返回这个 根目录下html文件夹下的50x.html文件内容
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
        
    }
    # 其余的server配置 ,如果有需要的话
    #server {
        ......
    #    location / {
               ....
    #    }
    #}
    
    # include /etc/nginx/conf.d/*.conf;  # 一般我们实际使用中有很多配置，通常的做法并不是将其直接写到nginx.conf文件，
    # 而是写到新文件 然后使用include指令 将其引入到nginx.conf即可，这样使得主配置nginx.conf文件更加清晰。
    
}
```

以上就是nginx.conf文件的配置了，主要讲了一些指令的含义，当然实际的指令有很多，我在配置文件并没有全部写出来，准备放到后边章节详细阐述这些东西，比如：location匹配规则，反向代理，动静分离，负载均衡策略，重试策略，压缩，https,限流，缓存，跨域这些 我们都没细说，这些东西比较多比较细不可能把使用规则和细节都写到上边的配置文件中，所以我们下边一一解释说明关于这些东西的配置和使用方式。

（另外值的注意的是： 因为有些指令是可以在不同作用域使用的，如果在多个作用域都有相同指令的使用，那么nginx将会遵循就近原则或者我愿称之为 内层配置优先。 

eg: 你在 http配了日志级别，也在某个server中配了日志级别，那么这个server将使用他自己配置的已不使用外层的http日志配置）

# 5、location 路由匹配规则

什么是location? : nginx根据用户请求的URI来匹配对应的location模块，匹配到哪个location，请求将被哪个location块中的配置项所处理。
location配置语法：

```
location [修饰符] pattern {…}
```

常见匹配规则如下：

## 5.1、前缀匹配（无修饰符）

| 修饰符 | 作用 |
|:----|:----|
| 空	    | 无修饰符的前缀匹配，匹配前缀是 你配置的（比如说你配的是 /aaa） 的url |
| =	    | 精确匹配 |
| ~	    | 正则表达式模式匹配，区分大小写 |
| ~*	    | 正则表达式模式匹配，不区分大小写 |
| ^~	    | ^~类型的前缀匹配，类似于无修饰符前缀匹配，不同的是，如果匹配到了，那么就停止后续匹配 |
| /	    | 通用匹配，任何请求都会匹配到（只要你域名对，所有请求通吃！） |

# 6. 反向代理

本地的 http://localhost:18801 登录测试页面。

ubuntu ngnix，如何通过修改 ngnix.conf，让本地服务 http://localhost:18801/，反向代理为域名 http://mytestproxy

## 6.1 确认 nginx 对应的配置

```
$ nginx -T
nginx: [alert] could not open error log file: open() "/var/log/nginx/error.log" failed (13: Permission denied)
2024/01/11 16:48:59 [warn] 119161#119161: the "user" directive makes sense only if the master process runs with super-user privileges, ignored in /etc/nginx/nginx.conf:1
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
2024/01/11 16:48:59 [emerg] 119161#119161: open() "/run/nginx.pid" failed (13: Permission denied)
nginx: configuration file /etc/nginx/nginx.conf test failed
```

对应的配置文件在 `/etc/nginx/nginx.conf`，如果用 sudo 会把文件内容输出出来。

## 6.2 修改方式

```
dh@d:/etc/nginx$ cd /etc/nginx/

dh@d:/etc/nginx$ ll
total 72
drwxr-xr-x  8 root root 4096 Jan 11 16:41 ./
drwxr-xr-x 86 root root 4096 Jan 11 16:03 ../
drwxr-xr-x  2 root root 4096 May 31  2023 conf.d/
-rw-r--r--  1 root root 1125 May 31  2023 fastcgi.conf
-rw-r--r--  1 root root 1055 May 31  2023 fastcgi_params
-rw-r--r--  1 root root 2837 May 31  2023 koi-utf
-rw-r--r--  1 root root 2223 May 31  2023 koi-win
-rw-r--r--  1 root root 3957 May 31  2023 mime.types
drwxr-xr-x  2 root root 4096 May 31  2023 modules-available/
drwxr-xr-x  2 root root 4096 Jan 11 15:34 modules-enabled/
-rw-r--r--  1 root root 1447 Jan 11 16:41 nginx.conf
-rw-r--r--  1 root root  180 May 31  2023 proxy_params
-rw-r--r--  1 root root  636 May 31  2023 scgi_params
drwxr-xr-x  2 root root 4096 Jan 11 15:34 sites-available/
drwxr-xr-x  2 root root 4096 Jan 11 15:34 sites-enabled/
drwxr-xr-x  2 root root 4096 Jan 11 15:34 snippets/
-rw-r--r--  1 root root  664 May 31  2023 uwsgi_params
-rw-r--r--  1 root root 3071 May 31  2023 win-utf
```

我们修改 nginx.conf

```
sudo vi nginx.conf
```

添加内容：

http 

```conf
http {
    # ... 其他配置

    server {
        listen 80;
        server_name mytestproxy;

        location / {
            proxy_pass http://localhost:18801;
        }

        # 可选的 SSL 配置，如果你有 SSL 证书
        # listen 443 ssl;
        # ssl_certificate /path/to/your/certificate.crt;
        # ssl_certificate_key /path/to/your/private.key;
        # include /etc/nginx/snippets/ssl-params.conf;
    }

    # ... 其他配置
}
```

检测配置

```
$ sudo nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

重启服务

```
sudo systemctl reload nginx
sudo service nginx reload
```

## 访问 http://mytestproxy

但是其实这样是不行的，因为这样会通过 DNS 解析到对应的域名，而不是我们本地。

### 修改 hosts 文件

Windows: C:\Windows\System32\drivers\etc\hosts
Linux/Mac: /etc/hosts

在文件末尾添加一行：

```
127.0.0.1   mytestproxy
```

windows 为例，修改完成后，通过下面的命令立刻生效。

```
ipconfig /flushdns
```

测试

```
>ping mytestproxy

正在 Ping mytestproxy [127.0.0.1] 具有 32 字节的数据:
来自 127.0.0.1 的回复: 字节=32 时间<1ms TTL=128
来自 127.0.0.1 的回复: 字节=32 时间<1ms TTL=128
```

### 重新访问

然后浏览器访问 [http://mytestproxy](http://mytestproxy)，这样首先是访问 127.0.0.1

然后被 nginx 转发到：http://localhost:18801

PS: 感觉这里怪怪的，并没有达到 nginx 的灵魂？

# 我们看代理的方式

## Q1: 要让 nginx 代理 我们的 服务 很简单，简单描述一下就是 两步：

1. 通过upstream指令块来定义我们的上游服务（即被代理的服务）

2. 通过location指令块中的 proxy_pass指令，指定该location要路由到哪个upstream。给一个具体的配置例子

### A: 回答

当使用 Nginx 作为代理时，确实可以通过两个关键步骤来实现。

以下是一个简单的配置例子：

1. **定义上游服务（Upstream）**:

   使用 `upstream` 指令块来定义你的上游服务，即被 Nginx 代理的服务。这里使用服务器的 IP 地址和端口号。

   ```nginx
   upstream backend_servers {
       server 192.168.1.10:8080;
       server 192.168.1.11:8080;
       # 添加更多服务器...
   }
   ```

   这里我们定义了一个名为 `backend_servers` 的上游服务，包含两个服务器的地址和端口。

2. **配置代理路由（Location）**:

   在 `server` 配置块中使用 `location` 指令块来指定代理路由，并使用 `proxy_pass` 指令将请求路由到上游服务。

   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://backend_servers;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           # 添加其他代理配置...
       }

       # 可以添加更多 location 块...
   }
   ```

   在这个例子中，所有对 `/` 路径的请求将被代理到 `backend_servers` 上定义的上游服务。`proxy_set_header` 用于设置一些 HTTP 头，你可以根据需要添加其他代理配置。

确保将上述配置文件保存并重新加载 Nginx 以使更改生效。这只是一个基本的例子，具体的配置取决于你的实际需求和环境。

## Q2: proxy_pass http://backend_servers; 必须要这么写吗？把具体的 ip:port 列表写在后面可以吗？

是的，`proxy_pass` 指令后面通常需要指定上游服务的地址。

在上游服务是一组具体的 IP 地址和端口时，你可以直接将这些地址和端口列表写在 `proxy_pass` 后面，而无需使用 `upstream` 指令块。

以下是一个直接在 `proxy_pass` 中指定地址和端口的示例：

```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://192.168.1.10:8080 http://192.168.1.11:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # 添加其他代理配置...
    }

    # 可以添加更多 location 块...
}
```

在这个例子中，`proxy_pass` 直接包含了两个上游服务器的地址和端口。

这种方法适用于简单的情况，但当你有多个地方需要使用相同的上游服务时，使用 `upstream` 块可以更好地组织配置。

# 7. 负载均衡

说到负载均衡很多人应该并不陌生，总而言之负载均衡就是：避免高并发高流量时请求都聚集到某一个服务或者某几个服务上，而是让其均匀分配（或者能者多劳），从而减少高并发带来的系统压力，从而让服务更稳定。

对于nginx来说，负载均衡就是从 upstream 模块定义的后端服务器列表中按照配置的负载策略选取一台服务器接受用户的请求。

# 8、动静分离

在说动静分离前，我们要知道为何要做动静分离以及他能解决啥问题，首先，我们常见的web系统中会有大量的静态资源文件比如掘金主页面刷新后的f12如下：

可以看到有很多静态资源，如果将这些资源都搞到后端服务的话，将会提高后端服务的压力且占用带宽增加了系统负载（要知道，静态资源的访问频率其实蛮高的）所以为了避免该类问题我们可以把不常修改的静态资源文件放到nginx的静态资源目录中去，这样在访问静态资源时直接读取nginx服务器本地文件目录之后返回，这样就大大减少了后端服务的压力同时也加快了静态资源的访问速度，何为静，何为动呢？：

静： 将不常修改且访问频繁的静态文件，放到nginx本地静态目录（当然也可以搞个静态资源服务器专门存放所有静态文件）
动： 将变动频繁/实时性较高的比如后端接口，实时转发到对应的后台服务

接下来我们将构造一个html页面，然后点击按钮后发送get请求到后端接口。流程如下：

![动静分离](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8418a768c2784f908ef61074ffc7b8a4~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp#?w=1146&h=708&s=95694&e=png&b=ffffff)

# 9. nginx解决跨域

首先想解决跨越就得避免不同源，而我们可不可以 把对后端的代理 放在前端的server中呢（也就是说让前后端统一使用一个端口，一个server_name）？答案是可以的，因为server支持多个location配置呀（一个location处理前端，一个location转发后端），我们改下配置文件试一把如下：

10. 缓存

在开头我们就介绍过，nginx代理缓存可以在某些场景下有效的减少服务器压力，让请求快速响应，从而提升用户体验和服务性能，那么nginx缓存如何使用呢？

在使用及演示前我们先来熟悉下相关的配置以及其含义，知道了这些才能更好的使用nginx缓存。


# 11. 黑白名单

nginx黑白名单比较简单，allow后配置你的白名单，deny后配置你的黑名单，在实际使用中，我们一般都是建个黑名单和白名单的文件然后再nginx.copnf中incluld一下，这样保持主配置文件整洁，也好管理。

下边我为了方便就直接在主配置写了。

# 12. nginx限流

Nginx主要有两种限流方式：按并发连接数限流(ngx_http_limit_conn_module)、按请求速率限流(ngx_http_limit_req_module 使用的令牌桶算法)。

# 13、https配置

说到https大家应该并不陌生，我这里不啰嗦介绍了。

一般我们安装的nginx模块都是不包含ssl模块的，所以需要手动安装下。安装完之后我们再说如何配置https。

# 14、压缩

压缩功能比较实用尤其是处理一些大文件时，而gzip 是规定的三种标准 HTTP 压缩格式之一。

目前绝大多数的网站都在使用 gzip 传输 HTML 、CSS 、 JavaScript 等资源文件。需要知道的是，并不是每个浏览器都支持 gzip 压缩，如何知道客户端（浏览器）是否支持 压缩 呢？ 

可以通过观察 某请求头中的 Accept-Encoding 来观察是否支持压缩，另外只有客户端支持也不顶事，服务端得返回gzip格式的文件呀，那么这件事nginx可以帮我们做，我们可以通过 Nginx 的配置来让服务端支持 gzip。

服务端返回压缩文件后浏览器进行解压缩从而展示正常内容。

# 参考资料

[nginx 一把梭！（超详细讲解+实操）](https://juejin.cn/post/7306041273822527514)

> [一个简单的Nginx入门案例](一个简单的Nginx入门案例)

https://juejin.cn/post/7293176193322729510

* any list
{:toc}