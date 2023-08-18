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

# chat

# Q1-日志采集器 filebeta 的工作流程

很抱歉，截止到我2021年的知识库更新时，我并没有关于 "filebeta" 日志采集器的具体信息。

如果 "filebeta" 是在我知识库更新之后才出现的新工具，我可能还不知道它的详细工作流程。

通常情况下，日志采集器的工作流程如下：

1. **数据源定义**: 首先，需要定义要从哪些数据源采集日志。数据源可以是各种系统、应用程序、服务器等。对于文件日志采集，可以指定要监视的文件路径。

2. **采集器配置**: 配置日志采集器的参数，如采集频率、数据格式等。对于文件日志，可能需要指定文件编码、分隔符等信息。

3. **日志收集**: 采集器根据配置定期或实时地从指定数据源中获取日志数据。对于文件日志，采集器会监视文件变化，并在有新数据写入时将其读取。

4. **数据处理**: 采集到的原始日志数据可能需要进行一些预处理，如解析结构化数据、过滤掉不需要的信息等。

5. **数据存储**: 处理后的日志数据通常会被存储到一个中央存储库，如数据库、数据仓库或日志管理平台。这样可以方便后续的查询、分析和监控。

6. **监控和报警**: 一些日志采集器支持监控功能，可以设置报警规则，以便在特定条件下触发警报，帮助及时发现和处理问题。

7. **数据分析和可视化**: 存储在中央存储库中的日志数据可以用于分析和可视化。通过使用分析工具或可视化工具，可以从日志中提取有价值的信息，进行故障排除、性能优化等工作。

8. **数据归档**: 长期存储对于合规性和审计非常重要。某些日志采集器支持数据归档功能，将旧的日志数据归档到冷存储中，以释放存储空间。

请确保查阅最新的文档或资源，以获取关于 "filebeta" 日志采集器的详细工作流程和操作指南。如果你有其他问题，欢迎随时提问！

# Q2-如何监听文件变更呢？分别给出 java 和 go 的例子

当需要在Java和Go中监听文件变更时，可以使用不同的方法来实现。以下是分别使用Java和Go的示例代码来演示如何监听文件变更：

**在Java中监听文件变更：**

在Java中，可以使用Java的WatchService来监听文件系统的变化。

```java
import java.nio.file.*;

public class FileWatcherExample {
    public static void main(String[] args) throws Exception {
        // 获取文件系统的WatchService
        WatchService watchService = FileSystems.getDefault().newWatchService();

        // 要监听的目录路径
        Path directory = Paths.get("/path/to/directory");

        // 注册监听事件，这里只注册了ENTRY_MODIFY事件
        directory.register(watchService, StandardWatchEventKinds.ENTRY_MODIFY);

        System.out.println("Watching for file changes...");

        while (true) {
            WatchKey key = watchService.take();

            for (WatchEvent<?> event : key.pollEvents()) {
                if (event.kind() == StandardWatchEventKinds.ENTRY_MODIFY) {
                    Path modifiedFile = (Path) event.context();
                    System.out.println("File modified: " + modifiedFile);
                }
            }

            key.reset();
        }
    }
}
```

**在Go中监听文件变更：**

在Go中，可以使用`fsnotify`库来监听文件系统的变化。确保你已经安装了这个库（通过`go get github.com/fsnotify/fsnotify`）。

```go
package main

import (
	"fmt"
	"github.com/fsnotify/fsnotify"
	"log"
)

func main() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	// 要监听的目录路径
	directory := "/path/to/directory"

	err = watcher.Add(directory)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Watching for file changes...")

	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}
			if event.Op&fsnotify.Write == fsnotify.Write {
				fmt.Println("File modified:", event.Name)
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Println("Error:", err)
		}
	}
}
```

上述示例分别演示了如何在Java和Go中监听文件的变更。在实际使用中，你可以根据自己的需求进行适当的修改和扩展。


# Q3-监听到文件变更后，在采集的过程中，如果采集器服务挂了，如何保障重启后继续采集呢？从正确的地方

在文件变更监听和日志采集的过程中，如果采集器服务挂了，你可以采取一些措施来保障重启后能够继续采集并避免丢失数据。

以下是一些建议的做法：

1. **数据持久化和状态记录**：在监听文件变更时，将采集到的数据先进行持久化保存，可以将数据写入到本地文件、数据库或者消息队列中。同时，记录采集的状态，包括已经处理的文件、文件位置等信息，以便在重启后能够从正确的地方继续采集。

2. **异常处理和恢复机制**：在采集过程中，及时捕获异常情况，比如采集器服务崩溃或者与数据存储出现连接问题。在异常发生时，执行相应的恢复机制，例如关闭资源、清理现场，并在服务重新启动后自动触发数据重采集。

3. **数据队列和分批处理**：将采集到的数据放入一个队列中，采用批量处理的方式进行数据上传和存储。如果采集器挂了，队列中的数据不会丢失，而是在采集器重新启动后继续处理队列中的数据。

4. **定期状态检查和自动重启**：实现一个定时的状态检查机制，如果检测到采集器服务挂了，自动触发重启操作。这可以通过监控脚本、守护进程管理工具等方式实现。

5. **监控和报警**：设置监控和报警系统，以便在采集器挂掉或出现异常时及时获得通知，可以手动介入处理或者自动触发恢复机制。

6. **日志记录和追踪**：详细记录采集器的运行日志，包括采集的文件、处理的数据等信息。这有助于后续的故障排查和数据完整性验证。

综合使用上述措施，可以在采集器服务挂了后保障数据的完整性和连续性，确保重启后能够从正确的地方继续采集。

不同的应用场景和需求可能需要不同的策略，建议根据具体情况进行定制化的实现。

# Q4-大批量的日志文件，如何处理呢？使用 kafka + flink 吗

处理大批量的日志文件通常需要一套强大的数据处理架构，Kafka和Apache Flink是流行的工具，可以用来处理这类场景。下面我会解释一下如何使用Kafka和Flink来处理大批量的日志文件：

1. **使用Kafka**：Kafka是一个分布式流处理平台，可以用来收集、存储和传递大量的数据。你可以将日志文件写入Kafka主题，每个主题代表一类日志数据。Kafka具有高吞吐量和持久性的特点，适用于处理大批量的日志数据。

2. **使用Apache Flink**：Flink是一个流处理和批处理框架，可以用来处理实时和离线的数据。对于大批量的日志文件，你可以使用Flink的批处理能力进行数据清洗、转换和分析。Flink还可以从Kafka中消费数据，以实时方式处理流数据。

以下是如何使用Kafka和Flink来处理大批量的日志文件的一般步骤：

**步骤 1：数据采集与Kafka集成**

将日志文件通过适当的采集工具发送到Kafka主题。可以使用各种日志采集工具，如Fluentd、Logstash等。

**步骤 2：Kafka主题与Flink集成**

在Flink中，通过Kafka连接器来消费Kafka中的日志数据。这样，你可以实时地处理从Kafka主题中消费的日志流。

**步骤 3：数据处理与分析**

使用Flink的操作符来执行各种数据处理、清洗、转换和分析操作。你可以实现一系列的Flink任务来处理不同的需求，如数据清洗、日志聚合、异常检测等。

**步骤 4：结果输出与存储**

处理后的数据可以输出到各种目标，如数据库、文件系统、数据仓库等，以供后续的查询和分析使用。

**步骤 5：故障恢复与容错性**

Flink具有很好的容错性，能够处理任务失败、节点故障等情况，确保数据处理的可靠性。

综合使用Kafka和Flink，你可以建立一个强大的数据处理流水线，用于处理大批量的日志文件。

但要注意，配置和管理这样的架构需要一定的专业知识和资源投入。

在选择和实施这些工具时，务必考虑你的业务需求、数据规模以及团队的技术能力。

# Q5-flink 如何处理离线信息？有什么优势

Apache Flink 是一个流处理和批处理框架，它不仅可以处理实时数据流，还可以处理离线的批量数据。

Flink 对于离线信息的处理具有一些优势，下面我会介绍一下 Flink 如何处理离线信息以及其优势：

**Flink 如何处理离线信息：**

Flink 支持将批量数据视为特殊的流数据，这意味着你可以使用相同的 API 和处理模式来处理实时和离线数据。

具体来说，你可以使用 Flink 提供的 DataSet API 来处理离线的批量数据。

在 Flink 中，你可以使用 DataSet API 来定义批处理作业的数据流程，包括数据的转换、聚合、过滤等操作。Flink 会自动进行任务优化和并行执行，以提高批处理作业的性能。

**Flink 处理离线信息的优势：**

1. **统一编程模型**：Flink 提供了统一的编程模型，使得你可以使用相同的 API 处理实时和离线数据。这简化了开发和维护工作，减少了学习成本。

2. **优化的批处理引擎**：Flink 在批处理模式下同样具有优秀的性能。它执行批处理作业时会进行任务优化、并行执行、内存管理等操作，以确保高效的数据处理。

3. **容错性**：Flink 具有强大的容错性，能够应对任务失败和节点故障。这使得在大规模离线数据处理中，能够保障数据处理的可靠性。

4. **丰富的操作符库**：Flink 提供了丰富的操作符库，可以执行多种数据处理操作，如聚合、连接、窗口操作等。这使得你能够很容易地实现复杂的数据分析任务。

5. **灵活的存储和输出**：Flink 支持将离线处理结果输出到各种目标，如数据库、文件系统、消息队列等。这样你可以根据需求选择合适的输出方式。

6. **可伸缩性**：Flink 的批处理引擎也具有良好的可伸缩性，能够适应不同规模的数据集。

总的来说，Flink 作为一个统一的流处理和批处理框架，具有处理离线信息的优势，能够为你提供高性能、容错性强、灵活的离线数据处理解决方案。

# Q6-日志信息，推荐存储到 ES 还是 clickhouse，为什么

选择将日志信息存储到 Elasticsearch（ES）还是 ClickHouse取决于你的具体需求和使用场景。这两个工具在存储和查询大量日志数据方面都有各自的优势，下面我将对它们进行简要的比较，以帮助你做出更合适的选择：

**Elasticsearch (ES):**

优势：
1. **全文搜索和实时查询：** Elasticsearch 是一个分布式搜索和分析引擎，专注于全文搜索和实时查询。如果你需要对日志数据进行全文搜索、模糊匹配和高亮显示等操作，ES是一个不错的选择。
2. **灵活的数据建模：** ES允许你自由定义索引和映射，能够适应多种数据结构的日志数据。
3. **可视化和分析：** ES有丰富的可视化工具，如Kibana，可以帮助你轻松创建仪表盘和图表来分析日志数据。
4. **扩展性：** ES的分布式架构使其具有良好的横向扩展性，适用于处理大量的实时和历史日志数据。

劣势：
1. **存储效率：** 相对于专门的列式存储数据库，ES可能在存储效率方面稍逊一筹，因为它注重灵活性和全文搜索的能力。

**ClickHouse:**

优势：
1. **列式存储：** ClickHouse 是一个高性能的列式数据库，特别适合存储和分析大规模的时间序列数据，包括日志数据。其列式存储结构在存储效率和查询性能方面表现优异。
2. **高性能聚合：** ClickHouse在聚合操作上表现出色，适合进行复杂的聚合查询，例如对日志数据进行汇总和统计。
3. **低延迟：** ClickHouse的查询延迟通常很低，适用于需要快速查询大量数据的场景。

劣势：
1. **不支持全文搜索：** ClickHouse并不专注于全文搜索，如果你需要强调全文搜索功能，ES可能更适合。
2. **较少的可视化和分析工具：** 虽然ClickHouse可以通过各种BI工具进行查询和分析，但它相对于ES来说在可视化和分析方面可能稍显不足。

**选择建议：**

- 如果你主要关注实时全文搜索、可视化和灵活的数据建模，以及对不同结构的日志数据的查询需求，那么 Elasticsearch 是一个不错的选择。

- 如果你需要高性能的大规模数据存储、低延迟的查询和复杂聚合操作，特别是针对时间序列数据，那么 ClickHouse 是一个很好的选项。

最终的决策应该基于你的具体需求、数据量、查询模式、性能要求以及团队的技术能力。

在做决策之前，最好进行一些测试和性能评估，以确保选取的存储方案最适合你的使用场景。

# Q7-列式数据库和时序数据库的介绍对比，哪个更加适合做指标计算？

列式数据库和时序数据库都有各自的特点，可以用于不同的数据处理需求，包括指标计算。

下面我会对这两种类型的数据库进行介绍和比较，以帮助你选择更适合的数据库类型用于指标计算。

**列式数据库：**

列式数据库以列为单位存储数据，每个列都被单独存储，这使得在分析操作时能够提供更好的性能和存储效率。以下是列式数据库的特点：

- **高性能聚合：** 列式数据库在聚合操作上表现出色，对于需要在大量数据上执行复杂聚合函数（如SUM、AVG、COUNT等）的指标计算非常适合。

- **存储效率：** 由于数据按列存储，可以压缩相同类型的数据，从而在存储上具有较高的效率。这对于大规模数据存储和处理是一个优势。

- **复杂查询：** 列式数据库在执行复杂查询时性能较好，尤其是在需要关联多个表或执行多表连接操作时。

**时序数据库：**

时序数据库专门用于存储和查询时间序列数据，这种类型的数据通常是按照时间戳顺序排列的。以下是时序数据库的特点：

- **高性能时间序列查询：** 时序数据库优化了时间序列数据的存储和查询，因此在处理大量时间序列数据时性能优越。

- **时间窗口分析：** 时序数据库通常内置了时间窗口函数，可以方便地执行基于时间窗口的聚合和分析操作，适用于指标计算中的滑动窗口、时间段统计等。

- **存储和索引策略：** 时序数据库通常会采用特定的存储和索引策略，以提高数据的插入和查询性能，尤其适用于连续的时间序列数据。

**适合指标计算的选择：**

- 如果你的主要需求是对大量数据进行复杂的聚合操作，例如在海量数据中计算统计指标、总和、平均值等，那么列式数据库可能更适合，因为它在聚合操作和存储效率方面表现出色。

- 如果你主要关注时间序列数据的存储、查询和分析，尤其是需要执行基于时间窗口的计算，那么时序数据库可能更适合，因为它专门针对时间序列数据进行了优化。

最终的选择应该基于你的数据特点、查询模式、性能要求和团队的技术能力。

在选择数据库类型之前，最好进行一些测试和性能评估，以确保选取的数据库能够满足你的指标计算需求。


# Q8-基于日志的监控和报警，如何实现。

基于日志的监控和报警是一种常见的方法，用于及时发现系统的异常情况和问题。下面是一个基本的实现步骤，以及一些可能的工具和技术，可以帮助你实现基于日志的监控和报警系统：

**步骤 1：日志采集**

首先，你需要将系统的日志数据采集起来，确保你可以获得关于系统运行状态的详细信息。你可以使用日志采集工具，如Logstash、Fluentd、Filebeat等，将日志数据发送到中央存储位置，如Elasticsearch、Log Management平台等。

**步骤 2：日志分析**

在中央存储位置中，你可以使用日志分析工具来对日志数据进行查询和分析。这些工具可以帮助你发现潜在的问题、异常和趋势。一些常见的工具包括Elasticsearch + Kibana、Splunk等。

**步骤 3：定义监控指标和规则**

根据系统的性质和需求，定义监控指标和报警规则。例如，你可以定义CPU使用率超过一定阈值、错误日志出现特定关键词等作为触发报警的条件。

**步骤 4：实现报警**

一旦定义了报警规则，你需要实现报警机制。这可以通过以下方式之一完成：

- **Email/短信报警：** 一些日志分析工具支持通过电子邮件或短信发送报警通知。

- **集成报警工具：** 将报警集成到现有的监控和报警系统中，如Prometheus、Grafana等。

- **自定义脚本：** 编写自定义脚本，当报警条件满足时，触发脚本发送报警通知。

**步骤 5：报警通知**

当报警条件满足时，系统将触发报警通知。确保报警通知能够及时地传达到相关人员，以便他们能够迅速采取行动。

**步骤 6：监控和反馈**

持续监控报警系统的性能和准确性。根据反馈和改进意见，不断优化监控规则和报警机制。

**可能的工具和技术：**

- 日志采集：Logstash、Fluentd、Filebeat、Splunk Universal Forwarder等。
- 日志分析：Elasticsearch + Kibana、Splunk、Graylog等。
- 监控和报警：Prometheus、Grafana、Nagios、Zabbix等。

综合使用以上步骤和工具，你可以建立一个基于日志的监控和报警系统，帮助你及时发现和解决系统问题。请根据你的需求和环境进行适当的配置和定制。

# Q9-日志的全链路监控，推荐使用什么开源工具。有哪些？详细对比下

全链路监控是指监控整个应用系统中各个组件之间的调用链路，从而帮助你识别潜在的性能问题和瓶颈。以下是一些开源的全链路监控工具，我将对它们进行简要的介绍和比较：

1. **Jaeger:**
   - Jaeger 是一个开源的分布式追踪系统，最初由Uber开发。它支持实时的调用链追踪和分析，帮助你监控应用中的微服务交互。
   - 特点：支持分布式上下文追踪、高度可扩展、与OpenTracing标准兼容。

2. **Zipkin:**
   - Zipkin 是另一个流行的分布式追踪系统，它可以帮助你跟踪应用中的请求流程，了解不同组件之间的延迟和性能。
   - 特点：易于部署、支持多语言、与OpenTracing标准兼容。

3. **OpenTelemetry:**
   - OpenTelemetry 是一个开源的观测框架，旨在提供一套标准和工具来生成、收集和传递观测数据，包括追踪、指标和日志。
   - 特点：跨多语言、跨多种观测数据类型、与分布式环境集成。

4. **SkyWalking:**
   - Apache SkyWalking 是一个应用性能监控工具，支持全链路追踪、性能指标收集和分析。
   - 特点：支持多语言、自动化仪表板、插件扩展能力。

**对比：**

- **数据类型：** Jaeger 和 Zipkin 主要专注于分布式追踪，OpenTelemetry 则提供了更广泛的观测数据类型，包括追踪、指标和日志。SkyWalking 也提供了全链路追踪和性能指标。

- **标准兼容性：** Jaeger、Zipkin 和 OpenTelemetry 都支持 OpenTracing 标准，这有助于实现多样性的技术栈集成。

- **扩展性：** Jaeger、Zipkin 和 SkyWalking 都支持高度可扩展的部署，适应大规模应用的需求。

- **社区支持：** Jaeger 和 Zipkin 都有较大的用户社区和活跃的开发团队。OpenTelemetry 作为标准化的观测框架，也在不断得到增强。SkyWalking 作为 Apache 项目，也受到社区支持。

- **部署和使用难度：** 部署和使用的难度因工具而异，你可能需要根据具体情况来选择最适合你技术栈和团队的工具。

在选择全链路监控工具时，你需要根据你的系统架构、技术栈、性能需求和团队技术能力来进行评估。每个工具都有其优势和限制，最好通过实际测试和实验，选择最符合你需求的工具。

# Q10-上面4个工具的编程语言是什么

以下是上述四个工具的主要编程语言：

1. **Jaeger:** 主要使用 Go 语言开发，它的核心组件和一些后端存储适配器都是用 Go 编写的。

2. **Zipkin:** 主要使用 Java 语言开发，它的核心服务和组件都是基于 Java 编写的。此外，也有针对其他语言的客户端库。

3. **OpenTelemetry:** OpenTelemetry 不是一个具体的工具，而是一个观测框架，它涵盖多种编程语言。它支持多种主流编程语言，包括 Java、Python、Go、C#、Ruby、JavaScript 等。

4. **SkyWalking:** 主要使用 Java 语言开发，它的核心组件和插件大部分都是使用 Java 编写的。此外，也有针对其他语言的客户端库。

需要注意的是，虽然这些工具的核心组件可能是使用某种主要编程语言开发的，但它们通常都提供了多种编程语言的客户端库或者集成方式，以适应不同语言的应用程序。在选择工具时，你也可以考虑与你的应用程序技术栈相匹配的客户端库和集成方式。

# Q11-推荐使用哪一个？为什么

选择适合你的全链路监控工具需要考虑多个因素，包括你的应用架构、技术栈、性能需求、团队熟悉的编程语言以及工具的特点。以下是一些建议，但最终的决策应该根据你的具体情况来做出：

1. **如果你已经在使用某个观测框架：** 如果你的组织已经在使用了 OpenTelemetry 或其他观测框架，可能最好继续使用该框架，以确保一致性和统一性。

2. **如果你的应用主要使用 Java 语言：** 如果你的应用程序主要是 Java 编写的，那么 Zipkin 和 SkyWalking 都是不错的选择。Zipkin 是一个成熟的项目，而 SkyWalking 也是一个活跃的 Apache 项目，两者都能够提供可靠的全链路追踪。

3. **如果你的应用主要使用 Go 语言：** 如果你的应用程序主要是 Go 编写的，Jaeger 是一个非常强大的全链路追踪工具，具有很好的性能和扩展性。

4. **如果你关注标准化和多语言支持：** 如果你希望在多种语言和技术栈中实现一致的观测方案，OpenTelemetry 是一个值得考虑的选项。它提供了一套标准和工具，支持多种编程语言。

5. **如果你需要更强大的分析和查询能力：** 如果你需要更强大的分析、查询和可视化功能，可以考虑使用 Elasticsearch + Kibana 来结合 Jaeger 或其他观测工具，这样可以得到更灵活的监控和报告。

综合来说，最适合你的全链路监控工具取决于你的特定需求和现有技术栈。

建议在选择之前，进行一些实验和测试，以确保选取的工具能够满足你的全链路监控和报警需求。

# 参考资料

[性能与可靠的超强碰撞：第三方测评开源日志采集器](https://mp.weixin.qq.com/s/8mCVk3gvXPOijTlcRjUR_w)

* any list
{:toc}