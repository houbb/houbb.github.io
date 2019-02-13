---
layout: post
title: 如何优雅的给图片添加水印
date:  2019-2-13 09:11:35 +0800
categories: [Tool]
tags: [tool, math, sh]
published: true
excerpt: 如何优雅的给图片添加水印
---

# 水印的类型

我们见过很多图片，都是有明水印的。一般在图片的右下角，或者图片的中间倾斜的印上某些信息，人眼可以看到。

还有一些水印对图片本身不产生影响，肉眼无法识别，可以通过特定解码，解析出来，我们称之为盲水印。

# 添加盲水印的方法

添加数字盲水印的方法简单可分为空域方法和频域方法，这两种方法添加了冗余信息，但在编码和压缩情况不变的情况下，不会使原始图像大小产生变化（原来是10MB添加盲水印之后还是10MB）。空域是指空间域，我们日常所见的图像就是空域。空域添加数字水印的方法是在空间域直接对图像操作（之所以说的这么绕，是因为不仅仅原图是空域，原图的差分等等也是空域），比如将水印直接叠加在图像上。我们常说一个音有多高，这个音高是指频率；同样，图像灰度变化强烈的情况，也可以视为图像的频率。频域添加数字水印的方法，是指通过某种变换手段（傅里叶变换，离散余弦变换，小波变换等）将图像变换到频域（小波域），在频域对图像添加水印，再通过逆变换，将图像转换为空间域。相对于空域手段，频域手段隐匿性更强，抗攻击性更高。所谓对水印的攻击，是指破坏水印，包括涂抹，剪切，放缩，旋转，压缩，加噪，滤波等。数字盲水印不仅仅要敏捷性高（不被人抓到），也要防御性强（抗打）。就像Dota的敏捷英雄往往是脆皮，数字盲水印的隐匿性和鲁棒性是互斥的。（鲁棒性是抗攻击性的学术名字）

## 失效的情况

原文中有测试，直接二次拍摄，就会失效。

二值化也不行。

## 二、频域制作数字盲水印的方法

信号是有频率的，一个信号可以看做是无数个不同阶的正弦信号的的叠加。上式为傅里叶变换公式，是指时域信号（对于信号我们说时域，因为是与时间有关的，而图像我们往往说空域，与空间有关），是指频率。想要对傅里叶变换有深入了解的同学，建议看一下《信号与系统》或者《数字信号处理》的教材，里面系统介绍了傅里叶变换、快速傅里叶变换、拉普拉斯变换、z变换等。简而言之，我们有方法将时域信号转换成为频域，同样，我们也能将二维信号（图像）转换为频域。在上文中提到，图像的频率是指图像灰度变换的强烈情况。关于此方面更系统的知识，参见冈萨雷斯的《图像处理》。下面以傅里叶变换为例，介绍通过频域给图像添加数字盲水印的方法。注意，因为图像是离散信号，我们实际用的是离散傅里叶变换，在本文采用的都是二维快速傅里叶变换，快速傅里叶变换与离散时间傅里叶变换等价，通过蝶型归并的手段，速度更快。下文中傅里叶变换均为二维快速傅里叶变换。

# python 源码

```py
%%傅里叶变换加水印源代码
%% 运行环境Matlab2010a 
clc;clear;close all;
alpha = 1;

%% read data
im = double(imread('gl1.jpg'))/255;
mark = double(imread('watermark.jpg'))/255;
figure, imshow(im),title('original image');
figure, imshow(mark),title('watermark');

%% encode mark
imsize = size(im);
%random
TH=zeros(imsize(1)*0.5,imsize(2),imsize(3));
TH1 = TH;
TH1(1:size(mark,1),1:size(mark,2),:) = mark;
M=randperm(0.5*imsize(1));
N=randperm(imsize(2));
save('encode.mat','M','N');
for i=1:imsize(1)*0.5
    for j=1:imsize(2)
        TH(i,j,:)=TH1(M(i),N(j),:);
    end
end
% symmetric
mark_ = zeros(imsize(1),imsize(2),imsize(3));
mark_(1:imsize(1)*0.5,1:imsize(2),:)=TH;
for i=1:imsize(1)*0.5
    for j=1:imsize(2)
        mark_(imsize(1)+1-i,imsize(2)+1-j,:)=TH(i,j,:);
    end
end
figure,imshow(mark_),title('encoded watermark');
%imwrite(mark_,'encoded watermark.jpg');

%% add watermark
FA=fft2(im);
figure,imshow(FA);title('spectrum of original image');
FB=FA+alpha*double(mark_);
figure,imshow(FB); title('spectrum of watermarked image');
FAO=ifft2(FB);
figure,imshow(FAO); title('watermarked image');
%imwrite(uint8(FAO),'watermarked image.jpg');
RI = FAO-double(im);
figure,imshow(uint8(RI)); title('residual');
%imwrite(uint8(RI),'residual.jpg');
xl = 1:imsize(2);
yl = 1:imsize(1);
[xx,yy] = meshgrid(xl,yl);
figure, plot3(xx,yy,FA(:,:,1).^2+FA(:,:,2).^2+FA(:,:,3).^2),title('spectrum of original image');
figure, plot3(xx,yy,FB(:,:,1).^2+FB(:,:,2).^2+FB(:,:,3).^2),title('spectrum of watermarked image');
figure, plot3(xx,yy,FB(:,:,1).^2+FB(:,:,2).^2+FB(:,:,3).^2-FA(:,:,1).^2+FA(:,:,2).^2+FA(:,:,3).^2),title('spectrum of watermark');

%% extract watermark
FA2=fft2(FAO);
G=(FA2-FA)/alpha;
GG=G;
for i=1:imsize(1)*0.5
    for j=1:imsize(2)
        GG(M(i),N(j),:)=G(i,j,:);
    end
end
for i=1:imsize(1)*0.5
    for j=1:imsize(2)
        GG(imsize(1)+1-i,imsize(2)+1-j,:)=GG(i,j,:);
    end
end
figure,imshow(GG);title('extracted watermark');
%imwrite(uint8(GG),'extracted watermark.jpg');

%% MSE and PSNR
C=double(im);
RC=double(FAO);
MSE=0; PSNR=0;
for i=1:imsize(1)
    for j=1:imsize(2)
        MSE=MSE+(C(i,j)-RC(i,j)).^2;
    end
end
MSE=MSE/360.^2;
PSNR=20*log10(255/sqrt(MSE));
MSE
PSNR

%% attack test
%% attack by smearing
%A = double(imread('gl1.jpg'));
%B = double(imread('attacked image.jpg'));
attack = 1-double(imread('attack.jpg'))/255;
figure,imshow(attack);
FAO_ = FAO;
for i=1:imsize(1)
    for j=1:imsize(2)
        if attack(i,j,1)+attack(i,j,2)+attack(i,j,3)>0.5
            FAO_(i,j,:) = attack(i,j,:);
        end
    end
end
figure,imshow(FAO_);
%extract watermark
FA2=fft2(FAO_);
G=(FA2-FA)*2;
GG=G;
for i=1:imsize(1)*0.5
    for j=1:imsize(2)
        GG(M(i),N(j),:)=G(i,j,:);
    end
end
for i=1:imsize(1)*0.5
    for j=1:imsize(2)
        GG(imsize(1)+1-i,imsize(2)+1-j,:)=GG(i,j,:);
    end
end
figure,imshow(GG);title('extracted watermark');

%% attack by cutting
s2 = 0.8;
FAO_ = FAO;
FAO_(:,s2*imsize(2)+1:imsize(2),:) = FAO_(:,1:int32((1-s2)*imsize(2)),:);
figure,imshow(FAO_);
%extract watermark
FA2=fft2(FAO_);
G=(FA2-FA)*2;
GG=G;
for i=1:imsize(1)*0.5
    for j=1:imsize(2)
        GG(M(i),N(j),:)=G(i,j,:);
    end
end
for i=1:imsize(1)*0.5
    for j=1:imsize(2)
        GG(imsize(1)+1-i,imsize(2)+1-j,:)=GG(i,j,:);
    end
end
figure,imshow(GG);title('extracted watermark');


%%小波变换加水印，解水印大家按照加的思路逆过来就好
clc;clear;close all;
%% read data
im = double(imread('gl1.jpg'))/255;
mark = double(imread('watermark.jpg'))/255;
figure, imshow(im),title('original image');
figure, imshow(mark),title('watermark');
%% RGB division
im=double(im); 
mark=double(mark); 
imr=im(:,:,1); 
markr=mark(:,:,1); 
img=im(:,:,2); 
markg=mark(:,:,2); 
imb=im(:,:,3); 
markb=mark(:,:,3); 
%% parameter
r=0.04; 
g = 0.04; 
b = 0.04;
%% wavelet tranform and add watermark
% for red
[Cwr,Swr]=wavedec2(markr,1,'haar'); 
[Cr,Sr]=wavedec2(imr,2,'haar'); 
% add watermark
Cr(1:size(Cwr,2)/16)=... 
Cr(1:size(Cwr,2)/16)+r*Cwr(1:size(Cwr,2)/16); 
k=0; 
while k<=size(Cr,2)/size(Cwr,2)-1 
Cr(1+size(Cr,2)/4+k*size(Cwr,2)/4:size(Cr,2)/4+... 
(k+1)*size(Cwr,2)/4)=Cr(1+size(Cr,2)/4+... 
k*size(Cwr,2)/4:size(Cr,2)/4+(k+1)*size(Cwr,2)/4)+... 
r*Cwr(1+size(Cwr,2)/4:size(Cwr,2)/2); 
Cr(1+size(Cr,2)/2+k*size(Cwr,2)/4:size(Cr,2)/2+... 
(k+1)*size(Cwr,2)/4)=Cr(1+size(Cr,2)/2+... 
k*size(Cwr,2)/4:size(Cr,2)/2+(k+1)*size(Cwr,2)/4)+... 
r*Cwr(1+size(Cwr,2)/2:3*size(Cwr,2)/4); 
Cr(1+3*size(Cwr,2)/4+k*size(Cwr,2)/4:3*size(Cwr,2)/4+... 
(k+1)*size(Cwr,2)/4)=Cr(1+3*size(Cr,2)/4+... 
k*size(Cwr,2)/4:3*size(Cr,2)/4+(k+1)*size(Cwr,2)/4)+... 
r*Cwr(1+3*size(Cwr,2)/4:size(Cwr,2)); 
k=k+1; 
end; 
Cr(1:size(Cwr,2)/4)=Cr(1:size(Cwr,2)/4)+r*Cwr(1:size(Cwr,2)/4); 

% for green
[Cwg,Swg]=WAVEDEC2(markg,1,'haar'); 
[Cg,Sg]=WAVEDEC2(img,2,'haar'); 
Cg(1:size(Cwg,2)/16)=... 
Cg(1:size(Cwg,2)/16)+g*Cwg(1:size(Cwg,2)/16); 
k=0; 
while k<=size(Cg,2)/size(Cwg,2)-1 
Cg(1+size(Cg,2)/4+k*size(Cwg,2)/4:size(Cg,2)/4+... 
(k+1)*size(Cwg,2)/4)=Cg(1+size(Cg,2)/4+... 
k*size(Cwg,2)/4:size(Cg,2)/4+(k+1)*size(Cwg,2)/4)+... 
g*Cwg(1+size(Cwg,2)/4:size(Cwg,2)/2); 
Cg(1+size(Cg,2)/2+k*size(Cwg,2)/4:size(Cg,2)/2+... 
(k+1)*size(Cwg,2)/4)=Cg(1+size(Cg,2)/2+... 
k*size(Cwg,2)/4:size(Cg,2)/2+(k+1)*size(Cwg,2)/4)+... 
g*Cwg(1+size(Cwg,2)/2:3*size(Cwg,2)/4); 
Cg(1+3*size(Cg,2)/4+k*size(Cwg,2)/4:3*size(Cg,2)/4+... 
(k+1)*size(Cwg,2)/4)=Cg(1+3*size(Cg,2)/4+... 
k*size(Cwg,2)/4:3*size(Cg,2)/4+(k+1)*size(Cwg,2)/4)+... 
g*Cwg(1+3*size(Cwg,2)/4:size(Cwg,2)); 
k=k+1; 
end; 
Cg(1:size(Cwg,2)/4)=Cg(1:size(Cwg,2)/4)+g*Cwg(1:size(Cwg,2)/4); 

% for blue
[Cwb,Swb]=WAVEDEC2(markb,1,'haar'); 
[Cb,Sb]=WAVEDEC2(imb,2,'haar'); 
Cb(1:size(Cwb,2)/16)+b*Cwb(1:size(Cwb,2)/16); 
k=0; 
while k<=size(Cb,2)/size(Cwb,2)-1 
Cb(1+size(Cb,2)/4+k*size(Cwb,2)/4:size(Cb,2)/4+... 
(k+1)*size(Cwb,2)/4)=Cb(1+size(Cb,2)/4+... 
k*size(Cwb,2)/4:size(Cb,2)/4+(k+1)*size(Cwb,2)/4)+... 
g*Cwb(1+size(Cwb,2)/4:size(Cwb,2)/2); 
Cb(1+size(Cb,2)/2+k*size(Cwb,2)/4:size(Cb,2)/2+... 
(k+1)*size(Cwb,2)/4)=Cb(1+size(Cb,2)/2+... 
k*size(Cwb,2)/4:size(Cb,2)/2+(k+1)*size(Cwb,2)/4)+... 
b*Cwb(1+size(Cwb,2)/2:3*size(Cwb,2)/4); 
Cb(1+3*size(Cb,2)/4+k*size(Cwb,2)/4:3*size(Cb,2)/4+... 
(k+1)*size(Cwb,2)/4)=Cb(1+3*size(Cb,2)/4+... 
k*size(Cwb,2)/4:3*size(Cb,2)/4+(k+1)*size(Cwb,2)/4)+... 
b*Cwb(1+3*size(Cwb,2)/4:size(Cwb,2)); 
k=k+1; 
end; 
Cb(1:size(Cwb,2)/4)=Cb(1:size(Cwb,2)/4)+b*Cwb(1:size(Cwb,2)/4); 
%% image reconstruction
imr=WAVEREC2(Cr,Sr,'haar'); 
img=WAVEREC2(Cg,Sg,'haar'); 
imb=WAVEREC2(Cb,Sb,'haar'); 
imsize=size(imr); 
FAO=zeros(imsize(1),imsize(2),3); 
for i=1:imsize(1); 
for j=1:imsize(2); 
FAO(i,j,1)=imr(i,j); 
FAO(i,j,2)=img(i,j); 
FAO(i,j,3)=imb(i,j); 
end 
end 
figure, imshow(FAO); title('watermarked image');
```

# 参考资料 

[阿里巴巴公司根据截图查到泄露信息的具体员工的技术是什么？](https://www.zhihu.com/question/50735753/answer/122593277?utm_source=wechat_session&utm_medium=social&utm_oi=649738537033928704&from=message&isappinstalled=0)

[https://www.zhihu.com/question/50735753/answer/122593277](https://www.zhihu.com/question/50735753/answer/122593277)

* any list
{:toc}