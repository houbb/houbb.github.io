- Download


[download](http://www.sonatype.com/download-oss-sonatype)

A bundle with Jetty, only need *JRE*. I choose this way ```nexus-2.13.0-01-bundle.tar.gz```;


- Unzip

```
$ tar -zxf nexus-2.13.0-01-bundle.tar.gz
$ ls
nexus-2.13.0-01  nexus-2.13.0-01-bundle.tar.gz  sonatype-work
```

- Start

```
$ pwd
/home/hbb/tool/nexus/nexus-2.13.0-01/bin
$ ./nexus start
Starting Nexus OSS...
Started Nexus OSS.
```

- Visit

```
localhost:8081/nexus
```

default auth is ```admin/admin123```



