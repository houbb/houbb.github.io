---
layout: post
title: VUE3-52-vue axios qs 前后端分离调用方式
date: 2021-08-02 21:01:55 +0800
categories: [VUE]
tags: [vue, hello-world, vue-learn, sh]
published: true
---

# 普通方式

## 后端

```java
/**
* 编辑
* @param entity 实体
* @return 结果
*/
@RequestMapping("/edit")
@ResponseBody
public BaseResp edit(final Role entity) {
    roleService.updateById(entity);
    return RespUtil.success();
}
```

## 前端

```js
/**
 * 保存编辑表单
 * @param editForm 编辑表单
 */
saveEditForm(editForm) {
  var entity = {
      id: this.editForm.id,
      roleId: this.editForm.roleId,
      roleName: this.editForm.roleName,
      remark: this.editForm.remark,
      operatorId: this.editForm.operatorId,
      createTime: this.editForm.createTime,
      updateTime: this.editForm.updateTime,
  };
  // 此处使用 qs 序列化，后端不需要使用 @RequestBody 注解。
  var data = Qs.stringify(entity);
  var _this = this;
  axios.post('/role/edit', data).then(function (response) {
      if(response.data.respCode === '0000') {
          ELEMENT.Message.success("请求成功");
          _this.doQuery();
          _this.closeDialogEditVisible();
      } else {
          ELEMENT.Message.error(response.data.respMessage);
      }
  }).catch(function (error) {
      ELEMENT.Message.error("请求失败");
      console.log(error);
  });
}
```

`Qs.stringify(entity);`  这一句话是核心。

# @RequestBody 方式

## 后端

```java
/**
* 添加元素
* @param entity 实体
* @return 结果
*/
@RequestMapping("/add")
@ResponseBody
public BaseResp add(@RequestBody final Role entity) {
    roleService.insert(entity);
    return RespUtil.success();
}
```

如果后端指定了注解，前端就需要指定序列化。

## 前端

```js
/**
 * 保存新增数据
 * @param aaa 表单信息
 */
saveAddForm(aaa) {
    var _this = this;
    var entity = {
        id: this.addForm.id,
        roleId: this.addForm.roleId,
        roleName: this.addForm.roleName,
        remark: this.addForm.remark,
        operatorId: this.addForm.operatorId,
        createTime: this.addForm.createTime,
        updateTime: this.addForm.updateTime,
    }
    axios.post('/role/add', entity).then(function (response) {
        if(response.data.respCode === '0000') {
            ELEMENT.Message.success("请求成功");
            _this.closeDialogAddVisible();
            _this.doQuery();
        } else {
            ELEMENT.Message.error(response.data.respMessage);
        }
    }).catch(function (error) {
        ELEMENT.Message.error("请求失败");
        console.log(error);
    });
},
```


# 参考资料


* any list
{:toc}