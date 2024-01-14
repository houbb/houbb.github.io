---
layout: post
title:  Apache Hadoop v3.3.6-15-Rack Awareness
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# Rack Awareness

当Hadoop组件具有机架感知功能时，例如HDFS块放置将使用机架感知来实现容错，通过在不同机架上放置一个块副本来提高数据的可用性，以应对集群中的网络交换机故障或分区。

Hadoop主节点通过调用配置文件指定的外部脚本或Java类来获取集群工作节点的机架ID。

无论是使用Java类还是外部脚本进行拓扑映射，输出必须符合Java的`org.apache.hadoop.net.DNSToSwitchMapping`接口的格式。

该接口期望保持一对一的对应关系，并以'/myrack/myhost'的格式提供拓扑信息，其中'/'是拓扑定界符，'myrack'是机架标识符，而'myhost'则是个体主机。假设每个机架有一个/24子网，可以使用'/192.168.100.0/192.168.100.5'的格式作为独特的机架-主机拓扑映射。

要使用Java类进行拓扑映射，需要在配置文件中指定类名，该类名由`net.topology.node.switch.mapping.impl`参数指定。Hadoop分发中包含了一个名为NetworkTopology.java的示例，可以由Hadoop管理员进行定制。与在新的工作节点注册时无需分叉外部进程相比，使用Java类而不是外部脚本具有性能优势。

如果实施外部脚本，它将由配置文件中的`net.topology.script.file.name`参数指定。与Java类不同，外部拓扑脚本未随Hadoop分发一起提供，而由管理员提供。Hadoop将在分叉拓扑脚本时将多个IP地址发送到ARGV。控制发送到拓扑脚本的IP地址数量的参数是`net.topology.script.number.args`，默认为100。如果将`net.topology.script.number.args`更改为1，拓扑脚本将为DataNodes和/或NodeManagers提交的每个IP地址分叉。

如果未设置`net.topology.script.file.name`或`net.topology.node.switch.mapping.impl`，则对于任何传递的IP地址，都将返回机架ID`/default-rack`。

尽管这种行为似乎是可取的，但它可能会导致HDFS块复制出现问题，因为默认行为是将一个复制块写到机架外，而由于只有一个名为`/default-rack`的机架，无法实现这一点。

## python Example

```python
#!/usr/bin/python3
# this script makes assumptions about the physical environment.
#  1) each rack is its own layer 3 network with a /24 subnet, which
# could be typical where each rack has its own
#     switch with uplinks to a central core router.
#
#             +-----------+
#             |core router|
#             +-----------+
#            /             \
#   +-----------+        +-----------+
#   |rack switch|        |rack switch|
#   +-----------+        +-----------+
#   | data node |        | data node |
#   +-----------+        +-----------+
#   | data node |        | data node |
#   +-----------+        +-----------+
#
# 2) topology script gets list of IP's as input, calculates network address, and prints '/network_address/ip'.

import netaddr
import sys
sys.argv.pop(0)                                                  # discard name of topology script from argv list as we just want IP addresses

netmask = '255.255.255.0'                                        # set netmask to what's being used in your environment.  The example uses a /24

for ip in sys.argv:                                              # loop over list of datanode IP's
    address = '{0}/{1}'.format(ip, netmask)                      # format address string so it looks like 'ip/netmask' to make netaddr work
    try:
        network_address = netaddr.IPNetwork(address).network     # calculate and print network address
        print("/{0}".format(network_address))
    except:
        print("/rack-unknown")                                   # print catch-all value if unable to calculate network address
```

## bash Example

```bash
#!/usr/bin/env bash
# Here's a bash example to show just how simple these scripts can be
# Assuming we have flat network with everything on a single switch, we can fake a rack topology.
# This could occur in a lab environment where we have limited nodes,like 2-8 physical machines on a unmanaged switch.
# This may also apply to multiple virtual machines running on the same physical hardware.
# The number of machines isn't important, but that we are trying to fake a network topology when there isn't one.
#
#       +----------+    +--------+
#       |jobtracker|    |datanode|
#       +----------+    +--------+
#              \        /
#  +--------+  +--------+  +--------+
#  |datanode|--| switch |--|datanode|
#  +--------+  +--------+  +--------+
#              /        \
#       +--------+    +--------+
#       |datanode|    |namenode|
#       +--------+    +--------+
#
# With this network topology, we are treating each host as a rack.  This is being done by taking the last octet
# in the datanode's IP and prepending it with the word '/rack-'.  The advantage for doing this is so HDFS
# can create its 'off-rack' block copy.
# 1) 'echo $@' will echo all ARGV values to xargs.
# 2) 'xargs' will enforce that we print a single argv value per line
# 3) 'awk' will split fields on dots and append the last field to the string '/rack-'. If awk
#    fails to split on four dots, it will still print '/rack-' last field value

echo $@ | xargs -n 1 | awk -F '.' '{print "/rack-"$NF}'
```

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/RackAwareness.html

* any list
{:toc}