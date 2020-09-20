---
layout: post
title:  Vue-08-vue+ element-ui 实现基本的增删改查
date:  2017-09-04 20:38:53 +0800
categories: [Vue]
tags: [ui, vue, learn-note, sh]
published: true
---

# 说明

最基本的 CRUD

# 后端

```java
import com.baomidou.mybatisplus.toolkit.IdWorker;
import com.github.houbb.privilege.admin.common.dto.BasePageInfo;
import com.github.houbb.privilege.admin.common.dto.BaseResp;
import com.github.houbb.privilege.admin.common.dto.common.CommonPageReq;
import com.github.houbb.privilege.admin.common.util.RespUtil;
import com.github.houbb.privilege.admin.dal.entity.User;
import com.github.houbb.privilege.admin.service.service.UserService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * <p>
 * 用户表 前端控制器
 * </p>
 *
 * @author binbin.hou
 * @since 2020-09-18
 */
@Controller
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 首页
     * @return 首页地址
     * @since 0.0.5
     */
    @RequestMapping("/index")
    public String index() {
        return "user/index";
    }

    @RequestMapping("/add")
    @ResponseBody
    public BaseResp add(@RequestBody final User user) {
        user.setUserId(IdWorker.get32UUID());
        userService.insert(user);

        return RespUtil.success();
    }

    @RequestMapping("/edit")
    @ResponseBody
    public BaseResp edit(final User user) {
        userService.updateById(user);

        return RespUtil.success();
    }

    @RequestMapping("/remove/{id}")
    @ResponseBody
    public BaseResp remove(@PathVariable final Integer id) {
        userService.deleteById(id);

        return RespUtil.success();
    }

    @RequestMapping("/list")
    @ResponseBody
    public BaseResp list(@RequestBody CommonPageReq pageReq) {
        BasePageInfo<User> pageInfo = userService.pageQueryList(pageReq);
        return RespUtil.of(pageInfo);
    }

}

```

# 前端

## 例子

缺陷：关于 rules 的校验暂时都不生效。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>用户首页</title>
    <!-- 引入样式 -->
    <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css"/>
    <style>
        .el-footer {
            color: #333;
            text-align: center;
            line-height: 60px;
        }

        .el-aside {
            background-color: #D3DCE6;
            color: #333;
            text-align: center;
            line-height: 200px;
            width: 200px;
        }

        .el-main {
            color: #333;
            text-align: center;
            padding-top: 100px;
            height: 520px;
        }

        #app, html, body, .el-container {
            height: 100%;
        }

        #app {
            margin-left: 300px;
            margin-right: 300px;
        }

        .el-pagination {
            padding-top: 100px;
        }
    </style>
</head>
<body>
<div id="app">
    <el-container direction="vertical">
        <el-header>
            <a href="#">
                <el-image style="width: 100px; height: 58px; display: inline-block;"
                          src="/img/logo.PNG"
                          fit="cover">
                </el-image>
            </a>

            <el-menu default-active="1"
                     class="el-menu-demo"
                     mode="horizontal" style="float: right;">
                <el-menu-item index="1">
                    <a href="/" target="_blank">首页</a>
                </el-menu-item>
                <el-submenu index="2">
                    <template slot="title">权限管理</template>
                    <el-menu-item index="2-1">
                        <i class="el-icon-user-solid"></i>
                        用户管理
                    </el-menu-item>
                    <el-menu-item index="2-2">
                        <i class="el-icon-magic-stick"></i>
                        角色管理
                    </el-menu-item>
                    <el-menu-item index="2-3">
                        <i class="el-icon-lock"></i>
                        权限管理
                    </el-menu-item>
                </el-submenu>
                <el-submenu index="3">
                    <template slot="title">审计日志</template>
                    <el-menu-item index="3-1"><i class="el-icon-user-solid"></i>用户操作</el-menu-item>
                    <el-menu-item index="3-2">角色操作</el-menu-item>
                    <el-menu-item index="3-3">权限操作</el-menu-item>
                </el-submenu>
                <el-submenu index="4">
                    <template slot="title">更多</template>
                    <el-menu-item index="4-1">关于我们</el-menu-item>
                    <el-menu-item index="4-2">变更日志</el-menu-item>
                    <el-menu-item index="4-3">版本信息</el-menu-item>
                </el-submenu>
            </el-menu>
        </el-header>

        <el-main>

            <el-form :model="queryForm" ref="queryForm" :inline="true" label-width="80px">
                <el-form-item label="用户标识">
                    <el-input v-model="queryForm.userId"></el-input>
                </el-form-item>
                <el-form-item label="用户名称">
                    <el-input v-model="queryForm.userName"></el-input>
                </el-form-item>
                <el-form-item label="用户描述">
                    <el-input v-model="queryForm.remark"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="doQuery('queryForm')" icon="el-icon-search">查询</el-button>
                    <el-button type="warning" @click="doClear('queryForm')" icon="el-icon-refresh-right">重置</el-button>
                    <el-button type="success" @click="dialogAddVisible = true" icon="el-icon-plus">新增</el-button>
                </el-form-item>
            </el-form>

            <el-divider></el-divider>

            <el-table
                    ref="singleTable"
                    :data="tableData"
                    border
                    stripe
                    style="width: 100%">
                <el-table-column type="index" label="序号" width="60">
                </el-table-column>
                <el-table-column
                        property="id"
                        label="用户主键"
                        width="100">
                </el-table-column>
                <el-table-column
                        property="userId"
                        label="用户标识">
                </el-table-column>
                <el-table-column
                        property="userName"
                        label="用户名称">
                </el-table-column>
                <el-table-column
                        property="remark"
                        label="备注">
                </el-table-column>
                <el-table-column
                        property="createTime"
                        label="创建时间">
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button
                                size="mini"
                                type="primary"
                                @click="handleRole(scope.row)"><i class="el-icon-magic-stick"></i></el-button>
                        <el-button
                                size="mini"
                                @click="handleEdit(scope.row)"><i class="el-icon-edit"></i></el-button>
                        <el-button
                                size="mini"
                                type="danger"
                                @click="handleDelete(scope.row)"><i class="el-icon-delete"></i></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :data="page"
                    :total="page.total"
                    :current-page="page.pageNum"
                    :page-size="page.pageSize"
                    @current-change="handleCurrentChange"
            >
            </el-pagination>

        </el-main>

        <el-divider></el-divider>
        <el-footer>
            由
            <el-link :underline="false" href="https://github.com/houbb/privilege-admin" type="primary">privilege-admin
            </el-link>
            强力支持
        </el-footer>

        <el-dialog title="添加用户" :visible.sync="dialogAddVisible">
            <el-form :model="addForm" :rules="addRules" ref="addForm">
                <el-form-item label="用户名称">
                    <el-input v-model="addForm.userName" prop="userName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="用户备注">
                    <el-input v-model="addForm.remark" prop="remark" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogAddVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAddForm('addForm')">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="修改用户" :visible.sync="dialogEditVisible" @close="closeDialogEditVisible">
            <el-form :model="editForm" :rules="editRules" ref="editForm">
                <el-form-item label="用户主键" style="display: none;">
                    <el-input v-model="editForm.id" prop="id" disabled></el-input>
                </el-form-item>
                <el-form-item label="用户标识">
                    <el-input v-model="editForm.userId" prop="userId" autocomplete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="用户名称">
                    <el-input v-model="editForm.userName" prop="userName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="用户备注">
                    <el-input v-model="editForm.remark" prop="remark" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogEditVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEditForm('editForm')">确 定</el-button>
            </div>
        </el-dialog>
    </el-container>
</div>

<script src="https://unpkg.com/vue/dist/vue.js"></script>
<!-- 引入组件库 -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>

<!--axios-->
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script src="https://cdn.bootcss.com/qs/6.5.1/qs.min.js"></script>
<script>
    var vm =new Vue({
        el: '#app',
        data: {
            tableData: [],
            page: {
                total: 0,
                pageNum: 1,
                pageSize: 10
            },
            dialogAddVisible: false,
            addRules: {
                userId: [
                    {required: true, message: '请输入用户标识', trigger: 'blur'},
                    {min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur'}
                ],
                userName: [
                    {required: true, message: '请输入用户名称', trigger: 'blur'},
                    {min: 1, max: 16, message: '长度在 1 到 16 个字符', trigger: 'blur'}
                ],
                remark: [
                    {min: 0, max: 128, message: '长度在 1 到 128 个字符', trigger: 'blur'}
                ],
            },
            addForm: {
                userName: '',
                remark: ''
            },
            queryForm: {
                userId: '',
                userName: '',
                remark: ''
            },
            dialogEditVisible: false,
            editForm: {
                id: '',
                userId: '',
                userName: '',
                remark: '',
                createTime: ''
            },
            editRules: {}
        },
        mounted () {
            // 接在完成之后，调用初始化方法
            this.init()
        },
        methods: {
            init() {
                // 加载数据
                this.doQuery();
            },
            doQuery() {
                var req = {
                    id: this.queryForm.userId,
                    name: this.queryForm.userName,
                    pageNum: this.page.pageNum,
                    pageSize: this.page.pageSize
                }

                console.log("请求：" + JSON.stringify(req));
                //axios 中的 this 并不指向 vue
                var _this = this;
                axios.post('/user/list', req).then(function (response) {
                    if(response.data.respCode === '0000') {
                        _this.tableData = response.data.list;
                        _this.page.total = response.data.total;
                    } else {
                        ELEMENT.Message.error(response.data.respMessage);
                    }
                }).catch(function (error) {
                    ELEMENT.Message.error("请求失败");
                    console.log(error);
                });
            },
            doClear() {
                this.queryForm.userId = '';
                this.queryForm.userName = '';
                this.queryForm.remark = '';
            },
            handleEdit(row) {
                this.editForm.id = row.id;
                this.editForm.userId = row.userId;
                this.editForm.userName = row.userName;
                this.editForm.remark = row.remark;
                this.editForm.createTime = row.createTime;

                // 显示编辑 form
                this.dialogEditVisible = true;
            },
            handleDelete(row) {
                var id = row.id;
                var _this = this;
                axios.post('/user/remove/' + id).then(function (response) {
                    if(response.data.respCode === '0000') {
                        _this.doQuery();

                        ELEMENT.Message.success("删除成功");
                        visible = false;
                    } else {
                        ELEMENT.Message.error(response.data.respMessage);
                    }
                }).catch(function (error) {
                    ELEMENT.Message.error("删除失败");
                });
            },
            handleRole(row) {
                alert(row.userName);
            },
            handleCurrentChange(val) {
                this.page.pageNum = val;
                this.doQuery();
            },
            closeDialogAddVisible() {
                this.$refs.addForm.resetFields();//element封装的方法,清空模态框的值
                this.dialogAddVisible = false;
            },
            /**
             *确定新增数据
             * @param aaa 表单信息
             */
            saveAddForm(aaa) {
                var _this = this;
                this.$refs[aaa].validate((valid) => {
                    console.log(this.$refs[aaa])
                    if (valid) {
                        var user = {
                            userName: this.addForm.userName,
                            remark: this.addForm.remark
                        }
                        axios.post('/user/add', user).then(function (response) {
                            if(response.data.respCode === '0000') {
                                ELEMENT.Message.success("请求成功");
                                _this.closeDialogAddVisible();
                            } else {
                                ELEMENT.Message.error(response.data.respMessage);
                            }
                        }).catch(function (error) {
                            ELEMENT.Message.error("请求失败");
                            console.log(error);
                        });
                    }
                })
            },
            closeDialogEditVisible() {
                this.$refs.editForm.resetFields();//element封装的方法,清空模态框的值
                this.dialogEditVisible = false;
            },
            saveEditForm(editForm) {
                var user = {
                    id: this.editForm.id,
                    userId: this.editForm.userId,
                    userName: this.editForm.userName,
                    remark: this.editForm.remark
                };
                // 此处使用 qs 序列化，后端不需要使用 @RequestBody 注解。
                var userData = Qs.stringify(user);
                var _this = this;
                axios.post('/user/edit', userData).then(function (response) {
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
        }
    })
</script>
</body>
</html>
```

* any list
{:toc}