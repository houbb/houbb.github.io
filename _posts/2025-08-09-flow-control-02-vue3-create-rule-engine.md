---
layout: post
title: 流程控制-02-vue3项目创建 条件匹配引擎 match-condition
date: 2025-8-9 02:30:30 +0800
categories: [FLOW]
tags: [flow, vue3, sh]
published: true
---


# 项目创建

```
npm create vite@latest match-condition-demo -- --template vue
cd match-condition-demo
  npm install
  npm run dev
```

## 报错

```
$ npm run dev

> match-condition-demo@0.0.0 dev
> vite

error when starting dev server:
TypeError: crypto.hash is not a function
    at getHash (file:///D:/vue-demo/match-condition-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:2789:21)
    at getLockfileHash (file:///D:/vue-demo/match-condition-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:11745:9)
    at getDepHash (file:///D:/vue-demo/match-condition-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:11748:23)
    at initDepsOptimizerMetadata (file:///D:/vue-demo/match-condition-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:11201:53)
    at createDepsOptimizer (file:///D:/vue-demo/match-condition-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:34854:17)
    at new DevEnvironment (file:///D:/vue-demo/match-condition-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:35619:109)
    at Object.defaultCreateClientDevEnvironment [as createEnvironment] (file:///D:/vue-demo/match-condition-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:36038:9)
    at _createServer (file:///D:/vue-demo/match-condition-demo/node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js:28464:132)
    at async CAC.<anonymous> (file:///D:/vue-demo/match-condition-demo/node_modules/vite/dist/node/cli.js:573:18)
```

### 版本

```
$ node -v
v20.10.0
```

### 解决方式 降级到 Node 20.10 能跑的 Vite 版本


```bash
npm install vite@5.4.10 @vitejs/plugin-vue@5.1.4 --save-dev
```

然后清理依赖缓存并重装：

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 效果

http://localhost:5173/ 可以查看效果


# 需求

角色：你是一名经验丰富的前端研发。精通 vue3+elementui，页面交互设计，页面样式设计。

任务：

vue3 最简单的项目架子已经通过 `npm create vite@latest match-condition-demo -- --template vue` 命令创建。

要求

1）通过 vue3+element-ui 初始化菜单+每个页面默认简单描述

2）菜单要求包含icon，支持收缩。在左侧

3）初始化菜单包含：

条件列表

值获取方式

操作符管理

## 要求

封装性：尽可能的组件化+方便后续拓展

样式要求：页面大气+有科技感+用户体用佳+风格统一

技术选型：vue3+elementui

文件返回方式：首先给出文件整体目录，然后按照页面分类，一个个文件分别给出，避免错乱。




# v1-基本菜单

## 依赖安装

```
npm install element-plus @element-plus/icons-vue
npm install vue-router@4
```


## 页面启动报错

```
Uncaught SyntaxError: The requested module '/src/router/index.js' does not provide an export named 'default' (at main.js:3:8)
```


# v2-值获取页面

我们来完善一下值获取页面ValueFetchMethod.vue。

要求：支持列表的查询、列表（包含分页）、新增（通过模态框）、单个数据的删除、详情。  

字段说明：name 编码名称，label 显示标签、是否启用、 创建时间、修改时间、创建人、修改人、

给出实现后的页面信息，接口暂时全部 mock 实现。


## 查询条件

优化：

涉及到字段都支持查询，其中时间用范围查询，时间筛选默认折叠起来。

目前新增点击无效，缺少编辑按钮能力

修正后重新给

# v3-操作符管理页面

我们来完善一下操作符管理页面 OperatorManagement.vue

要求：支持列表的查询、列表（包含分页）、新增（通过模态框）、单个数据的编辑、删除、详情。涉及到字段都支持查询，其中时间用范围查询，时间筛选默认折叠起来。

字段说明：name 编码名称，label 显示标签、remark 备注、是否启用、 创建时间、修改时间、创建人、修改人

给出实现后的页面信息，接口暂时全部 mock 实现。

默认的数据信息如下：

```
IS_NULL("IS_NULL", "为NULL"),
IS_NOT_NULL("IS_NOT_NULL", "不为NULL"),
IS_EMPTY("IS_EMPTY", "是否为 EMPTY"),
IS_NOT_EMPTY("IS_NOT_EMPTY", "是否不为 EMPTY"),
EQ("EQ", "等于"),
NEQ("NEQ", "不等于"),
GT("GT", "大于"),
LT("LT", "小于"),
LTE("LTE", "小于等于"),
GTE("GTE", "大于等于"),
CONTAINS("CONTAINS", "包含"),
NOT_CONTAINS("NOT_CONTAINS", "不包含"),
START_WITH("START_WITH", "以...开头"),
NOT_START_WITH("NOT_START_WITH", "不以...开头"),
END_WITH("END_WITH", "以...结尾"),
NOT_END_WITH("NOT_END_WITH", "不以...结尾"),
MATCH_REGEX("MATCH_REGEX", "匹配正则"),
NOT_MATCH_REGEX("NOT_MATCH_REGEX", "不匹配正则"),
```

# v4-条件列表

我们来完善一下条件列表页面 ConditionList.vue

要求：支持列表的查询、列表（包含分页）、单个数据的删除、详情。涉及到字段都支持查询，其中时间用范围查询，时间筛选默认折叠起来。条件的新增、修改比较复杂，跳转到详细的编辑页面

字段说明：条件名称、条件标签、是否启用、表达式解释、remark 备注、创建时间、修改时间、创建人、修改人

给出实现后的页面信息，接口暂时全部 mock 实现。

给出默认的1条数据信息。

注意：条件的新增、修改比较复杂，跳转到详细的编辑页面。我们页面先留空，先实现条件列表页面。

给出实现信息

------------------------------------------------------------------------------------------

# v5-条件编辑/新增页面 ConditionEdit.vue

我们来完善一下条件编辑/新增页面 ConditionEdit.vue

信息加载：新增跳转过来，页面基本信息初始化为空；编辑过来，根据 id 加载数据，渲染页面。

要求：页面主要分为4个部分

A 上方基本信息：条件名称（最长64字）、是否启用、remark 备注（最长512字）、条件标签（Tag 标签动态编辑效果，最多5个）

B. 接下来是条件表达式模块，将其抽成一个组件。

暂时简单实现，直接让用户输入表达式即可

C. 条件明细列表部分，初始化为1个（至少保留1个）支持增删+移动，最多20个。

操作说明：条件名称单独占一行，最右侧是【新增】【删除】【上移】【下移】。【新增】【删除】控制条件明细的增删，至少保留1个，最多20个。【上移】【下移】控制排序位置(order, 从0开始递增)。

条件明细包含以下基本信息：

条件编码(code): `r-xxx`（默认 xxx 从1开始单调递增，用户不可见）

条件名称(label): 默认显示为`条件-xxx`，允许用户编辑（xxx 和编码中的 xxx 初始化一样）。

紧接着是下方的左右值+比较符，在同一行

左值获取（leftProp）：下拉框，对应我们值获取列表的默认初始值。

左值(leftValue): input 输入框

操作符（matchOperator）：下拉框，对应我们操作符列表的默认初始值。

右值获取（rightProp）：下拉框，对应我们值获取列表的默认初始值。

右值(rightValue): input 输入框

操作符（matchOperator）：下拉框，对应我们操作符列表的默认初始值。


单个条件明细的 json 如下：

```js
{
    "code": "条件编码"，
    "label": "条件名称",    
    "leftProp": "constant",
    "leftValue": "1",
    "matchOperator": "EQ",
    "rightProp": "constant",
    "rightValue": "1",
    "order": 0
}
```

条件明细之间，类似 divider 的横线分割。


D. 接下来是预览验证模块

左侧是一个 json 输入框，允许用户输入测试 json，点击【验证】给出表达式验证的结果、耗时等基本信息

验证的真实逻辑后续会放在后端实现，暂时全部 mock 为真即可。

E. 最下方是操作模块，包含按钮 取消、确认

取消后直接返回列表页

确认后输出整体信息到 console，mock 调用保存接口，然后返回列表页

## 其他要求

给出实现后的页面信息，后端接口调用暂时全部 mock 实现。

## 优化1

整体布局很不错，就是这个感觉

1）新增标签部分，调整为用 el-tag 实现

2）条件表达式没看到输入框，修正下

3）条件明细部分添加限制：条件名称限制最长64，左值最长 128, 左值最长 128

4）样式优化

a. 最下方的取消、确认按钮居中显示

b. 新增、删除、上移、下移 太大了，用默认最小的 button 样式，然后用合适 icon 替代文本

c. 条件名称 左值获取 右值获取 三个放在一行，剩下的 左值+操作符+右值放在一行。布局合适点，看着要舒服些。

重新给

## 优化2

在我下面的代码基础上，做如下优化

1）我想要如下的标签标记效果，类似于刚才发给你的动态标签 

2) 条件明细输入框适当长一点，三列刚好占满一行。

3）上下移动的时候，用户输入的条件名称不要更新掉，保持原来的。（只是改变 order 顺序而已）

# v6-条件表达式可视化

接下来我们对条件表达式抽象为一个组件，进行优化。原来：

```xml
<el-card class="box-card" shadow="hover" style="margin-top: 16px;">
  <div class="section-title">条件表达式</div>
  <el-input
    type="textarea"
    v-model="form.expression"
    placeholder="请输入条件表达式"
    rows=3
  />
</el-card>
```

优化点：

## 页面布局

1）用户手动输入各种条件可能输入错误。让用户可以可视化操作。每个条件明细用好看的按钮表示，显示的是条件名，对应的条件 code 唯一标识。

2）用户每次在下方增加、或者删除一个条件明细时。可视化的节点对应更新，清除掉所有的关系。

3）条件明细按钮支持点击选中（高亮颜色改变），再次点击取消选中。可以拖拽，移动可视化的排序位置。

4）最下方显示出对应的条件表达式，只是显示，暂时禁止编辑。

## 功能按钮

下方针对每个条件明细，支持的操作类型有：

1）关系类型按钮：满足全部 满足任一 自定义 清空关系

清空关系 去掉所有的节点关系，expression 同步清空

满足全部 点击后全部条件用 && 关联，按钮可视化显示为 【条件1】且【条件2】且【条件3】这种形式，实际的 expression 对应变化为 r001 && r002 && r003

满足任一 点击后全部条件用 || 关联，按钮可视化显示为 【条件1】或【条件2】或【条件3】这种形式，实际的 expression 对应变化为 r001 || r002 || r003

自定义 点击后自定义后，支持【且】【或】【非】三个逻辑关系，最下方显示出来，允许用户选择使用；同理可视化、expression 都按照对应的标准呈现

你也可以做适当优化，但是整体目的就是一个表达式从手写==》可视化编辑的优化。

给出完整的实现 vue，以及相关 vue3 代码需要调整的地方


# chat

## 报错原因

你这个报错

```
TypeError: crypto.hash is not a function
```

是因为 **Vite 新版本内部用到的 Node API** 和你当前的 Node.js 版本不兼容。
从 Node.js v19 开始，`crypto.hash` 这个旧 API 已经被移除了，Vite 内部应该用的是 `crypto.createHash`。

出现这种问题的常见原因有两种：

1. **Node 版本太老**（比如 16.x、17.x），不支持 Vite 新版本依赖的特性。
2. **Node 版本太新**（比如 21.x），Vite 旧版本还在用被废弃的 API。

---

### 解决方法

#### 方法 1：升级 Node.js（推荐）

如果你 Node 版本比较旧（16.x/17.x/18.x），建议直接升到 LTS 版本：

```bash
# 推荐安装 Node.js 20 LTS
https://nodejs.org/en
```

升级后重新安装依赖：

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

#### 方法 2：降级 Node.js

如果你 Node 版本很新（>=21.x），但用的 Vite 较老（比如 4.x），可以切回 Node.js 20 LTS：

```bash
# 用 nvm 切版本
nvm install 20
nvm use 20
```

---

#### 方法 3：升级 Vite

如果你不能改 Node 版本，可以升级 Vite 到最新版本（目前 Vite 5.x 已修复对 crypto API 的调用）：

```bash
npm install vite@latest
```

---

#### 方法 4：本地临时修复（不推荐长期用）

找到报错的文件：

```
node_modules/vite/dist/node/chunks/dep-eRCq8YxU.js
```

把 `crypto.hash(...)` 改成：

```js
crypto.createHash('sha256').update(...).digest('hex')
```

但这属于“硬改依赖”，下次 `npm install` 就会丢失。

---

我建议你先运行：

```bash
node -v
```

告诉我你现在的 Node 版本，我可以帮你判断是**升级 Node**还是**升级 Vite**比较合适。

我猜你可能是 Node 21+ + 旧 Vite 的组合，这种情况我可以给你一个最快 2 分钟修好的方案。











# 参考资料

* any list
{:toc}