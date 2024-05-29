---
layout: post
title:  Nginx R31 doc-18-High Availability Support for NGINX Plus in On-Premises Deployments 
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, windows, sh]
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

# 在本地部署中为NGINX Plus启用高可用性支持

在本地部署中启用NGINX Plus实例的高可用性，配置基于keepalived和VRRP的主备对解决方案。

本文介绍了如何使用基于keepalived的解决方案配置NGINX Plus实例的高可用性。


## 基于keepalived的高可用性支持

NGINX Plus R6及更高版本支持基于keepalived的高可用性（HA）设置，可快速且轻松地配置成主备对。

keepalived开源项目包括三个组件：

- 用于Linux服务器的keepalived守护进程。

- 用于管理虚拟路由器（虚拟IP地址或VIP）的虚拟路由器冗余协议（VRRP）的实现。

- 用于确定服务（例如Web服务器、PHP后端或数据库服务器）是否处于运行状态的健康检查机制。

VRRP确保始终存在主节点。备用节点会监听来自主节点的VRRP广告包。如果备用节点在三倍于配置的广告间隔的时间内未收到广告包，则备用节点将接管主节点的角色，并将配置的VIP分配给自己。

如果主节点上的服务未通过配置的健康检查的次数检查到故障，keepalived将将虚拟IP地址从主节点重新分配给备用（被动）节点。


## 配置高可用性

在两个节点上以root用户身份运行nginx-ha-setup脚本（该脚本在nginx-ha-keepalived软件包中分发，必须额外安装除基本NGINX Plus软件包外）。该脚本将配置一个高可用性的NGINX Plus环境，其中一个节点作为主节点，另一个节点作为备用节点。它会提示输入以下数据：

- 本地和远程节点的IP地址（其中一个将被配置为主节点，另一个将被配置为备用节点）
- 用作集群终端点（浮动VIP）的一个额外的可用IP地址
keepalived守护程序的配置记录在/etc/keepalived/keepalived.conf文件中。该文件中的配置块控制通知设置、要管理的VIP和用于测试依赖于VIP的服务的健康检查。以下是在CentOS 7机器上由nginx-ha-setup脚本创建的配置文件。请注意，这不是一个NGINX Plus配置文件，因此语法不同（例如，不使用分号来分隔指令）。

```bash
global_defs {
    vrrp_version 3
}

vrrp_script chk_manual_failover {
    script   "/usr/libexec/keepalived/nginx-ha-manual-failover"
    interval 10
    weight   50
}

vrrp_script chk_nginx_service {
    script   "/usr/libexec/keepalived/nginx-ha-check"
    interval 3
    weight   50
}

vrrp_instance VI_1 {
    interface                  eth0
    priority                   101
    virtual_router_id          51
    advert_int                 1
    accept
    garp_master_refresh        5
    garp_master_refresh_repeat 1
    unicast_src_ip             192.168.100.100

    unicast_peer {
        192.168.100.101
    }

    virtual_ipaddress {
        192.168.100.150
    }

    track_script {
        chk_nginx_service
        chk_manual_failover
    }

    notify "/usr/libexec/keepalived/nginx-ha-notify"
}
```

要描述整个配置超出了本文的范围，但值得注意的一些项目包括：

- HA设置中的每个节点都需要其自己的配置文件副本，具有适合节点角色（主要或备用）的优先级、unicast_src_ip和unicast_peer指令的值。
- 优先级指令控制哪个主机成为主节点，下一节将进行解释。
- 通知指令命名了分发中包含的通知脚本，该脚本可用于在发生状态转换或故

障时生成syslog消息（或其他通知）。
- vrrp_instance VI_1块中的virtual_router_id指令的值是一个示例值；根据需要更改它以在您的环境中保持唯一。
- 如果您在本地网络中运行多个keepalived实例（或其他VRRP实例），请为每个实例创建一个vrrp_instance块，并使用唯一名称（例如示例中的VI_1）和virtual_router_id编号。


## 使用健康检查脚本控制哪台服务器是主服务器

keepalived中没有fencing机制。如果对在一对中的两个节点都不了解，则每个节点都会假定自己是主节点并将VIP分配给自己。为了防止这种情况发生，配置文件定义了一种称为chk_nginx_service的脚本执行机制，该机制定期运行脚本以检查NGINX Plus是否正常运行，并根据脚本的返回代码调整本地节点的优先级。代码0（零）表示正确操作，代码1（或任何非零代码）表示错误。

在脚本样本配置中，将weight指令设置为50，这意味着当检查脚本成功运行（并且暗示返回代码为0）时：

- 第一个节点的优先级（其基本优先级为101）设置为151。
- 第二个节点的优先级（其基本优先级为100）设置为150。
第一个节点具有更高的优先级（在此示例中为151）并成为主节点。

interval指令指定了检查脚本执行的频率，单位为秒（在示例配置文件中为3秒）。请注意，如果达到超时（默认情况下，超时与检查间隔相同），则检查失败。

rise和fall指令（在示例配置文件中未使用）指定了脚本必须成功或失败多少次才能采取行动。

nginx-ha-keepalived软件包中提供的nginx-ha-check脚本检查NGINX Plus是否正常运行。我们建议根据您的本地设置创建适当的附加脚本。


## 显示节点状态

要查看给定VIP的当前主节点是哪个节点，请对在其中定义VRRP实例的接口运行ip addr show命令（在以下命令中，在centos7-1和centos7-2节点上的eth0接口）：

```bash
centos7-1 $ ip addr show eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state
     UP qlen 1000
    link/ether 52:54:00:33:a5:a5 brd ff:ff:ff:ff:ff:ff
    inet 192.168.100.100/24 brd 192.168.122.255 scope global dynamic eth0
       valid_lft 3071sec preferred_lft 3071sec
    inet 192.168.100.150/32 scope global eth0
       valid_lft forever preferred_lft forever
centos7-2 $ ip addr show eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state
     UP qlen 1000
    link/ether 52:54:00:33:a5:87 brd ff:ff:ff:ff:ff:ff
    inet 192.168.100.101/24 brd 192.168.122.255 scope global eth0
       valid_lft forever preferred_lft forever
```

在此输出中，centos7-1的第二个inet行表示它是主节点 - 定义的VIP（192.168.100.150）已分配给它。其他inet行显示了主节点的真实IP地址（192.168.100.100）和备用节点的IP地址（192.168.100.101）。

节点的当前状态记录在本地/var/run/nginx-ha-keepalived.state文件中。您可以使用cat命令显示它：

```bash
centos7-1 $ cat /var/run/nginx-ha-keepalived.state
STATE=MASTER
centos7-2 $ cat /var/run/nginx-ha-keepalived.state
STATE=BACKUP
```

在nginx-ha-keepalived软件包的1.1及更高版本中，可以使用以下命令将VRRP扩展统计信息和数据转储到文件系统：

```bash
centos7-1 $ service keepalived dump
```

此命令向运行的keepalived进程发送信号，以将当前状态写入/tmp/keepalived.stats和/tmp/keepalived.data。

# 强制状态更改

要强制主节点成为备用节点，请在主节点上运行以下命令：

```bash
service keepalived stop
```

随着其关闭，keepalived会向备用节点发送优先级为0的VRRP数据包，这会导致备用节点接管VIP。

如果您的集群使用nginx-ha-keepalived软件包的版本1.1，则可以使用以下更简单的方法来强制状态更改：

```bash
touch /var/run/keepalived-manual-failover
```

此命令将创建一个文件，该文件由vrrp_script chk_manual_failover块中定义的脚本检查。如果文件存在，则keepalived会降低主节点的优先级，从而导致备用节点接管VIP。


# 添加更多虚拟IP地址

由nginx-ha-setup脚本创建的配置非常基本，并且使单个IP地址具有高可用性。

要使多个IP地址具有高可用性：

将每个新的IP地址添加到两个节点上的/etc/keepalived/keepalived.conf文件中的virtual_ipaddress块中：

```bash
virtual_ipaddress {
    192.168.100.150
    192.168.100.200
}
```

virtual_ipaddress块中的语法复制了ip实用程序的语法。

在两个节点上运行service keepalived reload命令以重新加载keepalived服务：

```bash
centos7-1 $ service keepalived reload
centos7-2 $ service keepalived reload
```


# IPv4和IPv6的双栈配置

在keepalived版本1.2.20及更高版本（以及nginx-ha-keepalived软件包的版本1.1及更高版本）中，keepalived不再支持在一个VRRP实例（virtual_ipaddress块）中混合使用IPv4和IPv6地址，因为这违反了VRRP标准。

有两种配置双栈HA与VRRP：

- 将virtual_ipaddress_excluded块添加到一个族的地址中。

```bash
vrrp_instance VI_1 {
    ...
    virtual_ipaddress_excluded {
        1234:5678:9abc:def::1
    }
    ...
}
```

这些地址从VRRP广告中排除，但仍由keepalived管理，并在状态更改时添加或删除。

- 为IPv6地址添加另一个VRRP实例。

主节点上的IPv6地址的VRRP配置为：

```bash
vrrp_instance VI_2 {
    ...
    virtual_ipaddress {
        1234:5678:9abc:def::1
    }
    ...
}
```

请注意，VRRP实例可以同时使用相同的virtual_router_id，因为VRRP IPv4和IPv6实例完全独立于彼此。


# 故障排除keepalived和VRRP

keepalived守护程序使用syslog工具进行记录。在基于CentOS、RHEL和SLES的系统中，输出通常写入到/var/log/messages中，而在基于Ubuntu和Debian的系统中，它写入到/var/log/syslog中。日志条目记录了事件，如keepalived守护程序的启动和状态转换。

以下是一些示例条目，显示了keepalived守护程序的启动和节点将VRRP实例转换为主状态（为了便于阅读，每行中的centos7-1主机名已在第一次出现后被删除）：

```bash
Feb 27 14:42:04 centos7-1 systemd: Starting LVS and VRRP High Availability Monitor...
Feb 27 14:42:04 Keepalived [19242]: Starting Keepalived v1.2.15 (02/26,2015)
Feb 27 14:42:04 Keepalived [19243]: Starting VRRP child process, pid=19244
Feb 27 14:42:04 Keepalived_vrrp [19244]: Registering Kernel netlink reflector
Feb 27 14:42:04 Keepalived_vrrp [19244]: Registering Kernel netlink command channel
Feb 27 14:42:04 Keepalived_vrrp [19244]: Registering gratuitous ARP shared channel
Feb 27 14:42:05 systemd: Started LVS and VRRP High Availability Monitor.
Feb 27 14:42:05 Keepalived_vrrp [19244]: Opening file '/etc/keepalived/keepalived.conf '.
Feb 27 14:42:05 Keepalived_vrrp [19244]: Truncating auth_pass to 8 characters
Feb 27 14:42:05 Keepalived_vrrp [19244]: Configuration is using: 64631 Bytes
Feb 27 14:42:05 Keepalived_vrrp [19244

]: Using LinkWatch kernel netlink reflector...
Feb 27 14:42:05 Keepalived_vrrp [19244]: VRRP_Instance(VI_1) Entering BACKUP STATE
Feb 27 14:42:05 Keepalived_vrrp [19244]: VRRP_Instance(VI_1) forcing a new MASTER election
Feb 27 14:42:06 Keepalived_vrrp [19244]: VRRP_Instance(VI_1) Transition to MASTER STATE
Feb 27 14:42:08 Keepalived_vrrp [19244]: VRRP_Instance(VI_1) Entering MASTER STATE
Feb 27 14:42:08 Keepalived_vrrp [19244]: VRRP_Instance(VI_1) setting protocol VIPs.
Feb 27 14:42:08 Keepalived_vrrp [19244]: VRRP_Instance(VI_1) Sending gratuitous ARPs on eth0 for 192.168.100.150
```

如果系统日志未说明问题的来源，则可以使用tcpdump命令运行以下参数来显示本地网络上发送的VRRP广告：

```bash
tcpdump -vvv -ni eth0 proto vrrp
```

如果您在本地网络上有多个VRRP实例，并且想要过滤输出以仅包含对特定服务的节点和其对等方之间的流量，请包含host参数，并在keepalived.conf文件中的unicast_peer块中定义对等方的IP地址，如以下示例所示：

```bash
centos7-1 $ tcpdump -vvv -ni eth0 proto vrrp and host 192.168.100.101
```

以上是一些有用的调试信息。



# chat

## 详细介绍 Keepalived

Keepalived 是一个基于 Linux 的高性能服务器，用于实现高可用性（HA）和负载均衡（LB）。

它通过 VRRP（Virtual Router Redundancy Protocol）协议来实现高可用性，同时可以结合 IPVS（IP Virtual Server）模块实现负载均衡功能。

### Keepalived 的主要功能：

1. **VRRP 协议**：Keepalived 使用 VRRP 协议来实现网络服务的高可用性。VRRP 允许多台服务器形成一个虚拟路由器组，其中一台服务器作为“主”服务器，其他服务器作为“备”服务器。当主服务器出现故障时，备服务器会接管其 IP 地址和网络服务，从而实现无缝切换，保证网络服务的连续性。

2. **健康检查**：Keepalived 可以对后端服务进行健康检查，确保流量只分发到健康的服务器上。如果检测到服务失败，Keepalived 可以将流量切换到健康的服务器上。

3. **负载均衡**：Keepalived 可以与 IPVS 模块配合使用，实现负载均衡功能。IPVS 是内核空间的负载均衡器，可以基于各种算法（如轮询、最少连接等）将流量分发到不同的后端服务器上。

### Keepalived 的工作原理：

1. **故障转移**：Keepalived 通过 VRRP 协议在主服务器和备服务器之间实现故障转移。主服务器会定期发送 VRRP 广告消息给备服务器，当备服务器在一定时间内没有收到广告消息时，它会认为主服务器宕机了，并开始接管其 IP 地址和网络服务。

2. **健康检查**：Keepalived 可以配置健康检查脚本来检查服务器的状态。如果检测到服务不健康，Keepalived 会调整权重或触发故障转移。

3. **负载均衡**：在使用 IPVS 模块时，Keepalived 可以根据预定义的规则将流量分发到不同的服务器上，实现负载均衡。

### Keepalived 的体系结构：

Keepalived 的体系结构包括用户空间层和内核空间层。用户空间层包括 I/O 复用分发调度器、内存管理机制、控制面板、核心组件等。核心组件包括 Watchdog、Checkers、VRRP Stack、IPVS Wrapper 和 Netlink Reflector 等模块。

### Keepalived 的应用场景：

1. **高可用性**：用于确保关键网络服务（如 DNS、Web 服务器等）的高可用性。

2. **负载均衡**：用于分布式系统中，将流量均匀地分发到多台服务器上，提高系统处理能力和扩展性。

3. **故障恢复**：在服务器故障时自动恢复服务，减少系统停机时间。

Keepalived 是构建高可用网络服务的重要工具，它通过 VRRP 和 IPVS 提供了强大的健康检查和负载均衡功能，适用于需要高可用性和负载均衡的多种场景。

## 为什么 nginx 要用 Keepalived 实现 ha，依赖了其中的哪些能力？为什么不自己实现

Nginx 使用 Keepalived 实现高可用性（HA）主要是因为 Keepalived 提供了一些 Nginx 原生不支持或不够完善的能力，这些能力对于确保服务的连续性和可靠性至关重要。
以下是 Keepalived 提供的几个关键能力：

1. **VRRP（虚拟路由器冗余协议）**：Keepalived 使用 VRRP 来实现网络层面的高可用性。通过 VRRP，可以配置一个虚拟 IP 地址（VIP），当主服务器宕机时，备份服务器会自动接管这个 VIP，从而保证服务不中断。

2. **自动故障转移**：Keepalived 能够监测 Nginx 的运行状态，一旦检测到主服务器上的 Nginx 服务出现故障，Keepalived 会自动将流量切换到备用服务器上，这个过程对用户是透明的。

3. **健康检查**：Keepalived 可以执行各种健康检查，确保 Nginx 实例真正可用。如果检测到服务不健康，Keepalived 会采取措施，比如将流量转移到健康的实例。

4. **简单配置和维护**：相比于 Nginx 自身实现高可用性，Keepalived 提供了一套更为成熟和简化的解决方案，减少了配置和维护的复杂性。

5. **与现有网络基础设施的兼容性**：Keepalived 与大多数网络设备和云服务提供商的负载均衡器兼容，可以轻松集成到现有的网络架构中。

6. **负载均衡**：虽然 Nginx 自身也提供负载均衡功能，但结合 Keepalived 使用可以提供额外的一层高可用性保障，并且可以利用 Keepalived 的 VRRP 功能来实现更为复杂的负载均衡场景。

Nginx 不自己实现这些能力的原因可能包括：

- **专注性**：Nginx 主要关注于性能和灵活性，作为 web 服务器和反向代理的功能。而高可用性和故障转移是相对独立的功能，由专门的软件处理更为合适。

- **复杂性**：自己实现高可用性会增加 Nginx 的复杂性，可能导致性能下降和维护难度增加。

- **社区和生态系统**：利用 Keepalived 这样的成熟解决方案可以利用其广泛的社区支持和丰富的生态系统。

- **避免重复造轮子**：已经有多个成熟的高可用性解决方案，Nginx 没有必要重新实现这些功能，而是可以集成这些解决方案，为用户提供更多选择。

总的来说，使用 Keepalived 可以为 Nginx 提供一个稳定和成熟的高可用性解决方案，同时减少开发和维护的工作量。

# 参考资料

https://docs.nginx.com/nginx/admin-guide/high-availability/ha-keepalived/

* any list
{:toc}