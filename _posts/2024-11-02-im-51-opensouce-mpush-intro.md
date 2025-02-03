---
layout: post
title: IM 即时通讯系统-51-MPush开源实时消息推送系统
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# IM 开源系列

[IM 即时通讯系统-41-开源 野火IM 专注于即时通讯实时音视频技术，提供优质可控的IM+RTC能力](https://houbb.github.io/2024/11/02/im-41-opensouce-yehuo-overview)

[IM 即时通讯系统-42-基于netty实现的IM服务端,提供客户端jar包,可集成自己的登录系统](https://houbb.github.io/2024/11/02/im-42-opensouce-yuanrw-im-intro)

[IM 即时通讯系统-43-简单的仿QQ聊天安卓APP](https://houbb.github.io/2024/11/02/im-43-opensouce-xiuweikang-im)

[IM 即时通讯系统-44-仿QQ即时通讯系统服务端](https://houbb.github.io/2024/11/02/im-44-opensouce-kingston-csj-im)

[IM 即时通讯系统-45-merua0oo0 IM 分布式聊天系统](https://houbb.github.io/2024/11/02/im-45-opensouce-merua0oo0-im)

[IM 即时通讯系统-46-OpenIM 提供了专为开发者设计的开源即时通讯解决方案](https://houbb.github.io/2024/11/02/im-46-opensouce-open-im-intro)

[IM 即时通讯系统-47-beardlessCat IM 使用netty开发分布式Im，提供分布netty集群解决方案](https://houbb.github.io/2024/11/02/im-47-opensouce-beardlessCat-im-intro)

[IM 即时通讯系统-48-aurora-imui 是个通用的即时通讯（IM）UI 库，不特定于任何 IM SDK](https://houbb.github.io/2024/11/02/im-48-opensouce-aurora-imui-intro)

[IM 即时通讯系统-49-云信 IM UIKit 是基于 NIM SDK（网易云信 IM SDK）开发的一款即时通讯 UI 组件库，包括聊天、会话、圈组、搜索、群管理等组件](https://houbb.github.io/2024/11/02/im-49-opensouce-nim-uikit-android-intro)

[IM 即时通讯系统-50-📲cim(cross IM) 适用于开发者的分布式即时通讯系统](https://houbb.github.io/2024/11/02/im-50-opensouce-cim-intro)

[IM 即时通讯系统-51-MPush开源实时消息推送系统](https://houbb.github.io/2024/11/02/im-51-opensouce-mpush-intro)

[IM 即时通讯系统-52-leo-im 服务端](https://houbb.github.io/2024/11/02/im-52-opensouce-leo-im-intro)

[IM 即时通讯系统-53-im system server](https://houbb.github.io/2024/11/02/im-53-opensouce-linyu-intro)

# IM

https://github.com/mpusher/mpush

# mpush

## [详细教程](http://mpush.mydoc.io)

* 官网：[https://mpusher.github.io](https://mpusher.github.io)

* 文档：[http://mpush.mydoc.io](http://mpush.mydoc.io)

## 源码

* group [https://github.com/mpusher/](https://github.com/mpusher/) 源代码空间

* server [https://github.com/mpusher/mpush](https://github.com/mpusher/mpush) 服务端源码

* alloc [https://github.com/mpusher/alloc](https://github.com/mpusher/alloc)  调度器源码

* mpns [https://github.com/mpusher/mpns](https://github.com/mpusher/mpns)     个性化推送中心源码

* java-client [https://github.com/mpusher/mpush-client-java](https://github.com/mpusher/mpush-client-java) 纯java客户端源码

* android sdk&demo [https://github.com/mpusher/mpush-android](https://github.com/mpusher/mpush-android)    安卓SDK和DEMO源码

* IOS sdk(swift) [https://github.com/mpusher/mpush-client-swift](https://github.com/mpusher/mpush-client-swift) swift版客户端源码

* IOS sdk(OC) [https://github.com/mpusher/mpush-client-oc](https://github.com/mpusher/mpush-client-oc)  Object C 客户端源码

ps:由于源码分别在github和码云有两份，最新的代码以github为主

## 服务调用关系

![](https://mpusher.github.io/docs/服务依赖关系.png)

## 源码测试

1. ```git clone https://github.com/mpusher/mpush.git```

2. 导入到eclipse或Intellij IDEA

3. 打开```mpush-test```模块，所有的测试代码都在该模块下

4. 修改配置文件```src/test/resource/application.conf```文件修改方式参照 服务部署第6点

5. 运行```com.mpush.test.sever.ServerTestMain.java```启动长链接服务

6. 运行```com.mpush.test.client.ConnClientTestMain.java``` 模拟一个客户端

7. 运行```com.mpush.test.push.PushClientTestMain``` 模拟给用户下发消息

8. 可以在控制台观察日志看服务是否正常运行，消息是否下发成功

## 服务部署

###### 说明：mpush 服务只依赖于zookeeper和redis，当然还有JDK>=1.8

1. 安装```jdk 1.8``` 以上版本并设置```%JAVA_HOME％```

2. 安装```zookeeper``` (安装配置步骤略)

3. 安装```Redis``` (安装配置步骤略)

4. 下载mpush server 最新的正式包[https://github.com/mpusher/mpush/releases](https://github.com/mpusher/mpush/releases)

5. 解压下载的tar包`tar -zvxf mpush-release-0.0.2.tar.gz`到 mpush 目录, 结构如下

   ><pre class="md-fences">
   >drwxrwxr-x 2 shinemo shinemo  4096 Aug 20 09:30 bin —> 启动脚本
   >drwxrwxr-x 2 shinemo shinemo  4096 Aug 20 09:52 conf —> 配置文件
   >drwxrwxr-x 2 shinemo shinemo  4096 Aug 20 09:29 lib —> 核心类库
   >-rw-rw-r-- 1 shinemo shinemo 11357 May 31 11:07 LICENSE
   >drwxrwxr-x 2 shinemo shinemo  4096 Aug 20 09:32 logs —> 日志目录
   >-rw-rw-r-- 1 shinemo shinemo    21 May 31 11:07 README.md
   >drwxrwxr-x 2 shinemo shinemo  4096 Aug 20 09:52 tmp
   ></pre>

6. 修改 conf 目录下的 ```vi mpush.conf```文件, ```mpush.conf```里的配置项会覆盖同目录下的```reference.conf```文件
   ```java
      #主要修改以下配置
      mp.net.connect-server-port=3000//长链接服务对外端口, 公网端口
      mp.zk.server-address="127.0.0.1:2181"//zk 机器的地址
      mp.redis={//redis 相关配置
            nodes:["127.0.0.1:6379"] //格式是ip:port
            cluster-model:single //single, cluster
      }
      //还有用于安全加密的RSA mp.security.private-key 和 mp.security.public-key 等...
   ```
    如果要修改其他配置请参照reference.conf文件

7. 给bin目录下的脚本增加执行权限```chmod u+x *.sh```

8. 执行```./mp.sh start``` 启动服务, 查看帮助```./mp.sh``` 目前支持的命令：

   ```Usage: ./mp.sh {start|start-foreground|stop|restart|status|upgrade|print-cmd}```

   ```set-env.sh``` 用于增加和修改jvm启动参数，比如堆内存、开启远程调试端口、开启jmx等

9. ```cd logs```目录，```cat mpush.out```查看服务是否启动成功
10. 集成部署，比如集成到现有web工程一起部署到tomcat,可以添加如下依赖
   
   ```xml
   <dependency>
      <groupId>com.github.mpusher</groupId>
      <artifactId>mpush-boot</artifactId>
      <version>0.0.2</version>
   </dependency>
   ```
   启动入口`com.mpush.bootstrap.ServerLauncher.java` 
   
## 配置文件详解
   ```java
##################################################################################################################
#
# NOTICE：
#
# 系统配置文件，所有列出的项是系统所支持全部配置项
# 如果要覆盖某项的值可以添加到mpush.conf中。
#
# 配置文件格式采用HOCON格式。解析库由https://github.com/typesafehub/config提供。
# 具体可参照说明文档，比如含有特殊字符的字符串必须用双引号包起来。
#
##################################################################################################################

mp {
    #基础配置
    home=${user.dir} //程序工作目录

    #日志配置
    log-level=warn
    log-dir=${mp.home}/logs
    log-conf-path=${mp.home}/conf/logback.xml

    #核心配置
    core {
        max-packet-size=10k //系统允许传输的最大包的大小
        compress-threshold=10k //数据包启用压缩的临界值，超过该值后对数据进行压缩
        min-heartbeat=3m //最小心跳间隔
        max-heartbeat=3m //最大心跳间隔
        max-hb-timeout-times=2 //允许的心跳连续超时的最大次数
        session-expired-time=1d //用于快速重连的session 过期时间默认1天
        epoll-provider=netty //nio:jdk自带，netty:由netty实现
    }

    #安全配置
    security {
        #rsa 私钥、公钥key长度为1024;可以使用脚本bin/rsa.sh生成, @see com.mpush.tools.crypto.RSAUtils#main
        private-key="MIIBNgIBADANBgkqhkiG9w0BAQEFAASCASAwggEcAgEAAoGBAKCE8JYKhsbydMPbiO7BJVq1pbuJWJHFxOR7L8Hv3ZVkSG4eNC8DdwAmDHYu/wadfw0ihKFm2gKDcLHp5yz5UQ8PZ8FyDYvgkrvGV0ak4nc40QDJWws621dm01e/INlGKOIStAAsxOityCLv0zm5Vf3+My/YaBvZcB5mGUsPbx8fAgEAAoGAAy0+WanRqwRHXUzt89OsupPXuNNqBlCEqgTqGAt4Nimq6Ur9u2R1KXKXUotxjp71Ubw6JbuUWvJg+5Rmd9RjT0HOUEQF3rvzEepKtaraPhV5ejEIrB+nJWNfGye4yzLdfEXJBGUQzrG+wNe13izfRNXI4dN/6Q5npzqaqv0E1CkCAQACAQACAQACAQACAQA="
        public-key="MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCghPCWCobG8nTD24juwSVataW7iViRxcTkey/B792VZEhuHjQvA3cAJgx2Lv8GnX8NIoShZtoCg3Cx6ecs+VEPD2fBcg2L4JK7xldGpOJ3ONEAyVsLOttXZtNXvyDZRijiErQALMTorcgi79M5uVX9/jMv2Ggb2XAeZhlLD28fHwIDAQAB"
        aes-key-length=16 //AES key 长度
    }

    #网络配置
    net {
        local-ip=""  //本地ip, 默认取第一个网卡的本地IP
        public-ip="" //外网ip, 默认取第一个网卡的外网IP

        connect-server-bind-ip=""  //connSrv 绑定的本地ip (默认anyLocalAddress 0.0.0.0 or ::0)
        connect-server-register-ip=${mp.net.public-ip}  //公网ip, 注册到zk中的ip, 默认是public-ip
        connect-server-port=3000 //长链接服务对外端口, 公网端口
        connect-server-register-attr { //注册到zk里的额外属性，比如配置权重，可在alloc里排序
            weight:1
        }

        gateway-server-bind-ip=""  //gatewaySrv 绑定的本地ip (默认anyLocalAddress 0.0.0.0 or ::0)
        gateway-server-register-ip=${mp.net.local-ip}  //本地ip, 注册到zk中的ip, 默认是local-ip
        gateway-server-port=3001 //网关服务端口, 内部端口
        gateway-server-net=tcp //网关服务使用的网络类型tcp/udp/sctp/udt

        gateway-client-port=4000 //UDP 客户端端口
        gateway-server-multicast="239.239.239.88" //239.0.0.0～239.255.255.255为本地管理组播地址，仅在特定的本地范围内有效
        gateway-client-multicast="239.239.239.99" //239.0.0.0～239.255.255.255为本地管理组播地址，仅在特定的本地范围内有效
        gateway-client-num=1 //网关客户端连接数

        admin-server-port=3002 //控制台服务端口, 内部端口
        ws-server-port=0 //websocket对外端口, 公网端口, 0表示禁用websocket
        ws-path="/" //websocket path

        public-host-mapping { //本机局域网IP和公网IP的映射关系, 该配置后续会被废弃
            //"10.0.10.156":"111.1.32.137"
            //"10.0.10.166":"111.1.33.138"
        }

        snd_buf { //tcp/udp 发送缓冲区大小
            connect-server=32k
            gateway-server=0
            gateway-client=0 //0表示使用操作系统默认值
        }

        rcv_buf { //tcp/udp 接收缓冲区大小
            connect-server=32k
            gateway-server=0
            gateway-client=0 //0表示使用操作系统默认值
        }

        write-buffer-water-mark { //netty 写保护
            connect-server-low=32k
            connect-server-high=64k
            gateway-server-low=10m
            gateway-server-high=20m
        }

        traffic-shaping { //流量整形配置
            gateway-client {
                enabled:false
                check-interval:100ms
                write-global-limit:30k
                read-global-limit:0
                write-channel-limit:3k
                read-channel-limit:0
            }

            gateway-server {
                enabled:false
                check-interval:100ms
                write-global-limit:0
                read-global-limit:30k
                write-channel-limit:0
                read-channel-limit:3k
            }

            connect-server {
                enabled:false
                check-interval:100ms
                write-global-limit:0
                read-global-limit:100k
                write-channel-limit:3k
                read-channel-limit:3k
            }
        }
    }

    #Zookeeper配置
    zk {
        server-address="127.0.0.1:2181" //多台机器使用","分隔如："10.0.10.44:2181,10.0.10.49:2181" @see org.apache.zookeeper.ZooKeeper#ZooKeeper()
        namespace=mpush
        digest=mpush //zkCli.sh acl 命令 addauth digest mpush
        watch-path=/
        retry {
            #initial amount of time to wait between retries
            baseSleepTimeMs=3s
            #max number of times to retry
            maxRetries=3
            #max time in ms to sleep on each retry
            maxSleepMs=5s
        }
        connectionTimeoutMs=5s
        sessionTimeoutMs=5s
    }

    #Redis集群配置
    redis {
        cluster-model=single //single,cluster,sentinel
        sentinel-master:""
        nodes:[] s//["127.0.0.1:6379"]格式ip:port
        password="" //your password
        config {
            maxTotal:8,
            maxIdle:4,
            minIdle:1,
            lifo:true,
            fairness:false,
            maxWaitMillis:5000,
            minEvictableIdleTimeMillis:300000,
            softMinEvictableIdleTimeMillis:1800000,
            numTestsPerEvictionRun:3,
            testOnCreate:false,
            testOnBorrow:false,
            testOnReturn:false,
            testWhileIdle:false,
            timeBetweenEvictionRunsMillis:60000,
            blockWhenExhausted:true,
            jmxEnabled:false,
            jmxNamePrefix:pool,
            jmxNameBase:pool
        }
    }

    #HTTP代理配置
    http {
        proxy-enabled=false //启用Http代理
        max-conn-per-host=5 //每个域名的最大链接数, 建议web服务nginx超时时间设长一点, 以便保持长链接
        default-read-timeout=10s //请求超时时间
        max-content-length=5m //response body 最大大小
        dns-mapping { //域名映射外网地址转内部IP, 域名部分不包含端口号
            //"mpush.com":["127.0.0.1:8080", "127.0.0.1:8081"]
        }
    }

    #线程池配置
    thread {
        pool {
            conn-work:0 //接入服务线程池大小，0表示线程数根据cpu核数动态调整(2*cpu)
            gateway-server-work:0 //网关服务线程池大小，0表示线程数根据cpu核数动态调整(2*cpu)
            http-work:0 //http proxy netty client work pool size，0表示线程数根据cpu核数动态调整(2*cpu)
            ack-timer:1 //处理ACK消息超时
            push-task:0 //消息推送中心，推送任务线程池大小, 如果为0表示使用Gateway Server的work线程池，tcp下推荐0
            gateway-client-work:0 //网关客户端线程池大小，0表示线程数根据cpu核数动态调整(2*cpu)，该线程池在客户端运行
            push-client:2 //消息推送回调处理，该线程池在客户端运行

            event-bus { //用户处理内部事件分发
                min:1
                max:16
                queue-size:10000 //大量的online，offline
            }

            mq { //用户上下线消息, 踢人等
                min:1
                max:4
                queue-size:10000
            }
        }
    }

    #推送消息流控
    push {
       flow-control { //qps = limit/(duration)
            global:{ //针对非广播推送的流控，全局有效
                limit:5000 //qps = 5000
                max:0 //UN limit
                duration:1s //1s
            }

            broadcast:{ //针对广播消息的流控，单次任务有效
                limit:3000 //qps = 3000
                max:100000 //10w
                duration:1s //1s
            }
       }
    }

    #系统监控配置
    monitor {
        dump-dir=${mp.home}/tmp
        dump-stack=false //是否定时dump堆栈
        dump-period=1m  //多久监控一次
        print-log=true //是否打印监控日志
        profile-enabled=false //开启性能监控
        profile-slowly-duration=10ms //耗时超过10ms打印日志
    }

    #SPI扩展配置
    spi {
        thread-pool-factory:"com.mpush.tools.thread.pool.DefaultThreadPoolFactory"
        dns-mapping-manager:"com.mpush.common.net.HttpProxyDnsMappingManager"
    }
}
```
11. 未完待续...


# 参考资料

* any list
{:toc}