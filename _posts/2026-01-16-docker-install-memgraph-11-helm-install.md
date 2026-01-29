---
layout: post
title: memgraph-11-Memgraph 在 Kubernetes 上的安装／Memgraph standalone Helm chart
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---

## **Memgraph standalone Helm chart（独立实例 Helm Chart）**

Memgraph 是一个有状态应用程序（数据库），因此用于部署独立 Memgraph 的 Helm chart 会将 Memgraph 作为 Kubernetes 的 `StatefulSet` 工作负载来运行。([Memgraph][1])

该 chart 默认会在单个 Pod 中部署一个 **独立的 Memgraph 实例**。([Memgraph][1])

通常在 Kubernetes 部署有状态服务时，会使用 `StatefulSet` 来确保每个 Pod 具有**唯一的网络标识与稳定的持久身份**。在部署 Memgraph 时，也需要定义一个 `PersistentVolumeClaim` 来存储数据目录 `/var/lib/memgraph`。
这样即使 Pod 重启或被删除，数据仍能保留。([Memgraph][1])

---

### **存储配置（Storage configuration）**

默认情况下，该 Helm chart 会为 **存储和日志** 创建一个 `PersistentVolumeClaim`（PVC）。
如果你未在集群中指定存储类（storage class），则 PVC 将使用集群中可用的默认存储类。你可以在 chart 的 `values.yaml` 文件中进行配置。([Memgraph][1])

为了避免数据丢失，请确保你的存储类设置了 **Retain 回收策略**。如果删除 PVC 时使用的存储类是默认的 **Delete** 策略，则删除 PVC 时对应的 PersistentVolume 也会被删除，这会造成数据丢失。([Memgraph][1])

你也可以通过补丁（patch）现有存储类，将其回收策略改为 `Retain`。例如：

```bash
#!/bin/bash

# Get all Persistent Volume names
PVS=$(kubectl get pv --no-headers -o custom-columns=":metadata.name")

# Loop through each PV and patch it
for pv in $PVS; do
  echo "Patching PV: $pv"
  kubectl patch pv $pv -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
done

echo
```

下面是一个 AWS EBS 卷用的存储类示例（可设置 `Retain` 策略）：

```yaml
storageClass:
  name: "gp2"
  provisioner: "kubernetes.io/aws-ebs"
  storageType: "gp2"
  fsType: "ext4"
  reclaimPolicy: "Retain"
  volumeBindingMode: "Immediate"
```

默认 chart 模板包含默认存储类定义。如果你不想创建新存储类，可以将 `storageClass.create` 设置为 `false`。更多配置选项参见 **Configuration section**。([Memgraph][1])

---

### **Secrets（机密信息）**

Helm chart 支持通过 Kubernetes Secrets 来存储 Memgraph 的用户名和密码。默认情况下，secrets 是 **禁用** 的。
若启用，可在 `values.yaml` 文件中配置，它们会填充为环境变量 `MEMGRAPH_USER` 和 `MEMGRAPH_PASSWORD`。([Memgraph][1])

---

### **Probes（探针）**

该 Helm chart 使用：

* **启动探针（startup probe）**
* **存活探针（liveness probe）**
* **就绪探针（readiness probe）**

启动探针用于判断容器何时已成功启动；存活探针用于判断何时需要重启容器；就绪探针用于判断容器何时可以开始接收流量。([Memgraph][1])

启动探针只有在 Memgraph 完成恢复过程后才算成功。之后才会开始执行存活和就绪探针。默认情况下，启动探针必须在 **2 小时** 内成功。如果恢复过程超过该时间，请在配置中调整超时时间。
存活和就绪探针需要在 5 分钟内至少成功一次，Pod 才被视为准备好了。([Memgraph][1])

---

### **系统配置（System configuration）**

Helm chart 默认会将 Linux 内核参数 `vm.max_map_count` 设置为 **262144**，以确保 Memgraph 不会由于内存映射数量限制而出错。([Memgraph][1])

`vm.max_map_count` 指定了单个进程所允许的最大内存映射区域数量。
该设置会应用于 Kubernetes 集群中的所有节点。若不希望启用该行为，可在 `values.yaml` 中将 `sysctlInitContainer.enabled` 设置为 `false`。([Memgraph][1])

---

## **安装 Memgraph standalone Helm chart**

要将 Memgraph standalone chart 部署到 Kubernetes 集群，需要：

1. 添加 Helm chart 仓库
2. 安装 Memgraph chart

下述示例可在 Minikube 环境中运行，其他 Kubernetes 环境中也可按此流程调整执行。([Memgraph][1])

---

### **添加仓库（Add the repository）**

使用以下命令将 Memgraph Helm 仓库添加到本地 Helm 设置中：

```bash
helm repo add memgraph https://memgraph.github.io/helm-charts
```

然后更新仓库以获取最新的 charts：

```bash
helm repo update
```

---

### **安装 Memgraph（Install Memgraph）**

运行以下命令进行安装：

```bash
helm install <release-name> memgraph/memgraph
```

将 `<release-name>` 替换为你选择的 release 名称。([Memgraph][1])

建议 **指定确切的 chart 版本** 而不是使用 latest 标签，以避免由于镜像拉取或 chart 更新带来的兼容性问题。([Memgraph][1])

---

### **在 Minikube 中安装**

如果使用 Minikube 本地部署 standalone chart，我们强烈建议启用 `csi-hostpath-driver` 并使用相应的存储类，否则可能会出现 PVC 无法正确附加到 Pod 的问题。([Memgraph][1])

示例步骤：

1. 启用 CSI 驱动与依赖组件：

```bash
minikube addons disable storage-provisioner
minikube addons disable default-storageclass
minikube addons enable volumesnapshots
minikube addons enable csi-hostpath-driver
```

2. 创建 `StorageClass`（文件 sc.yaml）：

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: csi-hostpath-delayed
provisioner: hostpath.csi.k8s.io
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
```

然后应用：

```bash
kubectl apply -f sc.yaml
```

3. 在 `values.yaml` 中将 `storageClassName` 设置为 `csi-hostpath-delayed`。([Memgraph][1])

---

## **访问 Memgraph（Access Memgraph）**

部署完成后，你可以通过 Kubernetes 所提供的服务和端点访问 Memgraph，例如：

* 使用客户端库
* 使用命令行工具 `mgconsole`
* 使用可视化 UI **Memgraph Lab**

访问方式取决于你的 Kubernetes 环境和服务类型设置。([Memgraph][1])

---

## **配置选项（Configuration options）**

以下是 Helm chart 可配置的主要参数及其默认值部分摘要。完整选项可在 chart 文档或 `values.yaml` 中查看。([Memgraph][1])

| 参数                    | 描述                                        | 默认值                   |
| --------------------- | ----------------------------------------- | --------------------- |
| `image.repository`    | Memgraph Docker 镜像仓库                      | `memgraph/memgraph`   |
| `image.tag`           | Memgraph Docker 镜像标签                      | `""`（默认使用 chart 应用版本） |
| `image.pullPolicy`    | 镜像拉取策略                                    | `IfNotPresent`        |
| `memgraphUserId`      | Memgraph 镜像内部使用的用户 ID                     | `101`                 |
| `memgraphGroupId`     | Memgraph 镜像内部使用的组 ID                      | `103`                 |
| `useImagePullSecrets` | 是否使用 imagePullSecrets                     | `false`               |
| `imagePullSecrets`    | 镜像拉取凭据                                    | `- name: regcred`     |
| `replicaCount`        | Memgraph 实例数量（community chart 无复制或 HA 支持） | `1`                   |
| `service.type`        | Kubernetes Service 类型                     | `ClusterIP`           |
| `service.enableBolt`  | 是否启用 Bolt 协议                              | `true`                |
| `service.boltPort`    | Bolt 协议端口                                 | `7687`                |

若要修改默认值，可在安装时通过 `-f values.yaml` 或 `--set` 参数传入自定义值。例如：

```bash
helm install <release-name> memgraph/memgraph -f values.yaml
```

或者：

```bash
helm install <release-name> memgraph/memgraph --set <flag1>=<value1>,<flag2>=<value2>,...
```

📌 注意：如需设置 Memgraph 内部配置（如日志级别、性能参数等），可通过 `memgraphConfig` 值覆盖，这是一串字符串配置项列表。（详见文档）


# 参考资料

https://memgraph.com/docs/getting-started/install-memgraph/kubernetes

* any list
{:toc}