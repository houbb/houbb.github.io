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


## Installing Required Components



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



```
$ git clone https://github.com/phacility/libphutil.git
$ git clone https://github.com/phacility/arcanist.git
$ git clone https://github.com/phacility/phabricator.git
```

then

```
houbinbindeMacBook-Pro:phabricator houbinbin$ pwd
/Users/houbinbin/IT/anybuy/phabricator
houbinbindeMacBook-Pro:phabricator houbinbin$ git clone https://github.com/phacility/libphutil.git
Cloning into 'libphutil'...
remote: Counting objects: 14006, done.
remote: Compressing objects: 100% (104/104), done.
```


##  Configuring Apache

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

- restart the Apache and you can see

![phabricator]({{site.url}}/static/app/img/2016-09-22-phabricator.png)


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

![phabricator]({{site.url}}/static/app/img/2016-09-22-phabricator-visit.png)


# Install in Ubuntu

If you are installing on Ubuntu, there are install scripts available which should handle most of the things discussed in this document for you:

> [install_ubuntu.sh](https://secure.phabricator.com/diffusion/P/browse/master/scripts/install/install_ubuntu.sh)

> [install zh_CN](https://my.oschina.net/yoyoko/blog/126325)

> [install zh_CN](http://www.linuxdiyf.com/linux/16060.html)

## install_ubuntu.sh

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

## Config Apache


- some commands

```
$   /etc/init.d/apache2 start
$   /etc/init.d/apache2 restart
$   /etc/init.d/apache2 stop
```

> [config apache](http://www.oschina.net/question/191440_125562)

> [ubuntu apache ch_ZN](http://www.cnblogs.com/ylan2009/archive/2012/02/25/2368028.html)


- add

```
LoadModule rewrite_module libexec/apache2/mod_rewrite.so
LoadModule php5_module libexec/apache2/libphp5.so
```

- edit ```apache2.conf```

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

## 403

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


## Config mysql

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

## Install in Windows

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

```
Path：export PATH="$PATH:/somewhere/arcanist/bin/"
Edit：（mac建议用vi）：arc set-config editor "/usr/bin/vi"
Addr：arc set-config default http://www.XXX.com/
Cred：yourproject/ $ arc install-certificate
```

- test

```
$   arc help
```


## Relative commands

```
arc diff：发送代码差异（review request）到Differental功能
arc list：限时未提交的代码信息
arc branch [branch name]：创建并checkout分支
arc land [branch name]：代码审核通过后，合并主分支
arc tasks：展示当前任务
```



# Issues

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

```
post_max_size = 32M
```

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








