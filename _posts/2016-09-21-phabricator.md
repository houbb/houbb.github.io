---
layout: post
title: Phabricator
date:  2016-09-21 22:28:40 +0800
categories: [Tools]
tags: [phabricator]
published: true
---

* any list
{:toc}


# Phabricator

Phabricator is an integrated set of powerful tools to help companies build higher quality software.

> [Phabricator](https://www.phacility.com/)


# Install in Mac

> [Guide](https://secure.phabricator.com/book/phabricator/article/installation_guide/)


一、Installing Required Components



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

then

这个为实践路径。

```
houbinbindeMacBook-Pro:phabricator houbinbin$ pwd
/Users/houbinbin/IT/anybuy/phabricator
houbinbindeMacBook-Pro:phabricator houbinbin$ git clone https://github.com/phacility/libphutil.git
Cloning into 'libphutil'...
remote: Counting objects: 14006, done.
remote: Compressing objects: 100% (104/104), done.
```


二、  Configuring Apache

> [apache in mac](http://www.cnblogs.com/surge/p/4168220.html)

- start & restart

```
$   sudo apachectl -k start

$   sudo apachectl -k restart
```

- browser

```
localhost
```

- find ```httpd.conf```

Use command line with vim to edit or press:

```
command + shift + G
```

enter

```
/etc/
```

to find the apache dir.


> [install in mac](http://blog.csdn.net/ryoho2015/article/details/50724020)

error:

Invalid command 'RewriteEngine', perhaps misspelled or defined by a module not included in the server configuration

- edit the /etc/apache2/httpd.conf

remove the ```#``` before following:

```
LoadModule rewrite_module libexec/apache2/mod_rewrite.so
LoadModule php5_module libexec/apache2/libphp5.so
Include /private/etc/apache2/extra/httpd-vhosts.conf
```


- edit the /etc/apache2/extra/httpd-vhosts.conf

like this:

```
# Virtual Hosts
#
# Required modules: mod_log_config

# If you want to maintain multiple domains/hostnames on your
# machine you can setup VirtualHost containers for them. Most configurations
# use only name-based virtual hosts so the server doesn't need to worry about
# IP addresses. This is indicated by the asterisks in the directives below.
#
# Please see the documentation at
# <URL:http://httpd.apache.org/docs/2.4/vhosts/>
# for further details before you try to setup virtual hosts.
#
# You may use the command line option '-S' to verify your virtual host
# configuration.

#
# VirtualHost example:
# Almost any Apache directive may go into a VirtualHost container.
# The first VirtualHost section is used for all requests that do not
# match a ServerName or ServerAlias in any <VirtualHost> block.
#

Listen 1234

<Directory "/Users/houbinbin/IT/anybuy/phabricator/phabricator/webroot">
  Require all granted
</Directory>

<VirtualHost *:1234>
  # Change this to the domain which points to your host.
  ServerName www.anybuy.com

  # Change this to the path where you put 'phabricator' when you checked it
  # out from GitHub when following the Installation Guide.
  #
  # Make sure you include "/webroot" at the end!
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

- restart the Apache and you can see

![phabricator index](https://raw.githubusercontent.com/houbb/resource/master/img/phabricator/2016-09-22-phabricator-index.png)


- config mysql

```
/Users/houbinbin/IT/anybuy/phabricator/phabricator/bin/config set mysql.host localhost

/Users/houbinbin/IT/anybuy/phabricator/phabricator/bin/config set mysql.port 3306　

/Users/houbinbin/IT/anybuy/phabricator/phabricator/bin/config set mysql.user root　

/Users/houbinbin/IT/anybuy/phabricator/phabricator/bin/config set mysql.pass ***(Your pwd)　
```

then, it's ask you to:

Run the storage upgrade script to setup Phabricator's database schema.

```
/Users/houbinbin/IT/anybuy/phabricator/phabricator/bin/storage upgrade
```

the log may like this:

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

- visit the phabricator

```
http://127.0.0.1:1234/
```

![phabricator](https://raw.githubusercontent.com/houbb/resource/master/img/phabricator/2016-09-22-phabricator-visit.png)


# Install in Ubuntu

If you are installing on Ubuntu, there are install scripts available which should handle most of the things discussed in this document for you:

> [install_ubuntu.sh](https://secure.phabricator.com/diffusion/P/browse/master/scripts/install/install_ubuntu.sh)

> [install zh_CN](https://my.oschina.net/yoyoko/blog/126325)

> [install zh_CN](http://www.linuxdiyf.com/linux/16060.html)

一、 install_ubuntu.sh

- Visit the [install_ubuntu.sh](https://secure.phabricator.com/diffusion/P/browse/master/scripts/install/install_ubuntu.sh)

- Create file ```install_ubuntu.sh```

```
$   vi install_ubuntu.sh
```

- Copy the shell content of [install_ubuntu.sh](https://secure.phabricator.com/diffusion/P/browse/master/scripts/install/install_ubuntu.sh) into ```install_ubuntu.sh```;

- Run

```
$   sudo chmod 755 install_ubuntu.sh
$   sudo ./install_ubuntu.sh

PHABRICATOR UBUNTU INSTALL SCRIPT
This script will install Phabricator and all of its core dependencies.
Run it from the directory you want to install into.

Phabricator will be installed to: /root/code.
Press RETURN to continue, or ^C to cancel.
```


二、 Config Apache


- some commands

```
$   /etc/init.d/apache2 start
$   /etc/init.d/apache2 restart
$   /etc/init.d/apache2 stop
```

> [config apache](http://www.oschina.net/question/191440_125562)

> [ubuntu apache ch_ZN](http://www.cnblogs.com/ylan2009/archive/2012/02/25/2368028.html)


- add in ```/etc/apache2/httpd.conf```

```
LoadModule rewrite_module libexec/apache2/mod_rewrite.so
LoadModule php5_module libexec/apache2/libphp5.so
```

- edit ```/etc/apache2/apache2.conf```

```
$   vi /etc/apache2/apache2.conf
```

add this :

```
ServerName 139.196.28.125

<Directory "/root/code/phabricator/webroot">
    Require all granted
</Directory>


```



- edit ```000-default.conf```

```
$   vim /etc/apache2/sites-enabled/000-default.conf
```

change the path of *DocumentRoot* to:

```
/root/code/phabricator/webroot
```

add these:

```
RewriteEngine on
RewriteRule ^/rsrc/(.*)     -                       [L,QSA]
RewriteRule ^/favicon.ico   -                       [L,QSA]
RewriteRule ^(.*)$          /index.php?__path__=$1  [B,L,QSA]
```

- restart apache

```
$    /etc/init.d/apache2 restart
```

三、 403

```
Forbidden

You don't have permission to access / on this server.

Apache/2.4.7 (Ubuntu) Server at 139.196.28.125 Port 1234
```

I think If you had add this, it's still 403. May be you should change the permission of your project package.

For easy, I move the ```phabricator``` relative package to ```var/www/```, Finally, it's worked~~~T_T

```
<Directory "/root/code/phabricator/webroot">
    Require all granted
</Directory>
```


四、 Config mysql

- set config

```
/root/code/phabricator/bin/config set mysql.host localhost
/root/code/phabricator/bin/config set mysql.port 3306
/root/code/phabricator/bin/config set mysql.user root
/root/code/phabricator/bin/config set mysql.pass ****
```

- update config

```
/root/code/phabricator/bin/storage upgrade
```

# Arcanist


The primary use of arc is to send changes for review in [Differential](https://secure.phabricator.com/book/phabricator/article/differential/)

> [arc](https://secure.phabricator.com/book/phabricator/article/arcanist_diff/)

> [code review zh_CN](http://www.jianshu.com/p/b1a75a14638c)


一、 Install in Windows

- install git

> [git](https://git-scm.com/)

- install php

1. Download [php](http://www.php.net/) zip

2. Unzip in package, like: ```C:\php```

3. Copy ```C:\php\php.ini-production```, and renamed to ```php.ini```

4. Edit php.ini, remove the ```;``` of following lines

```
; extension_dir = "ext"
;extension=php_mbstring.dll
;extension=php_curl.dll
```

- install components

> install

```
$   some_install_path/ $ git clone https://github.com/phacility/libphutil.git
$   some_install_path/ $ git clone https://github.com/phacility/arcanist.git
```

> config

edit ```~/.bash_profile``` file

```
M3_HOME=/usr/local/maven/maven3.3.9
ARC_HOME=/Users/houbinbin/it/code/arcanist

PATH=$ARC_HOME/bin:$M3_HOME/bin:$PATH
```



```
Path：export PATH="/Users/houbinbin/it/code/arcanist/bin"
Edit：（mac建议用vi）：arc set-config editor "/usr/bin/vi"
Addr：arc set-config default http://www.XXX.com/
Cred：yourproject/ $ arc install-certificate
```

refresh config file:

```source .bash_profile```

- test

```
$   arc help
```


二、 Relative commands

```
arc diff：发送代码差异（review request）到Differental功能
arc list：限时未提交的代码信息
arc branch [branch name]：创建并checkout分支
arc land [branch name]：代码审核通过后，合并主分支
arc tasks：展示当前任务
```



# Issues

0、No Authentication Providers Configured

这个如果不设置，在其他电脑登陆，将失去验证方式。

```
http://XXX.XXX.XX.XXX/auth/
```

地址替换成自己对应的IP，点击【Add Provider】

可选择最常规的一个:

```
Provider
	Username/Password
Allow users to login or register using a username and password.
```
后面默认，保存点击【Add Provider】

```http://XXX.XXX.XX.XXX/config/edit/auth.require-approval/``` 选择 **Require Administrators to Approve Accounts** 则用户注册需要管理员审核。

1、Base URI Not Configured

```
$    /var/www/phabricator/bin/config set phabricator.base-uri 'http://139.196.28.125:1234/'
```

2、Phabricator Daemons Are Not Running

```
$   /var/www/phabricator/bin/phd start

Freeing active task leases...
Freed 0 task lease(s).
Launching daemons:
(Logs will appear in "/var/tmp/phd/log/daemons.log".)

    PhabricatorRepositoryPullLocalDaemon (Static)
    PhabricatorTriggerDaemon (Static)
    PhabricatorTaskmasterDaemon (Autoscaling: group=task, pool=4, reserve=0)

Done.
```

3、Server Timezone Not Configured

```
$   vim /etc/php5/apache2/php.ini

date.timezone = Asia/Shanghai
```

You need to restart apache2 to make if effect.

4、Disable PHP always_populate_raw_post_data

The "always_populate_raw_post_data" key is set to some value other than "-1" in your PHP configuration.
This can cause PHP to raise deprecation warnings during process startup. Set this option to "-1" to prevent these warnings from appearing.

```
$   vi /etc/php5/apache2/php.ini

always_populate_raw_post_data = -1

$   /etc/init.d/apache2 restart
```

5、PHP post_max_size Not Configured

Adjust ```post_max_size``` in your PHP configuration to at least *32MB*. When set to smaller value, large file uploads may not work properly.

In this file: ```/etc/php5/apache2/php.ini```

```
post_max_size = 32M
```

restart apache to make it work.

6、Set Mail

- install send mail

```
$   apt-get install sendmail
```

- mail

```
URL:    http://139.196.28.125:1234/config/group/metamta/


metamta.default-address = 13062666053@qq.com

metamta.domain = anybuy.com     //as you like

metamta.mail-adapter = PhabricatorMailImplementationPHPMailerLiteAdapter

```

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


- PHPMailer

```
URL:    http://139.196.28.125:1234/config/group/phpmailer/


$   /var/www/phabricator/bin/config set phpmailer.smtp-host smtp.qq.com

$   /var/www/phabricator/bin/config set phpmailer.smtp-port 465

$   /var/www/phabricator/bin/config set phpmailer.smtp-user 13062666053@qq.com

$   /var/www/phabricator/bin/config set phpmailer.smtp-password

```

> send fail

You can find the mail send info in

```
/var/mail/root
```

the error may:

```
550 Ip frequency limited. http://service.mail.qq.com/cgi-bin/help?subtype=1&&id=20022&&no=1000725
554 5.0.0 Service unavailable
```

> [tips](http://wenku.baidu.com/view/b2fd127b312b3169a451a44a.html)


如果邮件配置的是SSL协议，端口是465，则需要开启相应端口。我开始配置的SSL没有成功，换回25端口，邮件就能发送了。
如果发送没有成功，通过页面上的```Daemons```的console日志来查找原因。



> [send](http://blog.csdn.net/xylander23/article/details/50999646)


7、Edit Option: ```phabricator.timezone```

> [Asia available](http://php.net/manual/zh/timezones.asia.php)

Set the value into ```Asia/Shanghai```

```
http://127.0.0.1:1234/config/edit/phabricator.timezone/?issue=config.timezone
```

8、Base URI Not Configured

```
houbinbindeMacBook-Pro:phabricator houbinbin$ bin/config set phabricator.base-uri 'http://127.0.0.1:1234/'
Set 'phabricator.base-uri' in local configuration.
houbinbindeMacBook-Pro:phabricator houbinbin$ pwd
/Users/houbinbin/IT/anybuy/phabricator/phabricator
```

9、Disable PHP ```always_populate_raw_post_data```



10、Small MySQL "max_allowed_packet"

(1) In Mac

Default, MAC has no ```my.cnf```, copy and move it:

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

to change the ```max_allowed_packet``` value:

```
max_allowed_packet=41943040
```

and then, restart your mysql

```
sudo /usr/local/mysql/support-files/mysql.server restart
```

(2) In Ubuntu 14.04

The recommended minimum value for this setting is "33554432".

```
vi /etc/mysql/my.cnf 
```

edit the content

```
max_allowed_packet = 32M
```

restart mysql


11、Missing Repository Local Path

```
$   sudo mkdir -p '/var/repo/'
```

12、Install Pygments to Improve Syntax Highlighting

Click 【Edit "pygments.enabled"】, then select **Use Pygments**, finally click 【Save Config Entry】

13、MySQL STRICT_ALL_TABLES Mode Not Set

```
vi /etc/mysql/my.cnf
```

add this under the ```[mysqld]``` 

```
# add sql mode
sql_mode=STRICT_ALL_TABLES
```

then restart mysql make it effect.

```
/etc/init.d/mysql restart
```

14、No Sendmail Binary Found

Click 【Edit "metamta.mail-adapter"】 

Select: "PhabricatorMailImplementationPHPMailerAdapter"


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

# Mail Config

> [jianshu](http://www.jianshu.com/p/a0592a2f2afb)

> [install](http://wenku.baidu.com/view/b2fd127b312b3169a451a44a.html)

> [blog zh_CN](http://blog.sina.com.cn/s/blog_6311af050102wteg.html)


> [config zh_CN](www.cnblogs.com/zhangqingsh/archive/2013/04/15/3021300.html)


管理员账号浏览器后端添加```/config/```进入配置界面。


> Mail

```/config/group/metamta/``` to config mail

- metamta.default-address

设置一个默认邮箱即可。  如: ```13062666053@sina.cn```,应保持与**phpmailer**中设置一致。

- metamta.domain

这个无所谓,使用默认配置即可。


- metamta.mail-adapter

使用SMTP邮箱,请设置邮件适配器```PhabricatorMailImplementationPHPMailerAdapter```



> phpmailer

in the URL of: ```/config/group/phpmailer/```, you can use command to config:

```
bin/config set phpmailer.smtp-host smtp.sina.cn
bin/config set phpmailer.smtp-port  25
bin/config set phpmailer.smtp-protocol  TLS
bin/config set phpmailer.smtp-user 13062666053@sina.cn
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

如果代码仓库想使用git管理项目。需要配置SSH。

Phabricator需要三个用户账号（三种用户身份）：两个用于基本运行，一个用于配置SSH访问。
三个账号分别是：
www-user：Phabricator Web服务器运行身份。
daemon-user：daemons （守护进程）运行身份。这个账号是唯一直接与代码仓库交互的账号，其它账号需要切换到这个账号身份（sudo）才能操作代码仓库。
vcs-user：我们需要以这个账号SSH连接Phabricator。


如果你的服务器系统中现在没有这三个账号，需要创建：
www-user：大部分情况下，这个账号已经存在了，我们不需要理这个账号。
daemon-user ：一般情况下，我们直接使用 root 账号，因为会需要很多权限（当然这可能不安全）。
vcs-user：可以使用系统中现有的一个用户账号，直接创建一个就叫 vcsuser。当用户克隆仓库的时候，需要使用类似 vcsuser@pha.example.com 的URI。

- 验证账户是否存在:

```
cat /etc/passwd | grep www-user
cat /etc/passwd | grep daemon-user
cat /etc/passwd | grep vcs-user
```

查询用户组: ```cat /etc/group```

很不幸。几个账户都不存在。

- [创建用户](http://blog.csdn.net/lincyang/article/details/20922749)

```
useradd www-user -m -s /bin/bash
useradd vcs-user -m -s /bin/bash
```

set password for create user:

```
sudo passwd www-user
sudo passwd vcs-user
```

一、Configuring Phabricator

以下所有操作,都换成**root**模式。

First, set ```phd.user``` to the ```daemon-user```(root):

```
$pwd
/var/www/phabricator

$ sudo bin/config set phd.user root

Set 'phd.user' in local configuration.
```

Restart the daemons to make sure this configuration works properly.

```
$   bin/phd restart

There are no running Phabricator daemons.
Freeing active task leases...
Freed 0 task lease(s).
Launching daemons:
(Logs will appear in "/var/tmp/phd/log/daemons.log".)

    PhabricatorRepositoryPullLocalDaemon (Static)
    PhabricatorTriggerDaemon (Static)
    PhabricatorTaskmasterDaemon (Autoscaling: group=task, pool=4, reserve=0)

Done.
```


If you're using a ```vcs-user``` for SSH, you should also configure that:

```
$ sudo bin/config set diffusion.ssh-user vcs-user
Set 'diffusion.ssh-user' in local configuration
```

Next, you'll set up sudo permissions so these users can interact with one another.


二、Configuring Sudo

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

三、其它SSH配置

- ```/etc/shadow``` 中找到**vcs-user**的哪一行。修改第二列(密码列)为空,或者**NP**。

- ```/etc/passwd``` 中找到**vcs-user**的哪一行。修改```/bin/false```为```/bin/sh```。

四、配置SSHD端口

> [ssh](http://www.cnblogs.com/CGDeveloper/archive/2011/07/27/2118533.html)

- ssh version

```
$ ssh -V
OpenSSH_6.6.1p1 Ubuntu-2ubuntu2.8, OpenSSL 1.0.1f 6 Jan 2014
```

Phabricator运行的服务器系统中 sshd 的版本 必须高于 **6.2**

- port

默认为**22**

1) create ```phabricator-ssh-hook.sh``` in **/usr/libexec/phabricator-ssh-hook.sh**

我选择放在 **/etc/ssh/shell** 中

```
#!/bin/sh

# NOTE: Replace this with the username that you expect users to connect with.
VCSUSER="vcs-user"

# NOTE: Replace this with the path to your Phabricator directory.
ROOT="/var/www/phabricator"

if [ "$1" != "$VCSUSER" ];
then
  exit 1
fi

exec "$ROOT/bin/ssh-auth" $@
```
创建完脚本后，需要把脚本和它的父文件夹所有者改为 **root**，并且赋予脚本 **755** 权限

```
sudo chown root /etc/ssh/shell
sudo chown root /etc/ssh/shell/phabricator-ssh-hook.sh
sudo chmod 755 /etc/ssh/shell/phabricator-ssh-hook.sh
```

2) Create ```sshd_config```

在 **/etc/ssh** 中创建文件名类似 ```sshd_config.phabricator``` 的文件

```
$ pwd
/etc/ssh
$ sudo vi sshd_config.phabricator
```

文件内容如下, 此处配置端口号为 ```2222```

If you plan to connect to a port other than 22, you should set this port as diffusion.ssh-port in your Phabricator config:

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




