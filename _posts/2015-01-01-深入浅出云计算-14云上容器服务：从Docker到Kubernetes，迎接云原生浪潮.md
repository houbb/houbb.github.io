---
layout: post
title:  深入浅出云计算-14云上容器服务：从Docker到Kubernetes，迎接云原生浪潮
date:   2015-01-01 23:20:27 +0800
categories: [深入浅出云计算]
tags: [深入浅出云计算, other]
published: true
---



14 云上容器服务：从Docker到Kubernetes，迎接云原生浪潮
你好，我是何恺铎。

容器，毫无疑问是近年来的又一个技术热词。容器化技术的诞生和兴起，以及它所催生的微服务架构、DevOps、云原生等技术理念，都对软件行业产生了深远的影响。

容器的优点有很多了，完善的封装、便捷的部署、轻量的启动和调度，这些都是容器技术受到欢迎的原因。与编排系统配合后，它能让我们的应用程序容易管理和迭代，即便是再复杂的系统也不在话下。同时呢，容器应用还能做到非常好的可迁移性，环境中只要有符合标准的容器运行时就可以顺利运行。

我相信你对容器其实有一定的了解，也知道Docker和Kubernetes分别是容器技术和容器编排的事实标准。甚至，不少同学已经有过一些实践的经验。

那么在容器这一讲中，我们主要关心什么问题呢？我认为，你需要重点搞清楚两个问题：

* **容器和云是什么关系呢？**
* **在云上运行容器有哪些方式，它们各自又有什么特点呢？**

让我们顺着容器上云的发展历程，来了解这两个问题的答案。

## 容器上云：从Docker到Kubernetes

轻量的容器和富有弹性的云计算，互相之间其实是非常契合的。容器对于运行环境的极强适应性和快速启动的能力，配合云上动态扩展的庞大资源规模，让云端的容器应用可以在短时间内拓展到成千上万个实例。所以，**云可以说是容器应用的最佳载体，容器应用也非常适合在云上运行和扩展。**

其实在Docker技术家喻户晓之前，云厂商已经在研究和使用类似容器的技术了，因为云本身是多租户的，需要**运行环境的隔离性**。所以云本身也是容器技术的用户和受益者，只是部分厂商会考虑进行自研，未必直接使用Docker而已。

补充：比如说[第11讲](https://time.geekbang.org/column/article/217120)提到过的AWS的Elastic Beanstalk，它就使用了类似容器的私有技术，以实现Web应用之间的隔离。当然后来呢，它也直接支持了Docker容器封装的应用。

而当Docker兴起之后，各大公有云都不约而同地开始对外提供容器相关的标准PaaS服务，并持续地进行改进。如果我们梳理容器PaaS服务的发展脉络，就会发现它经历了一系列的发展阶段。

在初期，云上容器平台把Docker容器在云上的**顺畅运行**，作为首要的目标。产品服务的主要目的是帮助用户创建底层虚拟机集群，免去了用户自己手动管理虚拟机的麻烦。然后呢，随着容器应用的复杂化，**编排**逐渐成为了用户最急迫的需求，所以各厂商又纷纷推出和加强容器编排方面的解决方案。

在那个编排框架群雄并起的年代，有的厂商选择了多点开花，比如微软当时的Azure Container Service，可以支持Docker Swarm、Apache Mesos（DC/OS）和Kubernetes等多种编排系统；也有的厂商呢，选择了自己的编排方式，以便更好地和自己其他的云服务集成，比如AWS的Elastic Container Service（ECS）。

当然，后来编排框架大战的结果你已经都知道了，Kubernetes 最终一统天下，成为了事实标准。所以各大厂商又很快地调转方向，纷纷为云上Kubernetes的支持加码，推出面向Kubernetes的专属服务了，比如AWS的Elastic Kubernetes Service（EKS）和Azure的Azure Kubernetes Service（AKS）。阿里云呢，同样也逐渐停止了旗下容器服务对Swarm的支持，而把发展重点聚焦在容器服务Kubernetes版（ACK）上。

你看，云对容器技术的支持，是伴随着容器生态发展而发展的，所以很多时候，云也是容器生态重要的参与者和推动者。就像Google Cloud中的GKE（Google Kubernetes Engine），由于“根正苗红”，也一直是云上Kubernetes服务的标杆之一。

补充：如果说之后的技术潮流还有什么变化，我想你在云上也一样会看到领域内的最新进展。比如Service Mesh（服务网格），也有越来越多的云服务正在探索和提供相关的支持与服务。这也是云与时俱进的魅力所在。

所以，就现在最新的形势而言，如果要容器上云，那我想你几乎不用犹豫，直接选择各大云上最新的针对Kubernetes的服务即可。

关于Kubernetes本身，它是一个非常庞大的技术体系，我建议你通过专门的课程来系统学习。但在这里你需要重点了解一下，相对于自建Kubernetes集群，云上Kubernetes服务的几个独有特点。

首先，很多云上的Kubernetes服务，**由于云端的多租户特性，可以免除你在Master节点方面的开销**。换句话说，你只需要创建Worker节点，并为之付费就行了。云平台会统一为你提供和托管Master节点，降低你的资源和运维成本。

另外，我们都知道**Kubernetes虽然复杂性较高，但抽象设计出色，能够支持大量灵活的扩展**。所以云厂商在这个方面花了很多功夫，能够让很多云平台上的IaaS或PaaS功能组件，渗透到Kubernetes的体系中来，这样可以让两边有一个更紧密的集成。

比如说，在常用来引导外部流量的**Ingress Controller**（入口控制器）方面，就有AWS的ALB Ingress Controller，和Azure的AKS Application Gateway Ingress Controller等基于云上负载均衡器的控制器实现。它们会创建相应的PaaS服务实例，来为Kubernetes集群服务。

再比如，我们可以在Kubernetes中定义动态存储卷分配策略的StorageClass层面，指定使用云端的**块存储服务**，来按需创建和挂载持久化存储。下面的配置文件片段（注意它的provisioner和parameters字段），就展示了一个使用AWS EBS服务来提供的SSD云硬盘的例子。
apiVersion: storage.k8s.io/v1 kind: StorageClass metadata: name: standard provisioner: kubernetes.io/aws-ebs parameters: type: gp2

云和K8s集成的方面还有很多，权限认证、日志集成、私有网络等许多方面，这里就不一一展开讨论了。这些集成共同构成了K8s在云上运行，以及和云全方位融合的坚实保障。

目前，AWS还正在积极地研发推进AWS Service Operator for Kubernetes，它把S3、RDS等**有状态**的AWS云服务，以**自定义资源**的形式纳入到了Kubernetes中。这让我们能够通过使用云服务来扩展Kubernetes的能力，并反过来使用Kubernetes来管理这些云资源。我们可以预期，类似Service Operator这样的服务，未来将会不断走向成熟，也能够进一步加快容器和云一体化架构的发展。

从**架构灵活性**的角度来看，云上Kubernetes服务还带来了另一个好处：**多集群**。

由于建立K8s集群的门槛大大降低了，如果业务间的关联较小，你是可以考虑为不同的业务单独创建K8s集群的。这样，不同的集群之间就有了更好的隔离性，也可以单独地扩展。

## 容器镜像服务

容器方面的另一种常见而且又很重要的云服务，就是**容器镜像服务**（Container Registry）。我们知道，容器的镜像是容器化程序封装后的基本单位，在云上，你肯定需要一个可以存储和管理自己程序镜像的地方，就像Docker Hub管理了很多公开镜像一样。

所以，在大多数云上都提供了自己的容器镜像服务，如AWS的ECR、Azure的ACR等。它们能让你建立私有的镜像仓库，支持镜像的推送和拉取，还可以进行版本管理等操作。镜像服务虽然看上去简单，却是云上容器体系中不可或缺的一环，容器的运行肯定要和它打交道。

## 全托管的容器实例服务

上面我们所讨论的容器服务，一般还是能够看到虚拟机的，在云虚拟机的层面都有相应的集群被创建。这其实是一种半托管的PaaS模式。

**那么，有没有更加方便易用，不用关心底层基础设施的容器服务呢？**

答案是肯定的，这也是近期云计算在容器领域的另一个特点和趋势：**容器实例服务**。常见的有AWS的Fargate、阿里云的弹性容器实例、Azure的Azure Container Instance等等。它们都是“全托管”思想在容器服务上的体现。

如果你只是有一个容器镜像，想要尽快地在云上跑起来，那么这类服务很可能就是你的最佳选择。因为它简便易行，成本低、速度快，而且你不需要操心底层的虚机和集群，也可以绕开复杂的编排系统，只需要关注Pod运行层面的目标就可以了。这是容器实例类云服务很大的卖点，尤其对于无状态的应用非常适合。

接下来，我就举一个实际的例子，把[第11讲](https://time.geekbang.org/column/article/217120)中，我们计算斐波那契数列的Node.js程序容器化，并且把它搬到云上的容器实例服务。我们这里使用 **Azure云上的容器实例**（Azure Container Instance）来完成这个实验。

首先，要把我们之前的Node程序用Docker封装起来，相关的Dockerfile如下：
FROM node:10 WORKDIR /usr/src/app COPY package.json ./ COPY app.js ./ RUN npm install ENV PORT=80 EXPOSE 80 CMD [ "node", "app.js" ]

可以用一个简单的打包命令，来获得本地的Docker镜像，我们就叫它**fiboapp**：

docker build --rm -f dockerfile -t fiboapp:1.0.0 .

然后，我们在Azure上新建一个容器注册表，也就是前面提到的容器镜像服务。云上会为我们分配一个镜像服务器的域名：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/%e6%b7%b1%e5%85%a5%e6%b5%85%e5%87%ba%e4%ba%91%e8%ae%a1%e7%ae%97/assets/064b51be50d18c5f15fdd6be2db5cc42.jpg)

接着我们就可以用标准Docker命令登录，并且将镜像上传到这个私有的镜像仓库：
docker login geektimehellocloud.azurecr.io docker tag fiboapp:1.0.0 geektimehellocloud.azurecr.io/fiboapp:1.0.0 docker push geektimehellocloud.azurecr.io/fiboapp:1.0.0

推送完成后，界面上就显示出了这个镜像的信息。

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/%e6%b7%b1%e5%85%a5%e6%b5%85%e5%87%ba%e4%ba%91%e8%ae%a1%e7%ae%97/assets/e55a8910765424c67bfddf439beaee22.jpg)

**然后，我们就可以创建一个容器实例，并且指向相关的镜像了：**

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/%e6%b7%b1%e5%85%a5%e6%b5%85%e5%87%ba%e4%ba%91%e8%ae%a1%e7%ae%97/assets/5ecabce9b61f7c914d1a95fec6296ad6.jpg)

随后通过一些特别简单的配置，我们就可以让容器在云上跑起来了。它还贴心地“赠送”给我们一个域名：_fiboapp.japaneast.azurecontainer.io_。

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/%e6%b7%b1%e5%85%a5%e6%b5%85%e5%87%ba%e4%ba%91%e8%ae%a1%e7%ae%97/assets/f154f6c540df1d8c40788150b3207081.jpg)

这就大功告成了。我们用curl工具测试一下运行在云容器中的斐波那契服务，一切正常：
client@clientVM:~$ curl http://fiboapp.japaneast.azurecontainer.io/fibo/30 Fibo(30) = 1346269 Computed by wk-caas-3fa7a6b99b-7703b0c1f33ab2xxxxxxxx with private ip 10.244.32.63

至此，我们把斐波那契数列应用就成功地迁移到了容器实例服务上。你可以看到，这个服务为我们准备好了容器运行所需的一切环境，我们需要做的，就只是简单地把镜像打包上传而已。

## 课堂总结与思考

从Docker到Kubernetes，容器生态不断的发展，云原生的技术浪潮已经袭来。不单是我们开发者要学习和拥抱容器技术，各个云计算厂商也都想把自己变成运行容器的最佳场所。所以，云平台们推出了各种各样的容器相关服务，以争夺云上的容器用户。

相信通过今天的介绍，你能够回答这一讲开头提出的两个问题了。**容器和云是相辅相成的，云承载着容器的运行，容器生态也驱动着云的发展。**从运行方式上来看，你既可以轻量方便地在云上运行容器，也可以在云上Kubernetes服务的帮助下创建集群，进行较大规模的编排和部署。

我这里还整理了各大云的容器相关服务名称和缩写，你可以参考下面的表格：

![](https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/%e6%b7%b1%e5%85%a5%e6%b5%85%e5%87%ba%e4%ba%91%e8%ae%a1%e7%ae%97/assets/2378624e41c7a04c5271b8ffe21d0eeb.jpg)

不知道你有没有注意，其实容器与云还有一层微妙的关系，那就是容器与厂商力推的一些云服务，**存在一定的竞争和替代关系**。

就像部分PaaS的功能，能够使用IaaS来实现一样，容器由于它极高的构建自由度和便捷的封装部署机制，也可以一定程度地替代部分云上的可复用组件（就像我们的实验中，用容器完成了[第12讲](https://time.geekbang.org/column/article/218350)中类似效果的应用部署）。而且，它可以作为系统的一部分参与编排，还是避免厂商绑定的“神器”。

注：从资源编排的角度来看同样如此，K8s的各种yaml配置，和[第8讲](https://time.geekbang.org/column/article/213805)中提到过的ARM Template和AWS CloudFormation等私有的资源描述方式，同样存在能力交集。

这就是为什么你会发现，像Google这样在云计算领域相对后发的厂商，会更热衷于云原生生态的建设，并积极创立和发展CNCF（Cloud Native Computing Foundation，云原生计算基金会）这样的组织。因为以厂商中立为特点的云原生阵营若能崛起，有助于挑战已经在云计算产品体系中占据优势的老玩家。这是有商业考量的。

当然，不论背后的商业用意如何，业界从碎片化的私有技术到统一的技术标准上面来，这本身就是云原生带来的一种进步，有着非常积极的意义。对我们开发者也是好事情，它帮我们保证了应用的可迁移性。

所以尽管容器一定程度地威胁到了部分云服务，不过云计算再一次体现了技术中立性，云平台们都大大方方地支持和承载了容器的运行，甚至作为重点服务来进行发展。把选择权留给用户，这是云的胸怀所在。

K8s还在快速地发展，云上各种IaaS/PaaS服务也是实力雄厚，两者亦敌亦友，又相互渗透。未来的走向究竟如何，十分值得关注，让我们拭目以待。

**好了，今天同样留给你两个思考题，欢迎你参与讨论：**

* 后半篇所讲的容器实例类服务，与前半篇讲到的云上Kubernetes编排服务，其实并不是割裂的关系。通过集成和调度，不少云上Kubernetes服务中的Pod能够在容器实例服务中运行。你知道它是通过K8s中什么机制来完成的吗？
* 对于最后讨论的容器与云的微妙关系，你是怎么看的？你觉得未来更多是以K8s为中心、云原生吞噬一切，还是云自身的IaaS/PaaS产品体系更为强大，K8s只是云中的一个服务呢？

这一讲我们就到这里。如果你觉得有收获，欢迎你把这篇文章分享给你的朋友。感谢阅读，我们下期再见。




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/%e6%b7%b1%e5%85%a5%e6%b5%85%e5%87%ba%e4%ba%91%e8%ae%a1%e7%ae%97/14%20%e4%ba%91%e4%b8%8a%e5%ae%b9%e5%99%a8%e6%9c%8d%e5%8a%a1%ef%bc%9a%e4%bb%8eDocker%e5%88%b0Kubernetes%ef%bc%8c%e8%bf%8e%e6%8e%a5%e4%ba%91%e5%8e%9f%e7%94%9f%e6%b5%aa%e6%bd%ae.md

* any list
{:toc}
