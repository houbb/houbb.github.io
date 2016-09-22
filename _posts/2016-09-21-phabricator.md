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


# Install

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


# Arcanist

The primary use of arc is to send changes for review in [Differential](https://secure.phabricator.com/book/phabricator/article/differential/)

> [arc](https://secure.phabricator.com/book/phabricator/article/arcanist_diff/)

## Install in Windows

- install git

> [git](https://git-scm.com/)

- install php

1. Download [php](http://www.php.net/) zip

2. Unzip in package, like: ```c:\php```

3. Copy ```c:\phh\php.ini-production```, and renamed to **php.ini**

4. Edit php.ini, remove the ```;``` of following lines

```
; extension_dir = "ext"
;extension=php_mbstring.dll
;extension=php_curl.dll
```

- install components

1. install

```
$   some_install_path/ $ git clone https://github.com/phacility/libphutil.git
$   some_install_path/ $ git clone https://github.com/phacility/arcanist.git
```

2. config

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






