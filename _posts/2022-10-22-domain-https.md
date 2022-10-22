---
layout: post
title: domain 域名购买如何实现免费的 HTTPS let's Encrypt 在 tomcat 实战笔记
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, tomcat, sh]
published: true
---

# Let’s Encrypt 是什么

Let's Encrypt作为一个公共且免费SSL的项目逐渐被广大用户传播和使用，是由Mozilla、Cisco、Akamai、IdenTrust、EFF等组织人员发起，主要的目的也是为了推进网站从HTTP向HTTPS过度的进程，目前已经有越来越多的商家加入和赞助支持。

Let's Encrypt免费SSL证书的出现，也会对传统提供付费SSL证书服务的商家有不小的打击。

到目前为止，Let's Encrypt获得IdenTrust交叉签名，这就是说可以应用且支持包括FireFox、Chrome在内的主流浏览器的兼容和支持，虽然目前是公测阶段，但是也有不少的用户在自有网站项目中正式使用起来。

虽然目前Let's Encrypt免费SSL证书默认是90天有效期，但是我们也可以到期自动续约，不影响我们的尝试和使用。


# 安装实战（基于 certbot）

## 环境

```
# cat /proc/version
Linux version 3.10.0-1160.45.1.el7.x86_64 (mockbuild@kbuilder.bsys.centos.org) (gcc version 4.8.5 20150623 (Red Hat 4.8.5-44) (GCC) ) #1 SMP Wed Oct 13 17:20:51 UTC 2021

# tomcat version
Server version: Apache Tomcat/7.0.76
Server built:   Nov 16 2020 16:51:26 UTC
Server number:  7.0.76.0
OS Name:        Linux
OS Version:     3.10.0-1160.45.1.el7.x86_64
Architecture:   amd64
JVM Version:    1.8.0_312-b07
JVM Vendor:     Red Hat, Inc.
```

## install certbot

安装方式我们直接按照官方网站来执行。

### 1、install snapd

测试的系统为 centos7，所以参考下面的方式：

> [installing-snap-on-centos](https://snapcraft.io/docs/installing-snap-on-centos)


```
$ sudo yum install snapd
```

安装过程中，有一个实体，选择 `y` 即可继续。

成功后的日志：

```
Installed:
  snapd.x86_64 0:2.55.3-1.el7

Dependency Installed:
  audit-libs-python.x86_64 0:2.8.5-4.el7        checkpolicy.x86_64 0:2.5-8.el7                          fuse.x86_64 0:2.9.2-11.el7               libcgroup.x86_64 0:0.41-21.el7                libsemanage-python.x86_64 0:2.5-14.el7
  libzstd.x86_64 0:1.5.2-1.el7                  policycoreutils-python.x86_64 0:2.5-34.el7              python-IPy.noarch 0:0.75-6.el7           setools-libs.x86_64 0:3.3.8-4.el7             snap-confine.x86_64 0:2.55.3-1.el7
  snapd-selinux.noarch 0:2.55.3-1.el7           squashfs-tools.x86_64 0:4.3-0.21.gitaae0aff4.el7        squashfuse.x86_64 0:0.1.102-1.el7        squashfuse-libs.x86_64 0:0.1.102-1.el7

Complete!
```


安装后，需要启用管理主 snap 通信套接字的 systemd 单元：

```
$ sudo systemctl enable --now snapd.socket
```

要启用经典 SNAP 支持，请输入以下内容以在 `/var/lib/snapd/snap` 和 `/snap` 之间创建符号链接：（就是命令软连接）

```
$ sudo ln -s /var/lib/snapd/snap /snap
```

### 2、确保您的 snapd 版本是最新的

在本机命令行执行以下指令，确保您拥有最新版本的 snapd。

```
$ sudo snap install core; 
$ sudo snap refresh core
```

PS: 这一步是需要执行的。

执行完成后的日志如下：

```
# sudo snap install core
2022-10-22T13:49:14+08:00 INFO Waiting for automatic snapd restart...
core 16-2.57.2 from Canonical✓ installed
# sudo snap refresh core
snap "core" has no updates available
```

### 3、删除 certbot-auto 和任何 Certbot 操作系统包

如果您使用 apt、dnf 或 yum 等 OS 包管理器安装了任何 Certbot 包，则应在安装 Certbot snap 之前将其删除，以确保在运行命令 certbot 时使用 snap 而不是从您的 OS 包安装 经理。 

执行此操作的确切命令取决于您的操作系统，但常见的示例是 sudo apt-get remove certbot、sudo dnf remove certbot 或 sudo yum remove certbot。

```
$ sudo yum remove certbot
```

我们这里是 centos，使用 yum

### 4、安装 Certbot

在机器上的命令行上运行此命令以安装 Certbot。

```
$ sudo snap install --classic certbot
```

完成日志：

```
certbot 1.31.0 from Certbot Project (certbot-eff✓) installed
```

**在本机命令行执行以下指令，保证certbot命令可以运行。**

```
$   sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 5、选择您希望如何运行 Certbot

您可以暂时停止您的网站吗？

- 是的，我的网络服务器当前没有在这台机器上运行。

停止您的网络服务器，然后运行此命令以获取证书。 

Certbot 将暂时在您的机器上启动一个网络服务器。

```
$   sudo certbot certonly --standalone
```

- 不，我需要让我的网络服务器保持运行。

如果您的网络服务器已经在使用端口 80 并且不想在 Certbot 运行时停止它，请运行此命令并按照终端中的说明进行操作

```
$   sudo certbot certonly --webroot
```

注意：

要使用 webroot 插件，您的服务器必须配置为从隐藏目录提供文件。 

如果 /.well-known 被您的网络服务器配置特别处理，您可能需要修改配置以确保 /.well-known/acme-challenge 中的文件由网络服务器提供服务。

---------------------------------

这里我们使用第一个命令：

```
$   sudo certbot certonly --standalone
```

按照提示，输入邮箱，域名即可。

然后发现，执行报错。。。

```
Certbot failed to authenticate some domains (authenticator: standalone). The Certificate Authority reported these problems:
  Domain: chisha.one
  Type:   unauthorized
  Detail: 42.192.74.192: Invalid response from https://dnspod.qcloud.com/static/webblock.html?d=chisha.one: "<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\" />\n\t\t<"

Hint: The Certificate Authority failed to download the challenge files from the temporary standalone webserver started by Certbot on port 80. Ensure that the listed domains point to this machine and that it can accept inbound connections from the internet.

Some challenges have failed.
Ask for help or search for solutions at https://community.letsencrypt.org. See the logfile /var/log/letsencrypt/letsencrypt.log or re-run Certbot with -v for more details.
```

## 附加：命令方式生成域名证书

上面的方式，个人感觉等价于命令行的方式：

生成泛域名证书，这样证书可以应用于所有子域名，以主域名 `chisha.one` 为例，则命令可以是：

```
$ certbot certonly --preferred-challenges dns --manual -d chisha.one -d *.chisha.one --email houbinbin.echo@gmail.com
```

如果配置了直接解析主域名，则需要把主域名也声明在命令中，即 `-d chisha.one`。

`--preferred-challenges dns` 表示通过 DNS 方式验证域名是否有效，执行后会出现如下信息：

```
# certbot certonly --preferred-challenges dns --manual -d chisha.one -d *.chisha.one --email houbinbin.echo@gmail.com
ERROR: ld.so: object '/$LIB/libonion.so' from /etc/ld.so.preload cannot be preloaded (cannot open shared object file): ignored.
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for chisha.one and *.chisha.one

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please deploy a DNS TXT record under the name:

_acme-challenge.chisha.one.

with the following value:

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

按照这个提示，在继续操作前，需要先在**域名解析里添加一条 TXT 记录。**

ps: 在哪里买的 DNS 域名，去哪里配置就好了。

添加后，通过 dig 命令来验证 _acme-challenge.chisha.one 的解析是否已生效：

```
dig -t txt _acme-challenge.chisha.one @8.8.8.8
```

也可以在下面的地址查看：

> [https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.chisha.one](https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.chisha.one)

ps: 一般的 DNS 添加，都需要一定的时间才会生效。

确认生效后，再进行 Enter 执行。

```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Press Enter to Continue

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/chisha.one/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/chisha.one/privkey.pem
This certificate expires on 2023-01-20.
These files will be updated when the certificate renews.

NEXT STEPS:
- This certificate will not be renewed automatically. Autorenewal of --manual certificates requires the use of an authentication hook script (--manual-auth-hook) but one was not provided. To renew this certificate, repeat this same certbot command before the certificate's expiry date.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

证书有效期为 3 个月，到期前 1 个月内可重新生成新的证书，或通过 `certbot renew` 自动续期。

ps: 可以把 certbot renew 直接放在 cron 定时执行器中。

## 在 tomcat7 中配置整数

如果是 tomcat 8.5.x 以后的版本，是可以直接使用上面的文件的。

我的系统中使用的是 tomcat7 版本，所以需要把文件格式做一下转换。

### 转换证书格式

进入加密证书目录下：

```
cd /etc/letsencrypt/live/chisha.one/
```

（1）执行命令生成 `.p12` 文件

此命令会要求输入一个密码，我这里就取“123456”

```
$ openssl pkcs12 -export -in fullchain.pem -inkey privkey.pem -out fullchain_and_key.p12 -name tomcat
```

完成后，会生成一个 `fullchain_and_key.p12` 文件。

（2）生成 `.jks` 证书

```
$ keytool -importkeystore -deststorepass 'yourJKSpass' -destkeypass 'yourKeyPass' -destkeystore MyDSKeyStore.jks -srckeystore fullchain_and_key.p12 -srcstoretype PKCS12 -srcstorepass 'yourPKCS12pass' -alias tomcat
```

这里的yourPKCS12pass就是上一步中设置的密码，yourJKSpass密码和yourKeyPass也可以跟yourPKCS12pass一样

这里我们简单点，都是用 123456

```
$ keytool -importkeystore -deststorepass 123456 -destkeypass 123456 -destkeystore MyDSKeyStore.jks -srckeystore fullchain_and_key.p12 -srcstoretype PKCS12 -srcstorepass 123456 -alias tomcat
```

执行完成后，生成 `MyDSKeyStore.jks` 文件。

### TOMCAT 中配置

到配置目录下

```
cd /usr/share/tomcat/conf/
```

编辑 server.xml

```
vi server.xml
```

找到如下内容并取消其注释

```xml
<Connector port="8443" protocol="org.apache.coyote.http11.Http11Protocol" 
URIEncoding="UTF-8" maxThreads="150" SSLEnabled="true" 
scheme="https" secure="true" clientAuth="false" 
sslProtocol="TLS" />
```

添加或修改 ssl 支持

```xml
<Connector port="8443" protocol="org.apache.coyote.http11.Http11Protocol" 
URIEncoding="UTF-8" maxThreads="150" SSLEnabled="true" 
scheme="https" secure="true" clientAuth="false" 
sslProtocol="TLS" 
keystoreFile="/etc/letsencrypt/live/chisha.one/MyDSKeyStore.jks" 
keystorePass="123456" 
keyAlias="tomcat" 
keyPass="123456"/>
```

说明：https默认端口是443，一般生产环境中会将上面的8443端口改为443. 

修改后重启tomcat

```
$ tomcat restart
```


验证

浏览器中访问

https://chisha.one:8443

如果8443端口修改成了443，则访问

https://chisha.one

### 重启测试

重启 Tomcat，测试 HTTPS 域名访问。

### 证书续签

```
certbot renew
```

申请最新的证书，然后根据上面的步骤，重新生成文件。

可以放在 shell 脚本中。

## 在 tomcat 中配置证书

参看 [Apache Tomcat® - Which Version Do I Want?](https://tomcat.apache.org/whichversion.html)

这里选用最新的 8.5.x 版本。

8.5.x 版本的 tomcat 支持 OpenSSL 风格的证书配置，**优势在于无需先生成 JSSE 风格需要的 keystore 证书文件**。

参考 `conf/server.xml` 中的提示，配置如下：

### apache-tomcat-8.5.83 例子

原始 server.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Server port="8005" shutdown="SHUTDOWN">
  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

  <GlobalNamingResources>
    <Resource name="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
              pathname="conf/tomcat-users.xml" />
  </GlobalNamingResources>

  <Service name="Catalina">
    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />
    <Engine name="Catalina" defaultHost="localhost">
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">

        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />

      </Host>
    </Engine>
  </Service>
</Server>
```

在这个文件上添加对应的 443 SSL 配置，修改 8080 为 80

```xml
<Connector port="443" protocol="org.apache.coyote.http11.Http11NioProtocol"
           maxThreads="150" SSLEnabled="true">
    <SSLHostConfig>
        <Certificate certificateKeyFile="/etc/letsencrypt/live/chisha.one/privkey.pem"
                     certificateFile="/etc/letsencrypt/live/chisha.one/cert.pem"
                     certificateChainFile="/etc/letsencrypt/live/chisha.one/chain.pem"
                     type="RSA" />
    </SSLHostConfig>
</Connector>
```

最终结果：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Server port="8005" shutdown="SHUTDOWN">
  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

  <GlobalNamingResources>
    <Resource name="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
              pathname="conf/tomcat-users.xml" />
  </GlobalNamingResources>

  <Service name="Catalina">
    <Connector port="80" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="443" />

    <Connector port="443" protocol="org.apache.coyote.http11.Http11NioProtocol"
           maxThreads="150" SSLEnabled="true">
        <SSLHostConfig>
            <Certificate certificateKeyFile="/etc/letsencrypt/live/chisha.one-0001/privkey.pem"
                        certificateFile="/etc/letsencrypt/live/chisha.one-0001/cert.pem"
                        certificateChainFile="/etc/letsencrypt/live/chisha.one-0001/chain.pem"
                        type="RSA" />
        </SSLHostConfig>
    </Connector>

    <Engine name="Catalina" defaultHost="localhost">
      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">

        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />

      </Host>
    </Engine>
  </Service>
</Server>
```


`/root/tool/tomcat/apache-tomcat-8.5.83/conf/server.xml` 提示：如果需要升级成 HTTP/2 协议，需要 APR/native 支持。

且安装 APR/native 后 tomcat 将会有更好的性能。会另写一篇文章来进行实践。

参见：[Apache Tomcat Native Library - Documentation Index](https://tomcat.apache.org/native-doc/)

重启 tomcat，在 catalina.out 日志中可以看到如下输出：

```
INFO [main] org.apache.coyote.AbstractProtocol.start Starting ProtocolHandler ["http-nio-80"]
INFO [main] org.apache.coyote.AbstractProtocol.start Starting ProtocolHandler ["https-jsse-nio-443"]
INFO [main] org.apache.catalina.startup.Catalina.start Server startup in 6417 ms
```

表示启动成功，然后便可浏览器中通过 https://chisha.one 访问网站。

但是还有个问题：在未做任何配置的情况下，默认仍然可以通过不安全的 http 方式访问网站，即同时支持 http://chisha.one 和 https://chisha.one 两种访问方式。

在 conf/web.xml 中配置所有的 HTTP 请求重定向到 HTTPS，才可改变这个默认行为，配置方式如下：

```xml
<web-app>

    ... pre omitted ...

    <!-- new added for redirecting http to https -->
    <security-constraint>
        <web-resource-collection>
            <web-resource-name>Secured</web-resource-name>
            <url-pattern>/*</url-pattern>
        </web-resource-collection>
        <user-data-constraint>
            <transport-guarantee>CONFIDENTIAL</transport-guarantee>
        </user-data-constraint>
    </security-constraint>

    ... post omitted ...

</web-app>
```



# 安装实战（失败）

## 第一、安装Let's Encrypt前的准备工作

根据官方的要求，我们在VPS、服务器上部署Let's Encrypt免费SSL证书之前，需要系统支持Python2.7以上版本以及支持GIT工具。

这个需要根据我们不同的系统版本进行安装和升级，因为有些服务商提供的版本兼容是完善的，尤其是debian环境兼容性比CentOS好一些。

```
[root@VM-12-8-centos ~]# git --version
git version 1.8.3.1

[root@VM-12-8-centos ~]# python --version
Python 2.7.5
```

都是满足的。


## 第二、快速获取Let's Encrypt免费SSL证书

PS：在获取某个站点证书文件的时候，我们需要在安装PYTHON2.7以及GIT，更需要将域名解析到当前主机IP中。

```
git clone https://github.com/letsencrypt/letsencrypt
cd letsencrypt
./letsencrypt-auto certonly --standalone --email houbinbin.echo@gmail.com -d chisha.one -d www.chisha.one
```

其中 `houbinbin.echo@gmail.com` 是网站管理员的邮箱; `chisha.one` 是域名，根据自己的实际修改。

ps: 时间 2022-10-22 发现下载的文件中，没有 `./letsencrypt-auto` 文件。

去看了一下官网，这里应该可以替换为

```
./certbot certonly --standalone --email houbinbin.echo@gmail.com -d chisha.one -d www.chisha.one
```

## 第三、Let's Encrypt免费SSL证书获取与应用

在完成Let's Encrypt证书的生成之后，我们会在 `/etc/letsencrypt/live/chisha.one/` 域名目录下有4个文件就是生成的密钥证书文件。

cert.pem  - Apache服务器端证书
chain.pem  - Apache根证书和中继证书
fullchain.pem  - Nginx所需要ssl_certificate文件
privkey.pem - 安全证书KEY文件

如果我们使用的Nginx环境，那就需要用到fullchain.pem和privkey.pem两个证书文件，在部署Nginx的时候需要用到。

```
ssl_certificate /etc/letsencrypt/live/chisha.one/fullchain.pem;

ssl_certificate_key /etc/letsencrypt/live/chisha.one/privkey.pem;
```

比如我们在Nginx环境中，只要将对应的ssl_certificate和ssl_certificate_key路径设置成我们生成的2个文件就可以，最好不要移动和复制文件，因为续期的时候直接续期生成的目录文件就可以，不需要再手工复制。

## 第四、解决Let's Encrypt免费SSL证书有效期问题

我们从生成的文件中可以看到，Let's Encrypt证书是有效期90天的，需要我们自己手工更新续期才可以。

```
./letsencrypt-auto certonly --renew-by-default --email houbinbin.echo@gmail.com -d chisha.one -d www.chisha.one
```

这样我们在90天内再去执行一次就可以解决续期问题，这样又可以继续使用90天。如果我们怕忘记的话也可以制作成定时执行任务，比如每个月执行一次。

## 第五、关于Let's Encrypt免费SSL证书总结

通过以上几个步骤的学习和应用，我们肯定学会了利用Let's Encrypt免费生成和获取SSL证书文件，随着Let's Encrypt的应用普及，SSL以后直接免费不需要购买，因为大部分主流浏览器都支持且有更多的主流商家的支持和赞助，HTTPS以后看来也是趋势。

在Let's Encrypt执行过程在中我们需要解决几个问题。

A - 域名DNS和解析问题。在配置Let's Encrypt免费SSL证书的时候域名一定要解析到当前VPS服务器，而且DNS必须用到海外域名DNS，如果用国内免费DNS可能会导致获取不到错误。

B - 安装Let's Encrypt部署之前需要服务器支持PYTHON2.7以及GIT环境，要不无法部署。

C - Let's Encrypt默认是90天免费，需要手工或者自动续期才可以继续使用。

Let's Encrypt 发布的 ACME v2 现已正式支持通配符证书，接下来将为大家介绍怎样申请





# 入门说明

为了在您的网站上启用 HTTPS，您需要从证书颁发机构（CA）获取证书（一种文件）。 

Let’s Encrypt 是一个证书颁发机构（CA）。

要从 Let’s Encrypt 获取您网站域名的证书，您必须证明您对域名的实际控制权。 

您可以在您的 Web 主机上运行使用 ACME 协议的软件来获取 Let’s Encrypt 证书。

为了找出最适合您获取证书的方法，您需要知道您是否拥有服务器的命令行访问权限（注：链接为英文）（有时也被被称为 SSH 访问权限）。 

如果您仅使用控制面板（例如 cPanel、Plesk 或 WordPress）管理您的网站，您很有可能没有命令行访问权限。 

您可以联系您的托管服务提供商确认。

## 拥有命令行访问权限

我们建议大多数具有命令行访问权限的人使用 Certbot ACME 客户端。

 它可以在不下线您的服务器的前提下自动执行证书颁发和安装。

对于不需要自动配置的用户，Certbot 还提供专家模式。 

它易于使用，适用于许多操作系统，并且具有出色的（注：英文）文档。 

访问 Certbot 官网[Certbot] 以获取针对于操作系统和 Web 服务器的订制文档。

如果 Certbot 不能满足您的需求，或者您想尝试别的客户端，还有更多 ACME 客户端可供选择。 选定 ACME 客户端软件后，请参阅该客户端的文档。

如果您正在尝试不同的 ACME 客户端，请使用我们的临时环境以避免遭到速率限制。

## 没有命令行访问权限

在没有命令行访问权限的情况下，最好的办法是使用您托管服务提供商提供的内置功能。 

如果您的托管服务提供商提供 Let’s Encrypt 支持，他们可以帮助您申请免费证书，安装并配置自动续期。 

对于某些提供商，这是您需要在控制面板/联系客服打开的设置。 

其他一些提供商会自动为其所有客户请求和安装证书。

查看我们列举的托管服务提供商确认你的是否在上面。 

如果是的话，请按照他们的文档设置 Let’s Encrypt 证书。

如果您的托管服务提供商不支持 Let’s Encrypt，您可以与他们联系请求支持。 

我们尽力使添加 Let’s Encrypt 支持变得非常容易，提供商（注：非中国国内提供商）通常很乐意听取客户的建议！

如果您的托管服务提供商不想集成 Let’s Encrypt，但支持上传自定义证书，您可以在自己的计算机上安装 Certbot 并使用手动模式（Manual Mode）。 

在手动模式下，您需要将指定文件上传到您的网站以证明您的控制权。 

然后，Certbot 将获取您可以上传到提供商的证书。 我们不建议使用此选项，因为它非常耗时，并且您需要在证书过期时重复此步骤。 对于大多数人来说，最好从提供商处请求 Let’s Encrypt 支持。若您的提供商不打算兼容，建议您更换提供商。

## 获取帮助

如果您对选择 ACME 客户端，使用特定客户端或与 Let’s Encrypt 相关的任何其他内容有疑问，请前往我们的社区论坛获取帮助。



# 参考资料

[为 tomcat 应用 Let’s Encrypt 证书](https://www.dunnen.top/article/18)

[https://letsencrypt.org/](https://letsencrypt.org/)

[申请Let‘s Encrypt永久免费SSL证书](https://blog.csdn.net/weixin_38556197/article/details/118616026)

[全民https时代，Let's Encrypt免费SSL证书的申请及使用（Tomcat版）](https://blog.csdn.net/lyq8479/article/details/79022888)

[Centos7 + Tomcat 8 + Let's encrypt 免费 SSL 升级 https](https://www.jianshu.com/p/7bbad2985caf )

[Let's Encrypt 泛域名ssl证书申请](https://blog.csdn.net/wc810267705/article/details/79917688)

[linux下keytool生成证书_使用keytool 生成证书](https://blog.csdn.net/weixin_32073375/article/details/112830515)

* any list
{:toc}