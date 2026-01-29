---
layout: post
title: docker install helm windows 实战
date: 2026-01-20 21:01:55 +0800
categories: [Docker]
tags: [ai, docker, sh]
published: true
---

# 业务背景

# 前置

windows 正确安装了 docker desktop

## 启用 k8s

选择右上角的 setting 按钮==> Kubernetes ==> Enable Kubernetes

## 验证

```
>kubectl version --client
Client Version: v1.32.2
Kustomize Version: v5.5.0

>kubectl get nodes
NAME             STATUS   ROLES           AGE    VERSION
docker-desktop   Ready    control-plane   7d2h   v1.32.2
```

# 下载 HELM

https://github.com/helm/helm/releases

选择：helm-vX.Y.Z-windows-amd64.zip

这里我选择：https://get.helm.sh/helm-v4.1.0-windows-amd64.zip

## 配置 path

解压后本地目录：`D:\tool\helm\windows-amd64\helm.exe`

把 `D:\tool\helm\windows-amd64` 加入 系统 PATH

## 测试

```
>helm version
version.BuildInfo{Version:"v4.1.0", GitCommit:"4553a0a96e5205595079b6757236cc6f969ed1b9", GitTreeState:"clean", GoVersion:"go1.25.6", KubeClientVersion:"v1.35"}
```

# 验证 Helm 是否能连上 Docker Kubernetes

## 查看 kube context

```
> kubectl config current-context
docker-desktop
```

## 用 Helm 创建一个测试 chart

```
helm create hello-helm
helm install hello ./hello-helm
```

日志：

```
>helm create hello-helm
Creating hello-helm

>helm install hello ./hello-helm
NAME: hello
LAST DEPLOYED: Thu Jan 29 17:27:39 2026
NAMESPACE: default
STATUS: deployed
REVISION: 1
DESCRIPTION: Install complete
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=hello-helm,app.kubernetes.io/instance=hello" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace default port-forward $POD_NAME 8080:$CONTAINER_PORT
```

## 查看 Helm 部署

```
helm list
kubectl get pods
```

日志：

```
>helm list
NAME    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                  APP VERSION
hello   default         1               2026-01-29 17:27:39.0344864 +0800 CST   deployed        hello-helm-0.1.0       1.16.0

>kubectl get pods
NAME                                READY   STATUS    RESTARTS   AGE
hello-hello-helm-684995dc69-f4hfx   1/1     Running   0          41s
```


# 卸载

```
helm uninstall hello
```


# 参考资料

https://milvus.io/docs/zh/install_standalone-docker.md

* any list
{:toc}