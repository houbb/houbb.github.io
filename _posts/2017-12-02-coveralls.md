---
layout: post
title:  Coveralls
date:  2017-12-02 22:54:35 +0800
categories: [CI]
tags: [ci, test]
published: true
---

# Coveralls

[Coveralls](https://coveralls.io/) DELIVER BETTER CODE.


> [前端开源项目持续集成三剑客](http://efe.baidu.com/blog/front-end-continuous-integration-tools/)

 
# Quick Start

- login 

[sign-up](https://coveralls.io/sign-up), 使用 github 登录。

直接会进行对应授权。


- add more repos

添加需要覆盖的代码项目。 [ADD SOME REPOS](https://coveralls.io/repos/new)


- add `.coveralls.yml`

如果使用 [travis-ci](https://houbb.github.io/2017/12/02/travis-ci)，则添加内容如下:

```
service_name: travis-ci
```

- pom.xml

制定一个插件用于生成对应的测试报告。

```xml
<!--mvn cobertura:cobertura coveralls:report -DrepoToken=yourcoverallsprojectrepositorytoken-->
<plugin>
    <groupId>org.eluder.coveralls</groupId>
    <artifactId>coveralls-maven-plugin</artifactId>
    <version>4.3.0</version>
</plugin>

<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>cobertura-maven-plugin</artifactId>
    <version>2.7</version>
    <configuration>
        <format>xml</format>
        <maxmem>256m</maxmem>
        <!-- aggregated reports for multi-module projects -->
        <aggregate>true</aggregate>
        <instrumentation>
            <excludes>
                <exclude>**/*Test.class</exclude>
                <exclude>**/HelpMojo.class</exclude>
                <exclude>**/*Vo.class</exclude>
            </excludes>
        </instrumentation>
    </configuration>
</plugin>
```

详情参考：

> [coveralls-maven-plugin](https://github.com/trautonen/coveralls-maven-plugin)

**注意**：不要将你的 repoToken 上传到 github，这样任何人都可以提交你的覆盖率。

你在本地执行

```
mvn cobertura:cobertura coveralls:report -DrepoToken=yourcoverallsprojectrepositorytoken
```

即可将测试报告上传到 [coveralls](coveralls)。

和 CI 集成上面也有说，但是尝试似乎没效果。在 `.travis.yml` 中添加。


```
after_success:
  - mvn clean cobertura:cobertura coveralls:report
```

## repo-token 

上面的只执行了报告，却没有指定 token。但是 token 却不能提交。解决方案如下：
 
> [让你的Github项目持续集成，基于Travis-CI Coveralls](https://www.jerrylou.me/%E5%B7%A5%E5%85%B7/howto-github-travisci-coveralls-20170120.html)

repo_token涉及安全不应该提交到 `.travis.yml`，coveralls提供了非对称加密repo_token的方法。


- 更改安装源

加密命令travis是用ruby编写的。ruby gem的国外下载源很慢，更改安装源，提高下载速度。

```
gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
gem sources -l
```

log 如下：

```
houbinbindeMacBook-Pro:~ houbinbin$ gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
https://gems.ruby-china.org/ added to sources
https://rubygems.org/ removed from sources
houbinbindeMacBook-Pro:~ houbinbin$ gem sources -l
*** CURRENT SOURCES ***

https://gems.ruby-china.org/
```


- 安装加密命令travis

```
gem install travis
```

日志如下：

```
houbinbindeMacBook-Pro:~ houbinbin$ sudo gem install travis
Building native extensions.  This could take a while...
ERROR:  Error installing travis:
	ERROR: Failed to build gem native extension.

    current directory: /Library/Ruby/Gems/2.3.0/gems/ffi-1.9.18/ext/ffi_c
/System/Library/Frameworks/Ruby.framework/Versions/2.3/usr/bin/ruby -r ./siteconf20171203-16986-1ie9o7b.rb extconf.rb
mkmf.rb can't find header files for ruby at /System/Library/Frameworks/Ruby.framework/Versions/2.3/usr/lib/ruby/include/ruby.h

extconf failed, exit code 1

Gem files will remain installed in /Library/Ruby/Gems/2.3.0/gems/ffi-1.9.18 for inspection.
Results logged to /Library/Ruby/Gems/2.3.0/extensions/universal-darwin-17/2.3.0/ffi-1.9.18/gem_make.out
houbinbindeMacBook-Pro:~ houbinbin$ gem install libcrypt-devel
ERROR:  Could not find a valid gem 'libcrypt-devel' (>= 0) in any repository
```

查了一下需要执行这个命令：

```
$ xcode-select --install
```

会安装对应的软件。重新执行即可。

- 加密 repo_token

```
travis encrypt COVERALLS_TOKEN=your_repo_token
```

到你的项目根目录下，使用命令行执行上述命令 。

```
houbinbindeMacBook-Pro:paradise houbinbin$ travis encrypt COVERALLS_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXx
Detected repository as houbb/paradise, is this correct? |yes| yes
Please add the following to your .travis.yml file:

  secure: "XAAyUvBcXKzyFQtEFbUn65DNFvpmYWx+XMDDRiuVs7lm/VQ9SHrFj4qK5QKh4+gFZJxNgh37KHNMrf3emQSBDe0GY8vLzE8LX+KfJ6lyvFZ/LnmKXLzzH3aTTdOfNPZB5ZNB/uMn9o0uKvXivcPpfWS4mc3NGFeLsJydwAO+Q/WSfjNpCUhcOG+YufjriTbaRTNBO8h448CtOycSdZc5JspFbQstJ7Wy0lrTaNEXy8/9Fk3gB5Mrj6GrfOUWzlozjHtxdIjqDOFGbZdgh039MrugKFMfTtwae5BJ+jtA0PKAtX+eGf+E17UHPSevfW0IuOQujVtQa3Ihpmfevp4Hv0USPKhrRMejPFyUj6PTLJRF4KBU3b5kYEzs7UeMQRpAKaAiY93SD1QYeELh5rxk78zjYBdFuiFrL1Q4irfJfkHs2JYb8k5Jsu/tuoq/d9HWdxHEaqLMSB5YYkbx9RYnv6P9ULBgOL90joT5Zi763jXt5eLKIeoGN5MBIWJlBGdtwKs/nkUGBr/g6ZStFdAxFP16/Bv3l2SnWRDaDmSQZMwmcuD/kMcPiK2vMKoVwPbVB0SQmnpMhpJmP+sKJETUaICfkxTJ+qRitx9vFOy+lTUI4nUjkn5WkO3SxdkPllCtY6h+saMr/4cC1R7e5CVfHbmew7g9+VKs9mjF8hc6ACM="

Pro Tip: You can add it automatically by running with --add.
houbinbindeMacBook-Pro:paradise houbinbin$ travis encrypt COVERALLS_TOKEN=87byd1s0Yrw8gd4nPXjynGm1BdCuINw8k --add
```

根据提示执行命令 `travis encrypt COVERALLS_TOKEN=87byd1s0Yrw8gd4nPXjynGm1BdCuINw8k --add` 会自动将加密后的内容放在 `.travis.yml` 文件中：

```
language: java
jdk:
- oraclejdk8
install: mvn install -DskipTests=true -Dmaven.javadoc.skip=true
script: mvn test
after_success:
- mvn clean cobertura:cobertura coveralls:report
env:
  global:
    secure: pNPPlZBrz7PUdpJdpfKdSPoekpR84+t6RKMSwe2h0pBJDCX6CNxjnzhnGhCa2oD2DFMDQYrE59yFjlMNxruHvaXvdbwr2+HPx0o9fiKI1cT24ikFJoebCyBtt5vk/qH9KTAASh3FpPw9s1+5tYWy6IA968Wr4RdJbHTHcxQ0/rXGvh5rVO/BvEnPWGZjfRLV22xPaqgN/GBMkTLyIpRQzexN2tyARF7fXZf6x6NDjQ4MX64gz8z6Goww5IGcmZi5hrsmUeIvJhJ9Ba/snwHwn+IJ0qhe3C78fF5HrxF/0cMTbQteD1ULqJHy45rNcQ6YjDt0xKFibcx2S1uK4r8H9pX0wx3Wa56qX3fJ0JMwoeFuXc0B/bkZ53QJEPcwPXnVhi1SOM/DLgsK3raYdJRt4BMU7Xo3KK77aDIZY+O28IplfBgA0KGSfEcLCfw1BvhZoYKUuLRaNHuM857GzaetIWAYhCvEn9whfsP/0ye9uPt/vSoHjzMcJKJz36kmD61lPwymk/rwv0OBRyrXEHFyrwppcLel03P3vBQm0WAed3cwXUsTUCxHeI7bC1KwgTLXk6Jj8tS+nJckRSFlBcjyHhRaSXZ8eRVUABZslt24pHPHiBBDJ9Ax3BWXbB5ZIda/1i1BfyxnlbdM2A4nCg6DLvSZEH7VyeJi30E3XtRaYSU=
```


> 注意

如果你使用了 `surefire` mvn 插件，注意**开启测试**。

- 添加对应的徽章

如：

```
[![Coverage Status](https://coveralls.io/repos/github/houbb/gen-maven-plugin/badge.svg?branch=master)](https://coveralls.io/github/houbb/gen-maven-plugin?branch=master)
```

[![Coverage Status](https://coveralls.io/repos/github/houbb/gen-maven-plugin/badge.svg?branch=master)](https://coveralls.io/github/houbb/gen-maven-plugin?branch=master)

* any list
{:toc}

