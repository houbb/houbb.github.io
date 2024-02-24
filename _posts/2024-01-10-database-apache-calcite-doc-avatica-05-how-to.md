---
layout: post
title: Apache Calcite doc avatica-05-how to 如何使用
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 从源分发构建

要求在路径中有Java（JDK 8或更高版本）和Gradle（版本8.1.1）。

（源分发不包括Gradle包装器；因此，您需要手动安装Gradle。）

解压源分发 .tar.gz 文件，cd 到解压后源文件的根目录，然后使用 Gradle 构建：

```bash
$ tar xvfz apache-calcite-avatica-1.24.0-src.tar.gz
$ cd apache-calcite-avatica-1.24.0-src
$ gradle build
```

运行测试描述了如何运行更多或更少的测试（但应使用 gradle 命令而不是 ./gradlew）。

## 从 Git 构建

要求是 Git 和 Java（JDK 8或更高版本）在路径中。

创建 GitHub 存储库的本地副本，cd 到其根目录，然后使用 Gradle 构建：

```bash
$ git clone git://github.com/apache/calcite-avatica.git avatica
$ cd avatica
$ ./gradlew build
```

运行测试描述了如何运行更多或更少的测试。

## 运行测试

除非指定 -x test，否则构建时默认会运行测试套件：

```bash
$ ./gradlew assemble # 构建构件
$ ./gradlew build -x test # 构建构件，验证代码样式，跳过测试
$ ./gradlew check # 验证代码样式，执行测试
$ ./gradlew test # 执行测试
$ ./gradlew checkstyleMain checkstyleTest # 验证代码样式
```

您可以使用 ./gradlew assemble 构建构件并跳过所有测试和验证。

## 在 Docker 中运行测试

要求是 Docker 和 Docker Compose。

```bash
docker-compose run test
```

# 贡献

请参阅开发者指南。

# 入门

请参阅开发者指南。

# 开发者的高级主题

以下部分可能会引起您的兴趣，如果您正在为代码库的特定部分添加功能，则不需要理解这些主题。

## 开发者的高级主题

以下部分对 Calcite 提交者特别是发布经理感兴趣。

## 设置 PGP 签名密钥（对 Calcite 提交者）

按照此处的说明创建密钥对。（在 Mac OS X 上，我执行了 brew install gpg 和 gpg --gen-key。）

按照 KEYS 文件中的说明将您的公钥添加到 KEYS 文件中。（KEYS 文件不存在于 git 存储库或发布 tar 文件中，因为那将是多余的。）

运行 GPG 代理（对 Calcite 提交者）

默认情况下，需要您解锁 GPG 秘密密钥的 Gradle 插件会在终端中提示您。为了避免您多次输入密码，强烈建议安装并运行 gpg-agent。

这可以通过在 Linux 上的 ~/.xsession 或您选择的 shell 配置脚本（例如 ~/.bashrc 或 ~/.zshrc）中进行自动启动来实现。

```bash
GPG_AGENT=$(which gpg-agent)
GPG_TTY=`tty`
export GPG_TTY
if [[ -f "$GPG_AGENT" ]]; then
  envfile="${HOME}/.gnupg/gpg-agent.env"

  if test -f "$envfile" && kill -0 $(grep GPG_AGENT_INFO "$envfile" | cut -d: -f 2) 2>/dev/null; then
      source "$envfile"
  else
      eval "$(gpg-agent --daemon --log-file=~/.gpg/gpg.log --write-env-file "$envfile")"
  fi
  export GPG_AGENT_INFO  # 环境文件不包含 export 语句
fi
```

此外，请确保在 ~/.gnupg/gpg-agent.conf 中设置了 default-cache-ttl 6000，以确保您的凭据将在构建过程中被缓存。

## 设置 Nexus 仓库凭据（对 Calcite 提交者）

Gradle 提供了多种配置项目属性的方式。例如，您可以更新 $HOME/.gradle/gradle.properties。

注意：构建脚本将打印缺少的属性，因此您可以尝试运行它，并让其在缺少的属性上投诉。

以下选项被使用：

- asfCommitterId=
- asfNexusUsername=
- asfNexusPassword=
- asfSvnUsername=
- asfSvnPassword=

当使用 asflike-release-environment 时，凭据将从 asfTest... (例如 asfTestNexusUsername=test) 中获取。

注意：如果要使用 gpg-agent，您需要传递 useGpgCmd 属性，并通过 signing.gnupg.keyName 指定

密钥 ID。

## 制作快照（对 Calcite 提交者）

开始之前：

- 如上所述设置签名密钥。
- 确保您正在使用 JDK 8（而不是 9 或 10）。

```bash
# 确保沙箱中没有垃圾文件
git clean -xn

./gradlew -Pasf publish
```

## 制作发布候选版（对 Calcite 提交者）

开始之前：

- 如上所述设置签名密钥。
- 确保您正在使用 JDK 8（而不是 9 或 10）。
- 检查 README、site/_docs/howto.md 和 site/_docs/docker_images.md 中的版本号是否正确。
- 检查 NOTICE 是否有当前年份的版权声明。
- 检查 /gradle.properties 中的 calcite.avatica.version 是否有正确的值。
- 向 site/_docs/history.md 添加发布说明。如果针对要发布的版本已经存在发布说明，但被注释掉了，请移除注释（{% comment %} 和 {% endcomment %}）。包括提交历史、为发布做出贡献的人员的姓名，并说明此版本已测试的 Java、Guava 和操作系统的版本。
- 使用 ./gradlew dependencyCheckUpdate dependencyCheckAggregate 生成依赖项中存在的漏洞报告。
- 确保每个“已解决”的 JIRA 用例（包括重复项）都分配了修复版本（最有可能是我们即将发布的版本）。

发布候选版流程不会添加提交，因此如果失败也没有关系。它可能会留下 -rc 标签，如果需要可以删除它。

您可以使用 vlsi/asflike-release-environment 进行干预发布的测试。该流程执行相同的步骤，但会将更改推送到模拟的 Nexus、Git 和 SVN 服务器。

如果任何步骤失败，请修复问题，然后从头开始。

在您的环境中直接准备发布候选版

选择发布候选版索引（从 0 开始），并确保它不会与之前版本的候选版冲突。

```bash
# 确保沙箱中没有垃圾文件
git clean -xn

# 在 asf-like-environment 中进行发布候选版的干预运行
./gradlew prepareVote -Prc=0

# 将发布候选版推送到 ASF 服务器
./gradlew prepareVote -Prc=0 -Pasf
```

## 在 Docker 中准备发布候选版

您需要安装 Docker 和 Docker Compose。

该脚本希望您将您的 ~/.gnupg 目录挂载到容器中的 /.gnupg 目录。一旦挂载到容器中，脚本将复制其内容并移动到另一个位置，以便在构建过程中不会修改您原始的 ~/.gnupg 目录的内容。

启动 asflike-release-environment 以准备干预环境以进行干预测试。

```bash
# 在 Linux 上（干预测试）：
docker-compose run -v ~/.gnupg:/.gnupg dry-run

# 在 Windows 上（干预测试）：
docker-compose run -v /c/Users/username/AppData/Roaming/gnupg:/.gnupg dry-run

# 在 Linux 上（推送到 ASF 服务器）：
docker-compose run -v ~/.gnupg:/.gnupg publish-release-for-voting

# 在 Windows 上（推送到 ASF 服务器）：
docker-compose run -v /c/Users/username/AppData/Roaming/gnupg:/.gnupg publish-release-for-voting
```

## 检查构件

在 release/build/distributions 目录中应该有以下 3 个文件之一：
- apache-calcite-avatica-X.Y.Z-src.tar.gz
- apache-calcite-avatica-X.Y.Z-src.tar.gz.asc
- apache-calcite-avatica-X.Y.Z-src.tar.gz.sha512

请注意，文件名以 apache-calcite-avatica- 开头。

在源分发 .tar.gz 中（当前没有二进制分发），检查所有文件是否属于名为 apache-calcite-avatica-X.Y.Z-src 的目录。

该目录必须包含以下文件：
- NOTICE
- LICENSE
- README
- README.md

检查 README 中的版本号是否正确。

检查 LICENSE 是否与提交到 git 的文件相同。

确保以下文件不会出现在源分发中：KEYS、gradlew、gradlew.bat、gradle-wrapper.jar、gradle-wrapper.properties。

对于每个 .jar（例如 core/build/libs/avatica-core-X.Y.Z.jar 和 server/build/libs/avatica-server-X.Y.Z-sources.jar），请验证 META-INF 目录是否包含根据源/类正确的许可证和通知的内容。请参考 ASF 许可证文档，了解所需的内容。

检查 PGP，参见此处。

在 Nexus 存储库中验证分段构件：

- 进入 https://repository.apache.org/ 并登录。
- 在构建推广下，单击 Staging Repositories。
- 在 Staging Repositories 标签页中，应该有一行带有配置文件 org.apache.calcite。
- 导航到 artifact tree 并确保 .jar、.pom 和 .asc 文件存在。

## 失败的发布尝试后的清理（对 Calcite 提交者）

如果有什么不正确，您可以修复它，提交它，并准备下一个候选版。发布候选版标签可能会保留一段时间。

## 验证发布

```bash
# 检查签名密钥（例如 2AD3FAE3 是否已推送）
gpg --recv-keys key

# 检查密钥
curl -O https://dist.apache.org/repos/dist/release/calcite/KEYS

# 签名/检查 sha512 哈希
# （假设您的操作系统具有 'shasum' 命令。）
function checkHash() {
  cd "$1"
  for i in *.{pom,gz}; do
    if [ ! -f $i ]; then
      continue
    fi
   

 if [ -f $i.sha512 ]; then
      if [ "$(cat $i.sha512)" = "$(shasum -a 512 $i)" ]; then
        echo $i.sha512 present and correct
      else
        echo $i.sha512 does not match
      fi
    else
      shasum -a 512 $i > $i.sha512
      echo $i.sha512 created
    fi
  done
}
checkHash apache-calcite-avatica-X.Y.Z-rcN
```

## 通过 Apache 投票流程获得发布批准（对 Calcite 提交者）

在 dev 列表上发布投票。注意：准备投票任务的最后一步会打印草稿邮件，您可以在 /build/prepareVote/mail.txt 中找到草稿。

发送结果邮件：

# 发布版本

在成功的发布投票之后，我们需要将发布推送到镜像服务器和其他任务。

选择发布日期。这取决于您希望宣布发布的时间。这通常是投票关闭的一天之后。请记住 UTC 日期在太平洋时间下午 4 点更改。

在 JIRA 中，搜索所有在此版本中解决的问题，并进行批量更新，将其状态更改为“关闭”，更改注释为“已在版本 X.Y.Z（YYYY-MM-DD）中解决”（适当填写版本号和日期）。取消选中“发送此更新的邮件”。

提示：只有在确认 staged nexus 构件在仓库中推广之后，才推送 git 标签。这是因为推送标签会触发 Docker Hub 立即开始构建 Docker 映像，构建将拉取推广的构件。如果构件尚不可用，则 Docker Hub 上的构建将失败。最好在确认 nexus 构件正确推广之后继续执行以下步骤。

## 发布在您的环境中

```bash
# 干预发布发布候选版（推送到 asf-like-environment）
./gradlew publishDist -Prc=0

# 将发布推送到 ASF 服务器
./gradlew publishDist -Prc=0 -Pasf
```

如果 SVN 中有超过 2 个发布版本（参见 https://dist.apache.org/repos/dist/release/calcite），请清除最旧的版本：

```bash
svn rm https://dist.apache.org/repos/dist/release/calcite/apache-calcite-avatica-X.Y.Z
```

旧版本将保留在发布存档中。

## 使用 Docker 发布

假设已标记并推送了 rc 发布到 git 存储库。

```bash
docker-compose run promote-release
```

## 添加发布说明并宣布发布

通过复制 site/_posts/2016-11-01-release-1.9.0.md 添加发布说明，并在 gradle.properties 中更新版本号，生成 javadoc 并复制到 site/target/avatica/javadocAggregate，发布网站，并检查它是否出现在新闻内容中。

24 小时后，通过发送电子邮件到 announce@apache.org 宣布发布。您可以使用 1.8.0 公告作为模板。确保包括项目的简要描述。

## 发布网站（对 Calcite 提交者）

请参阅 site/README.md 中的说明。

# 参考资料

https://calcite.apache.org/avatica/docs/howto.html

* any list
{:toc}