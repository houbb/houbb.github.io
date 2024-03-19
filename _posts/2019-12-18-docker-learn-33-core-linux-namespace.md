---
layout: post
title: Docker learn-09-Docker 核心技术之 Linux Namespace
date:  2019-12-18 11:34:23 +0800
categories: [Devpos]
tags: [docker, windows, devops, sh]
published: true
---

# Docker 

时下最热的技术莫过于Docker了，很多人都觉得Docker是个新技术，其实不然，Docker除了其编程语言用go比较新外，其实它还真不是个新东西，也就是个新瓶装旧酒的东西，所谓的The New “Old Stuff”。

ps: 这里也可以发现我们平时对于新技术的一直追求，其实只是因为**没有掌握其核心原理而已**。

Docker和Docker衍生的东西用到了很多很酷的技术，我会用几篇文章来把这些技术给大家做个介绍，希望通过这些文章大家可以自己打造一个山寨版的docker。

## 碎片化

当然，文章的风格一定会尊重时下的“流行”——我们再也没有整块整块的时间去看书去专研，而我们只有看微博微信那样的碎片时间（那怕我们有整块的时间，也被那些在手机上的APP碎片化了）。

所以，这些文章的风格必然坚持“马桶风格”（希望简单到占用你拉一泡屎就时间，而且你还不用动脑子，并能学到些东西）

废话少说，我们开始。先从Linux Namespace开始。

ps: 其实我们每天都有整块的时间，我感觉作者这里是明显的讽刺。

不过博客就应该这样循循善诱，深入浅出。

# Linux Namespace

## 简介

Linux Namespace是Linux提供的一种内核级别环境隔离的方法。

不知道你是否还记得很早以前的Unix有一个叫chroot的系统调用（通过修改根目录把用户jail到一个特定目录下），chroot提供了一种简单的隔离模式：

chroot内部的文件系统无法访问外部的内容。

Linux Namespace在此基础上，提供了对UTS、IPC、mount、PID、network、User等的隔离机制。

举个例子，我们都知道，Linux下的超级父亲进程的PID是1，所以，同chroot一样，如果我们可以把用户的进程空间jail到某个进程分支下，并像chroot那样让其下面的进程 看到的那个超级父进程的PID为1，于是就可以达到资源隔离的效果了（不同的PID namespace中的进程无法看到彼此）

## 1.关于 Linux Namespace

Linux提供如下Namespace:

```
Namespace   Constant          Isolates
Cgroup      CLONE_NEWCGROUP   Cgroup root directory
IPC         CLONE_NEWIPC      System V IPC, POSIX message queues
Network     CLONE_NEWNET      Network devices, stacks, ports, etc.
Mount       CLONE_NEWNS       Mount points
PID         CLONE_NEWPID      Process IDs
User        CLONE_NEWUSER     User and group IDs
UTS         CLONE_NEWUTS      Hostname and NIS domain name
```

以上Namespace分别对进程的 Cgroup root、进程间通信、网络、文件系统挂载点、进程ID、用户和组、主机名域名等进行隔离。

# 6种命名空间

## UTS namespace

UTS namespace 对主机名和域名进行隔离。为什么要隔离主机名？因为主机名可以代替IP来访问。如果不隔离，同名访问会出冲突。

## IPC namespace

Linux 提供很多种进程通信机制，IPC namespace 针对 System V 和 POSIX 消息队列，这些 IPC 机制会使用标识符来区别不同的消息队列，然后两个进程通过标识符找到对应的消息队列。

IPC namespace 使得 相同的标识符在两个 namespace 代表不同的消息队列，因此两个namespace 中的进程不能通过 IPC 来通信。

## PID namespace

隔离进程号，不同namespace 的进程可以使用相同的进程号。
当创建一个 PID namespace 时，第一个进程的PID 是1，即 init 进程。它负责回收所有孤儿进程的资源，所有发给 init 进程的信号都会被屏蔽。

## Mount namespace

隔离文件挂载点，每个进程能看到的文件系统都记录在/proc/$$/mounts里。在一个 namespace 里挂载、卸载的动作不会影响到其他 namespace。

## Network namespace

隔离网络资源。每个 namespace 都有自己的网络设备、IP、路由表、/proc/net 目录、端口号等。网络隔离可以保证独立使用网络资源，比如开发两个web 应用可以使用80端口。

新创建的 Network namespace 只有 loopback 一个网络设备，需要手动添加网络设备。

## User namespace

隔离用户和用户组。它的厉害之处在于，可以让宿主机上的一个普通用户在 namespace 里成为 0 号用户，也就是 root 用户。这样普通用户可以在容器内“随心所欲”，但是影响也仅限在容器内。

最后，回到 Docker 上，经过上述讨论，namespace 和 cgroup 的使用很灵活，需要注意的地方也很多。 

Docker 通过 Libcontainer 来做这些脏活累活。

用户只需要使用 Docker API 就可以优雅地创建一个容器。

docker exec 的底层实现就是上面提过的 setns 。

## 系统调用

创建容器（进程）主要用到三个系统调用：

```
clone() – 实现线程的系统调用，用来创建一个新的进程，并可以通过上述参数达到隔离
unshare() – 使某进程脱离某个namespace
setns() – 把某进程加入到某个namespace
```

# 举个例子（PID namespace）

## 启动一个容器

```
$ docker run -it busybox /bin/sh
/ #
```

## 查看容器中的进程 id(可以看到/bin/sh的pid=1)

```
/ # ps
PID   USER     TIME  COMMAND
    1 root      0:00 /bin/sh
    5 root      0:00 ps
```

## 查看宿主机中的该/bin/sh的进程id

```
# ps -ef |grep busy
root      3702  3680  0 15:53 pts/0    00:00:00 docker run -it busybox /bin/sh
```

可以看到，我们在Docker里最开始执行的/bin/sh，就是这个容器内部的第1号进程（PID=1），而在宿主机上看到它的PID=3702。

这就意味着，前面执行的/bin/sh，已经被Docker隔离在了一个跟宿主机完全不同的世界当中。

而这就是Docker在启动一个容器（创建一个进程）时使用了 PID namespace

```
int pid = clone(main_function, stack_size, CLONE_NEWPID | SIGCHLD, NULL);
```

这时候，Docker就会在这个PID=3702的进程启动时给他施一个“障眼法”，让他永远看不到不属于它这个namespace中的进程。

这种机制，其实就是对被隔离应用的进程空间做了手脚，使得这些进程只能看到重新计算过的进程编号，比如PID=1。

可实际上，他们在宿主机的操作系统里，还是原来的第3702号进程。

然后如果你自己只用PID namespace使用上述的clone()创建一个进程，查看ps或top等命令时，却还是能看到所有进程。

说明并没有完全隔离，这是因为，像ps、top这些命令会去读/proc文件系统，而此时你创建的隔离了pid的进程和宿主机使用的是同一个/proc文件系统，所以这些命令显示的东西都是一样的。

所以，我们还需要使其它的namespace隔离，如文件系统进行隔离。

# 对照 Docker 源码

当启动一个docker容器时，会调用到dockerd提供的 `/containers/{name:.*}/start` 接口，然后启动一个容器，docker服务收到请求后，调用关系如下：

```go
//注册http handler
router.NewPostRoute("/containers/{name:.*}/start", r.postContainersStart)
//
func (s *containerRouter) postContainersStart(ctx context.Context, w http.ResponseWriter, r *http.Request, vars map[string]string) error 
//
func (daemon *Daemon) ContainerStart(name string, hostConfig *containertypes.HostConfig, checkpoint string, checkpointDir string) error 
//
func (daemon *Daemon) containerStart(container *container.Container, checkpoint string, checkpointDir string, resetRestartManager bool) (err error) {
    //...
    spec, err := daemon.createSpec(container)
	//...
    err = daemon.containerd.Create(context.Background(), container.ID, spec, createOptions)
	//...
	pid, err := daemon.containerd.Start(context.Background(), container.ID, checkpointDir,
		container.StreamConfig.Stdin() != nil || container.Config.Tty,
		container.InitializeStdio)
	//...
	container.SetRunning(pid, true)
	//...
}
```

可以看到在Daemon.containerStart接口中创建并启动了容器，而创建容器时传入的spec参数就包含了namespace，我们再来看看daemon.createSpec(container)接口返回的spec是什么：

```go
func (daemon *Daemon) createSpec(c *container.Container) (retSpec *specs.Spec, err error) {
    s := oci.DefaultSpec()
    //...
    if err := setUser(&s, c); err != nil {
		return nil, fmt.Errorf("linux spec user: %v", err)
	}
	if err := setNamespaces(daemon, &s, c); err != nil {
		return nil, fmt.Errorf("linux spec namespaces: %v", err)
	}
	//...
	return &s
}

//oci.DefaultSpec()会调用DefaultLinuxSpec,可以看到返回的spec中包含了namespace
func DefaultLinuxSpec() specs.Spec {
    s := specs.Spec{
		Version: specs.Version,
		Process: &specs.Process{
			Capabilities: &specs.LinuxCapabilities{
				Bounding:    defaultCapabilities(),
				Permitted:   defaultCapabilities(),
				Inheritable: defaultCapabilities(),
				Effective:   defaultCapabilities(),
			},
		},
		Root: &specs.Root{},
	}
	s.Mounts = []specs.Mount{
		{
			Destination: "/proc",
			Type:        "proc",
			Source:      "proc",
			Options:     []string{"nosuid", "noexec", "nodev"},
		},
		{
			Destination: "/sys/fs/cgroup",
			Type:        "cgroup",
			Source:      "cgroup",
			Options:     []string{"ro", "nosuid", "noexec", "nodev"},
		},
		//...
	}

	s.Linux = &specs.Linux{
	    //...
		Namespaces: []specs.LinuxNamespace{
			{Type: "mount"},
			{Type: "network"},
			{Type: "uts"},
			{Type: "pid"},
			{Type: "ipc"},
		},
		//...
	//...
	return s
}

//而在setNamespaces中还会根据其它配置对namespace进行修改
func setNamespaces(daemon *Daemon, s *specs.Spec, c *container.Container) error {
	userNS := false
	// user
	if c.HostConfig.UsernsMode.IsPrivate() {
		uidMap := daemon.idMapping.UIDs()
		if uidMap != nil {
			userNS = true
			ns := specs.LinuxNamespace{Type: "user"}
			setNamespace(s, ns)
			s.Linux.UIDMappings = specMapping(uidMap)
			s.Linux.GIDMappings = specMapping(daemon.idMapping.GIDs())
		}
	}
	// network
	if !c.Config.NetworkDisabled {
		ns := specs.LinuxNamespace{Type: "network"}
		parts := strings.SplitN(string(c.HostConfig.NetworkMode), ":", 2)
		if parts[0] == "container" {
			nc, err := daemon.getNetworkedContainer(c.ID, c.HostConfig.NetworkMode.ConnectedContainer())
			if err != nil {
				return err
			}
			ns.Path = fmt.Sprintf("/proc/%d/ns/net", nc.State.GetPID())
			if userNS {
				// to share a net namespace, they must also share a user namespace
				nsUser := specs.LinuxNamespace{Type: "user"}
				nsUser.Path = fmt.Sprintf("/proc/%d/ns/user", nc.State.GetPID())
				setNamespace(s, nsUser)
			}
		} else if c.HostConfig.NetworkMode.IsHost() {
			ns.Path = c.NetworkSettings.SandboxKey
		}
		setNamespace(s, ns)
	}

	// ipc
	ipcMode := c.HostConfig.IpcMode
	switch {
	case ipcMode.IsContainer():
		ns := specs.LinuxNamespace{Type: "ipc"}
		ic, err := daemon.getIpcContainer(ipcMode.Container())
		if err != nil {
			return err
		}
		ns.Path = fmt.Sprintf("/proc/%d/ns/ipc", ic.State.GetPID())
		setNamespace(s, ns)
		if userNS {
			// to share an IPC namespace, they must also share a user namespace
			nsUser := specs.LinuxNamespace{Type: "user"}
			nsUser.Path = fmt.Sprintf("/proc/%d/ns/user", ic.State.GetPID())
			setNamespace(s, nsUser)
		}
	case ipcMode.IsHost():
		oci.RemoveNamespace(s, specs.LinuxNamespaceType("ipc"))
	case ipcMode.IsEmpty():
		// A container was created by an older version of the daemon.
		// The default behavior used to be what is now called "shareable".
		fallthrough
	case ipcMode.IsPrivate(), ipcMode.IsShareable(), ipcMode.IsNone():
		ns := specs.LinuxNamespace{Type: "ipc"}
		setNamespace(s, ns)
	default:
		return fmt.Errorf("Invalid IPC mode: %v", ipcMode)
	}

	// pid
	if c.HostConfig.PidMode.IsContainer() {
		ns := specs.LinuxNamespace{Type: "pid"}
		pc, err := daemon.getPidContainer(c)
		if err != nil {
			return err
		}
		ns.Path = fmt.Sprintf("/proc/%d/ns/pid", pc.State.GetPID())
		setNamespace(s, ns)
		if userNS {
			// to share a PID namespace, they must also share a user namespace
			nsUser := specs.LinuxNamespace{Type: "user"}
			nsUser.Path = fmt.Sprintf("/proc/%d/ns/user", pc.State.GetPID())
			setNamespace(s, nsUser)
		}
	} else if c.HostConfig.PidMode.IsHost() {
		oci.RemoveNamespace(s, specs.LinuxNamespaceType("pid"))
	} else {
		ns := specs.LinuxNamespace{Type: "pid"}
		setNamespace(s, ns)
	}
	// uts
	if c.HostConfig.UTSMode.IsHost() {
		oci.RemoveNamespace(s, specs.LinuxNamespaceType("uts"))
		s.Hostname = ""
	}

	return nil
}
func setNamespace(s *specs.Spec, ns specs.LinuxNamespace) {
	for i, n := range s.Linux.Namespaces {
		if n.Type == ns.Type {
			s.Linux.Namespaces[i] = ns
			return
		}
	}
	s.Linux.Namespaces = append(s.Linux.Namespaces, ns)
}
```

其实很早以前Docker创建一个容器，获取namespace是通过CloneFlags函数，后来有了开放容器计划(OCI)规范后，就改为了以上面代码中方式创建容器。

OCI之前代码如下：

```go
var namespaceInfo = map[NamespaceType]int{
	NEWNET:  unix.CLONE_NEWNET,
	NEWNS:   unix.CLONE_NEWNS,
	NEWUSER: unix.CLONE_NEWUSER,
	NEWIPC:  unix.CLONE_NEWIPC,
	NEWUTS:  unix.CLONE_NEWUTS,
	NEWPID:  unix.CLONE_NEWPID,
}

// CloneFlags parses the container's Namespaces options to set the correct
// flags on clone, unshare. This function returns flags only for new namespaces.
func (n *Namespaces) CloneFlags() uintptr {
	var flag int
	for _, v := range *n {
		if v.Path != "" {
			continue
		}
		flag |= namespaceInfo[v.Type]
	}
	return uintptr(flag)
}
func (c *linuxContainer) newInitProcess(p *Process, cmd *exec.Cmd, parentPipe, childPipe *os.File) (*initProcess, error) {     t := "_LIBCONTAINER_INITTYPE=standard"
    //
    //没错，就是这里～
    //
    cloneFlags := c.config.Namespaces.CloneFlags()
    if cloneFlags&syscall.CLONE_NEWUSER != 0 {
        if err := c.addUidGidMappings(cmd.SysProcAttr); err != nil {
            // user mappings are not supported
            return nil, err
        }
        enableSetgroups(cmd.SysProcAttr)
        // Default to root user when user namespaces are enabled.
        if cmd.SysProcAttr.Credential == nil {
            cmd.SysProcAttr.Credential = &syscall.Credential{}
        }
    }
    cmd.Env = append(cmd.Env, t)
    cmd.SysProcAttr.Cloneflags = cloneFlags
    return &initProcess{
        cmd:        cmd,
        childPipe:  childPipe,
        parentPipe: parentPipe,
        manager:    c.cgroupManager,
        config:     c.newInitConfig(p),
    }, nil
}
```

现在，容器运行时，通过OCI这个容器运行时规范同底层的Linux操作系统进行交互，

即：把容器操作请求翻译成对Linux操作系统的调用（操作Linux Namespace和Cgroups等）。

# 参考资料

[DOCKER基础技术：LINUX NAMESPACE（上）](https://coolshell.cn/articles/17010.html)

[DOCKER基础技术：LINUX NAMESPACE（下）](https://coolshell.cn/articles/17029.html)

# 拓展阅读

[code shell docker 系列博客](https://coolshell.cn/tag/docker)

* any list
{:toc}