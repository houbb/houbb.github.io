/**
 * 子类  Plane 飞机类
 * @param opts
 * @constructor
 */
var Plane = function (opts) {
    var opts = opts || {};
    //调用父类方法
    Element.call(this, opts);
    //特有属性
    this.status = 'normal';
    this.icon = opts.icon;
    //子弹相关
    this.bullets = [];
    this.bulletSize = opts.bulletSize;
    this.bulletSpeed = opts.bulletSpeed;
    this.bulletIcon = opts.bulletIcon;
    this.boomIcon = opts.boomIcon;
    this.boomCount = 0;
};

//继承Element的方法
Plane.prototype = new Element();

/**
 * 判断是否撞到当前元素
 * @param target 目标元素实例
 * @returns {boolean}
 */
Plane.prototype.hasCrash = function (target) {
    var crash = false;
    //判断四边是否都没有空隙
    if (!(this.x + this.width < target.x) &&
        !(target.x + target.width < this.x) &&
        !(this.y + this.height < target.y) &&
        !(target.y + target.height < this.y)) {
        crash = true;
    }
    return crash;
};
/**
 * 判断是否击中当前元素
 * @param target 目标元素对象
 * @returns {boolean}
 */
Plane.prototype.hasHit = function (target) {
    var bullets = this.bullets;
    var hasHit = false;
    for (var j = bullets.length - 1; j >= 0; j--) {
        //如果子弹击中的是对象的范围，则销毁子弹
        if (bullets[j].hasCrash(target)) {
            //清除子弹实例
            this.bullets.splice(j, 1);
            hasHit = true;
            break;
        }
    }
    return hasHit;
};

/**
 * 修改飞机当前位置
 * @param newPlaneX
 * @param newPlaneY
 */
Plane.prototype.setPosition = function (newPlaneX, newPlaneY) {
    this.x = newPlaneX;
    this.y = newPlaneY;
    return this;
};

/**
 * 方法： startShoot
 */
Plane.prototype.startShoot = function () {
    var self = this;
    var bulletWidth = this.bulletSize.width;
    var bulletHeight = this.bulletSize.height;
    //定时发射子弹
    this.shootingInterval = setInterval(function () {
        //创建子弹，子弹位置是居中射出
        var bulletX = self.x + self.width / 2 - bulletWidth / 2;
        var bulletY = self.y - bulletHeight;
        //创建子弹
        self.bullets.push(new Bullet({
            x: bulletX,
            y: bulletY,
            width: bulletWidth,
            height: bulletHeight,
            speed: self.bulletSpeed,
            icon: self.bulletIcon
        }));
    }, 200);
};

//绘制子弹
Plane.prototype.drawBullets = function () {
    var bullets = this.bullets;
    var i = bullets.length;
    while (i--) {
        var bullet = bullets[i];
        //更新子弹的位置
        bullet.fly(); //更新和绘制耦合在一起了
        //如果子弹对象超出边界，则删除
        if (bullet.y <= 0) {
            //如果子弹实例下降到底部，则需要在drops数组中清除该子弹实例对象
            bullets.splice(i, 1);
        } else {
            //未超出的则绘制子弹
            bullet.draw();
        }
    }
};

//绘制飞机
Plane.prototype.draw = function () {
    switch (this.status) {
        case 'booming':
            context.drawImage(this.boomIcon, this.x, this.y, this.width, this.height);
            break;
        default:
            context.drawImage(this.icon, this.x, this.y, this.width, this.height);
            break;
    }
    //绘制子弹
    this.drawBullets();
    return this;
};
/**
 * 战机爆炸中
 * @returns {Plane}
 */
Plane.prototype.booming = function () {
    this.status = 'booming';
    this.boomCount += 1;
    if (this.boomCount > 10) {
        this.status = 'boomed';
        clearInterval(this.shootingInterval);
    }
    return this;
};
