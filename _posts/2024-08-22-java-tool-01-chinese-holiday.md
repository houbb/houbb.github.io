---
layout: post
title: java 如何判断一天是否为工作日？节假日？
date: 2024-08-22 21:01:55 +0800
categories: [Web]
tags: [web, front, js, sh]
published: true
---

# 目的

判断一天是否为节假日。

在区分不同的工作场景时，这个变量是比较有用的。

# 基础数据如何获取？

节假日查询

百度搜索节假日，国务院放假发文地址

https://www.gov.cn/zhengce/zhengceku/202310/content_6911528.htm

# 节假日数据获取

## 方式一：手动维护日期数据

### 1.初始化数据库表sql

```sql
drop database if exists kaoqin;
create database kaoqin;

use kaoqin;
CREATE TABLE `no_work_day` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `day` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### 2. 初始化数据

建议这种方式，可以更加灵活。

```sql
# 2022年非工作日 =[周末 + 节假日 -（被调成工作日的日期）]
INSERT INTO `no_work_day`(`id`, `day`) VALUES (1, '20240101');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (2, '20240106');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (3, '20240107');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (4, '20240113');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (5, '20240114');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (6, '20240120');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (7, '20240121');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (8, '20240127');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (9, '20240128');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (10, '20240203');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (11, '20240210');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (12, '20240211');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (13, '20240212');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (14, '20240213');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (15, '20240214');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (16, '20240215');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (17, '20240216');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (18, '20240217');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (19, '20240224');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (20, '20240225');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (21, '20240302');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (22, '20240303');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (23, '20240309');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (24, '20240310');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (25, '20240316');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (26, '20240317');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (27, '20240323');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (28, '20240324');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (29, '20240330');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (30, '20240331');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (31, '20240404');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (32, '20240405');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (33, '20240406');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (34, '20240413');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (35, '20240414');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (36, '20240420');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (37, '20240421');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (38, '20240427');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (39, '20240501');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (40, '20240502');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (41, '20240503');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (42, '20240504');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (43, '20240505');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (44, '20240512');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (45, '20240518');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (46, '20240519');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (47, '20240525');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (48, '20240526');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (49, '20240601');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (50, '20240602');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (51, '20240608');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (52, '20240609');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (53, '20240610');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (54, '20240615');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (55, '20240616');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (56, '20240622');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (57, '20240623');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (58, '20240629');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (59, '20240630');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (60, '20240706');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (61, '20240707');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (62, '20240713');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (63, '20240714');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (64, '20240720');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (65, '20240721');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (66, '20240727');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (67, '20240728');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (68, '20240803');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (69, '20240804');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (70, '20240810');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (71, '20240811');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (72, '20240817');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (73, '20240818');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (74, '20240824');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (75, '20240825');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (76, '20240831');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (77, '20240901');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (78, '20240907');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (79, '20240908');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (80, '20240915');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (81, '20240916');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (82, '20240917');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (83, '20240921');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (84, '20240922');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (85, '20240928');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (86, '20241001');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (87, '20241002');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (88, '20241003');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (89, '20241004');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (90, '20241005');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (91, '20241006');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (92, '20241007');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (93, '20241013');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (94, '20241019');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (95, '20241020');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (96, '20241026');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (97, '20241027');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (98, '20241102');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (99, '20241103');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (100, '20241109');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (101, '20241110');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (102, '20241116');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (103, '20241117');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (104, '20241123');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (105, '20241124');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (106, '20241130');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (107, '20241201');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (108, '20241207');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (109, '20241208');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (110, '20241214');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (111, '20241215');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (112, '20241221');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (113, '20241222');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (114, '20241228');
INSERT INTO `no_work_day`(`id`, `day`) VALUES (115, '20241229');
```


## 方式2：三方接口

调用api查询（2020年及之前的年份才能用此api）

首先查询百度万年历节接口（其中包含全年节假日数据），得到json数据 （全年节假日信息在json的holiday中，query=2020，其实默认就是202001，其他月份的万年历请求如query=202004）

请求的api：


https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?query=2020&resource_id=6018

如下：

```json
{"status":"0","t":"","set_cache_time":"","data":[{"ExtendedLocation":"","OriginQuery":"2020","SchemaVer":"","SiteId":2002753,"StdStg":6018,"StdStl":8,"_select_time":1580102077,"_update_time":"1580102250","_version":2767,"almanac":[{"avoid":"诸事不宜.","date":"2020-1-1","suit":"平治道涂.余事勿取."},{"avoid":"开市.嫁娶.","date":"2020-1-2","suit":"求嗣.斋醮.塑绘.订盟.纳采.出火.拆卸.修造.动土.造桥.安机械.栽种.纳畜.牧养.入殓.除服.成服.移柩.破土.安葬."},{"avoid":"开市.安葬.","date":"2020-1-3","suit":"嫁娶.订盟.纳采.祭祀.祈福.修造.动土.移徙.入宅."},{"avoid":"诸事不宜.","date":"2020-1-4","suit":"治病.破屋.坏垣.余事勿取."},{"avoid":"造桥.安门.理发.造庙.栽种.作灶.","date":"2020-1-5","suit":"祭祀.祈福.求嗣.斋醮.开光.入学.订盟.冠笄.伐木.修造.动土.起基.放水.交易.开池."},{"avoid":"祈福.嫁娶.安床.入宅.造船.","date":"2020-1-6","suit":"沐浴.开仓.出货财.开市.交易.立券.纳财.栽种.纳畜.牧养.畋猎.入殓.破土.安葬."},{"avoid":"造庙.入宅.修造.安葬.行丧.嫁娶.","date":"2020-1-7","suit":"祭祀.沐浴.补垣.塞穴.断蚁.解除.余事勿取."},{"avoid":"开市.安床.安葬.修坟.","date":"2020-1-8","suit":"嫁娶.纳采.订盟.问名.祭祀.冠笄.裁衣.会亲友.进人口.纳财.捕捉.作灶."},{"avoid":"造庙.嫁娶.出行.动土.安葬.行丧.","date":"2020-1-9","suit":"订盟.纳采.会亲友.祭祀.斋醮.沐浴.塑绘.出火.开光.竖柱.上梁.开市.交易.立券.作梁.开柱眼.伐木.架马.安门.安床.拆卸.牧养.造畜椆栖.掘井."},{"avoid":"开光.嫁娶.开市.动土.破土.","date":"2020-1-10","suit":"交易.立券.纳财.安床.裁衣.造畜椆栖.安葬.谢土.启攒.除服.成服.修坟.立碑.移柩.入殓."},{"avoid":"破土.动土.安葬.","date":"2020-1-11","suit":"祭祀.解除.教牛马.会亲友.余事勿取."},{"avoid":"探病.祭祀.出行.上梁.造屋.谢土.安葬.","date":"2020-1-12","suit":"纳采.订盟.移徙.纳财.开市.交易.立券.入宅.会亲友.解除.求医.治病.入学.安床.安门.安香.出火.拆卸.扫舍.入宅.挂匾.开生坟.合寿木.破土.修坟.启攒.入殓."},{"avoid":"入宅.开光.开市.动土.","date":"2020-1-13","suit":"嫁娶.订盟.纳采.祭祀.祈福.求嗣.会亲友.解除.出行.入学.纳财.开市.交易.立券.习艺.经络.安床.开仓.出货财.纳畜.安葬.启攒.修坟.入殓."},{"avoid":"移徙.入宅.造庙.作灶.治病.安葬.","date":"2020-1-14","suit":"祭祀.冠笄.嫁娶.会亲友.进人口.裁衣.结网.平治道涂."},{"avoid":"嫁娶.安葬.","date":"2020-1-15","suit":"祭祀.安碓硙.结网.余事勿取."},{"avoid":"造屋.开市.动土.破土.","date":"2020-1-16","suit":"嫁娶.祭祀.沐浴.裁衣.出行.理发.移徙.捕捉.畋猎.放水.入宅.除服.成服.启攒.安葬.移柩.入殓."},{"avoid":"嫁娶.开市.安葬.","date":"2020-1-17","suit":"破屋.坏垣.余事勿取."},{"avoid":"祈福.嫁娶.造庙.安床.谢土.","date":"2020-1-18","suit":"纳采.订盟.祭祀.求嗣.出火.塑绘.裁衣.会亲友.入学.拆卸.扫舍.造仓.挂匾.掘井.开池.结网.栽种.纳畜.破土.修坟.立碑.安葬.入殓."},{"avoid":"开市.伐木.嫁娶.作梁.","date":"2020-1-19","suit":"入殓.除服.成服.移柩.启攒.安葬.修坟.立碑."},{"avoid":"开市.安床.","date":"2020-1-20","suit":"祭祀.作灶.入殓.除服.余事勿取."},{"avoid":"嫁娶.入殓.安葬.出行.","date":"2020-1-21","suit":"塑绘.开光.沐浴.冠笄.会亲友.作灶.放水.造畜椆栖."},{"avoid":"开仓.嫁娶.移徙.入宅.","date":"2020-1-22","suit":"祭祀.沐浴.祈福.斋醮.订盟.纳采.裁衣.拆卸.起基.竖柱.上梁.安床.入殓.除服.成服.移柩.启攒.挂匾.求嗣.出行.合帐.造畜椆栖."},{"avoid":"诸事不宜.","date":"2020-1-23","suit":"祭祀.解除.余事勿取."},{"avoid":"作灶.祭祀.上梁.出行.","date":"2020-1-24","suit":"沐浴.解除.订盟.纳采.裁衣.冠笄.拆卸.修造.动土.移徙.入宅.除服.成服.移柩.破土.启攒.安葬.扫舍.修坟.伐木.纳财.交易.立券."},{"avoid":"作灶.掘井.谢土.入宅.","date":"2020-1-25","suit":"出行.嫁娶.订盟.纳采.入殓.安床.启攒.安葬.祭祀.裁衣.会亲友.进人口."},{"avoid":"嫁娶.移徙.入宅.开光.","date":"2020-1-26","suit":"修饰垣墙.平治道涂.入殓.移柩.余事勿取."},{"avoid":"出行.治病.安葬.开市.","date":"2020-1-27","suit":"会亲友.纳采.进人口.修造.动土.竖柱.上梁.祭祀.开光.塑绘.祈福.斋醮.嫁娶.安床.移徙.入宅.安香.纳畜."},{"avoid":"造屋.开市.作灶.入宅.","date":"2020-1-28","suit":"祭祀.会亲友.出行.订盟.纳采.沐浴.修造.动土.祈福.斋醮.嫁娶.拆卸.安床.入殓.移柩.安葬.谢土.赴任.裁衣.竖柱.上梁.伐木.捕捉.栽种.破土.安门."},{"avoid":"诸事不宜.","date":"2020-1-29","suit":"解除.破屋.坏垣.余事勿取."},{"avoid":"入宅.安床.","date":"2020-1-30","suit":"塑绘.开光.出行.订盟.纳采.除服.成服.嫁娶.纳婿.入殓.移柩.启攒.安葬.立碑."},{"avoid":"破土.伐木.","date":"2020-1-31","suit":"入殓.除服.成服.移柩.启攒.安葬.立碑.余事勿取."}],"appinfo":"","cambrian_appid":"0","clicklimit":"1-3","disp_type":0,"fetchkey":"6018_2020年1月1日","holiday":[{"desc":"1月1日放假一天","festival":"2020-1-1","list":[{"date":"2020-1-1","status":"1"}],"list#num#baidu":1,"name":"元旦","rest":"2019年12月30日和2019年12月31日请假两天，与周末连休可拼5天小长假。"},{"desc":"1月24日放假一天","festival":"2020-1-24","list":[{"date":"2020-1-24","status":"1"}],"list#num#baidu":1,"name":"除夕","rest":"农历腊月最后一天为除夕，即大年初一前夜，又称为年三十。"},{"desc":"1月24日(除夕)至1月30日放假7天，1月19日，2月1日上班","festival":"2020-1-25","list":[{"date":"2020-1-24","status":"1"},{"date":"2020-1-25","status":"1"},{"date":"2020-1-26","status":"1"},{"date":"2020-1-27","status":"1"},{"date":"2020-1-28","status":"1"},{"date":"2020-1-29","status":"1"},{"date":"2020-1-30","status":"1"},{"date":"2020-1-19","status":"2"},{"date":"2020-1-31","status":"1"},{"date":"2020-2-1","status":"1"},{"date":"2020-2-2","status":"1"}],"list#num#baidu":11,"name":"春节","rest":"2020年1月19日至2020年1月23日请假5天，与周末连休可拼13天长假。"},{"desc":"4月4日至4月6日放假3天","festival":"2020-4-4","list":[{"date":"2020-4-4","status":"1"},{"date":"2020-4-5","status":"1"},{"date":"2020-4-6","status":"1"}],"list#num#baidu":3,"name":"清明节","rest":"2020年4月7日至2020年4月10日请假4天，与周末连休可拼9天长假。"},{"desc":"5月1日至5月5日放假5天，4月26日，5月9日上班","festival":"2020-5-1","list":[{"date":"2020-5-1","status":"1"},{"date":"2020-5-2","status":"1"},{"date":"2020-5-3","status":"1"},{"date":"2020-5-4","status":"1"},{"date":"2020-5-5","status":"1"},{"date":"2020-4-26","status":"2"},{"date":"2020-5-9","status":"2"}],"list#num#baidu":7,"name":"劳动节","rest":"2020年4月26日至2020年4月30日请假5天，与周末连休可拼11天长假。"},{"desc":"6月25日至6月27日放假3天，6月28日上班","festival":"2020-6-25","list":[{"date":"2020-6-25","status":"1"},{"date":"2020-6-26","status":"1"},{"date":"2020-6-27","status":"1"},{"date":"2020-6-28","status":"2"}],"list#num#baidu":4,"name":"端午节","rest":"2020年6月22日至2020年6月24日请假3天，与周末连休可拼8天长假。"},{"desc":"10月1日至10月8日放假8天，9月27日，10月10日上班","festival":"2020-10-1","list":[{"date":"2020-10-1","status":"1"},{"date":"2020-10-2","status":"1"},{"date":"2020-10-3","status":"1"},{"date":"2020-10-4","status":"1"},{"date":"2020-10-5","status":"1"},{"date":"2020-10-6","status":"1"},{"date":"2020-10-7","status":"1"},{"date":"2020-10-8","status":"1"},{"date":"2020-9-27","status":"2"},{"date":"2020-10-10","status":"2"}],"list#num#baidu":10,"name":"中秋节","rest":"10月9日至10月10日请假2天，与周末连休可拼11天长假。"},{"desc":"10月1日至10月8日放假8天，9月27日，10月10日上班","festival":"2020-10-1","list":[{"date":"2020-10-1","status":"1"},{"date":"2020-10-2","status":"1"},{"date":"2020-10-3","status":"1"},{"date":"2020-10-4","status":"1"},{"date":"2020-10-5","status":"1"},{"date":"2020-10-6","status":"1"},{"date":"2020-10-7","status":"1"},{"date":"2020-10-8","status":"1"},{"date":"2020-9-27","status":"2"},{"date":"2020-10-10","status":"2"}],"list#num#baidu":10,"name":"国庆节","rest":"10月9日至10月10日请假2天，与周末连休可拼11天长假。"}],"holidaylist":[{"name":"元旦","startday":"2020-1-1"},{"name":"除夕","startday":"2020-1-24"},{"name":"春节","startday":"2020-1-25"},{"name":"清明节","startday":"2020-4-4"},{"name":"劳动节","startday":"2020-5-1"},{"name":"端午节","startday":"2020-6-25"},{"name":"中秋节","startday":"2020-10-1"},{"name":"国庆节","startday":"2020-10-1"}],"key":"2020年1月1日","loc":"http://open.baidu.com/q?r=2002753\u0026k=2020%E5%B9%B41%E6%9C%881%E6%97%A5","resourceid":"6018","role_id":7,"schemaID":"","selectday":"2020-1-1","strategyData":{},"tplt":"calendar_new","url":"http://nourl.baidu.com/6018"}]}
```


# 参考资料

https://blog.csdn.net/u011456337/article/details/86180383

github项目地址：https://github.com/lufei222/san-holiday.git

* any list
{:toc}