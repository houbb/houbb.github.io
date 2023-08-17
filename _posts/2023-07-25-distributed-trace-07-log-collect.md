---
layout: post
title: 分布式链路追踪-07-log collect 日志收集器
date:  2023-07-25 +0800
categories: [Trace]
tags: [trace, distributed, sh]
published: true
---

# 第三方测评开源日志采集器

日志采集是整个日志基础设施中最基础最关键的组件之一，影响着企业内部数据的完整性以及实时性。

采集器作为数据链路的前置环节，其可靠性、扩展性、灵活性以及资源（CPU 和内存）消耗等，往往是最被关注的核心技术点。

目前开源的日志采集器比较多。各采集器官网上关于其产品特性的描述也都比较相似，基本上都包括日志搜集、转换、路由等功能，并且无一例外都会突出其为高性能而设计。如果单纯看产品文档，其实很难在前面提到的核心技术点上得出有区分度的结论，若直接在生产环境上使用，则无疑是高压线上走钢丝。

我所在的公司作为一家通信与信息服务类公司，线上存在海量日志采集的场景，对于采集效率要求极高。

前段时间阿里将内部大规模部署的采集引擎 ilogtail 对外开源，其列举的性能数据和技术细节吸引了我的注意。

但是如果在外部社区使用，其具体的性能数据如何。

本文将 ilogtail 与其他四款广泛使用的日志采集器：filebeat（go 语言）、vector（rust 语言）、fluent-bit（c 语言）、rsyslog（c 语言）进行对比测试，重点关注他们在可靠性、采集、转换性能、以及功能上的差异。

# 前置说明

软件版本说明：

ilogtail（社区版 v1.1.1）、filebeat（v8.4.2）、vector（v0.24.1）、fluent-bit（v1.9.9）、rsyslog（v8）

数据源说明：

一般采集器的输入数据源都是以插件的形式提供，除了我们常见的日志文件以外，也会有其他形式，如 http、docker logs、kafka 等等。

在后文的对比中，我们的输入数据源统一采用最常见的日志文件形式，日志数据由 MockLog 程序统一生成。

# 可靠性对比

首先我们梳理一下各采集器产品文档中针对可靠性的承诺。

作为一个合格的采集器，实现上首先应当考虑：

**在数据异步发送的过程中，若发生进程重启或进程异常退出的情况下，采集器能否沿着之前的采集点位继续运行，并保证数据完整**。

经过查询各家采集器的文档，五种采集器都有不同的 checkpoint 机制实现。

在传输语义上，filebeat、vector 明确提出可以做到 At-least-Once 语义。

商业版的 ilogtail 结合服务端（loghub）针对重复数据的拒绝机制，可以做到 ExactlyOnce 语义。fluent-bit 会将查询的点位实时保存在 sqllite 中。rsyslog 实现稍微简单，仅提供指定行数保存（PersistStateInterval 控制）或进程退出时持久化中间状态到文件。

在文件唯一标识的识别上，ilogtail、vector、rsyslog 除了利用 inode 和 dev 组合标识文件外，也将文件前若干行的 hash 值作为文件指纹。针对文件轮转的两种模式：create 和 copytrucate，不同的采集器也有不同的策略，其中从文档描述看 filebeat 做得最差。但是经过实际测试对比，filebeat 的实际表现和文档描述并不一致，其针对日志轮转的场景也做了兼容实现。

在可靠性对比部分，我们放弃一些边界场景验证，如系统资源不足、sink 阻塞等。

为了比较方便的校验结果，我们采用 file to file 的形式，构建了四种常见的场景：进程正常退出、进程异常终止、日志轮转、配置在线升级，每轮都会多次比较生产和消费目录中日志文件的行数是否一致。

## 进程正常退出

测试描述

先启动采集器，然后启动 mock-log 将日志数据写入同一文件，采集器消费此文件将日志写入另一个文件。一段时间后，向采集进程发送 TERM 信号，再启动采集器，反复操作几次后，最后保留采集进程持续消费，结束掉 mock-log 进程。统计源日志和目标日志的行数是否一致。

其中进程 kill 的命令如下:

```sh
#!/bin/bash
ps -ef |  grep -v grep | grep ilogtail | awk '{print $2}' | xargs -I {} kill -s TERM {} &
ps -ef |  grep -v grep | grep vector | awk '{print $2}' | xargs -I {} kill -s TERM {}  &
ps -ef |  grep -v grep | grep filebeat | awk '{print $2}' | xargs -I {} kill -s TERM {}  &
ps -ef |  grep -v grep | grep fluent-bit| awk '{print $2}' | xargs -I {} kill -s TERM {}  &
ps -ef |  grep -v grep | grep rsyslogd| awk '{print $2}' | xargs -I {} kill -s TERM {}  &
wait
```

进程正常退出时，各采集器的结果和预期全都一致。

## 图片 进程异常终止

先启动采集器，然后启动 mock-log 将日志数据写入同一文件，采集器消费此文件将日志写入另一个文件。

一段时间后，直接 kill 掉采集进程，再启动采集器，最后结束掉 mock-log 进程。

统计源日志和目标日志的行数是否一致。

其中 kill 进程的命令如下

```sh
#!/bin/bash
ps -ef |  grep -v grep | grep ilogtail | awk '{print $2}' | xargs -I {} kill -9  {} &
ps -ef |  grep -v grep | grep vector | awk '{print $2}' | xargs -I {} kill -9 {}  &
ps -ef |  grep -v grep | grep filebeat | awk '{print $2}' | xargs -I {} kill -9 {}  &
ps -ef |  grep -v grep | grep fluent-bit | awk '{print $2}' | xargs -I {} kill -9 {}  &
ps -ef |  grep -v grep | grep rsyslogd| awk '{print $2}' | xargs -I {} kill -9 {}  &
wait
```

测试结果：

![测试结果](https://mmbiz.qpic.cn/mmbiz_png/vz1ttk8KwbQUMIRzflI6ukryeDbqodnzaetPwUTuAMOW5B0Hg1B0pXNfs157ic81koR8gOo0frmhMTfqZsciaV0w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

rsyslog 默认只会在进程正常退出时，才会将采集中间状态保存到本地文件。如果进程异常退出，由于采集点位还是上上一轮的 offset，因此会丢失上一轮的采集点位，再次重复消费上一轮数据。当然也可以通过 PersistStateInterval 参数（按采集行数持久状态）调节，但依然会出现少量重复数据。

ilogtail 社区版目前有两种 checkpoint 机制：

第一种是在配置更新、进程退出或定时器触发时，将包含 offset 的 checkpoint 写入到本地文件。对于 flusher_sls，在进程正常结束时，将内存队列中的数据写入本地磁盘文件，具体代码可以参考（附1）。对于其他 flusher 由各 flusher 实现的 stop 函数负责，stop 函数执行结束后，进程才会退出。

另一种 checkpoint 的实现，结合后端去重实现 ExactlyOnce 语义。单就客户端而言，根据 sender 的反馈设置 commit 状态位，将包含文件读偏移 offset、文件读大小的 checkpoint 写入本地存储。对于发送失败的数据，其 commit 状态是未提交，在下一次事件触发时进行采集回放。

基于前面 ilogtail 的 checkpoint 机制描述，其默认的 checkpoint 机制（前面讲述的第一种）在进程异常退出时，来不及保留 offset，部分数据处于各级处理器的内存队列中，因此会出现丢失采集点位，重复消费上一轮数据的情况。
fluent-bit 在这一块做的最好，多次测试下数据均一致。研究 fluent-bit 的文档后发现，fluent-bit 使用 SQLite 来实现 checkpoint。用户需要配置 Tail 输入插件的 DB 参数，来实现高可靠性的 checkpoint（若不配置该参数，则每次重启都会从头读取文件）。fluent-bit 使用 sqlite 数据库，默认使用预写式日志模式（WAL）和 NORMAL 同步方法，确保 checkpoint 及时同步，更支持崩溃后状态恢复，所以能够保证进程异常退出后，下次重启时准确定位上次的采集点位。

##  日志轮转

### 1、create 模式

create 模式是日志库最常见采用的模式，比如本文中日志生成程序 mock-log 依赖的日志库 seelog 就是这种模式。

这种模式需通知正在输出日志的进程或线程重新打开日志文件。

当发生日志轮转时，将当前正在输出的日志文件重命名（inode 未变），再新建一个和原日志文件同名的文件（新文件 inode 改变），后续都会写这个新文件。写日志的线程感知到变化后，会重新打开新文件，以便于重新获得新文件的 inode，继续追加写。

测试描述

先启动采集器，然后运行 file_rotate_create.sh 脚本（模拟 logrotate 的 create 模式），统计数据源目录的日志行数和 sink 目录的日志行数是否一致。

其中 file_rotate_create.sh 脚本如下：

```sh
#!/bin/bash
./mock_log -log-type=nginx  -path="/home/aivin/mock/mock-log/access.log" -stdout=false -total-count=1000  -logs-per-sec=500
sleep 5
mv /home/aivin/mock/mock-log/access.log /home/aivin/mock/mock-log/access.log.0
echo "New file line" >> /home/aivin/mock/mock-log/access.log
echo "Last line" >> /home/aivin/mock/mock-log/access.log.0
```

### 2、copytrucate 模式

copytrucate 是 logrotate 使用的模式之一，这种模式会直接截断日志，无需通知写日志进程。当发生日志轮转时，把正在输出的日志拷（copy）一份出来（copy 出来的新文件 inode 改变），再清空（trucate）原来的日志（原文件 inode 未变）。因为清空文件只把文件的内容删除了，而 inode 并没改变，后续日志的输出仍然写入该文件中。此模式的优点是无需通知日志进程或线程，但会影响日志的完整性。由于 copy 和 trucate 操作是非事务的，在 trucate 步骤会删掉两个步骤间隙的日志。

测试描述

先启动采集器，然后运行 file_rotate_truncate.sh 脚本（模拟 logrotate 的 copytrucate 模式），统计数据源目录的日志行数和 sink 目录的日志行数是否一致。

其中 file_rotate_truncate.sh 脚本如下：

```sh
#!/bin/bash
./mock_log -log-type=nginx  -path="/home/aivin/mock/mock-log/access.log" -stdout=false -total-count=1000  -logs-per-sec=500
sleep 5
cp /home/aivin/mock/mock-log/access.log /home/aivin/mock/mock-log/access.log.0
truncate -s 0 /home/aivin/mock/mock-log/access.log
echo "New file line" >> /home/aivin/mock/mock-log/access.log
echo "Last line" >> /home/aivin/mock/mock-log/access.log.0
```

测试结果：

![测试结果：](https://mmbiz.qpic.cn/mmbiz_png/vz1ttk8KwbQUMIRzflI6ukryeDbqodnzsGeFeJQA48ML3NvDhVJ8ffPH18YiafiabjShW2icK0PXDTC3DqKvFzoSw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 4、轮转文件出现覆盖

先启动采集器，再启动 mock log，使其每秒生成 5000 行日志，每间隔 6 秒生成一个新的文件，预期生成 10 个文件，30 万行日志，其中 4 个文件因轮转被删除。统计 sink 目录的日志行数是否也是 30 万行。
其中 mocklog 的执行命令如下：

```sh

./mock_log -log-type=nginx  -path="/home/aivin/mock/mock-log/access.log" -stdout=false -total-count=300000  -log-file-size=8850000   -log-file-count=5   -logs-per-sec=5000
```

测试结果都是一致的。

此轮实验的实验结果完全符合前面 create 模式的结论预期。

那如果是把前面生成文件的间隔改成 1 秒， 即每秒生成 5000 行日志，一秒生成一个文件，总共生成 5 万行，多次实验的结果又是如何呢？

![result](https://mmbiz.qpic.cn/mmbiz_png/vz1ttk8KwbQUMIRzflI6ukryeDbqodnzRwfpGIHeKcymDYEic1t4kViaSfuouagAyUrsK1rJHI8UnO8Uzicib3Kficg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 配置热升级

测试描述

先启动采集器，然后修改配置。修改的配置有两处变动，第一是增加新的采集路径，第二是增加新的 output 方式，最后启动 mock-log 向新的采集路径写入定量的日志。

验证修改配置后的增量数据是否与预期一致。 

测试结果

![配置热升级](https://mmbiz.qpic.cn/mmbiz_png/vz1ttk8KwbQUMIRzflI6ukryeDbqodnzsKg92ibX1rxGrjxJcAfXOB8ZUib13mMjzXSmcf2RcUbPCgale7CibEpxA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

# 性能对比

为了对比大流量下的日志采集性能，这里使用的是 file to kafka 的方式。我们将所有的组件制作成镜像，在 k8s 集群上部署。测试时，会启动多个 mock log 程序的 pod，同时向双磁盘写文件。采集器同时监听映射到主机目录中的多个日志文件，实时地将日志数据异步写入到远程的 kafka。这里以 CMak 针对 topic 的监控指标 Producer Message/Sec 作为实验的结果数据，同时会观察采集进程的 cpu 和内存变化。

下面说明一下资源部署情况：

宿主机配置：24 核 92G 内存 4 个 HDD 盘

kafka镜像配置：3 Brokers，每个采集器分配独立的 topic（8 分区 2 副本）。kafka 节点以 deamon set 的形式部署在不同的宿主机上。

mock log 和采集器部署：两者打包成镜像后，部署在同一台宿主机上。mock log 会启动多个 pod，每个 pod 写独立的日志文件，并将日志文件映射到主机目录。采集器的镜像会将日志映射到镜像内部以供读取。为了提高源日志的吞吐量，mock log 会向两块独立的磁盘写日志。

如果未特别说明，各采集器的配置请参考（附2）的 filetokafka 子目录。nginx 对应单行日志、java 对应多行日志。
压测的操作顺序：先还原环境，再开启采集器，最后启动指定数量的 mock log 程序。

## 1、未开启资源上限

测试描述
这里的未开启资源上限指的是未设置采集器容器的 CPU 和内存资源上限。此环节主要是为了对比采集器的能力上限。

在此环节，我们会用 mock log 生成单行 nginx 日志，模拟 10M/s，20M/s，50M/s，100M/s 不同等级流量下，对比采集器的发送速率以及 cpu、内存变化。
mock log 的公共参数如下：

```sh
-log-type=nginx -stdout=false -total-count=1000000000 -log-file-size=10000000000 -log-file-count=10
```

所有采集器发送 kafka 的参数统一是：snappy 压缩，ack 设置为 1（ilogtail 的flusher_kafka 社区代码不支持，这里对其进行修改）。

另外对 ilogtail，我们设置环境变量：cpu_usage_limit = 9，mem_usage_limit = 4096
测试结果
下面模拟数据的单行日志大小在 290B 左右

![性能](https://mmbiz.qpic.cn/mmbiz_png/vz1ttk8KwbQUMIRzflI6ukryeDbqodnzVuWKcLpdOpbxibpicwEMxInguBuW48CS1Ik4nJyhU3CeNuhtJdQBuKwA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

从测试结果我们可以看到，ilogtail 的采集速率最快，上限值也非常高，大部分场景和文件写入速度持平，资源消耗也相对偏高。

rsyslog 的采集速率其次，其资源占用一直比较平稳。而 filebeat 在采集速率和资源占用上都不占优势。

当日志的生产速率达到 40W/s 时，各个采集器均出现很明显的采集延迟，采集性能出现下降。

由于采集器和 mock 程序部署在同一个主机上，采集性能的下降也和机器的压力有关。由于数据不准确，故不作展示。

## 2、开启资源上限

测试描述

这里的开启资源上限指的是设置采集器容器的 CPU 和内存资源上限。此环节主要是为了对比资源受限情况下，采集器的能力上限。

由于 ilogtail 有资源超限处理策略，最初的测试流程中没有找到比较好的参数控制资源消耗的方法，导致容器每间隔 5 分钟就会重启一次，极大影响测试稳定性。

这里我们将 ilogtail 代码中关于此策略的逻辑屏蔽掉，重新编译，让采集进程不会主动退出。

其他参数的配置和上一个环节测试一致。

在此环节中，我们会用以 20W/s 的速度模拟生成单行的 nginx 日志，分别对比采集器在 1C1G 和 2C1G 的能力上限。

测试结果

下面的测试结果是 20W/s 的日志生产速度的对比：

![性能](https://mmbiz.qpic.cn/mmbiz_png/vz1ttk8KwbQUMIRzflI6ukryeDbqodnzu31vUegI88x4Via8qUPgMaFZHI9nqfOclLCJNVyCQ7vUOZ4ibKs8H6Rg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

从测试结果看：开启资源限制后，ilogtail 的采集速率表现最好。

测试过程中，fluentbit 的 cpu 偶尔会出现上下波动，可以看到资源消耗收到自身反压的控制。

需要补充的是，1c1g 场景下，由于 ilogtail 的 kafka 插件使用的库版本过低，初始速率会比较慢，从 0 开始缓慢加速，大约在 5 分钟后达到采集速率的峰值，该问题 ilogtail 社区中已经有同学在讨论升级方案。

若将 kafka 改为 SLS，则 1c1g 场景下 ilogtail 的采集速率可以达到 50000 条以上每秒，cpu 消耗仅为 30% 左右。

## 多行日志

多行日志主要为了对比采集器对于复杂加工的数据转换能力。测试中的多行识别借用正则表达式匹配行首的日期时间来做到。

日志中的日期格式如下：

```
[2022-10-09T14:46:30.399951568+08:00]
```

其对应的正则表达式如下：

```
^\[[0-9]{4}-[0-9]{2}-[0-9a-zA-z]+:[0-9]+:[0-9]+\.[0-9]+\+[0-9]+:[0-9]+]\s
```


# 总结

通过前面的对比，相信与直接看官网文档相比，我们对各采集器的优缺点有进一步清晰的印象。

社区版的 ilogtail 性能优势明显，由于刚进入社区开源，当前的可靠性代码和 sls client 耦合在一起。

目前社区的开发计划，此工作已经在 PR 进行中，相信很快就可以解决。

此外，ilogtail 还有加速模式，采用纯 C++ 实现，效率更高，目前仅对 SLS 输出可用，后续可以期待下对接第三方系统。

rsyslog 在采集性能和稳定性上做得足够好，在追求资源和性能平衡的场景是不错的选择。fluent-bit 资源占用率低，可靠性还行，还提供基于 sql 的流式加工能力，但性能不占优势，且不支持配置自动更新，使用细节上问题也比较多。vector 和 filebeat 开源生态好，可靠性上做得也不错，也各自提供表达式语言或脚本加工的能力，不过性能上还有较大的提升空间，适用日志流量规模不大的场景。

目前我们线上使用的是 rsyslog，其性能和效率虽然符合需求，但是由于其渊源古老，很多功能针对 syslog 实现，代码中历史约定非常多，包袱过大。

虽然我们也缝缝补补维护一段时间，但改造的复杂度和故障风险率非常高。由于配置不支持远程管理，且针对一些定制的解析需求改造成本大，也越发变得难以维护。

在日志处理的细节以及拥抱云原生的生态上，相比 ilogtail 差距太远。

后续我们会选择 ilogtail，积极参与社区共建，一起将社区产品打磨得更加成熟。

# 参考资料

[性能与可靠的超强碰撞：第三方测评开源日志采集器](https://mp.weixin.qq.com/s/8mCVk3gvXPOijTlcRjUR_w)

* any list
{:toc}