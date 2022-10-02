---
layout: post
title:  低代码开源源码学习-01-git 代码提交钩子校验
date:  2022-09-03 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# 钩子校验

## 说明

为了保障提交 commit 的规范性。

## 实现

根目录下的 `./husky` 

```
│  commit-msg
│  pre-commit
│
└─_
        .gitignore
        husky.sh
```

### pre-commit

内容如下：

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run pre-commit
```

首先执行 husky.sh 脚本内容，然后执行 npm 脚本进行 lint 等格式校验。

### commit-msg

内容如下。

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

FORCE_COLOR=1 node scripts/verify-commit.js $1
```

调用执行了 husky.sh 和 `verify-commit.js`

### husky.sh

```sh
#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename -- "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  readonly husky_skip_init=1
  export husky_skip_init
  sh -e "$0" "$@"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "husky - $hook_name hook exited with code $exitCode (error)"
  fi

  if [ $exitCode = 127 ]; then
    echo "husky - command not found in PATH=$PATH"
  fi

  exit $exitCode
fi
```

### verify-commit.js

这里是对 commit 注释的格式要求：

```js
// eslint-disable-next-line import/no-extraneous-dependencies
const chalk = require('chalk')

const msgPath = process.argv[2]
const msg = require('fs')
.readFileSync(msgPath, 'utf-8')
.trim()

const commitRE = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|release)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
    console.log()
    console.error(
        `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
            '不合法的 commit 消息格式',
        )}\n\n`
          + chalk.red(
              '  请使用正确的提交格式:\n\n',
          )
          + `    ${chalk.green('feat: add \'comments\' option')}\n`
          + `    ${chalk.green('fix: handle events on blur (close #28)')}\n\n`
          + chalk.red('  请查看 git commit 提交规范：https://github.com/woai3c/Front-end-articles/blob/master/git%20commit%20style.md。\n'),
    )

    process.exit(1)
}
```

# 参考资料

https://blog.csdn.net/m0_60559048/article/details/123359788

* any list
{:toc}
