---
layout: post
title: Docker-05-Rancher
date:  2019-12-18 11:34:23 +0800
categories: [Devops]
tags: [docker, devops, sh]
published: true
---

# Rancher

[Rancher](http://rancher.com/) is an open source software platform that enables organizations to run containers in production.
With Rancher, organizations no longer have to build a container services platform from scratch using a distinct set of open source technologies.
Rancher supplies the entire software stack needed to manage containers in production.

[Rancher](http://rancher.com/) 是一个开放源代码软件平台，使组织可以在生产中运行容器。

使用Rancher，组织不再需要使用一套独特的开源技术从头开始构建容器服务平台。

Rancher提供了管理生产中的容器所需的整个软件堆栈。

# Quick Start

<uml>
    Env Prepare->Install:
    Install->Show Log:
    Show Log->Visit:
</uml>

- Env Prepare

Provision a Linux host with 64-bit Ubuntu 16.04, which must have a kernel of 3.10+. You can use your laptop, a virtual machine, or a physical server.
Please make sure the Linux host has at least **1GB** memory.

Install [Docker](https://docs.docker.com) onto the host.

- Install Rancher

```
sudo docker run -d --restart=unless-stopped -p 8080:8080 rancher/server
```

it will download what it need, just wait...(^_^)

```
Unable to find image 'rancher/server:latest' locally


latest: Pulling from rancher/server

96c6a1f3c3b0: Pull complete
ed40d4bcb313: Pull complete
b171f9dbc13b: Pull complete
ccfc4df4fbba: Pull complete
9e4d5a1238bb: Downloading [====================>                              ] 51.36 MB/126.7 MB
f986ba0d224d: Download complete
303d9649bb89: Download complete
56825bfb5bb7: Download complete
86a35696481e: Download complete
eb2848176ff4: Download complete
fabbcc718243: Download complete
35489637da84: Download complete
5c005e2df0e8: Download complete
64ba16c4c9f4: Downloading [============>                                      ] 23.25 MB/93.9 MB
```

many years later...

- Run the Server

```
houbinbindeMacBook-Pro:~ houbinbin$ sudo docker run -d --restart=unless-stopped -p 8080:8080 rancher/server
64c8c24bcd22622b309ee086e80f193c9923fbfef42c2245481f19aa3e3b2f08
```

see the log

```
sudo docker logs -f 64c8c24bcd22622b309ee086e80f193c9923fbfef42c2245481f19aa3e3b2f08

14:53:53.707 [main] INFO  ConsoleStatus - [DONE ] [49188ms] Startup Succeeded, Listening on port 8081
time="2016-10-26T14:53:54Z" level=info msg="Starting websocket proxy. Listening on [:8080], Proxying to cattle API at [localhost:8081], Monitoring parent pid [8]
```

- Visit

Enter ```localhost:8080``` in browser, and you may see

![rancher-index](https://raw.githubusercontent.com/houbb/resource/master/img/rancher/2016-10-26-rancher-index.png)


- Get the IP of ```rancher-server``` container


下文中 `\` 转义符号，实际使用请替换掉。(这和 jekyll 模板冲突)

```
$   houbinbindeMacBook-Pro:~ houbinbin$ docker inspect --format '\{\{ .NetworkSettings.IPAddress \}\}' rancher-server

    172.17.0.2
```

- ADD HOSTS

Click **Infrastructure**, into **Hosts** page, click **Add Host**

We will only be adding the Rancher server host itself. Click **Save**.
By default, the **Custom** option will be selected, which provides the Docker command to launch the Rancher agent container.
There will also be options for cloud providers, which Rancher uses Docker Machine to launch hosts.

![rancher-add-host](https://raw.githubusercontent.com/houbb/resource/master/img/rancher/2016-10-26-rancher-add-hosts.png)

1、Add the IP of ```rancher-server``` container in **Something else**

```
http://172.17.0.2:8080
```

2、Copy and run this:

```
sudo docker run -d --privileged -v /var/run/docker.sock:/var/run/docker.sock -v /var/lib/rancher:/var/lib/rancher rancher/agent:v1.0.2 http://localhost:8080/v1/scripts/F6FA7D73AD9CEDEFDFFC:1477494000000:sDaoXvLMo7ZYn9rEmf0CLplZ2iI
```

and it may like this:

```
Unable to find image 'rancher/agent:v1.0.2' locally
v1.0.2: Pulling from rancher/agent
5a132a7e7af1: Downloading [============================================>      ] 57.85 MB/65.69 MB
fd2731e4c50c: Download complete
28a2f68d1120: Download complete
a3ed95caeb02: Download complete
7fa4fac65171: Downloading [=>                                                 ] 2.162 MB/97.48 MB
33de63de5fdb: Download complete
d00b3b942272: Download complete
```

many years later...

<label class="label label-danger">Error</label>

In Mac, may get error like this:

```
Digest: sha256:b0b532d1e891534779d0eb1a01a5717ebfff9ac024db4412ead87d834ba92544
Status: Downloaded newer image for rancher/agent:v1.0.2
88e97942429d406bea7912ecf58f752c3c3e605c8bc1390bc169aaa17c498537
docker: Error response from daemon: Mounts denied:
The path /var/lib/rancher
is not shared from OS X and is not known to Docker.
You can configure shared paths from Docker -> Preferences... -> File Sharing.
See https://docs.docker.com/docker-for-mac/osxfs/#namespaces for more info.
...
```

Get [more](https://docs.docker.com/docker-for-mac/osxfs/#namespaces) from here, we can change the the command like this in [Mac](http://icyleaf.com/)


```
sudo docker run -d --privileged -v /var/run/docker.sock:/var/run/docker.sock -v /Users/houbinbin/docker/rancher/var/lib/rancher:/var/lib/rancher rancher/agent:v1.0.2 http://172.17.0.2:8080/v1/scripts/ABD244B661452F490C0E:1477533600000:fD9nnKGL4a15IGh9CDoM14ZLLo4

3bdf3d044694c30923c7b492b1b19f7e0596aa7355bc4b6b04eac99d6c230956
```

When you click **Close** on the Rancher UI, you will be directed back to the **Infrastructure -> Hosts** view.
In a couple of minutes, the host will automatically appear.

It may like this:

![first-host](https://raw.githubusercontent.com/houbb/resource/master/img/rancher/2016-10-27-rancher-first-host.png)

- Create a Container through UI

1、Navigate to **Stacks**, click the **Add Stack**, provide a name and description. then, click **Create**

2、Enter into one stack, click **Add Service**, provide a name and just use default to **Create** it.

* any list
{:toc}




