---
layout: post
title:  Kubernetes实践入门指南-23K8s集群中存储对象灾备的落地实践
date:   2015-01-01 23:20:27 +0800
categories: [Kubernetes实践入门指南]
tags: [Kubernetes实践入门指南, other]
published: true
---



23 K8s 集群中存储对象灾备的落地实践
谈到存储对象的灾备，我们可以想象成当你启动了挂载卷的 Pod 的时候，突然集群机器宕机的场景，我们应该如何应对存储对象的容错能力呢？应用的高可用固然最好，但是灾备方案一直都是最后一道门槛，在很多极限情况下，容错的备份是你安心提供服务的保障。

在虚拟机时代，我们通过控制应用平均分配到各个虚拟机中和定期计划执行的数据备份，让业务可靠性不断地提高。现在升级到 Kubernetes 时代，所有业务都被 Kubernetes 托管，集群可以迅速调度并自维护应用的容器状态，随时可以扩缩资源来应对突发情况。

听笔者这么说，感觉好像并不需要对存储有多大的担心，只要挂载的是网络存储，即使应用集群坏了，数据还在么，好像也没有多大的事情，那么学这个存储对象的灾备又有什么意义呢？

笔者想说事情远没有想象中那么简单，我们需要带入接近业务的场景中，再来通过破坏集群状态，看看读存储对象是否有破坏性。

因为我们从虚拟机时代升级到 Kubernetes 时代，我们的目的是利用动态扩缩的资源来减少业务中断的时间，让应用可以随需扩缩，随需自愈。所以在 Kubernetes 时代，我们要的并不是数据丢不丢的问题，而是能不能有快速保障让业务恢复时间越来越短，甚至让用户没有感知。这个可能实现吗？

笔者认为 Kubernetes 通过不断丰富的资源对象已经快接近实现这个目标了。所以笔者这里带着大家一起梳理一遍各种存储对象的灾备在 Kubernetes 落地的实践经验，以备不时之需。

### NFS 存储对象的灾备落地经验

首先我们应该理解 PV/PVC 创建 NFS 网络卷的配置方法，注意 mountOptions 参数的使用姿势。如下例子参考：
/#/#/# nfs-pv.yaml apiVersion: v1 kind: PersistentVolume metadata: name: nfs-pv spec: capacity: storage: 10Gi volumeMode: Filesystem accessModes: - ReadWriteMany persistentVolumeReclaimPolicy: Recycle storageClassName: nfs mountOptions: - hard - nfsvers=4.1 nfs: path: /opt/k8s-pods/data /# 指定 nfs 的挂载点 server: 192.168.1.40 /# 指定 nfs 服务地址 --- /#/#/# nfs-pvc.yaml apiVersion: v1 kind: PersistentVolumeClaim metadata: name: nfs-pvc spec: storageClassName: nfs accessModes: - ReadWriteMany resources: requests: storage: 10Gi

在这个例子中，PersistentVolume 是 NFS 类型的，因此需要辅助程序 /sbin/mount.nfs 来支持挂载 NFS 文件系统。

[kadmin@k8s-master ~]$ kubectl get pvc nfs-pvc NAME STATUS VOLUME CAPACITY ACCESS MODES STORAGECLASS AGE nfs-pvc Bound nfs-pv 10Gi RWX nfs 3m54s [kadmin@k8s-master ~]$ [kadmin@k8s-master ~]$ kubectl get pv nfs-pv NAME CAPACITY ACCESS MODES RECLAIM POLICY STATUS CLAIM STORAGECLASS REASON AGE nfs-pv 10Gi RWX Recycle Bound default/nfs-pvc nfs 18m

执行一个 Pod 挂载 NFS 卷：

/#/#/# nfs-pv-pod.yaml apiVersion: v1 kind: Pod metadata: name: nginx-pv-pod spec: volumes: - name: nginx-pv-storage persistentVolumeClaim: claimName: nfs-pvc containers: - name: nginx image: nginx ports: - containerPort: 80 name: "nginx-server" volumeMounts: - mountPath: "/usr/share/nginx/html" name: nginx-pv-storage 复制 [kadmin@k8s-master ~]$ kubectl create -f nfs-pv-pod.yaml pod/nginx-pv-pod created [kadmin@k8s-master ~]$ [kadmin@k8s-master ~]$ kubectl get pod nginx-pv-pod -o wide NAME READY STATUS RESTARTS AGE IP NODE NOMINATED NODE READINESS GATES nginx-pv-pod 1/1 Running 0 66s 172.16.140.28 k8s-worker-2 <none> <none> [kadmin@k8s-master ~]$ curl http://172.16.140.28 Hello, NFS Storage NGINX

当你在一个 Pod 里面挂载了 NFS 卷之后，就需要考虑如何把数据备份出来。[velero](https://github.com/vmware-tanzu/velero) 作为云原生的备份恢复工具出现了，它可以帮助我们备份持久化数据对象。velero 案例如下：

velero backup create backupName --include-cluster-resources=true --ordered-resources 'pods=ns1/pod1,ns1/pod2;persistentvolumes=pv4,pv8' --include-namespaces=ns1

注意 velero 默认没法备份卷，所以它集成了开源组件 [restic](https://github.com/restic/restic) 支持了存储卷的支持。因为目前还处于试验阶段，注意请不要在生产环境中使用。

### Ceph 数据备份及恢复

Rook 是管理 Ceph 集群的云原生管理系统，在早前的课程中我已经和大家实践过使用 Rook 创建 Ceph 集群的方法。现在假设 Ceph 集群瘫痪了应该如何修复它。是的，我们需要手工修复它。步骤如下：

第一步，停止 Ceph operator 把 Ceph 集群的控制器关掉，不让它能自动负载自己的程序。
kubectl -n rook-ceph scale deployment rook-ceph-operator --replicas=0

第二步，这个 Ceph 的 monmap 保持跟踪 Ceph 节点的容错数量。我们先通过更新保持健康监控节点的实例正常运行。此处为 rook-ceph-mon-b，不健康的实例为 rook-ceph-mon-a 和 rook-ceph-mon-c。备份 rook-ceph-mon-b 的 Deployment 对象：

kubectl -n rook-ceph get deployment rook-ceph-mon-b -o yaml > rook-ceph-mon-b-deployment.yaml

修改监控实例的命令：

kubectl -n rook-ceph patch deployment rook-ceph-mon-b -p '{"spec": {"template": {"spec": {"containers": [{"name": "mon", "command": ["sleep", "infinity"], "args": []}]}}}}'

进入健康的监控实例中：

kubectl -n rook-ceph exec -it <mon-pod> bash /# set a few simple variables cluster_namespace=rook-ceph good_mon_id=b monmap_path=/tmp/monmap /# extract the monmap to a file, by pasting the ceph mon command /# from the good mon deployment and adding the /# `--extract-monmap=${monmap_path}` flag ceph-mon \ --fsid=41a537f2-f282-428e-989f-a9e07be32e47 \ --keyring=/etc/ceph/keyring-store/keyring \ --log-to-stderr=true \ --err-to-stderr=true \ --mon-cluster-log-to-stderr=true \ --log-stderr-prefix=debug \ --default-log-to-file=false \ --default-mon-cluster-log-to-file=false \ --mon-host=$ROOK_CEPH_MON_HOST \ --mon-initial-members=$ROOK_CEPH_MON_INITIAL_MEMBERS \ --id=b \ --setuser=ceph \ --setgroup=ceph \ --foreground \ --public-addr=10.100.13.242 \ --setuser-match-path=/var/lib/ceph/mon/ceph-b/store.db \ --public-bind-addr=$ROOK_POD_IP \ --extract-monmap=${monmap_path} /# review the contents of the monmap monmaptool --print /tmp/monmap /# remove the bad mon(s) from the monmap monmaptool ${monmap_path} --rm <bad_mon> /# in this example we remove mon0 and mon2: monmaptool ${monmap_path} --rm a monmaptool ${monmap_path} --rm c /# inject the modified monmap into the good mon, by pasting /# the ceph mon command and adding the /# `--inject-monmap=${monmap_path}` flag, like this ceph-mon \ --fsid=41a537f2-f282-428e-989f-a9e07be32e47 \ --keyring=/etc/ceph/keyring-store/keyring \ --log-to-stderr=true \ --err-to-stderr=true \ --mon-cluster-log-to-stderr=true \ --log-stderr-prefix=debug \ --default-log-to-file=false \ --default-mon-cluster-log-to-file=false \ --mon-host=$ROOK_CEPH_MON_HOST \ --mon-initial-members=$ROOK_CEPH_MON_INITIAL_MEMBERS \ --id=b \ --setuser=ceph \ --setgroup=ceph \ --foreground \ --public-addr=10.100.13.242 \ --setuser-match-path=/var/lib/ceph/mon/ceph-b/store.db \ --public-bind-addr=$ROOK_POD_IP \ --inject-monmap=${monmap_path}

编辑 rook configmap 文件：

kubectl -n rook-ceph edit configmap rook-ceph-mon-endpoints

在 data 字段那里去掉过期的 a 和 b：

data: a=10.100.35.200:6789;b=10.100.13.242:6789;c=10.100.35.12:6789

变成：

data: b=10.100.13.242:6789

更新 secret 配置：

mon_host=$(kubectl -n rook-ceph get svc rook-ceph-mon-b -o jsonpath='{.spec.clusterIP}') kubectl -n rook-ceph patch secret rook-ceph-config -p '{"stringData": {"mon_host": "[v2:'"${mon_host}"':3300,v1:'"${mon_host}"':6789]", "mon_initial_members": "'"${good_mon_id}"'"}}'

重启监控实例：

kubectl replace --force -f rook-ceph-mon-b-deployment.yaml

重启 operator:

/# create the operator. it is safe to ignore the errors that a number of resources already exist. kubectl -n rook-ceph scale deployment rook-ceph-operator --replicas=1

### Jenkins 挂载 PVC 应用的数据恢复

假设 Jenkins 数据损坏，想修复 Jenkins 的数据目录，可以采用把 PVC 挂载带临时镜像并配合

kubectl cp
实现，步骤如下。

\1. 获得当前 Jenkins 容器的运行权限：
$ kubectl --namespace=cje-cluster-example get pods cjoc-0 -o jsonpath='{.spec.securityContext}' map[fsGroup:1000]

\2. 关闭容器：

$ kubectl --namespace=cje-cluster-example scale statefulset/cjoc --replicas=0 statefulset.apps "cjoc" scaled

\3. 查看 PVC：

$ kubectl --namespace=cje-cluster-example get pvc NAME STATUS VOLUME CAPACITY ACCESS MODES STORAGECLASS AGE jenkins-home-cjoc-0 Bound pvc-6b27e963-b770-11e8-bcbf-42010a8400c1 20Gi RWO standard 46d jenkins-home-mm1-0 Bound pvc-b2b7e305-ba66-11e8-bcbf-42010a8400c1 50Gi RWO standard 42d jenkins-home-mm2-0 Bound pvc-6561b8da-c0c8-11e8-bcbf-42010a8400c1 50Gi RWO standard 34d

\4. 挂载 PVC 到临时镜像中方便恢复数据：

$ cat <<EOF | kubectl --namespace=cje-cluster-example create -f - kind: Pod apiVersion: v1 metadata: name: rescue-pod spec: securityContext: runAsUser: 1000 fsGroup: 1000 volumes: - name: rescue-storage persistentVolumeClaim: claimName: jenkins-home-cjoc-0 containers: - name: rescue-container image: nginx command: ["/bin/sh"] args: ["-c", "while true; do echo hello; sleep 10;done"] volumeMounts: - mountPath: "/tmp/jenkins-home" name: rescue-storage EOF pod "rescue-pod" created

\5. 复制备份数据到临时镜像：

kubectl cp oc-jenkins-home.backup.tar.gz rescue-pod:/tmp/

\6. 解压数据到 PVC 挂载卷：

kubectl exec --namespace=cje-cluster-example rescue-pod -it -- tar -xzf /tmp/oc-jenkins-home.backup.tar.gz -C /tmp/jenkins-home

\7. 删除临时镜像 Pod：

kubectl --namespace=cje-cluster-example delete pod rescue-pod

\8. 恢复 Jenkins 容器：

kubectl --namespace=cje-cluster-example scale statefulset/cjoc --replicas=1

### Kubernetes 集群的备份

Kubernetes 集群是分布式集群，我们备份集群的元数据的目的一般有两个主要目的：

* 能快速恢复控制节点而不是计算节点
* 能恢复应用容器

从集群备份的难度来讲，我们要清楚理解集群控制节点上有哪些关键数据是需要备份的：自签名证书、etcd 数据、kubeconfig。

拿单个控制几点服务器上的备份步骤来看：
/# Backup certificates sudo cp -r /etc/kubernetes/pki backup/ /# Make etcd snapshot sudo docker run --rm -v $(pwd)/backup:/backup \ --network host \ -v /etc/kubernetes/pki/etcd:/etc/kubernetes/pki/etcd \ --env ETCDCTL_API=3 \ k8s.gcr.io/etcd:3.4.3-0 \ etcdctl --endpoints=https://127.0.0.1:2379 \ --cacert=/etc/kubernetes/pki/etcd/ca.crt \ --cert=/etc/kubernetes/pki/etcd/healthcheck-client.crt \ --key=/etc/kubernetes/pki/etcd/healthcheck-client.key \ snapshot save /backup/etcd-snapshot-latest.db /# Backup kubeadm-config sudo cp /etc/kubeadm/kubeadm-config.yaml backup/

数据恢复一个控制节点的操作如下：

/# Restore certificates sudo cp -r backup/pki /etc/kubernetes/ /# Restore etcd backup sudo mkdir -p /var/lib/etcd sudo docker run --rm \ -v $(pwd)/backup:/backup \ -v /var/lib/etcd:/var/lib/etcd \ --env ETCDCTL_API=3 \ k8s.gcr.io/etcd:3.4.3-0 \ /bin/sh -c "etcdctl snapshot restore '/backup/etcd-snapshot-latest.db' ; \ mv /default.etcd/member/ /var/lib/etcd/" /# Restore kubeadm-config sudo mkdir /etc/kubeadm sudo cp backup/kubeadm-config.yaml /etc/kubeadm/ /# Initialize the master with backup sudo kubeadm init --ignore-preflight-errors=DirAvailable--var-lib-etcd \ --config /etc/kubeadm/kubeadm-config.yaml

通过以上案例知道 Kubernetes 集群中 etcd 数据的备份和恢复，学会善用和

kubectl cp
的配合使用。

### 总结

依赖 Kubernetes 原生的数据复制能力

kubectl cp
和 cronjob，我们可以应对大部分的数据备份和恢复工作。当需要处理分布式系统的备份和恢复的时候，大部分情况并不是去备份数据，而是尝试从有效节点中去除故障节点，让集群能自愈。这是分布式系统的特点，它可以自愈。但是分布式系统的弱点也在于自愈是有条件的，如果故障节点超过可用节点数 Quorum，再智能也是无用的。所以备份仍然是最后一道防线。一定要做定期的并且冗余的**数据备份**。

### 参考链接

* [https://github.com/rook/rook/blob/master/Documentation/ceph-disaster-recovery.md](https://github.com/rook/rook/blob/master/Documentation/ceph-disaster-recovery.md)
* [https://zh.wikipedia.org/wiki/Quorum_(%E5%88%86%E5%B8%83%E5%BC%8F%E7%B3%BB%E7%BB%9F)](https://zh.wikipedia.org/wiki/Quorum_(分布式系统))




# 参考资料

https://learn.lianglianglee.com/%e4%b8%93%e6%a0%8f/Kubernetes%20%e5%ae%9e%e8%b7%b5%e5%85%a5%e9%97%a8%e6%8c%87%e5%8d%97/23%20K8s%20%e9%9b%86%e7%be%a4%e4%b8%ad%e5%ad%98%e5%82%a8%e5%af%b9%e8%b1%a1%e7%81%be%e5%a4%87%e7%9a%84%e8%90%bd%e5%9c%b0%e5%ae%9e%e8%b7%b5.md

* any list
{:toc}
