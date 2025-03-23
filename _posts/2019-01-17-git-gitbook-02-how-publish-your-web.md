---
layout: post
title:  GitBook-02-gitbook 如何发布自己的 github 专栏
date: 2019-1-17 09:34:35 +0800
categories: [Git]
tags: [git, devops, git-learn, git-topic, gitbook, sh]
published: true
---

# 一、账号注册

## 1、账号注册

Gitbook网址：https://www.gitbook.com/

点击 SIGN UP WITH GITHUB，通过关联 Github 注册

## 2、创建空间

注册完成后，选择空间名称及用途，正常填写就好，后续也可以修改。

![创建空间](https://pic2.zhimg.com/v2-7ed1994cf6ca7f03059bfe49dcd63c5b_1440w.jpg)

## 3、邀请团队协作

Gitbook 可以通过邮箱邀请其他成员共同加入空间，协作管理，可直接跳过。

![邀请团队协作](https://pica.zhimg.com/v2-ef93d7ec7ecfcbf5badf230443a8f3fe_1440w.jpg)

# 二、如何同步内容到 Github

## 1、选择安装 Github Sync

![Github Sync](https://picx.zhimg.com/v2-f36e50bc9ac41947513b0ea78081287b_1440w.jpg)

> [enabling-github-sync](https://docs.gitbook.com/~/changes/pfQHJq75QY5xMYvctdXP/integrations/git-sync/enabling-github-sync)

## 2、选择要关联的 Gitbook 空间

可以选择关联 Gitbook 账号所有的空间，这儿仅关联注册时创建的空间。

![选择要关联的 Gitbook 空间](https://pic1.zhimg.com/v2-3ad23fbfc57a6a21833029dc9f5aa3d0_1440w.jpg)

## 3、获取 Github 访问权限

选择关联的空间后，选择访问 Github 权限，这里选择单个仓库；点击安装，输入github密码，同意安装。

![获取 Github 访问权限](https://pic4.zhimg.com/v2-7fc92172de808ff7b7738ebf3e2bab73_1440w.jpg)

## 4、关联 Github 仓库

完成授权后，选择已授权的 Github账户、要关联的仓库以及分支。

![关联 Github 仓库](https://pic1.zhimg.com/v2-181bc56f361a9d4679812dd3bf62e56c_1440w.jpg)

## 5、选择同步策略

选择同步策略，第一个是从 Github 同步到 Gitbook，适合在 Github 更新内容，同步到 Gitbook上；第二个反之。

这取决于你再哪里更新内容，对于不熟悉 Github 的同学，建议选择第二个，在 Gitbook 编写内容，并同步到 Github上。

![选择同步策略](https://pic1.zhimg.com/v2-1107daa91ca28c01bd7826abbfc29f22_1440w.jpg)

# 三、在 Gitbook 编写内容

## 1、编辑内容

点击 Edit 编辑图标，即可开始编辑内容。如何开启了 Github 同步，会自动创建 PR draft。

![编辑内容](https://pica.zhimg.com/v2-e54126fa40c5d8c422a3f7aa47dc44c2_1440w.jpg)

## 2、同步到 Github

编写内容完成后，添加 PR 标题，再 Merge，即可同步到Github。

# 四、如何将小册发布

上述步骤编写的内容只有自己和空间的协作者可以看到，Gitbook 可以将空间内容发布到网上，这样所有人都可以访问。

因此通过 Gitbook 编写自己的专栏，能够快速免费部署到网上，提高自己的影响力。

## 1、发布到公网

选择要发布的空间，点击 Share，勾选 Publish to the web。

## 2、生成个人网站域名

勾选后，即可自动 gitbook 前缀域名。

![生成个人网站域名](https://pic4.zhimg.com/v2-08196f693b450023e19f1620e0544a7b_1440w.jpg)

## 3、个性化网站

在生成个人域名弹出的页面，点击 Customize your site，即可进入到通用、布局、分享等个性化配置，右侧可以实时预览配置后的效果。

![个性化网站](https://picx.zhimg.com/v2-08286b87a5170708c4a96fc1a10cc23f_1440w.jpg)

也可以重新从 Share 进入 Publish to the web，选择下方 Customize the look and feel 在自定义配置。

![Customize the look and feel](https://picx.zhimg.com/v2-0fb0acfde677adbce99916395d81f295_1440w.jpg)

## 4、自定义域名

### 1、选择 Connet a domain

![Connet a domain](https://pic1.zhimg.com/v2-1bb9cc535a2f9f1315de5eb6b5002706_1440w.jpg)

### 2、域名配置

输入你的域名，可以是二级域名。

配置完成后，点击 Ready: Go live，等待配置生效即可。

# 五、总结

本文介绍了 Gitbook 注册，如何编写专栏内容，同步到 Github，并发布到网上，通过配置域名就可以拥有个人专栏网站了，只需要关注专栏内容编写，就可以自动部署到网站，免费获得个人网站了，你可以分享你领域的知识，提升个人影响力，也可以当做个人知识笔记本，免费公开分享给网友，以上。

# 参考资料

https://zhuanlan.zhihu.com/p/690055436

* any list
{:toc}