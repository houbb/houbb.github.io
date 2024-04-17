---
layout: post
title: java 键盘鼠标操作-05-javacv
date: 2024-03-27 21:01:55 +0800
categories: [Java]
tags: [java, robot, sh]
published: false
---


# 导入

## maven

```xml
  <dependency>
    <groupId>org.bytedeco</groupId>
    <artifactId>javacv-platform</artifactId>
    <version>1.5.10</version>
  </dependency>
```

## 其他

常见情况的更具体说明：

NetBeans（Java SE 7或更新版本）：

1. 在项目窗口中，右键单击项目的库节点，选择“添加JAR/文件夹...”。
2. 定位JAR文件，选择它们，然后单击确定。

Eclipse（Java SE 7或更新版本）：

1. 导航到项目>属性>Java构建路径>库，然后单击“添加外部JAR...”。
2. 定位JAR文件，选择它们，然后单击确定。

Visual Studio Code（Java SE 7或更新版本）：

1. 导航到Java项目>引用库，然后单击`+`。
2. 定位JAR文件，选择它们，然后单击确定。

IntelliJ IDEA（Android 7.0或更新版本）：

1. 按照此页面上的说明操作：http://developer.android.com/training/basics/firstapp/
2. 将所有JAR文件复制到`app/libs`子目录中。
3. 导航到文件>项目结构>app>依赖项，单击`+`，然后选择“2文件依赖项”。
4. 从`libs`子目录中选择所有JAR文件。

之后，例如OpenCV和FFmpeg的包装类可以自动访问它们所有的C/C++ API：

* [OpenCV文档](http://docs.opencv.org/master/)
* [FFmpeg文档](http://ffmpeg.org/doxygen/trunk/)

# 示例用法
类定义基本上是将原始的C/C++头文件移植到Java中，我有意决定尽可能保留原始的语法。

例如，这是一个尝试加载图像文件、平滑它并将其保存回磁盘的方法：

```java
import org.bytedeco.opencv.opencv_core.*;
import org.bytedeco.opencv.opencv_imgproc.*;
import static org.bytedeco.opencv.global.opencv_core.*;
import static org.bytedeco.opencv.global.opencv_imgproc.*;
import static org.bytedeco.opencv.global.opencv_imgcodecs.*;

public class Smoother {
    public static void smooth(String filename) {
        Mat image = imread(filename);
        if (image != null) {
            GaussianBlur(image, image, new Size(3, 3), 0);
            imwrite(filename, image);
        }
    }
}
```

JavaCV还提供了辅助类和方法，位于OpenCV和FFmpeg之上，以促进它们与Java平台的集成。这是一个小型演示程序，展示了最常用的部分：

```java
import java.io.File;
import java.net.URL;
import org.bytedeco.javacv.*;
import org.bytedeco.javacpp.*;
import org.bytedeco.javacpp.indexer.*;
import org.bytedeco.opencv.opencv_core.*;
import org.bytedeco.opencv.opencv_imgproc.*;
import org.bytedeco.opencv.opencv_calib3d.*;
import org.bytedeco.opencv.opencv_objdetect.*;
import static org.bytedeco.opencv.global.opencv_core.*;
import static org.bytedeco.opencv.global.opencv_imgproc.*;
import static org.bytedeco.opencv.global.opencv_calib3d.*;
import static org.bytedeco.opencv.global.opencv_objdetect.*;

public class Demo {
    public static void main(String[] args) throws Exception {
        String classifierName = null;
        if (args.length > 0) {
            classifierName = args[0];
        } else {
            URL url = new URL("https://raw.github.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_alt.xml");
            File file = Loader.cacheResource(url);
            classifierName = file.getAbsolutePath();
        }

        // We can "cast" Pointer objects by instantiating a new object of the desired class.
        CascadeClassifier classifier = new CascadeClassifier(classifierName);
        if (classifier == null) {
            System.err.println("Error loading classifier file \"" + classifierName + "\".");
            System.exit(1);
        }

        // The available FrameGrabber classes include OpenCVFrameGrabber (opencv_videoio),
        // DC1394FrameGrabber, FlyCapture2FrameGrabber, OpenKinectFrameGrabber, OpenKinect2FrameGrabber,
        // RealSenseFrameGrabber, RealSense2FrameGrabber, PS3EyeFrameGrabber, VideoInputFrameGrabber, and FFmpegFrameGrabber.
        FrameGrabber grabber = FrameGrabber.createDefault(0);
        grabber.start();

        // CanvasFrame, FrameGrabber, and FrameRecorder use Frame objects to communicate image data.
        // We need a FrameConverter to interface with other APIs (Android, Java 2D, JavaFX, Tesseract, OpenCV, etc).
        OpenCVFrameConverter.ToMat converter = new OpenCVFrameConverter.ToMat();

        // FAQ about IplImage and Mat objects from OpenCV:
        // - For custom raw processing of data, createBuffer() returns an NIO direct
        //   buffer wrapped around the memory pointed by imageData, and under Android we can
        //   also use that Buffer with Bitmap.copyPixelsFromBuffer() and copyPixelsToBuffer().
        // - To get a BufferedImage from an IplImage, or vice versa, we can chain calls to
        //   Java2DFrameConverter and OpenCVFrameConverter, one after the other.
        // - Java2DFrameConverter also has static copy() methods that we can use to transfer
        //   data more directly between BufferedImage and IplImage or Mat via Frame objects.
        Mat grabbedImage = converter.convert(grabber.grab());
        int height = grabbedImage.rows();
        int width = grabbedImage.cols();

        // Objects allocated with `new`, clone(), or a create*() factory method are automatically released
        // by the garbage collector, but may still be explicitly released by calling deallocate().
        // You shall NOT call cvReleaseImage(), cvReleaseMemStorage(), etc. on objects allocated this way.
        Mat grayImage = new Mat(height, width, CV_8UC1);
        Mat rotatedImage = grabbedImage.clone();

        // The OpenCVFrameRecorder class simply uses the VideoWriter of opencv_videoio,
        // but FFmpegFrameRecorder also exists as a more versatile alternative.
        FrameRecorder recorder = FrameRecorder.createDefault("output.avi", width, height);
        recorder.start();

        // CanvasFrame is a JFrame containing a Canvas component, which is hardware accelerated.
        // It can also switch into full-screen mode when called with a screenNumber.
        // We should also specify the relative monitor/camera response for proper gamma correction.
        CanvasFrame frame = new CanvasFrame("Some Title", CanvasFrame.getDefaultGamma()/grabber.getGamma());

        // Let's create some random 3D rotation...
        Mat randomR    = new Mat(3, 3, CV_64FC1),
            randomAxis = new Mat(3, 1, CV_64FC1);
        // We can easily and efficiently access the elements of matrices and images
        // through an Indexer object with the set of get() and put() methods.
        DoubleIndexer Ridx = randomR.createIndexer(),
                   axisIdx = randomAxis.createIndexer();
        axisIdx.put(0, (Math.random() - 0.5) / 4,
                       (Math.random() - 0.5) / 4,
                       (Math.random() - 0.5) / 4);
        Rodrigues(randomAxis, randomR);
        double f = (width + height) / 2.0;  Ridx.put(0, 2, Ridx.get(0, 2) * f);
                                            Ridx.put(1, 2, Ridx.get(1, 2) * f);
        Ridx.put(2, 0, Ridx.get(2, 0) / f); Ridx.put(2, 1, Ridx.get(2, 1) / f);
        System.out.println(Ridx);

        // We can allocate native arrays using constructors taking an integer as argument.
        Point hatPoints = new Point(3);

        while (frame.isVisible() && (grabbedImage = converter.convert(grabber.grab())) != null) {
            // Let's try to detect some faces! but we need a grayscale image...
            cvtColor(grabbedImage, grayImage, CV_BGR2GRAY);
            RectVector faces = new RectVector();
            classifier.detectMultiScale(grayImage, faces);
            long total = faces.size();
            for (long i = 0; i < total; i++) {
                Rect r = faces.get(i);
                int x = r.x(), y = r.y(), w = r.width(), h = r.height();
                rectangle(grabbedImage, new Point(x, y), new Point(x + w, y + h), Scalar.RED, 1, CV_AA, 0);

                // To access or pass as argument the elements of a native array, call position() before.
                hatPoints.position(0).x(x - w / 10     ).y(y - h / 10);
                hatPoints.position(1).x(x + w * 11 / 10).y(y - h / 10);
                hatPoints.position(2).x(x + w / 2      ).y(y - h / 2 );
                fillConvexPoly(grabbedImage, hatPoints.position(0), 3, Scalar.GREEN, CV_AA, 0);
            }

            // Let's find some contours! but first some thresholding...
            threshold(grayImage, grayImage, 64, 255, CV_THRESH_BINARY);

            // To check if an output argument is null we may call either isNull() or equals(null).
            MatVector contours = new MatVector();
            findContours(grayImage, contours, CV_RETR_LIST, CV_CHAIN_APPROX_SIMPLE);
            long n = contours.size();
            for (long i = 0; i < n; i++) {
                Mat contour = contours.get(i);
                Mat points = new Mat();
                approxPolyDP(contour, points, arcLength(contour, true) * 0.02, true);
                drawContours(grabbedImage, new MatVector(points), -1, Scalar.BLUE);
            }

            warpPerspective(grabbedImage, rotatedImage, randomR, rotatedImage.size());

            Frame rotatedFrame = converter.convert(rotatedImage);
            frame.showImage(rotatedFrame);
            recorder.record(rotatedFrame);
        }
        frame.dispose();
        recorder.stop();
        grabber.stop();
    }
}
```

Furthermore, after creating a pom.xml file with the following content:

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>org.bytedeco.javacv</groupId>
    <artifactId>demo</artifactId>
    <version>1.5.10</version>
    <properties>
        <maven.compiler.source>1.7</maven.compiler.source>
        <maven.compiler.target>1.7</maven.compiler.target>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.bytedeco</groupId>
            <artifactId>javacv-platform</artifactId>
            <version>1.5.10</version>
        </dependency>

        <!-- Additional dependencies required to use CUDA and cuDNN -->
        <dependency>
            <groupId>org.bytedeco</groupId>
            <artifactId>opencv-platform-gpu</artifactId>
            <version>4.9.0-1.5.10</version>
        </dependency>

        <!-- Optional GPL builds with (almost) everything enabled -->
        <dependency>
            <groupId>org.bytedeco</groupId>
            <artifactId>ffmpeg-platform-gpl</artifactId>
            <version>6.1.1-1.5.10</version>
        </dependency>
    </dependencies>
    <build>
        <sourceDirectory>.</sourceDirectory>
    </build>
</project>
```

# 参考资料

https://imagej.net/develop/native-libraries

http://java.sun.com/docs/books/jni/html/jniTOC.html

* any list
{:toc}
