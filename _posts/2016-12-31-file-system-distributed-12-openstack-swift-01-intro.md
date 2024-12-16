---
layout: post
title: 分布式存储系统-12-openstack swift-01-intro 入门介绍
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---


OpenStack Swift
===============

.. image:: https://governance.openstack.org/tc/badges/swift.svg 
    :target: https://governance.openstack.org/tc/reference/tags/index.html 

.. 从这一点开始改变事情

OpenStack Swift是一个分布式对象存储系统，旨在从单一机器扩展到数千台服务器。Swift针对多租户和高并发进行了优化。Swift非常适合备份、Web和移动内容，以及任何其他无限制增长的非结构化数据。

Swift提供了一个简单的、基于REST的API，完整文档请访问 https://docs.openstack.org/swift/latest/。

Swift最初是作为Rackspace Cloud Files的基础开发的，并于2010年作为OpenStack项目的一部分开源。自那以后，它已经发展成为包括许多公司的贡献，并催生了一个繁荣的第三方工具生态系统。Swift的贡献者名单列在AUTHORS文件中。

文档
----

要构建文档，请运行：

    pip install -r requirements.txt -r doc/requirements.txt
    sphinx-build -W -b html doc/source doc/build/html

然后浏览至doc/build/html/index.html。这些文档在每次提交后自动生成，并可在 https://docs.openstack.org/swift/latest/ 在线获取。

开发者
--------------

入门
~~~~~~~~~~~~~~~

Swift是OpenStack的一部分，遵循所有OpenStack项目通用的代码贡献、审查和测试流程。

如果你想开始贡献，请查看这些 `笔记 <CONTRIBUTING.rst>`__ 以帮助你开始。

最好从 `"SAIO - Swift All In One" <https://docs.openstack.org/swift/latest/development_saio.html>`__ 开始。这份文档将指导你在VM中设置Swift的开发集群。SAIO环境非常适合对Swift进行小规模测试以及尝试新功能和修复bug。

测试
~~~~~

Swift的源代码树中包括三种类型的测试。

#. 单元测试
#. 功能测试
#. 探测测试

单元测试检查代码的一小部分是否正常工作。例如，单元测试可能会测试一个单一的函数，以确保不同的输入给出预期的输出。这验证了代码的正确性，并且没有引入回归。

功能测试检查客户端API是否按预期工作。这些可以针对任何声称支持Swift API的端点运行（尽管一些测试需要具有不同权限级别的多个账户）。这些是“黑盒”测试，确保针对Swift编写的客户端应用程序将继续工作。

探测测试是“白盒”测试，验证Swift集群的内部工作。它们是针对 `"SAIO - Swift All In One" <https://docs.openstack.org/swift/latest/development_saio.html>`__ 开发环境编写的。例如，探测测试可能会创建一个对象，删除一个副本，并确保后台一致性进程发现并纠正错误。

你可以使用 ``.unittests`` 运行单元测试，使用 ``.functests`` 运行功能测试，使用 ``.probetests`` 运行探测测试。还有一个额外的 ``.alltests`` 脚本包装其他三个。

要完全运行测试，目标环境必须使用支持大型xattrs的文件系统。强烈推荐使用XFS。对于单元测试和进程内功能测试，要么将 ``/tmp`` 挂载为XFS，要么通过 ``TMPDIR`` 环境变量提供另一个XFS文件系统。如果没有这个设置，测试应该仍然通过，但是会跳过很多。

代码组织
~~~~~~~~~~~~~~~~~

-  doc/: 文档
-  etc/: 样本配置文件
-  examples/: 在文档中使用的配置片段
-  swift/: 核心代码

   -  account/: 账户服务器
   -  cli/: 支持一些CLI工具的代码
   -  common/: 不同模块共享的代码

      -  middleware/: “标准”的、官方支持的中间件
      -  ring/: 实现Swift环的代码

   -  container/: 容器服务器
   -  locale/: 国际化（翻译）数据
   -  obj/: 对象服务器
   -  proxy/: 代理服务器

-  test/: 单元测试、功能测试和探测测试

数据流
~~~~~~~~~

Swift是一个WSGI应用程序，使用eventlet的WSGI服务器。进程运行后，新请求的入口点是 ``swift/proxy/server.py`` 中的 ``Application`` 类。从那里，选择一个控制器，处理请求。代理可能会选择将请求转发到后端服务器。例如，对象服务器请求的入口点是 ``swift/obj/server.py`` 中的 ``ObjectController`` 类。

部署者
-------------

部署者文档也可在 https://docs.openstack.org/swift/latest/ 查阅。一个很好的起点是 https://docs.openstack.org/swift/latest/deployment_guide.html。有一个 `运维手册 <https://docs.openstack.org/swift/latest/ops_runbook/index.html>`__，提供了如何在运行Swift集群时诊断和解决常见问题的信息。

你可以使用 ``.functests`` 对Swift集群运行功能测试。这些功能测试需要 ``/etc/swift/test.conf`` 才能运行。这个源代码树中的样本配置文件可以在 ``test/sample.conf`` 中找到。

客户端应用
---------------

对于客户端应用程序，官方提供了Python语言绑定，在 https://opendev.org/openstack/python-swiftclient。

完整的API文档在 https://docs.openstack.org/api-ref/object-store/。

有一个庞大的应用程序和库的生态系统支持并与OpenStack Swift合作。一些列在 `相关项目 <https://docs.openstack.org/swift/latest/associated_projects.html>`__ 页面上。

--------------

更多信息，请来OFTC的#openstack-swift频道交流。

谢谢，

Swift开发团队




# 参考资料

https://github.com/openstack/swift

* any list
{:toc}