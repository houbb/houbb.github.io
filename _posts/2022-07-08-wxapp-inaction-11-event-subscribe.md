---
layout: post
title:  微信公众号项目开发实战-10-java 实现处理微信公众号事件消息 订阅与取消订阅
date:  2022-07-08 09:22:02 +0800
categories: [Wechat]
tags: [wechat, sh]
published: true
---

# 场景说明

有时候我们希望用户在关注的时候，给用户提供一些推送信息。

取关的时候，删除对应的信息，避免不必要的失败推送。

那么，如何可以实现呢？

## 官方文档

[基础消息能力 /接收事件推送](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html)

[基础消息能力 /接收普通消息](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_standard_messages.html)

同时可以参考上一节，如何配置实现接收推送信息。

# 整体设计

## 接收消息表拆分问题

我们可以把表按照普通消息、事件消息，甚至可以细化到每一种类别，各创建一张表。

这里简单处理为一张宽表，主要关心用户的关注/取关。

表 SQL 如下:

```sql
CREATE TABLE `wx_receive_message_log` (
	`id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
	`to_user_name` varchar(64) NOT NULL DEFAULT '' COMMENT '开发者微信号',
	`from_user_name` varchar(64) NOT NULL DEFAULT '' COMMENT '发送方帐号 wx_open_id',
	`wx_create_time` bigint unsigned NOT NULL DEFAULT 0 COMMENT '消息创建时间 1675747313',
	`msg_type` varchar(32) NOT NULL DEFAULT '' COMMENT '消息类型 event:事件',
	`event` varchar(32) NOT NULL DEFAULT '' COMMENT '事件类型 subscribe:订阅;unsubscribe:取消订阅',
	`event_key` varchar(128) NOT NULL DEFAULT '' COMMENT '事件 key',
	`trace_id` varchar(32) NOT NULL DEFAULT '' COMMENT '日志跟踪号',
	`receive_date` varchar(8) NOT NULL DEFAULT '' COMMENT '接收日期',
	`create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	`update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP COMMENT '修改时间',
	PRIMARY KEY (`id`),
    KEY `ix_receive_date` (`receive_date`),
	UNIQUE KEY `uk_user_time` (from_user_name, wx_create_time)
) COMMENT='微信接收消息日志';
```

这里主要因为事件消息没有唯一标识，官方也是建议通过 `from_user_name, wx_create_time` 作为唯一事件标识。

不过如果怕用户同一秒钟，操作多种事件，可以把 `from_user_name+wx_create_time+event` 作为唯一索引，也可以把这里只当做事件信息，普通信息的接收拆分开。

## 关注信息

我们还需要创建一张关注信息表，用来保存当前有哪些用户关注了。

```sql
CREATE TABLE `wx_subscribe_info` (
	`id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
	`wx_open_id` varchar(64) NOT NULL DEFAULT '' COMMENT '微信标识',
	`wx_create_time` bigint unsigned NOT NULL DEFAULT 0 COMMENT '消息创建时间',
	`status` VARCHAR(1) NOT NULL DEFAULT 'Y' COMMENT '状态 Y:启用;N:禁用;',
	`create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	`update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP COMMENT '修改时间',
	PRIMARY KEY (`id`),
    KEY `ix_wx_create_time` (`wx_create_time`),
	UNIQUE KEY `uk_wx_open_id` (wx_open_id)
) COMMENT='微信关注信息';
```

这里冗余一个 `wx_create_time`，对应消息的时间，避免消息的先发后至，导致信息不是最新的问题。在程序处理的时候需要注意这一点。

# 代码实现

## 消息对象

事件消息对象，和表接口一一对应。

```java
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AnyWxEventReceiveBo implements Serializable {

    @JacksonXmlProperty(localName = "ToUserName")
    private String toUserName;

    @JacksonXmlProperty(localName = "FromUserName")
    private String fromUserName;

    @JacksonXmlProperty(localName = "CreateTime")
    private Long createTime;

    @JacksonXmlProperty(localName = "MsgType")
    private String msgType;

    @JacksonXmlProperty(localName = "Event")
    private String event;

    @JacksonXmlProperty(localName = "EventKey")
    private String eventKey;

}
```

## 处理接口

### 定义

```java
/**
 * 处理接口
 *
 * https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_standard_messages.html
 *
 * https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html
 *
 * 整体的抽象：包含普通消息+事件通知
 *
 * @author binbin.hou
 */
public interface IWxMessageHandleService {

    /**
     * 处理
     * @param xml 报文
     * @param receiveBo 接收信息
     */
    void handle(String xml, AnyWxEventReceiveBo receiveBo);

}
```

### 抽象实现

负责统一的业务逻辑处理，比如消息的入库。

定义 `doHandle` 便于子类实现具体的逻辑。

```java
@Slf4j
@Service
public abstract class AbstractWxMessageHandleService implements IWxMessageHandleService {

    @Autowired
    private WxReceiveMessageLogService wxReceiveMessageLogService;

    /**
     * 执行实际的处理策略
     * @param xml 报文
     * @param receiveBo 对象
     */
    protected abstract void doHandle(String xml, AnyWxEventReceiveBo receiveBo);

    @Override
    public void handle(String xml, AnyWxEventReceiveBo receiveBo) {
        // 入库
        WxReceiveMessageLog wxReceiveMessageLog = new WxReceiveMessageLog();
        BeanUtils.copyProperties(receiveBo, wxReceiveMessageLog);
        wxReceiveMessageLog.setReceiveDate(HfDateUtil.getTodayStr());
        wxReceiveMessageLog.setTraceId(LogUtil.getMdcId());

        wxReceiveMessageLogService.insert(wxReceiveMessageLog);

        // 执行子类实现
        this.doHandle(xml, receiveBo);
    }

}
```

### subscribe 关注事件

关注事件如下：

```java
/**
 * 事件-关注
 */
@Slf4j
@Service
@WxMessageHandleRoute(msgType = "event", event = "subscribe")
public class WxMessageHandleEventSubscribeService extends AbstractWxMessageHandleService {

    @Autowired
    private WxSubscribeInfoService wxSubscribeInfoService;

    @Override
    public void doHandle(String xml, AnyWxEventReceiveBo receiveBo) {
        //1. 查询，看是否存在
        String wxOpenId = receiveBo.getFromUserName();
        WxSubscribeInfo dbInfo = wxSubscribeInfoService.queryByWxOpenId(wxOpenId);

        //2.1 不存在，则插入
        if(dbInfo == null) {
            log.info("wxOpenId {} 对应的关注信息不存在，执行插入", wxOpenId);

            WxSubscribeInfo newInfo = new WxSubscribeInfo();
            newInfo.setStatus(BoolConst.Y);
            newInfo.setWxOpenId(wxOpenId);
            newInfo.setWxCreateTime(receiveBo.getCreateTime());
            wxSubscribeInfoService.insert(newInfo);
        } else {
            log.info("wxOpenId {} 对应的关注信息存在，执行更新", wxOpenId);

            WxSubscribeInfo updateInfo = new WxSubscribeInfo();
            updateInfo.setStatus(BoolConst.Y);
            updateInfo.setWxOpenId(wxOpenId);
            updateInfo.setWxCreateTime(receiveBo.getCreateTime());
            wxSubscribeInfoService.updateByWxOpenId(updateInfo, wxOpenId);
        }
    }

}
```

其中 WxSubscribeInfoService 查询和更新的实现如下：

```java
@Override
public WxSubscribeInfo queryByWxOpenId(String wxOpenId) {
    Wrapper<WxSubscribeInfo> wrapper = new EntityWrapper<>();
    wrapper.eq("wx_open_id", wxOpenId);
    return this.selectOne(wrapper);
}

@Override
public void updateByWxOpenId(WxSubscribeInfo update, String wxOpenId) {
    Wrapper<WxSubscribeInfo> wrapper = new EntityWrapper<>();
    wrapper.eq("wx_open_id", wxOpenId);
    // 时间必须小于
    wrapper.lt("wx_create_time", update.getWxCreateTime());
    this.update(update, wrapper);
}
```

注意：更新的时候，把 wx_create_time 的过滤条件加上，避免先发后至的问题。

PS: 次数使用的 mybatis-plus，不同版本略有差异，核心思路不变。

### unsubscribe 关注事件

取关事件如下：

```java
/**
 * 事件-取关
 */
@Slf4j
@Service
@WxMessageHandleRoute(msgType = "event", event = "unsubscribe")
public class WxMessageHandleEventUnsubscribeService extends AbstractWxMessageHandleService {

    @Autowired
    private WxSubscribeInfoService wxSubscribeInfoService;

    @Override
    public void doHandle(String xml, AnyWxEventReceiveBo receiveBo) {
        //1. 查询，看是否存在
        String wxOpenId = receiveBo.getFromUserName();
        WxSubscribeInfo dbInfo = wxSubscribeInfoService.queryByWxOpenId(wxOpenId);

        if(dbInfo == null) {
            log.info("wxOpenId {} 对应的关注信息不存在，忽略处理", wxOpenId);
        } else {
            log.info("wxOpenId {} 对应的关注信息存在，执行更新", wxOpenId);
            WxSubscribeInfo updateInfo = new WxSubscribeInfo();
            updateInfo.setStatus(BoolConst.N);
            updateInfo.setWxOpenId(wxOpenId);
            updateInfo.setWxCreateTime(receiveBo.getCreateTime());
            wxSubscribeInfoService.updateByWxOpenId(updateInfo, wxOpenId);
        }
    }

}
```

# 如何调用

## controller

我们回顾下 controller 的事件处理消息：

```java
    /**
     * 接受事件消息
     * @param req 请求
     * @param resp 响应
     * @throws IOException
     */
    @PostMapping(value = {"/message"})
    public void messageEvent(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.setCharacterEncoding(Constants.UTF_8);
        resp.setCharacterEncoding(Constants.UTF_8);
        try {
            String signature = req.getParameter("signature");
            String timestamp = req.getParameter("timestamp");
            String nonce = req.getParameter("nonce");

            log.info("【微信事件】 signature:{}, timestamp: {}, nonce: {}",
                    signature, timestamp, nonce);

            if (wxMpService.checkSignature(timestamp, nonce, signature)) {
                // 逻辑处理（放在签名通过之后处理）
                String fromXml = req.getReader()
                        .lines()
                        .collect(Collectors.joining(System.lineSeparator()));

                // 异步处理，避免微信发起重试。微信等待时间为 5s
                anyWxEventReceiveBiz.asyncHandle(LogUtil.getMdcId(), fromXml);
            } else {
                log.warn("【微信事件】 微信请求验签失败");
            }
        } catch (Exception e) {
            log.error("【微信事件】消息处理失败", e);
        }
    }
```

业务处理逻辑为：

```java
anyWxEventReceiveBiz.asyncHandle(LogUtil.getMdcId(), fromXml);
```

实现如下：

此处异步，是为了避免微信等待，重试。

当然，如果确保系统稳定且处理快速，不用异步也可。

```java
    /**
     * 异步处理
     *
     * 1. 尽量避免微信等待重试
     * @param mdcId 日志跟踪号
     * @param xml 日志
     */
    @Async
    public void asyncHandle(String mdcId, String xml) {
        try {
            LogUtil.putMdc(mdcId);
            log.info("开始异步处理 xml: {}", xml);

            XmlMapper xmlMapper = new XmlMapper();
            AnyWxEventReceiveBo wxEventReceiveBo = xmlMapper.readValue(xml, AnyWxEventReceiveBo.class);

            // 入库，数据量比较大，我们只处理关注、取关的事件
            wxMessageHandleContainer.dispatchHandle(xml, wxEventReceiveBo);

            log.info("完成异步处理");
        } catch (Exception e) {
            log.error("异常异步处理", e);
        }
    }
```

## 如何避免 if-else

我们有多种消息类型。

如果是用 if-else，则会导致代码不利于维护，且每次加消息都要和核心类代码，可能导致问题。

所以我们通过注解，动态映射。

### 路由注解

```java
/**
 * 微信消息处理路由
 * @author binbin.hou
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Inherited
public @interface WxMessageHandleRoute {

    /**
     * 消息类别
     *
     * event: 事件
     * 支持普通消息
     * @return 消息类别
     */
    String msgType();

    /**
     * 事件名称
     * @return 表
     */
    String event() default "";

}
```

这个消息在 subscribe/unsubscribe 类上都有，根据不同的消息类型+事件类型区分对应的策略。

### wxMessageHandleContainer

负责处理映射关系：

```java
/**
 * 处理容器
 *
 * @author binbin.hou
 */
@Component
@Slf4j
public class WxMessageHandleContainer {

    @Autowired
    private List<IWxMessageHandleService> wxMessageHandleServiceList;

    /**
     * 存储映射关系
     */
    private Map<String, IWxMessageHandleService> serviceMap = new HashMap<>();

    /**
     * 容器加载时初始化
     * 提升运行时获取的性能
     * @since zpos-95
     */
    @PostConstruct
    public void init() {
        for (IWxMessageHandleService service : wxMessageHandleServiceList) {
            WxMessageHandleRoute route = service.getClass().getAnnotation(WxMessageHandleRoute.class);
            if (route != null) {
                String msgType = route.msgType();
                String event = route.event();

                serviceMap.put(buildKey(msgType, event), service);
            }
        }
    }

    /**
     * 分发处理
     * @param wxEventReceiveBo 接收信息
     */
    public void dispatchHandle(String xml, AnyWxEventReceiveBo wxEventReceiveBo) {
        String msgType = wxEventReceiveBo.getMsgType();
        String event = wxEventReceiveBo.getEvent();

        String key = buildKey(msgType, event);
        IWxMessageHandleService handleService = serviceMap.get(key);
        if(handleService == null) {
            log.warn("针对 key {} 的处理实现不存在，忽略处理。", key);
            return;
        }

        // 处理
        handleService.handle(xml, wxEventReceiveBo);
    }

    private String buildKey(String msgType, String event) {
        return msgType + "_" + event;
    }

}
```

这样以后加新的类别，整体框架不需要改变，只需要处理验证新的消息类型即可。


# 小结

可以针对这些进行进行拓展分析。

对用户进行用户画像等处理，便于分门别类的推送定制化信息。

## 不足之处

上面的实现方式，只处理了一个大的消息类型。

其实可以根据不同的消息类型，设置不同的消息对象，然后分别处理。

这个可以按照自己业务复杂度，酌情处理。

# 参考资料

https://www.jianshu.com/p/4102a7649063?open_source

[微信公众号开发—关注/取消事件（基于thinkphp3.2.3）](https://blog.csdn.net/John_rush/article/details/80610025)

https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html

[Java 微信关注/取消关注事件](https://blog.csdn.net/qq_43548590/article/details/128022934)

* any list
{:toc}