---
layout: post
title: AI-21-cloud native 云原生之 docker
date: 2025-3-7 19:49:19 +0800
categories: [Learn]
tags: [native-cloud, learn, sh]
published: true
---

## web3
 
大家好，我是老马。

今天我们聊一下未来3到5年值得学习的方向。


## 小结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

----------------------

# chat


## 介绍一下 docker

### 一、Docker 是什么？

Docker 是一个轻量级容器化平台，允许开发者将应用及其依赖打包成一个标准化的、可移植的“容器”，并可在任何支持 Docker 的环境中运行。  
它与传统虚拟机的最大区别在于：  
- 虚拟机（VM） ：需要完整的操作系统，资源占用大（如 VMware、VirtualBox）。  
- Docker 容器：共享主机操作系统内核，仅打包应用和依赖，启动快、资源占用极低。

---

### 二、Docker 的核心概念
1. 镜像（Image）  
   - 只读模板，包含运行应用所需的所有文件、配置和依赖（如一个 Ubuntu 系统镜像）。  
   - 通过 `Dockerfile` 定义镜像构建步骤（例如安装软件、复制代码）。

2. 容器（Container）  
   - 镜像的运行时实例，相当于一个轻量级沙箱环境。  
   - 每个容器独立运行，通过隔离技术（Namespace、Cgroups）保证资源限制与安全。

3. 仓库（Registry）  
   - 存储和共享镜像的平台，默认仓库为 [Docker Hub](https://hub.docker.com/)。  
   - 类似 GitHub，可上传（`docker push`）或下载（`docker pull`）镜像。

---

### 三、Docker 的核心功能
1. 环境一致性  
   - 通过容器确保开发、测试、生产环境完全一致，避免“在我机器上能跑”的问题。

2. 快速部署与扩展  
   - 秒级启动容器，支持动态扩缩容（结合 Kubernetes 等编排工具）。

3. 资源隔离与高效利用  
   - 容器共享主机内核，资源利用率比虚拟机高 90% 以上。

4. 微服务支持  
   - 每个微服务可打包为一个容器，独立开发、部署和扩展。

---

### 四、Docker 的典型使用场景
1. 本地开发环境搭建  
   - 一键启动 MySQL、Redis 等服务，无需手动安装配置。  
   ```bash
   docker run --name my-mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:latest
   ```


2. 持续集成/持续部署（CI/CD）  
   - 在流水线中构建镜像并推送到仓库，实现自动化测试与部署。

3. 应用隔离与多版本共存  
   - 同时运行不同版本的 Python 或 Node.js 环境，互不影响。

4. 快速交付PaaS/SaaS服务  
   - 如云函数（Serverless）底层依赖容器技术。

---

### 五、Docker 基本操作命令

| 功能                  | 命令示例                          |
|-----------------------|----------------------------------|
| 拉取镜像              | `docker pull nginx:latest`      |
| 启动容器              | `docker run -d -p 80:80 nginx`  |
| 查看运行中的容器      | `docker ps`                     |
| 进入容器终端          | `docker exec -it <容器ID> bash` |
| 构建镜像              | `docker build -t my-app:1.0 .`  |
| 删除容器              | `docker rm <容器ID>`            |
| 查看镜像列表          | `docker images`                 |


---

### 六、Docker 学习路径建议
1. 入门阶段  
   - 学习 Docker 核心概念（镜像、容器、仓库）。  
   - 掌握常用命令（`run`, `build`, `ps`, `exec`）。  
   - 实践：在本地部署一个简单的 Web 应用（如 Nginx）。

2. 进阶阶段  
   - 编写 Dockerfile 自定义镜像（优化层缓存、多阶段构建）。  
   - 使用 Docker Compose 管理多容器应用（如同时启动 Web + 数据库）。  
   - 学习容器网络与存储配置。

3. 生产级实践  
   - 结合 Kubernetes 管理容器集群。  
   - 实施镜像安全扫描（如 Trivy）和镜像仓库权限管理。

---

### 七、推荐学习资源
1. 官方文档  
   - [Docker 官方文档](https://docs.docker.com/)：最权威的入门指南和 API 参考。

2. 书籍  
   - 《Docker 实践（第2版）》：适合从入门到进阶的实战案例。

3. 在线实验  
   - [Play with Docker](https://labs.play-with-docker.com/)：免费在线沙箱环境，无需本地安装。  
   - [Katacoda Docker 场景教程](https://www.katacoda.com/courses/docker)：交互式学习。

---

### 八、为什么 Docker 是云原生的基石？
- 标准化：容器镜像成为应用交付的“标准单位”。  
- 可移植性：一次构建，可在物理机、虚拟机、公有云、混合云中运行。  
- 生态集成：与 Kubernetes、Prometheus 等云原生工具无缝协作。

掌握 Docker 是进入云原生领域的必经之路，建议从动手实践开始，逐步深入容器化技术的核心原理与应用场景！

## Docker 解决了什么问题？ 类似的技术还有哪些？优缺点，对比一下

### Docker 解决了什么问题？

Docker 的核心价值在于通过容器化技术解决传统软件开发和部署中的多个痛点，具体包括以下问题：

#### 1. 环境一致性问题  
传统开发中，开发、测试、生产环境因操作系统、依赖库版本差异导致“在我机器上能运行，但线上报错”的问题。Docker 将应用及其依赖打包为标准化容器镜像，确保跨环境的一致性。例如，Java 应用的 JDK 版本、Python 的第三方库均可通过镜像固化，避免环境差异导致的故障。

#### 2. 部署效率低与迁移成本高  
传统虚拟机部署需数分钟至数小时，且镜像体积庞大（通常 GB 级）。Docker 容器启动仅需秒级，镜像大小可压缩至 MB 级，支持快速迁移和弹性扩缩容。例如，某电商平台通过容器化将部署时间从小时级缩短至分钟级。

#### 3. 资源浪费与运维复杂  
虚拟机需独占硬件资源（如 CPU、内存），而 Docker 容器共享主机内核，资源利用率提升 90% 以上，单机可运行上千容器。例如，某金融企业通过容器替代虚拟机，服务器成本降低 60%。

#### 4. 微服务与持续交付的支撑  
Docker 的轻量级特性使其成为微服务架构的理想载体，每个服务独立部署、扩展。结合 CI/CD 工具（如 Jenkins、GitLab），实现自动化测试与发布。例如，某团队通过 Docker + Kubernetes 实现每日数百次代码部署。

#### 5. 跨平台与混合云兼容性  
Docker 镜像可在物理机、虚拟机、公有云（AWS、Azure）及边缘设备（如 K3s）中无缝运行，支持混合云部署。例如，某教育机构将本地应用迁移至阿里云，仅需调整容器编排策略，无需修改代码。

---

### 类似技术有哪些？其优缺点对比

#### 1. 传统虚拟机（VMware、VirtualBox）  
- 优点：  
  - 强隔离性：每个 VM 拥有独立内核和硬件虚拟化层，安全性更高。  
  - 跨操作系统支持：可运行与宿主机不同架构的操作系统（如 Windows 宿主机运行 Linux VM）。  
- 缺点：  
  - 资源占用高：每个 VM 需分配固定资源（CPU、内存），利用率低。  
  - 启动速度慢：需启动完整操作系统，通常耗时分钟级。  
- 适用场景：需强安全隔离（如金融核心系统）、运行异构操作系统。

#### 2. Podman（无守护进程容器引擎）  
- 优点：  
  - 无守护进程：无需 root 权限运行，安全性优于 Docker。  
  - 兼容性：支持 Docker 镜像和命令，可无缝替换。  
- 缺点：  
  - 生态成熟度低：工具链和社区支持不如 Docker 完善。  
- 适用场景：对安全性要求高的企业环境。

#### 3. LXC/LXD（Linux 容器）  
- 优点：  
  - 接近原生性能：直接使用宿主机内核，资源损耗极低。  
  - 轻量级：容器体积小，启动速度快。  
- 缺点：  
  - 功能单一：缺乏 Docker 的镜像管理、编排等高级功能。  
- 适用场景：需轻量级虚拟化的 Linux 环境。

#### 4. rkt（CoreOS 容器引擎）  
- 优点：  
  - 安全性：支持 SELinux 和 TPM 硬件加密。  
  - 标准化：符合 OCI（开放容器倡议）规范。  
- 缺点：  
  - 市场占有率低：已被 Kubernetes 弃用，逐渐退出主流。  
- 适用场景：历史遗留项目或特定安全需求场景。

---

### 技术对比表格

| 技术          | 启动速度 | 资源占用 | 隔离性     | 跨平台支持       | 典型应用场景              |
|---------------|----------|----------|------------|------------------|-------------------------|
| Docker    | 秒级     | 极低     | 进程级隔离 | 支持（需相同内核）| 微服务、CI/CD、混合云    |
| 虚拟机    | 分钟级   | 高       | 硬件级隔离 | 完全支持异构 OS  | 金融核心系统、异构环境    |
| Podman    | 秒级     | 极低     | 进程级隔离 | 同 Docker        | 安全敏感型企业容器化      |
| LXC       | 秒级     | 极低     | 进程级隔离 | 仅 Linux         | Linux 轻量级虚拟化        |


---

### 总结与选型建议

1. 优先选择 Docker 的场景：  
   - 需要快速部署、高资源利用率的微服务架构。  
   - 开发测试环境需高度一致性的项目。  
   - 云原生应用（如 Kubernetes 集群）。

2. 选择虚拟机的场景：  
   - 强安全隔离需求（如医疗数据隔离）。  
   - 运行异构操作系统（如 Windows 应用）。

3. 其他技术的补充角色：  
   - Podman 适合对 Docker 守护进程安全性有顾虑的场景。  
   - LXC 可用于 Linux 环境下的极简虚拟化需求。

通过上述对比，Docker 在效率、生态和标准化方面的优势使其成为容器化的主流选择，但在隔离性和跨 OS 支持上的短板仍需结合虚拟机或其他技术补充。

未来随着 Serverless 和边缘计算的发展，Docker 的轻量级特性将进一步释放潜力。

## 详细介绍一下 docker 的核心概念

以下是 Docker 核心概念的详细解析，涵盖其定义、工作原理及实际应用中的关键点：

---

### 一、 镜像（Image）
#### 定义
- 镜像是 Docker 的静态模板，包含运行应用所需的所有文件、配置和依赖（如操作系统、代码、库、环境变量等）。  
- 镜像采用分层存储（Layer）机制，每一层对应 Dockerfile 中的一条指令，通过联合文件系统（UnionFS）叠加为完整的文件系统。

#### 核心特性
1. 只读性：镜像一旦构建完成便不可修改，只能通过生成新层覆盖旧内容。  
2. 可复用性：镜像可被共享、版本化（通过 Tag 标记）和重复使用。  
3. 轻量化：通过复用公共层（如基础镜像），大幅减少存储占用。

#### 示例
- 基础镜像：如 `alpine:3.18`（仅 5MB）、`ubuntu:22.04`。  
- 应用镜像：如 `nginx:latest`（预装 Nginx 的镜像）、自定义的 `my-app:v1.0`。

#### 镜像构建工具
- Dockerfile：定义镜像构建步骤的脚本文件，支持多阶段构建（Multi-stage Build）以优化体积。  
  ```dockerfile
  # 示例：构建一个 Python 应用的镜像
  FROM python:3.9-slim  # 基础镜像
  WORKDIR /app          # 设置工作目录
  COPY requirements.txt .  
  RUN pip install -r requirements.txt  # 安装依赖（生成新层）
  COPY . .              # 复制代码
  EXPOSE 8000           # 声明端口
  CMD ["gunicorn", "app:app"]  # 启动命令
  ```


---

### 二、 容器（Container）
#### 定义
- 容器是镜像的运行时实例，类似于一个轻量级沙箱，提供独立的环境运行应用。  
- 容器通过 Linux 内核的 Namespace（隔离进程、网络等资源）和 Cgroups（限制 CPU、内存等）实现资源隔离。

#### 生命周期
1. 创建：`docker create` 创建容器但不启动。  
2. 启动：`docker start` 或直接 `docker run`（创建+启动）。  
3. 运行：执行镜像中定义的命令（如 `CMD` 或 `ENTRYPOINT`）。  
4. 停止：`docker stop`（优雅终止）或 `docker kill`（强制终止）。  
5. 删除：`docker rm` 删除已停止的容器。

#### 关键操作
- 进入容器：`docker exec -it <容器ID> bash`（交互式终端）。  
- 查看日志：`docker logs <容器ID>`。  
- 资源监控：`docker stats` 查看实时 CPU/内存使用。

---

### 三、 仓库（Registry）
#### 定义
- 仓库是存储和分发镜像的平台，分为公共仓库（如 Docker Hub）和私有仓库（如 Harbor、AWS ECR）。  
- 镜像通过 `仓库名/镜像名:标签` 标识，例如 `docker.io/nginx:1.25`。

#### 核心功能
1. 推送镜像：`docker push my-registry.com/my-app:v1.0`。  
2. 拉取镜像：`docker pull my-registry.com/my-app:v1.0`。  
3. 版本管理：通过标签区分不同版本（如 `latest`、`v1.0`）。

#### 私有仓库部署示例（Harbor）
```bash
# 使用 Docker Compose 启动 Harbor
docker-compose up -d
```


---

### 四、Dockerfile
#### 定义
- Dockerfile 是构建镜像的指令文件，每条指令对应镜像的一个层（Layer）。  
- 通过优化指令顺序（如合并 `RUN` 命令）可减少镜像层数，提升构建效率。

#### 常用指令

| 指令           | 作用                                                                 |
|----------------|----------------------------------------------------------------------|
| `FROM`         | 指定基础镜像（如 `FROM alpine:3.18`）。|
| `COPY`/`ADD`   | 复制文件到镜像（`ADD` 支持自动解压）。|
| `RUN`          | 执行命令（如 `RUN apt-get update && apt-get install -y curl`）。|
| `ENV`          | 设置环境变量（如 `ENV APP_PORT=8000`）。|
| `EXPOSE`       | 声明容器运行时监听的端口（需与 `docker run -p` 映射配合生效）。|
| `CMD`/`ENTRYPOINT` | 指定容器启动命令（`CMD` 可被覆盖，`ENTRYPOINT` 通常用于固定命令）。 |


---

### 五、Docker Compose
#### 定义
- Docker Compose 用于定义和运行多容器应用，通过 YAML 文件（`docker-compose.yml`）管理服务依赖、网络和存储。  
- 支持一键启动/停止所有服务，适合本地开发环境。

#### 示例：启动 Web + Redis 服务
```yaml
version: '3.8'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
  redis:
    image: redis:alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```


#### 常用命令
- `docker-compose up -d`：后台启动服务。  
- `docker-compose down`：停止并删除容器。  
- `docker-compose logs -f`：查看实时日志。

---

### 六、Docker 网络
#### 网络模式
1. Bridge（默认） ：容器通过虚拟网桥与宿主机通信，适合单机多容器互联。  
2. Host：容器直接使用宿主机的网络命名空间，性能高但端口冲突风险大。  
3. Overlay：跨主机的容器通信（用于 Docker Swarm 或 Kubernetes 集群）。  
4. None：禁用网络，适用于特殊场景。

#### 自定义网络示例
```bash
# 创建自定义网络
docker network create my-network

# 启动容器并加入网络
docker run -d --name web --network my-network nginx
```


---

### 七、Docker 存储
#### 数据持久化方式
1. Bind Mount：将宿主机目录挂载到容器（如 `-v /宿主机路径:/容器路径`）。  
2. Volume：由 Docker 管理的持久化存储（如 `-v my-volume:/容器路径`）。  
3. tmpfs：内存临时存储，适用于敏感数据（如 `--tmpfs /容器路径`）。

#### 示例：使用 Volume 保存数据库数据
```bash
# 创建 Volume
docker volume create mysql-data

# 启动 MySQL 并挂载 Volume
docker run -d --name mysql -v mysql-data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0
```


---

### 总结：Docker 核心概念的关系
1. 镜像是静态模板，通过 Dockerfile 定义。  
2. 容器是镜像的运行实例，依赖 网络 和 存储 与外界交互。  
3. 仓库用于镜像的分发与协作。  
4. Docker Compose 简化多容器应用的编排。  

通过掌握这些概念，开发者可以高效构建、部署和管理容器化应用，实现环境一致性与快速交付。


## Docker 如何本地打包一个最简单的 Java spring boot 镜像，从头开始

### Docker 本地打包 Java Spring Boot 镜像完整指南

---

#### 一、准备工作
1. 创建 Spring Boot 项目  
   - 使用 [Spring Initializr](https://start.spring.io/) 生成一个最简单的 Web 项目，选择 Maven/Gradle 和 Java 版本（推荐 Java 17+）。  
   - 添加一个 REST 接口用于测试：  
     ```java
     @RestController
     public class DemoController {
         @GetMapping("/hello")
         public String hello() { return "Hello Docker!"; }
     }
     ```


2. 打包为可执行 JAR  
   - 在项目根目录执行构建命令：  
     ```bash
     # Maven
     mvn clean package -DskipTests
     # Gradle
     ./gradlew bootJar
     ```

   - 生成的 JAR 文件位于 `target/*.jar`（Maven）或 `build/libs/*.jar`（Gradle）(().

---

#### 二、编写 Dockerfile
1. 基础镜像选择  
   - 使用官方 OpenJDK 镜像作为基础（推荐 `eclipse-temurin:17-jre-jammy`，体积约 150MB）：  
     ```dockerfile
     FROM eclipse-temurin:17-jre-jammy
     ```


2. 优化镜像结构  
   - 采用分层构建策略（Spring Boot 2.3+ 支持分层 JAR）：  
     ```dockerfile
     ARG JAR_FILE=target/*.jar
     COPY ${JAR_FILE} app.jar
     RUN java -Djarmode=layertools -jar app.jar extract
     COPY --from=extract dependencies/ ./
     COPY --from=extract snapshot-dependencies/ ./
     COPY --from=extract spring-boot-loader/ ./
     COPY --from=extract application/ ./
     ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
     ```

此方法可将镜像体积减少 30% 以上，并加速构建过程(.

3. 简化版 Dockerfile（适合快速上手）  
   ```dockerfile
   # 阶段1：构建 JAR
   FROM maven:3.8.6-eclipse-temurin-17 AS builder
   WORKDIR /app
   COPY . .
   RUN mvn package -DskipTests

   # 阶段2：运行环境
   FROM eclipse-temurin:17-jre-jammy
   WORKDIR /app
   COPY --from=builder /app/target/*.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```


---

#### 三、构建与运行镜像
1. 构建 Docker 镜像  
   - 将 Dockerfile 与 JAR 文件置于同一目录，执行构建命令：  
     ```bash
     docker build -t spring-boot-demo:1.0 .
     ```

   - 查看镜像信息：  
     ```bash
     docker images | grep spring-boot-demo
     ```


2. 启动容器  
   - 运行容器并映射端口：  
     ```bash
     docker run -d -p 8080:8080 --name demo-app spring-boot-demo:1.0
     ```

   - 验证服务：  
     ```bash
     curl http://localhost:8080/hello
     # 输出：Hello Docker!
     ```


---

#### 四、进阶优化技巧
1. 多阶段构建（减小镜像体积）  
   ```dockerfile
   # 构建阶段
   FROM maven:3.8.6 AS build
   WORKDIR /app
   COPY pom.xml .
   RUN mvn dependency:go-offline
   COPY src/ ./src/
   RUN mvn package -DskipTests

   # 运行阶段
   FROM eclipse-temurin:17-jre-alpine
   WORKDIR /app
   COPY --from=build /app/target/*.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

   - Alpine 镜像体积仅 80MB，适合生产环境(.

2. 使用 Jib 插件（无需 Dockerfile）  
   在 `pom.xml` 中添加插件配置：  
   ```xml
   <plugin>
     <groupId>com.google.cloud.tools</groupId>
     <artifactId>jib-maven-plugin</artifactId>
     <version>3.3.1</version>
     <configuration>
       <to>
         <image>spring-boot-demo:jib</image>
       </to>
     </configuration>
   </plugin>
   ```

   - 直接构建镜像：  
     ```bash
     mvn compile jib:dockerBuild
     ```


3. 环境变量注入  
   ```dockerfile
   ENV SPRING_PROFILES_ACTIVE=prod
   ENV JAVA_OPTS="-Xmx512m -Xms256m"
   ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
   ```


---

#### 五、常见问题排查

| 问题现象                  | 解决方案                                                                 |
|---------------------------|-------------------------------------------------------------------------|
| 镜像构建失败          | 检查 Dockerfile 路径是否正确，确保 JAR 文件存在(           |
| 容器启动后立即退出    | 添加 `-d` 参数后台运行，或检查日志：`docker logs demo-app`     |
| 端口冲突              | 修改映射端口：`-p 8090:8080`                                    |
| 时区不一致            | 添加时区配置：`-e TZ=Asia/Shanghai`                           |


---

#### 六、最佳实践总结
1. 镜像分层原则  
   - 高频变更层（如应用代码）放在上层，低频变更层（如依赖库）放在下层(.

2. 安全建议  
   - 使用非 root 用户运行容器：  
     ```dockerfile
     RUN adduser -D appuser && chown -R appuser /app
     USER appuser
     ```


3. CI/CD 集成  
   - 在 GitLab CI 中配置自动化流水线：  
     ```yaml
     build-image:
       stage: build
       script:
         - docker build -t registry.example.com/myapp:$CI_COMMIT_SHA .
         - docker push registry.example.com/myapp:$CI_COMMIT_SHA
     ```


---

通过以上步骤，您已掌握从零开始构建 Spring Boot Docker 镜像的核心方法。建议优先使用多阶段构建和分层 JAR 技术优化生产环境镜像，同时结合 Jib 等工具实现更高效的云原生部署。


# 参考资料

https://zhuanlan.zhihu.com/p/27327515233

* any list
{:toc}