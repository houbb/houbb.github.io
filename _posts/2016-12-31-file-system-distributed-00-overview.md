---
layout: post
title: 分布式文件服务系统（Distributed File System, DFS）-00-分布式文件服务系统是什么？
date:  2016-12-31 10:48:42 +0800
categories: [File]
tags: [distributed, dfs, file]
published: true
---

# DFS 系列

[Apache Hadoop-01-大数据之谷歌文件系统论文 GFS The Google File System](https://houbb.github.io/2017/12/11/big-data-01-google-paper-gfs-intro)

[Apache Hadoop-03-HDFS Distributed File System 分布式文件系统](https://houbb.github.io/2017/12/04/apache-hadoop-03-hdfs)

# 开发流程

可以先开发一个单机版本的

然后逐步改进到分布式

保证对外的 api 不变化，兼容 S3

可以参考 minio 来设计。

# 差异化

## 安全

加密

## 多端

移动端+多个端的支持？

## 高可用

分布式+高性能


# 开源组件

## 1. Ceph

红帽公司的Ceph提供统一的对象和块存储功能。它是一种分布式存储解决方案，具有出色的性能，可伸缩性和可靠性。知名用户包括Cisco，DreamHost，CERN，Bloomberg和Deutsche Telekom。作业系统：Linux

## 2. CryptoNAS

该项目旨在简化设置加密文件服务器的过程。它包含在实时CD软件包或添加Web前端的服务器软件包中。作业系统：Linux

## 3. ESOS

ESOS是Enterprise Storage OS的缩写，是一种Linux发行版，用于在您自己的硬件上设置存储阵列。提供商业支持。作业系统：Linux

## 4. FreeNAS

FreeNAS声称是“世界上排名第一的存储操作系统，下载量超过10亿次。” 它的使用者包括联合国，佛罗里达大学，救世军，路透社，密歇根州立大学，国土安全部和许多其他组织。它几乎可以安装在任何硬件上，以将其转变为网络附加存储(NAS)设备。TrueNAS品牌下提供了基于相同技术的付费受支持企业解决方案。操作系统：FreeBSD

## 5. NAS4Free

NAS4Free是NAS自己动手做NAS的另一种选择，它声称是“为各种数据创建集中且易于访问的服务器的最简单，最快的方法。” 关键功能包括ZFS文件系统，软件RAID(级别0、1或5)和磁盘加密。操作系统：FreeBSD

## 6. Openfiler

作为一个统一的存储解决方案，Openfiler旨在将NAS存储的最佳功能与SAN存储的最佳功能结合在一起。主要功能包括高可用性/故障转移，块复制和基于Web的管理。它的用户包括Motorola，Pratt&Whitney，Bill Me Later和London Metropolitan Police。提供付费商业版。作业系统：Linux

## 7. OpenMediaVault

OpenMediaVault基于Debian Linux，将自己描述为“下一代网络附加存储(NAS)解决方案”。它旨在为家庭用户或小型办公室提供NAS。它提供了一个基于Web的管理控制台，并包括软件RAID功能。作业系统：Linux

## 8.Turnkey Linux File Server

Turnkey Linux项目提供了用于基于各种目的设置基于Linux的服务器的映像，包括用于创建简单NAS设备的映像。它包括对SMB，SFTP，NFS，WebDAV和rsync文件传输协议的支持。作业系统：Linux

文件系统

## 9. Btrfs

Btrfs是一个由Facebook，Fujitsu，Intel，Linux Foundation，Netgear，Novell，Oracle，Red Hat和其他公司支持的联合项目，是Linux的写时复制(CoW)文件系统。它着重于“容错，维修和易于管理”。作业系统：Linux

## 10. Ext4

Ext4包含在大多数流行的Linux发行版中，支持最大1 EB大小的文件系统，每个文件最大16 TB。其他关键功能包括扩展，多块分配，延迟分配，快速fsck，日志校验和，“无日志记录”模式，联机碎片整理等等。作业系统：Linux

## 11. GlusterFS

作为红帽项目，GlusterFS是为媒体流和大数据分析等应用程序构建的高度可扩展的文件系统。可通过第三方供应商获得专业支持。它拥有庞大而活跃的用户社区，并且该网站包含许多与Gluster相关的博客的链接。作业系统：Linux

## 12.Lustre

专为满足高性能计算(HPC)环境的需求而设计，Luster是可扩展的并行文件系统。它最初是在卡内基梅隆大学开发的，其最初的用户包括美国能源部国家实验室的各个部门。最新版本于4月发布，支持MDT上的数据，文件级冗余，提前锁定等等。作业系统：Linux

## 13. ZFS

ZFS还集成到许多Linux发行版中，包括Arch，Debian，Fedora，Ubuntu等，ZFS是另一个高度可扩展的文件系统。它包括压缩，防止数据损坏，快照，RAID支持等。操作系统：Linux，macOS，FreeBSD

RAID

## 14. DRBD

DRBD是用于基于RAID-1构建高可用性存储集群的开源解决方案。项目赞助商Linbit可提供商业产品，包括基于相同技术的软件定义的存储，灾难恢复和高可用性解决方案。作业系统：Linux

## 15.Mdadm

mdadm内置在Linux内核中，可轻松创建，管理和监视存储阵列。它还可以在RAID阵列之间移动备用磁盘。Linux RAID Wiki上也提供了更多信息。作业系统：Linux

## 16.Raider

Raider是一种bash shell脚本，它允许用户将任何Linux磁盘转换为具有软件RAID 1、4、5、6或10的RAID阵列。它可以与许多最受欢迎的Linux发行版一起使用，包括Ubuntu，Debian，OpenSUSE，Fedora， Linux Mint等。作业系统：Linux

## 17. RaidEye

RaidEye并不是用于创建RAID设备的工具，而是用于监视RAID卷的应用程序。它与macOS内置的RAID功能配合使用，并通过声音警报，弹出对话框和电子邮件通知用户问题。作业系统：macOS

## 18. SnapRAID

SnapRAID阵列最多可以从六个磁盘故障中恢复。该工具是为家庭媒体服务器或其他环境而设计的，具有许多很少更改的大文件。主要功能包括数据散列，恢复已删除文件的功能以及无锁定功能。操作系统：Windows，Linux，macOS

备份与同步

## 19.AMANDA

Maryland高级网络磁盘自动存档器(AMANDA)是一种流行的网络备份解决方案，可以将Linux，Unix或Windows系统中的数据保存到硬盘，磁带或光学介质。它的最新更新于2017年12月。赞助该项目的Zmanda提供基于相同技术的商业产品。操作系统：Windows，Linux，macOS。

## 20.Areca Backup

专为个人使用而设计，Area是一种简单而通用的备份解决方案。主要功能包括增量备份，压缩，加密，过滤器，最新恢复等。作业系统：Windows，Linux

## 21. BackupPC

BackupPC具有足够的健壮性以供企业使用，将数据从Linux和Windows系统备份到磁盘。值得注意的功能包括独特的池方案，可选的压缩，Web界面以及对移动设备的支持。它声称是高度可配置的，并且易于安装和维护。作业系统：Windows，Linux

## 22.Bacula

Bacula是企业的另一个选择，它是一种旨在易于使用且非常高效的网络备份解决方案。它声称是最受欢迎的开源备份程序。可通过Bacula Systems获得该解决方案的商业支持和服务。操作系统：Windows，Linux，macOS

## 23. Bareos

Bareos由Bacula分叉，是一个受欢迎的开源备份选项，正在非常积极的开发中，其最新版本于2018年2月发布。Bareos.com网站提供了该工具的付费支持和服务。操作系统：Windows，Linux，macOS

## 24.盒子备份

这种“全自动”备份解决方案可以连续创建备份，也可以在需要时创建快照。它包括加密和可选的RAID功能，并且旧文件版本和已删除文件仍然可用。作业系统：Windows，Linux

## 25 BURP

BURP是“备份和还原程序”的缩写，是一种网络备份解决方案。它提供了两种不同的协议供您选择：一种基于librsync(见下文)，另一种使用可变长度分块进行内联重复数据删除。它被设计为比其他一些开源解决方案更易于配置，并且可以执行增量备份。作业系统：Windows，Linux

## 26. Clonezilla

Clonezilla旨在替代Acronis True Image或Norton Ghost，可用于系统部署以及备份和恢复。它有两种形式：独立系统实时运行和SE用于网络备份或一次克隆多个系统。SE版本可以一次克隆40个或更多系统。作业系统：Linux

## 27.Create Synchronicity

强大而轻巧的备份工具仅占用硬盘驱动器220KB的空间。它支持多种语言，具有直观的界面并包括调度程序。这对于跨设备同步照片，音乐和其他文件也很有帮助。作业系统：Windows

## 28. DAR

Disk Archive(又名DAR)是一种较旧的命令行备份工具，但仍会定期更新，并于2018年4月发布最新版本。对于喜欢GUI的用户，可通过DarGUI项目获得。操作系统：Windows，Linux，macOS

## 29. DirSync Pro

这个“小而强大”的应用程序提供了增量备份，过滤和调度功能。它还具有直观的界面，并且能够分析两组文件或文件夹并检测它们之间的变化。它还包括一个有用的实时同步选项。作业系统：Windows

## 30.Duplicati

Duplicati可与AWS S3，Microsoft OneDrive，Google Drive和Box等云存储服务配合使用，以创建具有AES-256加密的备份。它会在首次使用时进行完整备份，然后再进行增量备份。它还提供了重复数据删除功能。操作系统：Windows，Linux，macOS

## 31.FOG

FOG提供跨平台的克隆和映像功能，以及任何规模的网络的远程管理。它通过论坛和Wiki提供支持。操作系统：Linux，Windows，macOS。

## 32. FreeFileSync

FreeFileSync是独立系统的工具，旨在节省用户设置和运行备份的时间。它是跨平台的，并包括64位支持。网站上提供了教程和手册。作业系统：Linux，Windows，macOS

## 33. FullSync

尽管它旨在帮助Web开发人员将更新推送到其站点，但任何人都可以使用FullSync创建备份。关键功能包括多种模式，灵活的规则，缓冲的文件系统，对多种文件传输协议的支持等等。请注意，由于自2016年4月以来未进行任何更新，因此该项目的开发有所放缓。操作系统：Linux，Windows，macOS

## 34. Grsync

Grsync采用了较旧的rsync同步工具，并添加了易于使用的GUI。值得注意的功能包括无限制的会话，突出显示的错误，批处理功能，模拟，对多种语言的支持等等。作业系统：Linux，Windows，macOS

## 35.Mondo Rescue

仅适用于Linux和FreeBSD，Mondo Rescue是一种灾难恢复解决方案，支持磁带，磁盘，网络或光学介质备份。根据其网站，其用户包括“洛克希德·马丁公司，北电网络公司，西门子公司，惠普公司，IBM以及数十家较小的公司。” 最新更新于2016年4月发布。操作系统：Linux，免费BSD

## 36.Partimage

该工具将驱动器的分区另存为映像文件，使其对于在多个系统上备份或安装相同映像有用。它可以跨网络运行，也可以在独立PC上运行。它也可以用来创建SystemRescueCD。作业系统：Linux

## 37.Redo

Redo夸耀其裸机还原功能可以使崩溃的系统备份并在短短10分钟内运行。它非常易于使用，还可以恢复已删除的图像和文件。作业系统：Windows，Linux

## 38.Rsync

Rsync是基于Unix的文件传输应用程序，具有同步功能，使其适合于创建备份或镜像。这是一个有用的工具，但最好由高级用户使用。最新版本于2018年1月发布。操作系统：Linux，Windows，macOS

## 39. Synkron

虽然此应用主要专注于同步，但它也可以用于创建备份。关键功能包括分析功能，黑名单，还原和跨平台支持。文档提供德语和英语版本。操作系统：Windows，Linux，macOS

## 40. Unison

与Synkron一样，Unison是文件同步工具。它可以在连接到Internet的任何两个系统之间复制文件，并且具有与源代码管理工具以及备份应用程序相同的功能。与其他一些同步工具相比，它的优势在于，它可以合并两组文件都已更改的文件。操作系统：Windows，Unix

## 41. UrBackup

此客户端，服务器备份解决方案同时执行映像和文件备份。它保证了“数据安全和快速恢复时间”。它在系统使用期间进行备份，而不会中断正常操作。作业系统：Windows，Linux

## 42. Weex

Weex开发人员主要将其用作将内容推送到网站的工具，但也可以用于同步或备份文件。它支持FTP文件传输，并使用缓存来加快数据传输速度。作业系统：Windows，Linux

在线/云数据存储

## 43. CloudStack

这个Apache Foundation项目是包含云存储功能的开源云计算平台。值得注意的功能包括计算编排，网络即服务功能，用户和帐户管理，资源会计以及对多个虚拟机管理程序的支持。作业系统：Windows，Linux

## 44. CloudStore

这个Dropbox替代方案可在系统和在线存储之间同步数据。它保证了强大的加密，无密码的身份验证，灵活的同步，快速设置和自动恢复功能，可用于中断的数据传输。作业系统：Linux

## 45. Cozy

Cozy既是用于在线存储个人数据的开源项目，又是用于管理和保护敏感数据的免费服务。请注意，免费托管最多可容纳5GB数据;额外的存储空间需要付费。作业系统：Linux

## 46. FTPbox

是否要设置自己的云存储服务器?FTPbox使所有文件通过FTP传输成为您自己的云提供商变得容易。作业系统：Windows

## 47. OpenStack

OpenStack可能是最著名的开源云计算平台，它提供了一个完整的操作系统来控制计算，网络连接以及云中的存储。它包含与存储相关的三个子项目：Cinder，Swift和Manila。作业系统：Windows

## 48.Perkeep

Perkeep以前称为Camlistore，称自己为“在后PC时代用于建模，存储，搜索，共享和同步数据的一组开源格式，协议和软件”。它仍处于非常活跃的开发中，需要使用一些技术知识。作业系统：Linux

## 49. Pydio

Pydio下载次数超过一百万次，其用户包括剑桥大学，希捷，吉他中心，华盛顿州立大学和尼康。它提供基于云的文件管理和共享。提供付费企业分发。操作系统：Windows，Linux(可用Android和iOS客户端)

## 50.Rockstor

Rockstor使基于Linux和BTRFS创建自己的NAS或云存储解决方案成为可能。它有个人版和SMB版。作业系统：Linux

## 51. SeaFile

SeaFile称自己为“具有高可靠性和高性能的企业文件托管平台”。您可以免费下载代码，也可以使用包含支持的付费专业版。操作系统：Windows，Linux，macOS，Android，iOS

## 52. SparkleShare

SparkleShare在您的系统上创建一个特殊的文件夹，该文件夹会自动与服务器或云中存储的主机文件夹同步。它具有加密功能，对于协作频繁更改的文档是一个很好的选择。操作系统：Windows，Linux，macOS

## 53. StackSync

使用StackSync创建自己的可扩展个人云。它在客户端加密所有数据，并与云存储服务或您自己的服务器一起使用。作业系统：Windows，Linux

## 54.Syncthing

像该类别中的许多其他项目一样，Syncthing提供了Dropbox的替代方案。它通过加密和身份验证要求使数据完全私密。操作系统：Windows，Linux，macOS

存储管理

## 55. Libvirt Storage Management

Libvirt是用于在主机系统上创建存储池和卷的API。它支持多种存储池类型，包括目录，文件系统，网络文件系统，逻辑卷，磁盘，iSCSI，SCSI，Gluster，ZFS等。作业系统：Linux

## 56. openAttic

该工具为Ceph分布式存储平台提供管理和监视功能。它提供了一个仪表板以及用于管理池，块设备，iSCSI，NFS，Ceph对象网关和Ceph节点的工具。作业系统：Linux

分布式存储/大数据工具

## 57.Alluxio

Alluxio(以前称为Tachyon)将自己描述为“开源内存速度的虚拟分布式存储”。它可与Spark，Hadoop，Flink，Zeppelin和Presto等工具配合使用，以加快大数据查询的性能。操作系统：Linux，macOS

## 58. Hadoop

Hadoop是大数据的近义词，它是一种广泛使用的开源分布式存储平台，用于处理数据。这是一个Apache Foundation项目，该组织还监督着数十个相关项目。操作系统：Windows，

Linux，macOS

## 59.HPCC

这种Hadoop替代方案还提供分布式存储和大规模可伸缩性。提供付费企业服务。作业系统：Linux

## 60.Sheepdog

Sheepdog网站将该项目描述为“用于卷和容器服务的分布式对象存储系统，并智能地管理磁盘和节点”。它支持快照，克隆和精简配置，并且与OpenStack Swift和Amazon S3兼容。作业系统：Linux

压缩

## 61. 7-zip

该归档应用程序可以压缩比WinZip压缩30%至70%的文件，比大多数其他zip程序压缩2%至10%的文件。它包括加密功能，自解压文件，功能强大的文件管理器以及对多种压缩格式的支持。操作系统：Windows，Linux，macOS

## 62. ArcThemALL

ArcThemALL可以压缩为UPX，ZIP或7Z格式，并提取33种其他类型的存档文件。它还可以创建自解压档案，并包括AES-256加密功能。作业系统：Windows

## 63.Keka

对于macOS，Keka是7-zip的端口。它还可以压缩为Zip，Tar，Gzip，Bzip2，DMG和ISO格式。作业系统：macOS

## 64. PeaZip

PeaZip用途广泛，可以打开180多种不同类型的存档文件，并且可以写入7种文件，包括ZIP和

7Z。它还包括安全功能，例如强加密，加密的密码管理器，两因素身份验证，安全删除和文件哈希。操作系统：Windows，Linux，macOS。

参考链接：https://www.enterprisestorageforum.com/storage-technology/open-source-storage-64-applications.html

所有权归存储加速器所有。

# 参考资料

* any list
{:toc}