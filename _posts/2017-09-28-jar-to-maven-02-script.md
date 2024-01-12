---
layout: post
title:  maven 发布到中央仓库常用脚本-02
date:  2017-09-28 18:52:13 +0800
categories: [Maven]
tags: [maven, bash, bat, sh]
published: true
---

# 作用

整理常见的脚本

主要分为 bash 和 bat 文件。


# Bash 脚本

## cgit.sh

```sh
# 提交

git pull
git add .
git commit -m "[Feature] add for new"
git push
git status

# 1. 赋值权限： chmod +x ./cgit.sh
# 2. 执行： ./cgit.sh
# Last Update Time: 2018-11-21 21:55:38
# Author:   houbb
```

## release.sh

```sh
#!/usr/bin/env bash
echo "============================= RELEASE START..."

## 版本号信息(需要手动指定)
version="0.0.1"
newVersion="0.0.2"
projectName="csv"

# release 项目版本
## snapshot 版本号
snapshot_version=${version}"-SNAPSHOT"
## 新的版本号
release_version=${version}

mvn versions:set -DgroupId=com.github.houbb -DartifactId=${projectName} -DoldVersion=${snapshot_version} -DnewVersion=${release_version}
mvn -N versions:update-child-modules
mvn versions:commit
echo "1. RELEASE ${snapshot_version} TO ${release_version} DONE."


# 推送到 github
git add .
git commit -m "release branch ${version}"
git push
git status

echo "2. PUSH TO GITHUB DONE."


# 推送到 maven 中央仓库
mvn clean deploy -P release

echo "3. PUSH TO MAVEN CENTER DONE."

# 合并到 master 分支
branchName="release_"${version} # 分支名称
git checkout master
git pull
git checkout ${branchName}
git rebase master
git checkout master
git merge ${branchName}
git push

echo "4. MERGE TO MASTER DONE."


# 拉取新的分支
newBranchName="release_"${newVersion}
git branch ${newBranchName}
git checkout ${newBranchName}
git push --set-upstream origin ${newBranchName}

echo "5. NEW BRANCH DONE."

# 修改新分支的版本号
## snapshot 版本号
snapshot_new_version=${newVersion}"-SNAPSHOT"
mvn versions:set -DgroupId=com.github.houbb -DartifactId=${projectName} -DoldVersion=${release_version} -DnewVersion=${snapshot_new_version}
mvn -N versions:update-child-modules
mvn versions:commit

git add .
git commit -m "modify branch ${release_version} TO ${snapshot_new_version}"
git push
git status
echo "6. MODIFY ${release_version} TO ${snapshot_new_version} DONE."

echo "============================= RELEASE END..."


# 使用方式：
# 1. 赋值权限： chmod +x ./release.sh
# 2. 执行： ./release.sh
# Last Update Time: 2018-01-20 13:17:06
# Author:   houbb
```

## release_rm.sh

```sh
#!/usr/bin/env bash
echo "============================= RELEASE START..."

## 版本号信息(需要手动指定)
oldVersion="1.0.0"
newVersion="1.0.0"
projectName="csv"

# 删除分支
oldBranchName="release_"${oldVersion}
git branch -d ${oldBranchName}
git push origin --delete ${oldBranchName}

echo "1. Branch remove success..."

# 拉取新的分支
newBranchName="release_"${newVersion}
git branch ${newBranchName}
git checkout ${newBranchName}
git push --set-upstream origin ${newBranchName}

echo "2. NEW BRANCH DONE."

# 修改新分支的版本号
## snapshot 版本号
snapshot_new_version=${newVersion}"-SNAPSHOT"
mvn versions:set -DgroupId=com.github.houbb -DartifactId=${projectName} -DoldVersion=${release_version} -DnewVersion=${snapshot_new_version}
mvn -N versions:update-child-modules
mvn versions:commit

git add .
git commit -m "modify branch ${release_version} TO ${snapshot_new_version}"
git push
git status
echo "3. MODIFY ${release_version} TO ${snapshot_new_version} DONE."

echo "============================= BRANCH RE-CREATE END..."

echo "============================= BRANCH LIST ============================="
git branch -a

# 使用方式：
# 注意：本脚本用于删除分支，谨慎使用!
# 1. 赋值权限： chmod +x ./release_rm.sh
# 2. 执行： ./release_rm.sh
# Last Update Time: 2018-06-21 11:10:42
# Author:   houbb
```

# BAT

## cgit.bat

```bat
:: 用于提交当前变更(windows)
:: author: houbb
:: LastUpdateTime:  2018-11-22 09:08:52
:: 用法：双击运行，或者当前路径 cmd 直接输入 .\cgit.bat

git pull
git add .
git commit -m "[Feature] add for new"
git push
git status
```

## release.bat

```bat
:: 用于 release 当前项目(windows)
:: author: houbb
:: LastUpdateTime:  2018-1-22 09:08:52
:: 用法：双击运行，或者当前路径 cmd 直接输入 release.bat

:: 关闭回显
@echo OFF

ECHO "============================= RELEASE START..."

:: 版本号信息(需要手动指定)
:::: 旧版本名称
SET version=0.0.1
:::: 新版本名称
SET newVersion=0.0.2
:::: 组织名称
SET groupName=com.github.houbb
:::: 项目名称
SET projectName=jdbc

:: release 项目版本
:::: snapshot 版本号
SET snapshot_version=%version%"-SNAPSHOT"
:::: 新的版本号
SET release_version=%version%

call mvn versions:set -DgroupId=%groupName% -DartifactId=%projectName% -DoldVersion=%snapshot_version% -DnewVersion=%release_version%
call mvn -N versions:update-child-modules
call mvn versions:commit
call echo "1. RELEASE %snapshot_version% TO %release_version% DONE."


:: 推送到 github
git add .
git commit -m "release branch %version%"
git push
git status

ECHO "2. PUSH TO GITHUB DONE."

:: 推送到 maven 中央仓库
call mvn clean deploy -P release
ECHO "3 PUSH TO MVN CENTER DONE."
```

* any list
{:toc}












 

