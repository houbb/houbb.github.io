---
layout: post
title: Semantic UI
date:  2017-03-23 20:57:40 +0800
categories: [UI]
tags: [ui, semantic]
header-img: "static/app/res/img/python-bg.jpg"
published: true
---

<head>
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.3/semantic.min.css">
</head>


# Semantic-Ui

[Semantic](http://www.semantic-ui.cn/) is a development framework that helps create beautiful, 
responsive layouts using human-friendly HTML.

> [Github](https://github.com/Semantic-Org/Semantic-UI)

> [zh_CN](http://www.semantic-ui-cn.com/)


# Install in MAC

一、Install NodeJS

按照如下步骤进行。或者从[Node.js](https://nodejs.org/en/)官网[下载](https://nodejs.org/download/)。


方式一：Homebrew

1) [Install Homebrew](https://houbb.github.io/2016/10/15/Mac#brew)

2) 输入命令

```
brew install node
```

then you can see:

```
Updating Homebrew...
==> Installing dependencies for node: icu4c
==> Installing node dependency: icu4c
==> Downloading https://homebrew.bintray.com/bottles/icu4c-58.2.el_capitan.bottle.tar.gz
######################################################################## 100.0%
==> Pouring icu4c-58.2.el_capitan.bottle.tar.gz
==> Caveats
This formula is keg-only, which means it was not symlinked into /usr/local.

macOS provides libicucore.dylib (but nothing else).

If you need to have this software first in your PATH run:
  echo 'export PATH="/usr/local/opt/icu4c/bin:$PATH"' >> ~/.bash_profile
  echo 'export PATH="/usr/local/opt/icu4c/sbin:$PATH"' >> ~/.bash_profile

For compilers to find this software you may need to set:
    LDFLAGS:  -L/usr/local/opt/icu4c/lib
    CPPFLAGS: -I/usr/local/opt/icu4c/include

==> Summary
🍺  /usr/local/Cellar/icu4c/58.2: 242 files, 65MB
==> Installing node 
==> Downloading https://homebrew.bintray.com/bottles/node-7.7.4.el_capitan.bottle.tar.gz
######################################################################## 100.0%
==> Pouring node-7.7.4.el_capitan.bottle.tar.gz
Error: The `brew link` step did not complete successfully
The formula built, but is not symlinked into /usr/local
Could not symlink bin/node
Target /usr/local/bin/node
already exists. You may want to remove it:
  rm '/usr/local/bin/node'

To force the link and overwrite all conflicting files:
  brew link --overwrite node

To list all files that would be deleted:
  brew link --overwrite --dry-run node

Possible conflicting files are:
...
...
==> Using the sandbox
Warning: The post-install step did not complete successfully
You can try again using `brew postinstall node`
==> Caveats
Bash completion has been installed to:
  /usr/local/etc/bash_completion.d
==> Summary
🍺  /usr/local/Cellar/node/7.7.4: 3,148 files, 40.2MB
```


方式二：Git

(未尝试)

```
git clone git://github.com/ry/node.git
cd node
./configure
make
sudo make install
```

二、Install Gulp

Semantic UI uses [Gulp](http://www.gulpjs.com/) to provide command line tools for building themed versions of the library with just the components you need.

Gulp is an NPM module and must be installed globally

```
npm install -g gulp
```

then you may see

```
houbinbindeMacBook-Pro:~ houbinbin$ npm install -g gulp
npm WARN deprecated minimatch@2.0.10: Please update to minimatch 3.0.2 or higher to avoid a RegExp DoS issue
npm WARN deprecated minimatch@0.2.14: Please update to minimatch 3.0.2 or higher to avoid a RegExp DoS issue
npm WARN deprecated graceful-fs@1.2.3: graceful-fs v3.0.0 and before will fail on node releases >= v7.0. Please update to graceful-fs@^4.0.0 as soon as possible. Use 'npm ls graceful-fs' to find it in the tree.
npm WARN checkPermissions Missing write access to /usr/local/lib/node_modules
...
...
npm ERR! Darwin 15.3.0
npm ERR! argv "/usr/local/bin/node" "/usr/local/bin/npm" "install" "-g" "gulp"
npm ERR! node v6.2.2
npm ERR! npm  v3.9.5
npm ERR! path /usr/local/lib/node_modules
npm ERR! code EACCES
npm ERR! errno -13
npm ERR! syscall access

npm ERR! Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
npm ERR!     at Error (native)
npm ERR!  { Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
npm ERR!     at Error (native)
npm ERR!   errno: -13,
npm ERR!   code: 'EACCES',
npm ERR!   syscall: 'access',
npm ERR!   path: '/usr/local/lib/node_modules' }
npm ERR! 
npm ERR! Please try running this command again as root/Administrator.

npm ERR! Please include the following file with any support request:
npm ERR!     /Users/houbinbin/npm-debug.log
```

- 权限不足

```
sudo npm install -g gulp
```

三、Install Semantic UI

Semantic UI is available in an eponymous package on NPM

(友情提示：推荐之间使用sudo执行以下命令，免得有权限问题)

```
npm install semantic-ui --save
cd semantic/
gulp build
```

then you may can see

```
npm WARN deprecated gulp-clean-css@2.4.0: breaking changes from clean-css 4.x. Please install gulp-clean-css 3.x
npm WARN deprecated minimatch@2.0.10: Please update to minimatch 3.0.2 or higher to avoid a RegExp DoS issue
npm WARN deprecated minimatch@0.2.14: Please update to minimatch 3.0.2 or higher to avoid a RegExp DoS issue
npm WARN deprecated graceful-fs@1.2.3: graceful-fs v3.0.0 and before will fail on node releases >= v7.0. Please update to graceful-fs@^4.0.0 as soon as possible. Use 'npm ls graceful-fs' to find it in the tree.

> fsevents@1.1.1 install /Users/houbinbin/IT/ui/node_modules/fsevents
> node install

[fsevents] Success: "/Users/houbinbin/IT/ui/node_modules/fsevents/lib/binding/Release/node-v48-darwin-x64/fse.node" already installed
Pass --update-binary to reinstall or --build-from-source to recompile

> semantic-ui@2.2.9 install /Users/houbinbin/IT/ui/node_modules/semantic-ui
> gulp install

[21:50:30] Using gulpfile ~/IT/ui/node_modules/semantic-ui/gulpfile.js
[21:50:30] Starting 'install'...



[21:50:30] Starting 'run setup'...
? Set-up Semantic UI (Use arrow keys)
❯ Automatic (Use defaults locations and all components) 
  Express (Set components and output folder) 
  Custom (Customize all src/dist values) 

```

会在当前路径下安装很多文件。(我没有选择安装的内容，默认安装全部)


四、Include in Your HTML

Running the gulp build tools will compile CSS and Javascript for use in your project. Just link to these files in your HTML.

```html
<link rel="stylesheet" type="text/css" href="semantic/dist/semantic.min.css">
<script src="semantic/dist/semantic.min.js"></script>
```


<label class="label label-info">想法</label>

我觉得上面这么复杂的操作，只是为了让你更好的选择性安装css/js等文件。其实如果需求简单，可以直接把对应的文件下载下来，引入即可。

简单的颜色测试


<div class="ui five column stackable padded grid">
  <div class="red column">Red</div>
  <div class="orange column">Orange</div>
  <div class="yellow column">Yellow</div>
  <div class="olive column">Olive</div>
  <div class="green column">Green</div>
  <div class="teal column">Teal</div>
  <div class="blue column">Blue</div>
  <div class="violet column">Violet</div>
  <div class="purple column">Purple</div>
  <div class="pink column">Pink</div>
  <div class="brown column">Brown</div>
  <div class="grey column">Grey</div>
  <div class="black column">Black</div>
</div>


# Updating

Semantic's NPM install script will automatically update Semantic UI to the latest version while preserving your site and packaged themes.

```
npm update
```

* any list
{:toc}





