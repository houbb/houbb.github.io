---
layout: post
title: 性能测试框架-Performance
date:  2019-9-26 22:35:36 +0800
categories: [Tool]
tags: [tool, performance, sh]
published: true
---

# 性能测试需求

我们经常需要对代码的性能进行压测，如果全部自己写一个工具，还是很消耗时间的。

# junit

如果你使用 junit，可以直接结合 [junitperf](github.com/houbb/junitperf) 进行编写。

# 简单的 main() 

如果你直接想测试验证下，那也不是不行。

此处直接给出一个测试验证的代码模板。

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.Charset;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 执行步骤：
 *
 * http://127.0.0.1:8081/xxx/perform/start?max=1&increase=1&interval=10000
 */
@RestController
@RequestMapping("/perform")
public class PerformanceController {

    private static Logger logger = LoggerFactory.getLogger(PerformanceController.class);

    static int successCount   = 0;
    static int failedCount    = 0;
    static int numberOfThread = 0;
    static MonitorThread monitorThread;
    static QueryThread[] workThreads;

    static int MAX_THREAD               = 10;
    static int INCREASEMENT             = 1;
    static int INCREASE_INTERVAL_MILLIS = 10000;

    ArrayList<HashMap<String, String>> arrlt = new ArrayList<HashMap<String, String>>();

    @RequestMapping("/start")
    public String start(int max, int increase, int interval) {
        // 基础信息初始化
        MAX_THREAD = max;
        INCREASEMENT = increase;
        INCREASE_INTERVAL_MILLIS = interval;
        numberOfThread = 0;
        failedCount = 0;
        successCount = 0;

       
        // 启动 monitor 线程
        monitorThread = new MonitorThread();
        monitorThread.start();

        workThreads = new QueryThread[MAX_THREAD];
        for (int i = 0; i < workThreads.length; i++) {
            workThreads[i] = new QueryThread();
            workThreads[i].pause();
            workThreads[i].start();
        }

        while (numberOfThread < MAX_THREAD) {
            int maxIndex = numberOfThread + INCREASEMENT;
            for (int i = numberOfThread; i < maxIndex && i < workThreads.length; i++) {
                workThreads[i].resumeRun();
                numberOfThread++;
            }
            try {
                TimeUnit.MILLISECONDS.sleep(INCREASE_INTERVAL_MILLIS);
            } catch (InterruptedException e) {
            }
        }

        return "finished";
    }

    @RequestMapping("/stop")
    public String stop() {
        for (int i = 0; i < workThreads.length; i++) {
            workThreads[i].interrupt();
        }
        for (int i = 0; i < workThreads.length; i++) {
            try {
                workThreads[i].join();
            } catch (InterruptedException e) {
            }
        }
        monitorThread.interrupt();
        try {
            monitorThread.join();
        } catch (InterruptedException e) {
        }
        return "stopped";
    }

    class MonitorThread extends Thread {

        int lastSuccessCount = 0;
        int lastFailedCount  = 0;

        @Override
        public void run() {
            while (!Thread.currentThread().isInterrupted()) {
                logger.info("Threads: " + numberOfThread + ", Success: " + successCount + ", Failed: " + failedCount + ", NewSuccess: " + (successCount - lastSuccessCount) + ", NewFailed: " + (failedCount - lastFailedCount));
                DecimalFormat rt=new DecimalFormat("0.00");
                if ((successCount - lastSuccessCount) > 0) {
                    logger.info("(每秒处理事务数)TPS:" + (successCount - lastSuccessCount) + ", 平均响应时间(RT):" + rt.format((float)1000/(successCount - lastSuccessCount)) +" ms");
                }
                lastSuccessCount = successCount;
                lastFailedCount = failedCount;
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    break;
                }
            }
        }
    }

    class QueryThread extends Thread {

        private boolean runnable = true;

        @Override
        public void run() {
            while (!Thread.currentThread().isInterrupted()) {
                if (runnable) {
                        try {
                            //TODO: 执行测试验证代码
                            if (success()) { //校验应答
                                successCount++;
                            } else {
                                failedCount++;
                            }
                            TimeUnit.SECONDS.sleep(1);
                        } catch (Exception e) {
                            failedCount++;
                            logger.error(e.getMessage());
                        }
                } else {
                    try {
                        TimeUnit.SECONDS.sleep(1);
                    } catch (InterruptedException e) {
                        break;
                    }
                }
            }
        }

        public void pause() {
            this.runnable = false;
        }

        public void resumeRun() {
            this.runnable = true;
        }
    }

}
```

* any list
{:toc}