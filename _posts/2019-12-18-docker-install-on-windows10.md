---
layout: post
title: Docker 在 Windows10 环境安装教程
date:  2019-12-18 11:34:23 +0800
categories: [Docker]
tags: [docker, windows, devops, sh]
published: true
---



# Win10 安装 docker

现在 Docker 有专门的 Win10 专业版系统的安装包，需要开启Hyper-V。

## Hyper-V

1. windows 直接搜索【启用或关闭Windows功能】

2. 选中 Hyper-V

![选中 Hyper-V](http://www.runoob.com/wp-content/uploads/2017/12/1513668234-6433-20171206211858191-1177002365.png)

## Store 下载 docker 安装包

[https://store.docker.com/editions/community/docker-ce-desktop-windows](https://store.docker.com/editions/community/docker-ce-desktop-windows)

需要注册登录。

直接下载安装即可，比较简单。

## 启动

直接启动 docker 服务。

- 版本信息测试

命令行输入

```
docker version
```

日志如下：

```
Client:
 Version:           18.06.1-ce
 API version:       1.38
 Go version:        go1.10.3
 Git commit:        e68fc7a
 Built:             Tue Aug 21 17:21:34 2018
 OS/Arch:           windows/amd64
 Experimental:      false

Server:
 Engine:
  Version:          18.06.1-ce
  API version:      1.38 (minimum version 1.24)
  Go version:       go1.10.3
  Git commit:       e68fc7a
  Built:            Tue Aug 21 17:36:40 2018
  OS/Arch:          windows/amd64
  Experimental:     false
```

## hello world

执行以下命令：

```
docker run hello-world
```

日志如下：

```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
e46172273a4e: Pull complete
1f7d468f830c: Pull complete
35655e48c5c5: Pull complete
8159aad5f944: Pull complete
Digest: sha256:0add3ace90ecb4adbf7777e9aacf18357296e799f81cabc9fde470971e499788
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (windows-amd64, nanoserver-1803)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run a Windows Server container with:
 PS C:\> docker run -it microsoft/windowsservercore powershell

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
https://docs.docker.com/get-started/
```


# 容器实战记录

按照官方 [container](https://docs.docker.com/get-started/part2/) 记录一下。

## 思维的转变 

以前我们的项目都非常依赖于本地的环境，docker 正是解决这个痛点。

## 新的开发环境

在过去，如果您要开始编写Python应用程序，那么您的第一个业务是在您的计算机上安装Python运行时。但是，这会导致您的计算机上的环境需要非常适合您的应用程序按预期运行，并且还需要与您的生产环境相匹配。

使用Docker，您可以将可移植的Python运行时作为映像获取，无需安装。然后，您的构建可以在应用程序代码旁边包含基本Python映像，确保您的应用程序，其依赖项和运行时都一起运行。

这些可移植图像由称为Dockerfile的东西定义。

## 自定义 Dockerfile

Dockerfile定义容器内环境中发生的事情。

对网络接口和磁盘驱动器等资源的访问在此环境中进行虚拟化，该环境与系统的其他部分隔离，因此您需要将端口映射到外部世界，并具体说明要“复制”到哪些文件那个环境。

但是，在执行此操作之后，您可以预期在此Dockerfile中定义的应用程序的构建在其运行的任何位置都会完全相同。

直接在一个空文件夹下 `D:\_docker\hello` 新建文件:

- Dockerfile

内容如下：

```Dockerfile
# Use an official Python runtime as a parent image
FROM python:2.7-slim

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "app.py"]
```

## app 相关配置

再创建两个文件，requirements.txt和app.py，并将它们与Dockerfile放在同一个文件夹中。

这完成了我们的应用程序，您可以看到它非常简单。

当上面的Dockerfile内置到映像中时，由于Dockerfile的COPY命令，app.py和requirements.txt存在，并且由于EXPOSE命令，app.py的输出可通过HTTP访问。

- requirements.txt

```
Flask
Redis
```

- app.py

```py
from flask import Flask
from redis import Redis, RedisError
import os
import socket

# Connect to Redis
redis = Redis(host="redis", db=0, socket_connect_timeout=2, socket_timeout=2)

app = Flask(__name__)

@app.route("/")
def hello():
    try:
        visits = redis.incr("counter")
    except RedisError:
        visits = "<i>cannot connect to Redis, counter disabled</i>"

    html = "<h3>Hello {name}!</h3>" \
           "<b>Hostname:</b> {hostname}<br/>" \
           "<b>Visits:</b> {visits}"
    return html.format(name=os.getenv("NAME", "world"), hostname=socket.gethostname(), visits=visits)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)
```

现在我们看到pip install -r requirements.txt为Python安装了Flask和Redis库，应用程序打印环境变量NAME，以及对socket.gethostname（）的调用输出。

最后，因为Redis没有运行（因为我们只安装了Python库，而不是Redis本身），我们应该期望在这里使用它的尝试失败并产生错误消息。

注意：在容器内部访问容器ID时，访问主机名称，这类似于正在运行的可执行文件的进程ID。

而已！您的系统上不需要Python或requirements.txt中的任何内容，构建或运行此映像也不需要在系统上安装它们。

看起来你并没有真正建立一个Python和Flask的环境，但你有。


## 编译 app

```
$ ls
Dockerfile  app.py  requirements.txt
```

- 运行命令

```
docker build -t friendlyhello .
```

报错如下:

```
$ docker build -t friendlyhello .
Sending build context to Docker daemon   5.12kB
Step 1/7 : FROM python:2.7-slim
2.7-slim: Pulling from library/python
no matching manifest for unknown in the manifest list entries
```

解决方式：

鼠标右击docker图标，进入设置（settings）=> Daemon ，开启advance，把json 里面的experimental设置为true，保存重启docker即可。

```json
{
  "registry-mirrors": [],
  "insecure-registries": [],
  "debug": true,
  "experimental": true
}
```

再次运行，然后又报错：

```
Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

解决方案：

修改 Dockerfile 文件内容：

添加 

```
COPY requirements.txt requirements.txt
COPY app.py app.py
```

如下

```Dockerfile
# Use an official Python runtime as a parent image
FROM python:2.7-slim

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
COPY requirements.txt requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
COPY app.py app.py
CMD ["python", "app.py"]
```

## 查看镜像

```
$  docker image ls
```

可以看到我们生成的 friendlyhello

## 运行镜像

```
$ docker run -p 4000:80 friendlyhello
```

日志如下：

```
* Serving Flask app "app" (lazy loading)
 * Environment: production
   WARNING: Do not use the development server in a production environment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://0.0.0.0:80/ (Press CTRL+C to quit)
```

## 访问


您应该在 http://0.0.0.0:80 看到Python正在为您的应用程序提供服务的消息。

但是该消息来自容器内部，它不知道您将该容器的端口80映射到4000，从而生成正确的

URL http://localhost:4000。

在Web浏览器中转到该URL，以查看在网页上提供的显示内容。

```
Hello World!
Hostname: 91e8fe19ed4f
Visits: cannot connect to Redis, counter disabled
```

## 服务的关闭

在 windows 下 crtl+c 并不能关闭服务。

1、crtl+c 停止当前运行

2、查看运行的容器

```
$ docker container ls
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS
     NAMES
91e8fe19ed4f        friendlyhello       "python app.py"     3 minutes ago       Up 3 minutes        0.0.0.0:4000->80/tcp   hardcore_saha
```

3、停止容器运行

```
$   docker container stop 91e8fe19ed4f
```


# 发布你的应用

为了演示我们刚刚创建的内容的可移植性，让我们上传我们构建的图像并在其他地方运行它。

毕竟，当您想要将容器部署到生产环境时，您需要知道如何推送到注册表。

注册表是存储库的集合，存储库是图像的集合 - 类似于GitHub存储库，除了代码已经构建。

注册表上的帐户可以创建许多存储库。 

docker CLI 默认使用Docker的公共注册表。

注意：我们在这里使用Docker的公共注册表只是因为它是免费和预先配置的，但有许多公共注册表可供选择，您甚至可以使用Docker Trusted Registry设置自己的私有注册表。

## 登录

[https://hub.docker.com/](https://hub.docker.com/) 注册一个账号。

```
docker login
```

## Tag the image


将本地映像与注册表上的存储库相关联的表示法是 `username/repository:tag`。

标签是可选的，但建议使用，因为它是注册管理机构用来为Docker镜像提供版本的机制。

为存储库提供存储库和标记有意义的名称，

例如 get-started：part2。这会将图像放入启动存储库并将其标记为part2。

现在，把它们放在一起来标记图像。使用您的用户名，存储库和标记名称运行docker标记图像，以便将图像上载到所需的目标位置。

该命令的语法是：

```
docker tag image username/repository:tag
```

比如：

```
docker tag friendlyhello houbinbin/get-started:part2
```

- 查看 image

```
docker image ls
```

列表如下：

```
$   docker image ls
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
houbinbin/get-started   part2               90679c282e92        About an hour ago   197MB
friendlyhello           latest              90679c282e92        About an hour ago   197MB
```

## 发布镜像

```
docker push username/repository:tag
```

比如本次测试：

```
docker push houbinbin/get-started:part2
```

日志信息如下：

```
The push refers to repository [docker.io/houbinbin/get-started]
b30ed0fb7d8e: Pushing [==================================================>]  262.7kB/262.7kB
1aa231cafcfb: Pushing [==================================================>]  18.87MB/18.87MB
248b10e4b05a: Pushing [==================================================>]  262.7kB/262.7kB
19b68405debc: Pushing [==================================================>]  262.7kB/262.7kB
639216b11d4f: Mounted from library/python
473e9a98e4dd: Mounted from library/python
9ff579683928: Mounted from library/python
237472299760: Mounted from library/python
part2: digest: sha256:f8d76901924a48e01b40ff4d1cad676df04d7eb9a9ad403cf1f38501897cfedd size: 1995
```

## 查询自己发布的 image

直接登录 [docker hub](https://hub.docker.com) 可以查看对应的镜像信息。

# 个人使用 SecureCRT 登录

直接输入信息

ip: 192.168.99.100

port: 22

用户名：docker 

密码： tcuser

# 参考资料

[docker 小白 windows 学习坑点记录](https://www.jianshu.com/p/b677c1f80e43)

[https://docs.docker.com/toolbox/overview/#whats-in-the-box](https://docs.docker.com/toolbox/overview/#whats-in-the-box)

[Docker学习记录（一）：Windows7下Docker的安装](https://blog.csdn.net/xiangxiezhuren/article/details/79698913)

[windows下 docker-machine 报错 Error checking TLS connection](https://segmentfault.com/a/1190000009508193)

* any list
{:toc}