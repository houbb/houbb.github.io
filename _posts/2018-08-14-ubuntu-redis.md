---
layout: post
title:  Ubuntu Redis
date:  2018-08-14 13:46:27 +0800
categories: [Ubuntu]
tags: [ubuntu, nosql]
published: true
---

* any list
{:toc}

- Download

```
$ wget http://download.redis.io/releases/redis-3.2.0.tar.gz
$ tar xzf redis-3.2.0.tar.gz
$ cd redis-3.2.0
$ make
$ make test
$ sudo make install
```

- Config redis

```
vi /home/hbb/tool/redis/redis-3.2.0/redis.conf
```


change the content ```dir .```  into

```
dir /home/hbb/tool/redis/redis_data
```

add

```
requirepass 123456
```


- Start

```
$ pwd
/home/hbb/tool/redis/redis-3.2.0
$ src/redis-server redis.conf &
```

and you may see

```
5836:M 01 Jan 14:17:43.025 # Server can't set maximum open files to 10032 because of OS error: Operation not permitted.
5836:M 01 Jan 14:17:43.025 # Current maximum open files is 4096. maxclients has been reduced to 4064 to compensate for low ulimit. If you need higher maxclients increase 'ulimit -n'.
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 3.2.0 (00000000/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running in standalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
 |    `-._   `._    /     _.-'    |     PID: 5836
  `-._    `-._  `-./  _.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |           http://redis.io
  `-._    `-._`-.__.-'_.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |
  `-._    `-._`-.__.-'_.-'    _.-'
      `-._    `-.__.-'    _.-'
          `-._        _.-'
              `-.__.-'

5836:M 01 Jan 14:17:43.028 # WARNING: The TCP backlog setting of 511 cannot be enforced because /proc/sys/net/core/somaxconn is set to the lower value of 128.
5836:M 01 Jan 14:17:43.028 # Server started, Redis version 3.2.0
5836:M 01 Jan 14:17:43.028 # WARNING overcommit_memory is set to 0! Background save may fail under low memory condition. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
5836:M 01 Jan 14:17:43.029 # WARNING you have Transparent Huge Pages (THP) support enabled in your kernel. This will create latency and memory usage issues with Redis. To fix this issue run the command 'echo never > /sys/kernel/mm/transparent_hugepage/enabled' as root, and add it to your /etc/rc.local in order to retain the setting after a reboot. Redis must be restarted after THP is disabled.
5836:M 01 Jan 14:17:43.029 * The server is now ready to accept connections on port 6379
```

- Test connect

```
$ redis-cli -a 123456 ping
PONG
```


- Shutdown

```
redis-cli -a 123456 shutdown
```
