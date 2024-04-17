---
layout: post
title: java 键盘鼠标操作-04-findImage 寻找图片
date: 2024-03-27 21:01:55 +0800
categories: [Java]
tags: [java, robot, sh]
published: false
---

# 需求

寻找图。



# chat

## Q:java 如何实现在当前指定范围的屏幕中，找到最接近的图的位置？

 在Java中实现在当前指定范围的屏幕中找到最接近的图的位置，可以通过以下步骤来完成：

1. **屏幕截图**：首先，需要获取指定屏幕范围的截图。这可以通过创建一个`Robot`对象并使用`createScreenCapture`方法来实现。

   ```java
   import java.awt.Robot;
   import java.awt.Toolkit;
   import java.awt.image.BufferedImage;
   import java.io.File;
   import javax.imageio.ImageIO;

   public BufferedImage captureScreen(int x, int y, int width, int height) throws AWTException {
       Robot robot = new Robot();
       Rectangle screenRect = new Rectangle(x, y, width, height);
       BufferedImage screenImg = robot.createScreenCapture(screenRect);
       return screenImg;
   }
   ```

2. **目标图片加载**：加载你想要在屏幕截图中查找的目标图片。

   ```java
   BufferedImage searchImg = ImageIO.read(new File("path_to_your_search_image.png"));
   ```

3. **图片搜索算法**：实现一个图片搜索算法，该算法会在屏幕截图中遍历每一个可能的位置，并与目标图片进行比较。这通常通过比较两张图片对应像素点的RGB值来完成。

   ```java
   public static List<Point> findImages(BufferedImage screen, BufferedImage searchImg) {
       List<Point> points = new ArrayList<>();
       int screenWidth = screen.getWidth();
       int screenHeight = screen.getHeight();
       int searchWidth = searchImg.getWidth();
       int searchHeight = searchImg.getHeight();

       for (int y = 0; y <= (screenHeight - searchHeight); y++) {
           for (int x = 0; x <= (screenWidth - searchWidth); x++) {
               if (isMatch(screen, searchImg, x, y)) {
                   points.add(new Point(x, y));
               }
           }
       }
       return points;
   }

   private static boolean isMatch(BufferedImage screen, BufferedImage searchImg, int x, int y) {
       for (int i = 0; i < searchHeight; i++) {
           for (int j = 0; j < searchWidth; j++) {
               if (screen.getRGB(x + j, y + i) != searchImg.getRGB(j, i)) {
                   return false;
               }
           }
       }
       return true;
   }
   ```

4. **坐标输出**：最后，输出找到的目标图片在屏幕截图中的位置坐标。

   ```java
   for (Point point : points) {
       System.out.println("找到图片的位置: (" + point.x + ", " + point.y + ")");
   }
   ```

这个基本的算法会逐像素比较屏幕截图和目标图片，这是一个非常精确的搜索方法。但请注意，这种方法可能会很慢，特别是当屏幕截图很大或目标图片很大时。为了提高效率，可以考虑使用更高级的图像处理库，如OpenCV，或者使用一些优化的搜索算法，比如模板匹配等。

此外，还可以考虑使用一些现成的Java库，如`ImageCognitionUtil`等，这些库可能已经实现了一些优化的搜索算法，可以简化开发过程。

请注意，上述代码只是一个简单的示例，实际应用中可能需要根据具体情况进行调整和优化。

## Q: 给出 opencv 的 maven 依赖，和对应的例子

要在Java项目中使用OpenCV，您需要在项目的`pom.xml`文件中添加OpenCV的Maven依赖。以下是添加依赖的步骤以及一个简单的例子。

### Maven依赖

首先，确保您的`pom.xml`文件中已经添加了OpenCV的Maven仓库。然后，添加所需的OpenCV依赖。以下是添加OpenCV核心模块的示例：

```xml
<dependencies>
    <!-- OpenCV dependency -->
    <dependency>
        <groupId>org.opencv</groupId>
        <artifactId>opencv</artifactId>
        <version>4.6.0</version> <!-- 使用最新版本 -->
    </dependency>
</dependencies>

<repositories>
    <repository>
        <id>opencv</id>
        <url>https://mvn.bintray.com/opencv/</url>
    </repository>
</repositories>
```



### 例子

以下是一个使用OpenCV进行图像处理的简单Java例子。这个例子加载一张图片，然后将其保存为灰度图像。

```java
import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.CvType;
import org.opencv.imgcodecs.Imgcodecs;

public class OpenCVExample {
    static {
        // 加载OpenCV的动态库
        System.loadLibrary(Core.NATIVE_LIBRARY_NAME);
    }

    public static void main(String[] args) {
        // 加载一张图片
        Mat image = Imgcodecs.imread("path_to_image.jpg"); // 替换为您的图片路径
        if (image.empty()) {
            System.out.println("图片加载失败");
            return;
        }

        // 转换为灰度图像
        Mat grayImage = new Mat();
        Imgproc.cvtColor(image, grayImage, Imgproc.COLOR_BGR2GRAY);

        // 保存灰度图像
        Imgcodecs.imwrite("gray_image.jpg", grayImage); // 保存路径
        System.out.println("灰度图像保存成功");
    }
}
```



请注意，您需要将`"path_to_image.jpg"`替换为您要处理的图片的实际路径，并且确保`OpenCVExample`类中的`System.loadLibrary(Core.NATIVE_LIBRARY_NAME);`调用与您的OpenCV库的实际安装位置相匹配。

在运行此代码之前，请确保您的开发环境已经正确配置了Java环境和Maven工具，并且已经按照上述步骤安装了OpenCV的Maven依赖。

# 参考资料

https://imagej.net/develop/native-libraries

http://java.sun.com/docs/books/jni/html/jniTOC.html

* any list
{:toc}
