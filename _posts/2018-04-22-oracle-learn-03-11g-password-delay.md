---
layout: post
title:  Oracle Learn-03-oracle 数据库踩坑之 11g 延迟密码验证
date:  2018-04-22 19:00:57 +0800
categories: [SQL]
tags: [sql, oracle, learn]
published: true
---

# 现象

oracle 其他应用初始化，oracle 密码多次错误，导致以前正确的应用无法正确连接。


# 原因

新特性在提供方便，安全的同时，也会带来相应的bug.

11G引入了延迟密码验证，在输入错误的密码后，后续如果还是采用错误的密码登陆，将会导致密码延迟验证，

而且会导致失败登陆延长。

# 避免

尽量避免错误密码的尝试，减少错误次数。

## 难点

找到错误的账户密码的应用。

避免恶意攻击，如果是，能否拉黑对应的 IP？

如果是内部应用错误启动，那么能否找到这个报错，通知对应的用户？或者自动终止？？

# 他山之石

## 系统

```
系统：LINUX
数据库版本：
--------------------------------------------------------------------------------
Oracle Database 11g Enterprise Edition Release 11.2.0.3.0 - 64 bit Production
PL/SQL Release 11.2.0.3.0 - Production
CORE 11.2.0.3.0 Production
TNS for Linux: Version 11.2.0.3.0 - Production
NLSRTL Version 11.2.0.3.0 - Production
```

## 故障描述：

领导需求要修改在线生成数据库用户fonewapuser的密码，修改密码完成后过了不一会程序员就反应用户fonewapuser连接不上，使用fonewapuser用户登陆数据显示一直等待状态。

问题现象后，在数据库中使用如下语句查询等待事件出现大量的library cache lock。

```sql
select * from gv$session_wait where event like 'library cache lock';
```

在v$session视图中查询library cache lock等待相关的会话信息，发现username为空而且不是oracle后台进行。

这就是说这些会话还没有连接到数据库，一直在等待验证状态。

```sql
select * from gv$session_wait where event like 'library cache lock';
```

因为以前也遇到过'library cache lock'等待事件的问题直接使用下面的语句查占用'library cache lock'的会话，但是返回的确实没有结果这可就神奇了。

难道没人阻塞它自己就产生library cache 锁了吗？诡异啊

```sql
SELECT SID,USERNAME,STATUS,SCHEMANAME,PROCESS,MACHINE,SQL_ID,TERMINAL,PROGRAM FROM V$SESSION
WHERE SADDR in  
  (SELECT KGLLKSES FROM X$KGLLK LOCK_A  
   WHERE KGLLKREQ = 0
     AND EXISTS (SELECT LOCK_B.KGLLKHDL FROM X$KGLLK LOCK_B
                 WHERE KGLLKSES = 'saddr_from_v$session' /* BLOCKED SESSION */
                 AND LOCK_A.KGLLKHDL = LOCK_B.KGLLKHDL
                 AND KGLLKREQ > 0)
  );
```


现在问题就hang这里了，library cache lock等待的会话不断的增加，而又找不到那个会话阻塞了它。最后数据库连接满了，没有办法把数据库重启了。

数据库起来以后，检查library cache lock等待事件没有输出数据库显示正常。

不过等待1个小时之后library cache lock又大量的出现，不过一会又消失了，有点诡异。

## 问题原因

在网上看到yangtingkun的一篇关于oracle 11g 密码延长验证的文章感觉和上面的问题很像，于是写了个记录登录失败的触发器，过了不一会就在alert中发现大量的连接失败记录，找到负责192.168.0.234这个台机器的程序员让他查程序连接用户和密码是否正确。

结果发现密码不对，而且这个程序是每隔一段时间就向数据库发送连接请求，把密码修改正确后library cache lock就没有在出现过。

哎，oracle 11g 密码延长验证真是害死人啊！！！11g的新特性确实很好，很强的，但是你要是不熟悉、不了解它，它很容易害死你。

从出事开始经理占我后面足足监视了4小时快压死我了。4个多小时在线生成库无法使用钱哗哗的没，我被经理骂，经理上面领导骂。

最后问下，有没有倒霉的童鞋遇到过这样的情况，嘿嘿！

记录用户登录失败触发器：

```sql
CREATE OR REPLACE TRIGGER logon_denied_to_alert
  AFTER servererror ON DATABASE
DECLARE
  message   VARCHAR2(168);
  ip        VARCHAR2(15);
  v_os_user VARCHAR2(80);
  v_module  VARCHAR2(50);
  v_action  VARCHAR2(50);
  v_pid     VARCHAR2(10);
  v_sid     NUMBER;
  v_program VARCHAR2(48);
BEGIN
  IF (ora_is_servererror(1017)) THEN

    -- get ip FOR remote connections :
    IF upper(sys_context('userenv', 'network_protocol')) = 'TCP' THEN
      ip := sys_context('userenv', 'ip_address');
    END IF;

    SELECT sid INTO v_sid FROM sys.v_$mystat WHERE rownum < 2;
    SELECT p.spid, v.program
      INTO v_pid, v_program
      FROM v$process p, v$session v
     WHERE p.addr = v.paddr
       AND v.sid = v_sid;

    v_os_user := sys_context('userenv', 'os_user');
    dbms_application_info.read_module(v_module, v_action);

    message := to_char(SYSDATE, 'YYYYMMDD HH24MISS') ||
               ' logon denied from ' || nvl(ip, 'localhost') || ' ' ||
               v_pid || ' ' || v_os_user || ' with ' || v_program || ' – ' ||
               v_module || ' ' || v_action;

    sys.dbms_system.ksdwrt(2, message);

  END IF;
END;
/
```

如有登录失败则在alert中记录如下信息：

```
Thu Apr 26 20:16:45 2012
20120426 201645 logon denied from 192.168.0.234 29458 root with JDBC Thin Client ? JDBC Thin Client
```

# 参考资料

https://blog.csdn.net/cqhiabc50405/article/details/100427241


* any list
{:toc}









 





