---
layout: post
title: 项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件
date:  2016-10-14 10:15:54 +0800
categories: [Devops]
tags: [devops, project-manage]
published: true
---

# 拓展阅读


[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)

[持续集成平台 02 jenkins plugin 插件](https://houbb.github.io/2016/10/14/devops-jenkins-02-plugin)


[test coverate-05-测试覆盖率 SonarQube 是一个综合性的代码质量管理平台，其中包含了对测试覆盖率的支持](https://houbb.github.io/2016/04/26/test-coverage-05-sonarqube)

[Docker learn-29-docker 安装 sonarQube with mysql](https://houbb.github.io/2019/12/18/docker-learn-29-install-devops-sonar)


# Phabricator

Phabricator 是一套集成的强大工具，帮助公司构建更高质量的软件。

> [Phabricator](https://www.phacility.com/)

# 在 Mac 上安装

> [指南](https://secure.phabricator.com/book/phabricator/article/installation_guide/)

## 一、安装所需组件

- git

```
houbinbindeMacBook-Pro:~ houbinbin$ git --version
git version 2.8.1
```


> [AMP](https://coolestguidesontheplanet.com/how-to-install-php-mysql-apache-on-os-x-10-6/)


- Apache

```
houbinbindeMacBook-Pro:~ houbinbin$ httpd -v
Server version: Apache/2.4.16 (Unix)
Server built:   Jul 31 2015 15:53:26
```

- php

```
houbinbindeMacBook-Pro:~ houbinbin$ php -v
PHP 5.5.30 (cli) (built: Oct 23 2015 17:21:45)
Copyright (c) 1997-2015 The PHP Group
Zend Engine v2.5.0, Copyright (c) 1998-2015 Zend Technologies
```



- MySQL

> [MySQL](https://www.mysql.com)


下载以下项目

```
$ git clone https://github.com/phacility/libphutil.git
$ git clone https://github.com/phacility/arcanist.git
$ git clone https://github.com/phacility/phabricator.git
```

然后

这个为实践路径。

```
houbinbindeMacBook-Pro:phabricator houbinbin$ pwd
/Users/houbinbin/IT/anybuy/phabricator
houbinbindeMacBook-Pro:phabricator houbinbin$ git clone https://github.com/phacility/libphutil.git
Cloning into 'libphutil'...
remote: Counting objects: 14006, done.
remote: Compressing objects: 100% (104/104), done.
```

## 二、配置 Apache

> [Mac 中的 Apache](http://www.cnblogs.com/surge/p/4168220.html)

- 启动 & 重启

```
$ sudo apachectl -k start

$ sudo apachectl -k restart
```

- 浏览器

```
localhost
```

- 找到 ```httpd.conf```

使用命令行和 vim 编辑或按:

```
command + shift + G
```

输入

```
/etc/
```

来找到 apache 目录。


> [在 Mac 上安装](http://blog.csdn.net/ryoho2015/article/details/50724020)

错误:

Invalid command 'RewriteEngine', perhaps misspelled or defined by a module not included in the server configuration

- 编辑 /etc/apache2/httpd.conf

去掉以下命令前的 ```#```:

```
LoadModule rewrite_module libexec/apache2/mod_rewrite.so
LoadModule php5_module libexec/apache2/libphp5.so
Include /private/etc/apache2/extra/httpd-vhosts.conf
```


- 编辑 /etc/apache2/extra/httpd-vhosts.conf

如下所示:

```conf
# 虚拟主机
#
# 必需的模块: mod_log_config

# 如果您想在您的机器上维护多个域名/主机名，
# 您可以为它们设置虚拟主机容器。大多数配置
# 仅使用基于名称的虚拟主机，所以服务器不需要担心
# IP 地址。这由下面指令中的星号表示。
#
# 在尝试设置虚拟主机之前，请查看
# <URL:http://httpd.apache.org/docs/2.4/vhosts/>
# 获取更多详细信息。
#
# 您可以使用命令行选项 '-S' 来验证您的虚拟主机
# 配置。

#
# 虚拟主机示例:
# 几乎所有的 Apache 指令都可以放在一个虚拟主机容器中。
# 第一个虚拟主机部分用于所有未匹配任何 ServerName 或 ServerAlias 的请求。
#

Listen 1234

<Directory "/Users/houbinbin/IT/anybuy/phabricator/phabricator/webroot">
  Require all granted
</Directory>

<VirtualHost *:1234>
  # 将此更改为指向您的主机的域名。
  ServerName www.anybuy.com

  # 将此更改为从 GitHub 检出 'phabricator' 时所放置的路径
  # 注意确保最后包括 "/webroot"！
  DocumentRoot /Users/houbinbin/IT/anybuy/phabricator/phabricator/webroot

  RewriteEngine on
  RewriteRule ^/rsrc/(.*)     -                       [L,QSA]
  RewriteRule ^/favicon.ico   -                       [L,QSA]
  RewriteRule ^(.*)$          /index.php?__path__=$1  [B,L,QSA]
</VirtualHost>
```


注意:

1. Listen 1234 指定端口号为 1234
2. ServerName ```www.anybuy.com``` 后者为项目域名,本地可使用```127.0.0.1```
3. ```/Users/houbinbin/IT/anybuy/phabricator/phabricator/webroot``` 2处路径请替换成自己的实际路径。

- 重启 Apache，然后您将看到首页

## 配置 mysql

这段代码是用来配置 Phabricator 连接到 MySQL 数据库的信息。其中包括主机名、端口号、用户名和密码。

接着，它要求你运行存储升级脚本以设置 Phabricator 的数据库模式。

```
/Users/houbinbin/IT/anybuy/phabricator/phabricator/bin/storage upgrade
```

运行这个命令后，可能会看到类似以下的日志输出：

```
Before running storage upgrades, you should take down the Phabricator web
interface and stop any running Phabricator daemons (you can disable this
warning with --force).

    Are you ready to continue? [y/N] y

Loading quickstart template...
Applying patch 'phabricator:db.packages'...
Applying patch 'phabricator:20160201.revision.properties.1.sql'...
Applying patch 'phabricator:20160201.revision.properties.2.sql'...
Applying patch 'phabricator:20160706.phame.blog.parentdomain.2.sql'...
Applying patch 'phabricator:20160706.phame.blog.parentsite.1.sql'...
Applying patch 'phabricator:20160707.calendar.01.stub.sql'...
Applying patch 'phabricator:20160711.files.01.builtin.sql'...
Applying patch 'phabricator:20160711.files.02.builtinkey.sql'...
Applying patch 'phabricator:20160713.event.01.host.sql'...
Applying patch 'phabricator:20160715.event.01.alldayfrom.sql'...
Applying patch 'phabricator:20160715.event.02.alldayto.sql'...
Applying patch 'phabricator:20160715.event.03.allday.php'...
Applying patch 'phabricator:20160720.calendar.invitetxn.php'...
Restructuring calendar invite transactions...
Done.
Applying patch 'phabricator:20160721.pack.01.pub.sql'...
Applying patch 'phabricator:20160721.pack.02.pubxaction.sql'...
Applying patch 'phabricator:20160721.pack.03.edge.sql'...
Applying patch 'phabricator:20160721.pack.04.pkg.sql'...
Applying patch 'phabricator:20160721.pack.05.pkgxaction.sql'...
Applying patch 'phabricator:20160721.pack.06.version.sql'...
Applying patch 'phabricator:20160721.pack.07.versionxaction.sql'...
Applying patch 'phabricator:20160722.pack.01.pubngrams.sql'...
Applying patch 'phabricator:20160722.pack.02.pkgngrams.sql'...
Applying patch 'phabricator:20160722.pack.03.versionngrams.sql'...
Applying patch 'phabricator:20160810.commit.01.summarylength.sql'...
Applying patch 'phabricator:20160824.connectionlog.sql'...
Applying patch 'phabricator:20160824.repohint.01.hint.sql'...
Applying patch 'phabricator:20160824.repohint.02.movebad.php'...
Applying patch 'phabricator:20160824.repohint.03.nukebad.sql'...
Applying patch 'phabricator:20160825.ponder.sql'...
Applying patch 'phabricator:20160829.pastebin.01.language.sql'...
Applying patch 'phabricator:20160829.pastebin.02.language.sql'...
Applying patch 'phabricator:20160913.conpherence.topic.1.sql'...
Applying patch 'phabricator:20160919.repo.messagecount.sql'...
Applying patch 'phabricator:20160919.repo.messagedefault.sql'...
Storage is up to date. Use 'storage status' for details.
Verifying database schemata...


Database                 Table                    Name              Issues
phabricator_calendar     calendar_event           userPHID_dateFrom Surplus Key
phabricator_calendar     calendar_event           key_date          Missing Key
phabricator_file         file_transaction_comment key_draft         Surplus Key
phabricator_harbormaster harbormaster_build       key_initiator     Missing Key
phabricator_herald       herald_rule              name              Better Collation Available
phabricator_herald       herald_rule              key_name          Missing Key
phabricator_packages     packages_package         name              Better Collation Available
phabricator_packages     packages_publisher       name              Better Collation Available
phabricator_search       search_document          key_type          Missing Key
phabricator_worker       worker_archivetask       key_modified      Missing Key
Applying schema adjustments...
Done.
Completed applying all schema adjustments.
```

### 访问 Phabricator

浏览器打开页面 [http://127.0.0.1:1234/](http://127.0.0.1:1234/)


# 在 Ubuntu 上安装

如果你正在 Ubuntu 上安装，可以使用提供的安装脚本来处理本文中讨论的大部分事项：

> [install_ubuntu.sh](https://secure.phabricator.com/diffusion/P/browse/master/scripts/install/install_ubuntu.sh)

> [安装指南 中文](https://my.oschina.net/yoyoko/blog/126325)

> [安装指南 中文](http://www.linuxdiyf.com/linux/16060.html)

## 一、 install_ubuntu.sh

- 访问 [install_ubuntu.sh](https://secure.phabricator.com/diffusion/P/browse/master/scripts/install/install_ubuntu.sh)

- 创建文件 ```install_ubuntu.sh```

```
$ vi install_ubuntu.sh
```

- 将 [install_ubuntu.sh](https://secure.phabricator.com/diffusion/P/browse/master/scripts/install/install_ubuntu.sh) 的脚本内容复制到 ```install_ubuntu.sh``` 中；

- 运行

```
$ sudo chmod 755 install_ubuntu.sh
$ sudo ./install_ubuntu.sh

PHABRICATOR UBUNTU INSTALL SCRIPT
This script will install Phabricator and all of its core dependencies.
Run it from the directory you want to install into.

Phabricator will be installed to: /root/code.
Press RETURN to continue, or ^C to cancel.
```


## 二、 Config Apache

- 一些命令

```
$   /etc/init.d/apache2 start
$   /etc/init.d/apache2 restart
$   /etc/init.d/apache2 stop
```

> [配置 apache](http://www.oschina.net/question/191440_125562)

> [Ubuntu Apache 中文](http://www.cnblogs.com/ylan2009/archive/2012/02/25/2368028.html)


- 在 ```/etc/apache2/httpd.conf``` 中添加以下内容：

```
LoadModule rewrite_module libexec/apache2/mod_rewrite.so
LoadModule php5_module libexec/apache2/libphp5.so
```

- 编辑 ```/etc/apache2/apache2.conf```：

```
$   vi /etc/apache2/apache2.conf
```

添加以下内容：

```
ServerName 139.196.28.125

<Directory "/root/code/phabricator/webroot">
    Require all granted
</Directory>
```

- 编辑 ```000-default.conf```：

```
$   vim /etc/apache2/sites-enabled/000-default.conf
```

将 *DocumentRoot* 的路径更改为：

```
/root/code/phabricator/webroot
```

添加以下内容：

```
RewriteEngine on
RewriteRule ^/rsrc/(.*)     -                       [L,QSA]
RewriteRule ^/favicon.ico   -                       [L,QSA]
RewriteRule ^(.*)$          /index.php?__path__=$1  [B,L,QSA]
```

- 重启 Apache：

```
$    /etc/init.d/apache2 restart
```

## 三、 403 Forbidden

```
Forbidden

You don't have permission to access / on this server.

Apache/2.4.7 (Ubuntu) Server at 139.196.28.125 Port 1234
```

我认为，即使您添加了这个，还是会出现403错误。也许您应该更改项目包的权限。

为了方便起见，我将```phabricator```相关的包移动到了```var/www/```，最终，它成功了~~~T_T

```
<Directory "/root/code/phabricator/webroot">
    Require all granted
</Directory>
```


## 四、 Config mysql

- 设置配置

```
/root/code/phabricator/bin/config set mysql.host localhost
/root/code/phabricator/bin/config set mysql.port 3306
/root/code/phabricator/bin/config set mysql.user root
/root/code/phabricator/bin/config set mysql.pass ****
```

- 更新配置

```
/root/code/phabricator/bin/storage upgrade
```

# Arcanist

arc 的主要用途是将变更发送到 [Differential](https://secure.phabricator.com/book/phabricator/article/differential/) 进行审阅。

> [arc](https://secure.phabricator.com/book/phabricator/article/arcanist_diff/)

> [代码审阅 中文](http://www.jianshu.com/p/b1a75a14638c)

## 一、在 Windows 上安装

- 安装 git

> [git](https://git-scm.com/)

- 安装 php

1. 下载 [php](http://www.php.net/) 压缩包

2. 解压到包中，例如：```C:\php```

3. 复制 ```C:\php\php.ini-production```，并重命名为 ```php.ini```

4. 编辑 php.ini，移除以下行前的 ```;```：

```
; extension_dir = "ext"
;extension=php_mbstring.dll
;extension=php_curl.dll
```

- 安装组件

> 安装

```
$   some_install_path/ $ git clone https://github.com/phacility/libphutil.git
$   some_install_path/ $ git clone https://github.com/phacility/arcanist.git
```

> 配置

编辑 ```~/.bash_profile``` 文件

```
M3_HOME=/usr/local/maven/maven3.3.9
ARC_HOME=/Users/houbinbin/it/code/arcanist

PATH=$ARC_HOME/bin:$M3_HOME/bin:$PATH
```



```
路径：export PATH="/Users/houbinbin/it/code/arcanist/bin"
编辑：（mac建议用vi）：arc set-config editor "/usr/bin/vi"
地址：arc set-config default http://www.XXX.com/
凭证：yourproject/ $ arc install-certificate
```

刷新配置文件：

```source .bash_profile```

- 测试

```
$   arc help
```


## 二、相关命令

```
arc diff：将代码差异（审阅请求）发送到 Differential 功能
arc list：显示尚未提交的代码信息
arc branch [分支名称]：创建并切换分支
arc land [分支名称]：在代码审核通过后，合并主分支
arc tasks：显示当前任务
```

# Issues

## 0、未配置身份验证提供程序

如果不设置身份验证提供程序，在其他计算机上登录时，将无法进行身份验证。

```
http://XXX.XXX.XX.XXX/auth/
```

将地址替换为您的对应 IP 地址，然后点击【添加提供程序】。

您可以选择最常见的一个：

```
提供程序
	用户名/密码
允许用户使用用户名和密码登录或注册。
```

然后保持其他设置默认，点击【添加提供程序】。

接着，访问 ```http://XXX.XXX.XX.XXX/config/edit/auth.require-approval/```，选择 **要求管理员批准帐户**，这样用户注册时就需要管理员审批。

## 1、未配置基本 URI

```
$    /var/www/phabricator/bin/config set phabricator.base-uri 'http://139.196.28.125:1234/'
```

## 2、Phabricator 守护进程未运行

```
$   /var/www/phabricator/bin/phd start

释放活动任务租约...
释放了 0 个任务租约。
启动守护进程：
(日志将出现在 "/var/tmp/phd/log/daemons.log" 中。)

    PhabricatorRepositoryPullLocalDaemon (静态)
    PhabricatorTriggerDaemon (静态)
    PhabricatorTaskmasterDaemon (自动扩展：组=任务，池=4，保留=0)

完成。
```

## 3、服务器时区未配置

```
$   vim /etc/php5/apache2/php.ini

date.timezone = Asia/Shanghai
```

需要重新启动 apache2 以使其生效。

## 4、禁用 PHP 的 always_populate_raw_post_data

在您的 PHP 配置中，“always_populate_raw_post_data” 键被设置为除了“-1”以外的某个值。
这可能会导致 PHP 在进程启动期间引发弃用警告。将此选项设置为“-1”可以防止这些警告出现。

```
$   vi /etc/php5/apache2/php.ini

always_populate_raw_post_data = -1

$   /etc/init.d/apache2 restart
```

## 5、PHP post_max_size 未配置

调整您的 PHP 配置中的 ```post_max_size``` 至少为 *32MB*。当设置为较小的值时，大文件上传可能无法正常工作。

在文件中：```/etc/php5/apache2/php.ini```

```
post_max_size = 32M
```

重新启动 apache 使其生效。

## 6、设置邮件

- 安装 sendmail

```
$   apt-get install sendmail
```

- 邮件

```
URL:    http://139.196.28.125:1234/config/group/metamta/

metamta.default-address = 123456789@qq.com
metamta.domain = anybuy.com     // 根据您的喜好
metamta.mail-adapter = PhabricatorMailImplementationPHPMailerLiteAdapter
```

```xml
 <property name="host" value="smtp.qq.com"/>
<!--576 is tls try 465 for ssl-->
<property name="port" value="465"/>
<property name="defaultEncoding" value="UTF-8"/>
<property name="javaMailProperties" >
    <props>
        <!--<prop key="mail.transport.protocol">smtp</prop>-->
        <prop key="mail.smtp.auth">true</prop>
        <prop key="mail.smtp.timeout">25000</prop>
        <!-- true for Gamil -->
        <prop key="mail.smtp.starttls.enable">true</prop>
        <prop key="mail.debug">true</prop>
    </props>
</property>
```

- PHPMailer

```
URL:    http://139.196.28.125:1234/config/group/phpmailer/


$   /var/www/phabricator/bin/config set phpmailer.smtp-host smtp.qq.com
$   /var/www/phabricator/bin/config set phpmailer.smtp-port 465
$   /var/www/phabricator/bin/config set phpmailer.smtp-user 123456789@qq.com
$   /var/www/phabricator/bin/config set phpmailer.smtp-password
```

> 发送失败

您可以在以下路径找到邮件发送的信息：

```
/var/mail/root
```

可能的错误包括：

```
550 Ip frequency limited. http://service.mail.qq.com/cgi-bin/help?subtype=1&&id=20022&&no=1000725
554 5.0.0 Service unavailable
```

> [提示](http://wenku.baidu.com/view/b2fd127b312b3169a451a44a.html)

如果邮件配置的是 SSL 协议，端口是 465，则需要开启相应端口。我开始配置的 SSL 没有成功，换回 25 端口，邮件就能发送了。如果发送没有成功，通过页面上的 ```Daemons``` 的控制台日志来查找原因。

> [发送](http://blog.csdn.net/xylander23/article/details/50999646)

## 7、编辑选项：```phabricator.timezone```

> [亚洲可用时区](http://php.net/manual/zh/timezones.asia.php)

将值设置为 ```Asia/Shanghai```

```
http://127.0.0.1:1234/config/edit/phabricator.timezone/?issue=config.timezone
```

## 8、未配置基本 URI

```
houbinbindeMacBook-Pro:phabricator houbinbin$ bin/config set phabricator.base-uri 'http://127.0.0.1:1234/'
在本地配置中设置了 'phabricator.base-uri'。
houbinbindeMacBook-Pro:phabricator houbinbin$ pwd
/Users/houbinbin/IT/anybuy/phabricator/phabricator
```

## 9、禁用 PHP 的 ```always_populate_raw_post_data```

## 10、Small MySQL "max_allowed_packet"

(1) 在 Mac 上

默认情况下，Mac 没有 ```my.cnf``` 文件，复制并移动它：

```
houbinbindeMacBook-Pro:support-files houbinbin$ pwd
/usr/local/mysql/support-files
houbinbindeMacBook-Pro:support-files houbinbin$ ls
binary-configure	magic			my-default.cnf		mysql-log-rotate	mysql.server		mysqld_multi.server
houbinbindeMacBook-Pro:support-files houbinbin$ sudo cp my-default.cnf my.cnf
houbinbindeMacBook-Pro:support-files houbinbin$ sudo mv my.cnf /etc/my.cnf
houbinbindeMacBook-Pro:etc houbinbin$ pwd
/etc
houbinbindeMacBook-Pro:etc houbinbin$ vi my.cnf
```

更改 ```max_allowed_packet``` 的值：

```
max_allowed_packet=41943040
```

然后，重新启动您的 MySQL

```
sudo /usr/local/mysql/support-files/mysql.server restart
```

(2) 在 Ubuntu 14.04 上

建议的最小值为 "33554432"。

```
vi /etc/mysql/my.cnf 
```

编辑内容：

```
max_allowed_packet = 32M
```

重启 MySQL。

## 11、丢失仓库本地路径

```
$   sudo mkdir -p '/var/repo/'
```

## 12、安装 Pygments 以提高语法高亮

点击 【编辑 "pygments.enabled"】，然后选择 **使用 Pygments**，最后点击 【保存配置项】

## 13、MySQL STRICT_ALL_TABLES 模式未设置

```
vi /etc/mysql/my.cnf
```

在 ```[mysqld]``` 下添加：

```
# 添加 SQL 模式
sql_mode=STRICT_ALL_TABLES
```

然后重新启动 MySQL 使其生效。

```
/etc/init.d/mysql restart
```

## 14、未找到 Sendmail 二进制文件

点击 【编辑 "metamta.mail-adapter"】 

选择: "PhabricatorMailImplementationPHPMailerAdapter"

## Ubuntu install warn

运行时警告信息如下:

```
Package php5-cli is not available, but is referred to by another package.
This may mean that the package is missing, has been obsoleted, or
is only available from another source
However the following packages replace it:
  php7.0-cli:i386 php7.0-cli
```

原因:

```
这个问题的原因是ubuntu的/etc/apt/source.list中的源比较旧了，需要更新一下，更新方法：

$ sudo apt-get -y update
```

可能系统需要安装 ```apache2```

```
$   sudo apt-get install apache2
```

- php

```
sudo apt install php7.0-cli
```

# 邮件配置

> [简书](http://www.jianshu.com/p/a0592a2f2afb)

> [安装](http://wenku.baidu.com/view/b2fd127b312b3169a451a44a.html)

> [博客中文](http://blog.sina.com.cn/s/blog_6311af050102wteg.html)


> [配置中文](www.cnblogs.com/zhangqingsh/archive/2013/04/15/3021300.html)


通过管理员账号在后台浏览器访问 ```/config/``` 进入配置页面。


> 邮件

访问 ```/config/group/metamta/``` 进行邮件配置

- metamta.default-address

设置一个默认邮箱即可。  例如: ```123456789@sina.cn```, 应保持与**phpmailer**中设置一致。

- metamta.domain

这个无所谓,使用默认配置即可。


- metamta.mail-adapter

使用SMTP邮箱,请设置邮件适配器为 ```PhabricatorMailImplementationPHPMailerAdapter```



> PHPMailer

在 ```/config/group/phpmailer/``` 的 URL 中，您可以使用以下命令进行配置:

```
bin/config set phpmailer.smtp-host smtp.sina.cn
bin/config set phpmailer.smtp-port  25
bin/config set phpmailer.smtp-protocol  TLS
bin/config set phpmailer.smtp-user 123456789@sina.cn
bin/config set phpmailer.smtp-password  XXXX
```

```smtp-port``` 默认可以使用**25**, 如果配置SSL,则需要使用**465**。


```
cat  conf/local/local.json
```

可以查看本地设置数据。


测试是否发送:

```
bin/mail list-outbound
```

```
apt-get install sendmail
```

一切配好之后，重启 守护线程

```
bin/phd restart
```

# SSH

> [repository](https://secure.phabricator.com/book/phabricator/article/diffusion_hosting/)

如果代码仓库想使用git管理项目。

需要配置SSH。

## 基本账户信息

Phabricator需要三个用户账号（三种用户身份）：两个用于基本运行，一个用于配置SSH访问。

三个账号分别是：

www-user：Phabricator Web服务器运行身份。
daemon-user：daemons （守护进程）运行身份。这个账号是唯一直接与代码仓库交互的账号，其它账号需要切换到这个账号身份（sudo）才能操作代码仓库。
vcs-user：我们需要以这个账号SSH连接Phabricator。


如果你的服务器系统中现在没有这三个账号，需要创建：

www-user：大部分情况下，这个账号已经存在了，我们不需要理这个账号。
daemon-user ：一般情况下，我们直接使用 root 账号，因为会需要很多权限（当然这可能不安全）。
vcs-user：可以使用系统中现有的一个用户账号，直接创建一个就叫 vcsuser。当用户克隆仓库的时候，需要使用类似 vcsuser@pha.example.com 的URI。

## 验证账户是否存在:

```
cat /etc/passwd | grep www-user
cat /etc/passwd | grep daemon-user
cat /etc/passwd | grep vcs-user
```

查询用户组: ```cat /etc/group```

很不幸。几个账户都不存在。

## 创建用户

- [创建用户](http://blog.csdn.net/lincyang/article/details/20922749)

```
useradd www-user -m -s /bin/bash
useradd vcs-user -m -s /bin/bash
```

设置创建用户的密码：

```
sudo passwd www-user
sudo passwd vcs-user
```

一、配置 Phabricator

接下来的所有操作都需要切换到 **root** 模式。

首先，将 ```phd.user``` 设置为 ```daemon-user```(root):

```
$pwd
/var/www/phabricator

$ sudo bin/config set phd.user root

在本地配置中设置了 'phd.user'。
```

重新启动守护程序以确保此配置正常工作。

```
$   bin/phd restart

当前没有正在运行的 Phabricator 守护程序。
释放活动任务租约中...
已释放 0 个任务租约。
启动守护程序：
（日志将出现在 "/var/tmp/phd/log/daemons.log" 中。）

    PhabricatorRepositoryPullLocalDaemon (静态)
    PhabricatorTriggerDaemon (静态)
    PhabricatorTaskmasterDaemon (自动缩放：组=任务，池=4，保留=0)

完成。
```

如果您在使用 SSH 时使用了 ```vcs-user```，您还应该配置该用户：

```
$ sudo bin/config set diffusion.ssh-user vcs-user
在本地配置中设置了 'diffusion.ssh-user'。
```

接下来，您需要设置 sudo 权限，以便这些用户可以相互交互。

## 二、Configuring Sudo

默认情况下。添加的用户是没有```sudo```权限的。

www-user 和 vcs-user 需要能够使用 **sudo** 切换到 daemon-user 用户身份才能与仓库交互，所以我们需要配置更改系统的 sudo 配置。
直接编辑 ```/etc/sudoers``` 或者在 ```/etc/sudoers.d``` 下创建一个新文件，然后把这些内容写到文件内容中


此处直接 ```vi /etc/sudoers```, 添加内容如下:

```
# add sudo for www-user and vcs-user
www-user ALL=(root) SETENV: NOPASSWD: /usr/lib/git-core/git, /usr/bin/git, /var/lib/git, /usr/lib/git-core/git-http-backend, /usr/bin/ssh, /etc/ssh, /etc/default/ssh, /etc/init.d/ssh
vcs-user ALL=(root) SETENV: NOPASSWD: /bin/sh, /usr/bin/git-upload-pack, /usr/bin/git-receive-pack
```

如果文件中有```Defaults requiretty```, 注释掉。

## 三、其它SSH配置

- ```/etc/shadow``` 中找到**vcs-user**的哪一行。修改第二列(密码列)为空,或者**NP**。

- ```/etc/passwd``` 中找到**vcs-user**的哪一行。修改```/bin/false```为```/bin/sh```。

## 四、配置SSHD端口

> [ssh](http://www.cnblogs.com/CGDeveloper/archive/2011/07/27/2118533.html)

- SSH 版本

```
$ ssh -V
OpenSSH_6.6.1p1 Ubuntu-2ubuntu2.8, OpenSSL 1.0.1f 6 Jan 2014
```

在运行 Phabricator 的服务器系统中，sshd 的版本必须高于 **6.2**

- 端口

默认端口为 **22**

1) 在 **/usr/libexec** 中创建 ```phabricator-ssh-hook.sh```：

我选择将其放置在 **/etc/ssh/shell** 中：

```
#!/bin/sh

# 注意：将此处的用户名替换为您希望用户连接的用户名。
VCSUSER="vcs-user"

# 注意：将此处的路径替换为您的 Phabricator 目录。
ROOT="/var/www/phabricator"

if [ "$1" != "$VCSUSER" ];
then
  exit 1
fi

exec "$ROOT/bin/ssh-auth" $@
```

创建完脚本后，需要将脚本及其父文件夹的所有者更改为 **root**，并赋予脚本 **755** 权限：

```
sudo chown root /etc/ssh/shell
sudo chown root /etc/ssh/shell/phabricator-ssh-hook.sh
sudo chmod 755 /etc/ssh/shell/phabricator-ssh-hook.sh
```

2) 创建 ```sshd_config```

在 **/etc/ssh** 中创建一个文件名类似 ```sshd_config.phabricator``` 的文件：

```
$ pwd
/etc/ssh
$ sudo vi sshd_config.phabricator
```

文件内容如下，此处配置端口号为 ```2222```:

如果您计划连接到除 22 以外的端口，则应将此端口设置为 Phabricator 配置中的 ```diffusion.ssh-port```：

```
$ bin/config set diffusion.ssh-port 2222
```


```
# NOTE: You must have OpenSSHD 6.2 or newer; support for AuthorizedKeysCommand
# was added in this version.

# NOTE: Edit these to the correct values for your setup.

AuthorizedKeysCommand /etc/ssh/shell/phabricator-ssh-hook.sh
AuthorizedKeysCommandUser vcs-user
AllowUsers vcs-user

# You may need to tweak these options, but mostly they just turn off everything
# dangerous.

Port 2222
Protocol 2
PermitRootLogin no
AllowAgentForwarding no
AllowTcpForwarding no
PrintMotd no
PrintLastLog no
PasswordAuthentication no
AuthorizedKeysFile none

PidFile /var/run/sshd-phabricator.pid
```

3) 启动 ssh 服务

```
sudo /usr/sbin/sshd -f /etc/ssh/sshd_config.phabricator
```

使用 ```sudo netstat -atlunp | grep ssh``` 可查看端口运行情况。

4) 上传公钥

点击你的头像 ---> 左侧菜单面板 Manage ---> 右侧菜单面板 Edit Settings ---> 左侧菜单面板 SSH Public Keys ---> 右上角 SSH Key Actions ---> Upload Public Key

上传后,执行

```
echo {} | ssh vcs-user@127.0.0.1 conduit conduit.ping
```

5) 创建项目

```http://139.196.28.125/diffusion/``` 下创建项目:

- callsign 必须大写

```
This newly created repository is not active yet. Configure policies, options, and URIs. When ready, Activate the repository.
If activated now, this repository will become a new hosted repository. To observe an existing repository instead, configure it in the URIs panel.
```

6) clone

```
git clone ssh://vcs-user@139.196.28.125:2222/source/rd.git
```

发现需要使用的是端口转发,但是要登录的还是```139.196.28.125```服务器。所以需要为其创建```vcs-user```。后来发现这是个问题。可能是因为转发问题,导致不存在。以后研究。

此处需要开启端口号2222。并启动转发。


```
useradd vcs-user -m -s /bin/bash
```

# 持续集成

> [Git + Jenkins + Pha](http://www.mutouxiaogui.cn/blog/?p=386)

- 创建用户

```
http://139.196.28.125/people/create/
```

选择 **Create Bot User**-》填入用户信息-》**Create User**。

- 编辑用户信息

```
http://139.196.28.125/p/jenkins/
```

点击左侧【Manage】-》右侧【Edit Settings】-》左侧【Conduit API Tokens】-》右侧【Generate API Token】-》【Generate Token】

复制其中的 token。

- 添加**token**到Jenkins

1) 安装 phabricator 插件 ```Phabricator Differential Plugin```

2) copy token

```
http://139.196.28.125:8080/configure
```

找到**Phabricator** -》**Credentials**, 添加信息如下:

![phabricator-jenkins](https://raw.githubusercontent.com/houbb/resource/master/img/phabricator/2017-01-15-phabricator-jenkins.png)


* any list
{:toc}
