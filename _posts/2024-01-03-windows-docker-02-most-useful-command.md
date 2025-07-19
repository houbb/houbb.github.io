---
layout: post
title: windows docker-02-docker 最常用的命令汇总
date: 2024-01-05 21:01:55 +0800
categories: [Docker]
tags: [docker, windows, wsl, sh]
published: true
---

# chat

## 命令有哪些？

以下为 Docker 最常用命令的分类整理表格，涵盖镜像管理、容器操作、网络与存储等核心场景：

---

### **一、镜像管理**
| 命令 | 说明 | 常用参数示例 |
|------|------|--------------|
| `docker pull <镜像名>:<标签>` | 拉取镜像 | `docker pull nginx:latest` |
| `docker images` | 查看本地镜像 | `docker images -a`（含中间层镜像） |
| `docker rmi <镜像ID>` | 删除镜像 | `docker rmi -f $(docker images -q)`（强制删除所有镜像） |
| `docker build -t <镜像名> .` | 构建镜像 | `docker build -t myapp:v1 -f Dockerfile.prod .` |
| `docker push <镜像名>` | 推送镜像到仓库 | `docker push myuser/myapp:latest` |

---

### **二、容器生命周期管理**
| 命令 | 说明 | 常用参数示例 |
|------|------|--------------|
| `docker run <镜像>` | 创建并启动容器 | `docker run -d --name web -p 80:80 nginx`<br>`-d`：后台运行<br>`-p`：端口映射<br>`-v`：挂载卷 |
| `docker start <容器名>` | 启动已停止的容器 | `docker start web` |
| `docker stop <容器名>` | 停止运行中的容器 | `docker stop -t 10 web`（10秒后停止） |
| `docker restart <容器名>` | 重启容器 | `docker restart web` |
| `docker rm <容器名>` | 删除容器 | `docker rm -fv web`<br>`-f`：强制删除运行中容器<br>`-v`：同时删除关联卷 |
| `docker exec -it <容器名> <命令>` | 在容器内执行命令 | `docker exec -it web bash`（进入容器终端） |

---

### **三、容器监控与日志**
| 命令 | 说明 | 常用参数示例 |
|------|------|--------------|
| `docker ps` | 查看运行中的容器 | `docker ps -a`（含已停止容器）<br>`docker ps -q`（仅显示ID） |
| `docker logs <容器名>` | 查看容器日志 | `docker logs -f --tail 100 web`（实时尾部100行） |
| `docker stats` | 实时监控容器资源 | `docker stats --format "table {{.Name}}\t{{.CPUPerc}}"` |
| `docker inspect <容器名>` | 查看容器详细信息 | `docker inspect web | grep "IPAddress"` |

---

### **四、网络管理**
| 命令 | 说明 | 示例 |
|------|------|------|
| `docker network ls` | 查看网络列表 | - |
| `docker network create <网络名>` | 创建自定义网络 | `docker network create mynet` |
| `docker network connect <网络> <容器>` | 连接容器到网络 | `docker network connect mynet web` |
| `docker network inspect <网络名>` | 查看网络详情 | `docker network inspect bridge` |

---

### **五、数据卷管理**
| 命令 | 说明 | 示例 |
|------|------|------|
| `docker volume create <卷名>` | 创建数据卷 | `docker volume create myvol` |
| `docker volume ls` | 列出数据卷 | - |
| `docker volume inspect <卷名>` | 查看卷详情 | `docker volume inspect myvol` |
| `docker run -v <卷名>:<容器路径>` | 挂载卷到容器 | `docker run -v myvol:/app/data nginx` |

---

### **六、其他实用命令**
| 命令 | 说明 |
|------|------|
| `docker system prune -a` | **清理**：删除所有停止的容器、未使用的镜像和网络 |
| `docker cp <容器>:<路径> <宿主机路径>` | 容器与宿主机间复制文件 |
| `docker-compose up -d` | 使用 Compose 启动多容器应用（需额外安装） |

---

### **常用参数速查**
| 参数 | 作用 |
|------|------|
| `-it` | 交互模式（通常与 `bash`/`sh` 连用） |
| `-p <宿主机端口>:<容器端口>` | 端口映射 |
| `-v <宿主机路径>:<容器路径>` | 目录挂载（或卷挂载） |
| `-e <变量名>=<值>` | 设置环境变量 |
| `--name` | 指定容器名称 |
| `--rm` | 容器退出后自动删除 |

---

### **典型命令示例**
```bash
# 运行 MySQL 容器并持久化数据
docker run -d --name mysql_db \
  -v mysql_data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -p 3306:3306 \
  mysql:8.0

# 进入容器调试
docker exec -it mysql_db mysql -u root -p

# 导出/导入镜像
docker save nginx > nginx.tar
docker load < nginx.tar
```

> **注意**：生产环境避免使用 `-f`（强制删除）和 `--privileged`（特权模式），可能引发安全风险。




* any list
{:toc}