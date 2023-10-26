---
layout: post
title:  Neo4j-05-图数据库 neo4j 实战
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---


# 整体效果概览

<svg xmlns="http://www.w3.org/2000/svg" width="582.6238403320312" height="458.9697265625" viewBox="-352.3860168457031 -168.00413513183594 582.6238403320312 458.9697265625"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(-214.60100212749512 22.999295011738845) rotate(331.5700337561679)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 24.018736134675446,-6.953439040707552 L 24.277555179777966,-5.987513214418485 A 276.4220603891435 276.4220603891435 0 0 1 58.98899563500566,-12.941547418487573 L 58.85575065011513,-13.932630550218505 A 277.4220603891435 277.4220603891435 0 0 0 24.018736134675446,-6.953439040707552 Z M 127.81049081179307,-14.555825702993445 L 127.69518043643232,-13.562496192038452 A 276.4220603891435 276.4220603891435 0 0 1 162.52663810773504,-7.236972760698791 L 161.80268225791403,-4.3256349363455415 L 169.44041900619612,-6.0329654151752585 L 163.49191257416308,-11.118756526503123 L 162.76795672434207,-8.207418702149873 A 277.4220603891435 277.4220603891435 0 0 0 127.81049081179307,-14.555825702993445"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="93.3182009600027" y="-12.89505760537321" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">METHOD_CALLS</text></g><g class="relationship" transform="translate(-214.60100212749512 22.999295011738845) rotate(400.8152072441104)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 24.018736134675446,6.953439040707552 L 24.277555179777966,5.987513214418485 A 257.32414626658584 257.32414626658584 0 0 0 54.120381758081,12.11676628447978 L 53.977536386694226,13.106511302084527 A 258.32414626658584 258.32414626658584 0 0 1 24.018736134675446,6.953439040707552 Z M 122.91374351037686,13.761480962934115 L 122.78972955746129,12.769200488732224 A 257.32414626658584 257.32414626658584 0 0 0 152.74362750219234,7.208081959500826 L 152.0223697026256,4.296074544234829 L 159.65852110440744,6.010481663056117 L 153.7053045682813,11.090758513188822 L 152.98404676871456,8.178751097922826 A 258.32414626658584 258.32414626658584 0 0 1 122.91374351037686,13.761480962934115"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="88.42844307014431" y="18.243984657963153" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">METHOD_CALLS</text></g><g class="relationship" transform="translate(-44.25990241281155 -69.21896248862568) rotate(414.3568819917084)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 50.53120067998485 0.5 L 50.53120067998485 -0.5 L 25 -0.5 Z M 119.54291942998485 0.5 L 145.0741201099697 0.5 L 145.0741201099697 3.5 L 152.0741201099697 0 L 145.0741201099697 -3.5 L 145.0741201099697 -0.5 L 119.54291942998485 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="85.03706005498485" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">METHOD_CALLS</text></g><g class="relationship" transform="translate(-75.40240039895212 143.21679250836104) rotate(332.9695837844305)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 37.395438431090284 0.5 L 37.395438431090284 -0.5 L 25 -0.5 Z M 106.40715718109028 0.5 L 118.80259561218057 0.5 L 118.80259561218057 3.5 L 125.80259561218057 0 L 118.80259561218057 -3.5 L 118.80259561218057 -0.5 L 106.40715718109028 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="71.90129780609028" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">METHOD_CALLS</text></g><g class="relationship" transform="translate(58.927332772375834 74.68252641109628) rotate(356.6437912644876)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 33.271642522914064 0.5 L 33.271642522914064 -0.5 L 25 -0.5 Z M 102.28336127291406 0.5 L 110.55500379582813 0.5 L 110.55500379582813 3.5 L 117.55500379582813 0 L 110.55500379582813 -3.5 L 110.55500379582813 -0.5 L 102.28336127291406 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="67.77750189791406" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">METHOD_CALLS</text></g><g class="relationship" transform="translate(-214.60100212749512 22.999295011738845) rotate(331.5700337561679)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 24.018736134675446,6.953439040707552 L 24.277555179777966,5.987513214418485 A 276.4220603891435 276.4220603891435 0 0 0 58.98899563500578,12.94154741848763 L 58.85575065011525,13.932630550218505 A 277.4220603891435 277.4220603891435 0 0 1 24.018736134675446,6.953439040707552 Z M 127.81049081179322,14.555825702993445 L 127.69518043643247,13.562496192038395 A 276.4220603891435 276.4220603891435 0 0 0 162.52663810773504,7.236972760698791 L 161.80268225791403,4.3256349363455415 L 169.44041900619612,6.0329654151752585 L 163.49191257416308,11.118756526503123 L 162.76795672434207,8.207418702149873 A 277.4220603891435 277.4220603891435 0 0 1 127.81049081179322,14.555825702993445"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="93.31820096000283" y="18.89505760537321" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">METHOD_CALLS</text></g><g class="relationship" transform="translate(-214.60100212749512 22.999295011738845) rotate(400.8152072441104)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 24.018736134675446,-6.953439040707552 L 24.277555179777966,-5.987513214418485 A 257.32414626658584 257.32414626658584 0 0 1 54.120381758081,-12.11676628447978 L 53.977536386694226,-13.106511302084527 A 258.32414626658584 258.32414626658584 0 0 0 24.018736134675446,-6.953439040707552 Z M 122.91374351037683,-13.761480962934115 L 122.78972955746127,-12.769200488732224 A 257.32414626658584 257.32414626658584 0 0 1 152.74362750219234,-7.208081959500826 L 152.0223697026256,-4.296074544234829 L 159.65852110440744,-6.010481663056117 L 153.7053045682813,-11.090758513188822 L 152.98404676871456,-8.178751097922826 A 258.32414626658584 258.32414626658584 0 0 0 122.91374351037683,-13.761480962934115"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="88.42844307014431" y="-12.243984657963153" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">METHOD_CALLS</text></g><g class="relationship" transform="translate(-44.25990241281155 -69.21896248862568) rotate(309.7616303487387)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 25.957378508696458 0.5 L 25.957378508696458 -0.5 L 25 -0.5 Z M 57.82456600869646 0.5 L 58.781944517392915 0.5 L 58.781944517392915 3.5 L 65.78194451739292 0 L 58.781944517392915 -3.5 L 58.781944517392915 -0.5 L 57.82456600869646 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="41.89097225869646" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELO…</text></g><g class="relationship" transform="translate(201.23783539482255 66.33687181872585) rotate(245.66423047635988)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 35.52971430393697 0.5 L 35.52971430393697 -0.5 L 25 -0.5 Z M 92.73283930393697 0.5 L 103.26255360787394 0.5 L 103.26255360787394 3.5 L 110.26255360787394 0 L 103.26255360787394 -3.5 L 103.26255360787394 -0.5 L 92.73283930393697 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="64.13127680393697" y="3" transform="rotate(180 64.13127680393697 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONG_APP</text></g><g class="relationship" transform="translate(58.927332772375834 74.68252641109628) rotate(303.34038910497515)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 46.65498750344621 0.5 L 46.65498750344621 -0.5 L 25 -0.5 Z M 103.85811250344621 0.5 L 125.51310000689242 0.5 L 125.51310000689242 3.5 L 132.51310000689242 0 L 125.51310000689242 -3.5 L 125.51310000689242 -0.5 L 103.85811250344621 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="75.25655000344621" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONG_APP</text></g><g class="relationship" transform="translate(-75.40240039895212 143.21679250836104) rotate(416.3475714257177)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 39.22637388198214 0.5 L 39.22637388198214 -0.5 L 25 -0.5 Z M 96.42949888198214 0.5 L 110.65587276396428 0.5 L 110.65587276396428 3.5 L 117.65587276396428 0 L 110.65587276396428 -3.5 L 110.65587276396428 -0.5 L 96.42949888198214 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="67.82793638198214" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONG_APP</text></g><g class="relationship" transform="translate(-214.60100212749512 22.999295011738845) rotate(203.03803217665495)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 27.004971708912223 0.5 L 27.004971708912223 -0.5 L 25 -0.5 Z M 84.20809670891222 0.5 L 86.21306841782445 0.5 L 86.21306841782445 3.5 L 93.21306841782445 0 L 86.21306841782445 -3.5 L 86.21306841782445 -0.5 L 84.20809670891222 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="55.60653420891222" y="3" transform="rotate(180 55.60653420891222 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">BELONG_APP</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node0" transform="translate(-75.40240039895212,143.21679250836104)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#ECB5C9" stroke="#da7298" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appC,m…</text></g><g class="node" aria-label="graph-node2" transform="translate(58.927332772375834,74.68252641109628)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#ECB5C9" stroke="#da7298" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appD,m…</text></g><g class="node" aria-label="graph-node4" transform="translate(201.23783539482255,66.33687181872585)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#ECB5C9" stroke="#da7298" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appD,m…</text></g><g class="node" aria-label="graph-node14" transform="translate(-214.60100212749512,22.999295011738845)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#ECB5C9" stroke="#da7298" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appA,m…</text></g><g class="node" aria-label="graph-node16" transform="translate(-44.25990241281155,-69.21896248862568)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#ECB5C9" stroke="#da7298" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appB,m…</text></g><g class="node" aria-label="graph-node17" transform="translate(13.80378032735564,-139.00413424458122)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#4C8EDA" stroke="#2870c2" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appB</text></g><g class="node" aria-label="graph-node3" transform="translate(145.49840083982048,-56.9070888609424)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#4C8EDA" stroke="#2870c2" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appD</text></g><g class="node" aria-label="graph-node1" transform="translate(3.650848373782937,261.965610997323)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#4C8EDA" stroke="#2870c2" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appC</text></g><g class="node" aria-label="graph-node15" transform="translate(-323.3860213840759,-23.262450849205408)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#4C8EDA" stroke="#2870c2" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appA</text></g></g></svg>


# 核心实体定义

## ChainMethod-接口方法

```java
@NodeEntity(label = "ChainMethod")
@Data
public class Neo4jChainMethodEntity implements Serializable {

    /**
     * appName + methodName
     *
     * 测试下来有一个非常神奇的问题：如果一个属性以 xxxId 结尾，似乎会导致节点显示为空。
     */
    @Id
    private String methodFullName;

    @Property
    private String methodName;

    /**
     * @see com.github.houbb.method.chain.neo4j.constant.MethodTypeEnum
     */
    @Property
    private String methodType;

    @Property
    private String appName;

    @Relationship(type = RelationshipTypeConst.BELONG_APP, direction = Relationship.OUTGOING)
    private Neo4jChainAppEntity chainApp;

    public Neo4jChainMethodEntity(String methodName, String methodType, String appName) {
        this.methodName = methodName;
        this.methodType = methodType;
        this.appName = appName;

        this.methodFullName = InnerAppMethodUtil.buildFullName(appName, methodName);
        this.chainApp = new Neo4jChainAppEntity(appName);
    }
}
```

## ChainApp-应用

```java
@NodeEntity(label = "ChainApp")
@Data
public class Neo4jChainAppEntity implements Serializable {

    @Id
    private String appName;

    public Neo4jChainAppEntity(String appName) {
        this.appName = appName;
    }

}
```

## 关系

```java
/**
 * method 方法名称
 */
@RelationshipEntity(type = RelationshipTypeConst.METHOD_CALLS)
@Data
public class Neo4jChainMethodRelationshipEntity implements Serializable {

    /**
     * 当前调用关系的唯一标识
     *
     * 如何保证唯一呢？
     *
     * md5(tid+startMethod+endMethod)?
     */
    @Id
    private String methodRelationId;

    /**
     * 链路唯一标识 traceId
     */
    @Index
    @Property
    private String tid;

    /**
     * 链路哈希
     */
    @Property
    @Index
    private String chainHash;

    /**
     * 开始节点
     */
    @StartNode
    private Neo4jChainMethodEntity startMethod;

    /**
     * 结束节点
     */
    @EndNode
    private Neo4jChainMethodEntity endMethod;

    public Neo4jChainMethodRelationshipEntity(String tid, Neo4jChainMethodEntity startMethod, Neo4jChainMethodEntity endMethod) {
        this.tid = tid;

        this.startMethod = startMethod;
        this.endMethod = endMethod;
    }

}
```

# 链路初始化

## 初始化

```java
    /**
     * 数据初始化
     *
     * methodA1 -WEB
     * methodB1 -DUBBO
     * methodC1 -DUBBO
     * methodD1 -DUBBO
     */
    @Test
    public void initMethodRelationshipTest() {
        Neo4jChainMethodEntity methodA1 = new Neo4jChainMethodEntity("methodA1", MethodTypeEnum.WEB.getCode(),
                "appA");
        Neo4jChainMethodEntity methodB1 = new Neo4jChainMethodEntity("methodB1", MethodTypeEnum.DUBBO.getCode(),
                "appB");
        Neo4jChainMethodEntity methodC1 = new Neo4jChainMethodEntity("methodC1", MethodTypeEnum.DUBBO.getCode(),
                "appC");
        Neo4jChainMethodEntity methodD1 = new Neo4jChainMethodEntity("methodD1", MethodTypeEnum.DUBBO.getCode(),
                "appD");
        Neo4jChainMethodEntity methodD2 = new Neo4jChainMethodEntity("methodD2", MethodTypeEnum.SERVICE.getCode(),
                "appD");

        // 保存方法信息
        chainMethodRepository.save(methodA1);
        chainMethodRepository.save(methodB1);
        chainMethodRepository.save(methodC1);
        chainMethodRepository.save(methodD1);
        chainMethodRepository.save(methodD2);


        // 第一个调用链路
        final String tidFirst = "T0001";
        //A=>B
        Neo4jChainMethodRelationshipEntity relationshipFirstA = new Neo4jChainMethodRelationshipEntity(tidFirst, methodA1, methodB1);
        //A=>C
        Neo4jChainMethodRelationshipEntity relationshipFirstB = new Neo4jChainMethodRelationshipEntity(tidFirst, methodA1, methodC1);
        //B=>D
        Neo4jChainMethodRelationshipEntity relationshipFirstC = new Neo4jChainMethodRelationshipEntity(tidFirst, methodB1, methodD1);
        List<Neo4jChainMethodRelationshipEntity> chainListFirst = Arrays.asList(relationshipFirstA, relationshipFirstB, relationshipFirstC);
        chainMethodRelationshipService.batchAdd(chainListFirst);

        // 第二个调用链路
        final String tidSecond = "T0002";
        //A=>B
        Neo4jChainMethodRelationshipEntity relationshipSecondA = new Neo4jChainMethodRelationshipEntity(tidSecond, methodA1, methodB1);
        //A=>C
        Neo4jChainMethodRelationshipEntity relationshipSecondB = new Neo4jChainMethodRelationshipEntity(tidSecond, methodA1, methodC1);
        //C=>D
        Neo4jChainMethodRelationshipEntity relationshipSecondC = new Neo4jChainMethodRelationshipEntity(tidSecond, methodC1, methodD1);
        //D1=>D2
        Neo4jChainMethodRelationshipEntity relationshipSecondD = new Neo4jChainMethodRelationshipEntity(tidSecond, methodD1, methodD2);

        List<Neo4jChainMethodRelationshipEntity> chainListSecond = Arrays.asList(relationshipSecondA, relationshipSecondB, relationshipSecondC, relationshipSecondD);
        chainMethodRelationshipService.batchAdd(chainListSecond);
    }
```

## 对应的链路效果

<svg xmlns="http://www.w3.org/2000/svg" width="598.778564453125" height="312.4842529296875" viewBox="-347.1266174316406 -129.5645294189453 598.778564453125 312.4842529296875"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(143.2929340775839 -5.234279776257532) rotate(464.0842561034118)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 48.83432632211567 0.5 L 48.83432632211567 -0.5 L 25 -0.5 Z M 108.25229507211567 0.5 L 132.08662139423134 0.5 L 132.08662139423134 3.5 L 139.08662139423134 0 L 132.08662139423134 -3.5 L 132.08662139423134 -0.5 L 108.25229507211567 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="78.54331069711567" y="3" transform="rotate(180 78.54331069711567 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">CHAIN_CALLS</text></g><g class="relationship" transform="translate(103.36270115169287 153.91972054751034) rotate(359.15670079804113)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 26.442089883050024 0.5 L 26.442089883050024 -0.5 L 25 -0.5 Z M 85.86005863305002 0.5 L 87.30214851610005 0.5 L 87.30214851610005 3.5 L 94.30214851610005 0 L 87.30214851610005 -3.5 L 87.30214851610005 -0.5 L 85.86005863305002 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="56.15107425805002" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">CHAIN_CALLS</text></g><g class="relationship" transform="translate(16.371918963721726 -91.1031656806292) rotate(453.41411043382243)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 36.520250052426064 0.5 L 36.520250052426064 -0.5 L 25 -0.5 Z M 95.93821880242606 0.5 L 107.45846885485213 0.5 L 107.45846885485213 3.5 L 114.45846885485213 0 L 107.45846885485213 -3.5 L 107.45846885485213 -0.5 L 95.93821880242606 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="66.22923442742606" y="3" transform="rotate(180 66.22923442742606 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">CHAIN_CALLS</text></g><g class="relationship" transform="translate(16.371918963721726 -91.1031656806292) rotate(394.0804631989497)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 43.410872130985496 0.5 L 43.410872130985496 -0.5 L 25 -0.5 Z M 102.8288408809855 0.5 L 121.23971301197099 0.5 L 121.23971301197099 3.5 L 128.239713011971 0 L 121.23971301197099 -3.5 L 121.23971301197099 -0.5 L 102.8288408809855 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="73.1198565059855" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">CHAIN_CALLS</text></g><g class="relationship" transform="translate(-264.82044071865926 -100.56453212087908) rotate(472.2000156771199)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 37.331482506297164 0.5 L 37.331482506297164 -0.5 L 25 -0.5 Z M 96.74945125629716 0.5 L 109.08093376259433 0.5 L 109.08093376259433 3.5 L 116.08093376259433 0 L 109.08093376259433 -3.5 L 109.08093376259433 -0.5 L 96.74945125629716 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="67.04046688129716" y="3" transform="rotate(180 67.04046688129716 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">CHAIN_CALLS</text></g><g class="relationship" transform="translate(-154.4112958793198 -2.2870201367025573) rotate(450.39106273435243)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 41.686082201471876 0.5 L 41.686082201471876 -0.5 L 25 -0.5 Z M 101.10405095147188 0.5 L 117.79013315294375 0.5 L 117.79013315294375 3.5 L 124.79013315294375 0 L 117.79013315294375 -3.5 L 117.79013315294375 -0.5 L 101.10405095147188 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="71.39506657647188" y="3" transform="rotate(180 71.39506657647188 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">CHAIN_CALLS</text></g><g class="relationship" transform="translate(-264.82044071865926 -100.56453212087908) rotate(401.6729548444489)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 40.69745753968394 0.5 L 40.69745753968394 -0.5 L 25 -0.5 Z M 100.11542628968394 0.5 L 115.81288382936788 0.5 L 115.81288382936788 3.5 L 122.81288382936788 0 L 115.81288382936788 -3.5 L 115.81288382936788 -0.5 L 100.11542628968394 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="70.40644191468394" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">CHAIN_CALLS</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node6" transform="translate(16.371918963721726,-91.1031656806292)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#DA7194" stroke="#cc3c6c" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appA,m…</text></g><g class="node" aria-label="graph-node7" transform="translate(143.2929340775839,-5.234279776257532)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#DA7194" stroke="#cc3c6c" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appC,m…</text></g><g class="node" aria-label="graph-node8" transform="translate(8.066858686344382,48.107791176684614)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#DA7194" stroke="#cc3c6c" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appB,m…</text></g><g class="node" aria-label="graph-node9" transform="translate(222.6519277033087,152.16385344693924)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#DA7194" stroke="#cc3c6c" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appD,m…</text></g><g class="node" aria-label="graph-node10" transform="translate(103.36270115169287,153.91972054751034)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#DA7194" stroke="#cc3c6c" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appD,m…</text></g><g class="node" aria-label="graph-node12" transform="translate(-155.43365537495583,147.49962403105462)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#DA7194" stroke="#cc3c6c" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appD,m…</text></g><g class="node" aria-label="graph-node13" transform="translate(-264.82044071865926,-100.56453212087908)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#DA7194" stroke="#cc3c6c" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appA,m…</text></g><g class="node" aria-label="graph-node18" transform="translate(-318.12660747723453,30.05813994194658)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#DA7194" stroke="#cc3c6c" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appC,m…</text></g><g class="node" aria-label="graph-node19" transform="translate(-154.4112958793198,-2.2870201367025573)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#DA7194" stroke="#cc3c6c" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#FFFFFF" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> appB,m…</text></g></g></svg>

# 清空

```sql
MATCH (n)  
DETACH DELETE n;
```

## 查询

作为入口：

```sql
match p=(startM)-[r:METHOD_CALLS]->(endM) 
where (r.endMethodFullName='appD,methodD1') 
return startM, r, endM
```

作为出口：

```sql
match p=(startM)-[r:METHOD_CALLS]->(endM) 
where (r.startMethodFullName='appD,methodD1') 
return startM, r, endM
```

必须要有方向性。


------------------ 

```sql
match p=(startM)-[r:METHOD_CALLS]->(endM) 
where (r.startMethodFullName='appD,methodD1') 
return r
```

## 过滤

```sql
MATCH p=(startM)-[r:METHOD_CALLS]->(endM) 
where r.tid='T0001'
RETURN startM, r, endM 
LIMIT 1000
```

## 根据节点直接查询

neo4j 如何查询一个节点关联的所有边信息

```sql
MATCH (n)-[r]-(m)
WHERE n.methodFullName = 'appB,methodB1'
RETURN r
```

### neo4j 如何查询一个节点所有 income 进入边的信息,且 这个边的类别是 METHOD_CALLS

要查询一个节点所有入边的信息，且这些边的类别是`METHOD_CALLS`，你可以使用Cypher查询语言。以下是如何查询一个节点所有`METHOD_CALLS`类别的入边的示例：

假设你有一个节点，它的ID为`node_id`，你想查询所有指向这个节点的`METHOD_CALLS`类别的入边。你可以使用以下Cypher查询：

```cypher
MATCH (n)<-[r:METHOD_CALLS]-(m)
WHERE n.methodFullName = 'appB,methodB1'
RETURN r
```

这个查询做了以下几件事情：

1. `MATCH (n)<-[r:METHOD_CALLS]-(m)`：这一部分会匹配所有节点`n`和节点`m`之间的`METHOD_CALLS`类别的入边`r`。`n`是指定节点，`m`是指向节点，`r`是边的变量名。

2. `WHERE ID(n) = node_id`：这一部分用于筛选出与特定节点ID匹配的`n`。替换`node_id`为你要查询的节点的实际ID。

3. `RETURN r`：最后，这一部分会返回与选定节点相关的所有`METHOD_CALLS`类别的入边`r`。

通过运行这个Cypher查询，你将得到与指定节点相关的所有`METHOD_CALLS`类别的入边信息。


### 查询作为出的边

```sql
MATCH (n)-[r:METHOD_CALLS]->(m)
WHERE n.methodFullName = 'appB,methodB1'
RETURN n,r,m 
LIMIT 1000
```

# 小结

基本的关系创建实例。

# 参考资料


* any list
{:toc}

