---
layout: post
title:  Ubuntu Phabricator
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, devops]
published: true
---

* any list
{:toc}


# 部署

大部分操作都需要root权限,建议切换至超级管理员操作。



- cd ```/var/www/```

- 运行此 shell 脚本


```
#!/bin/bash

confirm() {
  echo "Press RETURN to continue, or ^C to cancel.";
  read -e ignored
}

GIT='git'

LTS="Ubuntu 10.04"
ISSUE=`cat /etc/issue`
if [[ $ISSUE != Ubuntu* ]]
then
  echo "This script is intended for use on Ubuntu, but this system appears";
  echo "to be something else. Your results may vary.";
  echo
  confirm
elif [[ `expr match "$ISSUE" "$LTS"` -eq ${#LTS} ]]
then
  GIT='git-core'
fi

echo "PHABRICATOR UBUNTU INSTALL SCRIPT";
echo "This script will install Phabricator and all of its core dependencies.";
echo "Run it from the directory you want to install into.";
echo

ROOT=`pwd`
echo "Phabricator will be installed to: ${ROOT}.";
confirm

echo "Testing sudo..."
sudo true
if [ $? -ne 0 ]
then
  echo "ERROR: You must be able to sudo to run this script.";
  exit 1;
fi;

echo "Installing dependencies: git, apache, mysql, php...";
echo

set +x

sudo apt-get -qq update
sudo apt-get install \
  $GIT mysql-server apache2 dpkg-dev \
  php5 php5-mysql php5-gd php5-dev php5-curl php-apc php5-cli php5-json

# Enable mod_rewrite
sudo a2enmod rewrite

HAVEPCNTL=`php -r "echo extension_loaded('pcntl');"`
if [ $HAVEPCNTL != "1" ]
then
  echo "Installing pcntl...";
  echo
  apt-get source php5
  PHP5=`ls -1F | grep '^php5-.*/$'`
  (cd $PHP5/ext/pcntl && phpize && ./configure && make && sudo make install)
else
  echo "pcntl already installed";
fi

if [ ! -e libphutil ]
then
  git clone https://github.com/phacility/libphutil.git
else
  (cd libphutil && git pull --rebase)
fi

if [ ! -e arcanist ]
then
  git clone https://github.com/phacility/arcanist.git
else
  (cd arcanist && git pull --rebase)
fi

if [ ! -e phabricator ]
then
  git clone https://github.com/phacility/phabricator.git
else
  (cd phabricator && git pull --rebase)
fi

echo
echo
echo "Install probably worked mostly correctly. Continue with the 'Configuration Guide':";
echo
echo "    https://secure.phabricator.com/book/phabricator/article/configuration_guide/";
echo
echo "You can delete any php5-* stuff that's left over in this directory if you want.";
```




- run shell

```
$   sudo chmod +x install_ubuntu.sh
$   sudo ./install_ubuntu.sh
```

# Config apache

- edit ```/etc/apache2/apache2.conf```

```
# set for phabricator
ServerName 127.0.0.1

<Directory "/var/www/phabricator/webroot">
  Require all granted
</Directory>
```


- add ```/etc/apache2/httpd.conf```

```
<VirtualHost *>
  # Change this to the domain which points to your host.
  ServerName 127.0.0.1

  # Change this to the path where you put 'phabricator' when you checked it
  # out from GitHub when following the Installation Guide.
  #
  # Make sure you include "/webroot" at the end!
  DocumentRoot /var/www/phabricator/webroot

  RewriteEngine on
  RewriteRule ^(.*)$          /index.php?__path__=$1  [B,L,QSA]
</VirtualHost>


<Directory "/var/www/phabricator/webroot">
  Require all granted
</Directory>
```


- restart apache

```
sudo /etc/init.d/apache2 restart
```


# Config mysql

无法写数据,请使用root权限

```
/var/www/phabricator/bin/config set mysql.host localhost
/var/www/phabricator/bin/config set mysql.port 3306
/var/www/phabricator/bin/config set mysql.user root
/var/www/phabricator/bin/config set mysql.pass ****
```

更新

```
/var/www/phabricator/bin/storage upgrade
```


# More...



