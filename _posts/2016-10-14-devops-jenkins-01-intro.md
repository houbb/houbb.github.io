---
layout: post
title: 持续集成平台 01 jenkins 入门介绍
date:  2016-10-14 23:51:50 +0800
categories: [Devops]
tags: [devops, ci]
published: true
---

# 拓展阅读

[Devops-01-devops 是什么？](https://houbb.github.io/2016/10/14/devops-01-overview)

[Devops-02-Jpom 简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件](https://houbb.github.io/2016/10/14/devops-02-jpom)

[代码质量管理 SonarQube-01-入门介绍](https://houbb.github.io/2016/10/14/devops-sonarqube-01-intro)

[项目管理平台-01-jira 入门介绍 缺陷跟踪管理系统，为针对缺陷管理、任务追踪和项目管理的商业性应用软件](https://houbb.github.io/2016/10/14/project-manage-jira-01-intro)

[项目管理平台-01-Phabricator 入门介绍 一套集成的强大工具，帮助公司构建更高质量的软件](https://houbb.github.io/2016/10/14/project-manage-phabricator-01-overview)

[持续集成平台 01 jenkins 入门介绍](https://houbb.github.io/2016/10/14/devops-jenkins-01-intro)


# Jenkins

作为领先的开源自动化服务器，Jenkins提供了数百个插件来支持构建、部署和自动化任何项目。

> [jenkins](https://jenkins.io/index.html)

# 下载

LTS（长期支持）版本每12周从常规发布流中选择一个稳定版本作为该时间段的稳定版本。

下载war包，将其重命名为 ```ROOT.war``` 并放入

```
/Users/houbinbin/it/tools/tomcat/tomcat8/webapps
```

- 启动tomcat

```
houbinbindeMacBook-Pro:bin houbinbin$ pwd
/Users/houbinbin/it/tools/tomcat/tomcat8/bin
houbinbindeMacBook-Pro:bin houbinbin$ ./startup.sh
```

- 访问

```
localhost:8080
```

- 卸载

使用 ```./``` 到命令行。

```
$   /Library/Application Support/Jenkins/Uninstall.command
```

结果

```
houbinbindeMacBook-Pro:Jenkins houbinbin$ ./Uninstall.command


Jenkins 卸载脚本

以下命令使用sudo执行，因此您需要以管理员身份登录。在提示时请输入密码。

+ sudo launchctl unload /Library/LaunchDaemons/org.jenkins-ci.plist
+ sudo rm /Library/LaunchDaemons/org.jenkins-ci.plist
+ sudo rm -rf /Applications/Jenkins '/Library/Application Support/Jenkins' /Library/Documentation/Jenkins
+ sudo rm -rf /Users/Shared/Jenkins
sudo: cannot get working directory
+ sudo rm -rf /var/log/jenkins
sudo: cannot get working directory
+ sudo rm -f /etc/newsyslog.d/jenkins.conf
sudo: cannot get working directory
+ sudo dscl . -delete /Users/jenkins
sudo: cannot get working directory
+ sudo dscl . -delete /Groups/jenkins
sudo: cannot get working directory
+ pkgutil --pkgs
+ grep 'org\.jenkins-ci\.'
+ xargs -n 1 sudo pkgutil --forget
sudo: cannot get working directory
Forgot package 'org.jenkins-ci.documentation.pkg' on '/'.
sudo: cannot get working directory
Forgot package 'org.jenkins-ci.jenkins.osx.pkg' on '/'.
sudo: cannot get working directory
Forgot package 'org.jenkins-ci.jenkins2191.postflight.pkg' on '/'.
sudo: cannot get working directory
Forgot package 'org.jenkins-ci.launchd-jenkins.pkg' on '/'.
sudo: cannot get working directory
Forgot package 'org.jenkins-ci.support.pkg' on '/'.
+ set +x

Jenkins 已卸载。
```

# 开始使用

- 验证密码

将 ```/Users/houbinbin/.jenkins/secrets/initialAdminPassword``` 的内容复制到密码输入框中。

- 安装插件

- 创建用户

之后，您可以看到：

![jenkines](https://raw.githubusercontent.com/houbb/resource/master/img/jenkins/2016-10-15-jenkins.png)

- 默认用户配置位置：

```
/Users/houbinbin/.jenkins/users/${username}/config.xml
```

# 配置 Jenkins

> 配置java、git、maven

- 首先获取所需内容

1、```which``` 可以获取执行路径

2、如果您之前已经配置过路径，例如在 ```~/.bash_profile``` 中设置了 ```$M3_HOME```，则可以使用 ```echo $M3_HOME``` 来获取主目录路径

3、对于Java，我们可以使用 ```/usr/libexec/java_home``` 来获取其路径

```
houbinbindeMacBook-Pro:bin houbinbin$ which mvn
/usr/local/maven/maven3.3.9/bin/mvn
houbinbindeMacBook-Pro:~ houbinbin$ echo $M3_HOME
/usr/local/maven/maven3.3.9
houbinbindeMacBook-Pro:bin houbinbin$ which git
/usr/local/bin/git
houbinbindeMacBook-Pro:bin houbinbin$ which java
/usr/bin/java
houbinbindeMacBook-Pro:~ houbinbin$ /usr/libexec/java_home
/Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home
```

- 设置路径

```系统管理-》全局工具配置``` 或 ```http://localhost:8080/configureTools/```

1、添加jdk


在mac中：

```
JDK别名:      JDK8
JAVA_HOME:    /Library/Java/JavaVirtualMachines/jdk1.8.0_91.jdk/Contents/Home


```

在ubuntu中：

```
$ which java
/home/hbb/tool/jdk/jdk1.8.0_112/bin/java
```

设置

```
JAVA_HOME:  /home/hbb/tool/jdk/jdk1.8.0_112
```

以此类推，添加 ```git``` 和 ```mvn```

2、添加git

```
Name: git
Path to Git executable: /usr/local/bin/git
```
3、添加mvn

```
name: maven3
MAVEN_HOME: /usr/local/maven/maven3.3.9
```

![tools](https://raw.githubusercontent.com/houbb/resource/master/img/jenkins/2016-10-15-config-tools.png)

> 配置邮件

[邮件](http://blog.csdn.net/littlechang/article/details/8706322)

[配置邮件](http://tanglei528.blog.163.com/blog/static/4335339920151263051521/)



# 创建任务

## 创建

输入一个项目名称 *blog* 作为示例，选择 **构建一个自由风格的软件项目**

## 配置

1、源码管理

```
Git

Repository URL: https://github.com/houbb/blog
Credentials:    usr/pwd
```

2、构建触发器
选择 **当 GitHub 推送更改时构建** 和 **轮询 SCM**

设置 [调度](http://www.cnblogs.com/linjiqin/archive/2013/07/08/3178452.html) 为 **轮询 SCM**

```
*/5 * * * *
```

表示每五分钟重新检查一次。

对于所有的任务调度，Jenkins 采用 cron-style 语法，包含 5 个字段，字段之间使用空格隔开，格式如下：

```
分钟 小时 日 月 星期
分钟：0-59    小时：0-23    日：1-31   月：1-12   星期：0-7 ，其中 0,7 表示星期日 ，以下有几个简化字符
```
1、“*” 表示在该字段所有可能出现的值
2、也可以使用连字符“-”定义范围，如在星期字段上定义 1-5，表示周一至周五
3、使用正斜杠符号定义一个跳过一个范围，如在分钟字段上定义 */5  表示每五分钟的意思
4、使用逗号分隔一个字段表示一系列有效值，如小时 字段定义 12,18 表示 12 点与 18 点

3、选择【丢弃旧的构建】，这里主要是为节省磁盘空间而考虑的，因为每次构建后，Jenkins 都会在 jobs 目录下为每个 job 下载，并创建相关数据，如打包后的 jar 等
- 保持构建的天数，这里我设置为 5，表示每次构建后的记录只有 5 天有效期
- 保持构建的最大个数，每个 job 只会保留最新的 5 次构建记录，这里需要提醒的是，如果之前有一次构建成功，那么 Jenkins 会永远保留，当然也可以手动删除

4、构建触发器

勾选以下选项:

- 当 SNAPSHOT 依赖项构建时构建

- 定期构建

```
H 7 * * 1-7
```

- 当 GitHub 推送更改时构建


5、构建

调用顶层 Maven 目标

Maven 版本: maven3

Goals: clean site



# 参数化构建

> [博客文章](http://www.tuicool.com/articles/A3QBN3z)

1. 在 Jenkins 中安装 ```Dynamic Parameter Plug-in```

2. 参数化构建过程->动态选择参数

- **名称** 设为 ```release_branch```
- **选择脚本** 设为:

```
def ver_keys = [ 'bash', '-c', 'cd /Users/houbinbin/.jenkins/workspace/framework; git pull>/dev/null; git branch -a|grep remotes|cut -d "/" -f3|sort -r |head -10 ' ]
ver_keys.execute().text.tokenize('\n')
```

命令简要解释:

进入项目路径，提取分支名称。

```
houbinbindeMacBook-Pro:framework houbinbin$ pwd
/Users/houbinbin/.jenkins/workspace/framework
houbinbindeMacBook-Pro:framework houbinbin$ git branch -a
* (HEAD detached at 00177f4)
  remotes/origin/master
  remotes/origin/release_1.0.1
```

优化建议:

(1) ```/Users/houbinbin/.jenkins/workspace/framework``` 是 Jenkins 自带的 ```WORKSPACE```，直接使用无效。需修正路径。

(2) 项目必须在 Jenkins 部署后，路径才会存在于 workspace 下。因此可将路径调整为代码的本地存放路径。


> 直接指定选项

参数化构建过程->选择参数

一行代表一个选项。


3. **要构建的分支** -> **分支规范（为空表示“任意”）** 内容指定为 ```$release_branch```

# 流水线

Jenkins 流水线是一套插件，支持将持续交付流水线集成到 Jenkins 中。

使用 Jenkins 流水线，您需要：

- Jenkins 2.x 或更高版本（旧版本至 1.642.3 可能可行，但不建议使用）
- 流水线插件

> 在 Web UI 中定义流水线

1. 在首页点击 **新建项**

2. 输入项目名称如 ```pipeline-example```，选择 **Pipeline**，然后保存。

3. 在流水线的脚本定义字段中，添加以下内容并保存

```
node {
    echo "hello world"
}
```

4. 点击 **立即构建** 来运行流水线。

5. 点击 **构建历史** 下的 ```#1```，然后点击 **控制台输出**，您会看到：

```
Started by user houbinbin
[Pipeline] node
Running on master in /Users/houbinbin/.jenkins/workspace/pipeline-example
[Pipeline] {
[Pipeline] echo
hello world
[Pipeline] }
[Pipeline] // node
[Pipeline] End of Pipeline
Finished: SUCCESS
```

> 在 SCM 中定义流水线

文档可在 [localhost:8888/pipeline-syntax/](localhost:8888/pipeline-syntax/) 找到。

# Jenkins文件

> 创建一个 Jenkinsfile

```Jenkinsfile``` 是一个文本文件，包含了 Jenkins 流水线的定义，并且被提交到源代码控制中。


```groovy
node {
    checkout scm

    /* .. 省略 .. */
    stage('构建') {
        sh 'make' // <1>
        archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true // <2>
    }

    /* .. 省略 .. */
    stage('测试') {
        /* `make check` 在测试失败时返回非零值，
         * 使用 `true` 仍然允许流水线继续执行
         */
        sh 'make check || true' // <1>
        junit '**/target/*.xml' // <2>
    }

    /* .. 省略 .. */
    stage('部署') {
        if (currentBuild.result == 'SUCCESS') { // <1>
            sh 'make publish'
        }
    }

}
```

1. **构建** 阶段:

   - 执行命令 `make` 编译代码

   - 存档构建产物 `**/target/*.jar`，生成指纹以用于后续跟踪

2. **测试** 阶段:

   - 执行命令 `make check` 进行测试，即使测试失败也继续执行流水线
   - 使用 JUnit 插件收集测试结果 `**/target/*.xml`

3. **部署** 阶段:

   - 如果当前构建结果为成功，执行命令 `make publish` 进行部署。



# chat

## 详细介绍一下 jenkins

Jenkins 是一个开源的自动化服务器，用于实现持续集成和持续交付（CI/CD）。

它是一个可扩展的系统，提供了丰富的插件生态系统，能够支持几乎任何项目的构建、测试和部署过程。

以下是 Jenkins 的一些主要特点和功能：

1. **持续集成和持续交付（CI/CD）**：Jenkins 可以自动化构建、测试和部署软件项目，从而加快开发周期并提高软件质量。

2. **易于安装和配置**：Jenkins 可以在各种操作系统上运行，并且易于安装和配置。它提供了一个直观的 Web 界面，使用户可以轻松地设置和管理构建任务。

3. **丰富的插件生态系统**：Jenkins 拥有庞大的插件生态系统，用户可以根据自己的需求选择和安装各种插件，以扩展 Jenkins 的功能，实现更多定制化的 CI/CD 流程。

4. **支持多种版本控制系统**：Jenkins 支持多种版本控制系统，包括 Git、Subversion、Mercurial 等，使用户能够轻松地集成版本控制到构建过程中。

5. **构建触发器和定时任务**：Jenkins 提供了多种构建触发器，包括基于代码提交、定时触发、API 调用等。用户可以根据需要设置不同的触发器来启动构建任务。

6. **分布式构建**：Jenkins 支持分布式构建，可以将构建任务分发到多台计算机上并行执行，从而加速构建过程。

7. **可视化构建历史和报告**：Jenkins 提供了直观的构建历史和报告，用户可以轻松地查看每次构建的结果、日志和测试报告，方便问题定位和分析。

8. **安全性和权限管理**：Jenkins 提供了灵活的安全性和权限管理功能，用户可以根据角色和权限对用户进行管理和授权，确保系统的安全性和稳定性。

总的来说，Jenkins 是一个功能强大、灵活易用的自动化工具，广泛应用于软件开发和持续集成领域，帮助团队实现高效的软件交付流程，提高软件质量和开发效率。

## jenkins 的核心原理和流程是什么？

Jenkins 是一个用于持续集成和持续交付的开源自动化服务器。它的核心原理和流程如下：

1. **持续集成（CI）**：
   - Jenkins 的核心概念是持续集成，即将开发人员的代码频繁地集成到共享代码库中，并通过自动化构建和测试来验证代码的质量。
   - 开发人员在完成代码修改后，将代码提交到版本控制系统（如 Git、SVN 等）的特定分支。
   - Jenkins 监听版本控制系统，当检测到代码提交时，触发构建任务。

2. **构建流水线（Pipeline）**：
   - Jenkins 使用 Jenkinsfile 或者通过界面配置的方式定义构建流水线，其中包括构建、测试、部署等阶段的执行顺序和操作。
   - 构建流水线是一个脚本或者一系列步骤，用于定义构建过程中要执行的操作。

3. **节点（Node）和代理（Agent）**：
   - Jenkins 构建任务可以在 Jenkins 主服务器上执行，也可以分布在多个节点或代理上执行。
   - 节点可以是物理服务器、虚拟机或者容器，用于执行构建任务。代理是 Jenkins 主服务器上的一个进程，用于接收和执行来自 Jenkins 主服务器的构建任务。

4. **触发器（Triggers）**：
   - 构建任务可以通过不同的触发器来触发，如定时触发、代码提交触发、API 调用触发等。
   - 定时触发可以定期执行构建任务，以确保代码的定期构建和集成。
   - 代码提交触发则是在代码库有新的提交时自动触发构建任务。

5. **构建环境（Environment）**：
   - 构建任务执行时会提供一个独立的构建环境，其中包括构建所需的工具、依赖和环境变量等。
   - Jenkins 支持配置全局工具、环境变量、凭据等，以便构建任务可以在预定义的环境中运行。

6. **构建结果（Build Result）**：
   - 每次构建任务执行完毕后，都会生成一个构建结果，包括构建日志、测试报告、构建产物等。
   - 构建结果可以用于监控构建的状态、定位问题、回溯历史构建等。

7. **通知（Notification）**：
   - Jenkins 支持在构建完成后发送通知，如电子邮件、Slack 消息、Webhook 等，以便及时通知团队构建状态和结果。

综上所述，Jenkins 的核心原理和流程是基于持续集成的理念，通过构建流水线、触发器、节点、构建环境等来实现自动化地构建、测试和部署软件项目。

## jenkins 是如何为项目提供构建环境的呢？以 java 的项目为例 

在 Jenkins 中为项目提供构建环境通常涉及以下几个方面，以 Java 项目为例：

1. **安装和配置 JDK**：
   - Jenkins 可以配置全局工具，包括 JDK、Maven、Gradle 等构建工具。
   - 在 Jenkins 的全局配置中，管理员可以指定所需的 JDK 版本，并且可以选择自动安装或手动指定已安装的 JDK 路径。
   - 对于 Java 项目，确保在构建环境中正确安装了所需版本的 JDK 是至关重要的。

2. **配置构建环境变量**：
   - Jenkins 允许在构建任务中定义环境变量，这些变量可以在构建过程中使用。
   - 例如，可以设置 JAVA_HOME 变量指向正确的 JDK 安装路径，以便构建任务能够正确地编译和运行 Java 代码。

3. **安装和配置构建工具**：
   - 对于 Java 项目，通常会使用 Maven 或 Gradle 等构建工具管理项目的依赖和构建过程。
   - Jenkins 允许管理员在全局配置中安装和配置这些构建工具，并在构建任务中指定要使用的工具版本。

4. **设置构建触发器和构建步骤**：
   - 在 Jenkins 中配置构建任务时，可以指定构建触发器，例如当代码提交到版本控制系统时触发构建，或者定时触发构建。
   - 构建任务可以包括一系列构建步骤，如代码拉取、编译、运行单元测试、打包等。

5. **安装和配置插件**：
   - Jenkins 提供了丰富的插件生态系统，可以扩展其功能，例如用于构建、测试、部署等方面的插件。
   - 对于 Java 项目，可以安装和配置适用于 Java 开发的插件，如 Maven 插件、JUnit 插件等。

总体来说，Jenkins 为项目提供构建环境的方式是通过全局配置和构建任务配置来实现的。

管理员可以在全局配置中设置全局工具和环境变量，然后在构建任务中指定具体的构建步骤和工具版本，以确保项目能够在正确的环境中进行构建和测试。

## 不同的项目依赖的环境不同，jenkins 服务器资源基本是固定的。如何做到隔离的？

为了确保不同项目之间的构建环境隔离，Jenkins 提供了几种机制：

1. **构建代理（Build Agents）**：
   - Jenkins 支持在多个构建代理上执行构建任务，每个代理可以提供不同的环境配置。
   - 可以在 Jenkins 主服务器上配置多个构建代理，每个代理可以具有不同的软件和工具配置，以满足不同项目的需求。
   - 通过将不同项目分配到不同的构建代理上，可以确保它们在不同的环境中进行构建，从而实现环境隔离。

2. **Docker 容器**：
   - Jenkins 支持在 Docker 容器中执行构建任务，每个容器可以提供独立的环境。
   - 可以为每个项目创建一个专用的 Docker 镜像，其中包含了项目所需的环境和工具。
   - Jenkins 可以通过 Docker 插件启动容器来执行构建任务，并在容器中配置项目的构建环境，从而实现环境隔离。

3. **Pipeline 中的环境设置**：
   - 在 Jenkins Pipeline 中，可以在不同阶段或步骤中设置特定的环境变量或工具版本。
   - 可以根据项目的需求，在 Pipeline 脚本中动态地设置构建环境，以确保每个项目都在独立的环境中进行构建。

4. **使用不同的 Jenkins 服务器**：
   - 对于特别敏感或者完全不同的项目，可以考虑使用不同的 Jenkins 服务器。
   - 每个 Jenkins 服务器可以配置不同的环境和插件，以满足不同项目的需求，从而实现彻底的环境隔离。

综上所述，Jenkins 提供了多种机制来实现项目之间的环境隔离，包括使用构建代理、Docker 容器、Pipeline 中的环境设置以及使用不同的 Jenkins 服务器等方式。

根据项目的需求和安全性要求，可以选择合适的方法来确保不同项目之间的构建环境隔离。

## 如果我想设计一个简化版的 jenkins，可以支持 java 前端 vue 等构建，应该如何设计？

设计一个简化版的 Jenkins，可以支持 Java、前端（如 Vue）等项目的构建，可以考虑以下步骤和功能：

1. **用户界面（UI）**：
   - 设计简洁易用的用户界面，包括项目列表、构建历史、构建结果等。
   - 提供项目创建、编辑、删除等功能的界面。

2. **项目配置**：
   - 允许用户创建不同类型的项目，如 Java 项目、前端项目等。
   - 对于 Java 项目，需要提供 JDK 版本、Maven 或 Gradle 版本等配置选项。
   - 对于前端项目，需要提供 Node.js 版本、NPM 或 Yarn 版本等配置选项。

3. **构建触发**：
   - 支持不同的构建触发方式，如定时触发、代码提交触发等。
   - 对于前端项目，还可以支持自动化测试通过后触发构建。

4. **构建过程**：
   - 根据项目类型配置的环境，执行构建任务。
   - 对于 Java 项目，执行编译、运行单元测试、打包等操作。
   - 对于前端项目，执行依赖安装、代码打包、静态资源优化等操作。

5. **构建日志和结果**：
   - 实时展示构建日志，方便用户查看构建过程和排查问题。
   - 在构建完成后，展示构建结果，包括构建状态、测试结果、构建产物等。

6. **环境隔离**：
   - 在执行构建任务时，确保不同项目的构建环境是相互隔离的，以避免环境污染和冲突。

7. **插件支持**：
   - 设计插件机制，允许用户根据需要扩展功能，如集成代码质量检测、自动化部署等插件。

8. **安全性**：
   - 提供用户身份认证和权限管理机制，确保只有授权用户可以进行敏感操作。

9. **容错性**：
   - 考虑系统的容错能力，确保在面对异常情况时能够稳定运行并且不丢失数据。

10. **扩展性**：
    - 考虑系统的扩展性，允许在需要时对系统进行扩展，如支持更多类型的项目、更多的构建环境等。

以上是设计简化版 Jenkins 的一般步骤和功能，具体实现可以根据需求和技术栈选择合适的技术和工具进行开发。可以选择使用现有的开源项目作为基础，也可以根据自己的需求从零开始进行开发。

## 有哪些来开源的项目？介绍一下

有许多开源项目可以用作简化版 Jenkins 的基础，以下是一些常见的开源持续集成/持续交付（CI/CD）工具：

1. **Jenkins**：
   - Jenkins 是最流行的开源持续集成/持续交付工具之一，它提供了丰富的插件生态系统和灵活的自定义功能，可以满足各种项目的构建需求。

2. **GitLab CI/CD**：
   - GitLab 是一个集成了代码仓库、CI/CD、代码评审等功能的开源项目管理平台。其内置的 CI/CD 功能可以直接与 GitLab 仓库集成，提供了基于 YAML 的简单配置，并支持并行构建、Docker 容器等功能。

3. **Travis CI**：
   - Travis CI 是一个基于云的持续集成服务，支持 GitHub 和 Bitbucket 上的项目。它提供了简单易用的配置方式，自动化构建、测试和部署，并且可以与多种语言和框架集成。

4. **CircleCI**：
   - CircleCI 是一个基于云的持续集成和交付平台，支持 GitHub 和 Bitbucket 上的项目。它提供了一个简单的配置文件（YAML）来定义构建过程，并支持 Docker 环境、缓存、并行构建等功能。

5. **Drone**：
   - Drone 是一个基于容器的持续集成和交付平台，支持 GitHub 和 Bitbucket 上的项目。它使用 Docker 容器来执行构建任务，提供了简单的配置和易于扩展的插件机制。

6. **GoCD**：
   - GoCD 是一个开源的持续交付工具，支持复杂的流水线和环境配置。它提供了可视化的管道定义和执行，以及灵活的环境隔离和部署策略。

以上是一些常见的开源持续集成/持续交付工具，它们都可以用作简化版 Jenkins 的基础。

选择合适的工具取决于项目的需求、团队的偏好以及技术栈的兼容性。

# 参考资料

> [jenkins 中文](http://www.yiibai.com/jenkins/jenkins_unit_testing.html)

> [博客系列教程 中文](http://www.cnblogs.com/zz0412/tag/jenkins/)

* any list
{:toc}