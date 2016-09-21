---
layout: post
title: Phabricator
date:  2016-09-21 22:28:40 +0800
categories: [Tools]
tags: [phabricator]
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




