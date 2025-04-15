---
layout: post
title: test framework-03-MeterSphere  快速开始
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, framework, open-source, plateform, test]
published: true
---

# 快速开始

```sh
sudo docker run -d -p 8081:8081 --name=metersphere -v ~/.metersphere/data:/opt/metersphere/data cr2.fit2cloud.com/metersphere/metersphere-ce-allinone

# 用户名: admin
# 密码: metersphere
```

## 查看 WSL ip

```sh
$ ifconfig
docker0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
        xxx

eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1492
        inet 172.24.20.97  netmask 255.255.240.0  broadcast 172.24.31.255
        xxx
```

## windows 浏览器访问

浏览器直接访问：

> [http://172.24.20.97:8081/#/login](http://172.24.20.97:8081/#/login)

# 一些建议

缺失了一些流程的控制？ LOOP/IF/FINALLY/

覆盖率

插件化市场：各种 grovvy/js/shell/sql 脚本？

数据源管理：插件化？

参数的管理：系统参数、环境参数、单步参数。

UI 测试

性能测试

测试数据的度量

资源的调度管理？

# 参考资料

https://github.com/metersphere/metersphere

* any list
{:toc}